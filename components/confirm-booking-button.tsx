"use client";

import { useFormStatus } from "react-dom";

export function ConfirmBookingButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
    >
      {pending ? "Memproses..." : "Konfirmasi"}
    </button>
  );
}
