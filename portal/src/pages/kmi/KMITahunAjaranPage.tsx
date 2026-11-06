import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Calendar, Plus, Save, Trash2, CheckCircle, Edit2, Clock, Zap, Beaker } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKMIMode } from '@/hooks/use-kmi-mode';

export default function KMITahunAjaranPage() {
  const { isBetaMode, toggleMode } = useKMIMode();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    nama: '', tanggalMulai: '', tanggalSelesai: '', isAktif: false, keterangan: ''
  });

  const { data: tahunList = [], isLoading } = useQuery<any[]>({
    queryKey: ['kmi-tahun-ajaran'],
    queryFn: () => isBetaMode ? Promise.resolve([{ id: 1, nama: '2025/2026', isAktif: true, tanggalMulai: '2025-07-01', tanggalSelesai: '2026-06-30' }]) : api.get('/kmi/tahun-ajaran').then(r => r.data)
  });

  const saveMutation = useMutation({
    mutationFn: () => api.post('/kmi/tahun-ajaran', form),
    onSuccess: () => {
      toast.success('Tahun ajaran berhasil ditambahkan!');
      setForm({ nama: '', tanggalMulai: '', tanggalSelesai: '', isAktif: false, keterangan: '' });
      qc.invalidateQueries({ queryKey: ['kmi-tahun-ajaran'] });
    },
    onError: () => toast.error('Gagal menyimpan tahun ajaran')
  });

  const activeMutation = useMutation({
    mutationFn: (id: number) => api.put(`/kmi/tahun-ajaran/${id}`, { isAktif: true }),
    onSuccess: () => {
      toast.success('Berhasil mengubah tahun ajaran aktif!');
      qc.invalidateQueries({ queryKey: ['kmi-tahun-ajaran'] });
    }
  });

  const delMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/kmi/tahun-ajaran/${id}`),
    onSuccess: () => {
      toast.success('Tahun ajaran dihapus');
      qc.invalidateQueries({ queryKey: ['kmi-tahun-ajaran'] });
    }
  });

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Tahun Ajaran & Semester</h1>
            <p className="text-sm text-muted-foreground">Manajemen periode akademik aktif untuk seluruh sistem KMI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Action buttons */}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 border border-border bg-card shadow-sm rounded-2xl p-5 h-fit">
          <h2 className="font-semibold mb-4 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tambah Tahun Ajaran Baru
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nama (misal: 2025/2026)</label>
              <input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-primary/30 outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tanggal Mulai</label>
              <input type="date" value={form.tanggalMulai} onChange={e => setForm(f => ({ ...f, tanggalMulai: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-primary/30 outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tanggal Selesai</label>
              <input type="date" value={form.tanggalSelesai} onChange={e => setForm(f => ({ ...f, tanggalSelesai: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-primary/30 outline-none" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-2 text-sm font-medium">
              <input type="checkbox" checked={form.isAktif} onChange={e => setForm(f => ({ ...f, isAktif: e.target.checked }))} className="w-4 h-4" />
              Jadikan Tahun Aktif
            </label>
            <button onClick={() => saveMutation.mutate()} disabled={!form.nama || !form.tanggalMulai}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-primary/90">
              <Save className="w-4 h-4" /> Simpan
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          {isLoading ? (
            <p className="text-muted-foreground text-sm text-center py-10">Memuat data...</p>
          ) : (
            <div className="space-y-3">
              {tahunList.map((t: any) => (
                <div key={t.id} className={`p-4 rounded-xl border flex items-center justify-between ${t.isAktif ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card border-border'}`}>
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {t.nama}
                      {t.isAktif && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">AKTIF SEKARANG</span>}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(t.tanggalMulai).toLocaleDateString('id-ID')} - {new Date(t.tanggalSelesai).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!t.isAktif && (
                      <button onClick={() => activeMutation.mutate(t.id)}
                        className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-muted">
                        Set Aktif
                      </button>
                    )}
                    <button onClick={() => {
                      if(confirm('Hapus tahun ajaran ini?')) {
                        delMutation.mutate(t.id);
                      }
                    }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
