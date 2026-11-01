export type Role = "SUPER_ADMIN" | "PENGASUHAN" | "GURU";

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

export type StatusSantri = "Baik" | "Perhatian" | "Perlu Pembinaan";

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
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultBaseScore: 70.0,
  minScoreBaik: 80.0,
  minScorePerhatian: 70.0,
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
  popupUpdatedAt: ""
};

export const INITIAL_CLASSES: string[] = [];
export const INITIAL_USERS: UserProfile[] = [];
export const INITIAL_SANTRI: Santri[] = [];
export const INITIAL_GURU: GuruMonitoring[] = [];
export const INITIAL_CATEGORIES: Kategori[] = [];
export const INITIAL_PENILAIAN: PenilaianRecord[] = [];
export const INITIAL_ABSENSI: AbsensiRecord[] = [];
export const INITIAL_SETTINGS: AppSettings = DEFAULT_SETTINGS;
