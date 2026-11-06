/**
 * AdmissionsPage — Pillar 3: Infinite Scroll Implementation
 *
 * Replaces the old "fetch all 1000 records" approach with
 * useInfiniteQuery + IntersectionObserver via the generic hook.
 */
import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RefreshCw, GraduationCap, Plus, MoreHorizontal, Eye, Pencil, Trash2, Download, Loader2 } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PageHeader, StatusBadge } from '@/components/common';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import type { SantriStatus } from '@/types';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useInfiniteList } from '@/hooks/use-infinite-list';
import { usePrefetch } from '@/hooks/use-prefetch';
import * as XLSX from 'xlsx';

const LIMIT = 12;

// Normalized santri shape returned from API
interface SantriRow {
  id: string;
  nama_lengkap: string;
  nisn: string;
  jenis_kelamin: 'L' | 'P';
  asal_sekolah: string;
  no_hp: string;
  status: SantriStatus;
  created_at: string;
  foto_santri: string;
  foto_santri_approved: boolean;
  foto_ktp_approved: boolean;
  foto_akta_approved: boolean;
  foto_ijazah_approved: boolean;
  surat_sehat_approved: boolean;
}

function normalizeSantri(raw: Record<string, unknown>): SantriRow {
  return {
    id: String(raw.id ?? ''),
    nama_lengkap: String(raw.namaLengkap ?? raw.nama_lengkap ?? ''),
    nisn: String(raw.nisn ?? ''),
    jenis_kelamin: (raw.jenisKelamin ?? raw.jenis_kelamin ?? 'L') as 'L' | 'P',
    asal_sekolah: String(raw.asalSekolah ?? raw.asal_sekolah ?? ''),
    no_hp: String(raw.noHp ?? raw.no_hp ?? ''),
    status: (raw.status ?? 'pending') as SantriStatus,
    created_at: String(raw.createdAt ?? raw.created_at ?? ''),
    foto_santri: String(raw.fotoSantri ?? raw.foto_santri ?? ''),
    foto_santri_approved: Boolean(raw.fotoSantriApproved ?? raw.foto_santri_approved),
    foto_ktp_approved: Boolean(raw.fotoKtpApproved ?? raw.foto_ktp_approved),
    foto_akta_approved: Boolean(raw.fotoAktaApproved ?? raw.foto_akta_approved),
    foto_ijazah_approved: Boolean(raw.fotoIjazahApproved ?? raw.foto_ijazah_approved),
    surat_sehat_approved: Boolean(raw.suratSehatApproved ?? raw.surat_sehat_approved),
  };
}

