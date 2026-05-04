import { saveWhatsappChannel, deleteWhatsappChannel } from "@/app/actions/whatsapp-channels";
import { AdminQueryFeedbackAlert } from "@/components/admin-query-feedback-alert";
import { ConnectChannelButton } from "@/components/connect-channel-button";
import { requireAdmin } from "@/lib/auth";
import { getAvailableIndustries } from "@/lib/industries";
import { getCurrentUserWhatsappChannels, type WhatsappChannel } from "@/lib/whatsapp-channels";
import { getOfficialWhatsAppConfig } from "@/lib/whatsapp-official";

export const dynamic = "force-dynamic";

function getAppUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

function buildCallbackUrl(appUrl: string, phoneNumberId: string | null) {
  if (!phoneNumberId) {
    return `${appUrl}/api/webhook`;
  }

  return `${appUrl}/api/webhook?phone_number_id=${encodeURIComponent(phoneNumberId)}`;
}

export default async function WebhookOfficialSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireAdmin();
  const params = await searchParams;
  const appUrl = getAppUrl();
  const channels = await getCurrentUserWhatsappChannels();
  const officialConfig = getOfficialWhatsAppConfig();
  const industries = getAvailableIndustries();

  const emptyChannel: WhatsappChannel = {
    id: "",
    user_id: user.id,
    device_number: "",
    device_name: "",
    fonnte_device_token: "",
    webhook_secret: "",
    chatbot_provider: "official",
    official_phone_number_id: "",
    official_access_token: "",
    official_verify_token: "",
    industry: "barbershop",
    is_active: true,
    is_default: channels.length === 0,
    template_overrides: {},
    created_at: null,
    updated_at: null,
  };

  const channelForms = [...channels, emptyChannel];
  const callbackUrl = buildCallbackUrl(appUrl, null);

  return (
    <div className="grid gap-6">
      <AdminQueryFeedbackAlert
        successMessage={params.success ?? null}
        errorMessage={params.error ?? null}
      />

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Setting</p>
        <h1 className="mt-3 text-3xl font-semibold">Webhook WA API Official</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
          Cukup isi nomor WhatsApp bisnis. Backend akan mencari `phone_number_id`, menyiapkan verify token,
          dan memakai credential official yang sudah disimpan di server. User tidak perlu lihat access token.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-sm text-stone-500">Callback URL</p>
            <p className="mt-2 break-all rounded-xl bg-white px-4 py-3 font-mono text-sm text-stone-900">
              {callbackUrl}
            </p>
            <p className="mt-2 text-xs leading-6 text-stone-500">
              Setelah channel disimpan, URL per channel akan muncul otomatis dengan `phone_number_id`.
            </p>
          </div>

          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-sm text-stone-500">Backend Status</p>
            <p className="mt-2 text-sm leading-7 text-stone-700">
              {officialConfig.accessToken && officialConfig.wabaId && officialConfig.verifyToken
                ? "Backend official siap. User hanya perlu input nomor WA."
                : "Backend official belum lengkap. Set env WHATSAPP_OFFICIAL_ACCESS_TOKEN, WHATSAPP_OFFICIAL_WABA_ID, dan WHATSAPP_OFFICIAL_VERIFY_TOKEN."}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-[#fff8ef] p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Checklist</p>
        <div className="mt-5 space-y-4 text-sm leading-7 text-stone-700">
          <p>1. Masukkan nomor WhatsApp bisnis yang sudah terdaftar di Meta.</p>
          <p>2. Backend akan mencocokkan nomor itu dengan phone number yang tersedia di WABA server.</p>
          <p>3. Reminder tetap pakai Fonnte, jadi flow lama tidak terganggu.</p>
          <p>4. Template chatbot tetap diatur dari menu template, bukan dari form ini.</p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Channels</p>
            <h2 className="mt-3 text-2xl font-semibold">Nomor Chatbot Official</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-600">
              Form ini sengaja dibuat sesederhana mungkin. Input utamanya hanya nomor WA bisnis. Channel lama
              juga bisa dikonversi ke official dari halaman ini.
            </p>
          </div>
          <div className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
            Channel aktif: <strong>{channels.filter((item) => item.is_active).length}</strong> / {channels.length}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {channelForms.map((channel, index) => {
            const isNew = !channel.id;
            const officialWebhookUrl = channel.official_phone_number_id
              ? buildCallbackUrl(appUrl, channel.official_phone_number_id)
              : null;

            return (
              <div
                key={channel.id || "new-official-channel"}
                className="rounded-[1.75rem] border border-stone-200 bg-stone-50/60 p-5"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                      {isNew ? "Tambah Official Channel" : `Channel ${index + 1}`}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-stone-900">
                      {channel.device_name || channel.device_number || "Channel baru"}
                    </h3>
                  </div>
                  {!isNew && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
                      <span className={`rounded-full px-3 py-1 font-semibold ${
                        channel.chatbot_provider === "official"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-stone-200 text-stone-700"
                      }`}>
                        {channel.chatbot_provider === "official" ? "Official" : "Fonnte"}
                      </span>
                      {channel.is_default ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-900">
                          Default
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
                  <p className="text-stone-500">Official callback URL</p>
                  {officialWebhookUrl ? (
                    <p className="mt-2 break-all rounded-xl bg-stone-50 px-4 py-3 font-mono text-sm text-stone-900">
                      {officialWebhookUrl}
                    </p>
                  ) : (
                    <p className="mt-2 text-stone-600">
                      Simpan channel dulu agar backend bisa menampilkan callback URL unik.
                    </p>
                  )}
                </div>

                <form action={saveWhatsappChannel} className="mt-5 space-y-5">
                  <input type="hidden" name="id" value={channel.id} />
                  <input type="hidden" name="chatbot_provider" value="official" />
                  <input type="hidden" name="redirect_to" value="/admin/settings/webhook-official" />

                  <div className="grid gap-4">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-stone-700">Nomor WhatsApp bisnis</span>
                      <input
                        name="device_number"
                        type="text"
                        defaultValue={channel.device_number}
                        placeholder="6281234567890"
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
                        required
                      />
                    </label>
                  </div>

                  <details className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-stone-800">
                      Pengaturan lanjutan
                    </summary>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-stone-700">Nama channel opsional</span>
                        <input
                          name="device_name"
                          type="text"
                          defaultValue={channel.device_name ?? ""}
                          placeholder="Contoh: CS Official"
                          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-stone-700">Industry default</span>
                        <select
                          name="industry"
                          defaultValue={channel.industry ?? "barbershop"}
                          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
                        >
                          {industries.map((industry) => (
                            <option key={industry.key} value={industry.key}>
                              {industry.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
                        <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800">
                          <input
                            type="checkbox"
                            name="is_active"
                            defaultChecked={channel.is_active ?? true}
                            className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                          />
                          Channel aktif
                        </label>

                        <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800">
                          <input
                            type="checkbox"
                            name="is_default"
                            defaultChecked={channel.is_default ?? false}
                            className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                          />
                          Jadikan default channel user ini
                        </label>
                      </div>
                    </div>
                  </details>

                  <div className="flex flex-col gap-3 md:flex-row md:justify-between">
                    {!isNew ? (
                      <button
                        type="submit"
                        formAction={deleteWhatsappChannel}
                        className="cursor-pointer rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100 hover:shadow-sm"
                      >
                        Hapus Channel
                      </button>
                    ) : (
                      <div className="text-sm text-stone-500">
                        Simpan form ini untuk menambahkan channel official baru.
                      </div>
                    )}

                    <ConnectChannelButton
                      label={
                        isNew
                          ? "Hubungkan Nomor"
                          : channel.chatbot_provider === "official"
                            ? "Simpan Official"
                            : "Konversi ke Official"
                      }
                    />
                  </div>
                </form>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
