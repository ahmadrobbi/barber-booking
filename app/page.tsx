export default function Home() {
  const phone = "6285852538431"; // ganti nomor barber

  const message = encodeURIComponent(
    "Halo 👋 saya mau booking cukur rambut"
  );

  const waLink = `https://wa.me/${phone}?text=${message}`;

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section className="text-center py-20 px-6">
        <h1 className="text-4xl font-bold mb-4">
          Cukur Rapi Tanpa Antri ✂️
        </h1>
        <p className="text-gray-400 mb-6">
          Booking dulu, datang langsung dilayani
        </p>

        <a href={waLink}>
          <button className="bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-xl font-semibold">
            Booking via WhatsApp
          </button>
        </a>
      </section>

      {/* HARGA */}
      <section className="bg-white text-black py-16 px-6 text-center">
        <h2 className="text-2xl font-bold mb-8">Harga</h2>

        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <div className="border p-4 rounded-xl">
            <h3 className="font-semibold text-lg">Dewasa</h3>
            <p className="text-gray-500">Rp25.000</p>
          </div>

          <div className="border p-4 rounded-xl">
            <h3 className="font-semibold text-lg">Anak-anak</h3>
            <p className="text-gray-500">Rp20.000</p>
          </div>
        </div>
      </section>

      {/* KEUNGGULAN */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-bold mb-8">
          Kenapa Pilih Kami?
        </h2>

        <div className="flex flex-col gap-4 max-w-md mx-auto text-gray-300">
          <p>✅ Tidak perlu antri lama</p>
          <p>✅ Bisa booking dari rumah</p>
          <p>✅ Pelayanan cepat & rapi</p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-20 px-6">
        <h2 className="text-2xl font-bold mb-4">
          Mau Cukur Sekarang?
        </h2>

        <a href={waLink}>
          <button className="bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-xl font-semibold">
            Booking Sekarang
          </button>
        </a>
      </section>

    </main>
  );
}