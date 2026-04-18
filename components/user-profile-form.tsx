"use client";

import { useActionState } from "react";
import { updateUserProfile } from "@/app/actions/user-profile";
import type { UserProfile } from "@/lib/user";

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