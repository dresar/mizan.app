import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Aggressive Admin Prefetcher (Fixed)
 * Fires all major administrative data requests into the cache simultaneously.
 * Target: Zero navigation latency by ensuring data is ready before click.
 */
export function useAdminPrefetch() {
  const queryClient = useQueryClient();
  const setIsAdminSyncing = useAppStore(state => state.setIsAdminSyncing);

  useEffect(() => {
    // Only prefetch for admins to avoid 401s for public users
    const authState = useAuthStore.getState();
    const userRole = authState.user?.role;
    const isAuthorized = ['admin', 'superadmin', 'staff', 'author'].includes(userRole || '');
    
    if (!authState.isAuthenticated || !isAuthorized) return;

    // Helper to map backend payment structure to frontend snake_case
    const transformPayment = (p: any) => ({
      id: p.id,
      bank_pengirim: p.bankPengirim,
      no_rekening_pengirim: p.noRekeningPengirim,
      nama_pemilik_rekening: p.namaPemilikRekening,
      rekening_tujuan: p.rekeningTujuan,
      jumlah_transfer: p.jumlahTransfer,
      bukti_transfer: p.buktiTransfer,
      status: p.status,
      catatan: p.catatan,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
      verified_at: p.verifiedAt,
      santri_id: p.santriId,
      verified_by_id: p.verifiedById,
      santri: p.santri,
    });

    const prefetchConfigs = [
      { key: ['financial-stats'], url: '/admin/stats' },
      { key: ['users'], url: '/admin/users' },
      { 
        key: ['santri', 'infinite', 'all', 'all', ''], 
        url: '/admin/santri', 
        isInfinite: true 
      },
      { 
        key: ['payments'], 
        url: '/admin/payments',
        transform: (data: any) => (data.data || []).map(transformPayment)
      },
      { key: ['resource', 'tenagaPengajar'], url: '/admin/generic/tenagaPengajar' },
      { key: ['resource', 'blogBlogpost'], url: '/admin/generic/blogBlogpost' },
      { key: ['resource', 'dokumentasi'], url: '/admin/generic/dokumentasi' },
      { key: ['resource', 'announcement'], url: '/admin/announcements' },
      { key: ['resource', 'galeri'], url: '/admin/gallery' },
      { key: ['resource', 'whatsappTemplate'], url: '/admin/whatsapp-templates' },
      { key: ['admin-articles', 'all'], url: '/publication/admin/articles', params: { limit: 100, type: 'article' } },
      { key: ['admin-pending-authors'], url: '/publication/admin/authors/pending' },
    ];

    const performPrefetch = async () => {
      setIsAdminSyncing(true);
      console.log('🚀 [Zero Latency] Starting Background Data Sync...');

      const promises = prefetchConfigs.map((config) => {
        const staleTime = 1000 * 60 * 10;

        if (config.isInfinite) {
          return queryClient.prefetchInfiniteQuery({
            queryKey: config.key,
            queryFn: async () => {
              const res = await api.get(config.url, { params: { page: 1, limit: 12 } });
              return res.data; // Infinite queries MUST return the full response object
            },
            initialPageParam: 1,
            staleTime,
          });
        }

        return queryClient.prefetchQuery({
          queryKey: config.key,
          queryFn: async () => {
            const res = await api.get(config.url, { params: (config as any).params });
            // Standard unwrapping: Components expect Array, not { data: Array, meta: {} }
            if (config.transform) {
              return config.transform(res.data);
            }
            return res.data.data || res.data;
          },
          staleTime,
        });
      });

      try {
        await Promise.allSettled(promises);
        console.log('✅ [Zero Latency] Background Sync Complete.');
      } catch (error) {
        console.error('❌ [Zero Latency] Background Sync Failed:', error);
      } finally {
        setTimeout(() => setIsAdminSyncing(false), 2000);
      }
    };

    performPrefetch();
  }, [queryClient, setIsAdminSyncing]);
}
