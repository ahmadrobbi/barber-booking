import { getUserLandingPage } from "@/lib/user";
import { requireAdmin } from "@/lib/auth";
import { AdminQueryFeedbackAlert } from "@/components/admin-query-feedback-alert";
import { LandingPageForm } from "@/components/landing-page-form";

export const dynamic = "force-dynamic";

export default async function LandingPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string }>;
}) {
  await requireAdmin();

  const landingPage = await getUserLandingPage();
  const params = (await searchParams) ?? {};
  const publicLandingPageHref = landingPage?.custom_domain
    ? `https://${landingPage.custom_domain}`
    : landingPage?.subdomain
    ? `/landing_page/${landingPage.subdomain}`
    : null;

  return (
    <div className="space-y-6">
      <AdminQueryFeedbackAlert
        successMessage={params.success === "1" ? "Pengaturan landing page berhasil disimpan." : null}
      />
      <section className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Landing Page</p>
            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
              Pengaturan Landing Page
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              Atur slug halaman publik bisnis Anda. Untuk MVP, cukup pakai URL sederhana seperti
              <span className="font-medium text-white"> /landing_page/[slug]</span> dan
              <span className="font-medium text-white"> /b/[slug]</span> tanpa perlu subdomain dulu.
            </p>
          </div>
          {publicLandingPageHref ? (
            <a
              href={publicLandingPageHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-3xl bg-amber-400 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
            >
              Lihat Halaman Publik
            </a>
          ) : null}
        </div>
      </section>
      <section className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8">
        <LandingPageForm initialLandingPage={landingPage} />
      </section>
    </div>
  );
}
