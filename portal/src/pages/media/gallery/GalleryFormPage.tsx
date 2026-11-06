import { BaseResourceForm } from '@/components/resources/BaseResourceForm';
import { z } from 'zod';
import { ImageIcon } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DualImageInput } from '@/components/forms/DualImageInput';
const gallerySchema = z.object({
  tipe: z.enum(['foto', 'video']),
  judul: z.string().min(1, 'Judul harus diisi'),
  subJudul: z.string().optional(),
  gambar: z.string().optional(),
  videoFile: z.string().optional(),
  featuredImage: z.string().optional(), 
  order: z.coerce.number().default(0),
  isPublished: z.boolean().default(true),
});
type GalleryForm = z.infer<typeof gallerySchema>;
export default function GalleryFormPage() {
  return (
    <BaseResourceForm<GalleryForm>
      resource="media"
      title="Galeri Media"
      basePath="/admin/gallery"
      schema={gallerySchema}
      defaultValues={{
        tipe: 'foto',
        judul: '',
        subJudul: '',
        gambar: '',
        videoFile: '',
        featuredImage: '',
        order: 0,
        isPublished: true,
      }}
      icon={ImageIcon}
      apiEndpoint="/admin/generic/media"
    >
      {(form) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="judul"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Galeri</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Kegiatan Maulid Nabi" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Media</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Tipe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="foto">Foto</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subJudul"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Judul / Keterangan Singkat</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Keterangan tambahan..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          </div>
          <FormField
            control={form.control}
            name="gambar"
            render={({ field }) => (
              <FormItem>
                <DualImageInput
                  label="Gambar / Foto"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="https://..."
                  showMediaLibrary
                />
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch('tipe') === 'video' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
               <FormField
                control={form.control}
                name="videoFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Video (YouTube / File)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://youtube.com/..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="featuredImage"
                render={({ field }) => (
                  <FormItem>
                    <DualImageInput
                      label="Thumbnail Video"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="https://..."
                      showMediaLibrary
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
             </div>
          )}
          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Status Publikasi</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Tampilkan di halaman galeri website
                  </div>
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
        </>
      )}
    </BaseResourceForm>
  );
}