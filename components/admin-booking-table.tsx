import {
  cancelBooking,
  completeBooking,
  confirmPendingBooking,
} from "@/app/actions/admin-booking";
import { BookingRow, formatBookingDate, formatPrice } from "@/lib/dashboard";
import { BookingActionButton } from "@/components/booking-action-button";

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
            <th className="px-5 py-4 font-medium">Pemesan</th>
            <th className="px-5 py-4 font-medium">Layanan</th>
            <th className="px-5 py-4 font-medium">WhatsApp</th>
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
              <td className="px-5 py-4 text-stone-700">{item.customer_name ?? "-"}</td>
              <td className="px-5 py-4">
                <p className="font-semibold text-stone-900">{item.layanan ?? "-"}</p>
              </td>
              <td className="px-5 py-4 text-stone-600">{item.sender ?? "-"}</td>
              <td className="px-5 py-4 text-stone-700">{formatPrice(item.harga)}</td>
              <td className="px-5 py-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusBadgeClass(item.status)}`}
                >
                  {item.status ?? "-"}
                </span>
              </td>
              <td className="px-5 py-4 text-right">
                {item.status === "pending" ? (
                  <div className="flex flex-wrap justify-end gap-2">
                    <form action={confirmPendingBooking.bind(null, item.id)}>
                      <BookingActionButton
                        idleLabel="Konfirmasi"
                        pendingLabel="Memproses..."
                        tone="success"
                      />
                    </form>
                    <form action={cancelBooking.bind(null, item.id)}>
                      <BookingActionButton
                        idleLabel="Batalkan"
                        pendingLabel="Membatalkan..."
                        tone="danger"
                      />
                    </form>
                  </div>
                ) : item.status === "confirmed" ? (
                  <div className="flex flex-wrap justify-end gap-2">
                    <form action={completeBooking.bind(null, item.id)}>
                      <BookingActionButton
                        idleLabel="Selesai"
                        pendingLabel="Menyimpan..."
                        tone="neutral"
                      />
                    </form>
                    <form action={cancelBooking.bind(null, item.id)}>
                      <BookingActionButton
                        idleLabel="Batalkan"
                        pendingLabel="Membatalkan..."
                        tone="danger"
                      />
                    </form>
                  </div>
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

function getStatusBadgeClass(status: string | null) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-100 text-emerald-700";
    case "completed":
      return "bg-sky-100 text-sky-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "pending":
    default:
      return "bg-amber-100 text-amber-700";
  }
}
