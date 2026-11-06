import { BaseResourceForm } from '@/components/resources/BaseResourceForm';
import { z } from 'zod';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { FolderOpen, CalendarIcon, Plus, Trash2, Loader2 } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DualImageInput } from '@/components/forms/DualImageInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAppStore } from '@/stores/app-store';

type DokumentasiImage = {
  id: number;
  gambar: string;
  altText: string;
  order: number;
  dokumentasiId: number;
  createdAt?: string;
};

const documentationSchema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  deskripsi: z.string().min(1, 'Deskripsi harus diisi'),
  kategori: z.string().min(1, 'Kategori harus diisi'),
  tanggalKegiatan: z.coerce.date().nullable().optional(),
  lokasi: z.string().min(1, 'Lokasi harus diisi'),
  order: z.coerce.number().default(0),
  isPublished: z.boolean().default(true),
});
type DocumentationForm = z.infer<typeof documentationSchema>;
export default function DocumentationFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const dokumentasiId = id ? Number(id) : null;
  const queryClient = useQueryClient();
  const { showConfirm } = useAppStore();

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAltText, setNewImageAltText] = useState('');
  const [newImageOrder, setNewImageOrder] = useState<number>(0);

  const { data: allImagesRaw, isLoading: isLoadingImages } = useQuery({
    queryKey: ['resource', 'dokumentasiImages'],
    queryFn: async () => {
      const res = await api.get('/admin/generic/dokumentasiImages');
      return res.data;
    },
    enabled: isEdit,
  });

  const images = useMemo(() => {
    const all = Array.isArray(allImagesRaw)
      ? allImagesRaw
      : (allImagesRaw as { data?: unknown })?.data ?? [];
    const safe = Array.isArray(all) ? all : [];
    if (!dokumentasiId) return [];
    return (safe as any[])
      .filter((img) => {
        const imgDocId = img.dokumentasiId ?? img.dokumentasi_id;
        return String(imgDocId) === String(dokumentasiId);
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [allImagesRaw, dokumentasiId]);

  const addImageMutation = useMutation({
    mutationFn: async () => {
      if (!dokumentasiId) throw new Error('Dokumentasi ID tidak valid');
      if (!newImageUrl) throw new Error('URL gambar harus diisi');
      return api.post('/admin/generic/dokumentasiImages', {
        gambar: newImageUrl,
        altText: newImageAltText || '',
        order: Number.isFinite(newImageOrder) ? newImageOrder : 0,
        dokumentasiId,
        createdAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', 'dokumentasiImages'] });
      toast.success('Gambar berhasil ditambahkan');
      setNewImageUrl('');
      setNewImageAltText('');
      setNewImageOrder(0);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Gagal menambahkan gambar';
      toast.error(message);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return api.delete(`/admin/generic/dokumentasiImages/${imageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', 'dokumentasiImages'] });
      toast.success('Gambar berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus gambar');
    },
  });

  return (
    <BaseResourceForm<DocumentationForm>
      resource="dokumentasi"
      title="Dokumentasi"
      basePath="/admin/documentation"
      schema={documentationSchema}
      defaultValues={{
        judul: '',
        deskripsi: '',
        kategori: '',
        lokasi: '',
        order: 0,
        isPublished: true,
      }}
      icon={FolderOpen}
      apiEndpoint="/admin/generic/dokumentasi"
    >
      {(form) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="judul"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Dokumentasi</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Wisuda Angkatan 5" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kategori"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Akademik / Kesiswaan" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lokasi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi Kegiatan</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Aula Utama" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tanggalKegiatan"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Kegiatan</FormLabel>
                  {(() => {
                    const rawValue = field.value as unknown;
                    const selectedDate =
                      rawValue instanceof Date ? rawValue :
                      typeof rawValue === 'string' && rawValue ? new Date(rawValue) :
                      null;
                    const isValidDate = selectedDate instanceof Date && !Number.isNaN(selectedDate.getTime());

                    return (
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !isValidDate && "text-muted-foreground"
                          )}
                        >
                          {isValidDate ? (
                            format(selectedDate, "PPP")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={isValidDate ? selectedDate : undefined}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                    );
                  })()}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="deskripsi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi Lengkap</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={5} placeholder="Jelaskan detail kegiatan..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urutan</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-8">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publikasikan</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {isEdit && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Gambar Album (URL CDN)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>URL Gambar</Label>
                    <DualImageInput
                      value={newImageUrl}
                      onChange={(val) => setNewImageUrl(val || '')}
                      placeholder="https://..."
                      showMediaLibrary
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label>Alt Text (opsional)</Label>
                      <Input
                        value={newImageAltText}
                        onChange={(e) => setNewImageAltText(e.target.value)}
                        placeholder="Contoh: Foto kegiatan di aula"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Urutan</Label>
                      <Input
                        type="number"
                        value={newImageOrder}
                        onChange={(e) => setNewImageOrder(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => addImageMutation.mutate()}
                    disabled={addImageMutation.isPending || !newImageUrl}
                  >
                    {addImageMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Tambah Gambar
                  </Button>
                </div>

                {isLoadingImages ? (
                  <div className="text-sm text-muted-foreground">Memuat daftar gambar...</div>
                ) : images.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Belum ada gambar untuk album ini.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img) => (
                      <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                        <img
                          src={img.gambar}
                          alt={img.altText || form.getValues('judul') || 'Gambar'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                          Urutan: {img.order ?? 0}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={deleteImageMutation.isPending}
                          onClick={() => {
                            showConfirm({
                              title: 'Hapus Gambar',
                              description: 'Apakah Anda yakin ingin menghapus gambar ini dari album?',
                              variant: 'destructive',
                              onConfirm: () => deleteImageMutation.mutate(Number(img.id)),
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </BaseResourceForm>
  );
}
