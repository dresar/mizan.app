import { BaseResourceForm } from '@/components/resources/BaseResourceForm';
import { z } from 'zod';
import { GraduationCap } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DualImageInput } from '@/components/forms/DualImageInput';
import { MultiImageInput } from '@/components/forms/MultiImageInput';

const educationSchema = z.object({
  nama: z.string().min(1, 'Nama program harus diisi'),
  akreditasi: z.string().optional(),
  deskripsi: z.string().optional(),
  galeri: z.string().optional(),
  icon: z.string().optional(),
  gambar: z.string().optional(),
  order: z.coerce.number().min(0),
});

type EducationForm = z.infer<typeof educationSchema>;

export default function EducationFormPage() {
  return (
    <BaseResourceForm<EducationForm>
      resource="education"
      title="Program Pendidikan"
      basePath="/admin/education"
      schema={educationSchema}
      defaultValues={{
        nama: '',
        akreditasi: '',
        deskripsi: '',
        galeri: '',
        icon: '',
        gambar: '',
        order: 0,
      }}
      icon={GraduationCap}
      apiEndpoint="/core/program-pendidikan"
    >
      {(form) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Program Pendidikan</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Madrasah Aliyah (MA)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="akreditasi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Akreditasi</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: A" />
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
            <FormField
              control={form.control}
              name="gambar"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <DualImageInput
                    label="Gambar Ilustrasi"
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
          <div className="mt-6 space-y-6">
            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Program</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={5} placeholder="Jelaskan detail program pendidikan ini..." />
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