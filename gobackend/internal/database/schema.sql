CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL,
    role_title VARCHAR(128) NOT NULL DEFAULT '',
    avatar_initials VARCHAR(8) NOT NULL DEFAULT '',
    avatar_url TEXT,
    gender VARCHAR(16) DEFAULT 'Putra',
    assigned_class VARCHAR(32) DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    santri_id VARCHAR(64) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS santri (
    id VARCHAR(64) PRIMARY KEY,
    nis VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    gender VARCHAR(16) NOT NULL,
    class VARCHAR(32) NOT NULL,
    asrama VARCHAR(64),
    kamar VARCHAR(32),
    base_score NUMERIC(7,3) DEFAULT 70.000,
    current_score NUMERIC(7,3) DEFAULT 70.000,
    status VARCHAR(32) DEFAULT 'Baik',
    avatar VARCHAR(255) NOT NULL,
    wali_name VARCHAR(128),
    wali_phone VARCHAR(32),
    total_hadir INTEGER DEFAULT 28,
    total_alpa INTEGER DEFAULT 0,
    musyrif_id VARCHAR(64) DEFAULT '',
    musyrif_name VARCHAR(128) DEFAULT '',
    musyrif_phone VARCHAR(32) DEFAULT '',
    riwayat_alergi TEXT DEFAULT '',
    riwayat_penyakit TEXT DEFAULT '',
    daily_pocket_limit NUMERIC(12,2) DEFAULT 25000,
    pocket_balance NUMERIC(12,2) DEFAULT 0,
    current_health_status VARCHAR(32) DEFAULT 'Sehat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    gender VARCHAR(16) DEFAULT 'Putra',
    wali_kelas VARCHAR(128),
    guru_id VARCHAR(64),
    pendamping_wali VARCHAR(128) DEFAULT '',
    pendamping_id VARCHAR(64) DEFAULT '',
    asisten_wali JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS absensi (
    id VARCHAR(64) PRIMARY KEY,
    santri_id VARCHAR(64) NOT NULL,
    santri_name VARCHAR(128) NOT NULL,
    santri_class VARCHAR(32) NOT NULL,
    gender VARCHAR(16) NOT NULL,
    guru_id VARCHAR(64) NOT NULL,
    guru_name VARCHAR(128) NOT NULL,
    date VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    score_impact NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    waktu_sholat VARCHAR(32) DEFAULT 'Subuh'
);

CREATE TABLE IF NOT EXISTS penilaian (
    id VARCHAR(64) PRIMARY KEY,
    santri_id VARCHAR(64) NOT NULL,
    santri_name VARCHAR(128) NOT NULL,
    santri_class VARCHAR(32) NOT NULL,
    santri_asrama VARCHAR(64) NOT NULL,
    guru_id VARCHAR(64) NOT NULL,
    guru_name VARCHAR(128) NOT NULL,
    type VARCHAR(32) NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT '',
    unsur_name VARCHAR(128) NOT NULL,
    indicator_text TEXT NOT NULL,
    tingkat VARCHAR(32) DEFAULT 'Sedang',
    score NUMERIC(6,3) NOT NULL,
    notes TEXT DEFAULT '',
    proof_file_name VARCHAR(255),
    proof_file_size INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    date_key VARCHAR(32) DEFAULT 'today',
    incident_date VARCHAR(32),
    incident_time VARCHAR(32),
    location VARCHAR(128),
    witness_name VARCHAR(128),
    due_process_status VARCHAR(32) DEFAULT 'DISAHKAN',
    sanggahan_reason TEXT,
    sanggahan_at TIMESTAMPTZ,
    sanggahan_decision VARCHAR(32),
    sanggahan_decision_by VARCHAR(128),
    sanggahan_notes TEXT
);

CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(64) PRIMARY KEY,
    value JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS unsurs (
    id VARCHAR(64) PRIMARY KEY,
    category_name VARCHAR(128) NOT NULL,
    name VARCHAR(128) NOT NULL,
    type VARCHAR(32) DEFAULT 'HASANAH'
);

CREATE TABLE IF NOT EXISTS indicators (
    id VARCHAR(64) PRIMARY KEY,
    unsur_id VARCHAR(64) NOT NULL,
    text TEXT NOT NULL,
    type VARCHAR(32) NOT NULL,
    default_score NUMERIC(5,2) NOT NULL,
    tingkat VARCHAR(32) DEFAULT 'Sedang'
);

CREATE TABLE IF NOT EXISTS guru_monitoring (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    asrama VARCHAR(64),
    last_login VARCHAR(64) NOT NULL,
    report_count_today INTEGER DEFAULT 0,
    status VARCHAR(32) DEFAULT 'Belum Lapor',
    gender VARCHAR(16) DEFAULT 'Putra',
    assigned_class VARCHAR(32) DEFAULT '1A'
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

CREATE TABLE IF NOT EXISTS public_shares (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL,
    period VARCHAR(64) NOT NULL,
    scope VARCHAR(64) NOT NULL DEFAULT 'ALL',
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    time VARCHAR(64),
    category VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL,
    link VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    target_role VARCHAR(32) DEFAULT 'ALL',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tahfidz_records (
    id VARCHAR(64) PRIMARY KEY,
    santri_id VARCHAR(64) NOT NULL,
    santri_name VARCHAR(128) NOT NULL,
    gender VARCHAR(16) NOT NULL,
    surah_name VARCHAR(64) NOT NULL,
    ayat_start INTEGER NOT NULL,
    ayat_end INTEGER NOT NULL,
    halaman NUMERIC(4,1) DEFAULT 1.0,
    juz INTEGER NOT NULL,
    predikat VARCHAR(32) NOT NULL,
    target_juz INTEGER DEFAULT 3,
    realisasi_juz NUMERIC(5,2) DEFAULT 0,
    catatan_ustadz TEXT,
    ustadz_id VARCHAR(64),
    ustadz_name VARCHAR(128),
    date VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kesehatan_records (
    id VARCHAR(64) PRIMARY KEY,
    santri_id VARCHAR(64) NOT NULL,
    santri_name VARCHAR(128) NOT NULL,
    gender VARCHAR(16) NOT NULL,
    tanggal VARCHAR(32) NOT NULL,
    keluhan TEXT NOT NULL,
    diagnosa TEXT NOT NULL,
    tindakan_obat TEXT NOT NULL,
    status_rawat VARCHAR(32) DEFAULT 'Rawat Jalan',
    petugas_nama VARCHAR(128) NOT NULL,
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS perizinan_records (
    id VARCHAR(64) PRIMARY KEY,
    santri_id VARCHAR(64) NOT NULL,
    santri_name VARCHAR(128) NOT NULL,
    santri_class VARCHAR(32) NOT NULL,
    gender VARCHAR(16) NOT NULL,
    jenis_izin VARCHAR(64) NOT NULL,
    alasan TEXT NOT NULL,
    tgl_keluar VARCHAR(32) NOT NULL,
    tgl_kembali VARCHAR(32) NOT NULL,
    status VARCHAR(32) DEFAULT 'MENUNGGU',
    diajukan_oleh VARCHAR(128) NOT NULL,
    disetujui_oleh VARCHAR(128),
    qr_code_token VARCHAR(64) UNIQUE,
    bukti_surat_url TEXT,
    waktu_keluar_riil TIMESTAMPTZ,
    waktu_kembali_riil TIMESTAMPTZ,
    petugas_gerbang VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sambangan_records (
    id VARCHAR(64) PRIMARY KEY,
    santri_id VARCHAR(64) NOT NULL,
    santri_name VARCHAR(128) NOT NULL,
    gender VARCHAR(16) NOT NULL,
    wali_name VARCHAR(128) NOT NULL,
    tanggal_sambang VARCHAR(32) NOT NULL,
    sesi_waktu VARCHAR(32) NOT NULL,
    jumlah_pengunjung INTEGER DEFAULT 2,
    status VARCHAR(32) DEFAULT 'TERKONFIRMASI',
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transaksi_keuangan (
    id VARCHAR(64) PRIMARY KEY,
    santri_id VARCHAR(64) NOT NULL,
    santri_name VARCHAR(128) NOT NULL,
    gender VARCHAR(16) NOT NULL,
    kategori VARCHAR(32) NOT NULL,
    jenis VARCHAR(16) NOT NULL,
    nominal NUMERIC(12,2) NOT NULL,
    saldo_terakhir NUMERIC(12,2) NOT NULL DEFAULT 0,
    deskripsi TEXT NOT NULL,
    metode_pembayaran VARCHAR(32) DEFAULT 'CASH',
    referensi_kode VARCHAR(64),
    petugas_id VARCHAR(64),
    petugas_nama VARCHAR(128),
    tanggal VARCHAR(32) NOT NULL,
    status VARCHAR(32) DEFAULT 'BERHASIL',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tagihan_spp (
    id VARCHAR(64) PRIMARY KEY,
    santri_id VARCHAR(64) NOT NULL,
    santri_name VARCHAR(128) NOT NULL,
    gender VARCHAR(16) NOT NULL,
    bulan VARCHAR(32) NOT NULL,
    tahun INTEGER NOT NULL,
    nominal NUMERIC(12,2) NOT NULL,
    status VARCHAR(32) DEFAULT 'BELUM_LUNAS',
    jatuh_tempo VARCHAR(32) NOT NULL,
    tgl_bayar VARCHAR(32),
    kuitansi_nomor VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catatan_musyrif (
    id VARCHAR(64) PRIMARY KEY,
    santri_id VARCHAR(64) NOT NULL,
    santri_name VARCHAR(128) NOT NULL,
    gender VARCHAR(16) NOT NULL,
    musyrif_id VARCHAR(64) NOT NULL,
    musyrif_name VARCHAR(128) NOT NULL,
    periode VARCHAR(32) NOT NULL,
    adab_sosial_skor VARCHAR(16) DEFAULT 'Baik',
    kemandirian_skor VARCHAR(16) DEFAULT 'Baik',
    kebersihan_kamar_skor VARCHAR(16) DEFAULT 'Baik',
    catatan_perkembangan TEXT NOT NULL,
    rekomendasi_untuk_wali TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    user_name VARCHAR(128),
    user_role VARCHAR(32),
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_backups (
    id VARCHAR(64) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    backup_type VARCHAR(32) DEFAULT 'MANUAL',
    status VARCHAR(32) DEFAULT 'COMPLETED',
    created_by VARCHAR(128),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    user_agent TEXT,
    ip_address VARCHAR(64),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS santri_id VARCHAR(64) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE santri ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE santri ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE santri ADD COLUMN IF NOT EXISTS musyrif_id VARCHAR(64) DEFAULT '';
ALTER TABLE santri ADD COLUMN IF NOT EXISTS musyrif_name VARCHAR(128) DEFAULT '';
ALTER TABLE santri ADD COLUMN IF NOT EXISTS musyrif_phone VARCHAR(32) DEFAULT '';
ALTER TABLE santri ADD COLUMN IF NOT EXISTS riwayat_alergi TEXT DEFAULT '';
ALTER TABLE santri ADD COLUMN IF NOT EXISTS riwayat_penyakit TEXT DEFAULT '';
ALTER TABLE santri ADD COLUMN IF NOT EXISTS daily_pocket_limit NUMERIC(12,2) DEFAULT 25000;
ALTER TABLE santri ADD COLUMN IF NOT EXISTS pocket_balance NUMERIC(12,2) DEFAULT 0;
ALTER TABLE santri ADD COLUMN IF NOT EXISTS current_health_status VARCHAR(32) DEFAULT 'Sehat';
ALTER TABLE classes ADD COLUMN IF NOT EXISTS pendamping_wali VARCHAR(128) DEFAULT '';
ALTER TABLE classes ADD COLUMN IF NOT EXISTS pendamping_id VARCHAR(64) DEFAULT '';
ALTER TABLE classes ADD COLUMN IF NOT EXISTS asisten_wali JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public_shares ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_santri_id ON users (santri_id);
CREATE INDEX IF NOT EXISTS idx_santri_nis ON santri (nis);
CREATE INDEX IF NOT EXISTS idx_santri_class ON santri (class);
CREATE INDEX IF NOT EXISTS idx_santri_gender ON santri (gender);
CREATE INDEX IF NOT EXISTS idx_classes_name ON classes (name);
CREATE INDEX IF NOT EXISTS idx_classes_gender ON classes (gender);
CREATE INDEX IF NOT EXISTS idx_absensi_santri_id ON absensi (santri_id);
CREATE INDEX IF NOT EXISTS idx_absensi_date ON absensi (date);
CREATE INDEX IF NOT EXISTS idx_absensi_class ON absensi (santri_class);
CREATE INDEX IF NOT EXISTS idx_absensi_waktu_sholat ON absensi (waktu_sholat);
CREATE INDEX IF NOT EXISTS idx_penilaian_santri_id ON penilaian (santri_id);
CREATE INDEX IF NOT EXISTS idx_penilaian_guru_id ON penilaian (guru_id);
CREATE INDEX IF NOT EXISTS idx_penilaian_date_key ON penilaian (date_key);
CREATE INDEX IF NOT EXISTS idx_penilaian_type ON penilaian (type);
CREATE INDEX IF NOT EXISTS idx_unsurs_category_name ON unsurs (category_name);
CREATE INDEX IF NOT EXISTS idx_indicators_unsur_id ON indicators (unsur_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks (status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON feedbacks (user_id);
CREATE INDEX IF NOT EXISTS idx_public_shares_expires_at ON public_shares (expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON notifications (target_role);
CREATE INDEX IF NOT EXISTS idx_notifications_is_active ON notifications (is_active);
CREATE INDEX IF NOT EXISTS idx_tahfidz_santri_id ON tahfidz_records (santri_id);
CREATE INDEX IF NOT EXISTS idx_kesehatan_santri_id ON kesehatan_records (santri_id);
CREATE INDEX IF NOT EXISTS idx_perizinan_santri_id ON perizinan_records (santri_id);
CREATE INDEX IF NOT EXISTS idx_perizinan_status ON perizinan_records (status);
CREATE INDEX IF NOT EXISTS idx_perizinan_qr_token ON perizinan_records (qr_code_token);
CREATE INDEX IF NOT EXISTS idx_sambangan_santri_id ON sambangan_records (santri_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_santri_id ON transaksi_keuangan (santri_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_tanggal ON transaksi_keuangan (tanggal);
CREATE INDEX IF NOT EXISTS idx_tagihan_spp_santri_id ON tagihan_spp (santri_id);
CREATE INDEX IF NOT EXISTS idx_tagihan_spp_status ON tagihan_spp (status);
CREATE INDEX IF NOT EXISTS idx_catatan_musyrif_santri_id ON catatan_musyrif (santri_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions (expires_at);
