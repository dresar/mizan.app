export interface DataSantri {
  namaLengkap: string;
  namaPanggilan: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P' | '';
  agama: string;
  kewarganegaraan: string;
  anakKe: string;
  jumlahSaudara: string;
  golonganDarah: string;
  tinggiBadan: string;
  beratBadan: string;
  riwayatPenyakit: string;
  bahasaSehariHari: string;
  tinggalDengan: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  nisn: string;
}

export interface DataOrangTua {
  namaAyah: string;
  nikAyah: string;
  pekerjaanAyah: string;
  pendidikanAyah: string;
  penghasilanAyah: string;
  statusAyah: string;
  noHpAyah: string;
  
  namaIbu: string;
  nikIbu: string;
  pekerjaanIbu: string;
  pendidikanIbu: string;
  penghasilanIbu: string;
  statusIbu: string;
  noHpIbu: string;
  
  noWhatsapp: string; // Kontak Utama
  alamatOrangTua: string;
}

export interface DataPendidikan {
  namaSekolah: string;
  npsnSekolah: string;
  tahunLulus: string;
  noIjazah: string;
  nilaiRataRata: string;
}

export interface DataTambahan {
  prestasi: string;
  hobi: string;
  keahlian: string;
}

export interface DataDokumen {
  akteLahir: File | null;
  kartuKeluarga: File | null;
  pasFoto: File | null;
  ijazah: File | null;
}

export interface FormPendaftaranData {
  santri: DataSantri;
  orangTua: DataOrangTua;
  pendidikan: DataPendidikan;
  tambahan: DataTambahan;
  dokumen: DataDokumen;
}

export const initialFormData: FormPendaftaranData = {
  santri: {
    namaLengkap: '',
    namaPanggilan: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '',
    agama: 'Islam',
    kewarganegaraan: 'WNI',
    anakKe: '',
    jumlahSaudara: '',
    golonganDarah: '-',
    tinggiBadan: '',
    beratBadan: '',
    riwayatPenyakit: '-',
    bahasaSehariHari: 'Indonesia',
    tinggalDengan: 'Orang Tua',
    alamat: '',
    desa: '',
    kecamatan: '',
    kabupaten: '',
    provinsi: '',
    kodePos: '',
    nisn: '',
  },
  orangTua: {
    namaAyah: '',
    nikAyah: '',
    pekerjaanAyah: '',
    pendidikanAyah: '',
    penghasilanAyah: '',
    statusAyah: 'Hidup',
    noHpAyah: '',
    
    namaIbu: '',
    nikIbu: '',
    pekerjaanIbu: '',
    pendidikanIbu: '',
    penghasilanIbu: '',
    statusIbu: 'Hidup',
    noHpIbu: '',
    
    noWhatsapp: '',
    alamatOrangTua: '',
  },
  pendidikan: {
    namaSekolah: '',
    npsnSekolah: '',
    tahunLulus: '',
    noIjazah: '',
    nilaiRataRata: '',
  },
  tambahan: {
    prestasi: '',
    hobi: '',
    keahlian: '',
  },
  dokumen: {
    akteLahir: null,
    kartuKeluarga: null,
    pasFoto: null,
    ijazah: null,
  },
};
