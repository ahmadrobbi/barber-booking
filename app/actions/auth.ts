"use server";

import { redirect } from "next/navigation";
import type { AuthFormState } from "@/lib/auth-form-state";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { createAdminSupabase } from "@/lib/supabase";
import { isOnboardingComplete } from "@/lib/industry-config";

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatAuthError(message: string) {
  return { message };
}

function mapSupabaseAuthError(message: string, code?: string) {
  if (code === "42P01") {
    return "Tabel dashboard_users belum ada di Supabase.";
  }

  if (
    code === "42501" ||
    message.toLowerCase().includes("row-level security policy")
  ) {
    return "Register gagal karena server belum memakai SUPABASE_SERVICE_ROLE_KEY di Vercel.";
  }

  return message;
}

export async function registerUser(
  _prevState: AuthFormState | void,
  formData: FormData
) {
  const name = normalizeText(formData.get("name"));
  const email = normalizeText(formData.get("email")).toLowerCase();
  const password = normalizeText(formData.get("password"));

  if (!name || name.length < 2) {
    return formatAuthError("Nama minimal 2 karakter.");
  }

  if (!validateEmail(email)) {
    return formatAuthError("Format email belum valid.");
  }

  if (!password || password.length < 6) {
    return formatAuthError("Password minimal 6 karakter.");
  }

  try {
    const supabase = createAdminSupabase();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("dashboard_users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return formatAuthError("Email sudah terdaftar. Silakan login.");
    }

    // Hash password
    const { hashPassword } = await import("@/lib/auth");
    const password_hash = await hashPassword(password);

    // Create new user
    const { data, error } = await supabase
      .from("dashboard_users")
      .insert({
        name,
        email,
        password_hash,
        role: "admin",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Register error:", error);
      return formatAuthError(mapSupabaseAuthError(error.message, error.code));
    }

    // Create session and redirect to onboarding
    await createSession(data.id);
    redirect("/onboarding");

  } catch (error) {
    console.error("Register error:", error);
    return formatAuthError("Terjadi kesalahan saat registrasi. Silakan coba lagi.");
  }
}

export async function loginUser(
  _prevState: AuthFormState | void,
  formData: FormData
) {
  const email = normalizeText(formData.get("email")).toLowerCase();
  const password = normalizeText(formData.get("password"));

  if (!validateEmail(email)) {
    return formatAuthError("Format email belum valid.");
  }

  if (!password) {
    return formatAuthError("Password wajib diisi.");
  }

  const supabase = createAdminSupabase();

  const { data: user, error: userError } = await supabase
    .from("dashboard_users")
    .select("id, name, email, password_hash, role")
    .eq("email", email)
    .maybeSingle();

  if (userError && userError.code !== "PGRST116") {
    return formatAuthError(
      mapSupabaseAuthError(userError.message, userError.code)
    );
  }

  if (!user) {
    return formatAuthError("Email belum terdaftar.");
  }

  const passwordMatches = await verifyPassword(password, user.password_hash);

  if (!passwordMatches) {
    return formatAuthError("Password salah.");
  }

  if (user.role !== "admin") {
    return formatAuthError("Akun ini tidak memiliki akses admin.");
  }

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  // Check if onboarding is complete
  const onboardingComplete = await isOnboardingComplete();

  if (!onboardingComplete) {
    redirect("/onboarding");
  }

  redirect("/admin");
}

export async function logoutUser() {
  await destroySession();
  redirect("/login");
}
