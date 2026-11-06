export interface WebsiteSettings {
  namaPondok?: string;
  arabicName?: string;
  alamat?: string;
  logo?: string;
  noTelepon?: string;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroTagline?: string;
  heroCtaPrimaryText?: string;
  heroCtaPrimaryLink?: string;
  heroCtaSecondaryText?: string;
  heroCtaSecondaryLink?: string;
  googleMapsEmbedCode?: string;
  qrCodeImage?: string;
  deskripsi?: string;
  favicon?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  headerMobileImage?: string;
  headerMobileHeight?: number;
  maintenanceMessage?: string;
  maintenanceMode?: boolean;
  announcementText?: string;
  announcementLink?: string;
  announcementActive?: boolean;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaPrimaryText?: string;
  ctaPrimaryLink?: string;
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;
  lokasiPendaftaran?: string;
  googleMapsLink?: string;
}

export interface FaqItem {
  id: number;
  pertanyaan: string;
  jawaban: string;
  kategori: string;
  order: number;
  isPublished: boolean;
}

export interface SeragamItem {
  id: number;
  hari: string;
  seragamPutra: string;
  gambarPutra?: string;
  seragamPutri: string;
  gambarPutri?: string;
  order: number;
}

export interface RegistrationFlowItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export interface Payment {
  id: number;
  santri_id: number;
  bank_pengirim: string;
  no_rekening_pengirim: string;
  nama_pemilik_rekening: string;
  rekening_tujuan: string;
  jumlah_transfer: number;
  bukti_transfer: string;
  status: PaymentStatus;
  catatan: string;
  created_at: string;
  updated_at: string;
  verified_at?: string;
  verified_by_id?: number;
}

export interface BankAccount {
  id: number;
  nama_bank: string;
  nama_bank_custom: string;
  logo?: string;
  nomor_rekening: string;
  nama_pemilik_rekening: string;
  biaya_pendaftaran: number;
  is_active: boolean;
  keterangan: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'staff'
  | 'teacher'
  | 'operator'
  | 'petugaspendaftaran'
  | 'bendahara'
  | 'author'
  | 'user'
  | 'santri'
  | (string & {});

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}
