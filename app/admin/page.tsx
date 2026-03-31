import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

function groupByDate(data: any[]) {
  const map: Record<string, any[]> = {};
  data.forEach((item) => {
    if (!map[item.tanggal]) map[item.tanggal] = [];
    map[item.tanggal].push(item);
  });
  return map;
}

export default async function AdminPage() {
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .order("tanggal", { ascending: true });

  const grouped = groupByDate(data || []);

  const total = data?.length || 0;
  const confirmed =
    data?.filter((x) => x.status === "confirmed").length || 0;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6">📊 Dashboard Booking</h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Booking</p>
          <h2 className="text-2xl font-bold">{total}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Confirmed</p>
          <h2 className="text-2xl font-bold text-green-600">
            {confirmed}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Pending</p>
          <h2 className="text-2xl font-bold text-yellow-500">
            {total - confirmed}
          </h2>
        </div>
      </div>

      {/* GRID PER TANGGAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(grouped).map(([date, bookings]) => (
          <div
            key={date}
            className="bg-white rounded-2xl shadow p-4 hover:shadow-lg transition"
          >
            {/* HEADER DATE */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg">{date}</h2>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                {bookings.length} booking
              </span>
            </div>

            {/* LIST BOOKING */}
            <div className="space-y-2 max-h-60 overflow-auto">
              {bookings.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {item.layanan}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.sender}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {item.jam}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded text-white ${
                        item.status === "confirmed"
                          ? "bg-green-500"
                          : "bg-yellow-500"
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