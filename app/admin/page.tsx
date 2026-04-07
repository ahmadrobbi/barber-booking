import { logoutUser } from "@/app/actions/auth";
import { requireSession } from "@/lib/auth";
import { createAdminSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
const supabase = createAdminSupabase();

type BookingRow = {
  id: number;
  sender: string | null;
  layanan: string | null;
  harga: number | null;
  jam: string | null;
  status: string | null;
  tanggal: string | null;
};

// ✅ grouping by tanggal (tanpa parsing aneh)
function groupByDate(data: BookingRow[]) {
  const map: Record<string, BookingRow[]> = {};

  for (const item of data) {
    if (!item.tanggal) continue;

    const key = item.tanggal; // 🔥 langsung pakai dari DB

    if (!map[key]) map[key] = [];
    map[key].push(item);
  }
    
  return map;
}

export default async function AdminPage() {
  const session = await requireSession();

  // ✅ ambil data + sort langsung dari DB
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .not("tanggal", "is", null)
    .order("tanggal", { ascending: false }) // 🔥 penting
    .order("jam", { ascending: true }); // optional (biar jam urut)

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const safeData = data || [];

  const grouped = groupByDate(safeData);

  // ✅ sorting tanggal DESC (latest di atas)
  const groupedEntries = Object.entries(grouped).sort(
    ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
  );

  const total = safeData.length;
  const confirmed = safeData.filter(
    (x) => x.status === "confirmed"
  ).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-900">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Login sebagai</p>
          <p className="text-lg font-semibold text-gray-900">{session.name}</p>
          <p className="text-sm text-gray-500">{session.email}</p>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">
            Dashboard Booking
          </h1>
          <form action={logoutUser}>
            <button
              type="submit"
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow border">
          <p className="text-sm text-gray-600">Total Booking</p>
          <h2 className="text-2xl font-bold">{total}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border">
          <p className="text-sm text-gray-600">Confirmed</p>
          <h2 className="text-2xl font-bold text-green-600">
            {confirmed}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border">
          <p className="text-sm text-gray-600">Pending</p>
          <h2 className="text-2xl font-bold text-yellow-500">
            {total - confirmed}
          </h2>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groupedEntries.map(([date, bookings]) => (
          <div
            key={date}
            className="bg-white rounded-2xl shadow p-4 border"
          >
            <div className="flex justify-between mb-3">
              <h2 className="font-bold">{date}</h2>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                {bookings.length} booking
              </span>
            </div>

            <div className="space-y-2">
              {bookings.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between bg-gray-50 p-2 rounded"
                >
                  <div>
                    <p className="font-medium">
                      {item.layanan}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.sender}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {item.jam}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        item.status === "confirmed"
                          ? "bg-green-500 text-white"
                          : "bg-yellow-500 text-black"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
