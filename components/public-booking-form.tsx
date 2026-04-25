"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPublicBooking } from "@/app/actions/public-booking";
import { initialBookingFormState } from "@/lib/booking-form-state";
import type { IndustryKey } from "@/lib/bookings";
import type { TenantService } from "@/lib/tenant-context";
import type { UserBranch } from "@/lib/user-branches";

type PublicBookingFormProps = {
  slug: string;
  industry: IndustryKey;
  services: TenantService[];
  branches: UserBranch[];
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
  branches,
  hasActiveChannel,
}: PublicBookingFormProps) {
  const [state, formAction] = useActionState(createPublicBooking, initialBookingFormState);
  const [selectedServiceCodes, setSelectedServiceCodes] = useState<string[]>(
    services[0]?.code ? [services[0].code] : []
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(
    branches.length === 1 ? branches[0]?.id ?? "" : ""
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const hasServices = services.length > 0;
  const isReady = hasActiveChannel && hasServices;

  useEffect(() => {
    let ignore = false;

    async function loadSlots() {
      if (
        !isReady ||
        !selectedDate ||
        selectedServiceCodes.length === 0 ||
        (branches.length > 0 && !selectedBranchId)
      ) {
        setAvailableSlots([]);
        setSlot("");
        return;
      }

      setLoadingSlots(true);

      try {
        const params = new URLSearchParams({
          slug,
          date: selectedDate,
          services: selectedServiceCodes.join(","),
        });
        if (selectedBranchId) {
          params.set("branch", selectedBranchId);
        }
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
  }, [branches.length, isReady, selectedBranchId, selectedDate, selectedServiceCodes, slug]);

  const selectedServices = services.filter((service) =>
    selectedServiceCodes.includes(service.code)
  );
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce(
    (sum, service) => sum + service.duration_minutes,
    0
  );

  function toggleService(code: string) {
    setSelectedDate("");
    setAvailableSlots([]);
    setSlot("");
    setSelectedServiceCodes((current) => {
      const exists = current.includes(code);
      if (exists) {
        const next = current.filter((item) => item !== code);
        return next.length > 0 ? next : current;
      }

      return [...current, code];
    });
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="industry" value={industry} />
      <input type="hidden" name="services" value={selectedServiceCodes.join(",")} />
      <input type="hidden" name="branch_id" value={selectedBranchId} />

      {branches.length > 0 ? (
        <div>
          <label htmlFor="branch_id" className="mb-2 block text-sm font-medium text-stone-700">
            Pilih Cabang
          </label>
          <select
            id="branch_id"
            value={selectedBranchId}
            onChange={(event) => {
              setSelectedBranchId(event.target.value);
              setSelectedDate("");
              setAvailableSlots([]);
              setSlot("");
            }}
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400"
            disabled={!isReady || branches.length === 1}
            required
          >
            {branches.length > 1 ? <option value="">Pilih cabang dulu</option> : null}
            {branches.map((branch) => (
              <option key={branch.id ?? branch.code ?? branch.name} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-stone-500">
            Jadwal dan slot booking akan menyesuaikan cabang yang dipilih.
          </p>
        </div>
      ) : null}

      <div>
        <label htmlFor="customer_name" className="mb-2 block text-sm font-medium text-stone-700">
          Nama Pemesan
        </label>
        <input
          id="customer_name"
          name="customer_name"
          type="text"
          placeholder="Contoh: Ahmad"
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400"
          disabled={!isReady}
          required
        />
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
          disabled={!isReady}
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">
          Pilih Layanan
        </label>
        <div className="space-y-3">
          {services.map((service) => {
            const checked = selectedServiceCodes.includes(service.code);

            return (
              <label
                key={service.code}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                  checked
                    ? "border-amber-300 bg-amber-50"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleService(service.code)}
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                  disabled={!isReady}
                />
                <span className="flex-1">
                  <span className="block font-semibold text-stone-900">{service.name}</span>
                  <span className="mt-1 block text-stone-600">
                    Rp{service.price.toLocaleString("id-ID")} • {service.duration_minutes} menit
                  </span>
                </span>
              </label>
            );
          })}
        </div>
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
                  : branches.length > 0 && !selectedBranchId
                    ? "Pilih cabang dulu"
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
          <>
            Booking publik akan masuk langsung ke dashboard bisnis ini dengan status <strong>pending</strong>.
            {selectedBranchId ? (
              <>
                {" "}Cabang:{" "}
                <strong>
                  {branches.find((branch) => branch.id === selectedBranchId)?.name ?? "-"}
                </strong>.
              </>
            ) : null}
            {selectedServices.length > 0 ? (
              <>
                {" "}Total saat ini: <strong>Rp{totalPrice.toLocaleString("id-ID")}</strong> untuk{" "}
                <strong>{totalDuration} menit</strong>.
              </>
            ) : null}
          </>
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
