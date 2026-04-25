"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminSupabase } from "@/lib/supabase";
import {
  normalizeBusinessHours,
  WEEKDAY_KEYS,
  type BusinessHours,
} from "@/lib/scheduling";
import type { UserBranch } from "@/lib/user-branches";

type UserBranchesState = {
  message: string;
  success: boolean;
};

type BranchPayload = {
  id?: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  is_active: boolean;
  business_hours: BusinessHours;
};

function formatState(message: string, success: boolean): UserBranchesState {
  return { message, success };
}

function slugifyCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseBranches(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || !raw.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw) as UserBranch[];
  } catch {
    return null;
  }
}

function normalizeBranchHours(value: unknown) {
  const normalized = normalizeBusinessHours(value);

  return WEEKDAY_KEYS.reduce<BusinessHours>((acc, key) => {
    acc[key] = normalized[key];
    return acc;
  }, {} as BusinessHours);
}

export async function saveUserBranches(
  _prevState: UserBranchesState | void,
  formData: FormData
) {
  const user = await requireAdmin();
  const parsedBranches = parseBranches(formData.get("branches_json"));

  if (!parsedBranches || parsedBranches.length === 0) {
    return formatState("Tambahkan minimal satu cabang.", false);
  }

  const branches: BranchPayload[] = parsedBranches.map((branch) => ({
    id: typeof branch.id === "string" && branch.id ? branch.id : undefined,
    name: branch.name.trim(),
    code: slugifyCode(branch.code || branch.name),
    address: branch.address.trim(),
    phone: branch.phone.trim(),
    is_active: Boolean(branch.is_active),
    business_hours: normalizeBranchHours(branch.business_hours),
  }));

  if (branches.some((branch) => !branch.name)) {
    return formatState("Setiap cabang wajib punya nama.", false);
  }

  const names = branches.map((branch) => branch.name.toLowerCase());
  if (new Set(names).size !== names.length) {
    return formatState("Nama cabang harus unik dalam bisnis yang sama.", false);
  }

  const codes = branches.map((branch) => branch.code).filter(Boolean);
  if (new Set(codes).size !== codes.length) {
    return formatState("Kode cabang harus unik.", false);
  }

  const supabase = createAdminSupabase();
  const { data: existingRows, error: existingError } = await supabase
    .from("user_branches")
    .select("id")
    .eq("user_id", user.id);

  if (existingError && existingError.code !== "42P01") {
    return formatState(existingError.message, false);
  }

  const existingIds = new Set(((existingRows ?? []) as Array<{ id: string }>).map((item) => item.id));
  const incomingIds = new Set(branches.map((branch) => branch.id).filter(Boolean) as string[]);
  const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("user_branches")
      .delete()
      .eq("user_id", user.id)
      .in("id", idsToDelete);

    if (deleteError) {
      return formatState(deleteError.message, false);
    }
  }

  const payload = branches.map((branch) => ({
    user_id: user.id,
    name: branch.name,
    code: branch.code || null,
    address: branch.address || null,
    phone: branch.phone || null,
    is_active: branch.is_active,
    business_hours: branch.business_hours,
    ...(branch.id ? { id: branch.id } : {}),
  }));

  const existingPayload = payload.filter((branch) => "id" in branch);
  const newPayload = payload.filter((branch) => !("id" in branch));

  if (existingPayload.length > 0) {
    const { error: existingUpsertError } = await supabase
      .from("user_branches")
      .upsert(existingPayload, { onConflict: "id" });

    if (existingUpsertError) {
      return formatState(existingUpsertError.message, false);
    }
  }

  if (newPayload.length > 0) {
    const { error: newInsertError } = await supabase
      .from("user_branches")
      .insert(newPayload);

    if (newInsertError) {
      return formatState(newInsertError.message, false);
    }
  }

  revalidatePath("/admin/settings/branches");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");

  return formatState("Cabang berhasil disimpan.", true);
}
