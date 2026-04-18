"use client";

import { useActionState } from "react";
import { assignBookingsToUser } from "@/app/actions/assign-bookings";
import type { BookingRow } from "@/lib/dashboard";

type AssignBookingsFormProps = {
  bookings: BookingRow[];
};

export function AssignBookingsForm({ bookings }: AssignBookingsFormProps) {
  const [state, action] = useActionState(assignBookingsToUser, { message: "" });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  return (
    <form action={action} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Booking yang Belum Di-Assign</h3>
        <p className="text-sm text-stone-600 mb-6">
          Pilih booking yang ingin di-assign dan tentukan user yang akan mengelolanya.
        </p>

        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="flex items-center space-x-4 p-4 border border-stone-200 rounded-xl">
              <input
                type="checkbox"
                id={`booking-${booking.id}`}
                name="booking_ids"
                value={booking.id}
                className="h-4 w-4 text-amber-400 focus:ring-amber-300 border-stone-300 rounded"
              />

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-stone-900">{booking.sender}</p>
                    <p className="text-sm text-stone-600">{booking.layanan}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-stone-900">{formatCurrency(booking.harga || 0)}</p>
                    <p className="text-sm text-stone-600">{booking.status}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm text-stone-500">
                  <span>📅 {formatDate(booking.tanggal || "")}</span>
                  <span>🕐 {formatTime(booking.jam || "")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="user_email" className="block text-sm font-medium text-stone-700 mb-2">
          Email User yang Akan Mengelola Booking
        </label>
        <input
          id="user_email"
          name="user_email"
          type="email"
          placeholder="user@email.com"
          required
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:bg-white md:max-w-md"
        />
        <p className="text-xs text-stone-500 mt-1">
          Masukkan email user yang sudah terdaftar di sistem
        </p>
      </div>

      {/* Error Message */}
      {state?.message && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={bookings.length === 0}
          className="rounded-xl bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Assign Booking ke User
        </button>
      </div>
    </form>
  );
}