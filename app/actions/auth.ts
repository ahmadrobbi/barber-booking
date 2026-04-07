"use server";

import { redirect } from "next/navigation";
import type { AuthFormState } from "@/lib/auth-form-state";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { createAdminSupabase } from "@/lib/supabase";

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizePhoneNumber(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function validatePhoneNumber(phone: string) {
  return /^[+]?\d{10,20}$/.test(phone);
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
  const noHp = normalizePhoneNumber(normalizeText(formData.get("no_hp")));
  const password = normalizeText(formData.get("password"));

  if (name.length < 3) {
    return formatAuthError("Nama minimal 3 karakter.");
  }

  if (!validateEmail(email)) {
    return formatAuthError("Format email belum valid.");
  }

  if (!validatePhoneNumber(noHp)) {
    return formatAuthError("Nomor HP/WhatsApp harus 10-20 digit angka.");
  }

  if (password.length < 6) {
    return formatAuthError("Password minimal 6 karakter.");
  }

  const supabase = createAdminSupabase();

  const { data: existingUser, error: existingUserError } = await supabase
    .from("dashboard_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingUserError && existingUserError.code !== "PGRST116") {
    return formatAuthError(
      mapSupabaseAuthError(existingUserError.message, existingUserError.code)
    );
  }

  if (existingUser) {
    return formatAuthError("Email sudah terdaftar. Silakan login.");
  }

  const passwordHash = await hashPassword(password);

  const { data: newUser, error: createUserError } = await supabase
    .from("dashboard_users")
    .insert({
      name,
      email,
      no_hp: noHp,
      password_hash: passwordHash,
    })
    .select("id, name, email")
    .single();

  if (createUserError || !newUser) {
    return formatAuthError(
      createUserError
        ? mapSupabaseAuthError(createUserError.message, createUserError.code)
        : "Registrasi gagal. Coba lagi."
    );
  }

  await createSession(newUser);
  redirect("/admin");
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
    .select("id, name, email, password_hash")
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

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  redirect("/admin");
}

export async function logoutUser() {
  await destroySession();
  redirect("/login");
}
