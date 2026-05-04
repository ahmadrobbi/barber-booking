"use client";

import { useActionState } from "react";
import { updateLandingPage } from "@/app/actions/landing-page";
import { AdminActionFeedbackAlert } from "@/components/admin-action-feedback-alert";
import type { UserLandingPage } from "@/lib/user";

type LandingPageFormProps = {
  initialLandingPage: UserLandingPage | null;
  appUrl: string;
};

export function LandingPageForm({ initialLandingPage, appUrl }: LandingPageFormProps) {
  const [state, action] = useActionState(updateLandingPage, { message: "" });
  const publicProfilePath = initialLandingPage?.custom_domain
    ? `https://${initialLandingPage.custom_domain}`
    : initialLandingPage?.subdomain
    ? `/landing_page/${initialLandingPage.subdomain}`
    : `/landing_page/namabisnis`;
  const publicBookingPath = initialLandingPage?.subdomain
    ? `/b/${initialLandingPage.subdomain}`
    : `/b/namabisnis`;

  return (
    <form action={action} className="space-y-6 overflow-x-hidden">
      <AdminActionFeedbackAlert message={state.message} success={false} />
      {/* Domain Settings */}
      <div>
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Pengaturan URL Publik</h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor="subdomain" className="block text-sm font-medium text-stone-700 mb-2">
              Slug Halaman Publik
            </label>
            <div className="flex min-w-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
              <input
                id="subdomain"
                name="subdomain"
                type="text"
                defaultValue={initialLandingPage?.subdomain || ""}
                placeholder="namabisnis"
                className="min-w-0 flex-1 rounded-l-xl border-0 bg-transparent px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-transparent focus:ring-0 focus:bg-white"
              />
              <span className="inline-flex shrink-0 items-center rounded-r-xl border border-l-0 border-stone-200 bg-stone-100 px-3 text-sm text-stone-600">
                /landing_page/
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Dipakai untuk URL profil usaha dan link booking publik.
            </p>
          </div>

          <div className="min-w-0">
            <label htmlFor="custom_domain" className="block text-sm font-medium text-stone-700 mb-2">
              Domain Kustom (Opsional)
            </label>
            <input
              id="custom_domain"
              name="custom_domain"
              type="text"
              defaultValue={initialLandingPage?.custom_domain || ""}
              placeholder="booking.namabisnis.com"
              className="min-w-0 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white"
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
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white"
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-300 border-stone-300 rounded"
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
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-sm text-stone-600 mb-2">URL profil usaha Anda:</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="min-w-0 break-words text-sm font-mono text-stone-900 bg-white px-3 py-1 rounded border w-full sm:w-auto">
              {publicProfilePath}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-500 underline"
                onClick={() => {
                  navigator.clipboard.writeText(publicProfilePath);
                }}
              >
                Copy
              </button>
              {initialLandingPage?.subdomain || initialLandingPage?.custom_domain ? (
                <a
                  href={publicProfilePath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl bg-stone-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-stone-800"
                >
                  Lihat Halaman
                </a>
              ) : null}
            </div>
          </div>

          <p className="text-sm text-stone-600 mt-4 mb-2">URL booking publik Anda:</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="min-w-0 break-words text-sm font-mono text-stone-900 bg-white px-3 py-1 rounded border w-full sm:w-auto">
              {publicBookingPath}
            </span>
            <button
              type="button"
              className="text-xs text-blue-600 hover:text-blue-500 underline"
              onClick={() => {
                navigator.clipboard.writeText(publicBookingPath);
              }}
            >
              Copy
            </button>
          </div>
          {initialLandingPage?.custom_domain && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 mt-2">
              <span className="min-w-0 break-words text-sm font-mono text-stone-900 bg-white px-3 py-1 rounded border w-full sm:w-auto">
                https://{initialLandingPage.custom_domain}
              </span>
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-500 underline"
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
      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Simpan Perubahan
        </button>
      </div>
    </form>
  );
}
