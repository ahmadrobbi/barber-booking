import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { isOnboardingComplete, getCurrentUserBusinessName } from "@/lib/industry-config";

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

  // Get current user's business name for branding
  const businessName = await getCurrentUserBusinessName();

  return (
    <AdminShell businessName={businessName} userName={user.name}>
      {children}
    </AdminShell>
  );
}
