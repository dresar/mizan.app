import { BaseResourceForm } from '@/components/resources/BaseResourceForm';
import { z } from 'zod';
import { Folder } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori harus diisi'),
  slug: z.string().optional(),
  order: z.coerce.number().default(0),
});
type CategoryForm = z.infer<typeof categorySchema>;
export default function CategoryFormPage() {
  return (
    <BaseResourceForm<CategoryForm>
      resource="blogCategory"
      title="Kategori Blog"
      basePath="/admin/blog/categories"
      schema={categorySchema}
      defaultValues={{
        name: '',
        slug: '',
        order: 0,
      }}
      icon={Folder}
      apiEndpoint="/admin/generic/blogCategory"
    >
      {(form) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kategori</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Berita Pesantren" />
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
                  <FormLabel>Slug (Auto-generated if empty)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="berita-pesantren" />
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
        </>
      )}
    </BaseResourceForm>
  );
}