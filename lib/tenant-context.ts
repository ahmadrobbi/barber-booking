import { createAdminSupabase } from "@/lib/supabase";
import { getServicesForUser, getSlotsForIndustry, type BookingService, type IndustryKey } from "@/lib/bookings";
import { INDUSTRIES } from "@/lib/industries";
import { getDefaultWhatsappChannelByUserId } from "@/lib/whatsapp-channels";

export type TenantService = BookingService;

export type PublicTenantContext = {
  userId: string;
  slug: string;
  businessName: string;
  industry: IndustryKey;
  channelId: string | null;
  services: TenantService[];
  slots: string[];
};

type LandingPageRow = {
  user_id: string;
  subdomain: string | null;
  is_active: boolean | null;
};

type ProfileRow = {
  business_name: string | null;
};

type UserRow = {
  industry: string | null;
};

function isIndustryKey(value: string | null | undefined): value is IndustryKey {
  return Boolean(value && Object.prototype.hasOwnProperty.call(INDUSTRIES, value));
}

export function normalizeTenantSlug(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
}

async function getLandingPageBySlug(slug: string): Promise<LandingPageRow | null> {
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("user_landing_pages")
      .select("user_id, subdomain, is_active")
      .ilike("subdomain", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      throw new Error(error.message);
    }

    return (data as LandingPageRow | null) ?? null;
  } catch (error) {
    console.warn("Failed to load landing page by slug:", error);
    return null;
  }
}

async function getUserIndustry(userId: string): Promise<IndustryKey> {
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("dashboard_users")
      .select("industry")
      .eq("id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      throw new Error(error.message);
    }

    const industry = (data as UserRow | null)?.industry;
    return isIndustryKey(industry) ? industry : "barbershop";
  } catch (error) {
    console.warn("Failed to load tenant industry:", error);
    return "barbershop";
  }
}

async function getBusinessNameByUserId(userId: string) {
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("business_name")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      throw new Error(error.message);
    }

    return (data as ProfileRow | null)?.business_name?.trim() || "Booking Barbershop";
  } catch (error) {
    console.warn("Failed to load tenant business name:", error);
    return "Booking Barbershop";
  }
}

export async function getPublicTenantContextBySlug(
  rawSlug: string | null | undefined
): Promise<PublicTenantContext | null> {
  const slug = normalizeTenantSlug(rawSlug);

  if (!slug) {
    return null;
  }

  const landingPage = await getLandingPageBySlug(slug);

  if (!landingPage?.user_id) {
    return null;
  }

  const [industry, businessName, channelId] = await Promise.all([
    getUserIndustry(landingPage.user_id),
    getBusinessNameByUserId(landingPage.user_id),
    getDefaultWhatsappChannelByUserId(landingPage.user_id).then((channel) => channel?.id ?? null),
  ]);
  const services = await getServicesForUser(landingPage.user_id, industry);

  return {
    userId: landingPage.user_id,
    slug,
    businessName,
    industry,
    channelId,
    services,
    slots: getSlotsForIndustry(industry),
  };
}
