import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Filter, Plus, Star, ChevronRight, School, BookMarked, Zap, Beaker } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { X, Save, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { useKMIMode } from '@/hooks/use-kmi-mode';
import { MOCK_MAPEL, MOCK_RUMPUN } from './KMI_MOCKS';

interface Rumpun {
  id: number;
  nama: string;
  namaArab: string;
  kode: string;
  warna: string;
  urutan: number;
}

interface Mapel {
  id: number;
  nama: string;
  namaArab: string;
  kode: string;
  kitabReferensi: string;
  untukJenjang: string;
  kkm: number;
  isUjian: boolean;
  isActive: boolean;
  rumpunId: number;
  rumpun?: Rumpun;
}

function MapelFormModal({ open, onClose, data, rumpunList }: { open: boolean; onClose: () => void; data?: Mapel | null; rumpunList: Rumpun[] }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    rumpunId: data?.rumpunId ?? rumpunList[0]?.id ?? 0,
    nama: data?.nama ?? '',
    namaArab: data?.namaArab ?? '',
    kode: data?.kode ?? '',
    kitabReferensi: data?.kitabReferensi ?? '',
    untukJenjang: data?.untukJenjang ?? '1,2,3,4,5,6',
    kkm: data?.kkm ?? 70,
    isUjian: data?.isUjian ?? true,
    bobotHarian: data?.bobotHarian ?? 20,
    bobotUts: data?.bobotUts ?? 30,
    bobotUas: data?.bobotUas ?? 50,
  });

  useEffect(() => {
    if (open) {
      setForm({
        rumpunId: data?.rumpunId ?? rumpunList[0]?.id ?? 0,
        nama: data?.nama ?? '',
        namaArab: data?.namaArab ?? '',
        kode: data?.kode ?? '',
        kitabReferensi: data?.kitabReferensi ?? '',
        untukJenjang: data?.untukJenjang ?? '1,2,3,4,5,6',
        kkm: data?.kkm ?? 70,
        isUjian: data?.isUjian ?? true,
        bobotHarian: data?.bobotHarian ?? 20,
        bobotUts: data?.bobotUts ?? 30,
        bobotUas: data?.bobotUas ?? 50,
      });
    }
  }, [open, data, rumpunList]);

  const mutation = useMutation({
    mutationFn: (body: any) => data?.id ? api.put(`/kmi/mapel/${data.id}`, body) : api.post('/kmi/mapel', body),
    onSuccess: () => {
      toast.success(data?.id ? 'Mapel diperbarui!' : 'Mapel berhasil dibuat!');
      qc.invalidateQueries({ queryKey: ['kmi-mapel'] });
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? 'Gagal menyimpan mapel'),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg">{data ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rumpun Ilmu</label>
              <select value={form.rumpunId} onChange={e => setForm(f => ({ ...f, rumpunId: parseInt(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30">
                {rumpunList.map(r => <option key={r.id} value={r.id}>{r.nama} ({r.kode})</option>)}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Kode Mapel</label>
              <input value={form.kode} onChange={e => setForm(f => ({ ...f, kode: e.target.value.toUpperCase() }))}
                placeholder="cth: NAH, HDT" required maxLength={10}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nama Pelajaran</label>
              <input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                placeholder="cth: Nahwu" required
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-arabic text-right">الإسم بالعربي</label>
              <input value={form.namaArab} onChange={e => setForm(f => ({ ...f, namaArab: e.target.value }))}
                placeholder="cth: النحو" dir="rtl"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30 font-arabic" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Kitab Referensi</label>
              <input value={form.kitabReferensi} onChange={e => setForm(f => ({ ...f, kitabReferensi: e.target.value }))}
                placeholder="cth: Al-Ajurumiyah, Alfiyah Ibnu Malik"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Untuk Jenjang</label>
              <input value={form.untukJenjang} onChange={e => setForm(f => ({ ...f, untukJenjang: e.target.value }))}
                placeholder="cth: 1,2,3,4,5,6"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">KKM</label>
              <input type="number" value={form.kkm} onChange={e => setForm(f => ({ ...f, kkm: parseInt(e.target.value) }))}
                min={0} max={100}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-muted/30 grid grid-cols-3 gap-4 border border-border">
            <div className="col-span-3 mb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bobot Nilai Rapor (%)</div>
            <div>
              <label className="text-[10px] text-muted-foreground">Harian</label>
              <input type="number" value={form.bobotHarian} onChange={e => setForm(f => ({ ...f, bobotHarian: parseInt(e.target.value) }))}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">UTS</label>
              <input type="number" value={form.bobotUts} onChange={e => setForm(f => ({ ...f, bobotUts: parseInt(e.target.value) }))}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">UAS</label>
              <input type="number" value={form.bobotUas} onChange={e => setForm(f => ({ ...f, bobotUas: parseInt(e.target.value) }))}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors">
            <input type="checkbox" checked={form.isUjian} onChange={e => setForm(f => ({ ...f, isUjian: e.target.checked }))} 
              className="w-4 h-4 rounded-md border-primary text-primary focus:ring-primary" />
            <div>
              <span className="text-sm font-semibold block">Mata Pelajaran Diujikan</span>
              <span className="text-[11px] text-muted-foreground">Centang jika mapel ini muncul di kartu ujian dan jadwal imtihan.</span>
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border font-medium hover:bg-muted transition-colors">Batal</button>
            <button type="submit" disabled={mutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20">
              {mutation.isPending ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
              {data ? 'Simpan Perubahan' : 'Buat Mapel'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

const getRumpunConfig = (mapel: any) => {
  const code = mapel.rumpun?.kode || mapel.rumpunKode || 'AMM';
  switch (code) {
    case 'ISL': return { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    case 'ARB': return { badge: 'bg-blue-100 text-blue-700 border-blue-200' };
    default: return { badge: 'bg-amber-100 text-amber-700 border-amber-200' };
  }
};

const getJenjangBadges = (str: string) => {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
};

export default function KMIMapelPage() {
  const { isBetaMode, toggleMode } = useKMIMode();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [aktifRumpun, setAktifRumpun] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Mapel | null>(null);

  const { data: rumpunList = [] } = useQuery<Rumpun[]>({
    queryKey: ['kmi-rumpun'],
    queryFn: () => isBetaMode ? Promise.resolve(MOCK_RUMPUN as any) : api.get('/kmi/rumpun').then(r => r.data),
    staleTime: 1000 * 60 * 60,
  });

  const { data: mapelList = [], isLoading } = useQuery<Mapel[]>({
    queryKey: ['kmi-mapel'],
    queryFn: () => isBetaMode ? Promise.resolve(MOCK_MAPEL as any) : api.get('/kmi/mapel').then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (body: any) => isBetaMode ? Promise.resolve({ data: body }) : (editData ? api.put(`/kmi/mapel/${editData.id}`, body) : api.post('/kmi/mapel', body)),
    onSuccess: () => {
      toast.success(isBetaMode ? 'Beta: Mapel berhasil disimpan (Local)' : (editData ? 'Mapel diperbarui' : 'Mapel berhasil dibuat'));
      if (!isBetaMode) qc.invalidateQueries({ queryKey: ['kmi-mapel'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => isBetaMode ? Promise.resolve() : api.delete(`/kmi/mapel/${id}`),
    onSuccess: () => {
      toast.success(isBetaMode ? 'Beta: Mapel dihapus (Local)' : 'Mapel berhasil dihapus');
      if (!isBetaMode) qc.invalidateQueries({ queryKey: ['kmi-mapel'] });
    },
    onError: () => toast.error('Gagal menghapus mapel'),
  });

  const statsByRumpun = {
    ISL: mapelList.filter(m => m.rumpunKode === 'ISL').length,
    ARB: mapelList.filter(m => m.rumpunKode === 'ARB').length,
    AMM: mapelList.filter(m => m.rumpunKode === 'AMM').length,
  };

  const filtered = mapelList.filter(m => {
    const matchSearch = m.nama.toLowerCase().includes(search.toLowerCase()) ||
      m.kode.toLowerCase().includes(search.toLowerCase()) ||
      (m.namaArab && m.namaArab.includes(search));
    const matchRumpun = aktifRumpun === 'ALL' || m.rumpunKode === aktifRumpun;
    return matchSearch && matchRumpun;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mata Pelajaran KMI</h1>
            <p className="text-sm text-muted-foreground">Kurikulum Kulliyatul Mu'allimin Al-Islamiyah — 3 Rumpun Ilmu</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditData(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-md active:scale-95">
            <Plus className="w-4 h-4" />
            Tambah Mapel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { kode: 'ISL', nama: 'Ulum Islamiyah', namaArab: 'العلوم الإسلامية', icon: '☪️', accent: 'border-l-emerald-500' },
          { kode: 'ARB', nama: 'Ulum Arabiyah', namaArab: 'العلوم العربية', icon: '📜', accent: 'border-l-emerald-600' },
          { kode: 'AMM', nama: 'Ulum Ammah', namaArab: 'العلوم العامة', icon: '📐', accent: 'border-l-amber-500' },
        ].map(r => (
          <motion.button
            key={r.kode}
            onClick={() => setAktifRumpun(aktifRumpun === r.kode ? 'ALL' : r.kode)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`card card--accent text-left p-5 rounded-[4px] border border-border border-l-[3px] ${r.accent} bg-card text-foreground transition-all min-h-[44px] ${
              aktifRumpun === r.kode ? 'ring-2 ring-emerald-500' : 'hover:bg-muted/40'
            }`}
          >
            <div className="text-2xl mb-2">{r.icon}</div>
            <p className="font-bold text-foreground">{r.nama}</p>
            <p className="text-muted-foreground text-sm font-arabic">{r.namaArab}</p>
            <p className="text-2xl font-bold mt-2 text-foreground">{statsByRumpun[r.kode as keyof typeof statsByRumpun] ?? 0}</p>
            <p className="text-muted-foreground text-xs">mata pelajaran</p>
          </motion.button>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari mata pelajaran, kode, atau nama Arab..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {rumpunList.map(r => (
            <button
              key={r.kode}
              onClick={() => setAktifRumpun(r.kode)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                aktifRumpun === r.kode
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {r.nama}
            </button>
          ))}
        </div>
      </div>

      {/* Mapel Table */}
      <div className="rounded-2xl border border-border overflow-hidden shadow-sm bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Kode</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Mata Pelajaran</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Nama Arab</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Kitab Referensi</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Jenjang</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">KKM</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Ujian</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((mapel, i) => {
                  const cfg = getRumpunConfig(mapel);
                  return (
                    <motion.tr
                      key={mapel.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono ${cfg.badge}`}>
                          {mapel.kode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{mapel.nama}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-muted-foreground font-arabic text-base">{mapel.namaArab}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">{mapel.kitabReferensi}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {getJenjangBadges(mapel.untukJenjang).slice(0, 3).map(j => (
                            <span key={j} className="text-xs px-1.5 py-0.5 bg-muted rounded-md text-muted-foreground">{j}</span>
                          ))}
                          {getJenjangBadges(mapel.untukJenjang).length > 3 && (
                            <span className="text-xs px-1.5 py-0.5 bg-muted rounded-md text-muted-foreground">+{getJenjangBadges(mapel.untukJenjang).length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-semibold ${mapel.kkm >= 75 ? 'text-orange-600' : 'text-muted-foreground'}`}>{mapel.kkm}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {mapel.isUjian ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            <Star className="w-3 h-3" /> Ya
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Non-ujian</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditData(mapel); setModalOpen(true); }}
                            className="p-1.5 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => window.confirm(`Hapus mapel ${mapel.nama}?`) && deleteMutation.mutate(mapel.id)}
                            className="p-1.5 rounded-lg bg-muted hover:bg-red-50 hover:text-red-600 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filtered.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                    <p className="text-muted-foreground">Tidak ada mata pelajaran yang ditemukan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Menampilkan {filtered.length} mata pelajaran</span>
          <div className="flex items-center gap-1">
            <BookMarked className="w-3.5 h-3.5" />
            <span>Total Aktif: ISL {statsByRumpun.ISL} | ARB {statsByRumpun.ARB} | AMM {statsByRumpun.AMM}</span>
          </div>
        </div>
      </div>

      <MapelFormModal 
        open={modalOpen} 
        onClose={() => { setModalOpen(false); setEditData(null); }} 
        data={editData} 
        rumpunList={rumpunList} 
      />
    </div>
  );
}
