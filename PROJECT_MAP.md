# 🗺️ PROJECT_MAP: Mizan Apps

> **Protokol Hemat Token Aktif**: File ini adalah peta navigasi utama mizan.apps. Wajib dibaca sebelum membuka file repo lainnya. Jaga agar tetap ringkas dan di bawah 150 baris.

---

## 1. 🏗️ Tech Stack & Arsitektur
- **Frontend**: Next.js 16.4.3 (App Router, Turbopack, React 19.3.0, TypeScript 5) dikompilasi statis (`output: 'export'`) ke `gobackend/web`.
- **Backend**: Golang Fiber v2 (`gobackend/`), alokasi memori ultra-rendah (<25 MB RAM), latency <1ms.
- **Realtime**: Bidirectional WebSocket Hub (`/ws` & `/api/broadcast`) dengan channel absensi, penilaian, feedback, monitoring.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/turbopack`), Lucide React icons, Palet Mizan (Deep Green `#1B4D3E`, Gold `#C5A059`, Cream `#FAF7EE`).
- **Database**: PostgreSQL (`pgx/v5` connection pool di `gobackend/internal/database`) dengan tabel absensi, penilaian, santri, tahfidz, kesehatan, perizinan, keuangan uang saku/SPP, sambangan, catatan musyrif.
- **Production Server**: Single binary Go mandiri (`gobackend/mizan-server`) melayani API, WebSocket, dan Host-Based Routing (`agentai.my.id` untuk Web Publik vs `mizan.agentai.my.id` untuk Sistem Mizan).

---

## 2. 📁 Struktur Direktori & Rute Halaman
```text
mizan.apps/
├── app/                       # Dashboard Operasional Mizan (Next.js 16)
│   ├── admin/                 # Admin Panel Master Mizan
│   ├── guru/                  # Modul Ustadz / Pembina
│   ├── bk/                    # Modul Pengasuhan BK
│   ├── ortu/dashboard/        # Portal Wali Santri
│   ├── satpam/                # Pos Jaga Gerbang
│   ├── santri/profil/         # Profil mandiri santri
│   └── share/[id]/            # Kartu publik santri
├── portal/                    # Source Code Portal Publik & Website CMS (React 18 + Vite)
│   ├── src/                   # Halaman publik, CMS admin, auth, stores, layout
│   ├── public/                # Logo, ikon, manifest publik
│   ├── index.html             # Entrypoint portal publik & unified login (/login)
│   ├── admin.html             # Entrypoint CMS admin panel (/admin-cms)
│   └── vite.config.ts         # Build output langsung ke ../gobackend/web_public
├── gobackend/                 # Core Fullstack Go Server (Fiber v2, pgx pool)
│   ├── cmd/server/main.go     # Fiber engine, dual static router, RBAC auth
│   ├── internal/              # Handlers, models, middleware, database (<500 lines, 0 comments)
│   ├── web/                   # Static build dashboard internal Mizan
│   └── web_public/            # Static build portal profil & website CMS
├── components/                # UI Components Mizan
└── lib/                       # Helpers (mizan-context, types, utils)
```

---

## 3. 🌐 Domain & Role Matrix
- **Subdomain Mizan (`mizan.agentai.my.id`)**:
  - Entrypoint: `/` dan `/login` -> Mizan App Login.
  - Role `SUPER_ADMIN`: `admin` (pwd: `password123`) -> `/admin/dashboard`
  - Role `PENGASUHAN` (BK): `doli` (putra), `sindih` (putri) (pwd: `RDS123`) -> `/bk/dashboard`
  - Role `GURU`: `agung` (putra), `annurul` (putri) (pwd: `RDS123`) -> `/guru/dashboard`
  - Role `SATPAM`: `satpam` (pwd: `password123`) -> `/satpam`
  - Role `ORTU`: `ortu` atau NIS santri contoh `221488` (pwd: `RDS1234`) -> `/ortu/dashboard`
- **Domain Utama (`agentai.my.id`)**:
  - Entrypoint: `/` -> Web Publik Profil Pesantren.
  - Entrypoint: `/login` -> Portal Login.
  - Role `adminwebsite`: `adminwebsite` (pwd: `password123`) -> `/admin-cms`
  - Role `author`: `penulis` (pwd: `password123`) -> `/author/dashboard`
  - Role `santri`: `santri` (pwd: `password123`) -> `/santri/dashboard/:id`
  - Jika route Mizan (`/satpam`, `/admin/*`, `/bk/*`, `/guru/*`, `/ortu/*`) diakses di domain utama, otomatis di-redirect ke `https://mizan.agentai.my.id/<route>`.

---

## 4. 🛡️ Keamanan & Standar Koding
- **Domain Isolation**: Sesi cookie diatur ke `.agentai.my.id` namun origin `mizan.agentai.my.id` dan `agentai.my.id` terisolasi secara rute agar tidak terjadi tabrakan login.
- **Strict Anti-Komentar (/nokomen)**: Nol komentar kode di file `.go`, `.ts`, `.tsx`.
- **Modular Code**: Maksimal 500 baris kode per file.
- **Supermemory Integration**: Memory API v5 (`SUPERMEMORY_API_KEY`, namespace format `^[a-zA-Z0-9_:-]+$`).
- **Proteksi Rahasia**: File `.env` & `.env.local` dilarang di-push ke GitHub.
