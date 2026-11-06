/**
 * KMI MOCK DATA SYSTEM (BETA)
 * Comprehensive dummy data for Kulliyatul Mu'allimin Al-Islamiyah
 */

export const MOCK_RUMPUN = [
  { id: 1, kode: 'ISL', nama: 'Ulum Islamiyah', namaArab: 'العلوم الإسلامية', gradient: 'emerald', icon: '☪️' },
  { id: 2, kode: 'ARB', nama: 'Ulum Arabiyah', namaArab: 'العلوم العربية', gradient: 'emerald', icon: '📜' },
  { id: 3, kode: 'AMM', nama: 'Ulum Ammah', namaArab: 'العلوم العامة', gradient: 'amber', icon: '📐' },
];

export const MOCK_MAPEL = [
  { id: 1, kode: 'TFS', nama: 'Tafsir Jalalain', namaArab: 'تفسير الجلالين', rumpunKode: 'ISL', rumpunId: 1, kkm: 75, jenjang: '1-6' },
  { id: 2, kode: 'FIQ', nama: 'Fiqh (Fathul Qarib)', namaArab: 'فتح القريب', rumpunKode: 'ISL', rumpunId: 1, kkm: 70, jenjang: '3-6' },
  { id: 3, kode: 'NHW', nama: 'Nahwu (Alfiyah)', namaArab: 'ألفية ابن malik', rumpunKode: 'ARB', rumpunId: 2, kkm: 70, jenjang: '3-6' },
  { id: 4, kode: 'IML', nama: 'Imla\'', namaArab: 'الإملاء', rumpunKode: 'ARB', rumpunId: 2, kkm: 65, jenjang: '1-2' },
  { id: 5, kode: 'MTH', nama: 'Matematika', namaArab: 'الرياضيات', rumpunKode: 'AMM', rumpunId: 3, kkm: 70, jenjang: '1-6' },
  { id: 6, kode: 'ENG', nama: 'English (Conversation)', namaArab: 'اللغة الإنجليزية', rumpunKode: 'ARB', rumpunId: 2, kkm: 70, jenjang: '1-6' },
  { id: 7, kode: 'PHY', nama: 'Fisika', namaArab: 'الفيزياء', rumpunKode: 'AMM', rumpunId: 3, kkm: 65, jenjang: '3-6' },
];

export const MOCK_KELAS = [
  { id: 1, nama: '1 A', jenjang: '1', jenisKelamin: 'putra', waliKelas: 'Dr. Ahmad Fauzi', santriCount: 32, kapasitas: 35 },
  { id: 2, nama: '1 B', jenjang: '1', jenisKelamin: 'putra', waliKelas: 'Ust. Ridwan Hakim', santriCount: 30, kapasitas: 35 },
  { id: 3, nama: '2 Putri A', jenjang: '2', jenisKelamin: 'putri', waliKelas: 'Ustz. Siti Fatimah', santriCount: 28, kapasitas: 35 },
  { id: 4, nama: '6 Intensif', jenjang: '6', jenisKelamin: 'putra', waliKelas: 'KH. Abdullah Syukri', santriCount: 25, kapasitas: 30 },
];

export const MOCK_SANTRI = [
  { id: 1, nama: 'Muhammad Faras', nisn: '12345678', kelas: '1 A', rumpun: 'Putra', santriId: 1 },
  { id: 2, nama: 'Abdullah Azzam', nisn: '12345679', kelas: '1 A', rumpun: 'Putra', santriId: 2 },
  { id: 3, nama: 'Aisyah Humairah', nisn: '12345680', kelas: '2 Putri A', rumpun: 'Putri', santriId: 3 },
];

export const MOCK_JADWAL = [
  { id: 1, hari: 'senin', jamKe: 1, mapelNama: 'Nahwu', guruNama: 'Ust. Zae' },
  { id: 2, hari: 'senin', jamKe: 2, mapelNama: 'Nahwu', guruNama: 'Ust. Zae' },
  { id: 3, hari: 'senin', jamKe: 3, mapelNama: 'Tafsir', guruNama: 'Ust. Ahmad' },
  { id: 4, hari: 'selasa', jamKe: 1, mapelNama: 'English', guruNama: 'Mr. John' },
];

export const MOCK_JAM_PELAJARAN = [
  { jamKe: 1, jamMulai: '07:00', jamSelesai: '07:45' },
  { jamKe: 2, jamMulai: '07:45', jamSelesai: '08:30' },
  { jamKe: 3, jamMulai: '08:30', jamSelesai: '09:15' },
  { jamKe: 4, jamMulai: '09:45', jamSelesai: '10:30' },
  { jamKe: 5, jamMulai: '10:30', jamSelesai: '11:15' },
];

export const MOCK_GURU_MAPEL = [
  { id: 1, mapelId: 1, mapelNama: 'Tafsir', guruId: 1, guruNama: 'Ust. Ahmad' },
  { id: 2, mapelId: 3, mapelNama: 'Nahwu', guruId: 2, guruNama: 'Ust. Ridwan' },
  { id: 3, mapelId: 5, mapelNama: 'Matematika', guruId: 3, guruNama: 'Mr. Budi' },
];

export const MOCK_RAPOR_LIST = [
  { id: 1, santriId: 1, namaLengkap: 'Muhammad Faras', nisn: '12345678', peringkatKelas: 1, jumlahSiswaKelas: 32, nilaiRataRata: 88.5, predikatUmum: 'Mumtaz', totalHadir: 100, totalSakit: 2, totalIzin: 1, totalAlfa: 0, statusNaikKelas: 'naik' },
  { id: 2, santriId: 2, namaLengkap: 'Abdullah Azzam', nisn: '12345679', peringkatKelas: 2, jumlahSiswaKelas: 32, nilaiRataRata: 85.2, predikatUmum: 'Jayyid Jiddan', totalHadir: 98, totalSakit: 1, totalIzin: 4, totalAlfa: 0, statusNaikKelas: 'naik' },
];

export const MOCK_RAPOR_DETAIL = {
  rapor: MOCK_RAPOR_LIST[0],
  santri: { id: 1, namaLengkap: 'Muhammad Faras', nisn: '12345678', namaAyah: 'H. Ahmad Syarif' },
  semester: { id: 1, semester: 'Ganjil', tahunAjaranId: '2025/2026' },
  kelas: { id: 1, nama: '1 A', waliKelasNama: 'Dr. Ahmad Fauzi', jenjang: { program: 'reguler' } },
  nilai: [
    { mapelNama: 'Tafsir Jalalain', rumpunNama: 'Ulum Islamiyah', rumpunKode: 'ISL', nilaiHarian: 85, nilaiUts: 80, nilaiUas: 90, nilaiAkhir: 86, kkm: 75, predikat: 'Mumtaz' },
    { mapelNama: 'Nahwu Alfiyah', rumpunNama: 'Ulum Arabiyah', rumpunKode: 'ARB', nilaiHarian: 90, nilaiUts: 85, nilaiUas: 92, nilaiAkhir: 90, kkm: 70, predikat: 'Mumtaz' },
  ]
};

export const MOCK_DASHBOARD = {
  totalSantri: 420,
  totalKelas: 14,
  totalMapel: 32,
  totalGuru: 48,
  absensiHariIni: 12,
  nilaiMenunggu: 15,
  raporDraft: 4,
  tahunAjaran: '2025/2026',
  semesterAktif: 'Ganjil'
};
