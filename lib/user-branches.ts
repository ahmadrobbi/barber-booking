import { getSession } from "@/lib/auth";
import { createAdminSupabase } from "@/lib/supabase";
import {
  normalizeBusinessHours,
  type BusinessHours,
} from "@/lib/scheduling";

export type UserBranch = {
  id?: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  is_active: boolean;
  business_hours: BusinessHours;
};

type UserBranchRow = {
  id: string;
  name: string | null;
  code: string | null;
  address: string | null;
  phone: string | null;
  is_active: boolean | null;
  business_hours: unknown;
};

function mapUserBranchRows(rows: UserBranchRow[]) {
  return rows.map((branch) => ({
    id: branch.id,
    name: branch.name ?? "",
    code: branch.code ?? "",
    address: branch.address ?? "",
    phone: branch.phone ?? "",
    is_active: Boolean(branch.is_active ?? true),
    business_hours: normalizeBusinessHours(branch.business_hours),
  }));
}

export async function getCurrentUserBranches() {
  const session = await getSession();

  if (!session) {
    return [] as UserBranch[];
  }

  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("user_branches")
      .select("id, name, code, address, phone, is_active, business_hours")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: true });

    if (error && error.code !== "42P01") {
      throw new Error(error.message);
    }

    return mapUserBranchRows((data ?? []) as UserBranchRow[]);
  } catch (error) {
    console.warn("Failed to load current user branches:", error);
    return [] as UserBranch[];
  }
}

export async function getBranchesForUser(
  userId: string | null | undefined,
  options?: { activeOnly?: boolean }
) {
  if (!userId) {
    return [] as UserBranch[];
  }

  try {
    const supabase = createAdminSupabase();
    let query = supabase
      .from("user_branches")
      .select("id, name, code, address, phone, is_active, business_hours")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (options?.activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error && error.code !== "42P01") {
      throw new Error(error.message);
    }

    return mapUserBranchRows((data ?? []) as UserBranchRow[]);
  } catch (error) {
    console.warn("Failed to load branches for user:", error);
    return [] as UserBranch[];
  }
}
