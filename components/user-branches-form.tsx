"use client";

import { useActionState, useMemo, useState } from "react";
import { saveUserBranches } from "@/app/actions/user-branches";
import type { UserBranch } from "@/lib/user-branches";
import { normalizeBusinessHours, WEEKDAY_KEYS } from "@/lib/scheduling";

type UserBranchesFormProps = {
  initialBranches: UserBranch[];
};

const weekdayLabels: Record<string, string> = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu",
};

function createEmptyBranch(): UserBranch {
  return {
    name: "",
    code: "",
    address: "",
    phone: "",
    is_active: true,
    business_hours: normalizeBusinessHours(null),
  };
}

export function UserBranchesForm({ initialBranches }: UserBranchesFormProps) {
  const [state, formAction] = useActionState(saveUserBranches, {
    message: "",
    success: false,
  });
  const [branches, setBranches] = useState<UserBranch[]>(
    initialBranches.length > 0 ? initialBranches : [createEmptyBranch()]
  );

  const serializedBranches = useMemo(
    () => JSON.stringify(branches),
    [branches]
  );

  function updateBranch(index: number, next: Partial<UserBranch>) {
    setBranches((current) =>
      current.map((branch, branchIndex) =>
        branchIndex === index ? { ...branch, ...next } : branch
      )
    );
  }

  function updateBranchHour(
    branchIndex: number,
    day: keyof UserBranch["business_hours"],
    next: Partial<UserBranch["business_hours"][typeof day]>
  ) {
    setBranches((current) =>
      current.map((branch, index) => {
        if (index !== branchIndex) {
          return branch;
        }

        return {
          ...branch,
          business_hours: {
            ...branch.business_hours,
            [day]: {
              ...branch.business_hours[day],
              ...next,
            },
          },
        };
      })
    );
  }

  function addBranch() {
    setBranches((current) => [...current, createEmptyBranch()]);
  }

  function removeBranch(index: number) {
    setBranches((current) => current.filter((_, branchIndex) => branchIndex !== index));
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="branches_json" value={serializedBranches} />

      <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5 text-sm leading-7 text-stone-600">
        Tambahkan cabang yang akan dipakai pada flow booking multi-outlet. Untuk MVP saat ini, layanan masih tetap
        global per bisnis, tetapi setiap booking nantinya bisa diarahkan ke cabang yang dipilih pelanggan.
        Jam operasional yang Anda isi di tiap cabang akan diprioritaskan saat chatbot menampilkan pilihan
        tanggal dan jam. Jika sebuah cabang belum diatur, sistem akan fallback ke jam operasional default
        bisnis di menu Profile.
      </div>

      <div className="space-y-4">
        {branches.map((branch, index) => (
          <div
            key={branch.id ?? `new-${index}`}
            className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Cabang {index + 1}</p>
                <h3 className="mt-1 text-lg font-semibold text-stone-900">
                  {branch.name || "Cabang baru"}
                </h3>
              </div>
              {branches.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeBranch(index)}
                  className="cursor-pointer rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100"
                >
                  Hapus
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">Nama cabang</span>
                <input
                  type="text"
                  value={branch.name}
                  onChange={(event) => updateBranch(index, { name: event.target.value })}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                  placeholder="Contoh: Cabang Tebet"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">Kode cabang</span>
                <input
                  type="text"
                  value={branch.code}
                  onChange={(event) => updateBranch(index, { code: event.target.value })}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                  placeholder="contoh: tebet"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-stone-700">Alamat</span>
                <textarea
                  rows={2}
                  value={branch.address}
                  onChange={(event) => updateBranch(index, { address: event.target.value })}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                  placeholder="Alamat cabang"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-700">Telepon cabang</span>
                <input
                  type="text"
                  value={branch.phone}
                  onChange={(event) => updateBranch(index, { phone: event.target.value })}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                  placeholder="Nomor telepon cabang"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800">
                <input
                  type="checkbox"
                  checked={branch.is_active}
                  onChange={(event) => updateBranch(index, { is_active: event.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                />
                Cabang aktif
              </label>
            </div>

            <div className="mt-5">
              <div>
                <p className="text-sm font-medium text-stone-800">Jam operasional cabang</p>
                <p className="mt-1 text-sm leading-6 text-stone-500">
                  Pengaturan ini khusus untuk cabang ini dan akan mengoverride jam operasional default bisnis.
                </p>
              </div>
              <div className="mt-3 space-y-3">
                {WEEKDAY_KEYS.map((day) => {
                  const value = branch.business_hours[day];

                  return (
                    <div
                      key={`${branch.id ?? index}-${day}`}
                      className="grid gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 md:grid-cols-[1.2fr_0.8fr_0.8fr]"
                    >
                      <label className="flex items-center gap-3 text-sm font-medium text-stone-800">
                        <input
                          type="checkbox"
                          checked={value.enabled}
                          onChange={(event) =>
                            updateBranchHour(index, day, { enabled: event.target.checked })
                          }
                          className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                        />
                        {weekdayLabels[day]}
                      </label>

                      <label className="block text-sm font-medium text-stone-700">
                        Buka
                        <input
                          type="time"
                          value={value.open}
                          onChange={(event) =>
                            updateBranchHour(index, day, { open: event.target.value })
                          }
                          className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-300 focus:bg-white"
                        />
                      </label>

                      <label className="block text-sm font-medium text-stone-700">
                        Tutup
                        <input
                          type="time"
                          value={value.close}
                          onChange={(event) =>
                            updateBranchHour(index, day, { close: event.target.value })
                          }
                          className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-300 focus:bg-white"
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:justify-between">
        <button
          type="button"
          onClick={addBranch}
          className="cursor-pointer rounded-2xl border border-stone-200 bg-stone-50 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:-translate-y-0.5 hover:bg-stone-100 hover:shadow-sm"
        >
          Tambah Cabang
        </button>

        <button
          type="submit"
          className="cursor-pointer rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-stone-800 hover:shadow-sm"
        >
          Simpan Cabang
        </button>
      </div>

      {state.message ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            state.success
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}
    </form>
  );
}
