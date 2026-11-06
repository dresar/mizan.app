import { BaseResourceForm } from '@/components/resources/BaseResourceForm';
import { z } from 'zod';
import { BookOpen, Sparkles } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DualImageInput } from '@/components/forms/DualImageInput';
import { Button } from '@/components/ui/button';
const historySchema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  deskripsi: z.string().min(1, 'Deskripsi harus diisi'),
  icon: z.string().optional(),
  images: z.array(z.string()).optional(),
  order: z.coerce.number().min(0),
});
type HistoryForm = z.infer<typeof historySchema>;
export default function HistoryFormPage() {
  const handleDummyData = (form: any) => {
    form.setValue('judul', '2015 - Pembangunan Masjid Utama');
    form.setValue('deskripsi', 'Dimulainya pembangunan Masjid Jami\' yang menjadi pusat kegiatan ibadah santri. Peletakan batu pertama dilakukan oleh Gubernur Riau.');
    form.setValue('order', 5);
    form.setValue('images', ['https://images.unsplash.com/photo-1564684502598-1b777a83d258?q=80&w=2000&auto=format&fit=crop']);
  };
  return (
    <BaseResourceForm<HistoryForm>
      resource="history"
      title="Sejarah & Timeline"
      basePath="/admin/history"
      schema={historySchema}
      defaultValues={{
        judul: '',
        deskripsi: '',
        icon: '',
        images: [],
        order: 0,
      }}
      icon={BookOpen}
      apiEndpoint="/core/sejarah-timeline"
    >
      {(form) => (
        <>
          <div className="flex justify-end mb-4">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => handleDummyData(form)}
              className="text-muted-foreground"
            >
              <Sparkles className="w-3 h-3 mr-2" />
              Isi Data Dummy
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="judul"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul / Tahun</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: 2010 - Pendirian" />
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
            name="images"
            render={({ field }) => (
              <FormItem>
                <DualImageInput
                  label="Gambar Ilustrasi (Opsional)"
                  value={field.value?.[0] || ''}
                  onChange={(val) => field.onChange(val ? [val] : [])}
                  placeholder="https://..."
                  showMediaLibrary
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deskripsi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi Peristiwa</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={5} placeholder="Jelaskan peristiwa sejarah..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </BaseResourceForm>
  );
}