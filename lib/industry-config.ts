"use server";

import { createAdminSupabase } from "./supabase";
import { getSession } from "./auth";
import { INDUSTRIES, type IndustryKey } from "./industries";

export type { IndustryKey } from "./industries";

const INDUSTRY_CONFIG_KEY = "industry_config";

export type IndustryConfig = {
  enabled: IndustryKey[];
  default: IndustryKey;
  customization?: Record<
    IndustryKey,
    {
      templates?: Record<string, string>;
      services?: Array<{
        code: string;
        name: string;
        price: number;
        description: string;
      }>;
    }
  >;
};

/**
 * Get industry configuration from database or return default config
 */
export async function getIndustryConfig(): Promise<IndustryConfig> {
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("app_settings")
      .select("value_json")
      .eq("key", INDUSTRY_CONFIG_KEY)
      .maybeSingle();

    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      console.warn("Error fetching industry config:", error.message);
    }

    if (data && typeof data.value_json === "object" && data.value_json !== null) {
      return data.value_json as IndustryConfig;
    }
  } catch (err) {
    console.warn("Failed to fetch industry config from database:", err);
  }

  // Default config
  return {
    enabled: ["barbershop", "clinic"],
    default: "barbershop",
  };
}

/**
 * Save industry configuration to database
 */
export async function saveIndustryConfig(config: IndustryConfig): Promise<void> {
  try {
    const supabase = createAdminSupabase();
    await supabase.from("app_settings").upsert(
      {
        key: INDUSTRY_CONFIG_KEY,
        value_json: config,
      },
      { onConflict: "key" }
    );
  } catch (err) {
    console.error("Failed to save industry config:", err);
    throw err;
  }
}

/**
 * Get industry data with optional customization override
 */
export async function getIndustryData(industry: IndustryKey) {
  const config = await getIndustryConfig();
  const baseData = INDUSTRIES[industry];
  const industryCustomization = config.customization?.[industry];

  return {
    ...baseData,
    services: industryCustomization?.services ?? baseData.services,
    templates: industryCustomization?.templates
      ? { ...baseData.templates, ...industryCustomization.templates }
      : baseData.templates,
  };
}

/**
 * Check if industry is enabled
 */
export async function isIndustryEnabled(industry: IndustryKey): Promise<boolean> {
  const config = await getIndustryConfig();
  return config.enabled.includes(industry);
}

/**
 * Check if onboarding/setup is complete
 */
export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("app_settings")
      .select("value_json")
      .eq("key", "onboarding_complete")
      .maybeSingle();

    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      console.warn("Error checking onboarding status:", error.message);
      return false;
    }

    return data?.value_json === true;
  } catch (err) {
    console.warn("Failed to check onboarding status:", err);
    return false;
  }
}

/**
 * Mark onboarding as complete
 */
export async function completeOnboarding(): Promise<void> {
  try {
    const supabase = createAdminSupabase();
    await supabase.from("app_settings").upsert(
      {
        key: "onboarding_complete",
        value_json: true,
      },
      { onConflict: "key" }
    );
  } catch (err) {
    console.error("Failed to complete onboarding:", err);
    throw err;
  }
}

/**
 * Reset onboarding (for testing purposes)
 */
export async function resetOnboarding(): Promise<void> {
  try {
    const supabase = createAdminSupabase();
    await supabase.from("app_settings").delete().eq("key", "onboarding_complete");
    await supabase.from("app_settings").delete().eq("key", "business_name");
    await supabase.from("app_settings").delete().eq("key", "industry_config");
  } catch (err) {
    console.error("Failed to reset onboarding:", err);
    throw err;
  }
}

/**
 * Get business name from settings (for public pages)
 */
export async function getBusinessName(): Promise<string> {
  try {
    const supabase = createAdminSupabase();
    const { data } = await supabase
      .from("app_settings")
      .select("value_json")
      .eq("key", "business_name")
      .maybeSingle();

    return typeof data?.value_json === "string" ? data.value_json : "Booking Platform";
  } catch {
    return "Booking Platform";
  }
}

/**
 * Get current user's business name from their profile
 */
export async function getCurrentUserBusinessName(): Promise<string> {
  try {
    const session = await getSession();
    if (!session) return "Booking Platform";

    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("business_name")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (error) {
      console.warn("Error fetching user business name:", error.message);
      return "Dashboard";
    }

    return data?.business_name || "Dashboard";
  } catch (err) {
    console.warn("Failed to fetch user business name:", err);
    return "Dashboard";
  }
}
