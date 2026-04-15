import { createAdminSupabase } from "./supabase";
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
 * Get list of all available industries
 */
export function getAvailableIndustries(): Array<{ key: IndustryKey; name: string }> {
  return Object.entries(INDUSTRIES).map(([key, data]) => ({
    key: key as IndustryKey,
    name: data.name,
  }));
}

/**
 * Get industry data with optional customization override
 */
export async function getIndustryData(industry: IndustryKey) {
  const config = await getIndustryConfig();
  const baseData = INDUSTRIES[industry];

  // Check if there's custom data in config
  if (
    config.customization &&
    config.customization[industry] &&
    config.customization[industry].services
  ) {
    return {
      ...baseData,
      services: config.customization[industry].services,
    };
  }

  return baseData;
}

/**
 * Check if industry is enabled
 */
export async function isIndustryEnabled(industry: IndustryKey): Promise<boolean> {
  const config = await getIndustryConfig();
  return config.enabled.includes(industry);
}
