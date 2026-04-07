import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { loginUser } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_32%),linear-gradient(180deg,_#1c1917,_#09090b)] px-6 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-center">
          <Link href="/" className="w-fit text-sm uppercase tracking-[0.28em] text-amber-300/80">
            Barokah Barbershop
          </Link>
          <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight md:text-6xl">
            Login dashboard untuk pantau booking barber secara real-time.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
            Masuk dengan akun admin yang sudah terdaftar untuk melihat booking WhatsApp yang sudah masuk ke Supabase.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Dashboard Access</p>
          <h2 className="mt-3 text-3xl font-semibold">Login</h2>
          <p className="mt-2 text-sm text-white/60">
            Gunakan email dan password yang sudah terdaftar.
          </p>
          <div className="mt-8">
            <AuthForm action={loginUser} mode="login" />
          </div>
        </section>
      </div>
    </main>
  );
}
