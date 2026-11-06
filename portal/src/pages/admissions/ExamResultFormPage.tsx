import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { SantriSelect } from '@/components/forms/SantriSelect';
interface ExamResult {
  id: number;
  santriId: number;
  santri: {
    namaLengkap: string;
    nisn: string;
  };
  writtenTestScore?: number;
  interviewScore?: number;
  quranTestScore?: number;
  totalScore?: number;
  status: 'lulus' | 'tidak_lulus' | 'pending' | 'cadangan';
  isPublished: boolean;
  notes?: string;
}
export default function ExamResultFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const [formData, setFormData] = useState<Partial<ExamResult>>({
    status: 'pending',
    isPublished: false,
  });
  const { data: result, isLoading: isLoadingData } = useQuery({
    queryKey: ['exam-result', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await api.get(`/psb/results/${id}`); 
        return res.data;
      } catch (e) {
        const res = await api.get('/psb/results');
        return res.data.find((r: any) => r.id === parseInt(id));
      }
    },
    enabled: isEditing,
  });
  useEffect(() => {
    if (result) {
      setFormData(result);
    }
  }, [result]);
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/psb/results', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results'] });
      toast.success('Hasil seleksi berhasil disimpan');
      navigate('/admin/admissions/results');
    },
    onError: () => toast.error('Gagal menyimpan hasil'),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/psb/results/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results'] });
      toast.success('Hasil seleksi berhasil diperbarui');
      navigate('/admin/admissions/results');
    },
    onError: () => toast.error('Gagal memperbarui hasil'),
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.santriId) {
      toast.error('Pilih santri terlebih dahulu');
      return;
    }
    if (isEditing && id) {
      updateMutation.mutate({ id: parseInt(id), data: formData });
    } else {
      createMutation.mutate(formData);
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/admissions/results')}>
            <ArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader 
            title={isEditing ? 'Edit Hasil Seleksi' : 'Input Hasil Seleksi'} 
            description={isEditing ? 'Perbarui nilai dan status kelulusan' : 'Input nilai ujian dan wawancara baru'}
            icon={ClipboardList}
        />
      </div>
      <Card>
        <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label>Santri <span className="text-red-500">*</span></Label>
                    <SantriSelect 
                        value={formData.santriId} 
                        onSelect={(val) => setFormData({ ...formData, santriId: val })}
                        disabled={isEditing} 
                    />
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label>Nilai Tulis</Label>
                        <Input 
                            type="number" 
                            value={formData.writtenTestScore || ''} 
                            onChange={(e) => setFormData({ ...formData, writtenTestScore: parseFloat(e.target.value) || 0 })} 
                            placeholder="0-100"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Nilai Wawancara</Label>
                        <Input 
                            type="number" 
                            value={formData.interviewScore || ''} 
                            onChange={(e) => setFormData({ ...formData, interviewScore: parseFloat(e.target.value) || 0 })} 
                            placeholder="0-100"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Nilai Al-Qur'an</Label>
                        <Input 
                            type="number" 
                            value={formData.quranTestScore || ''} 
                            onChange={(e) => setFormData({ ...formData, quranTestScore: parseFloat(e.target.value) || 0 })} 
                            placeholder="0-100"
                        />
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Total Nilai</Label>
                        <Input 
                            type="number" 
                            value={formData.totalScore || ''} 
                            onChange={(e) => setFormData({ ...formData, totalScore: parseFloat(e.target.value) || 0 })} 
                            placeholder="Total"
                        />
                        <p className="text-xs text-muted-foreground">Dapat diisi manual atau otomatis (jika ada formula)</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Status Kelulusan</Label>
                        <Select 
                            value={formData.status} 
                            onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Menunggu</SelectItem>
                                <SelectItem value="lulus">Lulus</SelectItem>
                                <SelectItem value="tidak_lulus">Tidak Lulus</SelectItem>
                                <SelectItem value="cadangan">Cadangan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-md bg-muted/20">
                    <Checkbox 
                        id="publish" 
                        checked={formData.isPublished}
                        onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked === true })}
                    />
                    <Label htmlFor="publish" className="cursor-pointer font-medium">
                        Publikasikan Hasil
                    </Label>
                    <span className="text-sm text-muted-foreground ml-2">(Hasil akan dapat dilihat oleh Santri di portal mereka)</span>
                </div>
                <div className="space-y-2">
                    <Label>Catatan (Opsional)</Label>
                    <Textarea 
                        value={formData.notes || ''} 
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                        placeholder="Catatan tambahan, pesan kelulusan, dll..."
                        rows={4}
                    />
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/admissions/results')}>
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
                                Simpan Hasil
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