"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPublicBooking } from "@/app/actions/public-booking";
import { initialBookingFormState } from "@/lib/booking-form-state";
import type { IndustryKey } from "@/lib/bookings";
import type { TenantService } from "@/lib/tenant-context";

type PublicBookingFormProps = {
  slug: string;
  industry: IndustryKey;
  services: TenantService[];
  hasActiveChannel: boolean;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="w-full rounded-2xl bg-amber-400 px-4 py-3 font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Mengirim booking..." : "Kirim Booking"}
    </button>
  );
}

export function PublicBookingForm({
  slug,
  industry,
  services,
  hasActiveChannel,
}: PublicBookingFormProps) {
  const [state, formAction] = useActionState(createPublicBooking, initialBookingFormState);
  const [serviceCode, setServiceCode] = useState(services[0]?.code ?? "");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const hasServices = services.length > 0;
  const isReady = hasActiveChannel && hasServices;

  useEffect(() => {
    let ignore = false;

    async function loadSlots() {
      if (!isReady || !selectedDate || !serviceCode) {
        setAvailableSlots([]);
        setSlot("");
        return;
      }

      setLoadingSlots(true);

      try {
        const params = new URLSearchParams({
          slug,
          date: selectedDate,
          service: serviceCode,
        });
        const response = await fetch(`/api/public-booking/slots?${params.toString()}`);
        const payload = (await response.json()) as { slots?: string[] };

        if (!ignore) {
          const nextSlots = payload.slots ?? [];
          setAvailableSlots(nextSlots);
          setSlot(nextSlots[0] ?? "");
        }
      } catch {
        if (!ignore) {
          setAvailableSlots([]);
          setSlot("");
        }
      } finally {
        if (!ignore) {
          setLoadingSlots(false);
        }
      }
    }

    void loadSlots();

    return () => {
      ignore = true;
    };
  }, [isReady, selectedDate, serviceCode, slug]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="industry" value={industry} />

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
          disabled={!isReady}
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
          disabled={!isReady}
        >
          {services.map((service) => (
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
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400"
            disabled={!isReady}
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
            disabled={!isReady || loadingSlots || availableSlots.length === 0}
            required
          >
            {availableSlots.length === 0 ? (
              <option value="">
                {selectedDate
                  ? loadingSlots
                    ? "Memuat slot..."
                    : "Tidak ada slot tersedia"
                  : "Pilih tanggal dulu"}
              </option>
            ) : null}
            {availableSlots.map((slotOption) => (
              <option key={slotOption} value={slotOption}>
                {slotOption}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-600">
        {isReady ? (
          <>Booking publik akan masuk langsung ke dashboard bisnis ini dengan status <strong>pending</strong>.</>
        ) : (
          <>Booking belum bisa diproses karena bisnis ini belum memiliki channel WhatsApp aktif atau layanan yang bisa dipilih.</>
        )}
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

      <SubmitButton disabled={!isReady} />
    </form>
  );
}
