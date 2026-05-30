"use client";

import { useActionState } from "react";
import { updateBusinessSettings } from "@/app/actions/business-settings";
import { AdminActionFeedbackAlert } from "@/components/admin-action-feedback-alert";
import type { IndustryConfig } from "@/lib/industry-config";
import { getIndustryDisplayName } from "@/lib/industries";

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
      <AdminActionFeedbackAlert message={state.message} success={state.success} />
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
              {getIndustryDisplayName(industry)}
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
    </form>
  );
}
