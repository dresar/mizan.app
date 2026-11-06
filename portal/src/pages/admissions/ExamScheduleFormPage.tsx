import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { SantriSelect } from '@/components/forms/SantriSelect';
interface ExamSchedule {
  id: number;
  santriId: number;
  santri: {
    namaLengkap: string;
    nisn: string;
  };
  type: 'written' | 'interview' | 'quran';
  scheduledDate: string;
  location: string;
  examiner?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}
export default function ExamScheduleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const [formData, setFormData] = useState<Partial<ExamSchedule>>({
    type: 'written',
    status: 'scheduled',
    location: 'Gedung Utama',
    scheduledDate: new Date().toISOString().slice(0, 16), 
  });
  const { data: schedule, isLoading: isLoadingData } = useQuery({
    queryKey: ['exam-schedule', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await api.get(`/psb/schedules/${id}`); 
        return res.data;
      } catch (e) {
        const res = await api.get('/psb/schedules');
        return res.data.find((s: any) => s.id === parseInt(id));
      }
    },
    enabled: isEditing,
  });
  useEffect(() => {
    if (schedule) {
      setFormData({
        ...schedule,
        scheduledDate: new Date(schedule.scheduledDate).toISOString().slice(0, 16),
      });
    }
  }, [schedule]);
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/psb/schedules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-schedules'] });
      toast.success('Jadwal berhasil dibuat');
      navigate('/admin/admissions/schedules');
    },
    onError: () => toast.error('Gagal membuat jadwal'),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/psb/schedules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-schedules'] });
      toast.success('Jadwal berhasil diperbarui');
      navigate('/admin/admissions/schedules');
    },
    onError: () => toast.error('Gagal memperbarui jadwal'),
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.santriId || !formData.scheduledDate || !formData.location) {
      toast.error('Mohon lengkapi data wajib');
      return;
    }
    const payload = {
        ...formData,
    };
    if (isEditing && id) {
      updateMutation.mutate({ id: parseInt(id), data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  if (isEditing && isLoadingData) {
    return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
  }
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/admissions/schedules')}>
            <ArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader 
            title={isEditing ? 'Edit Jadwal' : 'Buat Jadwal Baru'} 
            description={isEditing ? 'Perbarui informasi jadwal seleksi' : 'Jadwalkan tes masuk atau wawancara baru'}
            icon={Calendar}
        />
      </div>
      <Card>
        <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Santri <span className="text-red-500">*</span></Label>
                            <SantriSelect 
                                value={formData.santriId} 
                                onSelect={(val) => setFormData({ ...formData, santriId: val })}
                                disabled={isEditing} 
                                status="verified"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Jenis Tes <span className="text-red-500">*</span></Label>
                            <Select 
                                value={formData.type} 
                                onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="written">Tes Tulis</SelectItem>
                                    <SelectItem value="interview">Wawancara</SelectItem>
                                    <SelectItem value="quran">Tes Al-Qur'an</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status <span className="text-red-500">*</span></Label>
                            <Select 
                                value={formData.status} 
                                onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="scheduled">Terjadwal</SelectItem>
                                    <SelectItem value="completed">Selesai</SelectItem>
                                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {/* Column 2 */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Waktu <span className="text-red-500">*</span></Label>
                            <Input 
                                type="datetime-local" 
                                value={formData.scheduledDate} 
                                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} 
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Lokasi <span className="text-red-500">*</span></Label>
                            <Input 
                                value={formData.location} 
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                                placeholder="Contoh: Ruang Kelas 1"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Penguji (Opsional)</Label>
                            <Input 
                                value={formData.examiner || ''} 
                                onChange={(e) => setFormData({ ...formData, examiner: e.target.value })} 
                                placeholder="Nama Penguji"
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Catatan (Opsional)</Label>
                    <Textarea 
                        value={formData.notes || ''} 
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                        placeholder="Catatan tambahan..."
                        rows={4}
                    />
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/admissions/schedules')}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Simpan Jadwal
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}