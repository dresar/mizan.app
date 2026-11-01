export type Role = "SUPER_ADMIN" | "PENGASUHAN" | "GURU" | "ORTU";

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
  defaultBaseScore: 80.0,
  minScoreBaik: 80.0,
  minScorePerhatian: 61.0,
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
  lisanThreshold: 79.0,
  lisanMin: 61.0,
  sp1Threshold: 60.0,
  sp1Min: 46.0,
  sp2Threshold: 45.0,
  sp2Min: 31.0,
  sp3Threshold: 30.0,
  sp3Min: 16.0,
  pengembalianThreshold: 15.0,
  inputTimeLimitHours: 48,
  sanggahanTimeLimitHours: 24,
  sp1Action: "Pemanggilan santri, penulisan surat pengakuan & surat perjanjian, wali santri diinformasikan via WA",
  sp2Action: "Pemanggilan orangtua/wali ke pesantren, hukuman khidmat/kebersihan khusus 3 hari",
  sp3Action: "Surat peringatan terakhir, sanksi botak (putra)/khimar (putri), hafalan Yasin, Al-Waqiah, Ar-Rahman, perjanjian bermaterai",
  pengembalianAction: "Santri dikembalikan secara resmi kepada orangtua (dikeluarkan dari pesantren)"
};

export function getSantriDisciplineStatus(score: number, settings?: AppSettings) {
  const lisanMin = settings?.lisanMin ?? 61.0;
  const sp1Min = settings?.sp1Min ?? 46.0;
  const sp2Min = settings?.sp2Min ?? 31.0;
  const sp3Min = settings?.sp3Min ?? 16.0;
  const base = settings?.defaultBaseScore ?? 80.0;

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

export const INITIAL_CLASSES: string[] = [];
export const INITIAL_USERS: UserProfile[] = [];
export const INITIAL_SANTRI: Santri[] = [];
export const INITIAL_GURU: GuruMonitoring[] = [];
export const INITIAL_CATEGORIES: Kategori[] = [];
export const INITIAL_PENILAIAN: PenilaianRecord[] = [];
export const INITIAL_ABSENSI: AbsensiRecord[] = [];
export const INITIAL_SETTINGS: AppSettings = DEFAULT_SETTINGS;
