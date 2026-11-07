export type Role = "SUPER_ADMIN" | "PENGASUHAN" | "GURU" | "ORTU" | "SATPAM" | "adminwebsite";

export type WaktuSholat =
  | "Subuh"
  | "Dhuha"
  | "Dzuhur"
  | "Ashar"
  | "Maghrib"
  | "Isya"
  | "Tahajjud";

export type KategoriUtama =
  | "Kedisiplinan"
  | "Adab/Ta'zim"
  | "Kemandirian & Kebersihan"
  | "Ubudiyah/Ibadah"
  | "Sikap Mental & Sosial"
  | string;

export type Tingkat = "Ringan" | "Sedang" | "Berat";

export type IndikatorType = "HASANAH" | "SAYYIAH";

export type StatusSantri =
  | "Aman"
  | "Peringatan Lisan"
  | "SP 1"
  | "SP 2"
  | "SP 3"
  | "Pengembalian"
  | "Baik"
  | "Perhatian"
  | "Perlu Pembinaan";

export type StatusGuru = "Sudah Lapor" | "Laporan Nihil" | "Belum Lapor";

export type StatusAbsensi = "Hadir" | "Izin" | "Sakit" | "Alpa";

export interface Indikator {
  id: string;
  text: string;
  type: IndikatorType;
  defaultScore: number;
  tingkat?: Tingkat;
}

export interface Unsur {
  id: string;
  name: string;
  type?: IndikatorType;
  indicators: Indikator[];
}

export function formatScore(score: number): string {
  return Number(score).toFixed(3).replace(".", ",");
}

export function formatScoreWithSign(score: number): string {
  const formatted = formatScore(Math.abs(score));
  if (score > 0) return `+${formatted}`;
  if (score < 0) return `-${formatted}`;
  return formatted;
}

export interface Kategori {
  id?: string;
  code: string;
  name: string;
  unsurs: Unsur[];
}

export interface UserProfile {
  id: string;
  username?: string;
  password?: string;
  name: string;
  role: Role;
  roleTitle: string;
  avatarInitials: string;
  avatarUrl?: string;
  gender?: "Putra" | "Putri";
  assignedClass?: string;
  isActive?: boolean;
  santriId?: string;
}

export interface Santri {
  id: string;
  nis: string;
  name: string;
  gender: "Putra" | "Putri";
  class: string;
  asrama?: string;
  kamar?: string;
  baseScore: number;
  currentScore: number;
  status: StatusSantri;
  avatar: string;
  avatarUrl?: string;
  waliName?: string;
  waliPhone?: string;
  totalHadir?: number;
  totalAlpa?: number;
  musyrifId?: string;
  musyrifName?: string;
  musyrifPhone?: string;
  riwayatAlergi?: string;
  riwayatPenyakit?: string;
  dailyPocketLimit?: number;
  pocketBalance?: number;
  currentHealthStatus?: string;
}

export interface TahfidzRecord {
  id: string;
  santriId: string;
  santriName: string;
  gender: "Putra" | "Putri";
  surahName: string;
  ayatStart: number;
  ayatEnd: number;
  halaman?: number;
  juz: number;
  predikat: string;
  targetJuz?: number;
  realisasiJuz?: number;
  catatanUstadz?: string;
  ustadzId?: string;
  ustadzName?: string;
  date: string;
  createdAt?: string;
}

export interface KesehatanRecord {
  id: string;
  santriId: string;
  santriName: string;
  gender: "Putra" | "Putri";
  tanggal: string;
  keluhan: string;
  diagnosa: string;
  tindakanObat: string;
  statusRawat: "Rawat Jalan" | "Istirahat di Kamar" | "Rawat Inap Klinik" | "Rujuk RS" | string;
  petugasNama: string;
  catatan?: string;
  createdAt?: string;
}

