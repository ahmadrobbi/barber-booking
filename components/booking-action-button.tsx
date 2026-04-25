"use client";

import { useFormStatus } from "react-dom";

type BookingActionButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  tone?: "success" | "danger" | "neutral";
};

const toneClasses: Record<NonNullable<BookingActionButtonProps["tone"]>, string> = {
  success:
    "bg-emerald-600 text-white hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-sm disabled:bg-emerald-300",
  danger:
    "bg-red-600 text-white hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-sm disabled:bg-red-300",
  neutral:
    "bg-stone-700 text-white hover:-translate-y-0.5 hover:bg-stone-600 hover:shadow-sm disabled:bg-stone-300",
};

export function BookingActionButton({
  idleLabel,
  pendingLabel,
  tone = "neutral",
}: BookingActionButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed ${toneClasses[tone]}`}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
