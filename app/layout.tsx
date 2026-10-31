import type { Metadata } from "next";
import "./globals.css";
import { MizanProvider } from "@/lib/mizan-context";

export const metadata: Metadata = {
  title: "MIZAN - Sistem Penilaian Sikap & Perilaku Santri",
  description: "Sistem Penilaian Sikap & Perilaku Santri Pondok Pesantren Modern Raudhatussalam Mahato."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#F5F1E8] text-[#1C2826] font-sans antialiased selection:bg-[#C5A059]/30">
        <MizanProvider>{children}</MizanProvider>
      </body>
    </html>
  );
}
