import { requireAdmin } from "@/lib/auth";
import { getBusinessName, getIndustryConfig } from "@/lib/industry-config";
import { BusinessSettingsForm } from "@/components/business-settings-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireAdmin();
  const businessName = await getBusinessName();
  const config = await getIndustryConfig();

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-[2rem] bg-stone-950 p-6 text-white shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Profil Akun</p>
        <h1 className="mt-3 text-3xl font-semibold">{user.name}</h1>
        <p className="mt-2 text-white/70">{user.email}</p>
        <div className="mt-6 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-amber-200">
          Admin / Owner
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Informasi Detail</p>
        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-sm text-stone-500">Nama Lengkap</p>
            <p className="mt-1 text-lg font-semibold text-stone-900">{user.name}</p>
          </div>
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-sm text-stone-500">Email</p>
            <p className="mt-1 text-lg font-semibold text-stone-900">{user.email}</p>
          </div>
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-sm text-stone-500">Nomor WhatsApp</p>
            <p className="mt-1 text-lg font-semibold text-stone-900">{user.no_hp}</p>
          </div>
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-sm text-stone-500">Role</p>
            <p className="mt-1 text-lg font-semibold text-stone-900">admin</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm xl:col-span-2">
        <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Pengaturan Bisnis</p>
        <div className="mt-6">
          <BusinessSettingsForm initialBusinessName={businessName} config={config} />
        </div>
      </section>
    </div>
  );
}
