import { BaseResourceForm } from '@/components/resources/BaseResourceForm';
import { z } from 'zod';
import { Network } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  nama: z.string().min(1, 'Nama harus diisi'),
  jabatan: z.string().min(1, 'Jabatan harus diisi'),
  foto: z.string().optional(),
  level: z.coerce.number().min(0).max(10),
  order: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

type FormType = z.infer<typeof schema>;

export default function OrganisasiFormPage() {
  return (
    <BaseResourceForm<FormType>
      resource="strukturOrganisasi"
      title="Struktur Organisasi"
      basePath="/admin/organisasi"
      schema={schema}
      defaultValues={{
        nama: '',
        jabatan: '',
        foto: '',
        level: 1,
        order: 0,
        isActive: true,
      }}
      icon={Network}
      apiEndpoint="/admin/struktur-organisasi"
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
                    <Input {...field} placeholder="Nama pengurus..." />
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
                  <FormLabel>Jabatan</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Mudir / Kepala Sekolah..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tingkat (Level)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tingkatan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Level 0 - Pimpinan Tinggi (Mudir)</SelectItem>
                      <SelectItem value="1">Level 1 - Kepala Bidang/Unit</SelectItem>
                      <SelectItem value="2">Level 2 - Staff/Guru Utama</SelectItem>
                      <SelectItem value="3">Level 3 - Anggota</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urutan Tampil (di dalam level yang sama)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-background">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-primary">Status Aktif</FormLabel>
                    <div className="text-sm text-muted-foreground">Tampilkan di halaman publik</div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="foto"
            render={({ field }) => (
              <FormItem className="mt-6">
                <FormLabel>URL Foto Profil</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://..." value={field.value || ''} />
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
