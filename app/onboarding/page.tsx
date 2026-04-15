import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isOnboardingComplete } from "@/lib/industry-config";
import OnboardingClient from "./onboarding-client";

export default async function OnboardingPage() {
  // Check if user is logged in
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Check if onboarding is already complete
  const onboardingComplete = await isOnboardingComplete();
  if (onboardingComplete) {
    redirect("/admin");
  }

  return <OnboardingClient />;
}