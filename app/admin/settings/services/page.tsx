import { requireAdmin } from "@/lib/auth";
import { getCurrentUserServices } from "@/lib/user-services";
import { UserServicesForm } from "@/components/user-services-form";

export const dynamic = "force-dynamic";

export default async function ServicesSettingsPage() {
  await requireAdmin();

  const services = await getCurrentUserServices();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white md:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Service Settings</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Katalog Layanan
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
          Kelola daftar layanan yang tampil di halaman booking publik dan chatbot WhatsApp bisnis Anda. Untuk MVP,
          durasi layanan sudah bisa disimpan agar siap dipakai di aturan jadwal berikutnya.
        </p>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8">
        <UserServicesForm initialServices={services} />
      </section>
    </div>
  );
}
