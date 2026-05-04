"use client";

import { useFormStatus } from "react-dom";

type ConnectChannelButtonProps = {
  label?: string;
};

function PendingButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="cursor-pointer rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-stone-800 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Menghubungkan..." : label}
    </button>
  );
}

export function ConnectChannelButton({
  label = "Hubungkan Nomor",
}: ConnectChannelButtonProps) {
  return <PendingButton label={label} />;
}
