import { AdminQueryFeedbackAlert } from "@/components/admin-query-feedback-alert";
import {
  deleteWhatsappChannel,
  saveWhatsappChannel,
} from "@/app/actions/whatsapp-channels";
import { requireAdmin } from "@/lib/auth";
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

export default async function WebhookOfficialSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireAdmin();
  const params = await searchParams;

  const appUrl = getAppUrl();
  const webhookUrl = `${appUrl}/api/webhook`;
  const channels = await getCurrentUserWhatsappChannels();
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
          Menu ini dipakai khusus untuk chatbot WhatsApp official. Endpoint yang dipakai sama, tetapi Meta
          akan melakukan verifikasi `hub.challenge` dan balasan chat keluar lewat access token official.
          Reminder tetap memakai Fonnte dulu.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-sm text-stone-500">Webhook URL dasar</p>
            <p className="mt-2 break-all rounded-xl bg-white px-4 py-3 font-mono text-sm text-stone-900">
              {webhookUrl}
            </p>
            <p className="mt-2 text-xs leading-6 text-stone-500">
              Untuk official callback, tambahkan `?phone_number_id=...` sesuai channel yang kamu simpan.
            </p>
          </div>

          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-sm text-stone-500">Reminder Endpoint</p>
            <p className="mt-2 break-all rounded-xl bg-white px-4 py-3 font-mono text-sm text-stone-900">
              {`${appUrl}/api/reminder`}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-[#fff8ef] p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Checklist</p>
        <div className="mt-5 space-y-4 text-sm leading-7 text-stone-700">
          <p>1. Pasang `Webhook URL` ini di dashboard Meta WhatsApp Cloud API.</p>
          <p>2. Isi `verify token` yang sama di dashboard Meta dan di field channel ini.</p>
          <p>3. Isi `phone number ID` dan `access token` official untuk bot chatbot.</p>
          <p>4. Tetap isi `Token Fonnte` karena reminder booking masih dikirim lewat Fonnte.</p>
          <p>5. Kalau ingin ubah template balasan chatbot, buka menu Fonnte lama untuk template override.</p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Channels</p>
            <h2 className="mt-3 text-2xl font-semibold">Nomor Chatbot Official</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-600">
              Channel official dipakai untuk inbound webhook Meta dan reply chatbot. Reminder tidak ikut pindah,
              jadi token Fonnte tetap wajib diisi.
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
              ? `${appUrl}/api/webhook?phone_number_id=${encodeURIComponent(channel.official_phone_number_id)}`
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
                      {channel.device_name || channel.official_phone_number_id || channel.device_number || "Channel baru"}
                    </h3>
                  </div>
                  {!isNew && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
                      <span className="rounded-full bg-sky-100 px-3 py-1 font-semibold text-sky-800">
                        {channel.chatbot_provider === "official" ? "Official" : "Fonnte"}
                      </span>
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

                  <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
                    <p className="text-stone-500">Official callback URL</p>
                    {officialWebhookUrl ? (
                      <p className="mt-2 break-all rounded-xl bg-stone-50 px-4 py-3 font-mono text-sm text-stone-900">
                        {officialWebhookUrl}
                      </p>
                    ) : (
                      <p className="mt-2 text-stone-600">
                        Simpan channel dulu untuk membuat callback URL unik untuk Meta.
                      </p>
                    )}
                  </div>

                <form action={saveWhatsappChannel} className="mt-5 space-y-5">
                  <input type="hidden" name="id" value={channel.id} />
                  <input type="hidden" name="chatbot_provider" value="official" />

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-stone-700">Nama channel</span>
                      <input
                        name="device_name"
                        type="text"
                        defaultValue={channel.device_name ?? ""}
                        placeholder="Contoh: WA Official Klinik"
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
                        placeholder="Tetap dipakai untuk reminder"
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
                        required
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
                      <span className="mb-2 block text-sm font-medium text-stone-700">Official phone number ID</span>
                      <input
                        name="official_phone_number_id"
                        type="text"
                        defaultValue={channel.official_phone_number_id ?? ""}
                        placeholder="Contoh: 123456789012345"
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
                        required={isNew}
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-medium text-stone-700">Official access token</span>
                      <input
                        name="official_access_token"
                        type="password"
                        defaultValue={channel.official_access_token ?? ""}
                        placeholder="Bearer token dari Meta"
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
                        required={isNew}
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-medium text-stone-700">Official verify token</span>
                      <input
                        name="official_verify_token"
                        type="text"
                        defaultValue={channel.official_verify_token ?? ""}
                        placeholder="Dipakai saat Meta verifikasi webhook"
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400"
                        required={isNew}
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
                        Simpan form ini untuk menambahkan official channel baru.
                      </div>
                    )}

                    <button
                      type="submit"
                      className="cursor-pointer rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-stone-800 hover:shadow-sm"
                    >
                      {isNew ? "Tambah Official Channel" : "Simpan Channel"}
                    </button>
                  </div>
                </form>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Next Step</p>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          Untuk ubah template balasan chatbot, buka menu{" "}
          <a className="font-semibold text-stone-900 underline" href="/admin/settings/webhook">
            Webhook Fonnte
          </a>{" "}
          lalu edit template override yang sudah ada.
        </p>
      </section>
    </div>
  );
}
