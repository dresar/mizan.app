import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { MizanProvider } from "@/lib/mizan-context";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { FeedbackModal } from "@/components/FeedbackModal";
import { FeedbackButton } from "@/components/FeedbackButton";
import { TopProgressBar } from "@/components/TopProgressBar";
import { InitialSplash } from "@/components/InitialSplash";

export const viewport: Viewport = {
  themeColor: "#1B4D3E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export const metadata: Metadata = {
  title: "MIZAN - Sistem Penilaian Sikap & Absensi Sholat",
  description: "Sistem Penilaian Sikap & Perilaku Santri Pesantren Modern Raudhatussalam Mahato.",
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
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png?v=2" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png?v=2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MIZAN" />
      </head>
      <body className="min-h-screen bg-[#F5F1E8] text-[#1C2826] font-sans antialiased selection:bg-[#C5A059]/30" suppressHydrationWarning>
        <MizanProvider>
          <TopProgressBar />
          <InitialSplash />
          <ServiceWorkerRegister />
          {children}
          <Suspense fallback={null}>
            <FeedbackModal />
            <FeedbackButton />
          </Suspense>
        </MizanProvider>
      </body>
    </html>
  );
}
