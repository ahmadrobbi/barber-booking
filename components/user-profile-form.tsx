"use client";

import { useActionState } from "react";
import { updateUserProfile } from "@/app/actions/user-profile";
import type { UserProfile } from "@/lib/user";
import { normalizeBusinessHours, WEEKDAY_KEYS } from "@/lib/scheduling";

type User = {
  id: string;
  name: string;
  email: string;
  no_hp: string;
  role: string;
  created_at: string;
};

type UserProfileFormProps = {
  user: User;
  initialProfile: UserProfile | null;
};

export function UserProfileForm({ user, initialProfile }: UserProfileFormProps) {
  const [state, action] = useActionState(updateUserProfile, { message: "" });
  const businessHours = normalizeBusinessHours(initialProfile?.business_hours);

  return (
    <form action={action} className="space-y-6">
      {/* Account Information */}
      <div>
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Informasi Akun</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">
              Nama Lengkap
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={user.name}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:bg-white"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={user.email}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:bg-white"
              required
            />
          </div>

          <div>
            <label htmlFor="no_hp" className="block text-sm font-medium text-stone-700 mb-2">
              No. HP / WhatsApp
            </label>
            <input
              id="no_hp"
              name="no_hp"
              type="tel"
              defaultValue={user.no_hp}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:bg-white"
              required
            />
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div>
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Informasi Bisnis</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="business_name" className="block text-sm font-medium text-stone-700 mb-2">
              Nama Bisnis
            </label>
            <input
              id="business_name"
              name="business_name"
              type="text"
              defaultValue={initialProfile?.business_name || ""}
              placeholder="Contoh: Barbershop Modern"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="business_description" className="block text-sm font-medium text-stone-700 mb-2">
              Deskripsi Bisnis
            </label>
            <textarea
              id="business_description"
              name="business_description"
              rows={3}
              defaultValue={initialProfile?.business_description || ""}
              placeholder="Jelaskan tentang bisnis Anda..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:bg-white resize-none"
            />
          </div>

          <div>
            <label htmlFor="website_url" className="block text-sm font-medium text-stone-700 mb-2">
              Website URL
            </label>
            <input
              id="website_url"
              name="website_url"
              type="url"
              defaultValue={initialProfile?.website_url || ""}
              placeholder="https://website-anda.com"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="logo_url" className="block text-sm font-medium text-stone-700 mb-2">
              Logo URL
            </label>
            <input
              id="logo_url"
              name="logo_url"
              type="url"
              defaultValue={initialProfile?.logo_url || ""}
              placeholder="https://example.com/logo.png"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div>
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Media Sosial</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-stone-700 mb-2">
              Instagram
            </label>
            <input
              id="instagram"
              name="instagram"
              type="text"
              defaultValue={initialProfile?.social_media?.instagram || ""}
              placeholder="@username"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="facebook" className="block text-sm font-medium text-stone-700 mb-2">
              Facebook
            </label>
            <input
              id="facebook"
              name="facebook"
              type="text"
              defaultValue={initialProfile?.social_media?.facebook || ""}
              placeholder="facebook.com/username"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:bg-white"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Jam Operasional</h3>
        <div className="space-y-3">
          {WEEKDAY_KEYS.map((day) => {
            const labelMap: Record<string, string> = {
              monday: "Senin",
              tuesday: "Selasa",
              wednesday: "Rabu",
              thursday: "Kamis",
              friday: "Jumat",
              saturday: "Sabtu",
              sunday: "Minggu",
            };
            const value = businessHours[day];

            return (
              <div
                key={day}
                className="grid gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 md:grid-cols-[1.2fr_0.8fr_0.8fr]"
              >
                <label className="flex items-center gap-3 text-sm font-medium text-stone-800">
                  <input
                    type="checkbox"
                    name={`business_hours_${day}_enabled`}
                    defaultChecked={value.enabled}
                    className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                  />
                  {labelMap[day]}
                </label>

                <label className="block text-sm font-medium text-stone-700">
                  Buka
                  <input
                    type="time"
                    name={`business_hours_${day}_open`}
                    defaultValue={value.open}
                    className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-300 focus:bg-white"
                  />
                </label>

                <label className="block text-sm font-medium text-stone-700">
                  Tutup
                  <input
                    type="time"
                    name={`business_hours_${day}_close`}
                    defaultValue={value.close}
                    className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-300 focus:bg-white"
                  />
                </label>
              </div>
            );
          })}
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
          className="cursor-pointer rounded-xl bg-amber-400 px-6 py-3 font-semibold text-black transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
        >
          Simpan Perubahan
        </button>
      </div>
    </form>
  );
}
