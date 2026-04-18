import { getUserLandingPage } from "@/lib/user";
import { requireAdmin } from "@/lib/auth";
import { LandingPageForm } from "@/components/landing-page-form";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  await requireAdmin();

  const landingPage = await getUserLandingPage();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white md:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Landing Page</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Pengaturan Landing Page
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
          Sesuaikan tampilan landing page Anda. Pilih subdomain atau domain kustom untuk halaman booking bisnis Anda.
        </p>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8">
        <LandingPageForm initialLandingPage={landingPage} />
      </section>
    </div>
  );
}