export interface PerizinanRecord {
  id: string;
  santriId: string;
  santriName: string;
  santriClass: string;
  gender: "Putra" | "Putri";
  jenisIzin: "Pulang" | "Keluar Sebentar" | "Sakit" | "Acara Pondok / Lomba" | string;
  alasan: string;
  tglKeluar: string;
  tglKembali: string;
  status: "MENUNGGU" | "DISETUJUI" | "DITOLAK" | "BERJALAN" | "SELESAI" | "TERLAMBAT";
  diajukanOleh: string;
  disetujuiOleh?: string;
  qrCodeToken: string;
  buktiSuratUrl?: string;
  waktuKeluarRiil?: string;
  waktuKembaliRiil?: string;
  petugasGerbang?: string;
  createdAt?: string;
}

export interface SambanganRecord {
  id: string;
  santriId: string;
  santriName: string;
  gender: "Putra" | "Putri";
  waliName: string;
  tanggalSambang: string;
  sesiWaktu: string;
  jumlahPengunjung: number;
  status: "TERKONFIRMASI" | "BATAL" | "SELESAI";
  catatan?: string;
  createdAt?: string;
}

export interface TransaksiKeuangan {
  id: string;
  santriId: string;
  santriName: string;
  gender: "Putra" | "Putri";
  kategori: "UANG_SAKU" | "SPP" | "ASRAMA" | "KESEHATAN" | string;
  jenis: "IN" | "OUT";
  nominal: number;
  saldoTerakhir: number;
  deskripsi: string;
  metodePembayaran: "CASH" | "TRANSFER" | "QRIS" | "KOPERASI" | string;
  referensiKode?: string;
  petugasId?: string;
  petugasNama?: string;
  tanggal: string;
  status: "BERHASIL" | "PENDING" | "BATAL";
  createdAt?: string;
}

export interface TagihanSPP {
  id: string;
  santriId: string;
  santriName: string;
  gender: "Putra" | "Putri";
  bulan: string;
  tahun: number;
  nominal: number;
  status: "LUNAS" | "BELUM_LUNAS" | "CICIL";
  jatuhTempo: string;
  tglBayar?: string;
  kuitansiNomor?: string;
  createdAt?: string;
}

export interface CatatanMusyrif {
  id: string;
  santriId: string;
  santriName: string;
  gender: "Putra" | "Putri";
  musyrifId: string;
  musyrifName: string;
  periode: string;
  adabSosialSkor: "Sangat Baik" | "Baik" | "Cukup" | "Butuh Perhatian";
  kemandirianSkor: "Sangat Baik" | "Baik" | "Cukup" | "Butuh Perhatian";
  kebersihanKamarSkor: "Sangat Baik" | "Baik" | "Cukup" | "Butuh Perhatian";
  catatanPerkembangan: string;
  rekomendasiUntukWali?: string;
  createdAt?: string;
}

export interface GuruMonitoring {
  id: string;
  name: string;
  gender: "Putra" | "Putri";
  assignedClass: string;
  asrama?: string;
  lastLogin: string;
  reportCountToday: number;
  status: StatusGuru;
}

export interface AbsensiRecord {
  id: string;
  santriId: string;
  santriName: string;
  santriClass: string;
  gender: "Putra" | "Putri";
  guruId: string;
  guruName: string;
  waktuSholat?: WaktuSholat | string;
  date: string;
  status: StatusAbsensi;
  scoreImpact: number;
  notes?: string;
  createdAt: string;
  rawCreatedAt?: string;
}

