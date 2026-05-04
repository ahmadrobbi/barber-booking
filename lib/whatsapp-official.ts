const DEFAULT_GRAPH_VERSION = "v25.0";

export type OfficialWhatsAppConfig = {
  accessToken: string | null;
  wabaId: string | null;
  verifyToken: string | null;
  graphVersion: string;
};

function normalizeDigits(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.replace(/[^\d]/g, "");
}

function getEnvValue(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return "";
}

export function getOfficialWhatsAppConfig(): OfficialWhatsAppConfig {
  return {
    accessToken: getEnvValue("WHATSAPP_OFFICIAL_ACCESS_TOKEN", "META_WHATSAPP_ACCESS_TOKEN"),
    wabaId: getEnvValue("WHATSAPP_OFFICIAL_WABA_ID", "META_WHATSAPP_WABA_ID"),
    verifyToken: getEnvValue("WHATSAPP_OFFICIAL_VERIFY_TOKEN", "META_WHATSAPP_VERIFY_TOKEN"),
    graphVersion: process.env.WHATSAPP_OFFICIAL_GRAPH_VERSION?.trim() || DEFAULT_GRAPH_VERSION,
  };
}

export function normalizeWhatsappBusinessNumber(value: string) {
  return normalizeDigits(value);
}

export async function resolveOfficialPhoneNumberIdByBusinessNumber(phoneNumber: string) {
  const config = getOfficialWhatsAppConfig();

  if (!config.accessToken || !config.wabaId) {
    throw new Error(
      "Credential official belum dikonfigurasi di backend. Isi WHATSAPP_OFFICIAL_ACCESS_TOKEN dan WHATSAPP_OFFICIAL_WABA_ID."
    );
  }

  const normalizedTarget = normalizeDigits(phoneNumber);

  if (!normalizedTarget) {
    throw new Error("Nomor WhatsApp bisnis tidak valid.");
  }

  const endpoint = new URL(
    `https://graph.facebook.com/${config.graphVersion}/${config.wabaId}/phone_numbers`
  );
  endpoint.searchParams.set("fields", "id,display_phone_number,verified_name");

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal mengambil daftar phone number official: ${response.status} ${errorText}`);
  }

  const payload = (await response.json()) as {
    data?: Array<{
      id?: string;
      display_phone_number?: string;
      verified_name?: string;
    }>;
  };

  const match = (payload.data ?? []).find((item) => {
    const normalizedDisplay = normalizeDigits(item.display_phone_number);
    return normalizedDisplay === normalizedTarget || normalizedDisplay.endsWith(normalizedTarget);
  });

  if (!match?.id) {
    throw new Error(
      "Nomor WA belum ditemukan di WhatsApp Business Account backend. Pastikan nomor sudah terdaftar di Meta."
    );
  }

  return {
    phoneNumberId: match.id,
    displayPhoneNumber: match.display_phone_number ?? phoneNumber,
    verifiedName: match.verified_name ?? null,
  };
}
