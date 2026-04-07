import Link from "next/link";
import { redirect } from "next/navigation";
import { registerUser } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { getSession } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.16),_transparent_28%),linear-gradient(180deg,_#0f172a,_#020617)] px-6 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-center">
          <Link href="/" className="w-fit text-sm uppercase tracking-[0.28em] text-amber-300/80">
            Barokah Barbershop
          </Link>
          <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight md:text-6xl">
            Buat akun admin baru untuk akses dashboard booking.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
            Setelah register berhasil, sistem akan langsung membuat session login dan mengarahkan ke dashboard.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Create Account</p>
          <h2 className="mt-3 text-3xl font-semibold">Register</h2>
          <p className="mt-2 text-sm text-white/60">
            Simpan akun admin baru langsung ke Supabase.
          </p>
          <div className="mt-8">
            <AuthForm action={registerUser} mode="register" />
          </div>
        </section>
      </div>
    </main>
  );
}
