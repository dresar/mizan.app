import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ScrollText, Printer, Loader2, Star, Trophy, CheckCircle,
  AlertCircle, Users, ChevronDown, Eye, RefreshCw, FileText,
  Zap, Beaker
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useKMIMode } from '@/hooks/use-kmi-mode';
import { MOCK_KELAS, MOCK_RAPOR_LIST, MOCK_RAPOR_DETAIL } from './KMI_MOCKS';

const PREDIKAT_COLOR: Record<string, string> = {
  Mumtaz: 'text-emerald-600',
  'Jayyid Jiddan': 'text-blue-600',
  Jayyid: 'text-amber-600',
  Maqbul: 'text-orange-600',
  Rasib: 'text-red-600',
};

const NAIK_KELAS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  naik: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '✓ Naik Kelas' },
  tinggal: { bg: 'bg-red-100', text: 'text-red-700', label: '✗ Tinggal Kelas' },
  lulus: { bg: 'bg-blue-100', text: 'text-blue-700', label: '🎓 Lulus KMI' },
  keluar: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Keluar' },
};

/* ────────────────────────────────────────────────
 * RAPOR PRINT VIEW — format menyerupai rapor asli KMI
 * ─────────────────────────────────────────────── */
function RaporPrintView({ data }: { data: any }) {
  const { rapor, santri: ss, semester, kelas, nilai } = data;

  const rumpunGroups: Record<string, { nama: string; nilai: any[] }> = {};
  nilai.forEach((n: any) => {
    const key = n.rumpunKode ?? 'LAIN';
    if (!rumpunGroups[key]) rumpunGroups[key] = { nama: n.rumpunNama ?? 'Lainnya', nilai: [] };
    rumpunGroups[key].nilai.push(n);
  });

  return (
    <div className="bg-white text-black p-8 min-h-[297mm] w-[210mm] mx-auto font-serif print:shadow-none shadow-xl rounded-lg border">
      {/* KOP SURAT */}
      <div className="text-center border-b-2 border-black pb-4 mb-4">
        <div className="flex items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-xl">ك</div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wide">Pondok Pesantren Raudhatussalam Mahato</h1>
            <h2 className="text-base font-semibold">Kulliyatul Mu'allimin Wal-Muallimat Al-Islamiyah</h2>
            <p className="text-xs">Jl. Pesantren No. 1, Mahato, Rokan Hulu, Riau</p>
            <p className="text-xs">Telp. (0762) XXXXXX | Email: kmi@raudhatussalam.sch.id</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-xl">م</div>
        </div>
      </div>

      {/* JUDUL */}
      <div className="text-center mb-5">
        <h2 className="text-lg font-bold uppercase underline decoration-2">
          بُطَاقَة النَّتَائِجِ الدِّرَاسِيَّةِ
        </h2>
        <p className="text-base font-bold uppercase">RAPORT KMI</p>
        <p className="text-sm">Semester: <strong>{semester?.semester?.toUpperCase() ?? '—'}</strong></p>
      </div>

      {/* IDENTITAS SANTRI */}
      <div className="bg-gray-50 border border-gray-300 rounded p-3 mb-5 text-sm">
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          {[
            ['Nama', ss?.namaLengkap],
            ['NISN', ss?.nisn],
            ['Kelas', kelas?.nama],
            ['Program', kelas?.jenjang?.program === 'intensif' ? 'Intensif' : 'Reguler'],
            ['Wali Santri', ss?.namaOrangTua ?? ss?.namaAyah ?? '—'],
            ['Tahun Ajaran', `${semester?.tahunAjaranId ?? '—'}`],
          ].map(([label, value]) => (
            <div key={label} className="flex">
              <span className="w-28 text-gray-600">{label}</span>
              <span>: <strong>{value ?? '—'}</strong></span>
            </div>
          ))}
        </div>
      </div>

      {/* TABEL NILAI */}
      <table className="w-full text-xs border-collapse border border-gray-400 mb-4">
        <thead>
          <tr className="bg-emerald-800 text-white">
            <th className="border border-gray-400 px-2 py-1.5 text-left w-8">No.</th>
            <th className="border border-gray-400 px-2 py-1.5 text-left">Mata Pelajaran</th>
            <th className="border border-gray-400 px-2 py-1.5 text-center w-14">UH Avg</th>
            <th className="border border-gray-400 px-2 py-1.5 text-center w-12">UTS</th>
            <th className="border border-gray-400 px-2 py-1.5 text-center w-12">UAS</th>
            <th className="border border-gray-400 px-2 py-1.5 text-center w-14">Akhir</th>
            <th className="border border-gray-400 px-2 py-1.5 text-center w-14">KKM</th>
            <th className="border border-gray-400 px-2 py-1.5 text-center w-16">Predikat</th>
            <th className="border border-gray-400 px-2 py-1.5 text-center w-12">Ket.</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(rumpunGroups).map(([kode, grp]) => (
            <>
              <tr key={`header-${kode}`} className="bg-emerald-50">
                <td colSpan={9} className="border border-gray-400 px-2 py-1 font-bold text-emerald-900">
                  ─── {grp.nama} ───
                </td>
              </tr>
              {grp.nilai.map((n: any, i: number) => {
                const akhir = n.nilaiAkhir ? parseFloat(n.nilaiAkhir) : null;
                const lulus = akhir !== null && akhir >= n.kkm;
                return (
                  <tr key={n.mapelKode} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-2 py-1 text-center text-gray-500">{i + 1}</td>
                    <td className="border border-gray-300 px-2 py-1">
                      {n.mapelNama}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">{n.nilaiHarian ? parseFloat(n.nilaiHarian).toFixed(0) : '—'}</td>
                    <td className="border border-gray-300 px-2 py-1 text-center">{n.nilaiUts ? parseFloat(n.nilaiUts).toFixed(0) : '—'}</td>
                    <td className="border border-gray-300 px-2 py-1 text-center">{n.nilaiUas ? parseFloat(n.nilaiUas).toFixed(0) : '—'}</td>
                    <td className={`border border-gray-300 px-2 py-1 text-center font-bold ${lulus ? 'text-emerald-700' : akhir !== null ? 'text-red-600' : ''}`}>
                      {akhir ? akhir.toFixed(1) : '—'}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center text-gray-500">{n.kkm}</td>
                    <td className={`border border-gray-300 px-2 py-1 text-center font-bold text-xs ${PREDIKAT_COLOR[n.predikat] ?? ''}`}>
                      {n.predikat ?? '—'}
                    </td>
                    <td className={`border border-gray-300 px-2 py-1 text-center text-xs font-medium ${lulus ? 'text-emerald-600' : akhir !== null ? 'text-red-500' : ''}`}>
                      {akhir !== null ? (lulus ? 'L' : 'TL') : '—'}
                    </td>
                  </tr>
                );
              })}
            </>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-bold">
            <td colSpan={5} className="border border-gray-400 px-2 py-1.5 text-right">Rata-rata Nilai:</td>
            <td className="border border-gray-400 px-2 py-1.5 text-center font-bold">
              {rapor.nilaiRataRata ? parseFloat(rapor.nilaiRataRata).toFixed(1) : '—'}
            </td>
            <td colSpan={3} />
          </tr>
        </tfoot>
      </table>

      {/* KEHADIRAN & PERINGKAT */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        {/* Kehadiran */}
        <div className="border border-gray-300 rounded p-3">
          <h4 className="font-bold mb-2 text-center underline">Rekap Kehadiran</h4>
          <table className="w-full text-xs">
            <tbody>
              {[
                ['Hadir', rapor.totalHadir ?? 0, 'text-emerald-700'],
                ['Sakit', rapor.totalSakit ?? 0, 'text-amber-600'],
                ['Izin', rapor.totalIzin ?? 0, 'text-blue-600'],
                ['Alfa', rapor.totalAlfa ?? 0, 'text-red-600'],
              ].map(([label, val, cls]) => (
                <tr key={label as string}>
                  <td className="py-0.5">{label}</td>
                  <td className="text-right font-bold">
                    <span className={cls as string}>: {val} hari</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Peringkat & Status */}
        <div className="border border-gray-300 rounded p-3">
          <h4 className="font-bold mb-2 text-center underline">Hasil Evaluasi</h4>
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td>Peringkat Kelas</td>
                <td className="text-right font-bold">: {rapor.peringkatKelas ?? '—'} / {rapor.jumlahSiswaKelas ?? '—'}</td>
              </tr>
              <tr>
                <td>Predikat Umum</td>
                <td className={`text-right font-bold ${PREDIKAT_COLOR[rapor.predikatUmum ?? ''] ?? ''}`}>
                  : {rapor.predikatUmum ?? '—'}
                </td>
              </tr>
              <tr>
                <td>Kenaikan Kelas</td>
                <td className={`text-right font-bold ${rapor.statusNaikKelas === 'naik' ? 'text-emerald-700' : 'text-red-600'}`}>
                  : {NAIK_KELAS_BADGE[rapor.statusNaikKelas ?? '']?.label ?? '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Catatan */}
      {(rapor.catatanWaliKelas || rapor.catatanKepalaKmi) && (
        <div className="border border-gray-300 rounded p-3 text-sm mb-4">
          {rapor.catatanWaliKelas && <p className="mb-1"><strong>Catatan Wali Kelas:</strong> {rapor.catatanWaliKelas}</p>}
          {rapor.catatanKepalaKmi && <p><strong>Catatan Kepala KMI:</strong> {rapor.catatanKepalaKmi}</p>}
        </div>
      )}

      {/* TTD */}
      <div className="grid grid-cols-3 gap-4 text-sm text-center mt-6">
        <div>
          <p className="mb-16">Mengetahui,</p>
          <p className="font-bold border-t border-black pt-1">Wali Kelas</p>
          <p className="text-xs text-gray-500">{kelas?.waliKelasNama ?? '_______________'}</p>
        </div>
        <div>
          <p className="mb-16">Orang Tua/Wali,</p>
          <p className="font-bold border-t border-black pt-1">_______________</p>
          <p className="text-xs text-gray-500">&nbsp;</p>
        </div>
        <div>
          <p>Mahato, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="mb-10">Kepala KMI,</p>
          <p className="font-bold border-t border-black pt-1">_______________</p>
          <p className="text-xs text-gray-500">NIP. ________________</p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
 * MAIN PAGE
 * ─────────────────────────────────────────────── */
export default function KMIRaporPage() {
  const { isBetaMode, toggleMode } = useKMIMode();
  const qc = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);

  const [selectedKelasId, setSelectedKelasId] = useState<number | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [selectedSantriId, setSelectedSantriId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'print'>('list');

  const { data: kelasList = [] } = useQuery<any[]>({ 
    queryKey: ['kmi-kelas'], 
    queryFn: () => isBetaMode ? Promise.resolve(MOCK_KELAS as any) : api.get('/kmi/kelas').then(r => r.data) 
  });
  const { data: semesterList = [] } = useQuery<any[]>({ 
    queryKey: ['kmi-semester'], 
    queryFn: () => isBetaMode ? Promise.resolve([{ id: 1, semester: 'Ganjil', tahunAjaranId: '2025/2026' }]) : api.get('/kmi/semester').then(r => r.data) 
  });

  // Daftar rapor
  const { data: raporList = [], isLoading } = useQuery<any[]>({
    queryKey: ['kmi-rapor', selectedKelasId, selectedSemesterId],
    queryFn: () => isBetaMode ? Promise.resolve(MOCK_RAPOR_LIST as any) : api.get('/kmi/rapor', { params: { kelasId: selectedKelasId, semesterId: selectedSemesterId } }).then(r => r.data),
    enabled: !!selectedKelasId && !!selectedSemesterId,
  });

  // Detail rapor untuk satu santri (print view)
  const { data: raporDetail, isLoading: loadingDetail } = useQuery<any>({
    queryKey: ['kmi-rapor-detail', selectedSantriId, selectedSemesterId],
    queryFn: () => isBetaMode ? Promise.resolve(MOCK_RAPOR_DETAIL as any) : api.get(`/kmi/rapor/${selectedSantriId}/detail`, { params: { semesterId: selectedSemesterId } }).then(r => r.data),
    enabled: !!selectedSantriId && !!selectedSemesterId && viewMode === 'print',
  });

  // Generate rapor
  const generateMutation = useMutation({
    mutationFn: () => api.post('/kmi/rapor/generate', { kelasId: selectedKelasId, semesterId: selectedSemesterId }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ['kmi-rapor'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? 'Gagal generate rapor'),
  });

  const handlePrint = () => {
    window.print();
  };

  const selectedKelas = kelasList.find((k: any) => k.id === selectedKelasId);

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      {viewMode === 'print' && raporDetail ? (
        /* ─── PRINT VIEW ─── */
        <div>
          <div className="flex items-center gap-3 mb-4 print:hidden">
            <button onClick={() => { setViewMode('list'); setSelectedSantriId(null); }}
              className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted">
              ← Kembali ke Daftar
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow">
              <Printer className="w-4 h-4" /> Cetak / Simpan PDF
            </button>
          </div>
          {loadingDetail ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            <div ref={printRef}>
              <RaporPrintView data={raporDetail} />
            </div>
          )}
        </div>
      ) : (
        /* ─── LIST VIEW ─── */
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg">
                <ScrollText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Rapor KMI</h1>
                <p className="text-sm text-muted-foreground font-arabic text-right md:text-left">نظام الشهادات الدراسية</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Other action buttons */}
              {selectedKelasId && selectedSemesterId && (
                <button
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium shadow hover:bg-emerald-700 disabled:opacity-60">
                  {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Generate Rapor
                </button>
              )}
            </div>
          </div>

          {/* Filter */}
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Kelas / Rombel</label>
                <select value={selectedKelasId ?? ''} onChange={e => setSelectedKelasId(parseInt(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">— Pilih Kelas —</option>
                  {kelasList.map((k: any) => <option key={k.id} value={k.id}>{k.nama} ({k.jenjangNama})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Semester</label>
                <select value={selectedSemesterId ?? ''} onChange={e => setSelectedSemesterId(parseInt(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">— Pilih Semester —</option>
                  {semesterList.map((s: any) => <option key={s.id} value={s.id}>{s.semester} — {s.tahunAjaranId}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Rapor List */}
          {selectedKelasId && selectedSemesterId ? (
            isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : raporList.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Belum ada rapor</p>
                <p className="text-xs text-muted-foreground mt-1">Klik "Generate Rapor" untuk membuat rapor semua santri di kelas ini</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold">Daftar Rapor — {selectedKelas?.nama ?? '—'}</h2>
                  <span className="text-sm text-muted-foreground">{raporList.length} santri</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Santri</th>
                        <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Peringkat</th>
                        <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Rata-rata</th>
                        <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Predikat</th>
                        <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Kehadiran</th>
                        <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Status</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {raporList.map((r: any, i: number) => {
                          const predColor = PREDIKAT_COLOR[r.predikatUmum ?? ''] ?? 'text-muted-foreground';
                          const badge = NAIK_KELAS_BADGE[r.statusNaikKelas ?? ''];
                          return (
                            <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                              className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-medium">{r.namaLengkap}</p>
                                <p className="text-xs text-muted-foreground">{r.nisn}</p>
                              </td>
                              <td className="px-3 py-3 text-center">
                                {r.peringkatKelas ? (
                                  <div className="flex items-center justify-center gap-1">
                                    {r.peringkatKelas <= 3 && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                                    <span className="font-bold">{r.peringkatKelas}</span>
                                    <span className="text-xs text-muted-foreground">/{r.jumlahSiswaKelas}</span>
                                  </div>
                                ) : '—'}
                              </td>
                              <td className={`px-3 py-3 text-center font-bold text-base ${predColor}`}>
                                {r.nilaiRataRata ? parseFloat(r.nilaiRataRata).toFixed(1) : '—'}
                              </td>
                              <td className={`px-3 py-3 text-center font-semibold ${predColor}`}>
                                {r.predikatUmum ?? '—'}
                              </td>
                              <td className="px-3 py-3 text-center text-xs">
                                <span className="text-emerald-600">H:{r.totalHadir ?? 0}</span>{' '}
                                <span className="text-amber-500">S:{r.totalSakit ?? 0}</span>{' '}
                                <span className="text-blue-500">I:{r.totalIzin ?? 0}</span>{' '}
                                <span className="text-red-500">A:{r.totalAlfa ?? 0}</span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                {badge ? (
                                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.bg} ${badge.text}`}>
                                    {badge.label}
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => { setSelectedSantriId(r.santriId); setViewMode('print'); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium ml-auto hover:opacity-90">
                                  <Eye className="w-3.5 h-3.5" /> Lihat Rapor
                                </button>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
              <ScrollText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Pilih Kelas dan Semester untuk melihat rapor</p>
            </div>
          )}
        </>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body > *:not(#print-root) { display: none !important; }
          .print\\:hidden { display: none !important; }
          @page { margin: 10mm; size: A4; }
        }
      `}</style>
    </div>
  );
}
