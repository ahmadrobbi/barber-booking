import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RegistrationWizard } from "@/components/registration-wizard";

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-center">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-3 text-base font-semibold text-blue-600 transition hover:text-blue-700 md:text-lg"
          >
            <span aria-hidden="true" className="text-lg md:text-xl">←</span>
            <span>Kembali ke Home</span>
          </Link>
          <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight md:text-6xl text-slate-900">
            Jalankan Booking Barbershop dari Nomor WhatsApp Anda Sendiri
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
            Daftar, sambungkan nomor WhatsApp bisnis, lalu mulai terima booking publik dengan reminder otomatis. Fokus MVP kami saat ini untuk barbershop.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="text-green-500">✓</span>
              Nomor WA milik bisnis sendiri
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="text-green-500">✓</span>
              Setup singkat tanpa coding
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="text-green-500">✓</span>
              Booking link publik + reminder WA
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-medium">Mulai Gratis</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Buat Akun Baru</h2>
          <p className="mt-2 text-sm text-slate-600">
            Isi data barbershop Anda dan selesaikan onboarding inti dalam 4 langkah.
          </p>
          <div className="mt-8">
            <RegistrationWizard />
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Login di sini
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
