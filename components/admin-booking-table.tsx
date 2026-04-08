import { confirmPendingBooking } from "@/app/actions/admin-booking";
import { BookingRow, formatBookingDate, formatPrice } from "@/lib/dashboard";
import { ConfirmBookingButton } from "@/components/confirm-booking-button";

type AdminBookingTableProps = {
  bookings: readonly BookingRow[];
};

export function AdminBookingTable({ bookings }: AdminBookingTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="bg-stone-50 px-5 py-10 text-center text-sm text-stone-500">
        Belum ada transaksi pada filter bulan dan tahun yang dipilih.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-stone-950 text-white">
          <tr>
            <th className="px-5 py-4 font-medium">Tanggal</th>
            <th className="px-5 py-4 font-medium">Jam</th>
            <th className="px-5 py-4 font-medium">Layanan</th>
            <th className="px-5 py-4 font-medium">Pengirim</th>
            <th className="px-5 py-4 font-medium">Harga</th>
            <th className="px-5 py-4 font-medium">Status</th>
            <th className="px-5 py-4 font-medium text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200 bg-white">
          {bookings.map((item) => (
            <tr key={item.id} className="align-top">
              <td className="px-5 py-4 text-stone-700">{formatBookingDate(item.tanggal)}</td>
              <td className="px-5 py-4 text-stone-700">{item.jam ?? "-"}</td>
              <td className="px-5 py-4">
                <p className="font-semibold text-stone-900">{item.layanan ?? "-"}</p>
              </td>
              <td className="px-5 py-4 text-stone-600">{item.sender ?? "-"}</td>
              <td className="px-5 py-4 text-stone-700">{formatPrice(item.harga)}</td>
              <td className="px-5 py-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                    item.status === "confirmed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {item.status ?? "-"}
                </span>
              </td>
              <td className="px-5 py-4 text-right">
                {item.status === "pending" ? (
                  <form action={confirmPendingBooking.bind(null, item.id)}>
                    <ConfirmBookingButton />
                  </form>
                ) : (
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
                    Sudah diproses
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
