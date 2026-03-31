
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { tanggal?: string };
}) {
  const tanggal = searchParams?.tanggal;

  let query = supabase
    .from("bookings")
    .select("*")
    .order("id", { ascending: false });

  if (tanggal) {
    query = query.eq("tanggal", tanggal);
  }

  const { data } = await query;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">📊 Dashboard Booking</h1>

      {/* FILTER */}
      <form className="mb-4 flex gap-2">
        <input
          type="date"
          name="tanggal"
          defaultValue={tanggal}
          className="border p-2 rounded"
        />
        <button className="bg-blue-500 text-white px-4 rounded">
          Filter
        </button>
      </form>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">No</th>
              <th>No HP</th>
              <th>Layanan</th>
              <th>Tanggal</th>
              <th>Jam</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {data?.map((item, i) => (
              <tr key={item.id} className="border-t text-center">
                <td className="p-2">{i + 1}</td>
                <td>{item.sender}</td>
                <td>{item.layanan}</td>
                <td>{item.tanggal}</td>
                <td>{item.jam}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded text-white text-xs ${
                      item.status === "confirmed"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
