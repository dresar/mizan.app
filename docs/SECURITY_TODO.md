# Daftar Utang Keamanan (Security TODO - Menjelang Tahap Produksi)

Dokumen ini mencatat hal-hal keamanan yang sengaja ditunda karena masih berada dalam tahap pengembangan (development) dan wajib dilunasi sebelum sistem diluncurkan ke tahap produksi:

1. **CORS Terbuka**:
   - `internal/middleware/security.go` masih mengizinkan origin terbuka (`AllowOrigins: "*"`) untuk mempermudah pengujian multi-perangkat lokal dan tunnel development.
   - *Target Produksi*: Batasi hanya pada domain resmi produksi yang terdaftar.

2. **Daftar Akun Cepat & Tombol Akses Kilat**:
   - `app/login/page.tsx` dan `lib/quick-accounts.ts` masih menyediakan daftar akun uji coba dan tombol login cepat untuk mempercepat pengujian role.
   - *Target Produksi*: Hapus tombol login cepat dan sembunyikan daftar akun dari antarmuka login publik.

3. **Password Master Hardcoded**:
   - `internal/handlers/auth_handler.go` masih menerima kata sandi master (`RDS123`, `RDS1234`, `password123`) untuk kemudahan staging.
   - *Target Produksi*: Hapus seluruh bypass kata sandi master tanpa terkecuali.

4. **Penyimpanan Password Plaintext**:
   - Tabel `users` masih menyimpan password dalam format teks biasa (plaintext) dan verifikasi login masih menggunakan perbandingan string langsung.
   - *Target Produksi*: Terapkan algoritma hashing kriptografis aman (Argon2id atau bcrypt dengan cost factor >= 12) serta migrasi kata sandi bertahap saat login pertama.

5. **Isolasi Gender di Sisi Backend**:
   - Pemisahan santri putra dan putri saat ini masih bertumpu pada filter antarmuka frontend, belum dikunci secara ketat di query database backend per Ustadz/Ustadzah.
   - *Target Produksi*: Terapkan filter gender wajib di middleware atau handler backend sesuai penugasan Ustadz (Putra) dan Ustadzah (Putri).

6. **Audit Log & Jejak Rekam Aktivitas (Audit Logging)**:
   - Operasi tulis kritis seperti perubahan nilai, mutasi santri, penghapusan data, dan reset password belum dicatat ke dalam tabel audit log khusus.
   - *Target Produksi*: Buat tabel `audit_logs` untuk mencatat siapa pelaku, aksi, waktu, IP address, dan nilai sebelum/sesudah perubahan.
