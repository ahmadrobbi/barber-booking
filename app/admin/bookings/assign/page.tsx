import { getAllBookings } from "@/lib/dashboard";
import { requireAdmin } from "@/lib/auth";
import { AssignBookingsForm } from "@/components/assign-bookings-form";

export const dynamic = "force-dynamic";

export default async function AssignBookingsPage() {
  await requireAdmin();

  const bookings = await getAllBookings();
  const unassignedBookings = bookings.filter(booking => !booking.user_id);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white md:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Booking Management</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Assign Booking ke User
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
          Assign booking yang datang dari WhatsApp ke akun user tertentu agar muncul di dashboard mereka.
        </p>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8">
        {unassignedBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Semua booking sudah di-assign</h3>
            <p className="text-stone-600">Tidak ada booking yang belum di-assign ke user manapun.</p>
          </div>
        ) : (
          <AssignBookingsForm bookings={unassignedBookings} />
        )}
      </section>
    </div>
  );
}