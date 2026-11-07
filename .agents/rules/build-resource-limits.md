---
description: Aturan pembatasan resource CPU dan RAM saat menjalankan build frontend (npm run build / next build) di lingkungan VPS cgroup 4GB.
globs: "package.json, next.config.*, tsconfig.json"
---

# 🛡️ Aturan Pembatasan Resource Build Frontend (Anti-OOM)

Lingkungan VPS ini memiliki limitasi cgroup kernel **4 GB RAM** (`memory.max = 4294967296`), meskipun CPU mendeteksi 10 cores (`nproc = 10`).
Jika Next.js atau Vite menjalankan build paralel tanpa batas, kernel akan langsung membunuh proses Antigravity daemon melalui **Linux OOM Killer**.

## 1. Wajib Batasi Memory & Worker CPU saat Build
DILARANG menjalankan `npm run build` atau `next build` secara mentah.
Setiap agen WAJIB menginjeksi environment variables pembatas berikut:

```bash
NODE_OPTIONS="--max-old-space-size=1024" NEXT_CPU_COUNT=2 npm run build
```

- **`NODE_OPTIONS="--max-old-space-size=1024"`**: Membatasi alokasi heap V8 maksimal 1 GB agar tidak melahap sisa memori container.
- **`NEXT_CPU_COUNT=2`**: Membatasi worker thread Next.js maksimal 2 core (mencegah 10 worker paralel yang melipatgandakan konsumsi RAM).

## 2. Pengecekan Memori Sebelum Build
Sebelum mengeksekusi kompilasi besar, periksa sisa memori cgroup:
```bash
cat /sys/fs/cgroup/memory.current
```
Jika penggunaan memori mendekati batas (di atas 3.7 GB), hentikan service/daemon background non-esensial sebelum memulai kompilasi.

## 3. Larangan Concurrent Build
DILARANG menjalankan dua proses kompilasi (`npm run build`, `next build`, atau `go build`) secara bersamaan dalam repositori atau profil worker yang sama.
