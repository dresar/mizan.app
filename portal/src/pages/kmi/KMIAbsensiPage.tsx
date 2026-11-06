import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckSquare, Calendar, Search, ChevronDown, Save, Users,
  CheckCircle2, XCircle, Clock, AlertTriangle, FileText,
  BarChart3, Download, RefreshCw, Loader2, Zap, Beaker
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useKMIMode } from '@/hooks/use-kmi-mode';
import { MOCK_KELAS, MOCK_MAPEL } from './KMI_MOCKS';

type StatusAbsensi = 'hadir' | 'sakit' | 'izin' | 'alfa' | 'dispensasi';

interface AnggotaKelas {
  santriId: number;
  namaLengkap: string;
  nisn: string;
  nomorUrut: number | null;
}

interface AbsensiEntry {
  santriId: number;
  status: StatusAbsensi;
  keterangan: string;
}

const STATUS_CONFIG: Record<StatusAbsensi, { label: string; bg: string; text: string; border: string; icon: any; key: string }> = {
  hadir:       { label: 'Hadir',       bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-500', icon: CheckCircle2, key: 'H' },
  sakit:       { label: 'Sakit',       bg: 'bg-amber-400',   text: 'text-white', border: 'border-amber-400',   icon: AlertTriangle, key: 'S' },
  izin:        { label: 'Izin',        bg: 'bg-blue-400',    text: 'text-white', border: 'border-blue-400',    icon: Clock, key: 'I' },
  alfa:        { label: 'Alfa',        bg: 'bg-red-500',     text: 'text-white', border: 'border-red-500',     icon: XCircle, key: 'A' },
  dispensasi:  { label: 'Dispensasi',  bg: 'bg-purple-400',  text: 'text-white', border: 'border-purple-400',  icon: FileText, key: 'D' },
};

function StatusButton({ status, current, onClick }: { status: StatusAbsensi; current: StatusAbsensi; onClick: () => void }) {
  const cfg = STATUS_CONFIG[status];
  const isActive = current === status;
  const Icon = cfg.icon;
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border-2 ${
        isActive ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm` : 'bg-background border-border text-muted-foreground hover:border-gray-400'
      }`}
    >
      {cfg.key}
    </button>
  );
}

