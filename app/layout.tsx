import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookLink | Platform Booking WhatsApp untuk Semua Usaha",
  description:
    "Platform booking untuk barbershop, klinik, pijat, lapangan olahraga, dan usaha jasa lain. Gunakan nomor WhatsApp milik bisnis sendiri, buat landing page publik, dan kirim reminder otomatis.",
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
