import { BaseResourceForm } from '@/components/resources/BaseResourceForm';
import { z } from 'zod';
import { UserCheck } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DualImageInput } from '@/components/forms/DualImageInput';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const teacherSchema = z.object({
  namaLengkap: z.string().min(1, 'Nama lengkap harus diisi'),
  namaPanggilan: z.string().optional(),
  jabatan: z.string().optional(),
  bagianJabatanId: z.coerce.number().optional(),
  jenisKelamin: z.enum(['L', 'P']),
  foto: z.string().optional(),
  tempatLahir: z.string().optional(),
  tanggalLahir: z.string().optional(),
  alamat: z.string().optional(),
  noHp: z.string().min(1, 'Nomor HP harus diisi'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  pendidikanTerakhir: z.string().optional(),
  universitas: z.string().optional(),
  tahunLulus: z.string().optional(),
  bidangKeahlian: z.string().optional(),
  mataPelajaran: z.string().optional(),
  pengalamanMengajar: z.string().optional(),
  prestasi: z.string().optional(),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  order: z.coerce.number().default(0),
  whatsapp: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
});
type TeacherForm = z.infer<typeof teacherSchema>;
export default function TeacherFormPage() {
  const { data: jabatanData } = useQuery({
    queryKey: ['generic', 'bagianJabatan'],
    queryFn: async () => {
      const response = await api.get('/admin/generic/bagianJabatan');
      return response.data;
    },
  });

  const jabatans = Array.isArray(jabatanData) ? jabatanData : (jabatanData?.data || []);

  return (
    <BaseResourceForm<TeacherForm>
      resource="tenagaPengajar"
      title="Tenaga Pengajar"
      basePath="/admin/teachers"
      schema={teacherSchema}
      defaultValues={{
        namaLengkap: '',
        namaPanggilan: '',
        jabatan: '',
        bagianJabatanId: undefined,
        jenisKelamin: 'L',
        foto: '',
        tempatLahir: '',
        tanggalLahir: '',
        alamat: '',
        noHp: '',
        email: '',
        pendidikanTerakhir: '',
        universitas: '',
        tahunLulus: '',
        bidangKeahlian: '',
        mataPelajaran: '',
        pengalamanMengajar: '',
        prestasi: '',
        isPublished: true,
        isFeatured: false,
        order: 0,
        whatsapp: '',
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
      }}
      icon={UserCheck}
      apiEndpoint="/admin/generic/tenagaPengajar"
    >
      {(form) => (
        <div className="space-y-6">
          {}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pribadi</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="namaLengkap"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Contoh: Muhammad Ali, S.Pd.I" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="namaPanggilan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Panggilan</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Contoh: Ustadz Ali" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bagianJabatanId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jabatan & Posisi</FormLabel>
                    <Select 
                      onValueChange={(val) => {
                        field.onChange(val);
                        // Also set the legacy jabatan string field for compatibility
                        const selectedJabatan = jabatans?.find((j: any) => j.id.toString() === val);
                        if (selectedJabatan) {
                          form.setValue('jabatan', selectedJabatan.nama);
                        }
                      }} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Jabatan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jabatans?.map((jabatan: any) => (
                          <SelectItem key={jabatan.id} value={jabatan.id.toString()}>
                            {jabatan.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jenisKelamin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Kelamin</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Jenis Kelamin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="noHp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor HP / WhatsApp</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="08..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="email@contoh.com" />
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
            </CardContent>
          </Card>
          {}
          <Card>
            <CardHeader>
              <CardTitle>Pendidikan & Keahlian</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="pendidikanTerakhir"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pendidikan Terakhir</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Contoh: S1 Pendidikan Agama Islam" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="universitas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alumni / Universitas</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nama Kampus / Pesantren" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="bidangKeahlian"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bidang Keahlian</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Contoh: Tafsir, Fiqih, Matematika" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="mataPelajaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mata Pelajaran yang Diampu</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Contoh: Bahasa Arab, SKI" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
           {}
          <Card>
            <CardHeader>
              <CardTitle>Sosial Media</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://facebook.com/..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://instagram.com/..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          {}
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status Aktif</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Tampilkan data guru ini di website
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
               <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Guru Favorit / Utama</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Tampilkan di halaman depan (Home)
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
            </CardContent>
          </Card>
        </div>
      )}
    </BaseResourceForm>
  );
}