# 🎯 MASTER PROMPT: Integrasi Website Profil Publik Pesantren Hub ke Golang Fiber Core

> **Target Agent**: Seluruh Antigravity AI Agent Cluster (AGY1 s/d AGY12) & Eksekutor Sistem.
> **Objektif**: Mengintegrasikan frontend publik profil pesantren (dari repositori `pesantren-hub`) ke dalam backend Golang Fiber (`gobackend`), melayani dual-entrypoint (`index.html` publik & `admin.html` CMS) tanpa merusak aplikasi operasional internal Mizan Apps (`gobackend/web/`).

---

## 1. 🗺️ PETA LOKASI REPOSITORI & FOLDER

| Komponen | Path Absolut | Tech Stack | Fungsi & Tanggung Jawab |
| :--- | :--- | :--- | :--- |
| **Mizan Core (Induk)** | `/opt/data/home/mizan.apps/` | Next.js 16 (Turbopack) | Sistem operasional internal (Admin, BK, Guru, Santri, Ortu, Satpam). |
| **Pesantren Hub (Sumber)** | `/opt/data/home/pesantren-hub/` | React 18 + Vite + Tailwind | Website profil publik pesantren, landing page, galeri, blog, dan CMS admin. |
| **Golang Engine** | `/opt/data/home/mizan.apps/gobackend/` | Golang Fiber v2 (:3000) | Single-binary web server, REST API, WebSocket Hub, database controller. |
| **Web Mizan App (Statis)** | `/opt/data/home/mizan.apps/gobackend/web/` | HTML/JS Statis (Next Export) | Melayani aplikasi operasional Mizan di rute `/admin`, `/bk`, `/guru`, dll. |
| **Web Public (Statis)** | `/opt/data/home/mizan.apps/gobackend/web_public/` | HTML/JS Statis (Vite Export) | Melayani website profil publik (`index.html`) dan CMS Admin (`admin.html`). |

---

## 2. 🏛️ ARSITEKTUR DUAL-ENTRYPOINT (`web_public/`)

Website profil publik pesantren memiliki dua target pengguna utama:
1. **Pengunjung Umum / Wali Santri / Calon Santri**:
   - File target: `/opt/data/home/mizan.apps/gobackend/web_public/index.html`
   - Konten: Hero section, Profil Pesantren, Visi Misi, Sejarah Timeline, Dewan Asatidz/Pimpinan, Program Pendidikan, Fasilitas, Ekstrakurikuler, Galeri Dokumentasi, Jadwal Santri, Berita/Blog, Pendaftaran Santri Baru (PSB), Form Kontak WhatsApp.
2. **Pengelola Konten / Admin Profil Pesantren**:
   - File target: `/opt/data/home/mizan.apps/gobackend/web_public/admin.html`
   - Konten: Panel manajemen CMS (edit teks hero, tambah/edit berita blog, unggah foto galeri fasilitas, verifikasi formulir pendaftaran calon santri, pengaturan website).

---

## 3. 🌐 STRATEGI ROUTING MULTI-DOMAIN GOLANG FIBER (`gobackend/cmd/server/main.go`)

Golang Fiber bertindak sebagai Reverse Proxy & Static File Server cerdas menggunakan inspeksi Host Header (`c.Hostname()`) atau URL Path:

### A. Skenario Multi-Domain (Paling Direkomendasikan)
- **Domain Publik Pesantren** (misal: `pesantren.sch.id` atau `agentai.my.id`):
  - Request `/` atau `/profil/*`, `/berita/*`, `/galeri/*` $\rightarrow$ Sajikan `gobackend/web_public/index.html` + aset statis `web_public/assets/*`.
  - Request `/admin` atau `/admin/*` $\rightarrow$ Sajikan `gobackend/web_public/admin.html` (jika user login ke CMS profil).
- **Domain Aplikasi Internal Mizan** (misal: `app.agentai.my.id` atau `mizan.sch.id`):
  - Request seluruh path $\rightarrow$ Tetap sajikan `gobackend/web/*` (Aplikasi internal pesantren: Presensi sholat, buku pelanggaran BK, rapor KMI).

