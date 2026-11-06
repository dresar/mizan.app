import { BaseResourceForm } from '@/components/resources/BaseResourceForm';
import { z } from 'zod';
import { Sparkles } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { DualImageInput } from '@/components/forms/DualImageInput';
const heroSchema = z.object({
  title: z.string().min(1, 'Judul harus diisi'),
  subtitle: z.string().min(1, 'Sub Judul harus diisi'),
  image: z.string().optional(),
  order: z.coerce.number().min(0, 'Urutan harus berupa angka positif'),
  isActive: z.boolean().default(true),
});
type HeroForm = z.infer<typeof heroSchema>;
export default function HeroFormPage() {
  return (
    <BaseResourceForm<HeroForm>
      resource="hero"
      title="Hero Section"
      basePath="/admin/hero-sections"
      schema={heroSchema}
      defaultValues={{
        title: '',
        subtitle: '',
        image: '',
        order: 0,
        isActive: true,
      }}
      icon={Sparkles}
      apiEndpoint="/core/hero"
    >
      {(form) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Utama</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Selamat Datang di Pesantren Hub" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Judul</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Membangun Generasi Rabbani" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <DualImageInput
                    label="Gambar Background"
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
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urutan Tampil</FormLabel>
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
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Status Aktif</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Tampilkan slide ini di halaman depan website.
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