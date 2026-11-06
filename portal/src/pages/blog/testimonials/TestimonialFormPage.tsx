import { BaseResourceForm } from '@/components/resources/BaseResourceForm';
import { z } from 'zod';
import { MessageSquareQuote } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DualImageInput } from '@/components/forms/DualImageInput';
const testimonialSchema = z.object({
  nama: z.string().min(1, 'Nama harus diisi'),
  jabatan: z.string().min(1, 'Jabatan/Status harus diisi'),
  testimoni: z.string().min(1, 'Isi testimoni harus diisi'),
  foto: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).default(5),
  isPublished: z.boolean().default(true),
  order: z.coerce.number().default(0),
});
type TestimonialForm = z.infer<typeof testimonialSchema>;
export default function TestimonialFormPage() {
  return (
    <BaseResourceForm<TestimonialForm>
      resource="blogTestimoni"
      title="Testimoni"
      basePath="/admin/testimonials"
      schema={testimonialSchema}
      defaultValues={{
        nama: '',
        jabatan: '',
        testimoni: '',
        foto: '',
        rating: 5,
        isPublished: true,
        order: 0,
      }}
      icon={MessageSquareQuote}
      apiEndpoint="/admin/generic/blogTestimoni"
    >
      {(form) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: H. Ahmad Dahlan" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jabatan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jabatan / Status</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Wali Santri / Alumni 2010" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="foto"
              render={({ field }) => (
                <FormItem>
                  <DualImageInput
                    label="Foto Profil"
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
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (1-5)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={5} {...field} />
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
            name="testimoni"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Isi Testimoni</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={4} placeholder="Tulis kesan dan pesan..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Tampilkan di Website</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Testimoni akan muncul di halaman depan jika diaktifkan.
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