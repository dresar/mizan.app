import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
export default function DataPrefetcher() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  useEffect(() => {
    if (!isAuthenticated) return;
    const resources = [
      'websiteSettings',
    ];
    const prefetchData = async () => {
      queryClient.prefetchQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => (await api.get('/admin/stats')).data,
        staleTime: 60000, 
      });
      resources.forEach(async (resource) => {
        let endpoint = `/admin/generic/${resource}`;
        let queryKey = ['generic', resource];
        if (resource === 'santri') {
            endpoint = '/admin/santri';
            queryKey = ['santri', 'all', 'all'];
        } else if (resource === 'users') {
            endpoint = '/admin/users';
            queryKey = ['users']; 
        } else if (resource === 'payments') {
            endpoint = '/admin/payments';
            queryKey = ['payments'];
        }
        const data = await queryClient.prefetchQuery({
          queryKey: queryKey,
          queryFn: async () => {
            const res = await api.get(endpoint);
            return res.data.data || res.data;
          },
          staleTime: 120000, 
        });
        if (resource === 'santri') {
          try {
            const res = await api.get(endpoint);
            const list: unknown[] = res.data.data || [];
            const mapped = Array.isArray(list)
              ? list.map((raw) => {
                  const s = raw as {
                    id: string;
                    namaLengkap?: string;
                    nama_lengkap?: string;
                    nisn?: string;
                    jenisKelamin?: 'L' | 'P';
                    jenis_kelamin?: 'L' | 'P';
                    asalSekolah?: string;
                    asal_sekolah?: string;
                    noHp?: string;
                    no_hp?: string;
                    status?: string;
                    createdAt?: string;
                    created_at?: string;
                    fotoSantriApproved?: boolean;
                    foto_santri_approved?: boolean;
                    fotoKtpApproved?: boolean;
                    foto_ktp_approved?: boolean;
                    fotoAktaApproved?: boolean;
                    foto_akta_approved?: boolean;
                    fotoIjazahApproved?: boolean;
                    foto_ijazah_approved?: boolean;
                    suratSehatApproved?: boolean;
                    surat_sehat_approved?: boolean;
                    fotoSantri?: string;
                    foto_santri?: string;
                  };
                  return {
                    id: s.id,
                    nama_lengkap: s.namaLengkap ?? s.nama_lengkap ?? '',
                    nisn: s.nisn ?? '',
                    jenis_kelamin: s.jenisKelamin ?? s.jenis_kelamin ?? 'L',
                    asal_sekolah: s.asalSekolah ?? s.asal_sekolah ?? '',
                    no_hp: s.noHp ?? s.no_hp ?? '',
                    status: s.status ?? 'pending',
                    created_at: s.createdAt ?? s.created_at ?? '',
                    foto_santri_approved: s.fotoSantriApproved ?? s.foto_santri_approved ?? false,
                    foto_ktp_approved: s.fotoKtpApproved ?? s.foto_ktp_approved ?? false,
                    foto_akta_approved: s.fotoAktaApproved ?? s.foto_akta_approved ?? false,
                    foto_ijazah_approved: s.fotoIjazahApproved ?? s.foto_ijazah_approved ?? false,
                    surat_sehat_approved: s.suratSehatApproved ?? s.surat_sehat_approved ?? false,
                    foto_santri: s.fotoSantri ?? s.foto_santri ?? '',
                  };
                })
              : [];
            const payload = { ts: Date.now(), data: mapped };
            localStorage.setItem('cache:santri', JSON.stringify(payload));
          } catch {
          }
        }
      });
    };
    prefetchData();
  }, [isAuthenticated, queryClient]);
  return null;
}