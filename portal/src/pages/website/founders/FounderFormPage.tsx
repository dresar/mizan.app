import { BaseResourceForm } from '@/components/resources/BaseResourceForm';
import { z } from 'zod';
import { Users } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DualImageInput } from '@/components/forms/DualImageInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
const founderSchema = z.object({
  namaLengkap: z.string().min(1, 'Nama Lengkap harus diisi').max(100),
  tanggalLahir: z.string().min(1, 'Tanggal Lahir harus diisi'),
  jabatan: z.enum(['Pendiri', 'Pengasuh', 'Penasehat']),
  nik: z.string().length(16, 'NIK harus 16 digit').regex(/^\d+$/, 'NIK harus berupa angka'),
  email: z.string().email('Email tidak valid'),
  noTelepon: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15, 'Nomor telepon maksimal 15 digit').regex(/^\d+$/, 'Nomor telepon harus berupa angka'),
  alamat: z.string().min(1, 'Alamat harus diisi').max(255),
  foto: z.string().min(1, 'Foto harus diisi'),
  pendidikanTerakhir: z.enum(['SD', 'SMP', 'SMA', 'D3', 'S1', 'S2', 'S3']),
  profilSingkat: z.string().min(1, 'Profil singkat harus diisi').max(200),
});
type FounderForm = z.infer<typeof founderSchema>;
export default function FounderFormPage() {
  return (
    <BaseResourceForm<FounderForm>
      resource="founders"
      title="Pendiri & Pengasuh"
      basePath="/admin/website/founders"
      schema={founderSchema}
      defaultValues={{
        namaLengkap: '',
        tanggalLahir: '',
        jabatan: 'Pendiri',
        nik: '',
        email: '',
        noTelepon: '',
        alamat: '',
        foto: '',
        pendidikanTerakhir: 'S1',
        profilSingkat: '',
      }}
      icon={Users}
      apiEndpoint="/core/admin/founders"
    >
      {(form) => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="namaLengkap"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Lengkap</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Pilih Jabatan" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Pendiri">Pendiri</SelectItem>
                                    <SelectItem value="Pengasuh">Pengasuh</SelectItem>
                                    <SelectItem value="Penasehat">Penasehat</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tanggalLahir"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tanggal Lahir</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="pendidikanTerakhir"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pendidikan Terakhir</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Pilih Pendidikan" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {['SD', 'SMP', 'SMA', 'D3', 'S1', 'S2', 'S3'].map(p => (
                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="nik"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>NIK (16 Digit)</FormLabel>
                            <FormControl><Input {...field} maxLength={16} /></FormControl>
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
                            <FormControl><Input type="email" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="noTelepon"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>No Telepon</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
                control={form.control}
                name="alamat"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Alamat Lengkap</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="profilSingkat"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Profil Singkat (Max 200 Karakter)</FormLabel>
                        <FormControl><Textarea {...field} maxLength={200} /></FormControl>
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
                            label="Foto Formal (Max 2MB)"
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
      )}
    </BaseResourceForm>
  );
}