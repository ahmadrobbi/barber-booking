"use server";

import { getIndustryConfig as getConfigFromDb, saveIndustryConfig as saveConfigToDb } from "@/lib/industry-config";
import type { IndustryConfig } from "@/lib/industry-config";

/**
 * Server action to fetch industry configuration
 */
export async function fetchIndustryConfig(): Promise<IndustryConfig> {
  try {
    return await getConfigFromDb();
  } catch (error) {
    console.error("Error fetching industry config:", error);
    throw new Error("Failed to fetch industry configuration");
  }
}

/**
 * Server action to save industry configuration
 */
export async function saveIndustryConfigAction(config: IndustryConfig): Promise<void> {
  try {
    await saveConfigToDb(config);
  } catch (error) {
    console.error("Error saving industry config:", error);
    throw new Error("Failed to save industry configuration");
  }
}