### B. Skenario Single Domain (Berbasis Path Prefix)
- `/` $\rightarrow$ `gobackend/web_public/index.html` (Landing profil publik)
- `/portal-admin-web` $\rightarrow$ `gobackend/web_public/admin.html` (CMS Publik)
- `/app/*`, `/admin/*`, `/bk/*`, `/guru/*`, `/santri/*` $\rightarrow$ `gobackend/web/` (Mizan operasional)

---

## 4. 🗄️ SKEMA DATABASE NEON POSTGRESQL (67 TABEL)

Gunakan koneksi `DATABASE_URL` yang sama (Neon PostgreSQL). Seluruh tabel untuk CMS Profil publik telah terdefinisi di `/opt/data/home/pesantren-hub/server/src/db/schema.ts`:

### A. Grup Tabel Konten Profil Pesantren (`core_*`)
- `core_herosection`: Judul utama, subtitle, background hero, tombol CTA pendaftaran.
- `core_visimisi`: Teks visi, misi, dan nilai-nilai luhur pesantren.
- `core_sejarahtimeline` & `core_sejarahtimelineimage`: Tonggak sejarah pesantren dari masa ke masa.
- `core_founders`: Profil pendiri dan pimpinan pesantren.
- `core_struktur_organisasi`: Struktur pengasuhan dan hierarki pimpinan.
- `core_programpendidikan` & `core_programpendidikanimage`: Jenjang pendidikan (KMI, MTs, MA, Tahfidz).
- `core_fasilitas`: Gedung asrama, masjid, lab bahasa, ruang makan, klinik, sarana olahraga.
- `core_ekstrakurikuler` & `core_ekstrakurikulerimage`: Kepramukaan, silat, muhadharah 3 bahasa, kaligrafi.
- `core_dokumentasi` & `core_dokumentasiimage`: Album foto kegiatan harian santri.
- `core_jadwalharian`: Agenda kegiatan 24 jam santri dari bangun tidur hingga istirahat.
- `core_tenagapengajar` & `core_bagianjabatan`: Profil ustadz/ustadzah pengajar beserta gelar dan amanah tugas.
- `core_kontak` & `core_contactperson`: Nomor layanan informasi dan sekretariat PSB.
- `core_socialmedia`: Tautan YouTube, Instagram, Facebook, TikTok resmi pesantren.
- `core_websitesettings`: Nama pesantren, logo, favicon, alamat lengkap, koordinat Google Maps.
- `core_faq`: Pertanyaan yang sering diajukan wali santri baru.

### B. Grup Tabel Berita & Pengumuman (`blog_*`)
- `blog_blogpost`: Artikel berita, kajian asatidz, prestasi santri.
- `blog_category`: Kategori berita (Warta Pondok, Opini, Prestasi, Khutbah).
- `blog_tag` & `blog_blogpost_tags`: Tagar berita.
- `blog_pengumuman`: Pengumuman penting (liburan santri, jadwal kepulangan, ujian).
- `blog_testimoni`: Testimoni alumni dan wali santri.

### C. Grup Tabel Pendaftaran Calon Santri Baru (`admissions_*`)
- `admissions_santri`: Biodata calon santri baru yang mendaftar online.
- `admissions_parents`: Data orang tua / wali calon santri.
- `admissions_exam_schedules`: Jadwal tes masuk / wawancara calon santri.
- `admissions_exam_results`: Hasil seleksi (Lulus, Cadangan, Tidak Lulus).

### D. Grup Tabel Pembayaran & Rekening (`payments_*`)
- `payments_bankaccount`: Rekening bank resmi atas nama yayasan/pesantren.
- `payments_payment`: Catatan konfirmasi pembayaran uang pendaftaran / infaq.

---

## 5. ⚡ PEMETAAN ENDPOINT API DI GOLANG FIBER (`gobackend`)

Porting logika endpoint dari Hono (`server/src/modules/core/` & `server/src/modules/blog/`) menjadi Golang Fiber handlers:

