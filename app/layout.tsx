import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookLink | WhatsApp Booking Assistant untuk UMKM",
  description:
    "BookLink membantu UMKM yang hidup dari jadwal untuk menerima booking lewat WhatsApp, menjawab FAQ dari data bisnis, menjaga slot tetap rapi, dan mengirim reminder otomatis tanpa pelanggan perlu install aplikasi baru.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">{children}</body>
    </html>
  );
}
