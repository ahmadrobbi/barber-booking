import Link from "next/link";
import type { UserBranch } from "@/lib/user-branches";

const monthOptions = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
] as const;

type AdminBookingFiltersProps = {
  availableYears: readonly number[];
  branches?: readonly UserBranch[];
  path: string;
  selectedBranchId?: string | null;
  selectedMonth: number;
  selectedYear: number;
};

export function AdminBookingFilters({
  availableYears,
  branches = [],
  path,
  selectedBranchId = null,
  selectedMonth,
  selectedYear,
}: AdminBookingFiltersProps) {
  return (
    <form className="grid gap-3 rounded-[1.5rem] bg-stone-50 p-4 xl:grid-cols-[1fr_1fr_1fr_auto]">
      <label className="text-sm">
        <span className="mb-2 block text-stone-500">Bulan</span>
        <select
          name="month"
          defaultValue={selectedMonth.toString()}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 [color-scheme:light] outline-none transition focus:border-amber-400"
        >
          {monthOptions.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        <span className="mb-2 block text-stone-500">Tahun</span>
        <select
          name="year"
          defaultValue={selectedYear.toString()}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 [color-scheme:light] outline-none transition focus:border-amber-400"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        <span className="mb-2 block text-stone-500">Cabang</span>
        <select
          name="branch"
          defaultValue={selectedBranchId ?? ""}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 [color-scheme:light] outline-none transition focus:border-amber-400"
        >
          <option value="">Semua cabang</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-2 sm:items-end">
        <button
          type="submit"
          className="cursor-pointer rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-stone-800 hover:shadow-sm"
        >
          Terapkan
        </button>
        <Link
          href={path}
          className="cursor-pointer rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-600 transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:shadow-sm"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
