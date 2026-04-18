"use server";

import { getIndustryConfig as getConfigFromDb, getBusinessName as getBusinessNameFromDb } from "@/lib/industry-config";
import type { IndustryConfig } from "@/lib/industry-config";

/**
 * Server action to fetch industry configuration and business name
 */
export async function fetchLandingPageConfig(): Promise<{
  config: IndustryConfig;
  businessName: string;
}> {
  try {
    const [config, businessName] = await Promise.all([
      getConfigFromDb(),
      getBusinessNameFromDb(),
    ]);
    return { config, businessName };
  } catch (error) {
    console.error("Error fetching landing page config:", error);
    return {
      config: { enabled: ["barbershop", "clinic"], default: "barbershop" },
      businessName: "Booking Platform",
    };
  }
}
