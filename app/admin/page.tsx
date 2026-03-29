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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Booking</h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th>No</th>
            <th>No HP</th>
            <th>Layanan</th>
            <th>Tanggal</th>
            <th>Jam</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((item, i) => (
            <tr key={item.id}>
              <td>{i + 1}</td>
              <td>{item.sender}</td>
              <td>{item.layanan}</td>
              <td>{item.tanggal}</td>
              <td>{item.jam}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}