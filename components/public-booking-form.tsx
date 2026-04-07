"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createPublicBooking } from "@/app/actions/public-booking";
import { initialBookingFormState } from "@/lib/booking-form-state";
import { ALL_BOOKING_SLOTS, BOOKING_SERVICES } from "@/lib/bookings";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-amber-400 px-4 py-3 font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Mengirim booking..." : "Kirim Booking"}
    </button>
  );
}

export function PublicBookingForm() {
  const [state, formAction] = useActionState(createPublicBooking, initialBookingFormState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="no_hp" className="mb-2 block text-sm font-medium text-stone-700">
          No. HP / WhatsApp
        </label>
        <input
          id="no_hp"
          name="no_hp"
          type="tel"
          inputMode="tel"
          maxLength={20}
          placeholder="Contoh: 081234567890"
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400"
          required
        />
      </div>

      <div>
        <label htmlFor="service" className="mb-2 block text-sm font-medium text-stone-700">
          Pilih Layanan
        </label>
        <select
          id="service"
          name="service"
          defaultValue={BOOKING_SERVICES[0].code}
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400"
        >
          {BOOKING_SERVICES.map((service) => (
            <option key={service.code} value={service.code}>
              {service.name} - Rp{service.price.toLocaleString("id-ID")}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="tanggal" className="mb-2 block text-sm font-medium text-stone-700">
            Tanggal
          </label>
          <input
            id="tanggal"
            name="tanggal"
            type="date"
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400"
            required
          />
        </div>

        <div>
          <label htmlFor="jam" className="mb-2 block text-sm font-medium text-stone-700">
            Jam
          </label>
          <select
            id="jam"
            name="jam"
            defaultValue={ALL_BOOKING_SLOTS[0]}
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400"
          >
            {ALL_BOOKING_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-600">
        Booking publik akan masuk dengan status <strong>pending</strong>. Admin akan memantau transaksi dari dashboard owner.
      </div>

      {state.message ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            state.success
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
