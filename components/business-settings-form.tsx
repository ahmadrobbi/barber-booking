"use client";

import { useActionState } from "react";
import { updateBusinessSettings } from "@/app/actions/business-settings";
import type { IndustryConfig } from "@/lib/industry-config";

interface BusinessSettingsFormProps {
  initialBusinessName: string;
  config: IndustryConfig;
}

export function BusinessSettingsForm({ initialBusinessName, config }: BusinessSettingsFormProps) {
  const [state, formAction] = useActionState(updateBusinessSettings, {
    message: "",
    success: false,
  });

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-stone-700 mb-2">
          Nama Bisnis
        </label>
        <input
          id="businessName"
          name="businessName"
          type="text"
          defaultValue={initialBusinessName}
          placeholder="Masukkan nama bisnis Anda"
          className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:border-amber-500 focus:outline-none"
          required
        />
        <p className="text-sm text-stone-500 mt-2">
          Nama bisnis akan ditampilkan di header website dan dashboard admin.
        </p>
      </div>

      <div>
        <label htmlFor="defaultIndustry" className="block text-sm font-medium text-stone-700 mb-2">
          Industri Default
        </label>
        <select
          id="defaultIndustry"
          name="defaultIndustry"
          defaultValue={config.default}
          className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:border-amber-500 focus:outline-none"
        >
          {config.enabled.map((industry) => (
            <option key={industry} value={industry}>
              {industry === "barbershop" ? "Barbershop" :
               industry === "clinic" ? "Klinik" : industry}
            </option>
          ))}
        </select>
        <p className="text-sm text-stone-500 mt-2">
          Industri yang akan digunakan sebagai default untuk booking baru.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-3 bg-amber-500 text-white rounded-2xl font-semibold hover:bg-amber-600 transition"
        >
          Simpan Pengaturan
        </button>
      </div>

      {state.message && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            state.success
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {state.message}
        </div>
      )}
    </form>
  );
}