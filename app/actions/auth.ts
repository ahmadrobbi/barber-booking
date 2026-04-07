"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { createAdminSupabase } from "@/lib/supabase";

export type AuthFormState = {
  message: string;
};

export const initialAuthFormState: AuthFormState = {
  message: "",
};

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatAuthError(message: string) {
  return { message };
}

export async function registerUser(
  _prevState: AuthFormState | void,
  formData: FormData
) {
  const name = normalizeText(formData.get("name"));
  const email = normalizeText(formData.get("email")).toLowerCase();
  const password = normalizeText(formData.get("password"));

  if (name.length < 3) {
    return formatAuthError("Nama minimal 3 karakter.");
  }

  if (!validateEmail(email)) {
    return formatAuthError("Format email belum valid.");
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
      existingUserError.code === "42P01"
        ? "Tabel dashboard_users belum ada di Supabase."
        : existingUserError.message
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
      password_hash: passwordHash,
    })
    .select("id, name, email")
    .single();

  if (createUserError || !newUser) {
    return formatAuthError(
      createUserError?.code === "42P01"
        ? "Tabel dashboard_users belum ada di Supabase."
        : createUserError?.message || "Registrasi gagal. Coba lagi."
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
      userError.code === "42P01"
        ? "Tabel dashboard_users belum ada di Supabase."
        : userError.message
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
