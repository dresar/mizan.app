import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { BookCheck, Plus, CheckCircle, Save, Trash2, Calendar, Star, X, Clock, User, Users, Zap, Beaker } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKMIMode } from '@/hooks/use-kmi-mode';
import { MOCK_KELAS } from './KMI_MOCKS';

function JenisKokurModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ nama: '', namaArab: '', deskripsi: '', frekuensi: '', waktuPelaksanaan: '', isWajib: true, isDinilai: false });

  const mutation = useMutation({
    mutationFn: (body: any) => api.post('/kmi/kokur/jenis', body),
    onSuccess: () => {
      toast.success('Jenis ko-kurikuler ditambahkan!');
      qc.invalidateQueries({ queryKey: ['kmi-kokur-jenis'] });
      onClose();
    }
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden p-5 space-y-4">
        <h2 className="font-bold text-lg">Tambah Jenis Kegiatan</h2>
        <div className="space-y-3">
          <input placeholder="Nama Kegiatan (Muwajjah, dll)" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} className="w-full px-3 py-2 border rounded-xl" />
          <input placeholder="Nama Arab" value={form.namaArab} onChange={e => setForm(f => ({ ...f, namaArab: e.target.value }))} className="w-full px-3 py-2 border rounded-xl font-arabic text-right" />
          <input placeholder="Frekuensi (Setiap Malam, dll)" value={form.frekuensi} onChange={e => setForm(f => ({ ...f, frekuensi: e.target.value }))} className="w-full px-3 py-2 border rounded-xl" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isWajib} onChange={e => setForm(f => ({ ...f, isWajib: e.target.checked }))} /> Wajib Diikuti
          </label>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 border rounded-xl hover:bg-muted font-medium">Batal</button>
          <button onClick={() => mutation.mutate(form)} className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20">Simpan</button>
        </div>
      </div>
    </div>
  );
}

function SesiKokurModal({ open, onClose, jenisList }: { open: boolean; onClose: () => void; jenisList: any[] }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ jenisId: '', kelasId: '', tanggal: new Date().toLocaleDateString('en-CA'), waktuMulai: '19:00', materiTema: '' });

  const { data: kelasList = [] } = useQuery<any[]>({ queryKey: ['kmi-kelas'], queryFn: () => api.get('/kmi/kelas').then(r => r.data) });
  const { data: semesterList = [] } = useQuery<any[]>({ queryKey: ['kmi-semester'], queryFn: () => api.get('/kmi/semester').then(r => r.data) });
  const aktifSem = semesterList.find(s => s.isAktif);

  const mutation = useMutation({
    mutationFn: (body: any) => api.post('/kmi/kokur/sesi', { ...body, semesterId: aktifSem?.id }),
    onSuccess: () => {
      toast.success('Sesi ko-kurikuler dimulai!');
      qc.invalidateQueries({ queryKey: ['kmi-kokur-sesi'] });
      onClose();
    }
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden p-5 space-y-4">
        <h2 className="font-bold text-lg">Mulai Sesi Ko-Kurikuler</h2>
        <div className="space-y-3">
          <select value={form.jenisId} onChange={e => setForm(f => ({ ...f, jenisId: e.target.value }))} className="w-full px-3 py-2 border rounded-xl">
            <option value="">— Pilih Jenis —</option>
            {jenisList.map(j => <option key={j.id} value={j.id}>{j.nama}</option>)}
          </select>
          <select value={form.kelasId} onChange={e => setForm(f => ({ ...f, kelasId: e.target.value }))} className="w-full px-3 py-2 border rounded-xl">
            <option value="">— Pilih Kelas —</option>
            {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} className="px-3 py-2 border rounded-xl" />
            <input type="time" value={form.waktuMulai} onChange={e => setForm(f => ({ ...f, waktuMulai: e.target.value }))} className="px-3 py-2 border rounded-xl" />
          </div>
          <input placeholder="Materi / Tema (Opsional)" value={form.materiTema} onChange={e => setForm(f => ({ ...f, materiTema: e.target.value }))} className="w-full px-3 py-2 border rounded-xl" />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 border rounded-xl hover:bg-muted font-medium">Batal</button>
          <button onClick={() => mutation.mutate({ ...form, jenisId: parseInt(form.jenisId), kelasId: parseInt(form.kelasId) })} 
            disabled={!form.jenisId || !form.kelasId}
            className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 disabled:opacity-50">
            Mulai Sesi
          </button>
        </div>
      </div>
    </div>
  );
}

