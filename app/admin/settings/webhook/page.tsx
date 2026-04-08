import { saveChatbotTemplates } from "@/app/actions/chatbot-settings";
import { requireAdmin } from "@/lib/auth";
import { getChatbotTemplates } from "@/lib/chatbot";

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

export default async function WebhookSettingsPage() {
  await requireAdmin();

  const appUrl = getAppUrl();
  const webhookUrl = `${appUrl}/api/webhook`;
  const reminderUrl = `${appUrl}/api/reminder`;
  const templates = await getChatbotTemplates();

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Setting</p>
        <h1 className="mt-3 text-3xl font-semibold">Webhook Fonnte</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
          Gunakan endpoint di bawah ini untuk menghubungkan pesan WhatsApp dari Fonnte ke sistem booking barbershop.
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

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-stone-200 bg-[#fff8ef] p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Checklist</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-stone-700">
            <p>1. Tempel <strong>Webhook URL</strong> di dashboard Fonnte pada pengaturan callback/webhook.</p>
            <p>2. Pastikan environment <strong>FONNTE_TOKEN</strong> sudah terpasang di deployment agar balasan WhatsApp tetap bisa dikirim.</p>
            <p>3. Jika domain berubah, halaman ini akan membantu kamu melihat endpoint baru yang harus dipasang ulang di Fonnte.</p>
            <p>4. Endpoint reminder bisa dipakai untuk pengecekan manual bila kamu ingin menguji pengiriman pengingat di luar cron.</p>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Status token saat render: <strong>{process.env.FONNTE_TOKEN ? "tersedia" : "belum terpasang"}</strong>
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

            <button
              type="submit"
              className="rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Simpan Template Chatbot
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
