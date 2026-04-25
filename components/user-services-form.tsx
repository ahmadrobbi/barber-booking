"use client";

import { useActionState, useMemo, useState } from "react";
import { saveUserServices } from "@/app/actions/user-services";
import type { UserService } from "@/lib/user-services";

type UserServicesFormProps = {
  initialServices: UserService[];
};

function createEmptyService(sortOrder: number): UserService {
  return {
    code: "",
    name: "",
    price: 0,
    description: "",
    duration_minutes: 60,
    is_active: true,
    sort_order: sortOrder,
  };
}

export function UserServicesForm({ initialServices }: UserServicesFormProps) {
  const [state, formAction] = useActionState(saveUserServices, {
    message: "",
    success: false,
  });
  const [services, setServices] = useState<UserService[]>(
    initialServices.length > 0 ? initialServices : [createEmptyService(0)]
  );

  const serializedServices = useMemo(
    () =>
      JSON.stringify(
        services.map((service, index) => ({
          ...service,
          code: service.code.trim(),
          name: service.name.trim(),
          sort_order: index,
        }))
      ),
    [services]
  );

  function updateService(index: number, next: Partial<UserService>) {
    setServices((current) =>
      current.map((service, serviceIndex) =>
        serviceIndex === index ? { ...service, ...next } : service
      )
    );
  }

  function addService() {
    setServices((current) => [...current, createEmptyService(current.length)]);
  }

  function removeService(index: number) {
    setServices((current) => current.filter((_, serviceIndex) => serviceIndex !== index));
  }

  function moveService(index: number, direction: -1 | 1) {
    setServices((current) => {
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="services_json" value={serializedServices} />

      <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5 text-sm leading-7 text-stone-600">
        Layanan di sini akan dipakai oleh halaman booking publik dan chatbot WhatsApp bisnis Anda. Urutan list juga
        akan memengaruhi urutan pilihan layanan yang dilihat pelanggan.
      </div>

      <div className="space-y-4">
        {services.map((service, index) => (
          <div key={service.id ?? `new-${index}`} className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Layanan {index + 1}</p>
                <h3 className="mt-1 text-lg font-semibold text-stone-900">
                  {service.name || "Layanan baru"}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => moveService(index, -1)}
                  className="cursor-pointer rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 transition hover:-translate-y-0.5 hover:bg-stone-50"
                >
                  Naik
                </button>
                <button
                  type="button"
                  onClick={() => moveService(index, 1)}
                  className="cursor-pointer rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 transition hover:-translate-y-0.5 hover:bg-stone-50"
                >
                  Turun
                </button>
                {services.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="cursor-pointer rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100"
                  >
                    Hapus
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">Nama layanan</span>
                <input
                  type="text"
                  value={service.name}
                  onChange={(event) => updateService(index, { name: event.target.value })}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                  placeholder="Contoh: Haircut Premium"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">Kode layanan</span>
                <input
                  type="text"
                  value={service.code}
                  onChange={(event) => updateService(index, { code: event.target.value })}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                  placeholder="contoh: haircut-premium"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">Harga</span>
                <input
                  type="number"
                  min={0}
                  value={service.price}
                  onChange={(event) => updateService(index, { price: Number(event.target.value) })}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">Durasi (menit)</span>
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={service.duration_minutes}
                  onChange={(event) =>
                    updateService(index, { duration_minutes: Number(event.target.value) })
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                />
              </label>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800">
                <input
                  type="checkbox"
                  checked={service.is_active}
                  onChange={(event) => updateService(index, { is_active: event.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                />
                Layanan aktif
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:justify-between">
        <button
          type="button"
          onClick={addService}
          className="cursor-pointer rounded-2xl border border-stone-200 bg-stone-50 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:-translate-y-0.5 hover:bg-stone-100 hover:shadow-sm"
        >
          Tambah Layanan
        </button>

        <button
          type="submit"
          className="cursor-pointer rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-stone-800 hover:shadow-sm"
        >
          Simpan Layanan
        </button>
      </div>

      {state.message ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            state.success
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}
    </form>
  );
}
