import { saveChatbotTemplates } from "@/app/actions/chatbot-settings";
import { AdminQueryFeedbackAlert } from "@/components/admin-query-feedback-alert";
import {
  deleteWhatsappChannel,
  saveWhatsappChannel,
} from "@/app/actions/whatsapp-channels";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_CHATBOT_TEMPLATES, getChatbotTemplates } from "@/lib/chatbot";
import { getAvailableIndustries } from "@/lib/industries";
import { getCurrentUserWhatsappChannels, type WhatsappChannel } from "@/lib/whatsapp-channels";

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

export default async function WebhookSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireAdmin();
  const params = await searchParams;

  const appUrl = getAppUrl();
  const webhookUrl = `${appUrl}/api/webhook`;
  const reminderUrl = `${appUrl}/api/reminder`;
  const templates = await getChatbotTemplates();
  const channels = await getCurrentUserWhatsappChannels();
  const industries = getAvailableIndustries();
  const emptyChannel: WhatsappChannel = {
    id: "",
    user_id: user.id,
    device_number: "",
    device_name: "",
    fonnte_device_token: "",
    webhook_secret: "",
    chatbot_provider: "fonnte",
    official_phone_number_id: "",
    official_access_token: "",
    official_verify_token: "",
    official_message_template_name: "",
    official_message_template_language: "en_US",
    industry: "barbershop",
    is_active: true,
    is_default: channels.length === 0,
    template_overrides: {},
    created_at: null,
    updated_at: null,
  };

  const channelForms = [...channels, emptyChannel];

  return (
    <div className="grid gap-6">
      <AdminQueryFeedbackAlert
        successMessage={params.success ?? null}
        errorMessage={params.error ?? null}
      />
      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Setting</p>
        <h1 className="mt-3 text-3xl font-semibold">Webhook Fonnte</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
          Gunakan halaman ini untuk menghubungkan banyak device Fonnte ke akun user ini. Webhook tetap satu endpoint,
          lalu sistem akan merutekan pesan berdasarkan `device` yang dikirim Fonnte dan memverifikasi `webhook secret`
          bila secret diisi pada channel.
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-sm text-stone-500">Webhook URL</p>
            <p className="mt-2 break-all rounded-xl bg-white px-4 py-3 font-mono text-sm text-stone-900">
              {webhookUrl}
            </p>
          </div>

          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-sm text-stone-500">Reminder Endpoint</p>
            <p className="mt-2 break-all rounded-xl bg-white px-4 py-3 font-mono text-sm text-stone-900">
              {reminderUrl}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Channels</p>
            <h2 className="mt-3 text-2xl font-semibold">Nomor Bot Per User</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-600">
              Tiap channel mewakili satu device Fonnte. `Device number` harus sama dengan field `device`
              yang masuk di webhook Fonnte. Token per channel dipakai untuk balasan chat dan reminder.
            </p>
          </div>
          <div className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
            Channel aktif: <strong>{channels.filter((item) => item.is_active).length}</strong> / {channels.length}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {channelForms.map((channel, index) => {
            const isNew = !channel.id;
            const overrides = channel.template_overrides ?? {};

            return (
              <div
                key={channel.id || "new-channel"}
                className="rounded-[1.75rem] border border-stone-200 bg-stone-50/60 p-5"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                      {isNew ? "Tambah Channel" : `Channel ${index + 1}`}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-stone-900">
                      {channel.device_name || channel.device_number || "Channel baru"}
                    </h3>
                  </div>
                  {!isNew && (
                    <div className="flex items-center gap-2 text-xs text-stone-600">
                      {channel.is_default ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-900">
                          Default
                        </span>
                      ) : null}
                      {!channel.is_active ? (
                        <span className="rounded-full bg-stone-200 px-3 py-1 font-semibold text-stone-700">
                          Nonaktif
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>

                <form action={saveWhatsappChannel} className="mt-5 space-y-5">
                  <input type="hidden" name="id" value={channel.id} />

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-stone-700">Nama channel</span>
                      <input
                        name="device_name"
                        type="text"
                        defaultValue={channel.device_name ?? ""}
                        placeholder="Contoh: Bot Klinik Utama"
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-stone-700">Device number</span>
                      <input
                        name="device_number"
                        type="text"
                        defaultValue={channel.device_number}
                        placeholder="6281234567890"
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-stone-700">Token Fonnte</span>
                      <input
                        name="fonnte_device_token"
                        type="password"
                        defaultValue={channel.fonnte_device_token ?? ""}
                        placeholder="Token device dari Fonnte"
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
                        required={isNew}
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

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-medium text-stone-700">Webhook secret</span>
                      <input
                        name="webhook_secret"
                        type="text"
                        defaultValue={channel.webhook_secret ?? ""}
                        placeholder="Opsional, untuk validasi webhook per channel"
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800">
                      <input
                        type="checkbox"
                        name="is_active"
                        defaultChecked={channel.is_active ?? true}
                        className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                      />
                      Channel aktif
                    </label>

                    <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800">
                      <input
                        type="checkbox"
                        name="is_default"
                        defaultChecked={channel.is_default ?? false}
                        className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                      />
                      Jadikan default channel user ini
                    </label>
                  </div>

                  <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white p-4">
                    <p className="text-sm font-medium text-stone-900">Template override per channel</p>
                    <p className="mt-1 text-sm leading-6 text-stone-600">
                      Kosongkan field bila channel ini boleh mengikuti fallback global + default industry.
                    </p>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {Object.entries(DEFAULT_CHATBOT_TEMPLATES).map(([key, defaultValue]) => (
                        <label key={key} className="block">
                          <span className="mb-2 block text-sm font-medium capitalize text-stone-700">
                            {key}
                          </span>
                          <textarea
                            name={`template_${key}`}
                            defaultValue={overrides[key as keyof typeof overrides] ?? ""}
                            placeholder={defaultValue}
                            rows={key === "greeting" || key === "reminder" ? 5 : 3}
                            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

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
                        Simpan form ini untuk menambahkan channel baru.
                      </div>
                    )}

                    <button
                      type="submit"
                      className="cursor-pointer rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-stone-800 hover:shadow-sm"
                    >
                      {isNew ? "Tambah Channel" : "Simpan Channel"}
                    </button>
                  </div>
                </form>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-stone-200 bg-[#fff8ef] p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Checklist</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-stone-700">
            <p>1. Tempel <strong>Webhook URL</strong> di dashboard Fonnte pada pengaturan callback/webhook.</p>
            <p>2. Isi <strong>device number</strong>, <strong>token</strong>, dan bila perlu <strong>webhook secret</strong> untuk setiap nomor bot yang ingin dipakai user ini.</p>
            <p>3. Jika channel memiliki secret, kirim secret yang sama dari provider lewat header, query string, atau body webhook.</p>
            <p>4. Jika domain berubah, halaman ini akan membantu kamu melihat endpoint baru yang harus dipasang ulang di Fonnte.</p>
            <p>5. Endpoint reminder bisa dipakai untuk pengecekan manual bila kamu ingin menguji pengiriman pengingat di luar cron.</p>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Status token global saat render: <strong>{process.env.FONNTE_TOKEN ? "tersedia" : "belum terpasang"}</strong>. Untuk flow tenant-aware, balasan chat dan reminder sekarang mengandalkan token per channel.
          </div>
        </section>

        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Chatbot Flow</p>
          <h2 className="mt-3 text-2xl font-semibold">Template Chat WhatsApp</h2>
          <p className="mt-2 text-sm leading-7 text-stone-600">
            Kamu bisa ubah teks balasan chatbot dari sini. Placeholder yang tersedia:
            <strong> {"{{service_list}}"}</strong>, <strong>{"{{layanan}}"}</strong>,
            <strong> {"{{date_options}}"}</strong>, <strong>{"{{tanggal_label}}"}</strong>,
            <strong> {"{{slot_options}}"}</strong>, <strong>{"{{jam}}"}</strong>,
            <strong> {"{{harga}}"}</strong>, dan <strong>{"{{confirmation_summary}}"}</strong>.
            Template ini sekarang berfungsi sebagai fallback konten, bukan fallback routing channel.
          </p>

          <form action={saveChatbotTemplates} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Pesan pembuka</span>
              <textarea
                name="greeting"
                defaultValue={templates.greeting}
                rows={6}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Prompt pilih layanan</span>
              <textarea
                name="servicePrompt"
                defaultValue={templates.servicePrompt}
                rows={5}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Prompt pilih tanggal</span>
              <textarea
                name="datePrompt"
                defaultValue={templates.datePrompt}
                rows={5}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Prompt pilih jam</span>
              <textarea
                name="slotPrompt"
                defaultValue={templates.slotPrompt}
                rows={5}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Template konfirmasi</span>
              <textarea
                name="confirmationPrompt"
                defaultValue={templates.confirmationPrompt}
                rows={5}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Pesan sukses</span>
              <textarea
                name="successMessage"
                defaultValue={templates.successMessage}
                rows={5}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Pesan batal</span>
              <textarea
                name="cancelMessage"
                defaultValue={templates.cancelMessage}
                rows={3}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Pesan invalid</span>
              <textarea
                name="invalidOptionMessage"
                defaultValue={templates.invalidOptionMessage}
                rows={3}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Template reminder</span>
              <textarea
                name="reminder"
                defaultValue={templates.reminder}
                rows={5}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
              />
            </label>

            <button
              type="submit"
              className="cursor-pointer rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-stone-800 hover:shadow-sm"
            >
              Simpan Template Chatbot
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
