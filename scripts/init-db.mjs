import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function init() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS santri (
        id VARCHAR(64) PRIMARY KEY,
        nis VARCHAR(32) NOT NULL,
        name VARCHAR(128) NOT NULL,
        gender VARCHAR(16) NOT NULL,
        class VARCHAR(32) NOT NULL,
        asrama VARCHAR(128) NOT NULL,
        kamar VARCHAR(32) NOT NULL,
        base_score NUMERIC(7,3) DEFAULT 70.000,
        current_score NUMERIC(7,3) DEFAULT 70.000,
        status VARCHAR(32) DEFAULT 'Baik',
        avatar VARCHAR(8) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS guru_monitoring (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        asrama VARCHAR(128) NOT NULL,
        last_login VARCHAR(64) NOT NULL,
        report_count_today INT DEFAULT 0,
        status VARCHAR(32) DEFAULT 'Belum Lapor'
      );

      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(8) NOT NULL,
        name VARCHAR(128) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS unsurs (
        id VARCHAR(64) PRIMARY KEY,
        category_name VARCHAR(128) NOT NULL,
        name VARCHAR(128) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS indicators (
        id VARCHAR(64) PRIMARY KEY,
        unsur_id VARCHAR(64) NOT NULL,
        text TEXT NOT NULL,
        type VARCHAR(16) NOT NULL,
        default_score NUMERIC(7,3) NOT NULL,
        tingkat VARCHAR(16) DEFAULT 'Sedang'
      );

      CREATE TABLE IF NOT EXISTS penilaian (
        id VARCHAR(64) PRIMARY KEY,
        santri_id VARCHAR(64) NOT NULL REFERENCES santri(id),
        santri_name VARCHAR(128) NOT NULL,
        santri_class VARCHAR(32) NOT NULL,
        santri_asrama VARCHAR(128) NOT NULL,
        guru_id VARCHAR(64) NOT NULL,
        guru_name VARCHAR(128) NOT NULL,
        type VARCHAR(16) NOT NULL,
        category VARCHAR(128) NOT NULL,
        unsur_name VARCHAR(128) NOT NULL,
        indicator_text TEXT NOT NULL,
        tingkat VARCHAR(16) DEFAULT 'Sedang',
        score NUMERIC(7,3) NOT NULL,
        notes TEXT DEFAULT '',
        proof_file_name VARCHAR(256),
        proof_file_size INT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        date_key VARCHAR(16) DEFAULT 'today'
      );

      CREATE TABLE IF NOT EXISTS feedbacks (
        id VARCHAR(64) PRIMARY KEY,
        type VARCHAR(16) NOT NULL,
        category VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        page_url VARCHAR(255),
        user_id VARCHAR(64),
        user_name VARCHAR(128),
        user_role VARCHAR(32),
        ai_analysis JSONB,
        custom_prompt TEXT,
        status VARCHAR(32) DEFAULT 'Baru',
        admin_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key VARCHAR(64) PRIMARY KEY,
        value JSONB NOT NULL
      );
    `);

    const checkSantri = await client.query("SELECT COUNT(*) as count FROM santri");
    if (parseInt(checkSantri.rows[0].count, 10) === 0) {
      const santriData = [
        ["santri-1", "20240801", "Muhammad Zaki Pratama", "Putra", "VIII-A", "Asrama Salman Al-Farisi", "Kamar 03", 70.0, 82.0, "Baik", "MZ"],
        ["santri-2", "20240815", "Ahmad Fauzi Ridwan", "Putra", "VII-B", "Asrama Abu Bakar", "Kamar 01", 70.0, 68.5, "Perhatian", "AF"],
        ["santri-3", "20230711", "Bilal Ramadhan", "Putra", "VIII-B", "Asrama Umar bin Khattab", "Kamar 05", 70.0, 58.0, "Perlu Pembinaan", "BR"],
        ["santri-4", "20230802", "Daffa Ibnu Sina", "Putra", "IX-A", "Asrama Salman Al-Farisi", "Kamar 02", 70.0, 89.25, "Baik", "DI"],
        ["santri-5", "20220914", "Abdullah Naufal", "Putra", "IX-C", "Asrama Abu Bakar", "Kamar 04", 70.0, 95.5, "Baik", "AN"],
        ["santri-6", "20240722", "Fatimah Az-Zahra", "Putri", "VII-A", "Asrama Aisyah", "Kamar 02", 70.0, 76.25, "Baik", "FA"],
        ["santri-7", "20230940", "Maryam Qanita", "Putri", "IX-A", "Asrama Khadijah", "Kamar 01", 70.0, 65.8, "Perhatian", "MQ"],
        ["santri-8", "20221005", "Rayhan Al-Ghifari", "Putra", "X-IPA", "Asrama Ali bin Abi Thalib", "Kamar 04", 70.0, 88.65, "Baik", "RA"]
      ];

      for (const s of santriData) {
        await client.query(
          "INSERT INTO santri (id, nis, name, gender, class, asrama, kamar, base_score, current_score, status, avatar) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
          s
        );
      }
    }

    const checkGuru = await client.query("SELECT COUNT(*) as count FROM guru_monitoring");
    if (parseInt(checkGuru.rows[0].count, 10) === 0) {
      const guruData = [
        ["guru-1", "Ustadz Fauzan Al-Banjari", "Asrama Salman Al-Farisi", "Hari ini, 07:42 WIB", 3, "Sudah Lapor"],
        ["guru-2", "Ustadz Ilham Wahyudi, S.Pd.", "Asrama Abu Bakar", "Hari ini, 06:15 WIB", 0, "Laporan Nihil"],
        ["guru-3", "Ustadz Ridwan Hakim", "Asrama Umar bin Khattab", "Kemarin, 21:30 WIB", 0, "Belum Lapor"],
        ["guru-4", "Ustadzah Siti Munawwarah", "Asrama Khadijah", "Hari ini, 08:10 WIB", 2, "Sudah Lapor"],
        ["guru-5", "Ustadzah Nurul Hidayah", "Asrama Aisyah", "Kemarin, 19:45 WIB", 0, "Belum Lapor"]
      ];
      for (const g of guruData) {
        await client.query(
          "INSERT INTO guru_monitoring (id, name, asrama, last_login, report_count_today, status) VALUES ($1,$2,$3,$4,$5,$6)",
          g
        );
      }
    }

    const checkCat = await client.query("SELECT COUNT(*) as count FROM categories");
    if (parseInt(checkCat.rows[0].count, 10) === 0) {
      await client.query("INSERT INTO categories (id, code, name) VALUES ('cat-a','A','Kedisiplinan'),('cat-b','B','Adab/Ta''zim'),('cat-c','C','Kemandirian & Kebersihan'),('cat-d','D','Ubudiyah/Ibadah'),('cat-e','E','Sikap Mental & Sosial')");

      await client.query(`
        INSERT INTO unsurs (id, category_name, name) VALUES
        ('unsur-a-1', 'Kedisiplinan', 'Disiplin Waktu Dan Aktivitas'),
        ('unsur-a-2', 'Kedisiplinan', 'Disiplin Perizinan'),
        ('unsur-a-3', 'Kedisiplinan', 'Disiplin Atribut Dan Kerapian Fisik'),
        ('unsur-a-4', 'Kedisiplinan', 'Disiplin Larangan Dan Penggunaan Fasilitas'),
        ('unsur-a-5', 'Kedisiplinan', 'Responsibilitas Atas Pelanggaran'),
        ('unsur-b-1', 'Adab/Ta''zim', 'Ta''zim kepada masyayikh dan asatidzah'),
        ('unsur-b-2', 'Adab/Ta''zim', 'Adab Terhadap Ilmu Dan Kitab/Mushaf'),
        ('unsur-b-3', 'Adab/Ta''zim', 'Adab Keseharian Dimajlis & Masjid'),
        ('unsur-b-4', 'Adab/Ta''zim', 'Adab Sesama Santri (Ukhuwah)'),
        ('unsur-b-5', 'Adab/Ta''zim', 'Adab Terhadap Lingkungan Pondok'),
        ('unsur-c-1', 'Kemandirian & Kebersihan', 'Kemandirian Hidup Diasrama'),
        ('unsur-c-2', 'Kemandirian & Kebersihan', 'Kebersihan Kamar Dan Fasilitas Pribadi'),
        ('unsur-c-3', 'Kemandirian & Kebersihan', 'Tanggung Jawab Area Publik'),
        ('unsur-c-4', 'Kemandirian & Kebersihan', 'Penerapan Thaharah Dan Kesehatan Keseharian'),
        ('unsur-d-1', 'Ubudiyah/Ibadah', 'Istiqamah Shalat Wajib Berjama''ah'),
        ('unsur-d-2', 'Ubudiyah/Ibadah', 'Menhidupkan Sunnah Yaumiyah'),
        ('unsur-d-3', 'Ubudiyah/Ibadah', 'Dzikir, Wirid, Dan Do''a'),
        ('unsur-d-4', 'Ubudiyah/Ibadah', 'Interaksi Khidmat Al-Qur''an'),
        ('unsur-d-5', 'Ubudiyah/Ibadah', 'Khidmat Ubudiyah (Petugas Ibadah)'),
        ('unsur-e-1', 'Sikap Mental & Sosial', 'Ketaqwaan Kepada Tuhan'),
        ('unsur-e-2', 'Sikap Mental & Sosial', 'Toleransi Sosial & Empati'),
        ('unsur-e-3', 'Sikap Mental & Sosial', 'Kejujuran & Integritas')
      `);

      await client.query(`
        INSERT INTO indicators (id, unsur_id, text, type, default_score, tingkat) VALUES
        ('ind-e1-h1', 'unsur-e-1', 'Aktif dalam kegiatan keagamaan dan kajian pondok', 'HASANAH', 0.150, 'Sedang'),
        ('ind-e1-h2', 'unsur-e-1', 'Menjaga adab tawadhu'' dan kesucian niat dalam menuntut ilmu', 'HASANAH', 0.100, 'Ringan'),
        ('ind-e1-s1', 'unsur-e-1', 'Mengabaikan panggilan adzan atau pengarahan ibadah', 'SAYYIAH', -0.050, 'Ringan'),
        ('ind-e2-h1', 'unsur-e-2', 'Menolong santri yang sakit dan berbagi keperluan di asrama', 'HASANAH', 0.234, 'Sedang'),
        ('ind-e2-h2', 'unsur-e-2', 'Menjadi teladan kerukunan dan meredakan perselisihan kawan', 'HASANAH', 0.150, 'Sedang'),
        ('ind-e2-s1', 'unsur-e-2', 'Menunjukkan sikap eksklusif atau diskriminasi antarsantri', 'SAYYIAH', -0.200, 'Sedang'),
        ('ind-e3-h1', 'unsur-e-3', 'Menyerahkan barang temuan kepada bagian pengasuhan', 'HASANAH', 0.234, 'Sedang'),
        ('ind-e3-s1', 'unsur-e-3', 'Berbohong atau menyembunyikan fakta saat dimintai keterangan', 'SAYYIAH', -0.234, 'Berat'),
        ('ind-a1-h1', 'unsur-a-1', 'Konsisten hadir dimasjid sebelum adzan berkumandang', 'HASANAH', 0.050, 'Ringan'),
        ('ind-a1-h2', 'unsur-a-1', 'Disiplin mengikuti kegiatan ekstrakurikuler/olahraga wajib', 'HASANAH', 0.050, 'Ringan'),
        ('ind-a1-h3', 'unsur-a-1', 'Tepat waktu dalam mengikuti kegiatan', 'HASANAH', 0.050, 'Ringan'),
        ('ind-a1-s1', 'unsur-a-1', 'Terlambat hadir ke masjid atau kegiatan', 'SAYYIAH', -0.050, 'Ringan'),
        ('ind-a1-s2', 'unsur-a-1', 'Tidak mengikuti ekstrakurikuler/olahraga wajib tanpa uzur', 'SAYYIAH', -0.100, 'Sedang'),
        ('ind-a1-s3', 'unsur-a-1', 'Terlambat kembali ke asrama setelah kegiatan', 'SAYYIAH', -0.050, 'Ringan'),
        ('ind-d1-h1', 'unsur-d-1', 'Konsisten hadir dimasjid sebelum adzan berkumandang', 'HASANAH', 0.050, 'Ringan'),
        ('ind-d1-h2', 'unsur-d-1', 'Tidak masbuk atau tertinggal takbiratul ihram pertama imam', 'HASANAH', 0.050, 'Ringan'),
        ('ind-d1-h3', 'unsur-d-1', 'Menjaga kekhusyukan dan tidak bergurau dalam barisan shalat', 'HASANAH', 0.050, 'Ringan'),
        ('ind-d1-s1', 'unsur-d-1', 'Terlambat/masbuk shalat wajib berjama''ah', 'SAYYIAH', -0.050, 'Ringan'),
        ('ind-d1-s2', 'unsur-d-1', 'Tidur atau mengantuk saat ceramah/shalat', 'SAYYIAH', -0.050, 'Ringan'),
        ('ind-d1-s3', 'unsur-d-1', 'Bergurau atau mengobrol dalam shaf shalat', 'SAYYIAH', -0.100, 'Sedang')
      `);
    }

    const checkPen = await client.query("SELECT COUNT(*) as count FROM penilaian");
    if (parseInt(checkPen.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO penilaian (id, santri_id, santri_name, santri_class, santri_asrama, guru_id, guru_name, type, category, unsur_name, indicator_text, tingkat, score, notes, created_at, date_key) VALUES
        ('pen-1', 'santri-1', 'Muhammad Zaki Pratama', 'VIII-A', 'Asrama Salman Al-Farisi', 'guru-1', 'Ustadz Fauzan Al-Banjari', 'HASANAH', 'Sikap Mental & Sosial', 'Ketaqwaan Kepada Tuhan', 'Aktif dalam kegiatan keagamaan dan kajian pondok', 'Sedang', 0.150, 'Mengikuti kajian hadits maghrib dengan khidmat', NOW(), 'today'),
        ('pen-2', 'santri-2', 'Ahmad Fauzi Ridwan', 'VII-B', 'Asrama Abu Bakar', 'guru-1', 'Ustadz Fauzan Al-Banjari', 'SAYYIAH', 'Kedisiplinan', 'Disiplin Waktu Dan Aktivitas', 'Terlambat hadir ke masjid atau kegiatan', 'Ringan', -0.050, 'Masuk masjid setelah iqomah', NOW(), 'today')
      `);
    }

    console.log("Neon PostgreSQL Database initialized successfully!");
  } finally {
    client.release();
    await pool.end();
  }
}

init().catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
