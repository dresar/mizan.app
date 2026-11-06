import { BaseResourceForm } from '@/components/resources/BaseResourceForm';
import { z } from 'zod';
import { Calendar } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DualImageInput } from '@/components/forms/DualImageInput';
import { MultiImageInput } from '@/components/forms/MultiImageInput';
const programSchema = z.object({
  nama: z.string().min(1, 'Nama program harus diisi'),
  deskripsi: z.string().min(1, 'Deskripsi harus diisi'),
  gambar: z.string().optional(),
  status: z.enum(['draft', 'published']).default('published'),
  isFeatured: z.boolean().default(false),
  tipe: z.string().optional(),
  durasi: z.string().optional(),
  keunggulan: z.string().optional(),
  galeri: z.string().optional(),
});
type ProgramForm = z.infer<typeof programSchema>;
export default function ProgramFormPage() {
  return (
    <BaseResourceForm<ProgramForm>
      resource="programs"
      title="Program Unggulan"
      basePath="/admin/programs"
      schema={programSchema}
      defaultValues={{
        nama: '',
        deskripsi: '',
        gambar: '',
        status: 'published',
        isFeatured: false,
        tipe: 'Reguler',
        durasi: '3 Tahun',
        keunggulan: 'Kurikulum Terpadu\nTenaga Pengajar Profesional\nFasilitas Lengkap\nEkstrakurikuler Beragam',
        galeri: '',
      }}
      icon={Calendar}
      apiEndpoint="/core/programs"
    >
      {(form) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Program</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Tahfidz Al-Qur'an" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gambar"
              render={({ field }) => (
                <FormItem>
                  <DualImageInput
                    label="Gambar Program"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="https://..."
                    showMediaLibrary
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Tampilkan di halaman depan sebagai unggulan
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
            <FormField
              control={form.control}
              name="tipe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Program</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Reguler / Pilihan" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="durasi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durasi Program</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: 3 Tahun / 6 Tahun" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={5} placeholder="Jelaskan detail program..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keunggulan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keunggulan Program (Satu Per Baris)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} placeholder="Contoh:&#10;Kurikulum Terpadu&#10;Tenaga Pengajar Profesional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="galeri"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormControl>
                    <MultiImageInput
                      label="Galeri Foto Tambahan"
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      )}
    </BaseResourceForm>
  );
}