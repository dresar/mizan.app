import { BaseResourceForm } from '@/components/resources/BaseResourceForm';
import { z } from 'zod';
import { Tag } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
const tagSchema = z.object({
  name: z.string().min(1, 'Nama tag harus diisi'),
  slug: z.string().optional(),
  order: z.coerce.number().default(0),
});
type TagForm = z.infer<typeof tagSchema>;
export default function TagFormPage() {
  return (
    <BaseResourceForm<TagForm>
      resource="blogTag"
      title="Tag Blog"
      basePath="/admin/blog/tags"
      schema={tagSchema}
      defaultValues={{
        name: '',
        slug: '',
        order: 0,
      }}
      icon={Tag}
      apiEndpoint="/admin/generic/blogTag"
    >
      {(form) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Tag</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Prestasi" />
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
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="prestasi" />
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