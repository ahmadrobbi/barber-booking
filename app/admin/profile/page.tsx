import { getCurrentUser, getUserProfile } from "@/lib/user";
import { requireAdmin } from "@/lib/auth";
import { AdminQueryFeedbackAlert } from "@/components/admin-query-feedback-alert";
import { UserProfileForm } from "@/components/user-profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string }>;
}) {
  await requireAdmin();

  const user = await getCurrentUser();
  const profile = await getUserProfile();
  const params = (await searchParams) ?? {};

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-6">
      <AdminQueryFeedbackAlert
        successMessage={params.success === "1" ? "Profile berhasil disimpan." : null}
      />
      <section className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white md:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Account Settings</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Profile & Business Info
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
          Kelola informasi akun, profil bisnis, dan jam operasional default bisnis Anda. Jadwal ini
          akan dipakai sebagai fallback jika sebuah cabang belum punya pengaturan jam operasional
          sendiri.
        </p>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8">
        <UserProfileForm user={user} initialProfile={profile} />
      </section>
    </div>
  );
}
