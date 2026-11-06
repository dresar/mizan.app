import { BaseResourceForm } from '@/components/resources/BaseResourceForm';
import { z } from 'zod';
import { Building2 } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DualImageInput } from '@/components/forms/DualImageInput';
const facilitiesSchema = z.object({
  nama: z.string().min(1, 'Nama fasilitas harus diisi'),
  icon: z.string().optional(),
  gambar: z.string().optional(),
  order: z.coerce.number().min(0),
});
type FacilitiesForm = z.infer<typeof facilitiesSchema>;
export default function FacilitiesFormPage() {
  return (
    <BaseResourceForm<FacilitiesForm>
      resource="facilities"
      title="Fasilitas"
      basePath="/admin/facilities"
      schema={facilitiesSchema}
      defaultValues={{
        nama: '',
        icon: '',
        gambar: '',
        order: 0,
      }}
      icon={Building2}
      apiEndpoint="/core/fasilitas"
    >
      {(form) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Fasilitas</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Masjid Utama" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon (Lucide name)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: mosque" />
                  </FormControl>
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
                    label="Gambar Fasilitas"
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
                  <FormLabel>Urutan</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
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