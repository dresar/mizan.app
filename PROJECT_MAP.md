# 🗺️ PROJECT_MAP: Mizan Apps

> **Protokol Hemat Token Aktif**: File ini adalah peta navigasi utama mizan.apps. Wajib dibaca sebelum membuka file repo lainnya. Jaga agar tetap ringkas dan di bawah 150 baris.

---

## 1. 🏗️ Tech Stack & Arsitektur
- **Frontend**: Next.js 16.4.3 (App Router, Turbopack, React 19.3.0, TypeScript 5) dikompilasi statis (`output: 'export'`) ke `gobackend/web`.
- **Backend**: Golang Fiber v2 (`gobackend/`), alokasi memori ultra-rendah (1.5 MB RAM), latency <1ms.
- **Realtime**: Bidirectional WebSocket Hub (`/ws` & `/api/broadcast`) dengan channel `absensi`, `penilaian`, `feedback`.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/turbopack`), Lucide React icons, Palet Mizan (Deep Green `#1B4D3E`, Gold `#C5A059`, Cream `#FAF7EE`).
- **Database**: Neon Serverless PostgreSQL (`pgx/v5` connection pool dengan SSL di `gobackend/internal/database`).
- **AI Bug Inspector**: Analisis kode read-only lokal di `gobackend/internal/handlers/feedback_handler.go` untuk pembuatan prompt perbaikan mandiri.
- **Production Server**: Single binary Go mandiri (`gobackend/server.exe` / `mizan-server`) melayani API, WebSocket, dan frontend tanpa perlu Node.js di VPS.

---

## 2. 📁 Struktur Direktori & Rute Halaman (`app/`)
```text
mizan.apps/
├── app/
│   ├── admin/                 # Admin Master (dashboard, santri, kelas, wali-kelas, absensi, rapor, feedback, users)
│   ├── guru/                  # Modul Ustadz / Pembina (dashboard, absen, input-penilaian, riwayat, santri, profil)
│   ├── bk/                    # Modul Pengasuhan BK (dashboard, absen, history log lengkap, profil, penilaian, santri)
│   ├── ortu/ & dashboard/     # Portal Wali Santri (login stambuk, skor akhlak, sholat 7 waktu, kejadian, rapor PDF)
│   ├── santri/profil/         # Profil mandiri santri & skor adab
│   ├── share/[id]/            # Halaman publik kartu share (stat-*) tanpa perlu login
│   ├── login/                 # Autentikasi multi-role (login cepat 85 akun Ustadz/Ustadzah & BK dengan isolasi gender)
│   └── (api/)                 # Cadangan rute API Next.js (semua endpoint production dilayani oleh Golang Fiber)
├── components/                # UI Components (Header, Sidebar, Modals, Charts, & components/ui design system hub)
├── gobackend/                 # Core Fullstack Go Server (1.5 MB RAM, Fiber v2, WebSocket, pgx Neon, static web server)
│   ├── PRD.md                 # Dokumentasi arsitektur, benchmark & endpoint API
│   ├── cmd/server/main.go     # Entrypoint Go Fiber & static server
│   ├── internal/              # Modular handlers, database, hub, middleware, models, utils (<500 lines, 0 comments)
│   └── web/                   # Kompilasi frontend statis Next.js siap saji
└── lib/                       # Helpers (db, types, utils, context, pdf)
```

---

## 3. 🛡️ Keamanan & Standar Koding
- **Session Auth**: HMAC SHA-256 cookie session (`mizan_session`), dilarang plaintext password.
- **Strict Anti-Komentar (/nokomen)**: Nol komentar kode di file `.go`, `.ts`, `.tsx`.
- **Modular Code**: Maksimal 500 baris kode per file.
- **Proteksi Rahasia**: File `.env` & `.env.local` dilarang di-push ke GitHub.