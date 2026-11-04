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
    created_at TIMESTAMPTZ DEFAULT NOW()
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
    total_alpa INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    gender VARCHAR(16) DEFAULT 'Putra',
    wali_kelas VARCHAR(128),
    guru_id VARCHAR(64)
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

CREATE INDEX IF NOT EXISTS idx_santri_nis ON santri (nis);
CREATE INDEX IF NOT EXISTS idx_santri_class ON santri (class);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_absensi_santri_id ON absensi (santri_id);
CREATE INDEX IF NOT EXISTS idx_absensi_date ON absensi (date);
CREATE INDEX IF NOT EXISTS idx_penilaian_santri_id ON penilaian (santri_id);
CREATE INDEX IF NOT EXISTS idx_public_shares_expires_at ON public_shares (expires_at);
