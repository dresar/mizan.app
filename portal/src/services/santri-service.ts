import { api } from '@/lib/api';
export interface DashboardData {
  registrationStatus: {
    status: 'draft' | 'submitted' | 'verified' | 'accepted' | 'rejected';
    message: string;
    step: number; 
  };
  announcements: {
    id: string;
    title: string;
    content: string;
    date: string;
  }[];
}
export interface SantriRegistrationData {
  santri: {
    namaLengkap: string;
    namaPanggilan: string;
    nisn: string;
    tempatLahir: string;
    tanggalLahir: string;
    jenisKelamin: string;
    alamat: string;
  };
  orangTua: {
    namaAyah: string;
    pekerjaanAyah: string;
    namaIbu: string;
    pekerjaanIbu: string;
    noWhatsapp: string;
    alamatOrangTua: string;
  };
  pendidikan: {
    namaSekolah: string;
    tahunLulus: string;
    nilaiRataRata: string;
  };
  tambahan: {
    prestasi: string;
    hobi: string;
    keahlian: string;
  };
  dokumen: {
    akteLahir: File | null;
    kartuKeluarga: File | null;
    pasFoto: File | null;
    ijazah: File | null;
  };
}
export const santriService = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get('/santri/dashboard');
    return response.data;
  },
  getRegistrationStatus: async () => {
    const response = await api.get('/santri/registration-status');
    return response.data;
  },
  submitRegistration: async (data: any, isDraft = false) => {
    const formData = new FormData();
    formData.append('isDraft', isDraft ? 'true' : 'false');
    
    if (data.santri) {
        Object.entries(data.santri).forEach(([key, value]) => {
            if (value !== null && value !== undefined) formData.append(key, value as string);
        });
    }
    if (data.orangTua) {
        Object.entries(data.orangTua).forEach(([key, value]) => {
            if (value !== null && value !== undefined) formData.append(key, value as string);
        });
    }
    if (data.pendidikan) {
        Object.entries(data.pendidikan).forEach(([key, value]) => {
            if (value !== null && value !== undefined) formData.append(key, value as string);
        });
    }
    if (data.tambahan) {
        Object.entries(data.tambahan).forEach(([key, value]) => {
            if (value !== null && value !== undefined) formData.append(key, value as string);
        });
    }

    if (data.dokumen) {
        if (data.dokumen.akteLahir) formData.append('fotoAkta', data.dokumen.akteLahir);
        if (data.dokumen.kartuKeluarga) formData.append('fotoKk', data.dokumen.kartuKeluarga);
        if (data.dokumen.pasFoto) formData.append('fotoSantri', data.dokumen.pasFoto);
        if (data.dokumen.ijazah) formData.append('fotoIjazah', data.dokumen.ijazah);
    }
    
    const response = await api.post('/santri/registration', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getSchedule: async (day?: string) => {
    const response = await api.get('/santri/schedule', { params: { day } });
    return response.data;
  },
  getNotifications: async () => {
    const response = await api.get('/santri/notifications');
    return response.data;
  },
  getBankAccounts: async () => {
    const response = await api.get('/santri/bank-accounts');
    return (response.data || []).map((b: any) => ({
      id: b.id,
      bankName: b.namaBankCustom || b.namaBank,
      accountNumber: b.nomorRekening,
      accountHolder: b.namaPemilik,
      fee: b.biayaPendaftaran,
    }));
  },
  submitPayment: async (data: {
    bankPengirim: string;
    noRekeningPengirim: string;
    namaPemilikRekening: string;
    rekeningTujuan: string;
    jumlahTransfer: string;
    buktiTransfer: File;
    catatan?: string;
  }) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    const response = await api.post('/santri/payments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getLastPayment: async () => {
    const response = await api.get('/santri/payment');
    return response.data?.data;
  }
};