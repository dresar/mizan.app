import { useState, useEffect, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DatePickerInput } from '@/components/ui/date-picker-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  GraduationCap,
  Save,
  ArrowLeft,
  User,
  Users,
  MapPin,
  School,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils'; 
const santriFormSchema = z.object({
  namaLengkap: z.string().min(3, 'Nama minimal 3 karakter'),
  namaPanggilan: z.string().optional(),
  nisn: z.string().length(10, 'NISN harus 10 digit').optional().or(z.literal('')),
  tempatLahir: z.string().min(1, 'Tempat lahir wajib diisi'),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  jenisKelamin: z.enum(['L', 'P'], { required_error: 'Pilih jenis kelamin' }),
  agama: z.string().default('Islam'),
  kewarganegaraan: z.string().default('WNI'),
  anakKe: z.coerce.number().optional(),
  jumlahSaudara: z.coerce.number().optional(),
  bahasaSehariHari: z.string().optional(),
  golonganDarah: z.string().optional(),
  tinggiBadan: z.coerce.number().optional(),
  beratBadan: z.coerce.number().optional(),
  riwayatPenyakit: z.string().optional(),
  tinggalDengan: z.string().optional(),
  namaAyah: z.string().min(1, 'Nama ayah wajib diisi'),
  nikAyah: z.string().optional(),
  pendidikanAyah: z.string().optional(),
  pekerjaanAyah: z.string().optional(),
  penghasilanAyah: z.string().optional(),
  noHpAyah: z.string().optional(),
  statusAyah: z.string().default('Hidup'),
  namaIbu: z.string().min(1, 'Nama ibu wajib diisi'),
  nikIbu: z.string().optional(),
  pendidikanIbu: z.string().optional(),
  pekerjaanIbu: z.string().optional(),
  penghasilanIbu: z.string().optional(),
  noHpIbu: z.string().optional(),
  statusIbu: z.string().default('Hidup'),
  alamat: z.string().min(1, 'Alamat wajib diisi'),
  desa: z.string().optional(),
  kecamatan: z.string().optional(),
  kabupaten: z.string().optional(),
  provinsi: z.string().optional(),
  kodePos: z.string().optional(),
  noHp: z.string().optional(),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  alamatOrangTua: z.string().optional(),
  asalSekolah: z.string().min(1, 'Asal sekolah wajib diisi'),
  npsnSekolah: z.string().optional(),
  kelasTerakhir: z.string().optional(),
  tahunLulus: z.string().optional(),
  noIjazah: z.string().optional(),
  fotoSantri: z.string().optional(),
  fotoKtp: z.string().optional(),
  fotoAkta: z.string().optional(),
  fotoIjazah: z.string().optional(),
  fotoKk: z.string().optional(),
  suratSehat: z.string().optional(),
});
type SantriFormValues = z.infer<typeof santriFormSchema>;
export default function SantriFormPage() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditMode = Boolean(id);
  const [activeTab, setActiveTab] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof SantriFormValues
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file melebihi 2MB');
      return;
    }
    setUploading((prev) => ({ ...prev, [field as string]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.url;
      if (!url) {
        toast.error('Gagal mengunggah file');
        return;
      }
      form.setValue(field, url);
      toast.success('File berhasil diunggah');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengunggah file';
      toast.error(message);
    } finally {
      setUploading((prev) => ({ ...prev, [field as string]: false }));
      e.target.value = '';
    }
  };
  const [sameAddress, setSameAddress] = useState(false);
  const form = useForm<SantriFormValues>({
    resolver: zodResolver(santriFormSchema),
    defaultValues: {
      statusAyah: 'Hidup',
      statusIbu: 'Hidup',
      tinggalDengan: 'Orang Tua',
    },
  });
  useEffect(() => {
    if (isEditMode && id) {
      const fetchSantri = async () => {
        setIsLoading(true);
        try {
          const response = await api.get(`/admin/santri/${id}`);
          const data = response.data;
          const formValues = {
            ...data,
            tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir).toISOString().split('T')[0] : '',
            anakKe: data.anakKe?.toString(),
            jumlahSaudara: data.jumlahSaudara?.toString(),
            tinggiBadan: data.tinggiBadan?.toString(),
            beratBadan: data.beratBadan?.toString(),
            nisn: data.nisn || '',
            email: data.email || '',
          };
          form.reset(formValues);
          if (data.alamat && data.alamat === data.alamatOrangTua) {
            setSameAddress(true);
          }
        } catch (error) {
          console.error('Failed to fetch santri:', error);
          toast.error('Gagal memuat data santri');
          navigate('/admin/admissions');
        } finally {
          setIsLoading(false);
        }
      };
      fetchSantri();
    }
  }, [id, isEditMode, form, navigate]);
  const onSubmit = async (values: SantriFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        alamatOrangTua: sameAddress ? values.alamat : (values.alamatOrangTua || values.alamat),
        anakKe: values.anakKe ? Number(values.anakKe) : undefined,
        jumlahSaudara: values.jumlahSaudara ? Number(values.jumlahSaudara) : undefined,
        tinggiBadan: values.tinggiBadan ? Number(values.tinggiBadan) : undefined,
        beratBadan: values.beratBadan ? Number(values.beratBadan) : undefined,
      };
      if (isEditMode) {
        await api.put(`/admin/santri/${id}`, payload);
        toast.success('Data santri berhasil diperbarui');
      } else {
        await api.post('/admin/santri', payload);
        toast.success('Data santri berhasil disimpan');
      }
      navigate('/admin/admissions');
    } catch (error: unknown) {
      console.error('Submission error:', error);
      const message = error instanceof Error ? error.message : 'Gagal menyimpan data santri';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const tabs = [
    { id: 'personal', label: 'Data Pribadi', icon: User },
    { id: 'parents', label: 'Data Orang Tua', icon: Users },
    { id: 'address', label: 'Alamat', icon: MapPin },
    { id: 'school', label: 'Asal Sekolah', icon: School },
    { id: 'documents', label: 'Dokumen', icon: FileText },
  ];
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Memuat data santri...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isEditMode ? "Edit Data Santri" : "Tambah Santri Baru"}
        description={isEditMode ? "Perbarui informasi santri" : "Formulir pendaftaran santri baru"}
        icon={GraduationCap}
      >
        <Button variant="outline" onClick={() => navigate('/admin/admissions')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </PageHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                  <tab.icon className="h-4 w-4 hidden sm:block" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Data Pribadi Santri</CardTitle>
                  <CardDescription>
                    Informasi dasar calon santri
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="namaLengkap"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Nama Lengkap *</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama lengkap" {...field} />
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
                        <FormLabel>Nama Panggilan *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama panggilan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nisn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NISN *</FormLabel>
                        <FormControl>
                          <Input placeholder="10 digit NISN" maxLength={10} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tempatLahir"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tempat Lahir *</FormLabel>
                        <FormControl>
                          <Input placeholder="Kota/Kabupaten" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tanggalLahir"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <DatePickerInput
                            label="Tanggal Lahir *"
                            value={field.value}
                            onChange={field.onChange}
                            error={form.formState.errors.tanggalLahir?.message}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jenisKelamin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Kelamin *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis kelamin" />
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
                    name="golonganDarah"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Golongan Darah</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih golongan darah" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="AB">AB</SelectItem>
                            <SelectItem value="O">O</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="anakKe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anak Ke</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} placeholder="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jumlahSaudara"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah Saudara</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tinggiBadan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tinggi Badan (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="150" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="beratBadan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Berat Badan (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="45" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bahasaSehariHari"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bahasa Sehari-hari</FormLabel>
                        <FormControl>
                          <Input placeholder="Indonesia, Jawa, dll" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="riwayatPenyakit"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Riwayat Penyakit</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tuliskan riwayat penyakit jika ada, atau kosongkan jika tidak ada"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            {}
            <TabsContent value="parents">
              <div className="grid gap-6 lg:grid-cols-2">
                {}
                <Card>
                  <CardHeader>
                    <CardTitle>Data Ayah</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="namaAyah"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Lengkap Ayah *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama lengkap ayah" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nikAyah"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIK Ayah</FormLabel>
                          <FormControl>
                            <Input placeholder="16 digit NIK" maxLength={16} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pendidikanAyah"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pendidikan Terakhir</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih pendidikan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SD">SD/MI</SelectItem>
                              <SelectItem value="SMP">SMP/MTs</SelectItem>
                              <SelectItem value="SMA">SMA/MA/SMK</SelectItem>
                              <SelectItem value="D3">D3</SelectItem>
                              <SelectItem value="S1">S1</SelectItem>
                              <SelectItem value="S2">S2</SelectItem>
                              <SelectItem value="S3">S3</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pekerjaanAyah"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pekerjaan</FormLabel>
                          <FormControl>
                            <Input placeholder="Pekerjaan ayah" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="penghasilanAyah"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Penghasilan</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kisaran penghasilan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="< 1 Juta">&lt; 1 Juta</SelectItem>
                              <SelectItem value="1-3 Juta">1 - 3 Juta</SelectItem>
                              <SelectItem value="3-5 Juta">3 - 5 Juta</SelectItem>
                              <SelectItem value="> 5 Juta">&gt; 5 Juta</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="noHpAyah"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. HP</FormLabel>
                          <FormControl>
                            <Input placeholder="08xxxxxxxxxx" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="statusAyah"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Hidup">Hidup</SelectItem>
                              <SelectItem value="Meninggal">Meninggal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                {}
                <Card>
                  <CardHeader>
                    <CardTitle>Data Ibu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="namaIbu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Lengkap Ibu *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama lengkap ibu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nikIbu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIK Ibu</FormLabel>
                          <FormControl>
                            <Input placeholder="16 digit NIK" maxLength={16} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pendidikanIbu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pendidikan Terakhir</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih pendidikan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SD">SD/MI</SelectItem>
                              <SelectItem value="SMP">SMP/MTs</SelectItem>
                              <SelectItem value="SMA">SMA/MA/SMK</SelectItem>
                              <SelectItem value="D3">D3</SelectItem>
                              <SelectItem value="S1">S1</SelectItem>
                              <SelectItem value="S2">S2</SelectItem>
                              <SelectItem value="S3">S3</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pekerjaanIbu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pekerjaan</FormLabel>
                          <FormControl>
                            <Input placeholder="Pekerjaan ibu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="penghasilanIbu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Penghasilan</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kisaran penghasilan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="< 1 Juta">&lt; 1 Juta</SelectItem>
                              <SelectItem value="1-3 Juta">1 - 3 Juta</SelectItem>
                              <SelectItem value="3-5 Juta">3 - 5 Juta</SelectItem>
                              <SelectItem value="> 5 Juta">&gt; 5 Juta</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="noHpIbu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. HP</FormLabel>
                          <FormControl>
                            <Input placeholder="08xxxxxxxxxx" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="statusIbu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Hidup">Hidup</SelectItem>
                              <SelectItem value="Meninggal">Meninggal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            {}
            <TabsContent value="address">
              <Card>
                <CardHeader>
                  <CardTitle>Alamat Santri</CardTitle>
                  <CardDescription>Alamat tempat tinggal santri saat ini</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="alamat"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Alamat Lengkap *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Jl. Nama Jalan No. XX, RT/RW"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="desa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desa/Kelurahan</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama desa/kelurahan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="kecamatan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kecamatan</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama kecamatan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="kabupaten"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kabupaten/Kota</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama kabupaten/kota" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="provinsi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provinsi</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama provinsi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="kodePos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Pos</FormLabel>
                        <FormControl>
                          <Input placeholder="12345" maxLength={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="noHp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No. HP Santri</FormLabel>
                        <FormControl>
                          <Input placeholder="08xxxxxxxxxx" {...field} />
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
                          <Input type="email" placeholder="email@contoh.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="sm:col-span-2">
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox 
                        id="sameAddress" 
                        checked={sameAddress}
                        onCheckedChange={(checked) => setSameAddress(checked === true)}
                      />
                      <label
                        htmlFor="sameAddress"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Alamat Orang Tua sama dengan Alamat Santri
                      </label>
                    </div>
                    {!sameAddress && (
                      <FormField
                        control={form.control}
                        name="alamatOrangTua"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alamat Orang Tua</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Alamat lengkap orang tua"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {}
            <TabsContent value="school">
              <Card>
                <CardHeader>
                  <CardTitle>Asal Sekolah</CardTitle>
                  <CardDescription>Informasi sekolah sebelumnya</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="asalSekolah"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Nama Sekolah Asal *</FormLabel>
                        <FormControl>
                          <Input placeholder="SDN/MI/SD ..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="npsnSekolah"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NPSN Sekolah</FormLabel>
                        <FormControl>
                          <Input placeholder="8 digit NPSN" {...field} />
                        </FormControl>
                        <FormDescription>Nomor Pokok Sekolah Nasional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="kelasTerakhir"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kelas Terakhir</FormLabel>
                        <FormControl>
                          <Input placeholder="6" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tahunLulus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tahun Lulus</FormLabel>
                        <FormControl>
                          <Input placeholder="2024" maxLength={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="noIjazah"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Ijazah</FormLabel>
                        <FormControl>
                          <Input placeholder="DN-01 Dd xxxxxxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            {}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Dokumen Persyaratan</CardTitle>
                  <CardDescription>
                    Upload dokumen yang diperlukan untuk pendaftaran
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { id: 'fotoSantri', label: 'Foto Santri (3x4)', desc: 'Foto formal berlatar merah/biru' },
                      { id: 'fotoKtp', label: 'KTP Orang Tua', desc: 'Scan KTP ayah/ibu' },
                      { id: 'fotoAkta', label: 'Akta Kelahiran', desc: 'Scan akta kelahiran santri' },
                      { id: 'fotoIjazah', label: 'Ijazah', desc: 'Scan ijazah terakhir' },
                      { id: 'fotoKk', label: 'Kartu Keluarga', desc: 'Scan kartu keluarga' },
                      { id: 'suratSehat', label: 'Surat Sehat', desc: 'Surat keterangan sehat dari dokter' },
                    ].map((doc) => (
                      <div
                        key={doc.id}
                        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                          form.watch(doc.id as keyof SantriFormValues) 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-muted-foreground/25 hover:border-primary/50 cursor-pointer'
                        }`}
                      >
                        {uploading[doc.id] ? (
                          <div className="animate-spin text-2xl">⏳</div>
                        ) : form.watch(doc.id as keyof SantriFormValues) ? (
                          <>
                            <div className="text-green-600 font-bold mb-2">✓ Terupload</div>
                            <p className="text-xs text-green-700 truncate w-full px-2">
                              {String(form.watch(doc.id as keyof SantriFormValues)).split('/').pop()}
                            </p>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="mt-2 text-red-500 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                form.setValue(doc.id as keyof SantriFormValues, '');
                              }}
                            >
                              Hapus
                            </Button>
                          </>
                        ) : (
                          <>
                            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="font-medium text-sm">{doc.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{doc.desc}</p>
                            <Input
                              type="file"
                              accept="image/*,.pdf"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => handleFileUpload(e, doc.id)}
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Format yang didukung: JPG, PNG, PDF. Maksimal 2MB per file.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          {}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admissions')}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Data
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}