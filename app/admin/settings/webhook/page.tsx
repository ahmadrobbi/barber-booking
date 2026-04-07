import { requireAdmin } from "@/lib/auth";

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

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
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
    </div>
  );
}
