"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-white/10 bg-[#16110d] text-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-base font-black text-stone-950">
            BB
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-amber-200/70">
              Dashboard
            </p>
            <h2 className="text-lg font-semibold">Barokah Barbershop</h2>
          </div>
        </div>
      </div>

      <div className="px-3 py-5">
        <div>
          <p className="px-3 text-xs uppercase tracking-[0.28em] text-white/35">
            Menu
          </p>

          <nav className="mt-4 space-y-2">
            <Link
              href="/admin"
              className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                pathname === "/admin"
                  ? "bg-amber-300 text-stone-950"
                  : "text-white/75 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${pathname === "/admin" ? "bg-stone-950/10" : "bg-white/5"}`}>
                DB
              </span>
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link
              href="/admin/bookings"
              className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                pathname === "/admin/bookings"
                  ? "bg-amber-300 text-stone-950"
                  : "text-white/75 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${
                  pathname === "/admin/bookings" ? "bg-stone-950/10" : "bg-white/5"
                }`}
              >
                BK
              </span>
              <span className="font-medium">Daftar Booking</span>
            </Link>
          </nav>
        </div>

        <div className="mt-8">
          <p className="px-3 text-xs uppercase tracking-[0.28em] text-white/35">
            Setting
          </p>

          <nav className="mt-4 space-y-2">
            <Link
              href="/admin/settings/webhook"
              className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                pathname === "/admin/settings/webhook"
                  ? "bg-amber-300 text-stone-950"
                  : "text-white/75 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${
                  pathname === "/admin/settings/webhook" ? "bg-stone-950/10" : "bg-white/5"
                }`}
              >
                FN
              </span>
              <span className="font-medium">Webhook Fonnte</span>
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}
