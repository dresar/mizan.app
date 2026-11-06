import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Database, Check } from 'lucide-react';
import { toast } from 'sonner';
import { DualImageInput } from '@/components/forms/DualImageInput';
import { cn } from '@/lib/utils';
import { AIGeneratorButton } from '@/components/ai/AIGeneratorButton';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RESOURCE_FIELDS: Record<string, string[]> = {
  seragam: ['hari', 'seragamPutra', 'gambarPutra', 'seragamPutri', 'gambarPutri', 'order'],
  ekstrakurikuler: ['nama', 'icon', 'gambar', 'images', 'order'],
  faq: ['pertanyaan', 'jawaban', 'isPublished', 'order'],
  statistik: ['judul', 'nilai', 'icon', 'deskripsi', 'warna', 'order', 'isPublished'],
  biayaPendidikan: ['tipe', 'nama', 'jumlah', 'keterangan', 'order'],
  registrationFlow: ['title', 'description', 'icon', 'order', 'isActive'],
  informasiTambahan: ['judul', 'deskripsi', 'icon', 'warna', 'order', 'isPublished'],
  bagianJabatan: ['nama', 'deskripsi', 'order', 'isActive'],
};

const COLOR_MAP: Record<string, string> = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  teal: 'bg-teal-500',
  pink: 'bg-pink-500',
};

const BIAYA_TYPES = [
  { value: 'tahunan', label: 'Tahunan' },
  { value: 'bulanan', label: 'Bulanan' },
  { value: 'perlengkapan_putra', label: 'Perlengkapan Putra' },
  { value: 'perlengkapan_putri', label: 'Perlengkapan Putri' },
];

interface GenericResourceFormPageProps {
  resource: string;
  title: string;
  basePath: string;
}

