# 🏛️ Mizan Apps — Project Rules & Invariants

Aturan baku ini berlaku untuk seluruh agent yang membaca, menulis, atau mengaudit kode pada repositori mizan.apps.

## 1. Arsitektur & Tech Stack
- **Frontend**: Next.js 16.4.3 (App Router, Turbopack, React 19.3.0, TypeScript 5) dikompilasi statis ke `gobackend/web`.
- **Backend**: Golang Fiber v2 (`gobackend/`), alokasi memori ultra-rendah (1.5 MB RAM), latency <1ms.
- **Realtime**: Bidirectional WebSocket Hub (`/ws` & `/api/broadcast`) channel `absensi`, `penilaian`, `feedback`.
- **Database**: Neon Serverless PostgreSQL via `pgx/v5` connection pool dengan SSL di `gobackend/internal/database`.
- **Styling**: Tailwind CSS v4, Lucide React. Palet Mizan: Deep Green `#1B4D3E`, Gold `#C5A059`, Cream `#FAF7EE`.
- **Ekspor Dokumen**: Menggunakan `jspdf` via `lib/pdf-generator.ts`.
- **MCP Server**: Stdio binary `gobackend/mizan-mcp` dan endpoint HTTP `/mcp` dengan 11 tools terverifikasi.

## 2. Standar Mutlak Kualitas Kode
1. **NOKOMEN**: Dilarang keras menulis komentar kode dalam bentuk apa pun (`//`, `/* */`, `{/* */}`) di seluruh file sumber aplikasi (`app/`, `lib/`, `components/`, `gobackend/`).
2. **Single-Word Action Buttons**: Seluruh label tombol aksi interaktif WAJIB terdiri dari 1 kata tunggal saja (contoh: `Bagikan`, `Unduh`, `Salin`, `Cetak`, `Tambah`, `Ubah`, `Detail`, `Simpan`, `Keluar`, `Buka`, `Tutup`).
3. **Zero Infrastructure Disclosure**: Dilarang menampilkan nama teknis infrastruktur/backend (seperti PostgreSQL, Neon, VPS, Docker, API, port, server) pada antarmuka pengguna.
4. **Validasi Tipe & Build**: Setiap kode baru wajib lulus verifikasi tanpa error (`npx tsc --noEmit` dan `go build ./cmd/server`).
5. **Resource-Constrained Build**: Kompilasi `npm run build` WAJIB menyertakan pembatas `NODE_OPTIONS="--max-old-space-size=1024" NEXT_CPU_COUNT=2` guna mencegah OOM Killer pada limitasi cgroup 4GB.

## 3. Protokol Efisiensi Operasional
- Gunakan pencarian simbol tertarget (`grep_search` / ripgrep) alih-alih membuka file besar utuh.
- Jangan membaca ulang file yang tidak mengalami perubahan dalam sesi kerja yang sama.
- Selalu sinkronkan perubahan struktural (modul, rute, tabel baru) ke `PROJECT_MAP.md`.
