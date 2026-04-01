import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// 🔥 normalize tanggal (handle format text kacau)
function normalizeDate(date: string) {
  try {
    return new Date(date).toISOString().split("T")[0];
  } catch {
    return null;
  }
}

// 🔥 grouping aman
function groupByDate(data: any[]) {
  const map: Record<string, any[]> = {};

  data.forEach((item) => {
    if (!item.tanggal) return;

    const normalized = normalizeDate(item.tanggal);
    if (!normalized) return;

    if (!map[normalized]) map[normalized] = [];
    map[normalized].push(item);
  });

  return map;
}

export default async function AdminPage() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .not("tanggal", "is", null); // 🔥 skip null

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const grouped = groupByDate(data || []);

  // 🔥 sorting tanggal biar urut
  const groupedEntries = Object.entries(grouped).sort(
    ([a], [b]) =>
      new Date(a).getTime() - new Date(b).getTime()
  );

  const total = data?.length || 0;
  const confirmed =
    data?.filter((x) => x.status === "confirmed").length || 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-900">
      <h1 className="text-3xl font-bold mb-6">
        📊 Dashboard Booking
      </h1>

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
              {bookings.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between bg-gray-50 p-2 rounded"
                >
                  <div>
                    <p className="font-medium">{item.layanan}</p>
                    <p className="text-xs text-gray-500">
                      {item.sender}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">{item.jam}</p>
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