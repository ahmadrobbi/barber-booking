"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { AuthFormState } from "@/app/actions/auth";
import { initialAuthFormState } from "@/app/actions/auth";

type AuthFormProps = {
  action: (
    state: AuthFormState | void,
    formData: FormData
  ) => Promise<AuthFormState | void>;
  mode: "login" | "register";
};

function SubmitButton({ mode }: { mode: "login" | "register" }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-amber-400 px-4 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Memproses..." : mode === "login" ? "Login Dashboard" : "Buat Akun"}
    </button>
  );
}

export function AuthForm({ action, mode }: AuthFormProps) {
  const [state, formAction] = useActionState(action, initialAuthFormState);
  const isRegister = mode === "register";

  return (
    <form action={formAction} className="space-y-5">
      {isRegister ? (
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-white/80">
            Nama Lengkap
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Masukkan nama lengkap"
            className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-amber-300"
            required
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="nama@email.com"
          className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-amber-300"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/80">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder={isRegister ? "Minimal 6 karakter" : "Masukkan password"}
          className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-amber-300"
          required
        />
      </div>

      {state?.message ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.message}
        </p>
      ) : null}

      <SubmitButton mode={mode} />

      <p className="text-center text-sm text-white/60">
        {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="font-medium text-amber-300 transition hover:text-amber-200"
        >
          {isRegister ? "Login di sini" : "Register sekarang"}
        </Link>
      </p>
    </form>
  );
}
