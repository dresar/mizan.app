import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { CalendarDays, Save, Trash2, BookOpen, Clock, Users, Zap, Beaker } from 'lucide-react';
import { useKMIMode } from '@/hooks/use-kmi-mode';
import { MOCK_KELAS, MOCK_JAM_PELAJARAN, MOCK_GURU_MAPEL, MOCK_JADWAL } from './KMI_MOCKS';

const HARI = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu']; // Jumat libur

export default function KMIJadwalPage() {
  const { isBetaMode, toggleMode } = useKMIMode();
  const qc = useQueryClient();
  const [kelasId, setKelasId] = useState<number | ''>('');
  
  const { data: kelasList = [] } = useQuery<any[]>({ 
    queryKey: ['kmi-kelas'], 
    queryFn: () => isBetaMode ? Promise.resolve(MOCK_KELAS as any) : api.get('/kmi/kelas').then(r => r.data) 
  });
  const { data: semesterList = [] } = useQuery<any[]>({ 
    queryKey: ['kmi-semester'], 
    queryFn: () => isBetaMode ? Promise.resolve([{ id: 1, semester: 'Ganjil', isAktif: true }]) : api.get('/kmi/semester').then(r => r.data) 
  });
  const { data: guruMapel = [] } = useQuery<any[]>({ 
    queryKey: ['kmi-guru-mapel'], 
    queryFn: () => isBetaMode ? Promise.resolve(MOCK_GURU_MAPEL as any) : api.get('/kmi/guru-mapel', { params: { kelasId } }).then(r => r.data), enabled: !!kelasId 
  });
  const { data: jamList = [] } = useQuery<any[]>({ 
    queryKey: ['kmi-jam-pelajaran'], 
    queryFn: () => isBetaMode ? Promise.resolve(MOCK_JAM_PELAJARAN as any) : api.get('/kmi/jam-pelajaran').then(r => r.data) 
  });

  const aktifSem = semesterList.find((s: any) => s.isAktif);

  const { data: jadwal = [], isLoading } = useQuery<any[]>({
    queryKey: ['kmi-jadwal', aktifSem?.id, kelasId],
    queryFn: () => isBetaMode ? Promise.resolve(MOCK_JADWAL as any) : api.get('/kmi/jadwal', { params: { semesterId: aktifSem?.id, kelasId } }).then(r => r.data),
    enabled: !!aktifSem && !!kelasId
  });

  const [form, setForm] = useState({ hari: 'Ahad', jamKe: 1, guruMapelId: '' });

  const saveMutation = useMutation({
    mutationFn: () => {
      const gm = guruMapel.find(g => g.id === parseInt(form.guruMapelId));
      const jam = jamList.find(j => j.jamKe === form.jamKe);
      return api.post('/kmi/jadwal', {
        kelasId, semesterId: aktifSem?.id, hari: form.hari.toLowerCase(), jamKe: form.jamKe,
        mapelId: gm.mapelId, guruId: gm.guruId, jamMulai: jam.jamMulai, jamSelesai: jam.jamSelesai
      });
    },
    onSuccess: () => {
      toast.success('Jadwal ditambahkan!');
      qc.invalidateQueries({ queryKey: ['kmi-jadwal'] });
    }
  });

  const delMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/kmi/jadwal/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['kmi-jadwal'] }); }
  });

  const getJadwal = (h: string, j: number) => jadwal.find(x => x.hari === h.toLowerCase() && x.jamKe === j);

  return (
    <div className="p-6 space-y-6 max-w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Jadwal Pelajaran KMI</h1>
            <p className="text-sm text-muted-foreground font-arabic text-right md:text-left">نظام الجدول الدراسي</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Action buttons could go here */}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-end bg-card p-4 rounded-xl border border-border">
        <div className="flex-1 max-w-[250px]">
          <label className="text-xs">Pilih Kelas</label>
          <select value={kelasId} onChange={e => setKelasId(e.target.value ? parseInt(e.target.value) : '')} className="w-full mt-1 border px-3 py-2 rounded-lg text-sm bg-background">
            <option value="">— Pilih —</option>
            {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </div>
        {kelasId && (
          <>
            <div className="flex-1 max-w-[150px]">
              <label className="text-xs">Hari</label>
              <select value={form.hari} onChange={e => setForm(f => ({ ...f, hari: e.target.value }))} className="w-full mt-1 border px-3 py-2 rounded-lg text-sm bg-background">
                {HARI.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="flex-1 max-w-[150px]">
              <label className="text-xs">Jam Ke</label>
              <select value={form.jamKe} onChange={e => setForm(f => ({ ...f, jamKe: parseInt(e.target.value) }))} className="w-full mt-1 border px-3 py-2 rounded-lg text-sm bg-background">
                {jamList.map(j => <option key={j.jamKe} value={j.jamKe}>{j.jamKe} ({j.jamMulai}-{j.jamSelesai})</option>)}
              </select>
            </div>
            <div className="flex-1 max-w-[250px]">
              <label className="text-xs">Mata Pelajaran (dari Penugasan)</label>
              <select value={form.guruMapelId} onChange={e => setForm(f => ({ ...f, guruMapelId: e.target.value }))} className="w-full mt-1 border px-3 py-2 rounded-lg text-sm bg-background">
                <option value="">— Pilih —</option>
                {guruMapel.map(gm => <option key={gm.id} value={gm.id}>{gm.mapelNama} — {gm.guruNama}</option>)}
              </select>
            </div>
            <button onClick={() => saveMutation.mutate()} disabled={!form.guruMapelId}
              className="px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg">
              <span className="flex gap-2 items-center"><Save className="w-4 h-4"/> Set Jadwal</span>
            </button>
          </>
        )}
      </div>

      {kelasId ? (
        <div className="bg-card border rounded-xl overflow-hidden overflow-x-auto text-sm">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                <th className="border p-2">Jam Ke</th>
                {HARI.map(h => <th key={h} className="border p-2 text-center w-40">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {jamList.map(jam => (
                <tr key={jam.jamKe}>
                  <td className="border p-2 text-center font-medium w-32 bg-muted/30">
                    {jam.jamKe}<br/><span className="text-xs text-muted-foreground font-normal">{jam.jamMulai} - {jam.jamSelesai}</span>
                  </td>
                  {HARI.map(hari => {
                    const cell = getJadwal(hari, jam.jamKe);
                    return (
                      <td key={hari} className="border p-2 align-top h-20 hover:bg-muted/10 relative group">
                        {cell ? (
                          <div className="w-full h-full flex flex-col justify-center rounded bg-emerald-50 text-emerald-900 border border-emerald-200 p-2 text-xs">
                            <span className="font-bold flex gap-1 items-center mb-1"><BookOpen className="w-3 h-3"/> {cell.mapelNama}</span>
                            <span className="flex gap-1 items-center text-muted-foreground"><Users className="w-3 h-3"/> {cell.guruNama}</span>
                            <button onClick={() => delMutation.mutate(cell.id)} className="absolute top-1 right-1 p-1 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition"><Trash2 className="w-3 h-3"/></button>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-20 text-center border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground">Silakan pilih kelas terlebih dahulu untuk melihat dan mengatur jadwal.</p>
        </div>
      )}
    </div>
  );
}
