import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MizanProvider } from "@/lib/mizan-context";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const viewport: Viewport = {
  themeColor: "#1B4D3E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export const metadata: Metadata = {
  title: "MIZAN - Sistem Penilaian Sikap & Absensi Sholat",
  description: "Sistem Penilaian Sikap & Perilaku Santri Pondok Pesantren Modern Raudhatussalam Mahato.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MIZAN"
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" }
    ],
    apple: "/icons/apple-touch-icon.png"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MIZAN" />
      </head>
      <body className="min-h-screen bg-[#F5F1E8] text-[#1C2826] font-sans antialiased selection:bg-[#C5A059]/30">
        <MizanProvider>
          <ServiceWorkerRegister />
          {children}
        </MizanProvider>
      </body>
    </html>
  );
}
