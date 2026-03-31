import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export default async function AdminPage() {
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .order("id", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">📊 Dashboard Booking</h1>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="p-3">No</th>
              <th className="p-3">No HP</th>
              <th className="p-3">Layanan</th>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Jam</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {data?.map((item, i) => (
              <tr
                key={item.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{item.sender}</td>
                <td className="p-3">{item.layanan}</td>
                <td className="p-3">{item.tanggal}</td>
                <td className="p-3">{item.jam}</td>
                <td className="p-3">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
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