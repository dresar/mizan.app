import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Sparkles, Loader2, Clock, AlignLeft, Tag, Users } from 'lucide-react';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { aiService } from '@/services/ai-service';

export default function DailyScheduleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    waktu: '',
    judul: '',
    deskripsi: '',
    kategori: 'kegiatan',
    target: 'putra',
    order: 0,
  });

  const [isAiLoading, setIsAiLoading] = useState(false);

  // Fetch data if editing
  const { data: itemData, isLoading: isFetching } = useQuery({
    queryKey: ['jadwalHarian', id],
    queryFn: async () => {
      const res = await api.get(`/admin/generic/jadwalHarian/${id}`);
      return res.data.data || res.data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (itemData) {
      setFormData({
        waktu: itemData.waktu || '',
        judul: itemData.judul || '',
        deskripsi: itemData.deskripsi || '',
        kategori: itemData.kategori || 'kegiatan',
        target: itemData.target || 'putra',
        order: itemData.order || 0,
      });
    }
  }, [itemData]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        return api.put(`/admin/generic/jadwalHarian/${id}`, data);
      }
      return api.post('/admin/generic/jadwalHarian', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwalHarian'] });
      toast.success(isEditing ? 'Jadwal berhasil diperbarui' : 'Jadwal berhasil ditambahkan');
      navigate('/admin/daily-schedule');
    },
    onError: () => toast.error('Gagal menyimpan jadwal'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.waktu || !formData.judul) {
      toast.error('Mohon lengkapi Waktu dan Nama Kegiatan');
      return;
    }
    mutation.mutate(formData);
  };

  // AI Features
  const generateDescription = async () => {
    console.log("Generate button clicked. Title:", formData.judul);
    if (!formData.judul) {
      toast.error('Mohon isi Nama Kegiatan terlebih dahulu untuk generate deskripsi');
      return;
    }

    setIsAiLoading(true);
    try {
      // Use real AI service
      const prompt = `Buatkan deskripsi singkat, padat, dan inspiratif untuk kegiatan jadwal harian santri dengan judul: "${formData.judul}". Waktu kegiatan: ${formData.waktu}. Target peserta: Santri ${formData.target}.`;
      
      console.log("Calling AI Service with prompt:", prompt);
      const content = await aiService.generateContent({
        type: 'schedule_entry',
        prompt: prompt,
        tone: 'inspirational',
        length: 'short'
      });
      console.log("AI Service response:", content);

      if (content) {
          setFormData(prev => ({ ...prev, deskripsi: content }));
          toast.success('Deskripsi berhasil dibuat oleh AI');
          
          // Auto-suggest category if still default
          if (formData.kategori === 'kegiatan') {
            const lowerTitle = formData.judul.toLowerCase();
            let suggestedCategory = 'kegiatan';
            if (lowerTitle.includes('shalat') || lowerTitle.includes('sholat') || lowerTitle.includes('quran') || lowerTitle.includes('tahfidz') || lowerTitle.includes('dzikir')) {
              suggestedCategory = 'ibadah';
            } else if (lowerTitle.includes('belajar') || lowerTitle.includes('sekolah') || lowerTitle.includes('kelas') || lowerTitle.includes('kbm')) {
              suggestedCategory = 'pendidikan';
            } else if (lowerTitle.includes('makan') || lowerTitle.includes('istirahat') || lowerTitle.includes('tidur') || lowerTitle.includes('mandi')) {
              suggestedCategory = 'istirahat';
            }
            
            if (suggestedCategory !== 'kegiatan') {
                setFormData(prev => ({ ...prev, kategori: suggestedCategory }));
                toast.info(`Kategori otomatis diubah ke: ${suggestedCategory.charAt(0).toUpperCase() + suggestedCategory.slice(1)}`);
            }
          }
      } else {
        throw new Error("AI returned empty content");
      }

    } catch (error) {
      console.error("AI Error:", error);
      // Fallback to heuristic if AI fails (or no API key)
      toast.warning('Mode offline: Menggunakan generator deskripsi standar');
      
      let desc = '';
      const lowerTitle = formData.judul.toLowerCase();
      
      if (lowerTitle.includes('shalat') || lowerTitle.includes('sholat')) {
          desc = 'Melaksanakan ibadah shalat berjamaah di masjid pondok dengan khusyuk.';
      } else if (lowerTitle.includes('makan')) {
          desc = 'Makan bersama di ruang makan dengan adab-adab islami.';
      } else if (lowerTitle.includes('belajar') || lowerTitle.includes('kbm')) {
          desc = 'Kegiatan Belajar Mengajar (KBM) di kelas sesuai kurikulum pondok.';
      } else if (lowerTitle.includes('tidur') || lowerTitle.includes('istirahat')) {
          desc = 'Waktu istirahat malam untuk memulihkan tenaga agar siap beraktivitas esok hari.';
      } else if (lowerTitle.includes('quran') || lowerTitle.includes('tahfidz')) {
          desc = 'Setoran hafalan Al-Quran dan murajaah bersama ustadz/ustadzah.';
      } else {
          desc = `Melaksanakan kegiatan ${formData.judul} dengan tertib dan disiplin.`;
      }
      setFormData(prev => ({ ...prev, deskripsi: desc }));
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isEditing && isFetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fade-in pb-10 px-4">
      <PageHeader
        title={isEditing ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
        description={isEditing ? 'Perbarui informasi jadwal harian santri.' : 'Tambahkan kegiatan baru ke dalam jadwal harian santri.'}
        icon={Clock}
      >
        <Button variant="outline" onClick={() => navigate('/admin/daily-schedule')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" /> Target Peserta
                </Label>
                <Select
                  value={formData.target}
                  onValueChange={(value) => setFormData({ ...formData, target: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="putra">Santri Putra</SelectItem>
                    <SelectItem value="putri">Santri Putri</SelectItem>
                    <SelectItem value="semua">Semua Santri</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Input */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" /> Waktu
                </Label>
                <Input
                  value={formData.waktu}
                  onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                  placeholder="Contoh: 04:00 - 04:30"
                />
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                 <AlignLeft className="w-4 h-4 text-muted-foreground" /> Nama Kegiatan
              </Label>
              <Input
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                placeholder="Contoh: Shalat Subuh Berjamaah"
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" /> Kategori
              </Label>
              <Select
                value={formData.kategori}
                onValueChange={(v) => setFormData({ ...formData, kategori: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ibadah">Ibadah</SelectItem>
                  <SelectItem value="pendidikan">Pendidikan</SelectItem>
                  <SelectItem value="istirahat">Istirahat</SelectItem>
                  <SelectItem value="kegiatan">Kegiatan Umum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description Input with AI */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-muted-foreground" /> Deskripsi
                </Label>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all"
                    onClick={(e) => {
                        e.preventDefault(); // Extra safety
                        generateDescription();
                    }}
                    disabled={isAiLoading}
                    title="Generate deskripsi otomatis dengan AI"
                >
                    {isAiLoading ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                    )}
                    Generate with AI
                </Button>
              </div>
              <Textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Deskripsi kegiatan..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Klik tombol "Generate with AI" untuk membuat deskripsi otomatis berdasarkan nama kegiatan.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/daily-schedule')}>
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Simpan Perubahan' : 'Simpan Jadwal'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