export interface PenilaianRecord {
  id: string;
  santriId: string;
  santriName: string;
  santriClass: string;
  santriAsrama?: string;
  guruId: string;
  guruName: string;
  type: IndikatorType;
  category: string;
  unsurName: string;
  indicatorText: string;
  tingkat?: Tingkat;
  score: number;
  notes: string;
  proofFileName?: string;
  proofFileSize?: number;
  createdAt: string;
  dateKey: string;
  date?: string;
  rawCreatedAt?: string;
  incidentDate?: string;
  incidentTime?: string;
  location?: string;
  witnessName?: string;
  dueProcessStatus?: "TERKONFIRMASI" | "MENUNGGU_KONFIRMASI" | "SANGGAHAN" | "DISAHKAN" | "DIBATALKAN";
  sanggahanReason?: string;
  sanggahanAt?: string;
  sanggahanDecision?: "TERIMA" | "TOLAK" | null;
  sanggahanDecisionBy?: string;
  sanggahanNotes?: string;
}

export interface AppSettings {
  defaultBaseScore: number;
  minScoreBaik: number;
  minScorePerhatian: number;
  maxScore: number;
  penaltyRingan: number;
  penaltySedang: number;
  penaltyBerat: number;
  bonusRingan: number;
  bonusSedang: number;
  bonusBesar: number;
  absenHadirScore: number;
  absenIzinScore: number;
  absenSakitScore: number;
  absenAlpaScore: number;
  notifyParents: boolean;
  realtimeSimulation: boolean;
  appLogoUrl?: string;
  popupActive?: boolean;
  popupTitle?: string;
  popupMessage?: string;
  popupSender?: string;
  popupType?: "Pengumuman" | "Nasihat" | "Tausiyah" | "Penting";
  popupTarget?: "Semua" | "GURU" | "PENGASUHAN";
  popupUpdatedAt?: string;
  lisanThreshold?: number;
  lisanMin?: number;
  sp1Threshold?: number;
  sp1Min?: number;
  sp2Threshold?: number;
  sp2Min?: number;
  sp3Threshold?: number;
  sp3Min?: number;
  pengembalianThreshold?: number;
  inputTimeLimitHours?: number;
  sanggahanTimeLimitHours?: number;
  sp1Action?: string;
  sp2Action?: string;
  sp3Action?: string;
  pengembalianAction?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultBaseScore: 70.0,
  minScoreBaik: 70.0,
  minScorePerhatian: 50.0,
  maxScore: 100.0,
  penaltyRingan: -0.05,
  penaltySedang: -0.1,
  penaltyBerat: -0.25,
  bonusRingan: 0.05,
  bonusSedang: 0.1,
  bonusBesar: 0.234,
  absenHadirScore: 0.050,
  absenIzinScore: 0.000,
  absenSakitScore: 0.000,
  absenAlpaScore: -0.050,
  notifyParents: true,
  realtimeSimulation: true,
  appLogoUrl: "/logo.png",
  popupActive: false,
  popupTitle: "",
  popupMessage: "",
  popupSender: "Pimpinan Pesantren",
  popupType: "Nasihat",
  popupTarget: "Semua",
  popupUpdatedAt: "",
  lisanThreshold: 69.0,
  lisanMin: 50.0,
  sp1Threshold: 50.0,
  sp1Min: 36.0,
  sp2Threshold: 35.0,
  sp2Min: 21.0,
  sp3Threshold: 20.0,
  sp3Min: 6.0,
  pengembalianThreshold: 5.0,
  inputTimeLimitHours: 48,
  sanggahanTimeLimitHours: 24,
  sp1Action: "Pemanggilan santri, penulisan surat pengakuan & surat perjanjian, wali santri diinformasikan via WA",
  sp2Action: "Pemanggilan orangtua/wali ke pesantren, hukuman khidmat/kebersihan khusus 3 hari",
  sp3Action: "Surat peringatan terakhir, sanksi botak (putra)/khimar (putri), hafalan Yasin, Al-Waqiah, Ar-Rahman, perjanjian bermaterai",
  pengembalianAction: "Santri dikembalikan secara resmi kepada orangtua (dikeluarkan dari pesantren)"
};

