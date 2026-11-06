import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, Globe, Upload, X, Image as ImageIcon, Users, GraduationCap, Award, RefreshCw, Pencil, Ban } from 'lucide-react';
import { toast } from 'sonner';
interface Statistic {
  id: number;
  judul: string;
  nilai: string;
  icon: string;
  deskripsi: string;
  warna: string;
  order: number;
  isPublished: boolean;
}
export default function WebsiteSettingsPage() {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<Statistic[]>([]);
  const [formData, setFormData] = useState({
    namaPondok: '',
    logo: '',
    favicon: '',
    deskripsi: '',
    email: '',
    noTelepon: '',
    alamat: '',
    website: '',
    facebook: '',
    instagram: '',
    twitter: '',
    tiktok: '',
    arabicName: '-',
    heroTitle: '-',
    heroSubtitle: '-',
    heroTagline: '-',
    heroCtaPrimaryText: '-',
    heroCtaPrimaryLink: '-',
    heroCtaSecondaryText: '-',
    heroCtaSecondaryLink: '-',
    ctaTitle: '',
    ctaDescription: '',
    ctaPrimaryText: '',
    ctaPrimaryLink: '',
    ctaSecondaryText: '',
    ctaSecondaryLink: '',
    lokasiPendaftaran: '-',
    googleMapsLink: '-',
    googleMapsEmbedCode: '-',
    metaTitle: '-',
    metaDescription: '-',
    metaKeywords: '-',
    profilSingkat: '',
    profilLengkap: '',
    gambarProfil: '',
  });
  const { data, isLoading } = useQuery({
    queryKey: ['websiteSettings'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/generic/websiteSettings');
        const items = response.data?.data || [];
        return items[0] || {};
      } catch (e) {
        return {};
      }
    },
  });
  useEffect(() => {
    if (data && data.id) {
      const safeData = {
        ...formData, 
        ...data, 
      };
      Object.keys(safeData).forEach(key => {
        if (safeData[key] === null || safeData[key] === undefined) {
           safeData[key] = formData[key as keyof typeof formData] || '';
        }
      });
      setFormData(safeData);
    }
  }, [data]);
  const mutation = useMutation({
    mutationFn: async (values: typeof formData) => {
      if (data?.id) {
        return api.put(`/admin/generic/websiteSettings/${data.id}`, values);
      } else {
        return api.post('/admin/generic/websiteSettings', values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websiteSettings'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Pengaturan website berhasil disimpan');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Gagal menyimpan pengaturan');
    },
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }
    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const response = await api.post('/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data?.url) {
        setFormData(prev => ({ ...prev, logo: response.data.url }));
        toast.success('Logo berhasil diupload');
      }
    } catch (error) {
      toast.error('Gagal upload logo');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 1MB');
      return;
    }
    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const response = await api.post('/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data?.url) {
        setFormData(prev => ({ ...prev, favicon: response.data.url }));
        toast.success('Favicon berhasil diupload');
      }
    } catch (error) {
      toast.error('Gagal upload favicon');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }
    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const response = await api.post('/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data?.url) {
        setFormData(prev => ({ ...prev, gambarProfil: response.data.url }));
        toast.success('Gambar profil berhasil diupload');
      }
    } catch (error) {
      toast.error('Gagal upload gambar profil');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };
  const { data: statisticsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      try {
        const response = await api.get('/core/statistik');
        return response.data || [];
      } catch (e) {
        return [];
      }
    },
  });
  useEffect(() => {
    if (statisticsData) {
      setStats(statisticsData);
    }
  }, [statisticsData]);
  const statsMutation = useMutation({
    mutationFn: async (values: Statistic[]) => {
      const promises = values.map(stat => 
        api.put(`/core/statistik/${stat.id}`, stat)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('Statistik berhasil diperbarui');
    },
    onError: () => {
      toast.error('Gagal menyimpan statistik');
    },
  });
  const initStatsMutation = useMutation({
    mutationFn: async () => {
      const defaults = [
        { judul: 'Santri Aktif', nilai: '1250+', icon: 'Users', deskripsi: 'Santri putra dan putri', warna: 'blue', order: 1, isPublished: true },
        { judul: 'Guru & Staf', nilai: '85', icon: 'UserCheck', deskripsi: 'Tenaga pengajar profesional', warna: 'green', order: 2, isPublished: true },
        { judul: 'Alumni', nilai: '3500+', icon: 'GraduationCap', deskripsi: 'Alumni tersebar di seluruh dunia', warna: 'purple', order: 3, isPublished: true },
        { judul: 'Prestasi', nilai: '150+', icon: 'Award', deskripsi: 'Juara tingkat nasional & internasional', warna: 'yellow', order: 4, isPublished: true },
      ];
      const promises = defaults.map(stat => api.post('/core/statistik', stat));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('Statistik default berhasil dibuat');
    },
  });
  const handleStatChange = (index: number, field: keyof Statistic, value: string) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setStats(newStats);
  };
  if (isLoading) return <Loader2 className="animate-spin h-8 w-8 mx-auto mt-20" />;
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Pengaturan Website"
        description="Konfigurasi identitas dan informasi dasar website pesantren"
        icon={Globe}
      />
      <div className="flex justify-end gap-2 mb-4">
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Pengaturan
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              if (data && data.id) {
                 setFormData(prev => ({ ...prev, ...data }));
              }
            }}>
              <Ban className="mr-2 h-4 w-4" />
              Batal
            </Button>
            <Button onClick={() => mutation.mutate(formData)} disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Simpan Perubahan
            </Button>
          </>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Identitas Website</CardTitle>
          <CardDescription>Informasi utama yang akan tampil di website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Logo Website</Label>
            <div className="flex items-start gap-4">
              <div className="relative w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 overflow-hidden group">
                {formData.logo ? (
                  <>
                    <img 
                      src={formData.logo} 
                      alt="Logo Preview" 
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
                        disabled={!isEditing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={isUploading || !isEditing}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Format: PNG, JPG, SVG. Maksimal 2MB. Disarankan menggunakan format SVG atau PNG transparan.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Favicon Website</Label>
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 overflow-hidden group">
                {formData.favicon ? (
                  <>
                    <img 
                      src={formData.favicon} 
                      alt="Favicon Preview" 
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setFormData(prev => ({ ...prev, favicon: '' }))}
                        disabled={!isEditing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('favicon-upload')?.click()}
                    disabled={isUploading || !isEditing}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Favicon
                  </Button>
                  <input
                    id="favicon-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFaviconUpload}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Format: PNG, ICO. Maksimal 1MB. Disarankan ukuran 32x32 atau 64x64 piksel.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="namaPondok">Nama Pesantren</Label>
              <Input
                id="namaPondok"
                name="namaPondok"
                value={formData.namaPondok}
                onChange={handleChange}
                placeholder="Contoh: Pesantren Hub"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Resmi</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="info@pesantren.com"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noTelepon">Nomor Telepon</Label>
              <Input
                id="noTelepon"
                name="noTelepon"
                value={formData.noTelepon}
                onChange={handleChange}
                placeholder="+62..."
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://..."
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi Singkat</Label>
            <Textarea
              id="deskripsi"
              name="deskripsi"
              rows={3}
              value={formData.deskripsi}
              onChange={handleChange}
              placeholder="Deskripsi singkat tentang pesantren..."
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat Lengkap</Label>
            <Textarea
              id="alamat"
              name="alamat"
              rows={3}
              value={formData.alamat}
              onChange={handleChange}
              placeholder="Jl. Pesantren No. 1..."
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Profil Singkat Pesantren</CardTitle>
          <CardDescription>Deskripsi singkat dan gambar profil yang akan tampil di halaman depan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Gambar Profil</Label>
            <div className="flex items-start gap-4">
              <div className="relative w-full md:w-1/3 aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 overflow-hidden group">
                {formData.gambarProfil ? (
                  <>
                    <img 
                      src={formData.gambarProfil} 
                      alt="Profil Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setFormData(prev => ({ ...prev, gambarProfil: '' }))}
                        disabled={!isEditing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('profile-upload')?.click()}
                    disabled={isUploading || !isEditing}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Gambar
                  </Button>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageUpload}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Format: PNG, JPG. Maksimal 2MB. Disarankan gambar landscape (16:9).
                </p>
                <div className="space-y-2 mt-4">
                   <Label htmlFor="gambarProfilUrl">Atau gunakan URL Gambar (CDN)</Label>
                   <Input 
                     id="gambarProfilUrl"
                     name="gambarProfil"
                     value={formData.gambarProfil}
                     onChange={handleChange}
                     placeholder="https://example.com/image.jpg"
                     disabled={!isEditing}
                   />
                   <p className="text-xs text-muted-foreground">
                     Masukkan link gambar langsung jika menggunakan hosting eksternal.
                   </p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profilSingkat">Profil Singkat (Max 500 Karakter)</Label>
            <Textarea
              id="profilSingkat"
              name="profilSingkat"
              rows={6}
              value={formData.profilSingkat}
              onChange={handleChange}
              placeholder="Jelaskan secara singkat tentang sejarah, visi, dan keunggulan pesantren..."
              disabled={!isEditing}
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profilLengkap">Profil Lengkap</Label>
            <Textarea
              id="profilLengkap"
              name="profilLengkap"
              rows={15}
              value={formData.profilLengkap}
              onChange={handleChange}
              placeholder="Tuliskan profil lengkap pesantren. Mendukung format HTML."
              disabled={!isEditing}
            />
            <p className="text-xs text-muted-foreground">Tips: Gunakan tag HTML seperti &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;b&gt; untuk format teks.</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Statistik Website</CardTitle>
          <CardDescription>Angka-angka pencapaian pesantren yang tampil di halaman depan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingStats ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : stats.length === 0 ? (
             <div className="text-center p-6 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">Belum ada data statistik.</p>
                <Button onClick={() => initStatsMutation.mutate()} disabled={initStatsMutation.isPending || !isEditing}>
                  {initStatsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Buat Statistik Default
                </Button>
             </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={stat.id} className="space-y-3 p-4 border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2 mb-2">
                       {}
                       <div className="p-2 rounded-md bg-primary/10 text-primary">
                          {stat.judul.toLowerCase().includes('santri') ? <Users className="h-4 w-4" /> :
                           stat.judul.toLowerCase().includes('alumni') ? <GraduationCap className="h-4 w-4" /> :
                           stat.judul.toLowerCase().includes('prestasi') ? <Award className="h-4 w-4" /> :
                           <Globe className="h-4 w-4" />}
                       </div>
                       <span className="font-medium text-sm text-muted-foreground">Statistik #{index + 1}</span>
                    </div>
                    <div className="space-y-2">
                      <Label>Judul (Label)</Label>
                      <Input 
                        value={stat.judul} 
                        onChange={(e) => handleStatChange(index, 'judul', e.target.value)}
                        placeholder="Contoh: Santri Aktif"
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nilai (Angka)</Label>
                      <Input 
                        value={stat.nilai} 
                        onChange={(e) => handleStatChange(index, 'nilai', e.target.value)}
                        placeholder="Contoh: 1250+"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {isEditing && (
                <div className="flex justify-end pt-2">
                  <Button onClick={() => statsMutation.mutate(stats)} disabled={statsMutation.isPending} variant="outline">
                    {statsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Statistik
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Call to Action (Bawah)</CardTitle>
          <CardDescription>Bagian ajakan bertindak yang tampil di bagian bawah halaman depan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ctaTitle">Judul Utama</Label>
            <Input
              id="ctaTitle"
              name="ctaTitle"
              value={formData.ctaTitle}
              onChange={handleChange}
              placeholder="Contoh: Siap Bergabung?"
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ctaDescription">Deskripsi</Label>
            <Textarea
              id="ctaDescription"
              name="ctaDescription"
              rows={2}
              value={formData.ctaDescription}
              onChange={handleChange}
              placeholder="Contoh: Daftarkan putra-putri Anda sekarang..."
              disabled={!isEditing}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <h4 className="text-sm font-medium text-muted-foreground">Tombol Utama</h4>
               <div className="space-y-2">
                 <Label htmlFor="ctaPrimaryText">Teks Tombol</Label>
                 <Input
                   id="ctaPrimaryText"
                   name="ctaPrimaryText"
                   value={formData.ctaPrimaryText}
                   onChange={handleChange}
                   placeholder="Contoh: Daftar Sekarang"
                   disabled={!isEditing}
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="ctaPrimaryLink">Link Tujuan</Label>
                 <Input
                   id="ctaPrimaryLink"
                   name="ctaPrimaryLink"
                   value={formData.ctaPrimaryLink}
                   onChange={handleChange}
                   placeholder="Contoh: /pendaftaran"
                   disabled={!isEditing}
                 />
               </div>
            </div>
            <div className="space-y-4">
               <h4 className="text-sm font-medium text-muted-foreground">Tombol Kedua</h4>
               <div className="space-y-2">
                 <Label htmlFor="ctaSecondaryText">Teks Tombol</Label>
                 <Input
                   id="ctaSecondaryText"
                   name="ctaSecondaryText"
                   value={formData.ctaSecondaryText}
                   onChange={handleChange}
                   placeholder="Contoh: Hubungi Kami"
                   disabled={!isEditing}
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="ctaSecondaryLink">Link Tujuan</Label>
                 <Input
                   id="ctaSecondaryLink"
                   name="ctaSecondaryLink"
                   value={formData.ctaSecondaryLink}
                   onChange={handleChange}
                   placeholder="Contoh: /kontak"
                   disabled={!isEditing}
                 />
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tombol Aksi (Global Hero CTA)</CardTitle>
          <CardDescription>Pengaturan tombol utama yang muncul di bagian Hero Section (Slide)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary" />
                 Tombol Utama (Primary)
               </h4>
               <div className="space-y-2">
                 <Label htmlFor="heroCtaPrimaryText">Teks Tombol</Label>
                 <Input
                   id="heroCtaPrimaryText"
                   name="heroCtaPrimaryText"
                   value={formData.heroCtaPrimaryText}
                   onChange={handleChange}
                   placeholder="Contoh: Daftar Sekarang"
                   disabled={!isEditing}
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="heroCtaPrimaryLink">Link Tujuan</Label>
                 <Input
                   id="heroCtaPrimaryLink"
                   name="heroCtaPrimaryLink"
                   value={formData.heroCtaPrimaryLink}
                   onChange={handleChange}
                   placeholder="Contoh: /pendaftaran"
                   disabled={!isEditing}
                 />
               </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                 Tombol Kedua (Secondary)
               </h4>
               <div className="space-y-2">
                 <Label htmlFor="heroCtaSecondaryText">Teks Tombol</Label>
                 <Input
                   id="heroCtaSecondaryText"
                   name="heroCtaSecondaryText"
                   value={formData.heroCtaSecondaryText}
                   onChange={handleChange}
                   placeholder="Contoh: Kenali Kami"
                   disabled={!isEditing}
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="heroCtaSecondaryLink">Link Tujuan</Label>
                 <Input
                   id="heroCtaSecondaryLink"
                   name="heroCtaSecondaryLink"
                   value={formData.heroCtaSecondaryLink}
                   onChange={handleChange}
                   placeholder="Contoh: /profil"
                   disabled={!isEditing}
                 />
               </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sosial Media</CardTitle>
          <CardDescription>Link ke akun sosial media pesantren</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input
                  id="facebook"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter / X URL</Label>
                <Input
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/..."
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok URL</Label>
                <Input
                  id="tiktok"
                  name="tiktok"
                  value={formData.tiktok}
                  onChange={handleChange}
                  placeholder="https://tiktok.com/..."
                  disabled={!isEditing}
                />
              </div>
           </div>
           {isEditing && (
             <div className="flex justify-end pt-4">
                <Button onClick={() => mutation.mutate(formData)} disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Pengaturan
                </Button>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}