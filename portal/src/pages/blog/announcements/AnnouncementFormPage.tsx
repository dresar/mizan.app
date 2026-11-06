import { BaseResourceForm } from '@/components/resources/BaseResourceForm';
import { z } from 'zod';
import { Megaphone } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
const announcementSchema = z.object({
  judul: z.string().min(1, 'Judul pengumuman harus diisi'),
  slug: z.string().optional(),
  konten: z.string().min(1, 'Isi pengumuman harus diisi'),
  gambar: z.string().optional(),
  status: z.enum(['draft', 'published']).default('published'),
  isPenting: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  popupEnabled: z.boolean().default(false),
  popupImage: z.string().optional(),
  popupStartDate: z.string().optional(),
  popupEndDate: z.string().optional(),
});
type AnnouncementForm = z.infer<typeof announcementSchema>;
export default function AnnouncementFormPage() {
  return (
    <BaseResourceForm<AnnouncementForm>
      resource="blogPengumuman"
      title="Pengumuman"
      basePath="/admin/announcements"
      schema={announcementSchema}
      defaultValues={{
        judul: '',
        slug: '',
        konten: '',
        gambar: '',
        status: 'published',
        isPenting: false,
        metaTitle: '',
        metaDescription: '',
        popupEnabled: false,
        popupImage: '',
        popupStartDate: '',
        popupEndDate: '',
      }}
      icon={Megaphone}
      apiEndpoint="/admin/generic/blogPengumuman"
    >
      {(form) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="judul"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Pengumuman</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Libur Hari Raya" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (Opsional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="libur-hari-raya" />
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
              name="isPenting"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Pengumuman Penting</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Tandai sebagai pengumuman prioritas/penting
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
          </div>
          <FormField
            control={form.control}
            name="gambar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Gambar</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="konten"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Isi Pengumuman</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={10} placeholder="Tulis pengumuman lengkap di sini..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Popup Settings Section */}
          <div className="p-4 border rounded-lg bg-secondary/10 mt-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" /> Pengaturan Pop-up
            </h3>
            <p className="text-sm text-muted-foreground">Tampilkan pengumuman ini sebagai pop-up di halaman utama (publik).</p>
            
            <FormField
              control={form.control}
              name="popupEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-background">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-primary">Tampilkan Pop-up</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Aktifkan fitur pop-up untuk pengumuman ini.
                    </div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('popupEnabled') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="popupImage"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Gambar Pop-up (Opsional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="popupStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mulai Ditampilkan (Opsional)</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="popupEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Berakhir Ditampilkan (Opsional)</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t mt-6">
             <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title (SEO)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Judul untuk mesin pencari" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description (SEO)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Deskripsi singkat untuk hasil pencarian" />
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