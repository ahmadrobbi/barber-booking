"use client";

import { useActionState } from "react";
import { updateLandingPage } from "@/app/actions/landing-page";
import type { UserLandingPage } from "@/lib/user";

type LandingPageFormProps = {
  initialLandingPage: UserLandingPage | null;
};

export function LandingPageForm({ initialLandingPage }: LandingPageFormProps) {
  const [state, action] = useActionState(updateLandingPage, { message: "" });

  return (
    <form action={action} className="space-y-6">
      {/* Domain Settings */}
      <div>
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Pengaturan Domain</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="subdomain" className="block text-sm font-medium text-stone-700 mb-2">
              Subdomain
            </label>
            <div className="flex">
              <input
                id="subdomain"
                name="subdomain"
                type="text"
                defaultValue={initialLandingPage?.subdomain || ""}
                placeholder="namabisnis"
                className="flex-1 rounded-l-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:bg-white"
              />
              <span className="inline-flex items-center px-3 rounded-r-xl border border-l-0 border-stone-200 bg-stone-100 text-stone-600 text-sm">
                .antrianpro.com
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              URL landing page: https://namabisnis.antrianpro.com
            </p>
          </div>

          <div>
            <label htmlFor="custom_domain" className="block text-sm font-medium text-stone-700 mb-2">
              Domain Kustom (Opsional)
            </label>
            <input
              id="custom_domain"
              name="custom_domain"
              type="text"
              defaultValue={initialLandingPage?.custom_domain || ""}
              placeholder="booking.namabisnis.com"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:bg-white"
            />
            <p className="text-xs text-stone-500 mt-1">
              Domain kustom Anda sendiri
            </p>
          </div>
        </div>
      </div>

      {/* Template Settings */}
      <div>
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Template & Tema</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="template" className="block text-sm font-medium text-stone-700 mb-2">
              Template Landing Page
            </label>
            <select
              id="template"
              name="template"
              defaultValue={initialLandingPage?.template || "default"}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition focus:border-amber-300 focus:bg-white"
            >
              <option value="default">Default - Modern</option>
              <option value="minimal">Minimal - Clean</option>
              <option value="vibrant">Vibrant - Colorful</option>
              <option value="professional">Professional - Corporate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Status Landing Page
            </label>
            <div className="flex items-center space-x-3">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                defaultChecked={initialLandingPage?.is_active ?? true}
                className="h-4 w-4 text-amber-400 focus:ring-amber-300 border-stone-300 rounded"
              />
              <label htmlFor="is_active" className="text-sm text-stone-700">
                Aktifkan landing page
              </label>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Nonaktifkan jika tidak ingin landing page dapat diakses publik
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Preview URL</h3>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-sm text-stone-600 mb-2">URL Landing Page Anda:</p>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-mono text-stone-900 bg-white px-3 py-1 rounded border">
              https://{initialLandingPage?.subdomain || "namabisnis"}.antrianpro.com
            </span>
            <button
              type="button"
              className="text-xs text-amber-600 hover:text-amber-500 underline"
              onClick={() => {
                const url = `https://${initialLandingPage?.subdomain || "namabisnis"}.antrianpro.com`;
                navigator.clipboard.writeText(url);
              }}
            >
              Copy
            </button>
          </div>
          {initialLandingPage?.custom_domain && (
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm font-mono text-stone-900 bg-white px-3 py-1 rounded border">
                https://{initialLandingPage.custom_domain}
              </span>
              <button
                type="button"
                className="text-xs text-amber-600 hover:text-amber-500 underline"
                onClick={() => {
                  navigator.clipboard.writeText(`https://${initialLandingPage.custom_domain}`);
                }}
              >
                Copy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {state?.message && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Simpan Perubahan
        </button>
      </div>
    </form>
  );
}