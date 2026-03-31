export default function Home() {
  const phone = "6287749105273";

  const message = encodeURIComponent(
    "Halo 👋 saya mau booking cukur rambut"
  );

  const waLink = `https://wa.me/${phone}?text=${message}`;

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section className="text-center py-24 px-6 bg-gradient-to-b from-black to-gray-900">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Cukur Rapi Tanpa Antri ✂️
        </h1>
        <p className="text-gray-400 mb-8">
          Booking dulu, datang langsung dilayani
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <a href={waLink}>
            <button className="bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-xl font-semibold">
              Booking via WhatsApp
            </button>
          </a>

          <a href="/admin">
            <button className="border border-white px-6 py-3 rounded-xl">
              Login Admin
            </button>
          </a>
        </div>
      </section>

      {/* LAYANAN (CAROUSEL) */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-bold mb-8">Layanan Kami</h2>

        <div className="flex justify-center">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory max-w-5xl w-full pb-4">
            {[
              { name: "Fade Cut", price: "Rp30K" },
              { name: "Undercut", price: "Rp25K" },
              { name: "Hair Coloring", price: "Rp80K" },
              { name: "Kids Cut", price: "Rp20K" },
            ].map((item, i) => (
              <div
                key={i}
                className="snap-center min-w-[250px] bg-white text-black p-4 rounded-xl shadow flex-shrink-0"
              >
                <div className="h-32 bg-gray-200 rounded mb-3" />
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-500">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERI */}
      <section className="py-16 px-6 bg-gray-900 text-center">
        <h2 className="text-2xl font-bold mb-8">Hasil Cukur</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-700 rounded-xl" />
          ))}
        </div>
      </section>

      {/* VIDEO */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-bold mb-6">
          Lihat Proses Kami 🎥
        </h2>

        <div className="max-w-xl mx-auto">
          <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center">
            <span className="text-gray-400">(Video di sini)</span>
          </div>
        </div>
      </section>

      {/* TESTIMONI */}
      <section className="py-16 px-6 bg-gray-900 text-center">
        <h2 className="text-2xl font-bold mb-8">
          Apa Kata Pelanggan
        </h2>

        <div className="flex justify-center">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory max-w-5xl w-full pb-4">
            {[
              "Pelayanan cepat & hasil rapi 🔥",
              "Barber terbaik langganan saya!",
              "Gak perlu antri, enak banget 👍",
            ].map((text, i) => (
              <div
                key={i}
                className="snap-center min-w-[280px] bg-white text-black p-4 rounded-xl flex-shrink-0"
              >
                <p className="text-sm">⭐️⭐️⭐️⭐️⭐️</p>
                <p className="mt-2">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-20 px-6">
        <h2 className="text-3xl font-bold mb-4">
          Mau Cukur Sekarang?
        </h2>

        <p className="text-gray-400 mb-6">
          Klik tombol di bawah dan langsung booking
        </p>

        <a href={waLink}>
          <button className="bg-green-500 hover:bg-green-600 text-black px-8 py-4 rounded-xl font-semibold text-lg">
            Booking Sekarang
          </button>
        </a>
      </section>

    </main>
  );
}