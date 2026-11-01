# 🗺️ PROJECT_MAP: Mizan Apps

> **Protokol Hemat Token Aktif**: File ini adalah peta navigasi utama mizan.apps. Wajib dibaca sebelum membuka file repo lainnya. Jaga agar tetap ringkas dan di bawah 150 baris.

---

## 1. 🏗️ Tech Stack & Arsitektur
- **Framework**: Next.js 16.4.3 (App Router, Turbopack, React 19.3.0, TypeScript 5).
- **Styling**: Tailwind CSS v4 (`@tailwindcss/turbopack`), Lucide React icons, Palet Mizan (Deep Green `#1B4D3E`, Gold `#C5A059`, Cream `#FAF7EE`).
- **Database**: PostgreSQL (direct via `pg` connection pool with SSL in `lib/db.ts`).
- **Reports & PDF**: `jspdf` (`lib/pdf-generator.ts`).
- **PWA & Mobile**: Service Worker (`public/sw.js`, `components/ServiceWorkerRegister.tsx`), Bottom Nav (`components/BottomNav.tsx`), APK di `public/downloads/mizan.apk`, iOS IPA di `public/downloads/mizan.ipa`, Profile installer di `/api/download/ios-profile`.
- **State & Context**: `lib/mizan-context.tsx` (Single Source of Truth, sinkronisasi DB).

---

## 2. 📁 Struktur Direktori & Rute Halaman (`app/`)
```text
mizan.apps/
├── app/
│   ├── admin/                 # Admin Master
│   │   ├── dashboard/         # Dashboard ringkasan pondok
│   │   ├── santri/            # Manajemen santri, tambah, filter gender/status
│   │   ├── kelas/             # CRUD kelas: edit nama & gender, ubah wali kelas instan, hapus modal, detail santri & log
│   │   ├── wali-kelas/        # Penugasan wali kelas, paginasi max 20 (grid & tabel), & share statistik publik
│   │   ├── absensi/           # Rekap absensi sholat 7 waktu & kegiatan
│   │   ├── rapor/             # Rapor terpadu santri & santriwati (1 halaman tabel lengkap, cetak PDF massal)
│   │   ├── pengaturan-nilai/  # Bobot nilai & batas skor adab dinamis dari DB
│   │   ├── kategori-pelanggaran/ # Kategori, unsur, dan indikator pelanggaran (paginasi 20)
│   │   └── users/             # Manajemen user akun (Admin, Guru, BK, Ortu)
│   ├── guru/                  # Modul Ustadz / Pembina
│   │   ├── dashboard/         # Ringkasan santri binaan & grafik laporan
│   │   ├── absen/             # Presensi sholat berjamaah 7 waktu santri
│   │   ├── input-penilaian/   # Pencatatan sikap (hasanah/sayyiah)
│   │   ├── riwayat/           # Riwayat input pembinaan
│   │   ├── santri/ & [id]/    # Profil lengkap santri & tombol Cetak/Unduh PDF/Bagikan
│   │   └── profil/            # Profil ustadz, ganti password, avatar VPS, share profil
│   ├── bk/                    # Modul Pengasuhan BK (dashboard, absen, history log lengkap presensi & pelanggaran/prestasi realtime WIB, profil, penilaian, santri/ & [id]/ profil & rapor)
│   ├── ortu/ & dashboard/     # Portal Wali Santri (login stambuk & sandi RDS1234, skor akhlak, sholat 7 waktu, detail kejadian prestasi & pelanggaran, unduh rapor PDF & kontak pengasuhan)
│   ├── santri/profil/         # Profil mandiri santri, skor adab & tombol Bagikan
│   ├── share/[id]/            # Halaman publik kartu share (stat-*) tanpa perlu login
│   ├── login/                 # Autentikasi multi-role (login cepat 85 akun Ustadz/Ustadzah & BK dengan isolasi gender ketat)
│   └── api/                   # REST API routes (auth, absensi, backup, data, penilaian, settings, share, santri, classes, users)
├── components/                # UI Components
│   ├── ShareCard.tsx          # Komponen kartu statistik soft-UI neumorphic (7-item recessed, dual-stat, verified)
│   ├── ShareModal.tsx         # Modal share kompak (dropdown Jenis/Rentang/Sasaran, live preview, no-scroll)
│   ├── PrayerAttendanceChart.tsx # Grafik kehadiran sholat
│   ├── PembinaReportChart.tsx # Grafik laporan pembina
│   ├── Header.tsx, Sidebar.tsx, BottomNav.tsx, RoleShell.tsx, AnnouncementPopup.tsx
│   └── ui/                    # Atomik (Card, Badge, Avatar, ScoreBar, Toast, Modal, DeleteModal)
├── middleware.ts              # Edge server auth guard & role protection (/admin, /bk, /guru, /api/admin)
├── lib/                       # auth-server.ts, db.ts, date-utils.ts (WIB Asia/Jakarta formatting), mizan-context.tsx, mock-data.ts, pdf-generator.ts, quick-accounts.ts, kop-surat-base64.ts
└── public/                    # kop-surat.png, logo-raport.png, manifest.json, sw.js, favicon, icons, downloads/
```

---

## 3. 🗄️ Skema Database PostgreSQL
- `santri`: Data 249 santri & santriwati resmi pondok (113 Putra, 136 Putri di 12 kelas 1A-6A & 1B-6B).
- `guru_monitoring`: Status keaktifan dan pelaporan guru pembina.
- `categories`, `unsurs`, `indicators`: Hierarki poin pelanggaran dan kebaikan.
- `penilaian`: Catatan sikap hasanah/sayyiah (santri_id, guru_name, type, score, notes, created_at [timestamp with time zone realtime], date_key).
- `absensi`: Absensi sholat (santri_id, date, status [Hadir/Izin/Sakit/Alpa], waktu_sholat [Subuh..Tahajjud]).
- `classes`: Data kelas & wali kelas (name, wali_kelas, guru_id, gender).
- `app_settings`: Pengaturan bobot skor dinamis (base_score, max_score, penalty_limit, dll).
- `public_shares`: Snapshot kartu share publik (id VARCHAR(64) PRIMARY KEY, title, type, period, scope, data JSONB).

---

## 4. 🚨 Aturan Baku Pengembangan (Wajib Dipatuhi)
1. **NOKOMEN**: Dilarang keras menulis komentar (`//`, `/* */`, `{/* */}`) dalam kode apapun.
2. **UI-Text (Single-Word)**: Setiap tombol aksi WAJIB 1 kata saja (`Bagikan`, `Unduh`, `Salin`, `Cetak`, `Tambah`, `Ubah`, `Detail`, `Simpan`, `Keluar`, `Buka`, `Tutup`).
3. **Tanpa Hardcode & Zero Infrastructure Disclosure**: Dilarang membocorkan nama backend/hosting/database (Neon, PostgreSQL, VPS, Docker, API, server) pada antarmuka.
4. **Hemat Token**: Utamakan pencarian simbol (`grep`/`ripgrep`) alih-alih membaca seluruh file. Dilarang membaca ulang file yang tidak berubah.

---

## 5. 🚀 Menjalankan Server & Verifikasi
- Dev Server: `npx next dev -p 3000`
- Production Build: `npm run build`
- Production Server: `setsid -f npx next start -p 3000 > /tmp/next-server.log 2>&1 &`
- Verifikasi Endpoint: `curl -sI http://127.0.0.1:3000/share/stat-mvx9xtfy-wg8ov` (harus `200 OK`)
