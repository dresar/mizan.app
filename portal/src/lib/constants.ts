import { NavItem } from '@/types';
export const navItems: NavItem[] = [
  { label: 'Beranda', href: '/' },
  {
    label: 'Profil', href: '/profil',
    children: [
      { label: 'Sejarah', href: '/profil/sejarah' },
      { label: 'Visi & Misi', href: '/profil/visi-misi' },
      { label: 'Struktur Organisasi', href: '/profil/organisasi' },
      { label: 'Tenaga Pengajar', href: '/profil/pengajar' },
    ],
  },
  { label: 'Program', href: '/program' },
  { label: 'Fasilitas', href: '/fasilitas' },
  { label: 'Kehidupan Santri', href: '/kehidupan-santri',
    children: [
      { label: 'Jadwal Harian', href: '/kehidupan-santri/jadwal' },
      { label: 'Ekstrakurikuler', href: '/kehidupan-santri/ekstrakurikuler' },
      { label: 'Galeri', href: '/galeri' },
    ],
  },
  { 
    label: 'Publikasi', href: '#',
    children: [
      { label: 'Berita Terbaru', href: '/blog' },
      { label: 'Jurnal Ilmiah', href: '/jurnal' },
      { label: 'Publikasi Ilmiah', href: '/publikasi' },
    ]
  },
  {
    label: 'Pendaftaran', href: '/pendaftaran',
    children: [
      { label: 'Informasi Pendaftaran', href: '/pendaftaran' },
      { label: 'Alur Pendaftaran', href: '/alur-pendaftaran' },
      { label: 'Daftar Jadi Penulis', href: '/publikasi/register' },
    ],
  },
  { label: 'Kontak', href: '/kontak' },
];