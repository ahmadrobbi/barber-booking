import { createAdminSupabase } from "@/lib/supabase";

export type UserBlackoutDate = {
  id: string;
  user_id: string;
  branch_id: string | null;
  blackout_date: string;
  title: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

type UserBlackoutDateRow = {
  id: string;
  user_id: string;
  branch_id: string | null;
  blackout_date: string | null;
  title: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

function mapRow(row: UserBlackoutDateRow): UserBlackoutDate {
  return {
    id: row.id,
    user_id: row.user_id,
    branch_id: row.branch_id,
    blackout_date: row.blackout_date ?? "",
    title: row.title,
    is_active: Boolean(row.is_active ?? true),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getBlackoutDatesForScope(params: {
  userId: string | null | undefined;
  branchId?: string | null;
}) {
  if (!params.userId) {
    return [] as UserBlackoutDate[];
  }

  try {
    const supabase = createAdminSupabase();
    let query = supabase
      .from("user_blackout_dates")
      .select("id, user_id, branch_id, blackout_date, title, is_active, created_at, updated_at")
      .eq("user_id", params.userId)
      .eq("is_active", true)
      .order("blackout_date", { ascending: true });

    if (params.branchId) {
      query = query.or(`branch_id.is.null,branch_id.eq.${params.branchId}`);
    } else {
      query = query.is("branch_id", null);
    }

    const { data, error } = await query;

    if (error && error.code !== "42P01") {
      throw new Error(error.message);
    }

    return ((data ?? []) as UserBlackoutDateRow[]).map(mapRow);
  } catch (error) {
    console.warn("Failed to load blackout dates:", error);
    return [] as UserBlackoutDate[];
  }
}

export async function isBlackoutDateForScope(params: {
  userId: string | null | undefined;
  date: string;
  branchId?: string | null;
}) {
  const blackoutDates = await getBlackoutDatesForScope({
    userId: params.userId,
    branchId: params.branchId,
  });

  return blackoutDates.some((item) => item.blackout_date === params.date);
}
