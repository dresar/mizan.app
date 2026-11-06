import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  FileText,
  Settings,
  Building2,
  ImageIcon,
  MessageSquare,
  HelpCircle,
  Bell,
  Calendar,
  BookOpen,
  Award,
  Newspaper,
  Megaphone,
  UserCheck,
  Wallet,
  Globe,
  Sparkles,
  FileCode,
  Tag,
  FolderOpen,
  BookMarked,
  Phone,
  Share2,
  DollarSign,
  Shirt,
  BarChart3,
  Clock,
  Home,
  Bug,
  BookCheck,
  ClipboardList,
  CheckSquare,
  CalendarDays,
  ScrollText,
  School,
  NotebookPen,
  Layers,
  type LucideIcon,
} from 'lucide-react';
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  children?: NavItem[];
  disabled?: boolean;
  roles?: string[]; 
}
export interface NavSection {
  title: string;
  items: NavItem[];
  icon?: LucideIcon;
  roles?: string[]; 
}
export const santriNavigation: NavSection[] = [
  {
    title: 'Santri',
    items: [
      {
        title: 'Dashboard',
        href: '/santri/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Form Pendaftaran',
        href: '/app/form-pendaftaran',
        icon: FileText,
      },
      {
        title: 'Status Pendaftaran',
        href: '/app/status',
        icon: Clock,
      },
      {
        title: 'Pembayaran',
        href: '/app/pembayaran',
        icon: CreditCard,
      },
      {
        title: 'Jadwal Pelajaran',
        href: '/app/jadwal',
        icon: BookOpen,
      },
      {
        title: 'Jadwal Ujian',
        href: '/app/jadwal-ujian',
        icon: Calendar,
      },
      {
        title: 'Notifikasi',
        href: '/app/notifikasi',
        icon: Bell,
      },
      {
        title: 'Pengaturan',
        href: '/app/pengaturan',
        icon: Settings,
      },
    ],
  },
];
export const navigationConfig: NavSection[] = [
  {
    title: 'Overview',
    icon: LayoutDashboard,
    roles: ['admin', 'superadmin', 'staff', 'adminwebsite'],
    items: [
      {
        title: 'Dashboard',
        href: '/admin-cms/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Dashboard Keuangan',
        href: '/admin-cms/financial-dashboard',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'Akademik KMI',
    icon: School,
    badge: 'Demo',
    roles: ['admin', 'superadmin', 'staff', 'adminwebsite'],
    items: [
      {
        title: 'Dashboard KMI',
        href: '/admin-cms/kmi/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Tahun Ajaran',
        href: '/admin-cms/kmi/tahun-ajaran',
        icon: Calendar,
      },
      {
        title: 'Kelas & Rombel',
        href: '/admin-cms/kmi/kelas',
        icon: Layers,
      },
      {
        title: 'Mata Pelajaran',
        href: '/admin-cms/kmi/mapel',
        icon: BookOpen,
      },
      {
        title: 'Penugasan Guru',
        href: '/admin-cms/kmi/guru-mapel',
        icon: UserCheck,
      },
      {
        title: 'Jadwal Pelajaran',
        href: '/admin-cms/kmi/jadwal',
        icon: CalendarDays,
      },
      {
        title: 'Absensi',
        href: '/admin-cms/kmi/absensi',
        icon: CheckSquare,
      },
      {
        title: 'Input Nilai',
        href: '/admin-cms/kmi/nilai',
        icon: NotebookPen,
      },
      {
        title: 'Rapor KMI',
        href: '/admin-cms/kmi/rapor',
        icon: ScrollText,
      },
      {
        title: 'Ko-Kurikuler',
        href: '/admin-cms/kmi/kokur',
        icon: BookCheck,
      },
      {
        title: 'Kalender Akademik',
        href: '/admin-cms/kmi/kalender',
        icon: ClipboardList,
      },
    ],
  },
  {
    title: 'Manajemen Santri',
    icon: Users,
    roles: ['admin', 'superadmin', 'staff', 'petugaspendaftaran'],
    items: [
      {
        title: 'Daftar Santri',
        href: '/admin-cms/admissions',
        icon: Users,
      },
      {
        title: 'List Dokumen Santri',
        href: '/admin-cms/admissions/documents',
        icon: FileText,
      },
      {
        title: 'Jadwal Seleksi',
        href: '/admin-cms/admissions/schedules',
        icon: Calendar,
      },
      {
        title: 'Hasil Seleksi',
        href: '/admin-cms/admissions/results',
        icon: Award,
      },
    ],
  },
  {
    title: 'Keuangan',
    icon: Wallet,
    roles: ['admin', 'superadmin', 'bendahara'],
    items: [
      {
        title: 'Pembayaran',
        href: '/admin-cms/payments',
        icon: CreditCard,
      },
    ],
  },
  {
    title: 'Publikasi Ilmiah',
    icon: BookOpen,
    roles: ['admin', 'superadmin', 'author', 'adminwebsite'],
    items: [
      {
        title: 'Dashboard',
        href: '/admin-cms/publication/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Artikel',
        href: '/admin-cms/publication/articles',
        icon: BookOpen,
      },
      {
        title: 'Jurnal',
        href: '/admin-cms/publication/journals',
        icon: GraduationCap,
      },
      {
        title: 'Kategori',
        href: '/admin-cms/publication/categories',
        icon: FolderOpen,
      },
      {
        title: 'Volume Jurnal',
        href: '/admin-cms/publication/volumes',
        icon: BookMarked,
      },
      {
        title: 'Verifikasi Penulis',
        href: '/admin-cms/publication/authors',
        icon: UserCheck,
      },
    ],
  },
  {
    title: 'Konten Website',
    icon: Globe,
    roles: ['admin', 'superadmin', 'author', 'adminwebsite'],
    items: [
      {
        title: 'Blog & Artikel',
        href: '/admin-cms/blog/posts',
        icon: Newspaper,
      },
      {
        title: 'Kategori',
        href: '/admin-cms/blog/categories',
        icon: FolderOpen,
      },
      {
        title: 'Tag',
        href: '/admin-cms/blog/tags',
        icon: Tag,
      },
      {
        title: 'Pengumuman',
        href: '/admin-cms/announcements',
        icon: Megaphone,
      },
      {
        title: 'Testimoni',
        href: '/admin-cms/testimonials',
        icon: MessageSquare,
      },
    ],
  },
  {
    title: 'Website',
    icon: Settings,
    roles: ['admin', 'superadmin', 'adminwebsite'],
    items: [
      {
        title: 'Halaman Depan',
        href: '/admin-cms/home-settings',
        icon: Home,
      },
      {
        title: 'Pengaturan',
        href: '/admin-cms/website-settings',
        icon: Globe,
      },
      {
        title: 'Alur Pendaftaran',
        href: '/admin-cms/registration-flow',
        icon: Clock,
      },

      {
        title: 'Hero Section',
        href: '/admin-cms/hero-sections',
        icon: Sparkles,
      },
      {
        title: 'Visi & Misi',
        href: '/admin-cms/vision-mission',
        icon: Award,
      },
      {
        title: 'Sejarah',
        href: '/admin-cms/history',
        icon: BookOpen,
      },
      {
        title: 'Struktur Organisasi',
        href: '/admin-cms/organisasi',
        icon: Users,
      },
      {
        title: 'Pendiri & Pengasuh',
        href: '/admin-cms/website/founders',
        icon: Users,
      },
      {
        title: 'Program',
        href: '/admin-cms/programs',
        icon: Calendar,
      },
      {
        title: 'Pendidikan',
        href: '/admin-cms/education',
        icon: GraduationCap,
      },
      {
        title: 'Fasilitas',
        href: '/admin-cms/facilities',
        icon: Building2,
      },
      {
        title: 'Ekstrakurikuler',
        href: '/admin-cms/extracurricular',
        icon: Award,
      },
      {
        title: 'Jadwal Harian',
        href: '/admin-cms/daily-schedule',
        icon: Clock,
      },
      {
        title: 'Biaya Pendidikan',
        href: '/admin-cms/tuition-fees',
        icon: DollarSign,
      },
      {
        title: 'Seragam',
        href: '/admin-cms/uniforms',
        icon: Shirt,
      },
      {
        title: 'Statistik',
        href: '/admin-cms/statistics',
        icon: BarChart3,
      },
      {
        title: 'FAQ',
        href: '/admin-cms/faq',
        icon: HelpCircle,
      },
    ],
  },
  {
    title: 'SDM',
    icon: UserCheck,
    roles: ['admin', 'superadmin', 'adminwebsite'],
    items: [
      {
        title: 'Tenaga Pengajar',
        href: '/admin-cms/teachers',
        icon: UserCheck,
      },
      {
        title: 'Jabatan',
        href: '/admin-cms/positions',
        icon: Award,
      },
    ],
  },
  {
    title: 'Media',
    icon: ImageIcon,
    roles: ['admin', 'superadmin', 'adminwebsite'],
    items: [
      {
        title: 'Manajemen Media',
        href: '/admin-cms/media',
        icon: ImageIcon,
      },
      {
        title: 'Pengaturan Media',
        href: '/admin-cms/media/settings',
        icon: Settings,
      },
      {
        title: 'Galeri',
        href: '/admin-cms/gallery',
        icon: ImageIcon,
      },
      {
        title: 'Album Galeri',
        href: '/admin-cms/documentation',
        icon: FolderOpen,
      },
    ],
  },
  {
    title: 'Komunikasi',
    icon: MessageSquare,
    roles: ['admin', 'superadmin', 'adminwebsite'],
    items: [
      {
        title: 'Kontak Masuk',
        href: '/admin-cms/contacts',
        icon: MessageSquare,
      },
      {
        title: 'Contact Person',
        href: '/admin-cms/contact-persons',
        icon: Phone,
      },
      {
        title: 'Sosial Media',
        href: '/admin-cms/social-media',
        icon: Share2,
      },
      {
        title: 'Template WhatsApp',
        href: '/admin-cms/whatsapp-templates',
        icon: MessageSquare,
      },
    ],
  },
  {
    title: 'Sistem',
    icon: Settings,
    roles: ['admin', 'superadmin', 'adminwebsite'],
    items: [
      {
        title: 'Profil Saya',
        href: '/admin-cms/profile',
        icon: UserCheck,
      },
      {
        title: 'Pengguna',
        href: '/admin-cms/users',
        icon: Users,
      },
      {
        title: 'Pengaturan',
        href: '/admin-cms/settings',
        icon: Settings,
      },
      {
        title: 'Pengaturan Dokumen',
        href: '/admin-cms/document-settings',
        icon: FileText,
      },
      {
        title: 'Template Dokumen',
        href: '/admin-cms/document-templates',
        icon: FileText,
      },
      {
        title: 'AI Generator',
        href: '/admin-cms/ai-generator',
        icon: Sparkles,
      },
      {
        title: 'Bug Notes',
        href: '/admin-cms/bugnotes',
        icon: Bug,
      },
      {
        title: 'Dokumentasi Sistem',
        href: '/admin-cms/system-docs',
        icon: BookMarked,
      },
    ],
  },
];
export const flattenedNav = navigationConfig.flatMap((section) =>
  section.items.map((item) => ({
    ...item,
    section: section.title,
  }))
);