export function getSantriDisciplineStatus(score: number, settings?: AppSettings) {
  const lisanMin = settings?.lisanMin ?? 50.0;
  const sp1Min = settings?.sp1Min ?? 36.0;
  const sp2Min = settings?.sp2Min ?? 21.0;
  const sp3Min = settings?.sp3Min ?? 6.0;
  const base = settings?.defaultBaseScore ?? 70.0;

  if (score >= base) {
    return {
      status: "Aman" as StatusSantri,
      level: 0,
      label: "Aman / Terpuji",
      action: "Adab dan perilaku terjaga dengan baik",
      pic: "Staf Pengasuhan",
      badgeVariant: "baik" as const,
      color: "#065F46",
      bg: "bg-[#ECFDF5]"
    };
  }
  if (score >= lisanMin) {
    return {
      status: "Peringatan Lisan" as StatusSantri,
      level: 1,
      label: "Peringatan Lisan",
      action: "Konseling ringan & peneguran langsung oleh staf pengasuhan",
      pic: "Pengasuhan Santri",
      badgeVariant: "ringan" as const,
      color: "#854D0E",
      bg: "bg-[#FEFCE8]"
    };
  }
  if (score >= sp1Min) {
    return {
      status: "SP 1" as StatusSantri,
      level: 2,
      label: "Surat Peringatan 1 (SP 1)",
      action: settings?.sp1Action || "Pemanggilan santri, surat pengakuan & perjanjian, notifikasi ortu",
      pic: "Pengasuhan Santri",
      badgeVariant: "perhatian" as const,
      color: "#C2410C",
      bg: "bg-[#FFF7ED]"
    };
  }
  if (score >= sp2Min) {
    return {
      status: "SP 2" as StatusSantri,
      level: 3,
      label: "Surat Peringatan 2 (SP 2)",
      action: settings?.sp2Action || "Pemanggilan orangtua/wali ke pesantren, penugasan khidmat 3 hari",
      pic: "Pengasuhan Santri",
      badgeVariant: "sedang" as const,
      color: "#BE123C",
      bg: "bg-[#FFF1F2]"
    };
  }
  if (score >= sp3Min) {
    return {
      status: "SP 3" as StatusSantri,
      level: 4,
      label: "Surat Peringatan 3 (SP 3)",
      action: settings?.sp3Action || "Surat peringatan terakhir, botak/khimar, setoran hafalan Yasin/Waqiah/Rahman, materai",
      pic: "Pimpinan & Pengasuhan",
      badgeVariant: "berat" as const,
      color: "#991B1B",
      bg: "bg-[#FEF2F2]"
    };
  }
  return {
    status: "Pengembalian" as StatusSantri,
    level: 5,
    label: "Pengembalian Santri",
    action: settings?.pengembalianAction || "Santri dikembalikan secara resmi kepada orangtua (dikeluarkan dari pesantren)",
    pic: "Pimpinan Pesantren",
    badgeVariant: "pembinaan" as const,
    color: "#7F1D1D",
    bg: "bg-[#450A0A]/10"
  };
}

