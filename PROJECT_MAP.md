# 🗺️ PROJECT_MAP: Mizan Apps

> **Protokol Hemat Token Aktif**: File ini adalah peta navigasi utama mizan.apps. Wajib dibaca sebelum membuka file repo lainnya. Jaga agar tetap ringkas dan di bawah 150 baris.

---

## 1. 🏗️ Tech Stack & Arsitektur
- **Frontend**: Next.js 16.4.3 (App Router, Turbopack, React 19.3.0, TypeScript 5) dikompilasi statis (`output: 'export'`) ke `gobackend/web`.
- **Backend**: Golang Fiber v2 (`gobackend/`), alokasi memori ultra-rendah (<25 MB RAM), latency <1ms.
- **Realtime**: Bidirectional WebSocket Hub (`/ws` & `/api/broadcast`) dengan channel absensi, penilaian, feedback, monitoring.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/turbopack`), Lucide React icons, Palet Mizan (Deep Green `#1B4D3E`, Gold `#C5A059`, Cream `#FAF7EE`).
- **Database**: PostgreSQL (`pgx/v5` connection pool di `gobackend/internal/database`) dengan tabel absensi, penilaian, santri, tahfidz, kesehatan, perizinan, keuangan uang saku/SPP, sambangan, catatan musyrif.
- **Production Server**: Single binary Go mandiri (`gobackend/mizan-server`) melayani API, WebSocket, dan frontend tanpa perlu Node.js di VPS.

---

## 2. 📁 Struktur Direktori & Rute Halaman (`app/`)
```text
mizan.apps/
├── app/
│   ├── admin/                 # Admin Panel Master (dashboard, keaktifan-guru, santri, kelas, wali-kelas, absensi, rapor, feedback, users, notifikasi [tambah], kategori-pelanggaran [unsur, indikator], kesehatan, perizinan, keuangan, tahfidz)
│   ├── guru/                  # Modul Ustadz / Pembina (dashboard, absen, input-penilaian, riwayat, santri, profil - NO financial access)
│   ├── bk/                    # Modul Pengasuhan BK (dashboard, absen, history, santri, kesehatan [catat], perizinan, keuangan uang saku/SPP, tahfidz)
│   ├── ortu/dashboard/        # Portal Wali Santri (status harian, progres tahfidz, rekam medis poskestren, mutasi uang saku, kartu QR izin keluar-masuk)
│   ├── satpam/                # Pos Jaga Gerbang (Scanner QR kartu izin mandiri, verifikasi status & konfirmasi keluar/kembali santri)
│   ├── santri/profil/         # Profil mandiri santri & skor adab
│   ├── share/[id]/            # Halaman publik kartu share (stat-*) tanpa perlu login
│   └── login/                 # Autentikasi multi-role (Admin, Pengasuhan Putra/Putri, Guru, Wali Santri, Satpam)
├── components/                # UI Components (Header, Sidebar, BottomNav, RoleShell, Modals, Toast)
├── gobackend/                 # Core Fullstack Go Server (Fiber v2, WebSocket, pgx pool, static web server)
│   ├── cmd/server/main.go     # Entrypoint Go Fiber (melayani API /api/*, WebSocket /ws, dan static files)
│   ├── internal/              # Handlers (monitoring, keuangan, santri, auth), models, middleware, database (<500 lines, 0 comments)
│   ├── mizan-server           # Binary produksi Go Fiber backend aktif (PID aktif melayani port 3000)
│   └── web/                   # Kompilasi frontend statis Next.js siap saji
└── lib/                       # Helpers (mizan-context, mock-data, types, utils)
```

---

## 3. 🛡️ Keamanan & Standar Koding
- **RBAC Strict**:
  - `SUPER_ADMIN`: Akses penuh semua modul administrasi & monitoring.
  - `PENGASUHAN`: Mengelola pembinaan asrama, kesehatan, perizinan, tahfidz, dan administrasi keuangan uang saku/SPP dengan isolasi gender (Putra / Putri).
  - `GURU`: Khusus KBM (penilaian & presensi kelas). Akses modul keuangan & perizinan ditolak (403 Forbidden).
  - `SATPAM`: Khusus pos gerbang scanner QR izin santri (tanpa akses data nilai/finansial).
  - `ORTU`: Portal monitoring ananda berbasis NIS santri.
- **Strict Anti-Komentar (/nokomen)**: Nol komentar kode di file `.go`, `.ts`, `.tsx`.
- **Modular Code**: Maksimal 500 baris kode per file.
- **Proteksi Rahasia**: File `.env` & `.env.local` dilarang di-push ke GitHub.
