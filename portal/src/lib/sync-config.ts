
// Defines the resources to be prefetched during login/sync
export interface SyncResource {
  key: string;
  endpoint: string;
  label: string;
  priority: 'high' | 'medium' | 'low';
}

export const SYNC_RESOURCES: SyncResource[] = [
  // High Priority (Critical for app structure)
  { key: 'user_profile', endpoint: '/auth/me', label: 'Profil Pengguna', priority: 'high' },
  { key: 'systemSettings', endpoint: '/admin/settings', label: 'Konfigurasi Sistem', priority: 'high' },
  { key: 'websiteSettings', endpoint: '/admin/website-settings', label: 'Pengaturan Website', priority: 'high' },
  
  // Medium Priority (Master Data)
  { key: 'bank_accounts', endpoint: '/admin/generic/bankAccounts', label: 'Data Rekening', priority: 'medium' },
  { key: 'teachers', endpoint: '/admin/teachers', label: 'Data Guru', priority: 'medium' },
  { key: 'programs', endpoint: '/admin/programs', label: 'Program Pendidikan', priority: 'medium' },
  { key: 'facilities', endpoint: '/admin/facilities', label: 'Fasilitas', priority: 'medium' },
  { key: 'categories', endpoint: '/admin/blog/categories', label: 'Kategori Blog', priority: 'medium' },
  { key: 'tags', endpoint: '/admin/blog/tags', label: 'Tag Blog', priority: 'medium' },
  { key: 'founders', endpoint: '/admin/website/founders', label: 'Pendiri', priority: 'medium' },
  { key: 'education', endpoint: '/admin/education', label: 'Riwayat Pendidikan', priority: 'medium' },
  { key: 'history', endpoint: '/admin/history', label: 'Sejarah', priority: 'medium' },
  { key: 'hero_sections', endpoint: '/admin/hero-sections', label: 'Hero Sections', priority: 'medium' },
  { key: 'whatsapp_templates', endpoint: '/admin/whatsapp-templates', label: 'Template WA', priority: 'medium' },
  
  // Low Priority (Transactional Data - Fetch recent only or paginated later)
  // We fetch a small batch to populate initial lists
  { key: 'payments_recent', endpoint: '/admin/payments?limit=20', label: 'Transaksi Terakhir', priority: 'low' },
  { key: 'announcements', endpoint: '/admin/announcements', label: 'Pengumuman', priority: 'low' },
  { key: 'posts_recent', endpoint: '/admin/blog/posts?limit=10', label: 'Artikel Terbaru', priority: 'low' },
  { key: 'testimonials', endpoint: '/admin/testimonials', label: 'Testimoni', priority: 'low' },
  { key: 'gallery_recent', endpoint: '/admin/gallery?limit=20', label: 'Galeri Terbaru', priority: 'low' },
  { key: 'stats', endpoint: '/admin/statistics', label: 'Statistik Dashboard', priority: 'low' },
  { key: 'users_recent', endpoint: '/admin/users?limit=20', label: 'Pengguna Terbaru', priority: 'low' },
];

export const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours
