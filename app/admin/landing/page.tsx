import { getUserLandingPage } from "@/lib/user";
import { requireAdmin } from "@/lib/auth";
import { AdminQueryFeedbackAlert } from "@/components/admin-query-feedback-alert";
import { LandingPageForm } from "@/components/landing-page-form";

export const dynamic = "force-dynamic";

function getAppUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string }>;
}) {
  await requireAdmin();

  const landingPage = await getUserLandingPage();
  const params = (await searchParams) ?? {};
  const appUrl = getAppUrl();

  return (
    <div className="space-y-6">
      <AdminQueryFeedbackAlert
        successMessage={params.success === "1" ? "Pengaturan landing page berhasil disimpan." : null}
      />
      <section className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white md:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Landing Page</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Pengaturan Landing Page
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
          Atur slug halaman publik bisnis Anda. Untuk MVP, cukup pakai URL sederhana seperti
          <span className="font-medium text-white"> /landing_page/[slug]</span> dan
          <span className="font-medium text-white"> /b/[slug]</span> tanpa perlu subdomain dulu.
        </p>
      </section>
      <section className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8">
        <LandingPageForm initialLandingPage={landingPage} appUrl={appUrl} />
      </section>
    </div>
  );
}
