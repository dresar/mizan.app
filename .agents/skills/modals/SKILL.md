---
name: modals
description: "Panduan dan aturan arsitektur ketat penggunaan Modal vs Dedicated Pages (page.tsx). Melarang keras modal untuk tampilan data panjang, detail record, tabel, dan analitik. Membatasi modal hanya untuk form sederhana maksimal 4 input atau dialog konfirmasi cepat."
---

# Modal Architecture & Usage Standard (`/modals`)

Owner & Authority: **Mizan Apps Core Architecture**

Skill `modals` adalah standar rekayasa antarmuka (UI/UX) untuk mengatur batasan penggunaan dialog modal dan penegakan halaman mandiri (`page.tsx`) di seluruh aplikasi web.

---

## 1. MATRIKS KEPUTUSAN: MODAL VS HALAMAN (PAGE)

| Skenario Antarmuka | Gunakan Modal? | Gunakan Halaman (`page.tsx`)? | Alasan & Standar Teknis |
| :--- | :---: | :---: | :--- |
| **Konfirmasi Aksi Cepat** | ✅ **YA** (1-2 tombol) | ❌ Tidak | Fokus instan, tidak memutus alur pengguna (misal: Konfirmasi Hapus Santri, Logout) |
| **Form Singkat (≤ 4 input)** | ✅ **YA** (Maks. 4 field) | ❌ Opsional | Input ringkas dan cepat tanpa harus pindah konteks halaman |
| **Detail Entitas / Record** | ❌ **DILARANG KERAS** | ✅ **WAJIB (Page)** | Butuh URL sendiri yang bisa di-share/bookmark, breadcrumbs, dan ruang baca luas |
| **Tabel Data & Pencarian** | ❌ **DILARANG KERAS** | ✅ **WAJIB (Page)** | Tabel membutuhkan lebar layar penuh, horizontal scrolling yang bebas, dan paginasi rapi |
| **Dasbor Metrik & Analitik** | ❌ **DILARANG KERAS** | ✅ **WAJIB (Page)** | Kartu statistik membutuhkan tata letak grid responsif, bukan dialog sempit bertingkat |
| **Formulir Kompleks (> 4 input)** | ❌ **DILARANG KERAS** | ✅ **WAJIB (Page)** | Formulir panjang di dalam modal menyebabkan scroll-inside-scroll yang merusak UX mobile |

---

## 2. ATURAN BAKU FORMULIR MODAL (MAKSIMAL 4 FIELD)

1. **Batas Maksimal 4 Elemen Input**:
   - Jika suatu interaksi memerlukan lebih dari 4 input (termasuk text input, select, textarea, file upload, checkbox groups), form tersebut WAJIB dipindahkan ke halaman mandiri (`/tambah`, `/edit`, atau `/[id]/edit`).
2. **Ketinggian & Kerapian Visual**:
   - Modal form harus muat dalam satu tampilan viewport tanpa vertical scroll ganda pada layar laptop/desktop standar.
   - Header modal memuat judul singkat dan tombol tutup (X).
   - Footer modal memuat tombol aksi primer dan pembatalan (*single-word verbs* seperti "Simpan", "Batal", "Hapus").
3. **Pemberitahuan & Toast**:
   - Saat modal berhasil disubmit, tutup modal secara otomatis dan tampilkan feedback toast yang informatif.

---

## 3. ARSITEKTUR HALAMAN MANDIRI UNTUK DETAIL RECORD

Saat memisahkan tampilan detail dari modal ke halaman baru pada arsitektur Next.js Static Export + Go Fiber:

1. **Struktur Folder**:
   - Gunakan folder rute dinamis: `app/[domain]/[resource]/[id]/`
   - Entrypoint `page.tsx`:
     ```tsx
     import ClientPage from "./ClientPage";

     export function generateStaticParams() {
       return [{ id: "detail" }];
     }

     export default function Page() {
       return <ClientPage />;
     }
     ```
   - Komponen logika di `ClientPage.tsx`.

2. **Dukungan Server Go Fiber (`server.exe`)**:
   Pastikan pada `gobackend/cmd/server/main.go` rute dinamis diarahkan ke file `detail.html`:
   ```go
   if strings.HasPrefix(reqPath, "[resource]/") {
       if strings.HasSuffix(reqPath, ".txt") {
           return c.SendFile(cfg.StaticWebDir + "/[resource]/detail.txt")
       }
       return c.SendFile(cfg.StaticWebDir + "/[resource]/detail.html")
   }
   ```

3. **Struktur Halaman Detail Standar**:
   - Tombol kembali / Breadcrumb di pojok kiri atas.
   - Header ringkasan profil dengan avatar, status badge, dan tombol aksi (Ubah, Hapus, Cetak).
   - Baris KPI Card metrik utama.
   - Tabel atau riwayat aktivitas lengkap dengan pencarian, filter, dan paginasi baku 20 item.