| Metode | URL Endpoint | Auth Level | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/public/website-settings` | Bebas (Publik) | Mengambil logo, nama pondok, SEO metadata |
| `GET` | `/api/v1/public/hero-section` | Bebas (Publik) | Mengambil konten banner utama landing |
| `GET` | `/api/v1/public/visi-misi` | Bebas (Publik) | Mengambil teks visi misi pondok |
| `GET` | `/api/v1/public/sejarah-timeline` | Bebas (Publik) | Mengambil linimasa sejarah pendirian |
| `GET` | `/api/v1/public/program-pendidikan` | Bebas (Publik) | Mengambil jenjang program santri |
| `GET` | `/api/v1/public/fasilitas` | Bebas (Publik) | Mengambil daftar fasilitas & galeri |
| `GET` | `/api/v1/public/tenaga-pengajar` | Bebas (Publik) | Mengambil daftar guru asatidz |
| `GET` | `/api/v1/public/posts` | Bebas (Publik) | Mengambil daftar artikel warta/berita |
| `GET` | `/api/v1/public/posts/:slug` | Bebas (Publik) | Detail artikel warta |
| `POST` | `/api/v1/public/psb/daftar` | Bebas (Publik) | Submit form pendaftaran santri baru |
| `POST` | `/api/v1/admin/cms/:section` | JWT Bearer Admin | Update konten profil (Hero, Visi-Misi, dll) |
| `POST` | `/api/v1/admin/blog/posts` | JWT Bearer Admin | Buat berita warta baru |
| `PUT` | `/api/v1/admin/blog/posts/:id` | JWT Bearer Admin | Edit berita warta |
| `DELETE` | `/api/v1/admin/blog/posts/:id` | JWT Bearer Admin | Hapus berita warta |

---

## 6. 🛠️ ALUR KERJA EKSEKUSI TEKNIS (STEP-BY-STEP)

1. **Konfigurasi Vite Multi-Page Build** di `/opt/data/home/pesantren-hub/vite.config.ts`:
   - Tambahkan input rollup agar memproduksi `index.html` dan `admin.html`:
     ```ts
     build: {
       rollupOptions: {
         input: {
           main: resolve(__dirname, 'index.html'),
           admin: resolve(__dirname, 'admin.html')
         }
       }
     }
     ```
2. **Build Frontend Pesantren Hub**:
   ```bash
   cd /opt/data/home/pesantren-hub
   npm run build
   ```
3. **Deploy Aset ke Golang Static Folder**:
   ```bash
   cp -r /opt/data/home/pesantren-hub/dist/* /opt/data/home/mizan.apps/gobackend/web_public/
   ```
4. **Perbarui Router Static di `gobackend/cmd/server/main.go`**:
   - Daftarkan `app.Static("/", "./web_public")` untuk domain profil atau path publik.
   - Daftarkan fallback `c.SendFile("./web_public/index.html")` untuk rute publik dan `c.SendFile("./web_public/admin.html")` untuk rute CMS.
5. **Kompilasi & Restart Daemon Golang**:
   ```bash
   cd /opt/data/home/mizan.apps/gobackend
   go build -o mizan-server cmd/server/main.go
   ```
6. **Verifikasi Output**:
   - Lakukan `curl -I http://localhost:3000/` $\rightarrow$ Pastikan menyajikan profil publik.
   - Lakukan `curl -I http://localhost:3000/admin/dashboard` $\rightarrow$ Pastikan menyajikan Mizan operasional.

---

## 7. 🚨 ATURAN BAKU & BATASAN KETAT
- **NOKOMEN**: DILARANG menambahkan komentar apa pun di file kode produksi (`//`, `/*`, `{/* */}`).
- **HEMAT TOKEN**: Jangan membaca ulang seluruh isi file schema jika hanya butuh sebagian; gunakan grep dan simbol tertarget.
- **ISOLASI SISTEM**: Dilarang menghapus atau mengubah file di `/opt/data/home/mizan.apps/app/` (rute Next.js Mizan) tanpa persetujuan tugas spesifik. Seluruh integrasi publik wajib berada di `gobackend/web_public/` dan handler `gobackend/internal/`.