export default function AdmissionsPage() {
  const queryClient = useQueryClient();
  const { showConfirm } = useAppStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Pillar 3: Infinite Scroll ──────────────────────────────────────────────
  const { items: rawItems, sentinelRef, isLoading, isFetchingNextPage, hasNextPage, refetch } =
    useInfiniteList(
      ['santri', 'infinite', statusFilter, genderFilter, searchQuery],
      ({ pageParam }) =>
        api
          .get('/admin/santri', {
            params: {
              page: pageParam,
              limit: LIMIT,
              ...(statusFilter !== 'all' && { status: statusFilter }),
              ...(genderFilter !== 'all' && { jenisKelamin: genderFilter }),
              ...(searchQuery && { search: searchQuery }),
            },
          })
          .then((r) => r.data),
      { staleTime: 1000 * 60 * 5 }
    );

  const santriList: SantriRow[] = rawItems.map((r) =>
    normalizeSantri(r as Record<string, unknown>)
  );

  // ── Mutations ──────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/santri/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['santri'] });
      toast.success('Data santri berhasil dihapus');
    },
    onError: () => toast.error('Gagal menghapus data santri'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SantriStatus }) =>
      api.put(`/admin/santri/${id}`, { status }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['santri'] });
      toast.success(`Status berhasil diubah menjadi ${vars.status}`);
    },
    onError: () => toast.error('Gagal mengubah status'),
  });

  const importMutation = useMutation({
    mutationFn: (items: unknown[]) => api.post('/admin/santri/import', { items }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['santri'] });
      toast.success(data.data?.message || 'Import berhasil');
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Gagal mengimport data'),
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDelete = (id: string) =>
    showConfirm({
      title: 'Hapus Data Santri',
      description: 'Apakah Anda yakin ingin menghapus data santri ini?',
      variant: 'destructive',
      onConfirm: () => deleteMutation.mutate(id),
    });

  const handleExport = () => {
    if (!santriList.length) { toast.error('Tidak ada data untuk diexport'); return; }
    const ws = XLSX.utils.json_to_sheet(
      santriList.map((s) => ({
        ID: s.id,
        'Nama Lengkap': s.nama_lengkap,
        NISN: s.nisn,
        'Jenis Kelamin': s.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        'Asal Sekolah': s.asal_sekolah,
        'No HP': s.no_hp,
        Status: s.status,
        'Tanggal Daftar': formatDate(s.created_at),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Santri');
    XLSX.writeFile(wb, `Data_Santri_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Data berhasil diexport');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];
        const mapped = data
          .map((row) => ({
            namaLengkap: row['Nama Lengkap'] ?? row['Nama'] ?? row['namaLengkap'],
            nisn: String(row['NISN'] ?? row['nisn'] ?? ''),
            jenisKelamin:
              row['Jenis Kelamin'] === 'Laki-laki' ? 'L'
              : row['Jenis Kelamin'] === 'Perempuan' ? 'P'
              : (row['Gender'] ?? 'L'),
            asalSekolah: row['Asal Sekolah'] ?? row['asalSekolah'],
            noHp: String(row['No HP'] ?? row['noHp'] ?? ''),
          }))
          .filter((i) => i.namaLengkap && i.nisn);
        if (!mapped.length) { toast.error('Tidak ada data valid dalam file'); return; }
        importMutation.mutate(mapped);
      } catch {
        toast.error('Gagal membaca file Excel');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setGenderFilter('all');
    setSearchQuery('');
  };

  const hasFilters = statusFilter !== 'all' || genderFilter !== 'all' || searchQuery !== '';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Pendaftaran Santri"
        description="Kelola data pendaftaran santri baru"
        icon={GraduationCap}
      >
        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImport}
          className="hidden"
        />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Download className="mr-2 h-4 w-4 rotate-180" />
          Import Excel
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
        <Button asChild>
          <Link to="/admin/admissions/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Santri
          </Link>
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Cari nama, NISN, asal sekolah..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[260px] bg-card"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="verified">Terverifikasi</SelectItem>
            <SelectItem value="accepted">Diterima</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
          </SelectContent>
        </Select>
        <Select value={genderFilter} onValueChange={setGenderFilter}>
          <SelectTrigger className="w-[130px] bg-card">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="L">Laki-laki</SelectItem>
            <SelectItem value="P">Perempuan</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset Filter">
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Infinite Scroll Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {isLoading && santriList.length === 0 ? (
          // Non-blocking shimmer rows while first page loads
          <div className="divide-y">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
                <div className="h-9 w-9 rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-40 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
                <div className="h-5 w-16 bg-muted rounded-full" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : santriList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">Belum ada data pendaftaran santri.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nama Santri</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Gender</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Asal Sekolah</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Tgl Daftar</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {santriList.map((santri) => {
                  const initials = santri.nama_lengkap
                    .split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

                  // ── Pillar 1: Intent-Based Prefetch on row hover ──
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  const prefetchDetail = usePrefetch(
                    ['santri', santri.id],
                    () => api.get(`/admin/santri/${santri.id}`).then((r) => r.data)
                  );

                  return (
                    <tr
                      key={santri.id}
                      className="hover:bg-muted/30 transition-colors"
                      onMouseEnter={prefetchDetail}
                      onFocus={prefetchDetail}
                    >
                      {/* Name + Avatar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 flex-shrink-0">
                            {/* Pillar 4: lazy image loading */}
                            <AvatarImage
                              src={santri.foto_santri || undefined}
                              alt={santri.nama_lengkap}
                              loading="lazy"
                              width={36}
                              height={36}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              to={`/admin/admissions/${santri.id}`}
                              className="font-medium hover:text-primary hover:underline transition-colors"
                            >
                              {santri.nama_lengkap}
                            </Link>
                            <p className="text-xs text-muted-foreground">NISN: {santri.nisn}</p>
                          </div>
                        </div>
                      </td>

                      {/* Gender */}
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-normal">
                          {santri.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </Badge>
                      </td>

                      {/* School */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="max-w-[160px] truncate block text-muted-foreground" title={santri.asal_sekolah}>
                          {santri.asal_sekolah}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                        {formatDate(santri.created_at)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={santri.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/admissions/${santri.id}`}>
                                <Eye className="mr-2 h-4 w-4" /> Lihat Detail
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/admissions/${santri.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Ubah Status</DropdownMenuLabel>
                            {['verified', 'accepted', 'rejected'].map((s) =>
                              santri.status !== s ? (
                                <DropdownMenuItem
                                  key={s}
                                  onClick={() =>
                                    updateStatusMutation.mutate({ id: santri.id, status: s as SantriStatus })
                                  }
                                >
                                  {s === 'verified' ? 'Verifikasi' : s === 'accepted' ? 'Terima' : 'Tolak'}
                                </DropdownMenuItem>
                              ) : null
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(santri.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Infinity Sentinel — triggers next page fetch when visible */}
            <div ref={sentinelRef} className="py-4 flex items-center justify-center">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat lebih banyak...
                </div>
              )}
              {!hasNextPage && santriList.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Semua {santriList.length} data telah ditampilkan.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}