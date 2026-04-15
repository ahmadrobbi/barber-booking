import { NextRequest, NextResponse } from "next/server";
import { completeOnboarding, saveIndustryConfig, type IndustryKey, type IndustryConfig } from "@/lib/industry-config";
import { createAdminSupabase } from "@/lib/supabase";

type Service = {
  code: string;
  name: string;
  price: number;
  description: string;
};

type OnboardingData = {
  industry: IndustryKey;
  businessName: string;
  services: Service[];
};

export async function POST(request: NextRequest) {
  try {
    const data: OnboardingData = await request.json();

    // Validate required fields
    if (!data.industry || !data.businessName || !Array.isArray(data.services)) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Validate services
    if (data.services.length === 0) {
      return NextResponse.json(
        { error: "Minimal satu layanan harus ditambahkan" },
        { status: 400 }
      );
    }

    for (const service of data.services) {
      if (!service.code || !service.name || service.price <= 0) {
        return NextResponse.json(
          { error: "Semua layanan harus memiliki kode, nama, dan harga yang valid" },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminSupabase();

    // Save business name to app settings
    await supabase.from("app_settings").upsert(
      {
        key: "business_name",
        value_json: data.businessName,
      },
      { onConflict: "key" }
    );

    // Save industry config with custom services
    const industryConfig: IndustryConfig = {
      enabled: [data.industry],
      default: data.industry,
      customization: {
        [data.industry]: {
          services: data.services,
        },
      } as IndustryConfig["customization"],
    };

    await saveIndustryConfig(industryConfig);

    // Mark onboarding as complete
    await completeOnboarding();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan pengaturan" },
      { status: 500 }
    );
  }
}