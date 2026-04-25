import { requireAdmin } from "@/lib/auth";
import { getCurrentUserBranches } from "@/lib/user-branches";
import { UserBranchesForm } from "@/components/user-branches-form";

export const dynamic = "force-dynamic";

export default async function BranchesSettingsPage() {
  await requireAdmin();

  const branches = await getCurrentUserBranches();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white md:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Branch Settings</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Cabang Outlet
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
          Kelola daftar cabang yang akan dipakai pada flow booking multi-outlet. Untuk MVP, layanan masih tetap
          sama di semua cabang, tetapi pelanggan nantinya bisa memilih outlet tujuan saat booking.
        </p>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8">
        <UserBranchesForm initialBranches={branches} />
      </section>
    </div>
  );
}
