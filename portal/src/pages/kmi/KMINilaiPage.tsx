import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  NotebookPen, Save, Loader2, AlertCircle, CheckCircle,
  ChevronDown, Info, Star, Calculator, RefreshCw, Users,
  FileSpreadsheet, Zap, Beaker
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useKMIMode } from '@/hooks/use-kmi-mode';
import { MOCK_KELAS, MOCK_MAPEL, MOCK_SANTRI } from './KMI_MOCKS';

// Predikat KMI
const getPredikat = (nilai: number | null): { code: string; label: string; color: string } => {
  if (nilai === null || isNaN(nilai as number)) return { code: '—', label: '—', color: 'text-muted-foreground' };
  if (nilai >= 90) return { code: 'MMZ', label: 'Mumtaz', color: 'text-emerald-600' };
  if (nilai >= 80) return { code: 'JJ', label: 'Jayyid Jiddan', color: 'text-blue-600' };
  if (nilai >= 70) return { code: 'J', label: 'Jayyid', color: 'text-amber-600' };
  if (nilai >= 60) return { code: 'MQB', label: 'Maqbul', color: 'text-orange-600' };
  return { code: 'RSB', label: 'Rasib', color: 'text-red-600' };
};

const calcNilaiHarian = (uh1?: number | null, uh2?: number | null, uh3?: number | null, uh4?: number | null) => {
  const uhs = [uh1, uh2, uh3, uh4].filter(v => v !== null && v !== undefined && !isNaN(v as number)) as number[];
  return uhs.length > 0 ? uhs.reduce((a, b) => a + b, 0) / uhs.length : null;
};

const calcNilaiAkhir = (harian: number | null, uts: number | null, uas: number | null, bobotH: number, bobotUts: number, bobotUas: number) => {
  if (harian === null || uts === null || uas === null) return null;
  return Math.round(((harian * (bobotH / 100)) + (uts * (bobotUts / 100)) + (uas * (bobotUas / 100))) * 100) / 100;
};

interface NilaiRow {
  santriId: number;
  namaLengkap: string;
  nisn: string;
  uh1: string; uh2: string; uh3: string; uh4: string;
  uts: string; uas: string;
  nilaiAkhir: number | null;
  predikat: string | null;
  isModified: boolean;
}

