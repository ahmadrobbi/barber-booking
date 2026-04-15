import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutUser } from "@/app/actions/auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { requireAdmin } from "@/lib/auth";
import { isOnboardingComplete, getBusinessName } from "@/lib/industry-config";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireAdmin();

  // Check if onboarding is complete
  const onboardingComplete = await isOnboardingComplete();
  if (!onboardingComplete) {
    redirect("/onboarding");
  }

  // Get business name for branding
  const businessName = await getBusinessName();

  return (
    <div className="min-h-screen bg-[#f5efe7] text-stone-900 md:flex">
      <DashboardSidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-stone-200 bg-white/80 px-5 py-4 backdrop-blur md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-sm font-black text-amber-300">
                BB
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                  Internal Space
                </p>
                <p className="text-lg font-semibold">{businessName}</p>
              </div>
            </Link>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/admin/profile"
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm transition hover:border-amber-300 hover:bg-amber-50"
              >
                <span className="block font-semibold">{user.name}</span>
                <span className="block text-stone-500">Admin / Owner</span>
              </Link>

              <form action={logoutUser}>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 sm:w-auto"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
