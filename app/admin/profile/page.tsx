import { getCurrentUser, getUserProfile } from "@/lib/user";
import { requireAdmin } from "@/lib/auth";
import { UserProfileForm } from "@/components/user-profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  await requireAdmin();

  const user = await getCurrentUser();
  const profile = await getUserProfile();

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white md:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Account Settings</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Profile & Business Info
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
          Kelola informasi akun dan bisnis Anda. Data ini akan ditampilkan di landing page dan komunikasi dengan pelanggan.
        </p>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8">
        <UserProfileForm user={user} initialProfile={profile} />
      </section>
    </div>
  );
}
