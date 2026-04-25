"use client";

import Link from "next/link";
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

type AdminShellProps = {
  businessName: string;
  userName: string;
  children: React.ReactNode;
};

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "DB"
  );
}

export function AdminShell({ businessName, userName, children }: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5efe7] text-stone-900 md:flex">
      <div className="hidden md:block">
        <DashboardSidebar businessName={businessName} userName={userName} />
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-sm md:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            className="absolute inset-0 cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-[84vw] max-w-sm overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#16110d] px-5 py-4 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-amber-200/70">Menu</p>
                <p className="mt-1 text-lg font-semibold">{businessName}</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg text-white transition hover:bg-white/10"
              >
                ×
              </button>
            </div>
            <DashboardSidebar
              businessName={businessName}
              userName={userName}
              className="min-h-full border-b-0 border-r-0"
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-stone-200 bg-white/80 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-4 md:flex-nowrap">
            <Link href="/admin" className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-sm font-black text-amber-300">
                {getInitials(businessName)}
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Internal Space</p>
                <p className="truncate text-lg font-semibold">{businessName}</p>
              </div>
            </Link>

            <div className="flex items-center justify-end gap-3 md:w-auto">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:shadow-sm md:hidden"
              >
                <span className="text-base leading-none">☰</span>
                Menu
              </button>

              <Link
                href="/admin/profile"
                className="hidden cursor-pointer rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:shadow-sm md:block"
              >
                <span className="block font-semibold">{userName}</span>
                <span className="block text-stone-500">Admin / Owner</span>
              </Link>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm md:hidden">
            <span className="block font-semibold">{userName}</span>
            <span className="block text-stone-500">Admin / Owner</span>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
