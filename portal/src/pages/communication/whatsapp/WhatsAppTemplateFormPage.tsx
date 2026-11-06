import { BaseResourceForm } from '@/components/resources/BaseResourceForm';
import { z } from 'zod';
import { MessageSquare, Info } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
const whatsappTemplateSchema = z.object({
  nama: z.string().min(1, 'Nama template harus diisi'),
  tipe: z.enum(['public', 'system', 'admin', 'user']).default('public'),
  pesan: z.string().min(1, 'Isi pesan harus diisi'),
  variabel: z.string().optional(),
  order: z.coerce.number().default(0),
});
type WhatsAppTemplateForm = z.infer<typeof whatsappTemplateSchema>;
export default function WhatsAppTemplateFormPage() {
  return (
    <BaseResourceForm<WhatsAppTemplateForm>
      resource="whatsappTemplates"
      title="Template WhatsApp"
      basePath="/admin/whatsapp-templates"
      schema={whatsappTemplateSchema}
      defaultValues={{
        nama: '',
        tipe: 'public',
        pesan: '',
        variabel: '',
        order: 0,
      }}
      icon={MessageSquare}
      apiEndpoint="/admin/generic/whatsappTemplates"
    >
      {(form) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Template</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Info Pendaftaran" />
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
                  <FormLabel>Tipe / Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Tipe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public (Umum)</SelectItem>
                      <SelectItem value="user">User (Wali Santri/Santri)</SelectItem>
                      <SelectItem value="admin">Admin (Panel Admin)</SelectItem>
                      <SelectItem value="system">System (Internal)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pilih siapa yang dapat melihat dan menggunakan template ini.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="pesan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Isi Pesan</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Assalamu'alaikum {{nama-santri}}, berikut informasi..." 
                    className="min-h-[150px]"
                  />
                </FormControl>
                <FormDescription>
                  Gunakan format {'{{nama-variabel}}'} untuk data dinamis. Contoh: {'{{nama-santri}}'}, {'{{nis}}'}, {'{{kelas}}'}.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="variabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daftar Variabel (Opsional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="nama-santri, nis, kelas" />
                  </FormControl>
                  <FormDescription>
                    Sebutkan variabel yang digunakan, dipisahkan koma. Untuk dokumentasi saja.
                  </FormDescription>
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
          <div className="bg-muted/50 p-4 rounded-lg border border-border text-sm space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <Info className="w-4 h-4" />
              <span>Panduan Variabel Dinamis</span>
            </div>
            <p className="text-muted-foreground">
              Sistem akan otomatis mengganti variabel berikut dengan data pengguna yang sedang login (jika tersedia):
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
              <li><code className="bg-background px-1 rounded border">{'{{nama}}'}</code> - Nama Lengkap User</li>
              <li><code className="bg-background px-1 rounded border">{'{{email}}'}</code> - Email User</li>
              <li><code className="bg-background px-1 rounded border">{'{{no_hp}}'}</code> - Nomor HP User</li>
              {}
            </ul>
          </div>
        </>
      )}
    </BaseResourceForm>
  );
}