"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createPublicBooking } from "@/app/actions/public-booking";
import { initialBookingFormState } from "@/lib/booking-form-state";
import { getAvailableIndustries } from "@/lib/industry-config";
import {
  getServicesForIndustry,
  getSlotsForIndustry,
  type IndustryKey,
} from "@/lib/bookings";

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
  const industries = getAvailableIndustries();
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryKey>("barbershop");
  const [serviceCode, setServiceCode] = useState("");
  const [slot, setSlot] = useState("");

  const availableServices = getServicesForIndustry(selectedIndustry);
  const availableSlots = getSlotsForIndustry(selectedIndustry);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const industryParam = params.get("industry");

    if (industryParam && industries.some((industry) => industry.key === industryParam)) {
      setSelectedIndustry(industryParam as IndustryKey);
    }
  }, [industries]);

  useEffect(() => {
    setServiceCode(availableServices[0]?.code ?? "");
    setSlot(availableSlots[0] ?? "");
  }, [selectedIndustry]);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="industry" className="mb-2 block text-sm font-medium text-stone-700">
          Pilih Industri
        </label>
        <select
          id="industry"
          name="industry"
          value={selectedIndustry}
          onChange={(event) => setSelectedIndustry(event.target.value as IndustryKey)}
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400"
        >
          {industries.map((industry) => (
            <option key={industry.key} value={industry.key}>
              {industry.name}
            </option>
          ))}
        </select>
      </div>

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
          value={serviceCode}
          onChange={(event) => setServiceCode(event.target.value)}
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400"
        >
          {availableServices.map((service) => (
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
            value={slot}
            onChange={(event) => setSlot(event.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400"
          >
            {availableSlots.map((slotOption) => (
              <option key={slotOption} value={slotOption}>
                {slotOption}
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
