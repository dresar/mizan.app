---
description: Standar pembatasan modal maksimal 4 form field dan larangan keras modal untuk informasi detail, tabel, atau dasbor data.
globs: "app/**/*.tsx, components/**/*.tsx"
---

# Aturan Baku Penggunaan Modal vs Halaman Mandiri (Pages)

## 1. Larangan Keras Modal untuk Konten Panjang
DILARANG KERAS menggunakan komponen Modal/Dialog untuk:
- Tampilan detail entitas atau data lengkap (misal: Detail Kelas, Detail Santri, Detail Pelanggaran).
- Tabel data, daftar record panjang, atau penjelajah data santri.
- Dasbor metrik, ringkasan KPI majemuk, atau tab analitik.
- Alur kerja bertingkat (multi-step workflow) atau formulir kompleks.
Seluruh skenario di atas WAJIB dibuatkan halaman mandiri (`page.tsx` atau `[id]/page.tsx`).

## 2. Batas Maksimal Penggunaan Modal (Maksimal 4 Field)
Komponen Modal HANYA diizinkan untuk:
- Dialog konfirmasi aksi (misal: Konfirmasi Hapus Data, Konfirmasi Logout, Konfirmasi Reset).
- Form kilat dengan MAKSIMAL 4 input field (misal: Tambah Kelas Baru [Nama Kelas, Gender, Wali Kelas], Ubah Profil Singkat, Ganti Password [Password Baru, Ulangi Password]).
- Form yang memiliki lebih dari 4 input field WAJIB dialihkan menjadi halaman tersendiri (`page.tsx`).
