-- Portal Schema for Pesantren Hub Integration
CREATE TABLE IF NOT EXISTS core_websitesettings (
    id bigserial PRIMARY KEY,
    nama_pondok varchar(200) NOT NULL,
    arabic_name varchar(500) NOT NULL,
    alamat text NOT NULL,
    logo text,
    no_telepon varchar(20) NOT NULL,
    email varchar(254) NOT NULL,
    website varchar(200) NOT NULL,
    facebook varchar(200) NOT NULL,
    instagram varchar(200) NOT NULL,
    twitter varchar(200) NOT NULL,
    tiktok varchar(200) NOT NULL,
    hero_title varchar(200) NOT NULL,
    hero_subtitle varchar(200) NOT NULL,
    hero_tagline varchar(300) NOT NULL,
    hero_cta_primary_text varchar(100) NOT NULL,
    hero_cta_primary_link varchar(200) NOT NULL,
    hero_cta_secondary_text varchar(100) NOT NULL,
    hero_cta_secondary_link varchar(200) NOT NULL,
    cta_title varchar(200) DEFAULT 'Siap Bergabung?' NOT NULL,
    cta_description text NOT NULL,
    cta_primary_text varchar(100) DEFAULT 'Daftar Sekarang' NOT NULL,
    cta_primary_link varchar(200) DEFAULT '/pendaftaran' NOT NULL,
    cta_secondary_text varchar(100) DEFAULT 'Hubungi Kami' NOT NULL,
    cta_secondary_link varchar(200) DEFAULT '/kontak' NOT NULL,
    announcement_text varchar(300),
    announcement_link varchar(200),
    announcement_active boolean DEFAULT false,
    lokasi_pendaftaran text NOT NULL,
    google_maps_link varchar(200) NOT NULL,
    google_maps_embed_code text NOT NULL,
    qr_code_image text,
    deskripsi text NOT NULL,
    favicon text,
    meta_title varchar(200) NOT NULL,
    meta_description text NOT NULL,
    meta_keywords varchar(500) NOT NULL,
    updated_at timestamp NOT NULL,
    header_mobile_image text,
    header_mobile_height integer NOT NULL DEFAULT 60,
    maintenance_message text NOT NULL DEFAULT '',
    maintenance_mode boolean NOT NULL DEFAULT false,
    profil_singkat text,
    profil_lengkap text,
    gambar_profil text
);