export default function GenericResourceFormPage({ resource, title, basePath }: GenericResourceFormPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [fields, setFields] = useState<string[]>(RESOURCE_FIELDS[resource] || ['nama', 'deskripsi', 'keterangan', 'status', 'is_active']);

  const { data: sampleData } = useQuery({
    queryKey: ['generic', resource, 'schema'],
    queryFn: async () => {
      const response = await api.get(`/admin/generic/${resource}`);
      return response.data;
    },
    enabled: !id, 
  });

  const { data: itemData, isLoading } = useQuery({
    queryKey: ['generic', resource, id],
    queryFn: async () => {
      const response = await api.get(`/admin/generic/${resource}/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (RESOURCE_FIELDS[resource]) {
      setFields(RESOURCE_FIELDS[resource]);
      if (itemData) setFormData(itemData);
      return;
    }

    if (itemData) {
      setFormData(itemData);
      const keys = Object.keys(itemData).filter(k => 
        !['id', 'created_at', 'updated_at', 'createdAt', 'updatedAt'].includes(k) &&
        (typeof itemData[k] !== 'object' || itemData[k] === null)
      );
      if (keys.length > 0) setFields(keys);
    } else if (sampleData) {
        const items = Array.isArray(sampleData) ? sampleData : (sampleData?.data || []);
        if (items.length > 0) {
            const keys = Object.keys(items[0]).filter(k => 
                !['id', 'created_at', 'updated_at', 'createdAt', 'updatedAt'].includes(k) &&
                (typeof items[0][k] !== 'object' || items[0][k] === null)
            );
            if (keys.length > 0) setFields(keys);
        }
    }
  }, [itemData, sampleData, resource]);

  const formatRupiah = (value: string) => {
    const numberString = value.replace(/[^,\d]/g, '').toString();
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }

    return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  };

  const handleInputChange = (key: string, value: unknown) => {
    if (key === 'jumlah' && resource === 'biayaPendidikan') {
      const cleanValue = value.toString().replace(/\D/g, '');
      const formatted = formatRupiah(cleanValue);
      setFormData({ ...formData, [key]: formatted });
    } else {
      setFormData({ ...formData, [key]: value });
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const payload = { ...data } as Record<string, unknown>;
      if (resource === 'biayaPendidikan' && payload.jumlah) {
          payload.jumlah = parseInt(String(payload.jumlah).replace(/\./g, ''), 10);
      }
      
      // Ensure order is a number
      if (payload.order) {
          payload.order = parseInt(String(payload.order), 10);
      } else {
          payload.order = 0; // Default order if missing
      }

      if (id) {
        return api.put(`/admin/generic/${resource}/${id}`, payload);
      }
      return api.post(`/admin/generic/${resource}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generic', resource] });
      toast.success(id ? 'Data diperbarui' : 'Data berhasil disimpan');
      navigate(basePath);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string; error?: string } } };
      console.error('Form submission error:', error);
      const message = err.response?.data?.message || err.response?.data?.error || 'Gagal menyimpan data';
      toast.error(message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (id && isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={id ? `Edit ${title}` : `Tambah ${title}`} description={`Form ${title}`} icon={Database}>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                `/admin/ai-generator?type=blog&returnUrl=${encodeURIComponent(location.pathname)}&prompt=${encodeURIComponent(`Buat konten untuk ${title}`)}`
              )
            }
          >
            AI Generator
          </Button>
          <Button variant="outline" onClick={() => navigate(basePath)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </div>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Informasi {title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((key) => {
                const isImageField = key.toLowerCase().includes('image') || key.toLowerCase().includes('gambar') || key.toLowerCase().includes('foto');
                const isTextArea = key.toLowerCase().includes('deskripsi') || key.toLowerCase().includes('description') || key.toLowerCase().includes('content') || key.toLowerCase().includes('alamat') || key.toLowerCase().includes('jawaban') || key.toLowerCase().includes('keterangan');
                const isCurrency = key === 'jumlah' && resource === 'biayaPendidikan';
                const isDayDropdown = key === 'hari' && resource === 'seragam';
                const isOptional = (resource === 'seragam' && (key === 'seragamPutra' || key === 'seragamPutri' || key === 'gambarPutra' || key === 'gambarPutri'));
                const isColorField = key === 'warna' && (resource === 'statistik' || resource === 'informasiTambahan');
                const isBoolean = key === 'isPublished' || key === 'isActive';
                const isBiayaType = key === 'tipe' && resource === 'biayaPendidikan';
                
                return (
                  <div key={key} className={`space-y-2 ${isImageField || isTextArea || isColorField ? 'col-span-full' : ''}`}>
                    <Label className="capitalize flex items-center gap-2">
                      {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                      {isOptional && <span className="text-muted-foreground font-normal text-sm">(Opsional)</span>}
                    </Label>
                    
                    {key === 'images' ? (
                        <div className="space-y-4 col-span-full border p-4 rounded-xl bg-muted/10">
                            <div className="flex items-center justify-between mb-2">
                                <Label>Galeri Gambar (Max 5)</Label>
                                <span className="text-[10px] text-muted-foreground">{(formData[key] || []).length}/5</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(formData[key] || []).map((imgUrl: string, index: number) => (
                                    <div key={index} className="relative group">
                                         <DualImageInput
                                            value={imgUrl}
                                            onChange={(val) => {
                                                const newImages = [...(formData[key] || [])];
                                                if (val) {
                                                    newImages[index] = val;
                                                } else {
                                                    newImages.splice(index, 1);
                                                }
                                                handleInputChange(key, newImages);
                                            }}
                                            label={`Gambar ${index + 1}`}
                                            showMediaLibrary
                                        />
                                    </div>
                                ))}
                                {(formData[key] || []).length < 5 && (
                                    <div className="flex items-end h-full">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            className="w-full h-32 border-dashed flex flex-col gap-2"
                                            onClick={() => {
                                                const newImages = [...(formData[key] || []), ''];
                                                handleInputChange(key, newImages);
                                            }}
                                        >
                                            <Database className="w-6 h-6 opacity-30" />
                                            <span>Tambah Gambar</span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : isImageField ? (
                      <DualImageInput
                        value={formData[key] || ''}
                        onChange={(val) => handleInputChange(key, val)}
                        placeholder={`URL atau Upload ${key.replace(/_/g, ' ')}`}
                        showMediaLibrary
                      />
                    ) : isTextArea ? (
                      <div className="space-y-2">
                        <Textarea
                          value={formData[key] || ''}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          placeholder={`Masukkan ${key}`}
                          rows={5}
                        />
                        <AIGeneratorButton
                          type={key.toLowerCase().includes('jawaban') ? 'faq' : 'blog'}
                          label={`AI untuk ${key.replace(/_/g, ' ')}`}
                          size="sm"
                          variant="outline"
                          onInsert={(content) => handleInputChange(key, content)}
                        />
                      </div>
                    ) : isDayDropdown ? (
                      <Select
                        value={formData[key] || ''}
                        onValueChange={(val) => handleInputChange(key, val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Hari" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : isBiayaType ? (
                       <Select
                        value={formData[key] || ''}
                        onValueChange={(val) => handleInputChange(key, val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Tipe Biaya" />
                        </SelectTrigger>
                        <SelectContent>
                          {BIAYA_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : isColorField ? (
                        <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/20">
                            {Object.entries(COLOR_MAP).map(([colorKey, colorClass]) => (
                                <div
                                    key={colorKey}
                                    onClick={() => handleInputChange(key, colorKey)}
                                    className={cn(
                                        "w-12 h-12 rounded-full cursor-pointer flex items-center justify-center transition-all shadow-sm hover:shadow-md",
                                        colorClass,
                                        formData[key] === colorKey ? "ring-4 ring-offset-2 ring-primary scale-110" : "hover:scale-105 opacity-80 hover:opacity-100"
                                    )}
                                    title={colorKey}
                                >
                                    {formData[key] === colorKey && <Check className="w-6 h-6 text-white drop-shadow-md" />}
                                </div>
                            ))}
                        </div>
                    ) : isBoolean ? (
                        <div className="flex items-center space-x-3 p-2 border rounded-md">
                            <Switch
                                checked={formData[key] === true}
                                onCheckedChange={(val) => handleInputChange(key, val)}
                            />
                            <Label className="font-medium cursor-pointer" onClick={() => handleInputChange(key, !formData[key])}>
                                {formData[key] ? 'Aktif / Dipublikasikan' : 'Tidak Aktif / Draft'}
                            </Label>
                        </div>
                    ) : (
                      <div className="relative">
                          {isCurrency && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>}
                          <Input
                            value={formData[key] || ''}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            placeholder={`Masukkan ${key}`}
                            className={isCurrency ? 'pl-10' : ''}
                            type={key === 'order' ? 'number' : 'text'}
                          />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={mutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
