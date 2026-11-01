# 🗺️ PROJECT_MAP: Mizan Apps

> **Protokol Hemat Token Aktif**: File ini adalah peta navigasi utama mizan.apps. Wajib dibaca sebelum membuka file repo lainnya. Jaga agar tetap ringkas dan di bawah 150 baris.

---

## 1. 🏗️ Tech Stack & Arsitektur
- **Framework**: Next.js 16.4.3 (App Router), React 19.3.0, TypeScript 5.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/turbopack`), Lucide React icons.
- **Database**: PostgreSQL (direct via `pg` connection pool with SSL in `lib/db.ts`).
- **Reports & PDF**: `jspdf` (`lib/pdf-generator.ts`).
- **PWA & Mobile**: Service Worker registration (`components/ServiceWorkerRegister.tsx`), Bottom Navigation (`components/BottomNav.tsx`), APK/PWA assets in `public/`.
- **State & Context**: `lib/mizan-context.tsx`.

---

## 2. 📁 Struktur Direktori
```text
mizan.apps/
├── app/
│   ├── admin/       # Dashboard admin, santri, kelas, users, wali-kelas, absensi, pelanggaran (grid & detail [id])
│   ├── bk/          # Konseling BK (absen, dashboard, history, profil)
│   ├── guru/        # Modul guru (dashboard, input-penilaian, riwayat, absensi, profil santri)
│   ├── ortu/        # Dashboard wali santri / orang tua
│   ├── santri/      # Halaman santri & profil
│   ├── share/       # Public report card share view ([id])
│   ├── login/       # Halaman login multi-role
│   └── api/         # Next.js API route handlers (auth, absensi, data, penilaian, settings, users, dll)
├── components/      # UI components (Header, Sidebar, BottomNav, RoleShell, ShareModal, dll)
│   └── ui/          # Atomik UI (Card, Badge, Avatar, Drawer, Toast, EmptyState, ScoreBar)
├── lib/             # db.ts (pg pool), mizan-context.tsx, mock-data.ts, pdf-generator.ts
└── public/          # Favicon, icons, manifest, service worker
```

---

## 3. 🌐 API Endpoints (`app/api/`)
- `api/auth/login`, `api/auth/update-password`: Autentikasi sesi & pergantian kata sandi.
- `api/absensi`: Catatan absensi shalat dan kegiatan santri.
- `api/penilaian`: Input dan rekap penilaian adab / kedisiplinan / tahfidz.
- `api/categories`, `api/classes`, `api/data`, `api/santri`, `api/users`, `api/settings`.
- `api/share`, `api/upload-avatar`.

---

## 4. 🚀 Menjalankan & Build
- `npm run dev`: Jalankan Next.js development server.
- `npm run build`: Build production binary.
- `npm run start -p 3000`: Jalankan production server port 3000.
