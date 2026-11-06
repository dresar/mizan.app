import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers, Plus, Search, Users, ChevronRight, Edit2, Trash2,
  School, X, Save, AlertCircle, GraduationCap, User, BookOpen,
  Zap, Beaker
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useKMIMode } from '@/hooks/use-kmi-mode';
import { MOCK_KELAS, MOCK_SANTRI } from './KMI_MOCKS';

interface Jenjang { id: number; nama: string; kode: string; program: string; urutan: number; }
interface TahunAjaran { id: number; nama: string; isAktif: boolean; }
interface KelasItem {
  id: number; nama: string; jenisKelamin: string;
  kapasitas: number; ruangKelas: string | null;
  jenjangNama: string; jenjangKode: string; jenjangProgram: string;
  waliKelasNama: string | null; jumlahSantri: number;
  jenjangId: number; tahunAjaranId: number; waliKelasId: number | null;
}
interface AnggotaItem {
  id: number; santriId: number; nomorUrut: number | null; status: string;
  namaLengkap: string; nisn: string; jenisKelamin: string;
}
interface SantriOption { id: number; namaLengkap: string; nisn: string; jenisKelamin: string; }

const GENDER_COLOR = { putra: 'bg-emerald-600', putri: 'bg-rose-600' };
const GENDER_BADGE = { putra: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20', putri: 'bg-rose-500/10 text-rose-500 border border-rose-500/20' };

function KelasFormModal({ open, onClose, data, jenjangList, tahunAjaranId, guruList }:
  { open: boolean; onClose: () => void; data?: KelasItem | null; jenjangList: Jenjang[]; tahunAjaranId: number; guruList: any[] }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    jenjangId: data?.jenjangId ?? jenjangList[0]?.id ?? 0,
    nama: data?.nama ?? '',
    jenisKelamin: data?.jenisKelamin ?? 'putra',
    waliKelasId: data?.waliKelasId ?? '',
    kapasitas: data?.kapasitas ?? 35,
    ruangKelas: data?.ruangKelas ?? '',
    tahunAjaranId,
  });

  useEffect(() => {
    if (open) {
      setForm({
        jenjangId: data?.jenjangId ?? jenjangList[0]?.id ?? 0,
        nama: data?.nama ?? '',
        jenisKelamin: data?.jenisKelamin ?? 'putra',
        waliKelasId: data?.waliKelasId ?? '',
        kapasitas: data?.kapasitas ?? 35,
        ruangKelas: data?.ruangKelas ?? '',
        tahunAjaranId,
      });
    }
  }, [open, data]);

  const mutation = useMutation({
    mutationFn: (body: any) => data?.id
      ? api.put(`/kmi/kelas/${data.id}`, body)
      : api.post('/kmi/kelas', body),
    onSuccess: () => {
      toast.success(data?.id ? 'Kelas diperbarui!' : 'Kelas berhasil dibuat!');
      qc.invalidateQueries({ queryKey: ['kmi-kelas'] });
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? 'Gagal menyimpan'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ ...form, waliKelasId: form.waliKelasId ? parseInt(form.waliKelasId as any) : null });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-lg border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg">{data ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Jenjang</label>
              <select value={form.jenjangId} onChange={e => setForm(f => ({ ...f, jenjangId: parseInt(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none">
                {jenjangList.map(j => <option key={j.id} value={j.id}>{j.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nama Kelas</label>
              <input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                placeholder="cth: I A, II Putri" required
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Jenis Kelamin</label>
              <select value={form.jenisKelamin} onChange={e => setForm(f => ({ ...f, jenisKelamin: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none">
                <option value="putra">Putra</option>
                <option value="putri">Putri</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Kapasitas</label>
              <input type="number" value={form.kapasitas} onChange={e => setForm(f => ({ ...f, kapasitas: parseInt(e.target.value) }))}
                min={1} max={100}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Ruang Kelas</label>
              <input value={form.ruangKelas} onChange={e => setForm(f => ({ ...f, ruangKelas: e.target.value }))}
                placeholder="cth: Gedung A Lt. 2"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Wali Kelas</label>
              <select value={form.waliKelasId} onChange={e => setForm(f => ({ ...f, waliKelasId: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none">
                <option value="">— Pilih Wali Kelas —</option>
                {guruList.map(g => <option key={g.id} value={g.id}>{g.nama}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted">Batal</button>
            <button type="submit" disabled={mutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
              {mutation.isPending ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
              {data ? 'Simpan Perubahan' : 'Buat Kelas'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function AnggotaModal({ kelas, open, onClose }: { kelas: KelasItem; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: detail, isLoading } = useQuery({
    queryKey: ['kmi-kelas-detail', kelas.id],
    queryFn: () => api.get(`/kmi/kelas/${kelas.id}`).then(r => r.data),
    enabled: open,
  });

  const { data: unassigned = [] } = useQuery<SantriOption[]>({
    queryKey: ['kmi-unassigned'],
    queryFn: () => api.get('/kmi/options/santri-unassigned').then(r => r.data),
    enabled: open,
  });

  const addMutation = useMutation({
    mutationFn: (santriId: number) => api.post(`/kmi/kelas/${kelas.id}/anggota`, { santriId }),
    onSuccess: () => { toast.success('Santri ditambahkan ke kelas'); qc.invalidateQueries({ queryKey: ['kmi-kelas-detail', kelas.id] }); qc.invalidateQueries({ queryKey: ['kmi-unassigned'] }); qc.invalidateQueries({ queryKey: ['kmi-kelas'] }); },
    onError: (e: any) => toast.error(e.response?.data?.error ?? 'Gagal menambahkan'),
  });

  const removeMutation = useMutation({
    mutationFn: (anggotaId: number) => api.delete(`/kmi/kelas/${kelas.id}/anggota/${anggotaId}`),
    onSuccess: () => { toast.success('Santri dikeluarkan dari kelas'); qc.invalidateQueries({ queryKey: ['kmi-kelas-detail', kelas.id] }); qc.invalidateQueries({ queryKey: ['kmi-unassigned'] }); qc.invalidateQueries({ queryKey: ['kmi-kelas'] }); },
    onError: (e: any) => toast.error(e.response?.data?.error ?? 'Gagal'),
  });

  const anggota: AnggotaItem[] = detail?.anggota ?? [];
  const filteredUnassigned = unassigned.filter(s =>
    s.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
    s.nisn.includes(search)
  ).filter(s => kelas.jenisKelamin === 'putra' ? s.jenisKelamin === 'laki-laki' || s.jenisKelamin === 'Laki-laki' : s.jenisKelamin !== 'laki-laki');

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl border border-border max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-bold text-lg">Kelola Anggota Kelas {kelas.nama}</h2>
            <p className="text-sm text-muted-foreground">{anggota.length}/{kelas.kapasitas} santri • {kelas.jenisKelamin}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Anggota Aktif */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" /> Anggota Aktif ({anggota.length})
            </h3>
            {isLoading ? <div className="text-center py-4 text-sm text-muted-foreground">Memuat...</div> : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {anggota.map((a, i) => (
                  <div key={a.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                      <span className="font-medium">{a.namaLengkap}</span>
                      <span className="text-xs text-muted-foreground">{a.nisn}</span>
                    </div>
                    <button onClick={() => removeMutation.mutate(a.id)}
                      className="p-1 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {anggota.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Belum ada anggota</p>}
              </div>
            )}
          </div>

          {/* Tambah Santri */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tambah Santri
            </h3>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama atau NISN..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {filteredUnassigned.slice(0, 20).map(s => (
                <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl border border-border text-sm hover:bg-muted/40">
                  <div>
                    <span className="font-medium">{s.namaLengkap}</span>
                    <span className="text-xs text-muted-foreground ml-2">{s.nisn}</span>
                  </div>
                  <button onClick={() => addMutation.mutate(s.id)}
                    disabled={anggota.length >= kelas.kapasitas}
                    className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium disabled:opacity-40">
                    + Tambah
                  </button>
                </div>
              ))}
              {filteredUnassigned.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">Tidak ada santri yang tersedia</p>}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function KMIKelasPage() {
  const { isBetaMode, toggleMode } = useKMIMode();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<KelasItem | null>(null);
  const [anggotaKelas, setAnggotaKelas] = useState<KelasItem | null>(null);
  const [filterProgram, setFilterProgram] = useState<string>('ALL');

  const { data: tahunList = [] } = useQuery<TahunAjaran[]>({
    queryKey: ['kmi-tahun-ajaran'],
    queryFn: () => isBetaMode ? Promise.resolve([{ id: 1, nama: '2025/2026', isAktif: true }]) : api.get('/kmi/tahun-ajaran').then(r => r.data),
  });
  const tahunAktif = tahunList.find(t => t.isAktif) ?? tahunList[0];

  const { data: jenjangList = [] } = useQuery<Jenjang[]>({
    queryKey: ['kmi-jenjang'],
    queryFn: () => isBetaMode ? Promise.resolve([]) : api.get('/kmi/jenjang').then(r => r.data),
  });

  const { data: guruList = [] } = useQuery<any[]>({
    queryKey: ['kmi-guru'],
    queryFn: () => isBetaMode ? Promise.resolve([]) : api.get('/kmi/options/guru').then(r => r.data),
  });

  const { data: kelasList = [], isLoading } = useQuery<KelasItem[]>({
    queryKey: ['kmi-kelas', tahunAktif?.id],
    queryFn: () => isBetaMode ? Promise.resolve(MOCK_KELAS as any) : api.get('/kmi/kelas', { params: { tahunAjaranId: tahunAktif?.id } }).then(r => r.data),
    enabled: !!tahunAktif,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => isBetaMode ? Promise.resolve() : api.delete(`/kmi/kelas/${id}`),
    onSuccess: () => {
      toast.success(isBetaMode ? 'Beta: Kelas dihapus (Local)' : 'Kelas dihapus');
      if (!isBetaMode) qc.invalidateQueries({ queryKey: ['kmi-kelas'] });
    },
  });

  const filtered = kelasList.filter(k => {
    const matchSearch = k.nama.toLowerCase().includes(search.toLowerCase()) ||
      k.jenjangNama.toLowerCase().includes(search.toLowerCase());
    const matchProgram = filterProgram === 'ALL' || k.jenjangProgram === filterProgram;
    return matchSearch && matchProgram;
  });

  const grouped: Record<string, KelasItem[]> = {};
  filtered.forEach(k => {
    const grp = k.jenjangNama;
    if (!grouped[grp]) grouped[grp] = [];
    grouped[grp].push(k);
  });

  const totalSantri = kelasList.reduce((a, k) => a + (k.jumlahSantri ?? 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Kelas & Rombel</h1>
            <p className="text-sm text-muted-foreground">
              Tahun Ajaran: <strong>{tahunAktif?.nama ?? '—'}</strong> — {kelasList.length} kelas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditData(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 shadow">
            <Plus className="w-4 h-4" /> Tambah Kelas
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Kelas', value: kelasList.length, color: 'text-blue-600' },
          { label: 'Total Santri', value: totalSantri, color: 'text-emerald-600' },
          { label: 'Kelas Putra', value: kelasList.filter(k => k.jenisKelamin === 'putra').length, color: 'text-blue-500' },
          { label: 'Kelas Putri', value: kelasList.filter(k => k.jenisKelamin === 'putri').length, color: 'text-pink-500' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl bg-card border border-border text-center shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari kelas atau jenjang..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
        </div>
        {[
          { key: 'ALL', label: 'Semua Program' },
          { key: 'reguler', label: 'Reguler (6 Tahun)' },
          { key: 'intensif', label: 'Intensif (4 Tahun)' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilterProgram(f.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              filterProgram === f.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Kelas Grid by Jenjang */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat data kelas...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
          <School className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Belum ada kelas. Klik "Tambah Kelas" untuk memulai.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([jenjangNama, kelas]) => (
          <div key={jenjangNama}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              {jenjangNama}
              <span className="ml-1 text-xs">{kelas.length} kelas</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {kelas.map((k, i) => {
                const fillPercent = k.kapasitas > 0 ? Math.round((k.jumlahSantri / k.kapasitas) * 100) : 0;
                return (
                  <motion.div key={k.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card rounded-[4px] border border-border bg-card overflow-hidden transition-all"
                  >
                    <div className={`h-1 ${GENDER_COLOR[k.jenisKelamin as keyof typeof GENDER_COLOR] ?? 'bg-muted'}`} />
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg leading-tight">{k.nama}</h3>
                          <p className="text-xs text-muted-foreground">{k.jenjangNama}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${GENDER_BADGE[k.jenisKelamin as keyof typeof GENDER_BADGE] ?? ''}`}>
                          {k.jenisKelamin}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{k.jumlahSantri}/{k.kapasitas} santri</span>
                          <span className={fillPercent >= 90 ? 'text-red-500 font-medium' : 'text-muted-foreground'}>{fillPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-muted">
                          <div className={`h-full rounded-full transition-all ${fillPercent >= 90 ? 'bg-red-400' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(fillPercent, 100)}%` }} />
                        </div>
                      </div>

                      {k.waliKelasNama && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                          <User className="w-3 h-3" />
                          <span>{k.waliKelasNama}</span>
                        </div>
                      )}
                      {k.ruangKelas && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                          <BookOpen className="w-3 h-3" />
                          <span>{k.ruangKelas}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                        <button onClick={() => setAnggotaKelas(k)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors">
                          <Users className="w-3 h-3" /> Anggota
                        </button>
                        <button onClick={() => { setEditData(k); setModalOpen(true); }}
                          className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs hover:bg-muted/80 transition-colors">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => window.confirm('Hapus kelas ini?') && deleteMutation.mutate(k.id)}
                          className="px-3 py-1.5 rounded-lg bg-muted hover:bg-red-100 hover:text-red-600 text-xs transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Modals */}
      <KelasFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        data={editData}
        jenjangList={jenjangList}
        tahunAjaranId={tahunAktif?.id ?? 0}
        guruList={guruList}
      />
      {anggotaKelas && (
        <AnggotaModal
          kelas={anggotaKelas}
          open={!!anggotaKelas}
          onClose={() => setAnggotaKelas(null)}
        />
      )}
    </div>
  );
}