CREATE TABLE IF NOT EXISTS core_herosection (
    id bigserial PRIMARY KEY,
    title varchar(200) NOT NULL,
    subtitle varchar(200) NOT NULL,
    image text,
    "order" integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_visimisi (
    id bigserial PRIMARY KEY,
    visi text NOT NULL,
    misi text NOT NULL,
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_fasilitas (
    id bigserial PRIMARY KEY,
    nama varchar(200) NOT NULL,
    icon text NOT NULL DEFAULT 'building',
    gambar text,
    "order" integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_tenagapengajar (
    id bigserial PRIMARY KEY,
    nama_lengkap varchar(200) NOT NULL,
    nama_panggilan varchar(100),
    jenis_kelamin varchar(1) NOT NULL DEFAULT 'L',
    foto text,
    tempat_lahir varchar(100),
    tanggal_lahir date,
    alamat text,
    no_hp varchar(20) NOT NULL DEFAULT '-',
    email varchar(254),
    pendidikan_terakhir varchar(200),
    universitas varchar(200),
    tahun_lulus varchar(4),
    bidang_keahlian varchar(200),
    mata_pelajaran varchar(300),
    pengalaman_mengajar text,
    prestasi text,
    riwayat_pendidikan text,
    organisasi text,
    karya_tulis text,
    motto varchar(300),
    whatsapp varchar(20),
    facebook varchar(200),
    instagram varchar(200),
    twitter varchar(200),
    linkedin varchar(200),
    youtube varchar(200),
    tiktok varchar(200),
    "order" integer NOT NULL DEFAULT 0,
    is_published boolean NOT NULL DEFAULT true,
    is_featured boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW(),
    bagian_jabatan_id integer,
    jabatan varchar(100)
);

CREATE TABLE IF NOT EXISTS core_program (
    id bigserial PRIMARY KEY,
    nama varchar(200) NOT NULL,
    slug varchar(200) NOT NULL UNIQUE,
    deskripsi text NOT NULL,
    gambar text,
    tanggal_mulai date,
    tanggal_selesai date,
    status varchar(20) NOT NULL DEFAULT 'active',
    is_featured boolean NOT NULL DEFAULT false,
    meta_title varchar(200) NOT NULL DEFAULT '',
    meta_description text NOT NULL DEFAULT '',
    "order" integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_programpendidikan (
    id bigserial PRIMARY KEY,
    nama varchar(200) NOT NULL,
    akreditasi varchar(50) NOT NULL DEFAULT 'A',
    icon text NOT NULL DEFAULT '',
    gambar text,
    "order" integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_sejarahtimeline (
    id bigserial PRIMARY KEY,
    judul varchar(200) NOT NULL,
    icon text NOT NULL DEFAULT '',
    deskripsi text NOT NULL,
    "order" integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_ekstrakurikuler (
    id bigserial PRIMARY KEY,
    nama varchar(200) NOT NULL,
    icon text NOT NULL DEFAULT '',
    gambar text,
    "order" integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_jadwalharian (
    id bigserial PRIMARY KEY,
    waktu varchar(50) NOT NULL,
    judul varchar(200) NOT NULL,
    deskripsi text NOT NULL,
    kategori varchar(20) NOT NULL,
    target varchar(20),
    "order" integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_persyaratan (
    id bigserial PRIMARY KEY,
    persyaratan_santri text NOT NULL,
    persyaratan_santriwati text NOT NULL,
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_alurpendaftaran (
    id bigserial PRIMARY KEY,
    gambar_utama text,
    alur_pendaftaran text NOT NULL,
    tahapan_tes text NOT NULL,
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_registration_flow (
    id bigserial PRIMARY KEY,
    title varchar(200) NOT NULL,
    description text NOT NULL,
    icon text NOT NULL DEFAULT '',
    "order" integer NOT NULL DEFAULT 0,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_biayapendidikan (
    id bigserial PRIMARY KEY,
    tipe varchar(50) NOT NULL,
    nama varchar(200) NOT NULL,
    jumlah numeric(12, 0) NOT NULL DEFAULT 0,
    keterangan varchar(200) NOT NULL DEFAULT '',
    "order" integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_founders (
    id bigserial PRIMARY KEY,
    nama_lengkap varchar(100) NOT NULL,
    tanggal_lahir date NOT NULL,
    jabatan varchar(50) NOT NULL,
    nik text NOT NULL DEFAULT '',
    email text NOT NULL DEFAULT '',
    no_telepon varchar(20) NOT NULL DEFAULT '',
    alamat varchar(255) NOT NULL DEFAULT '',
    foto text NOT NULL DEFAULT '',
    pendidikan_terakhir varchar(20) NOT NULL DEFAULT '',
    profil_singkat varchar(200) NOT NULL DEFAULT '',
    is_deleted boolean DEFAULT false NOT NULL,
    created_by integer,
    updated_by integer,
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_struktur_organisasi (
    id bigserial PRIMARY KEY,
    nama varchar(200) NOT NULL,
    jabatan varchar(200) NOT NULL,
    foto text,
    parent_id integer,
    level integer NOT NULL DEFAULT 0,
    "order" integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_form_config (
    id bigserial PRIMARY KEY,
    form_name varchar(100) NOT NULL,
    field_key varchar(100) NOT NULL,
    field_label varchar(200) NOT NULL,
    field_value text NOT NULL,
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_kontak (
    id bigserial PRIMARY KEY,
    nama varchar(200) NOT NULL,
    email varchar(254) NOT NULL,
    no_hp varchar(20) NOT NULL DEFAULT '',
    subjek varchar(200) NOT NULL,
    pesan text NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'unread',
    balasan text NOT NULL DEFAULT '',
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_faq (
    id bigserial PRIMARY KEY,
    pertanyaan varchar(500) NOT NULL,
    jawaban text NOT NULL,
    kategori varchar(100) NOT NULL DEFAULT 'Umum',
    "order" integer NOT NULL DEFAULT 0,
    is_published boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_statistik (
    id bigserial PRIMARY KEY,
    judul varchar(200) NOT NULL,
    nilai varchar(100) NOT NULL,
    icon text NOT NULL DEFAULT 'chart',
    deskripsi varchar(300) NOT NULL DEFAULT '',
    warna varchar(50) NOT NULL DEFAULT 'blue',
    "order" integer NOT NULL DEFAULT 0,
    is_published boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS core_whatsapptemplate (
    id bigserial PRIMARY KEY,
    nama varchar(200) NOT NULL,
    tipe varchar(20) NOT NULL DEFAULT 'umum',
    pesan text NOT NULL,
    variabel varchar(500) NOT NULL DEFAULT '',
    "order" integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW(),
    kategori_id integer
);

CREATE TABLE IF NOT EXISTS blog_category (
    id bigserial PRIMARY KEY,
    name varchar(100) NOT NULL UNIQUE,
    slug varchar(100) NOT NULL UNIQUE,
    "order" integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_blogpost (
    id bigserial PRIMARY KEY,
    title varchar(200) NOT NULL,
    slug varchar(200) NOT NULL UNIQUE,
    content text NOT NULL,
    excerpt text NOT NULL,
    featured_image text,
    meta_title varchar(200) NOT NULL DEFAULT '',
    meta_description text NOT NULL DEFAULT '',
    meta_keywords varchar(255) NOT NULL DEFAULT '',
    video_file text,
    video_url varchar(500),
    gallery json,
    views_count integer DEFAULT 0 NOT NULL,
    likes_count integer DEFAULT 0 NOT NULL,
    shares_count integer DEFAULT 0 NOT NULL,
    status varchar(20) DEFAULT 'published' NOT NULL,
    published_at timestamp,
    is_featured boolean DEFAULT false NOT NULL,
    created_at timestamp DEFAULT NOW() NOT NULL,
    updated_at timestamp DEFAULT NOW() NOT NULL,
    author_id integer NOT NULL DEFAULT 1,
    category_id integer
);

CREATE TABLE IF NOT EXISTS blog_tag (
    id bigserial PRIMARY KEY,
    name varchar(50) NOT NULL UNIQUE,
    slug varchar(50) NOT NULL UNIQUE,
    "order" integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_blogpost_tags (
    id bigserial PRIMARY KEY,
    blogpost_id integer NOT NULL,
    tag_id integer NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_testimoni (
    id bigserial PRIMARY KEY,
    nama varchar(200) NOT NULL,
    foto text,
    jabatan varchar(200) NOT NULL DEFAULT 'Wali Santri',
    testimoni text NOT NULL,
    rating integer NOT NULL DEFAULT 5,
    is_published boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    created_at timestamp DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_pengumuman (
    id bigserial PRIMARY KEY,
    judul varchar(200) NOT NULL,
    slug varchar(200) NOT NULL UNIQUE,
    konten text NOT NULL,
    gambar text,
    status varchar(20) NOT NULL DEFAULT 'published',
    is_penting boolean NOT NULL DEFAULT false,
    published_at timestamp,
    meta_title varchar(200) NOT NULL DEFAULT '',
    meta_description text NOT NULL DEFAULT '',
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admissions_santri (
    id bigserial PRIMARY KEY,
    nama_lengkap varchar(200) NOT NULL,
    nisn varchar(20) NOT NULL UNIQUE,
    tempat_lahir varchar(100) NOT NULL DEFAULT '-',
    tanggal_lahir date NOT NULL DEFAULT '2010-01-01',
    jenis_kelamin varchar(10) NOT NULL DEFAULT 'L',
    agama varchar(20) NOT NULL DEFAULT 'Islam',
    golongan_darah varchar(3) NOT NULL DEFAULT '-',
    tinggi_badan integer DEFAULT 0,
    berat_badan integer DEFAULT 0,
    nama_ayah varchar(200) NOT NULL DEFAULT '-',
    nik_ayah varchar(16) NOT NULL DEFAULT '-',
    nama_ibu varchar(200) NOT NULL DEFAULT '-',
    nik_ibu varchar(16) NOT NULL DEFAULT '-',
    pekerjaan_ayah varchar(100) NOT NULL DEFAULT '-',
    pekerjaan_ibu varchar(100) NOT NULL DEFAULT '-',
    no_hp_ayah varchar(20) NOT NULL DEFAULT '-',
    no_hp_ibu varchar(20) NOT NULL DEFAULT '-',
    alamat_orangtua text NOT NULL DEFAULT '-',
    alamat text NOT NULL DEFAULT '-',
    no_hp varchar(20) NOT NULL DEFAULT '-',
    email varchar(254) NOT NULL DEFAULT '-',
    asal_sekolah varchar(200) NOT NULL DEFAULT '-',
    kelas_terakhir varchar(50) NOT NULL DEFAULT '-',
    tahun_lulus varchar(4) NOT NULL DEFAULT '2025',
    no_ijazah varchar(50) NOT NULL DEFAULT '-',
    foto_santri text,
    foto_ktp text,
    foto_akta text,
    foto_ijazah text,
    foto_kk text,
    surat_sehat text,
    foto_santri_approved boolean NOT NULL DEFAULT false,
    foto_ktp_approved boolean NOT NULL DEFAULT false,
    foto_akta_approved boolean NOT NULL DEFAULT false,
    foto_ijazah_approved boolean NOT NULL DEFAULT false,
    foto_kk_approved boolean NOT NULL DEFAULT false,
    surat_sehat_approved boolean NOT NULL DEFAULT false,
    catatan text NOT NULL DEFAULT '-',
    status varchar(20) NOT NULL DEFAULT 'pending',
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW(),
    agama_ayah varchar(20) NOT NULL DEFAULT 'Islam',
    agama_ibu varchar(20) NOT NULL DEFAULT 'Islam',
    anak_ke integer DEFAULT 1,
    bahasa_sehari_hari varchar(50) NOT NULL DEFAULT 'Indonesia',
    desa varchar(100) NOT NULL DEFAULT '-',
    jumlah_saudara integer DEFAULT 0,
    kabupaten varchar(100) NOT NULL DEFAULT '-',
    kecamatan varchar(100) NOT NULL DEFAULT '-',
    kelas_diterima varchar(50) NOT NULL DEFAULT '1',
    kewarganegaraan varchar(50) NOT NULL DEFAULT 'WNI',
    kewarganegaraan_ayah varchar(50) NOT NULL DEFAULT 'WNI',
    kewarganegaraan_ibu varchar(50) NOT NULL DEFAULT 'WNI',
    kode_pos varchar(10) NOT NULL DEFAULT '-',
    nama_panggilan varchar(100) NOT NULL DEFAULT '-',
    npsn_sekolah varchar(20) NOT NULL DEFAULT '-',
    pendidikan_ayah varchar(50) NOT NULL DEFAULT '-',
    pendidikan_ibu varchar(50) NOT NULL DEFAULT '-',
    penghasilan_ayah varchar(50) DEFAULT '-',
    penghasilan_ibu varchar(50) DEFAULT '-',
    provinsi varchar(100) NOT NULL DEFAULT '-',
    riwayat_penyakit varchar(200) NOT NULL DEFAULT '-',
    status_ayah varchar(10) NOT NULL DEFAULT 'hidup',
    status_ibu varchar(10) NOT NULL DEFAULT 'hidup',
    tanggal_diterima date,
    tanggal_lahir_ayah date,
    tanggal_lahir_ibu date,
    tempat_lahir_ayah varchar(100) NOT NULL DEFAULT '-',
    tempat_lahir_ibu varchar(100) NOT NULL DEFAULT '-',
    tinggal_dengan varchar(50) NOT NULL DEFAULT 'Orang Tua'
);

CREATE TABLE IF NOT EXISTS users_user (
    id bigserial PRIMARY KEY,
    password varchar(128) NOT NULL,
    last_login timestamp,
    is_superuser boolean NOT NULL DEFAULT false,
    username varchar(150) NOT NULL UNIQUE,
    first_name varchar(150) NOT NULL DEFAULT '',
    last_name varchar(150) NOT NULL DEFAULT '',
    email varchar(254) NOT NULL DEFAULT '',
    is_staff boolean NOT NULL DEFAULT true,
    is_active boolean NOT NULL DEFAULT true,
    date_joined timestamp NOT NULL DEFAULT NOW(),
    role varchar(20) NOT NULL DEFAULT 'admin',
    phone varchar(20) NOT NULL DEFAULT '',
    avatar text,
    is_notification_seen boolean DEFAULT false NOT NULL,
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users_loginhistory (
    id bigserial PRIMARY KEY,
    username varchar(150) NOT NULL,
    ip_address varchar(39),
    user_agent text NOT NULL DEFAULT '',
    status varchar(10) NOT NULL DEFAULT 'success',
    error_message varchar(255) NOT NULL DEFAULT '',
    created_at timestamp NOT NULL DEFAULT NOW(),
    user_id integer
);

CREATE TABLE IF NOT EXISTS document_settings (
    id bigserial PRIMARY KEY,
    kop_surat_image text,
    kop_surat_height integer DEFAULT 30 NOT NULL,
    kop_surat_opacity integer DEFAULT 100 NOT NULL,
    show_kop_surat boolean DEFAULT true NOT NULL,
    margin_top integer DEFAULT 10 NOT NULL,
    margin_bottom integer DEFAULT 10 NOT NULL,
    margin_left integer DEFAULT 15 NOT NULL,
    margin_right integer DEFAULT 15 NOT NULL,
    paper_size varchar(10) DEFAULT 'A4' NOT NULL,
    orientation varchar(10) DEFAULT 'portrait' NOT NULL,
    watermark_text varchar(100),
    watermark_opacity integer DEFAULT 10 NOT NULL,
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_templates (
    id bigserial PRIMARY KEY,
    name varchar(200) NOT NULL,
    type varchar(50) NOT NULL,
    content text NOT NULL,
    orientation varchar(10) DEFAULT 'portrait' NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments_bankaccount (
    id bigserial PRIMARY KEY,
    nama_bank varchar(100) NOT NULL,
    nama_bank_custom varchar(100) NOT NULL DEFAULT '',
    logo text,
    nomor_rekening varchar(50) NOT NULL,
    nama_pemilik_rekening varchar(200) NOT NULL,
    biaya_pendaftaran numeric(10, 0) NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    keterangan text NOT NULL DEFAULT '',
    "order" integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments_payment (
    id bigserial PRIMARY KEY,
    bank_pengirim varchar(50) NOT NULL,
    no_rekening_pengirim varchar(50) NOT NULL,
    nama_pemilik_rekening varchar(200) NOT NULL,
    rekening_tujuan varchar(50) NOT NULL,
    jumlah_transfer numeric(12, 2) NOT NULL,
    bukti_transfer text,
    status varchar(20) NOT NULL DEFAULT 'pending',
    catatan text NOT NULL DEFAULT '',
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW(),
    verified_at timestamp,
    santri_id integer NOT NULL,
    verified_by_id integer
);

-- Seed Initial Default Records
INSERT INTO core_websitesettings (
    id, nama_pondok, arabic_name, alamat, logo, no_telepon, email, website,
    facebook, instagram, twitter, tiktok,
    hero_title, hero_subtitle, hero_tagline,
    hero_cta_primary_text, hero_cta_primary_link,
    hero_cta_secondary_text, hero_cta_secondary_link,
    cta_title, cta_description,
    cta_primary_text, cta_primary_link,
    cta_secondary_text, cta_secondary_link,
    announcement_text, announcement_link, announcement_active,
    lokasi_pendaftaran, google_maps_link, google_maps_embed_code,
    deskripsi, meta_title, meta_description, meta_keywords,
    updated_at, header_mobile_height, maintenance_message, maintenance_mode,
    profil_singkat, profil_lengkap
) VALUES (
    1,
    'Pondok Pesantren Mizan',
    'المعهد الإسلامي ميزان',
    'Jl. Raya Pesantren No. 1, Cirebon, Jawa Barat',
    '/assets/logo.png',
    '081234567890',
    'admin@pesantren.com',
    'https://pesantren.com',
    'https://facebook.com/pesantren',
    'https://instagram.com/pesantren',
    'https://twitter.com/pesantren',
    'https://tiktok.com/@pesantren',
    'Selamat Datang di Pondok Pesantren Mizan',
    'Membangun Generasi Qurani, Cerdas, dan Berakhlak Mulia',
    'Berilmu, Beramal, Bertaqwa',
    'Daftar Sekarang',
    '/psb',
    'Tentang Kami',
    '/profil',
    'Siap Bergabung?',
    'Daftarkan putra-putri Anda untuk masa depan berakhlak mulia dan berwawasan luas.',
    'Daftar Sekarang',
    '/psb',
    'Hubungi Kami',
    '/kontak',
    'Pendaftaran Santri Baru Tahun Ajaran 2026/2027 Telah Dibuka',
    '/psb',
    true,
    'Kantor Sekretariat PSB Pesantren Mizan',
    'https://maps.google.com',
    '',
    'Pondok Pesantren Mizan adalah lembaga pendidikan Islam terpadu yang memadukan keunggulan tahfidzul quran, dirasah islamiyah, dan sains modern.',
    'Pondok Pesantren Mizan - Lembaga Pendidikan Islam Terpadu',
    'Pondok Pesantren Mizan mendidik generasi berilmu amaliah dan beramal ilmiah berlandaskan Al-Quran dan Sunnah.',
    'pesantren, pondok pesantren, tahfidz, santri, cirebon, sekolah islam',
    NOW(),
    60,
    'Website sedang dalam pemeliharaan.',
    false,
    'Pusat keunggulan pendidikan Islam integratif di Indonesia.',
    'Pondok Pesantren Mizan berkomitmen mencetak generasi santri yang mandiri, berilmu amaliah, dan siap menghadapi tantangan zaman modern.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO core_herosection (id, title, subtitle, image, "order", is_active, created_at)
VALUES 
(1, 'Mencetak Generasi Qurani Berkarakter', 'Pendidikan holistik berbasis integrasi ilmu agama dan sains modern', '/assets/hero-1.jpg', 1, true, NOW()),
(2, 'Lingkungan Asri dan Fasilitas Lengkap', 'Mendukung kenyamanan belajar dan menghafal Al-Quran santri', '/assets/hero-2.jpg', 2, true, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO core_visimisi (id, visi, misi, updated_at)
VALUES (
    1,
    'Menjadi pusat keunggulan pendidikan Islam yang menghasilkan generasi bertauhid kokoh, berwawasan luas, dan berakhlak mulia.',
    '1. Menyelenggarakan pendidikan tahfidz Al-Quran berstandar mutqin.\n2. Mengintegrasikan kurikulum kepesantrenan salaf dan kurikulum nasional.\n3. Membina karakter kepemimpinan, kemandirian, dan kepedulian sosial.',
    NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO core_fasilitas (id, nama, icon, gambar, "order", created_at)
VALUES
(1, 'Masjid Jami Utama', 'building', '/assets/fasilitas-masjid.jpg', 1, NOW()),
(2, 'Asrama Santri Nyaman & Terawat', 'home', '/assets/fasilitas-asrama.jpg', 2, NOW()),
(3, 'Laboratorium Komputer & Sains Terpadu', 'laptop', '/assets/fasilitas-lab.jpg', 3, NOW()),
(4, 'Perpustakaan Digital & Kitab Klasik', 'book', '/assets/fasilitas-perpustakaan.jpg', 4, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO core_tenagapengajar (
    id, nama_lengkap, nama_panggilan, jenis_kelamin, no_hp, email,
    jabatan, mata_pelajaran, "order", is_published, is_featured, created_at, updated_at
) VALUES
(1, 'K.H. Abdullah Mizan, Lc., M.A.', 'Kyai Mizan', 'L', '081234567891', 'kyai@pesantren.com', 'Pimpinan Pondok', 'Tafsir & Hadits', 1, true, true, NOW(), NOW()),
(2, 'Ust. Ahmad Fauzi, S.Pd.I, M.Ag.', 'Ust. Fauzi', 'L', '081234567892', 'fauzi@pesantren.com', 'Kepala Pengasuhan & Tahfidz', 'Tahfidz Al-Quran', 2, true, true, NOW(), NOW()),
(3, 'Usth. Siti Maryam, S.Pd., Gr.', 'Usth. Maryam', 'P', '081234567893', 'maryam@pesantren.com', 'Koordinator Bahasa Asing', 'Bahasa Arab & Inggris', 3, true, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO core_program (id, nama, slug, deskripsi, status, is_featured, meta_title, meta_description, "order", created_at, updated_at)
VALUES (
    1,
    'Tahfidzul Quran 30 Juz Bersanad',
    'tahfidzul-quran-30-juz',
    'Program intensif menghafal Al-Quran 30 juz dengan bimbingan muhaffizh bersanad serta pembelajaran ilmu tajwid dan tahsin.',
    'active',
    true,
    'Program Tahfidzul Quran 30 Juz - Pesantren Mizan',
    'Program unggulan hafalan Al-Quran 30 juz di Pondok Pesantren Mizan.',
    1,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO core_faq (id, pertanyaan, jawaban, kategori, "order", is_published, created_at)
VALUES
(1, 'Bagaimana alur pendaftaran santri baru?', 'Pendaftaran dilakukan secara online pada menu PSB, melengkapi berkas digital, lalu mengikuti ujian seleksi masuk.', 'PSB', 1, true, NOW()),
(2, 'Berapa target hafalan Al-Quran santri?', 'Target standar adalah minimal 5 Juz per tahun untuk program reguler dan 30 Juz untuk program takhasus tahfidz.', 'Akademik', 2, true, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO core_statistik (id, judul, nilai, icon, deskripsi, warna, "order", is_published, created_at)
VALUES
(1, 'Santri Aktif', '1,250+', 'users', 'Santri putra dan putri dari seluruh Nusantara', 'blue', 1, true, NOW()),
(2, 'Tenaga Pengajar', '85+', 'user-check', 'Asatidz berpendidikan tinggi lulusan dalam & luar negeri', 'green', 2, true, NOW()),
(3, 'Alumni Tahfidz', '420+', 'award', 'Santri telah menyelesaikan hafalan 30 Juz mutqin', 'amber', 3, true, NOW()),
(4, 'Akreditasi Lembaga', 'A Unggul', 'star', 'Terakreditasi resmi BAN-SM & Kemenag RI', 'purple', 4, true, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO blog_category (id, name, slug, "order", created_at)
VALUES
(1, 'Kabar Pesantren', 'kabar-pesantren', 1, NOW()),
(2, 'Prestasi Santri', 'prestasi-santri', 2, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO users_user (
    id, password, is_superuser, username, first_name, last_name, email,
    is_staff, is_active, date_joined, role, phone, created_at, updated_at
) VALUES (
    1,
    '$2a$10$b0PeE80L3QTd.cXNRTmLv.cL9c26TlmGqwaHF7OkWKXj2dgFXpPw.',
    true,
    'admin',
    'Super',
    'Admin',
    'admin@pesantren.com',
    true,
    true,
    NOW(),
    'superadmin',
    '081234567890',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO users_user (
    id, password, is_superuser, username, first_name, last_name, email,
    is_staff, is_active, date_joined, role, phone, created_at, updated_at
) VALUES (
    2,
    '$2a$10$b0PeE80L3QTd.cXNRTmLv.cL9c26TlmGqwaHF7OkWKXj2dgFXpPw.',
    false,
    'adminwebsite',
    'Admin',
    'Website',
    'adminwebsite@pesantren.com',
    true,
    true,
    NOW(),
    'adminwebsite',
    '081234567891',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO blog_blogpost (
    id, title, slug, content, excerpt, featured_image,
    meta_title, meta_description, meta_keywords,
    views_count, likes_count, shares_count, status,
    published_at, is_featured, created_at, updated_at,
    author_id, category_id
) VALUES (
    1,
    'Penerimaan Santri Baru (PSB) Tahun Ajaran 2026/2027 Resmi Dibuka',
    'sample-post',
    '<p>Pondok Pesantren Mizan secara resmi membuka pendaftaran santri baru untuk jenjang MTs dan MA tahun ajaran 2026/2027. Pendaftaran dilakukan secara daring melalui portal resmi ini.</p><p>Para calon santri akan mendapatkan fasilitas asrama modern, bimbingan tahfidz intensif, dan kurikulum integratif berstandar nasional.</p>',
    'Penerimaan Santri Baru (PSB) Tahun Ajaran 2026/2027 resmi dibuka mulai hari ini secara online.',
    '/assets/sample-post.jpg',
    'PSB 2026/2027 Resmi Dibuka - Pondok Pesantren Mizan',
    'Informasi lengkap penerimaan santri baru Pondok Pesantren Mizan.',
    'psb, santri baru, pendaftaran, pesantren mizan',
    15,
    5,
    2,
    'published',
    NOW(),
    true,
    NOW(),
    NOW(),
    1,
    1
) ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('core_websitesettings', 'id'), COALESCE((SELECT MAX(id) FROM core_websitesettings), 1));
SELECT setval(pg_get_serial_sequence('core_herosection', 'id'), COALESCE((SELECT MAX(id) FROM core_herosection), 1));
SELECT setval(pg_get_serial_sequence('core_visimisi', 'id'), COALESCE((SELECT MAX(id) FROM core_visimisi), 1));
SELECT setval(pg_get_serial_sequence('core_fasilitas', 'id'), COALESCE((SELECT MAX(id) FROM core_fasilitas), 1));
SELECT setval(pg_get_serial_sequence('core_tenagapengajar', 'id'), COALESCE((SELECT MAX(id) FROM core_tenagapengajar), 1));
SELECT setval(pg_get_serial_sequence('core_program', 'id'), COALESCE((SELECT MAX(id) FROM core_program), 1));
SELECT setval(pg_get_serial_sequence('core_faq', 'id'), COALESCE((SELECT MAX(id) FROM core_faq), 1));
SELECT setval(pg_get_serial_sequence('core_statistik', 'id'), COALESCE((SELECT MAX(id) FROM core_statistik), 1));
SELECT setval(pg_get_serial_sequence('blog_category', 'id'), COALESCE((SELECT MAX(id) FROM blog_category), 1));
SELECT setval(pg_get_serial_sequence('users_user', 'id'), COALESCE((SELECT MAX(id) FROM users_user), 1));
SELECT setval(pg_get_serial_sequence('blog_blogpost', 'id'), COALESCE((SELECT MAX(id) FROM blog_blogpost), 1));
