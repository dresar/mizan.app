import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { UserPlus, Save, Trash2, BookOpen, User, GraduationCap, Zap, Beaker, Users, UserCheck } from 'lucide-react';
import { useKMIMode } from '@/hooks/use-kmi-mode';
import { MOCK_KELAS, MOCK_GURU_MAPEL } from './KMI_MOCKS';

export default function KMIGuruMapelPage() {
  const { isBetaMode, toggleMode } = useKMIMode();
  const qc = useQueryClient();
  const [kelasId, setKelasId] = useState<number | ''>('');
  const [mapelId, setMapelId] = useState<number | ''>('');
  const [guruId, setGuruId] = useState<number | ''>('');

  const { data: guruList = [] } = useQuery<any[]>({ 
    queryKey: ['kmi-options-guru'], 
    queryFn: () => isBetaMode ? Promise.resolve([]) : api.get('/kmi/options/guru').then(r => r.data) 
  });
  const { data: mapelList = [] } = useQuery<any[]>({ 
    queryKey: ['kmi-mapel'], 
    queryFn: () => isBetaMode ? Promise.resolve([]) : api.get('/kmi/mapel').then(r => r.data) 
  });
  const { data: kelasList = [] } = useQuery<any[]>({ 
    queryKey: ['kmi-kelas'], 
    queryFn: () => isBetaMode ? Promise.resolve(MOCK_KELAS as any) : api.get('/kmi/kelas').then(r => r.data) 
  });
  const { data: semesterList = [] } = useQuery<any[]>({ queryKey: ['kmi-semester'], queryFn: () => api.get('/kmi/semester').then(r => r.data) });
  
  const aktifSem = semesterList.find((s: any) => s.isAktif);

  const { data: assignments = [], isLoading } = useQuery<any[]>({
    queryKey: ['kmi-guru-mapel', aktifSem?.id, isBetaMode],
    queryFn: () => isBetaMode ? Promise.resolve(MOCK_GURU_MAPEL as any) : api.get('/kmi/guru-mapel', { params: { semesterId: aktifSem?.id } }).then(r => r.data),
    enabled: !!aktifSem || isBetaMode
  });

  const assignMutation = useMutation({
    mutationFn: () => api.post('/kmi/guru-mapel', { kelasId, mapelId, guruId, semesterId: aktifSem?.id, jamPerMinggu: 2 }),
    onSuccess: () => {
      toast.success('Guru berhasil ditugaskan!');
      qc.invalidateQueries({ queryKey: ['kmi-guru-mapel'] });
    }
  });

  const delMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/kmi/guru-mapel/${id}`),
    onSuccess: () => {
      toast.success('Penugasan dihapus');
      qc.invalidateQueries({ queryKey: ['kmi-guru-mapel'] });
    }
  });

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Penugasan Guru Mapel</h1>
            <p className="text-sm text-muted-foreground">Plotting guru pengampu per mata pelajaran & kelas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Action buttons */}
        </div>
      </div>

      <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
        <h2 className="font-semibold text-sm mb-3">Tugaskan Guru Baru</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-muted-foreground">Guru</label>
            <select value={guruId} onChange={e => setGuruId(e.target.value ? parseInt(e.target.value) : '')} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-background">
              <option value="">— Pilih —</option>
              {guruList.map(g => <option key={g.id} value={g.id}>{g.nama}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-muted-foreground">Mata Pelajaran</label>
            <select value={mapelId} onChange={e => setMapelId(e.target.value ? parseInt(e.target.value) : '')} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-background">
              <option value="">— Pilih —</option>
              {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-medium text-muted-foreground">Kelas</label>
            <select value={kelasId} onChange={e => setKelasId(e.target.value ? parseInt(e.target.value) : '')} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-background">
              <option value="">— Pilih —</option>
              {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <button onClick={() => assignMutation.mutate()} disabled={!guruId || !mapelId || !kelasId || !aktifSem}
            className="h-[38px] px-5 bg-primary text-primary-foreground text-sm font-medium rounded-lg disabled:opacity-50">
            Simpan
          </button>
        </div>
      </div>

      <div className="overflow-hidden border border-border rounded-xl bg-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Guru</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Pelajaran</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Kelas</th>
              <th className="px-4 py-3 font-semibold pr-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(a => (
              <tr key={a.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium flex items-center gap-2"><UserCheck className="w-4 h-4 text-primary" /> {a.guruNama}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 opacity-50" /> {a.mapelNama}</div></td>
                <td className="px-4 py-3"><div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 opacity-50" /> {a.kelasNama}</div></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => delMutation.mutate(a.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
            {assignments.length === 0 && !isLoading && <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">Belum ada penugasan guru.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
