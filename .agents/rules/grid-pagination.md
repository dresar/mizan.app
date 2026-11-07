---
description: Standar layout tampilan kartu (kotak) wajib 4 grid di desktop dan 3 grid di tablet/mobile, serta paginasi wajib 20 item per halaman untuk seluruh halaman data Mizan Apps.
globs: "app/**/*.tsx, components/**/*.tsx"
---

# Aturan Baku Grid Kartu & Paginasi Data Mizan Apps

## 1. Aturan Grid Tampilan Kotak (Card Grid)
Setiap halaman atau komponen yang menampilkan data dalam mode kotak/kartu WAJIB menggunakan susunan grid responsif:
- **Desktop (>= 1024px)**: Wajib **4 Grid Kolom** (`lg:grid-cols-4` atau `xl:grid-cols-4`).
- **Tablet / Intermediate (>= 768px)**: Wajib **3 Grid Kolom** (`md:grid-cols-3`).
- **Mobile / Small Screen**: 1 hingga 2 Kolom (`grid-cols-1 sm:grid-cols-2`).
- **Tailwind Utility Baku**:
  `className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5"`

## 2. Aturan Paginasi 20 Data (20 Items Per Page)
- Semua halaman yang memiliki data jamak (puluhan item atau lebih) WAJIB menerapkan paginasi dengan batas tepat **20 item per halaman** (`PAGE_SIZE = 20` atau `itemsPerPage = 20`).
- **Rasional**: 20 item dibagi 4 kolom di desktop menghasilkan tepat **5 baris penuh** tanpa ada kartu yang menggantung atau asimetris ($20 / 4 = 5$).
- Dilarang merender ratusan item sekaligus dalam satu halaman tanpa paginasi.