export const INITIAL_CLASSES: string[] = [
  "1A", "1B", "2A", "2B", "3A", "3B",
  "4A", "4B", "5A", "5B", "6A", "6B"
];
export const INITIAL_USERS: UserProfile[] = [];
export const INITIAL_SANTRI: Santri[] = [];
export const INITIAL_GURU: GuruMonitoring[] = [];
export const INITIAL_CATEGORIES: Kategori[] = [
  {
    id: "cat-a",
    code: "A",
    name: "Kedisiplinan",
    unsurs: [
      {
        id: "pres-a-1",
        name: "1. Selalu tepat waktu sholat berjama'ah (1 bulan penuh)",
        type: "HASANAH",
        indicators: [
          { id: "ind-pres-a1-1", text: "Disiplin", type: "HASANAH", defaultScore: 0.05, tingkat: "Sedang" },
          { id: "ind-pres-a1-2", text: "Ketaatan/Kepatuhan", type: "HASANAH", defaultScore: 0.05, tingkat: "Sedang" }
        ]
      },
      {
        id: "unsur-a-1",
        name: "1. Keterlambatan masuk sholat berjama'ah",
        type: "SAYYIAH",
        indicators: [
          { id: "ind-a1-1", text: "Terlambat sholat masbuk 1 rakaat", type: "SAYYIAH", defaultScore: -0.05, tingkat: "Ringan" }
        ]
      }
    ]
  },
  {
    id: "cat-b",
    code: "B",
    name: "Adab/Ta'zim",
    unsurs: [
      {
        id: "unsur-b-1",
        name: "1. Berbicara kotor atau kasar",
        type: "SAYYIAH",
        indicators: [
          { id: "ind-b1-1", text: "Mengucapkan kata kotor kepada teman", type: "SAYYIAH", defaultScore: -0.1, tingkat: "Sedang" }
        ]
      }
    ]
  },
  {
    id: "cat-c",
    code: "C",
    name: "Kemandirian & Kebersihan",
    unsurs: [
      {
        id: "unsur-c-1",
        name: "1. Menjaga kebersihan kamar dan lingkungan",
        type: "HASANAH",
        indicators: [
          { id: "ind-c1-1", text: "Kamar terbersih mingguan", type: "HASANAH", defaultScore: 0.1, tingkat: "Berat" }
        ]
      }
    ]
  },
  {
    id: "cat-d",
    code: "D",
    name: "Ubudiyah/Ibadah",
    unsurs: [
      {
        id: "unsur-d-1",
        name: "1. Rajin sholat tahajjud & dhuha",
        type: "HASANAH",
        indicators: [
          { id: "ind-d1-1", text: "Sholat tahajjud rutin", type: "HASANAH", defaultScore: 0.1, tingkat: "Berat" }
        ]
      }
    ]
  },
  {
    id: "cat-e",
    code: "E",
    name: "Prestasi Akademik, Bahasa & Kepemimpinan",
    unsurs: [
      {
        id: "unsur-e-1",
        name: "1. Prestasi bahasa dan pidato",
        type: "HASANAH",
        indicators: [
          { id: "ind-e1-1", text: "Juara pidato bahasa Arab/Inggris", type: "HASANAH", defaultScore: 0.25, tingkat: "Berat" }
        ]
      }
    ]
  }
];
export const INITIAL_PENILAIAN: PenilaianRecord[] = [];
export const INITIAL_ABSENSI: AbsensiRecord[] = [];
export const INITIAL_SETTINGS: AppSettings = DEFAULT_SETTINGS;

export type FeedbackType = "SARAN" | "BUG";
export type FeedbackStatus = "Baru" | "Ditinjau" | "Diproses" | "Selesai" | "Ditolak";
export type FeedbackSeverity = "Rendah" | "Sedang" | "Tinggi" | "Kritis";

export interface AIAnalysisResult {
  summary: string;
  rootCause: string;
  affectedFiles: string[];
  severity: FeedbackSeverity;
  recommendationPrompt: string;
  generatedAt: string;
}

export interface FeedbackRecord {
  id: string;
  type: FeedbackType;
  category: string;
  title: string;
  description: string;
  pageUrl?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  aiAnalysis?: AIAnalysisResult;
  customPrompt?: string;
  status: FeedbackStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type NotificationType = "urgent" | "warning" | "success" | "info";
export type NotificationCategory = "Evaluasi Rapor" | "Presensi Sholat" | "Peringatan Disiplin" | "Pengumuman Pondok" | "Sistem";

export interface MizanNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  category?: NotificationCategory;
  link?: string;
  isActive?: boolean;
  targetRole?: "ALL" | "SUPER_ADMIN" | "PENGASUHAN" | "GURU" | "ORTU";
  createdAt?: string;
  updatedAt?: string;
}

export const INITIAL_NOTIFICATIONS: MizanNotification[] = [];

export const INITIAL_FEEDBACKS: FeedbackRecord[] = [];
