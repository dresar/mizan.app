# 📋 Product Requirement Document & Architectural Reference (PRD)
## Mizan Realtime High-Performance Fullstack Go Backend (`gobackend`)

---

### 1. Ringkasan & Sasaran Sistem
- **Tujuan**: Membangun core fullstack backend berkinerja tinggi, berlatensi ultra-rendah (<1ms), dan sangat hemat memori (<20 MB RAM) untuk sistem Mizan Apps (Pesantren Modern Raudhatussalam Mahato).
- **Spesifikasi Target VPS**: 1 vCPU & 1 GB RAM (Linux / Windows).
- **Karakteristik Unik**: Menyatukan API performa tinggi, WebSocket Hub dua arah, dan static asset server hasil compile Next.js frontend (`output: 'export'`) ke dalam **satu binary Go mandiri**, sehingga di production server VPS **TIDAK MEMERLUKAN Node.js / `npm run`**.
- **Hasil Pengujian Nyata**:
  - Memory Allocation: **1.54 MB**
  - System Footprint: **16.67 MB**
  - Binary Size: **20 MB** (Self-contained)
  - Goroutines Idle: **6 - 9 threads**

---

### 2. Alokasi Sumber Daya (Budget Resource VPS 1 vCPU / 1 GB RAM)

| Komponen | Alokasi RAM | Penggunaan CPU |
| :--- | :---: | :---: |
| **Go Server Binary (`server.exe` / `server`)** | **~1.5 – 17 MB** | < 1% (Idle) / 2–5% (Peak Burst) |
| **pgx Connection Pool (Max 10)** | **~5 – 8 MB** | Mengikuti traffic query |
| **WebSocket Hub (500+ klien aktif)** | **~3 – 5 MB** | Goroutines non-blocking |
| **Sisa RAM Bebas untuk OS VPS** | **~970 MB** | Server sangat stabil dan anti-OOM |

---

### 3. Arsitektur Teknis & Tech Stack
- **Bahasa**: Golang (Go 1.24+).
- **Framework Web**: **Go Fiber v2** (arsitektur berbasis `fasthttp`, alokasi memori zero-allocation, tercepat di kelasnya).
- **Protokol Realtime**: **WebSocket** (`gofiber/contrib/websocket`) dengan sistem *Hub & Broadcast Channel* non-blocking dan thread-safe via `sync.RWMutex`.
- **Koneksi Database**: **`pgx/v5`** (`pgxpool`) dengan pooling native, keepalive otomatis, dan SSL mode ke Neon Serverless PostgreSQL.
- **Autentikasi**: Edge HMAC SHA-256 token validator (kompatibel penuh dengan session cookie `mizan_session`).
- **AI Bug Inspector Engine**: Pemeriksa source code lokal read-only otomatis untuk menghasilkan prompt rekomendasi perbaikan bug terstruktur bagi admin dan pengembang.

---

### 4. Saluran Realtime WebSocket (`/ws` & `/api/broadcast`)

1. `absensi`:
   - Terpicu saat ustadz/pembina mencatat kehadiran jamaah (Subuh s/d Tahajjud).
   - Menampilkan status kehadiran santri di dashboard admin dan guru secara instan.
2. `penilaian`:
   - Terpicu saat pencatatan poin hasanah atau sayyiah.
   - Mengupdate skor adab santri realtime tanpa perlu me-refresh halaman.
3. `feedback`:
   - Notifikasi live ke admin saat ada laporan bug baru atau saran pengembangan dari pengguna.
4. `system`:
   - Heartbeat status koneksi klien.

---

### 5. Dokumentasi Endpoint API Golang (`/api`)

| Method | Endpoint | Fungsi |
| :--- | :--- | :--- |
| `GET` | `/health` | Cek status server, uptime, memory allocation, dan client count |
| `GET` | `/ws` | Upgrade WebSocket connection untuk bidirectional stream |
| `POST` | `/api/broadcast` | Broadcast custom event ke semua client WebSocket |
| `GET` | `/api/data` | Bulk load data seluruh tabel (santri, absensi, penilaian, dll) |
| `POST` | `/api/auth/login` | Login user, verifikasi password hash/plain, buat token session |
| `GET` | `/api/auth/me` | Ambil data profil user yang sedang aktif dari session cookie/header |
| `POST` | `/api/auth/update-password` | Update kata sandi pengguna |
| `GET/POST/PATCH/DELETE` | `/api/santri` | CRUD santri lengkap |
| `GET/POST/PATCH/DELETE` | `/api/classes` | CRUD data kelas |
| `GET/POST` | `/api/categories` | Kelola master kategori pelanggaran dan prestasi |
| `POST` | `/api/categories/unsur` | Kelola sub-unsur kategori penilaian |
| `GET/POST/PATCH/DELETE` | `/api/absensi` | CRUD absensi sholat dengan trigger realtime broadcast |
| `GET/POST/DELETE` | `/api/penilaian` | CRUD penilaian adab/kedisiplinan dengan trigger realtime broadcast |
| `GET/POST/PATCH/DELETE` | `/api/users` | CRUD akun pengguna/guru/pembina |
| `GET/POST` | `/api/settings` | Pengaturan sistem aplikasi |
| `GET/POST` | `/api/share` | Data kartu santri publik |
| `GET/POST/PATCH/DELETE` | `/api/feedback` | CRUD sistem feedback (saran & laporan bug) |
| `POST` | `/api/feedback/analyze` | AI Source Code Inspector untuk analisis bug & pembuatan prompt |
| `GET` | `/api/admin/backup` | Export backup data database lengkap |
| `POST` | `/api/upload-avatar` | Upload foto avatar pengguna |

---

### 6. Panduan Deployment VPS (Linux Systemd)

Untuk menjalankan server Go di VPS Ubuntu/Debian:

1. **Build binary Linux**:
   ```bash
   cd gobackend
   GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o mizan-server ./cmd/server
   ```
2. **Kirim berkas ke VPS**:
   Upload binary `mizan-server`, folder `web/`, dan file `.env` ke direktori VPS misal `/var/www/mizan`.
3. **Konfigurasi Systemd Service** (`/etc/systemd/system/mizan.service`):
   ```ini
   [Unit]
   Description=Mizan Fullstack Go Server
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/mizan
   ExecStart=/var/www/mizan/mizan-server
   Restart=always
   RestartSec=5
   EnvironmentFile=/var/www/mizan/.env

   [Install]
   WantedBy=multi-user.target
   ```
4. **Jalankan Service**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable mizan
   sudo systemctl start mizan
   ```
5. **Nginx Reverse Proxy** (Port 80/443 -> Port 4000 dengan WebSocket support).
