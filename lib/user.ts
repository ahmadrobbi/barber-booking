import { createAdminSupabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export type UserProfile = {
  user_id: string;
  business_name?: string;
  business_description?: string;
  logo_url?: string;
  website_url?: string;
  social_media?: Record<string, string>;
  contact_info?: Record<string, any>;
  business_hours?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
};

export type UserTransaction = {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  description?: string;
  reference_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
};

export type UserLandingPage = {
  user_id: string;
  subdomain?: string;
  custom_domain?: string;
  template: string;
  settings?: Record<string, any>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

// User Profile Functions
export async function getUserProfile(): Promise<UserProfile | null> {
  const session = await getSession();
  if (!session) return null;

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", session.userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
}

export async function createOrUpdateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
  const session = await getSession();
  if (!session) return null;

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert({
      user_id: session.userId,
      ...profile,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error saving user profile:", error);
    return null;
  }

  return data;
}

// User Transaction Functions
export async function getUserTransactions(limit = 50): Promise<UserTransaction[]> {
  const session = await getSession();
  if (!session) return [];

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("user_transactions")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching user transactions:", error);
    return [];
  }

  return data || [];
}

export async function createUserTransaction(transaction: Omit<UserTransaction, "id" | "user_id" | "created_at" | "updated_at">): Promise<UserTransaction | null> {
  const session = await getSession();
  if (!session) return null;

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("user_transactions")
    .insert({
      user_id: session.userId,
      ...transaction,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error creating user transaction:", error);
    return null;
  }

  return data;
}

// User Landing Page Functions
export async function getUserLandingPage(): Promise<UserLandingPage | null> {
  const session = await getSession();
  if (!session) return null;

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("user_landing_pages")
    .select("*")
    .eq("user_id", session.userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching user landing page:", error);
    return null;
  }

  return data;
}

export async function createOrUpdateUserLandingPage(landingPage: Partial<UserLandingPage>): Promise<UserLandingPage | null> {
  const session = await getSession();
  if (!session) return null;

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("user_landing_pages")
    .upsert({
      user_id: session.userId,
      ...landingPage,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error saving user landing page:", error);
    return null;
  }

  return data;
}

// Utility Functions
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("dashboard_users")
    .select("id, name, email, no_hp, role, created_at")
    .eq("id", session.userId)
    .single();

  if (error) {
    console.error("Error fetching current user:", error);
    return null;
  }

  return data;
}

export async function updateCurrentUser(updates: { name?: string; email?: string; no_hp?: string }) {
  const session = await getSession();
  if (!session) return null;

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("dashboard_users")
    .update(updates)
    .eq("id", session.userId)
    .select("id, name, email, no_hp, role, created_at")
    .single();

  if (error) {
    console.error("Error updating current user:", error);
    return null;
  }

  return data;
}