export default function KMIAbsensiPage() {
  const { isBetaMode, toggleMode } = useKMIMode();
  const qc = useQueryClient();
  const today = new Date().toLocaleDateString('en-CA');

  const [selectedKelasId, setSelectedKelasId] = useState<number | null>(null);
  const [selectedMapelId, setSelectedMapelId] = useState<number | ''>('');
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [tanggal, setTanggal] = useState(today);
  const [tipe, setTipe] = useState<'pelajaran' | 'ibadah' | 'muwajjah'>('pelajaran');
  const [catatan, setCatatan] = useState('');
  const [entries, setEntries] = useState<Record<number, AbsensiEntry>>({});
  const [search, setSearch] = useState('');
  const [showRekap, setShowRekap] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<StatusAbsensi | ''>('');

  // Fetch data
  const { data: kelasList = [] } = useQuery<any[]>({
    queryKey: ['kmi-kelas'],
    queryFn: () => isBetaMode ? Promise.resolve(MOCK_KELAS as any) : api.get('/kmi/kelas').then(r => r.data),
  });

  const { data: semesterList = [] } = useQuery<any[]>({
    queryKey: ['kmi-semester'],
    queryFn: () => api.get('/kmi/semester').then(r => r.data),
  });

  const { data: mapelList = [] } = useQuery<any[]>({
    queryKey: ['kmi-mapel'],
    queryFn: () => isBetaMode ? Promise.resolve(MOCK_MAPEL as any) : api.get('/kmi/mapel').then(r => r.data),
  });

  // Auto set active semester
  useEffect(() => {
    const aktif = semesterList.find(s => s.isAktif);
    if (aktif && !selectedSemesterId) setSelectedSemesterId(aktif.id);
    if (!selectedKelasId && kelasList[0]) setSelectedKelasId(kelasList[0].id);
  }, [semesterList, kelasList]);

  // Fetch anggota kelas
  const { data: kelasDetail, isLoading: loadingAnggota } = useQuery<{ anggota: AnggotaKelas[] }>({
    queryKey: ['kmi-kelas-detail', selectedKelasId],
    queryFn: () => api.get(`/kmi/kelas/${selectedKelasId}`).then(r => r.data),
    enabled: !!selectedKelasId,
  });
  const anggota = kelasDetail?.anggota ?? [];

  // Fetch existing absensi hari ini jika ada
  const { data: existingAbsensi } = useQuery<any[]>({
    queryKey: ['kmi-absensi', selectedKelasId, tanggal, selectedMapelId],
    queryFn: () => api.get('/kmi/absensi', {
      params: { kelasId: selectedKelasId, tanggal, semesterId: selectedSemesterId }
    }).then(r => r.data),
    enabled: !!selectedKelasId && !!tanggal,
  });

  // Inisialisasi entries ketika anggota berubah
  useEffect(() => {
    if (anggota.length > 0) {
      setEntries(prev => {
        const newEntries: Record<number, AbsensiEntry> = {};
        anggota.forEach(a => {
          newEntries[a.santriId] = prev[a.santriId] ?? { santriId: a.santriId, status: 'hadir', keterangan: '' };
        });
        return newEntries;
      });
    }
  }, [anggota]);

  const filteredAnggota = anggota.filter(a =>
    a.namaLengkap.toLowerCase().includes(search.toLowerCase()) || a.nisn?.includes(search)
  );

  // Bulk set status
  const handleBulkStatus = (status: StatusAbsensi) => {
    setBulkStatus(status);
    setEntries(prev => {
      const updated = { ...prev };
      filteredAnggota.forEach(a => { updated[a.santriId] = { ...updated[a.santriId], status }; });
      return updated;
    });
  };

  // Count stats
  const stats = Object.values(entries).reduce((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (dataOverride?: any) => {
      const payload = dataOverride || {
        kelasId: selectedKelasId,
        mapelId: selectedMapelId || undefined,
        tanggal,
        semesterId: selectedSemesterId,
        tipe,
        catatan: catatan || undefined,
        detail: Object.values(entries),
      };
      return isBetaMode ? Promise.resolve() : api.post('/kmi/absensi', payload);
    },
    onSuccess: () => {
      toast.success(isBetaMode ? 'Beta: Absensi berhasil dicatat (Local)' : `Absensi ${tanggal} berhasil disimpan!`);
      if (!isBetaMode) qc.invalidateQueries({ queryKey: ['kmi-absensi'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? 'Gagal menyimpan absensi'),
  });

  // Rekap
  const { data: rekapData = [], refetch: refetchRekap } = useQuery<any[]>({
    queryKey: ['kmi-absensi-rekap', selectedKelasId, selectedSemesterId],
    queryFn: () => api.get('/kmi/absensi/rekap/santri', { params: { kelasId: selectedKelasId, semesterId: selectedSemesterId } }).then(r => r.data),
    enabled: showRekap && !!selectedKelasId && !!selectedSemesterId,
  });

  const selectedKelas = kelasList.find(k => k.id === selectedKelasId);
  const canSave = selectedKelasId && selectedSemesterId && Object.keys(entries).length > 0;

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Absensi Digital</h1>
            <p className="text-sm text-muted-foreground">Input kehadiran santri per kelas & mata pelajaran</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowRekap(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              showRekap ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
            }`}>
            <BarChart3 className="w-4 h-4" /> {showRekap ? 'Input Absensi' : 'Rekap Absensi'}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Tanggal</label>
            <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Kelas</label>
            <select value={selectedKelasId ?? ''} onChange={e => setSelectedKelasId(parseInt(e.target.value))}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">— Pilih Kelas —</option>
              {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama} ({k.jenjangNama})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Mata Pelajaran (opsional)</label>
            <select value={selectedMapelId} onChange={e => setSelectedMapelId(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">— Umum/Semua —</option>
              {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Tipe Absensi</label>
            <select value={tipe} onChange={e => setTipe(e.target.value as any)}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
              <option value="pelajaran">Pelajaran</option>
              <option value="ibadah">Ibadah</option>
              <option value="muwajjah">Muwajjah</option>
            </select>
          </div>
        </div>
      </div>

      {!showRekap ? (
        /* ─── INPUT ABSENSI ─── */
        selectedKelasId ? (
          <div className="space-y-4">
            {/* Stats + Bulk Action */}
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Stats */}
                <div className="flex gap-3 flex-wrap">
                  {(Object.keys(STATUS_CONFIG) as StatusAbsensi[]).map(s => {
                    const cfg = STATUS_CONFIG[s];
                    const Icon = cfg.icon;
                    return (
                      <div key={s} className="flex items-center gap-1.5 text-sm">
                        <span className={`w-6 h-6 rounded-md ${cfg.bg} flex items-center justify-center`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </span>
                        <span className="font-semibold">{stats[s] ?? 0}</span>
                        <span className="text-muted-foreground text-xs">{cfg.label}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Bulk */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Set semua:</span>
                  {(Object.keys(STATUS_CONFIG) as StatusAbsensi[]).map(s => (
                    <button key={s} onClick={() => handleBulkStatus(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border-2 transition-all ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].text} ${STATUS_CONFIG[s].border}`}>
                      {STATUS_CONFIG[s].key}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari santri..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            {/* Absensi List */}
            {loadingAnggota ? (
              <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" /> Memuat daftar santri...
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-10">No.</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Nama Santri</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">NISN</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Status Kehadiran</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-40">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {filteredAnggota.map((a, i) => {
                          const entry = entries[a.santriId] ?? { santriId: a.santriId, status: 'hadir' as StatusAbsensi, keterangan: '' };
                          const currentCfg = STATUS_CONFIG[entry.status];
                          const Icon = currentCfg.icon;
                          return (
                            <motion.tr key={a.santriId}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className={`border-b border-border/50 transition-colors ${entry.status !== 'hadir' ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''}`}
                            >
                              <td className="px-4 py-2.5 text-muted-foreground text-xs">{i + 1}</td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-md ${currentCfg.bg} flex items-center justify-center flex-shrink-0 transition-all`}>
                                    <Icon className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="font-medium">{a.namaLengkap}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-muted-foreground text-xs hidden md:table-cell">{a.nisn}</td>
                              <td className="px-4 py-2.5">
                                <div className="flex gap-1 justify-center">
                                  {(Object.keys(STATUS_CONFIG) as StatusAbsensi[]).map(s => (
                                    <StatusButton key={s} status={s} current={entry.status}
                                      onClick={() => setEntries(prev => ({ ...prev, [a.santriId]: { ...prev[a.santriId], santriId: a.santriId, status: s } }))} />
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-2.5">
                                <input value={entry.keterangan}
                                  onChange={e => setEntries(prev => ({ ...prev, [a.santriId]: { ...prev[a.santriId], keterangan: e.target.value } }))}
                                  placeholder="Ket. opsional"
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs outline-none focus:ring-2 focus:ring-primary/30" />
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Catatan & Save */}
                <div className="p-4 border-t border-border bg-muted/30 flex flex-col sm:flex-row gap-3">
                  <input value={catatan} onChange={e => setCatatan(e.target.value)}
                    placeholder="Catatan absensi (opsional, misal: libur resmi, hujan lebat)..."
                    className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  <button
                    onClick={() => saveMutation.mutate()}
                    disabled={!canSave || saveMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-50 hover:opacity-90 shadow whitespace-nowrap">
                    {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Simpan Absensi ({Object.keys(entries).length} Santri)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
            <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Pilih kelas terlebih dahulu untuk mulai input absensi</p>
          </div>
        )
      ) : (
        /* ─── REKAP ABSENSI ─── */
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Rekap Kehadiran — {selectedKelas?.nama ?? '—'}</h2>
            <button onClick={() => refetchRekap()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Nama Santri</th>
                  {(Object.keys(STATUS_CONFIG) as StatusAbsensi[]).map(s => (
                    <th key={s} className="text-center px-3 py-3 font-semibold text-muted-foreground">{STATUS_CONFIG[s].label}</th>
                  ))}
                  <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Total</th>
                  <th className="text-center px-3 py-3 font-semibold text-muted-foreground">% Hadir</th>
                </tr>
              </thead>
              <tbody>
                {rekapData.map((r: any) => {
                  const total = (r.hadir ?? 0) + (r.sakit ?? 0) + (r.izin ?? 0) + (r.alfa ?? 0);
                  const persen = total > 0 ? Math.round((r.hadir / total) * 100) : 0;
                  return (
                    <tr key={r.santriId} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-medium">{r.namaLengkap}</td>
                      {(Object.keys(STATUS_CONFIG) as StatusAbsensi[]).map(s => (
                        <td key={s} className={`text-center px-3 py-2.5 font-semibold ${r[s] > 0 && s !== 'hadir' ? 'text-red-500' : ''}`}>
                          {r[s] ?? 0}
                        </td>
                      ))}
                      <td className="text-center px-3 py-2.5 text-muted-foreground">{total}</td>
                      <td className="text-center px-3 py-2.5">
                        <span className={`font-semibold ${persen >= 80 ? 'text-emerald-600' : persen >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                          {persen}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {rekapData.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Belum ada data absensi</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