export default function KMIKokurPage() {
  const { isBetaMode, toggleMode } = useKMIMode();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'jenis' | 'sesi'>('sesi');
  const [jenisModal, setJenisModal] = useState(false);
  const [sesiModal, setSesiModal] = useState(false);

  const { data: jenisList = [] } = useQuery<any[]>({ 
    queryKey: ['kmi-kokur-jenis'], 
    queryFn: () => isBetaMode ? Promise.resolve([
      { id: 1, nama: 'Muwajjah Malam', namaArab: 'المراجعة الليلية', frekuensi: 'Setiap Malam', isWajib: true, isDinilai: false },
      { id: 2, nama: 'Muhadharah', namaArab: 'المحاضرة العامة', frekuensi: 'Kamis Sore', isWajib: true, isDinilai: true },
    ]) : api.get('/kmi/kokur/jenis').then(r => r.data) 
  });
  const { data: sesiList = [], isLoading } = useQuery<any[]>({ 
    queryKey: ['kmi-kokur-sesi'], 
    queryFn: () => isBetaMode ? Promise.resolve([
      { id: 1, jenisNama: 'Muwajjah Malam', kelasNama: '1 A', tanggal: '2024-04-20', waktuMulai: '20:00', pembimbingNama: 'Ust. Ridwan' },
    ]) : api.get('/kmi/kokur/sesi').then(r => r.data) 
  });

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg">
            <BookCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Ko-Kurikuler KMI</h1>
            <p className="text-sm text-muted-foreground">Muwajjah, Muhadharah, Lalaran Santri</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Action buttons */}
          {activeTab === 'jenis' ? (
            <button onClick={() => setJenisModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium shadow-md hover:opacity-90 active:scale-95 transition-all">
              <Plus className="w-4 h-4" /> Tambah Jenis
            </button>
          ) : (
            <button onClick={() => setSesiModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium shadow-md hover:opacity-90 active:scale-95 transition-all">
              <Plus className="w-4 h-4" /> Mulai Sesi Baru
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b">
        {(['sesi', 'jenis'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {tab === 'sesi' ? 'Jadwal Sesi' : 'Jenis Kurikulum'}
          </button>
        ))}
      </div>

      {activeTab === 'jenis' && (
        <div className="grid md:grid-cols-2 gap-4">
          {jenisList.map(j => (
            <div key={j.id} className="p-4 rounded-xl border bg-card shadow-sm">
              <h3 className="font-bold flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" /> {j.nama} 
                <span className="text-xs text-muted-foreground font-normal ml-auto px-2 py-0.5 bg-muted rounded-full">{j.frekuensi}</span>
              </h3>
              <p className="text-sm mt-2 font-arabic text-right mb-2">{j.namaArab}</p>
              <p className="text-xs text-muted-foreground mb-3">{j.deskripsi}</p>
              <div className="flex gap-2">
                {j.isWajib && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-md">Wajib</span>}
                {j.isDinilai && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">Dinilai</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'sesi' && (
        <div className="space-y-4">
          <p className="text-muted-foreground py-2 text-sm">Log sesi ko-kurikuler. Lengkapi form untuk memulai presensi kegiatan di kelas.</p>
          <div className="bg-card border rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold">Jenis Kegiatan</th>
                  <th className="px-4 py-3 font-semibold">Kelas</th>
                  <th className="px-4 py-3 font-semibold">Tanggal & Waktu</th>
                  <th className="px-4 py-3 font-semibold">Pembimbing</th>
                </tr>
              </thead>
              <tbody>
                {sesiList.map(s => (
                  <tr key={s.id} className="border-b border-border/50">
                    <td className="px-4 py-3 font-medium">{s.jenisNama}</td>
                    <td className="px-4 py-3">{s.kelasNama}</td>
                    <td className="px-4 py-3 flex gap-1 items-center"><Calendar className="w-4 h-4 text-muted-foreground"/> {s.tanggal} {s.waktuMulai ? ` (${s.waktuMulai})` : ''}</td>
                    <td className="px-4 py-3">{s.pembimbingNama}</td>
                  </tr>
                ))}
                {sesiList.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">Belum ada sesi tercatat.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <JenisKokurModal open={jenisModal} onClose={() => setJenisModal(false)} />
      <SesiKokurModal open={sesiModal} onClose={() => setSesiModal(false)} jenisList={jenisList} />
    </div>
  );
}
