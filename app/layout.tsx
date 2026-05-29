import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookLink | AI Booking Assistant untuk Bisnis Booking",
  description:
    "Platform booking WhatsApp untuk bisnis yang menerima reservasi, jadwal, atau antrian seperti barbershop, klinik, salon, bengkel, laundry, dan toko berbasis booking. Gunakan nomor WhatsApp bisnis sendiri, buat landing page publik, dan kirim reminder otomatis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