function NilaiInput({ value, onChange, disabled, warn }: {
  value: string; onChange: (v: string) => void; disabled?: boolean; warn?: boolean;
}) {
  return (
    <input
      type="number"
      min={0} max={100} step={0.5}
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className={`w-14 px-2 py-1.5 rounded-lg border text-sm text-center font-medium outline-none focus:ring-2 transition-colors
        ${warn ? 'border-red-300 bg-red-50 focus:ring-red-200 dark:bg-red-950/20' : 'border-border bg-background focus:ring-primary/30'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    />
  );
}

export default function KMINilaiPage() {
  const { isBetaMode, toggleMode } = useKMIMode();
  const qc = useQueryClient();

  const [selectedKelasId, setSelectedKelasId] = useState<number | null>(null);
  const [selectedMapelId, setSelectedMapelId] = useState<number | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [rows, setRows] = useState<NilaiRow[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  // Queries
  const { data: kelasList = [] } = useQuery<any[]>({ 
    queryKey: ['kmi-kelas'], 
    queryFn: () => isBetaMode ? Promise.resolve(MOCK_KELAS as any) : api.get('/kmi/kelas').then(r => r.data) 
  });
  const { data: mapelList = [] } = useQuery<any[]>({ 
    queryKey: ['kmi-mapel'], 
    queryFn: () => isBetaMode ? Promise.resolve(MOCK_MAPEL as any) : api.get('/kmi/mapel').then(r => r.data) 
  });
  const { data: semesterList = [] } = useQuery<any[]>({ 
    queryKey: ['kmi-semester'], 
    queryFn: () => isBetaMode ? Promise.resolve([{ id: 1, semester: 'Ganjil', isAktif: true, tahunAjaranId: 2023 }]) : api.get('/kmi/semester').then(r => r.data) 
  });

  useEffect(() => {
    const aktif = semesterList.find((s: any) => s.isAktif);
    if (aktif && !selectedSemesterId) setSelectedSemesterId(aktif.id);
    if (!selectedKelasId && kelasList[0]) setSelectedKelasId(kelasList[0].id);
  }, [semesterList, kelasList]);

  const selectedMapel = mapelList.find((m: any) => m.id === selectedMapelId);
  const bobotH = selectedMapel?.bobotHarian ?? 20;
  const bobotUts = selectedMapel?.bobotUts ?? 30;
  const bobotUas = selectedMapel?.bobotUas ?? 50;

  // Fetch anggota kelas
  const { data: santriList = [], isLoading: loadingAnggota } = useQuery<any[]>({
    queryKey: ['kmi-kelas-detail', selectedKelasId],
    queryFn: () => isBetaMode ? Promise.resolve(MOCK_SANTRI as any) : api.get(`/kmi/kelas/${selectedKelasId}`).then(r => r.data.anggota),
    enabled: !!selectedKelasId,
  });

  // Fetch nilai existing
  const { data: nilaiList = [], isLoading: loadingNilai } = useQuery<any[]>({
    queryKey: ['kmi-nilai', selectedKelasId, selectedMapelId, selectedSemesterId],
    queryFn: () => isBetaMode ? Promise.resolve([]) : api.get('/kmi/nilai', { params: { kelasId: selectedKelasId, mapelId: selectedMapelId, semesterId: selectedSemesterId } }).then(r => r.data),
    enabled: !!selectedKelasId && !!selectedMapelId && !!selectedSemesterId,
  });

  // Build rows dari anggota + nilai existing
  useEffect(() => {
    if (!santriList) return;
    const nilaiMap: Record<number, any> = {};
    nilaiList.forEach(n => { nilaiMap[n.santriId] = n; });

    setRows(santriList.map((a: any) => {
      const n = nilaiMap[a.santriId];
      return {
        santriId: a.santriId,
        namaLengkap: a.namaLengkap,
        nisn: a.nisn,
        uh1: n?.nilaiUh1 ?? '',
        uh2: n?.nilaiUh2 ?? '',
        uh3: n?.nilaiUh3 ?? '',
        uh4: n?.nilaiUh4 ?? '',
        uts: n?.nilaiUts ?? '',
        uas: n?.nilaiUas ?? '',
        nilaiAkhir: n?.nilaiAkhir ? parseFloat(n.nilaiAkhir) : null,
        predikat: n?.predikat ?? null,
        isModified: false,
      };
    }));
    setSavedIds(new Set(nilaiList.map(n => n.santriId)));
  }, [santriList, nilaiList]);

  const updateRow = useCallback((santriId: number, field: string, value: string) => {
    setRows(prev => prev.map(r => {
      if (r.santriId !== santriId) return r;
      const updated = { ...r, [field]: value, isModified: true };
      // Recalculate
      const uh1 = parseFloat(updated.uh1) || null;
      const uh2 = parseFloat(updated.uh2) || null;
      const uh3 = parseFloat(updated.uh3) || null;
      const uh4 = parseFloat(updated.uh4) || null;
      const uts = parseFloat(updated.uts) || null;
      const uas = parseFloat(updated.uas) || null;
      const harian = calcNilaiHarian(uh1, uh2, uh3, uh4);
      const akhir = calcNilaiAkhir(harian, uts, uas, bobotH, bobotUts, bobotUas);
      const pred = getPredikat(akhir);
      return { ...updated, nilaiAkhir: akhir, predikat: pred.code };
    }));
  }, [bobotH, bobotUts, bobotUas]);

  // Bulk save
  const saveMutation = useMutation({
    mutationFn: () => {
      const modifiedRows = rows.filter(r => r.isModified);
      return api.post('/kmi/nilai/bulk', {
        mapelId: selectedMapelId,
        kelasId: selectedKelasId,
        semesterId: selectedSemesterId,
        rows: modifiedRows.map(r => ({
          santriId: r.santriId,
          nilaiUh1: r.uh1 ? parseFloat(r.uh1) : null,
          nilaiUh2: r.uh2 ? parseFloat(r.uh2) : null,
          nilaiUh3: r.uh3 ? parseFloat(r.uh3) : null,
          nilaiUh4: r.uh4 ? parseFloat(r.uh4) : null,
          nilaiUts: r.uts ? parseFloat(r.uts) : null,
          nilaiUas: r.uas ? parseFloat(r.uas) : null,
        })),
      });
    },
    onSuccess: (res) => {
      toast.success(`${res.data.saved} nilai berhasil disimpan!`);
      setRows(prev => prev.map(r => ({ ...r, isModified: false })));
      qc.invalidateQueries({ queryKey: ['kmi-nilai'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? 'Gagal menyimpan'),
  });

  const modifiedCount = rows.filter(r => r.isModified).length;

  // Stats
  const validNilai = rows.filter(r => r.nilaiAkhir !== null).map(r => r.nilaiAkhir as number);
  const avgNilai = validNilai.length > 0 ? validNilai.reduce((a, b) => a + b, 0) / validNilai.length : null;
  const maxNilai = validNilai.length > 0 ? Math.max(...validNilai) : null;
  const minNilai = validNilai.length > 0 ? Math.min(...validNilai) : null;
  const lulusCount = validNilai.filter(v => v >= (selectedMapel?.kkm ?? 70)).length;

  return (
    <div className="p-6 space-y-5 max-w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
            <NotebookPen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Input Nilai Santri</h1>
            <p className="text-sm text-muted-foreground">نظام إدخال الدرجات — {selectedKelasId ? 'Kelas Aktif' : 'Pilih Kelas'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {modifiedCount > 0 && (
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium shadow-lg hover:opacity-90 active:scale-95 transition-all">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan {modifiedCount} Nilai
            </button>
          )}
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all shadow shadow-emerald-200">
            <FileSpreadsheet className="w-4 h-4" />
            Import
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Kelas / Rombel</label>
            <select value={selectedKelasId ?? ''} onChange={e => setSelectedKelasId(parseInt(e.target.value))}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">— Pilih Kelas —</option>
              {kelasList.map((k: any) => <option key={k.id} value={k.id}>{k.nama} ({k.jenjangNama})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Mata Pelajaran</label>
            <select value={selectedMapelId ?? ''} onChange={e => setSelectedMapelId(parseInt(e.target.value))}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">— Pilih Mapel —</option>
              {mapelList.map((m: any) => <option key={m.id} value={m.id}>{m.nama} [{m.kode}]</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Semester</label>
            <select value={selectedSemesterId ?? ''} onChange={e => setSelectedSemesterId(parseInt(e.target.value))}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">— Pilih Semester —</option>
              {semesterList.map((s: any) => <option key={s.id} value={s.id}>{s.semester} {s.tahunAjaranId}</option>)}
            </select>
          </div>
        </div>

        {/* Mapel Info */}
        {selectedMapel && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
              <Calculator className="w-3 h-3" /> Bobot: {bobotH}% Harian + {bobotUts}% UTS + {bobotUas}% UAS
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200">
              KKM: <strong>{selectedMapel.kkm}</strong>
            </span>
            {selectedMapel.kitabReferensi && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 border border-purple-200">
                <Info className="w-3 h-3" /> {selectedMapel.kitabReferensi}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stats row */}
      {validNilai.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Rata-rata Kelas', value: avgNilai ? avgNilai.toFixed(1) : '—', pred: getPredikat(avgNilai) },
            { label: 'Nilai Tertinggi', value: maxNilai?.toFixed(1) ?? '—', pred: getPredikat(maxNilai) },
            { label: 'Nilai Terendah', value: minNilai?.toFixed(1) ?? '—', pred: getPredikat(minNilai) },
            { label: `Lulus KKM (≥${selectedMapel?.kkm ?? 70})`, value: `${lulusCount}/${validNilai.length}`, pred: getPredikat(lulusCount / validNilai.length * 100) },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl bg-card border border-border shadow-sm text-center">
              <p className={`text-xl font-bold ${s.pred.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Nilai Table */}
      {selectedKelasId && selectedMapelId && selectedSemesterId ? (
        loadingAnggota || loadingNilai ? (
          <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-3 py-3 font-semibold text-muted-foreground w-8">No.</th>
                    <th className="text-left px-3 py-3 font-semibold text-muted-foreground min-w-[160px]">Nama Santri</th>
                    <th className="text-center px-2 py-3 font-semibold text-muted-foreground" colSpan={4}>
                      <span className="text-xs">Harian (UH) — {bobotH}%</span>
                    </th>
                    <th className="text-center px-2 py-3 font-semibold text-muted-foreground border-l border-border">
                      <span className="text-xs">UTS {bobotUts}%</span>
                    </th>
                    <th className="text-center px-2 py-3 font-semibold text-muted-foreground border-l border-border">
                      <span className="text-xs">UAS {bobotUas}%</span>
                    </th>
                    <th className="text-center px-2 py-3 font-semibold text-muted-foreground border-l border-border min-w-[80px]">
                      <span className="text-xs">Nilai Akhir</span>
                    </th>
                    <th className="text-center px-2 py-3 font-semibold text-muted-foreground min-w-[90px]">
                      <span className="text-xs">Predikat</span>
                    </th>
                  </tr>
                  <tr className="bg-muted/30 border-b border-border">
                    <th colSpan={2} />
                    {['UH 1', 'UH 2', 'UH 3', 'UH 4'].map(h => (
                      <th key={h} className="text-center px-2 py-1.5 text-xs text-muted-foreground font-medium">{h}</th>
                    ))}
                    <th className="border-l border-border" />
                    <th className="border-l border-border" />
                    <th className="border-l border-border" />
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {rows.map((r, i) => {
                      const pred = getPredikat(r.nilaiAkhir);
                      const isLulus = r.nilaiAkhir !== null && r.nilaiAkhir >= (selectedMapel?.kkm ?? 70);
                      return (
                        <motion.tr key={r.santriId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`border-b border-border/50 transition-colors ${r.isModified ? 'bg-amber-50/40 dark:bg-amber-950/10' : 'hover:bg-muted/20'}`}>
                          <td className="px-3 py-2.5 text-muted-foreground text-xs text-center">{i + 1}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              {r.isModified && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />}
                              <div>
                                <p className="font-medium text-sm leading-tight">{r.namaLengkap}</p>
                                <p className="text-xs text-muted-foreground">{r.nisn}</p>
                              </div>
                            </div>
                          </td>
                          {(['uh1', 'uh2', 'uh3', 'uh4'] as const).map(field => (
                            <td key={field} className="px-1 py-2.5 text-center">
                              <NilaiInput value={r[field]} onChange={v => updateRow(r.santriId, field, v)}
                                warn={r[field] !== '' && parseFloat(r[field]) < (selectedMapel?.kkm ?? 70)} />
                            </td>
                          ))}
                          <td className="px-1 py-2.5 text-center border-l border-border">
                            <NilaiInput value={r.uts} onChange={v => updateRow(r.santriId, 'uts', v)}
                              warn={r.uts !== '' && parseFloat(r.uts) < (selectedMapel?.kkm ?? 70)} />
                          </td>
                          <td className="px-1 py-2.5 text-center border-l border-border">
                            <NilaiInput value={r.uas} onChange={v => updateRow(r.santriId, 'uas', v)}
                              warn={r.uas !== '' && parseFloat(r.uas) < (selectedMapel?.kkm ?? 70)} />
                          </td>
                          <td className="px-2 py-2.5 text-center border-l border-border">
                            {r.nilaiAkhir !== null ? (
                              <span className={`text-base font-bold ${isLulus ? 'text-emerald-600' : 'text-red-500'}`}>
                                {r.nilaiAkhir.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="px-2 py-2.5 text-center">
                            {r.nilaiAkhir !== null ? (
                              <div className="text-center">
                                <span className={`text-xs font-bold ${pred.color}`}>{pred.code}</span>
                                <p className={`text-xs ${pred.color} opacity-70`}>{pred.label}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {modifiedCount > 0 ? (
                  <span className="text-amber-600 font-medium">⚠️ {modifiedCount} baris belum disimpan</span>
                ) : rows.length > 0 ? (
                  <span className="text-emerald-600">✓ Semua nilai tersimpan</span>
                ) : null}
              </div>
              <div className="flex gap-2">
                {modifiedCount > 0 && (
                  <>
                    <button onClick={() => setRows(prev => prev.map(r => ({ ...r, isModified: false })))}
                      className="px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted">
                      Reset
                    </button>
                    <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60 shadow">
                      {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Simpan {modifiedCount} Nilai
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
          <NotebookPen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Pilih Kelas, Mata Pelajaran, dan Semester</p>
          <p className="text-xs text-muted-foreground mt-1">untuk mulai input nilai santri</p>
        </div>
      )}

      {/* Keterangan Predikat */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" /> Tabel Predikat Penilaian KMI
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {[
            { range: '90 – 100', code: 'MMZ', label: 'Mumtaz', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
            { range: '80 – 89', code: 'JJ', label: 'Jayyid Jiddan', color: 'bg-blue-100 text-blue-800 border-blue-200' },
            { range: '70 – 79', code: 'J', label: 'Jayyid', color: 'bg-amber-100 text-amber-800 border-amber-200' },
            { range: '60 – 69', code: 'MQB', label: 'Maqbul', color: 'bg-orange-100 text-orange-800 border-orange-200' },
            { range: '< 60', code: 'RSB', label: 'Rasib', color: 'bg-red-100 text-red-800 border-red-200' },
          ].map(p => (
            <div key={p.code} className={`px-3 py-2 rounded-xl border ${p.color} text-center`}>
              <p className="font-bold text-sm">{p.code}</p>
              <p className="font-medium">{p.label}</p>
              <p className="opacity-70">{p.range}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
