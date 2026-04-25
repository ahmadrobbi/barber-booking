import { createAdminSupabase } from "@/lib/supabase";
import { getServicesForUser, getSlotsForIndustry, type BookingService, type IndustryKey } from "@/lib/bookings";
import { INDUSTRIES } from "@/lib/industries";
import { getDefaultWhatsappChannelByUserId } from "@/lib/whatsapp-channels";
import { getBranchesForUser, type UserBranch } from "@/lib/user-branches";

export type TenantService = BookingService;

export type PublicTenantContext = {
  userId: string;
  slug: string;
  businessName: string;
  industry: IndustryKey;
  channelId: string | null;
  branches: UserBranch[];
  services: TenantService[];
  slots: string[];
};

export type PublicLandingPageContext = {
  userId: string;
  slug: string;
  businessName: string;
  businessDescription: string;
  websiteUrl: string | null;
  logoUrl: string | null;
  instagram: string | null;
  facebook: string | null;
  whatsappNumber: string | null;
  branches: UserBranch[];
};

type LandingPageRow = {
  user_id: string;
  subdomain: string | null;
  is_active: boolean | null;
};

type ProfileRow = {
  business_name: string | null;
  business_description?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  social_media?: unknown;
};

type UserRow = {
  industry: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

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

async function getProfileByUserId(userId: string): Promise<ProfileRow | null> {
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("business_name, business_description, website_url, logo_url, social_media")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      throw new Error(error.message);
    }

    return (data as ProfileRow | null) ?? null;
  } catch (error) {
    console.warn("Failed to load tenant profile:", error);
    return null;
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

  const [industry, businessName, channelId, branches] = await Promise.all([
    getUserIndustry(landingPage.user_id),
    getBusinessNameByUserId(landingPage.user_id),
    getDefaultWhatsappChannelByUserId(landingPage.user_id).then((channel) => channel?.id ?? null),
    getBranchesForUser(landingPage.user_id, { activeOnly: true }),
  ]);
  const services = await getServicesForUser(landingPage.user_id, industry);

  return {
    userId: landingPage.user_id,
    slug,
    businessName,
    industry,
    channelId,
    branches,
    services,
    slots: getSlotsForIndustry(industry),
  };
}

export async function getPublicLandingPageContextBySlug(
  rawSlug: string | null | undefined
): Promise<PublicLandingPageContext | null> {
  const slug = normalizeTenantSlug(rawSlug);

  if (!slug) {
    return null;
  }

  const landingPage = await getLandingPageBySlug(slug);

  if (!landingPage?.user_id) {
    return null;
  }

  const [profile, defaultChannel, branches] = await Promise.all([
    getProfileByUserId(landingPage.user_id),
    getDefaultWhatsappChannelByUserId(landingPage.user_id),
    getBranchesForUser(landingPage.user_id, { activeOnly: true }),
  ]);

  const socialMedia = isRecord(profile?.social_media) ? profile?.social_media : {};

  return {
    userId: landingPage.user_id,
    slug,
    businessName: profile?.business_name?.trim() || "Booking Barbershop",
    businessDescription: profile?.business_description?.trim() || "Booking mudah langsung dari WhatsApp bisnis.",
    websiteUrl: typeof profile?.website_url === "string" && profile.website_url.trim()
      ? profile.website_url.trim()
      : null,
    logoUrl: typeof profile?.logo_url === "string" && profile.logo_url.trim()
      ? profile.logo_url.trim()
      : null,
    instagram:
      typeof socialMedia.instagram === "string" && socialMedia.instagram.trim()
        ? socialMedia.instagram.trim()
        : null,
    facebook:
      typeof socialMedia.facebook === "string" && socialMedia.facebook.trim()
        ? socialMedia.facebook.trim()
        : null,
    whatsappNumber: defaultChannel?.device_number ?? null,
    branches,
  };
}
