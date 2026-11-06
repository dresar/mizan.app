import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Save, Loader2, Upload, Image as ImageIcon, Trash, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { compressAndConvertToWebP } from '@/lib/image-utils';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentTemplateManager } from './DocumentTemplateManager';

export default function DocumentSettingsPage() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [config, setConfig] = useState({
    kopSuratImage: '',
    kopSuratHeight: 30,
    kopSuratOpacity: 100,
    showKopSurat: true,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 15,
    marginRight: 15,
    paperSize: 'A4',
    orientation: 'portrait',
    watermarkText: '',
    watermarkOpacity: 10,
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Mengompres & mengupload kop surat...');

    try {
      // 1. Compress Image
      let fileToUpload = file;
      try {
        fileToUpload = await compressAndConvertToWebP(file, 0.8, 2480); // Higher resolution for global header (A4 width approx)
      } catch (err) {
        console.warn('Gagal kompres gambar, menggunakan file asli', err);
      }

      // 2. Upload to Server
      const uploadFormData = new FormData();
      uploadFormData.append('file', fileToUpload);
      
      const response = await api.post('/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.url) {
        setConfig(prev => ({ ...prev, kopSuratImage: response.data.url }));
        toast.success('Kop surat berhasil diupload', { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal upload kop surat', { id: toastId });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveHeaderImage = () => {
    setConfig(prev => ({ ...prev, kopSuratImage: '' }));
  };

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['documentSettings'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/generic/documentSettings');
        const items = response.data?.data || [];
        return items[0] || {};
      } catch (e) {
        return {};
      }
    },
  });

  useEffect(() => {
    if (settingsData && settingsData.id) {
      setConfig({
        kopSuratImage: settingsData.kopSuratImage || '',
        kopSuratHeight: Number(settingsData.kopSuratHeight || 30),
        kopSuratOpacity: Number(settingsData.kopSuratOpacity || 100),
        showKopSurat: settingsData.showKopSurat !== undefined ? Boolean(settingsData.showKopSurat) : true,
        marginTop: Number(settingsData.marginTop || 10),
        marginBottom: Number(settingsData.marginBottom || 10),
        marginLeft: Number(settingsData.marginLeft || 15),
        marginRight: Number(settingsData.marginRight || 15),
        paperSize: settingsData.paperSize || 'A4',
        orientation: settingsData.orientation || 'portrait',
        watermarkText: settingsData.watermarkText || '',
        watermarkOpacity: Number(settingsData.watermarkOpacity || 10),
      });
    }
  }, [settingsData]);

  const mutation = useMutation({
    mutationFn: async (values: typeof config) => {
      const payload = {
        ...values,
        updatedAt: new Date().toISOString(),
      };
      
      if (settingsData?.id) {
        return api.put(`/admin/generic/documentSettings/${settingsData.id}`, payload);
      } else {
        return api.post('/admin/generic/documentSettings', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentSettings'] });
      toast.success('Pengaturan dokumen berhasil diperbarui');
      setIsSaving(false);
    },
    onError: () => {
      toast.error('Gagal menyimpan pengaturan');
      setIsSaving(false);
    },
  });

  const handleSave = () => {
    setIsSaving(true);
    mutation.mutate(config);
  };

  const handleChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) return <Loader2 className="animate-spin h-8 w-8 mx-auto mt-20" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Pengaturan Dokumen"
        description="Kelola kop surat, watermark, dan layout default dokumen"
        icon={FileText}
      >
         <Button onClick={handleSave} disabled={isSaving}>
           {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
           Simpan Perubahan
         </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Kop Surat</CardTitle>
              <CardDescription>Upload gambar kop surat dan atur tampilannya</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label className="text-base">Tampilkan Kop Surat</Label>
                  <p className="text-sm text-muted-foreground">
                    Aktifkan untuk menampilkan kop surat pada dokumen PDF
                  </p>
                </div>
                <Switch
                  checked={config.showKopSurat}
                  onCheckedChange={(checked) => handleChange('showKopSurat', checked)}
                />
              </div>

              {config.showKopSurat && (
                <>
                  <div className="space-y-2">
                    <Label>Gambar Kop Surat (Header)</Label>
                    
                    {config.kopSuratImage ? (
                      <div className="space-y-2">
                        <div className="relative group rounded-lg border overflow-hidden bg-muted/20">
                          <img 
                            src={config.kopSuratImage} 
                            alt="Kop Surat Global" 
                            className="w-full h-auto max-h-[150px] object-contain bg-white"
                          />
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              className="h-8 w-8 rounded-full shadow-sm"
                              onClick={handleRemoveHeaderImage}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="p-2 text-xs text-center text-muted-foreground border-t bg-muted/10 truncate">
                            {config.kopSuratImage.split('/').pop()}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Gambar ini akan digunakan sebagai header default untuk semua dokumen PDF (Pendaftaran, Kuitansi, dll) jika template tidak memiliki kop surat khusus.
                        </p>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer relative group flex flex-col items-center justify-center gap-2"
                        onClick={() => document.getElementById('global-kop-upload')?.click()}
                      >
                        <input 
                          id="global-kop-upload"
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleHeaderImageUpload}
                          disabled={isUploading}
                        />
                        {isUploading ? (
                          <>
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            <span className="text-sm text-muted-foreground">Mengupload & Mengompres...</span>
                          </>
                        ) : (
                          <>
                            <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:bg-primary/20 transition-colors">
                              <Upload className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                              <span className="text-base font-medium text-foreground">Upload Gambar Header</span>
                              <p className="text-sm text-muted-foreground">Klik atau seret file (.pdf,.jpg,.png)</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {!config.kopSuratImage && (
                       <div className="mt-2">
                          <Input 
                            placeholder="Atau masukkan URL gambar..." 
                            value={config.kopSuratImage}
                            onChange={(e) => handleChange('kopSuratImage', e.target.value)}
                          />
                       </div>
                    )}
                    
                    <p className="text-[10px] text-muted-foreground">
                      Format: JPG, PNG. Disarankan lebar minimal 2000px agar tidak pecah saat dicetak.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tinggi Header (mm)</Label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="number" 
                          value={config.kopSuratHeight} 
                          onChange={(e) => handleChange('kopSuratHeight', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Opasitas Gambar (%)</Label>
                      <div className="flex items-center space-x-4">
                        <Slider
                          value={[config.kopSuratOpacity]}
                          max={100}
                          step={1}
                          onValueChange={(val) => handleChange('kopSuratOpacity', val[0])}
                          className="flex-1"
                        />
                        <span className="w-12 text-right">{config.kopSuratOpacity}%</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keamanan & Watermark</CardTitle>
              <CardDescription>Tambahkan tanda air pada dokumen untuk keamanan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Teks Watermark</Label>
                <Input 
                  placeholder="Contoh: DOKUMEN RAHASIA / OFFICIAL COPY"
                  value={config.watermarkText}
                  onChange={(e) => handleChange('watermarkText', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Opasitas Watermark (%)</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[config.watermarkOpacity]}
                    max={100}
                    step={1}
                    onValueChange={(val) => handleChange('watermarkOpacity', val[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-right">{config.watermarkOpacity}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout Halaman</CardTitle>
              <CardDescription>Pengaturan margin dan ukuran kertas default</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Ukuran Kertas</Label>
                <Select 
                  value={config.paperSize} 
                  onValueChange={(val) => handleChange('paperSize', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4 (210 x 297 mm)</SelectItem>
                    <SelectItem value="F4">F4 (215 x 330 mm)</SelectItem>
                    <SelectItem value="Letter">Letter (216 x 279 mm)</SelectItem>
                    <SelectItem value="Legal">Legal (216 x 356 mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Orientasi</Label>
                <Select 
                  value={config.orientation} 
                  onValueChange={(val) => handleChange('orientation', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait (Tegak)</SelectItem>
                    <SelectItem value="landscape">Landscape (Mendatar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Margin (mm)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Atas</Label>
                    <Input 
                      type="number" 
                      value={config.marginTop} 
                      onChange={(e) => handleChange('marginTop', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Bawah</Label>
                    <Input 
                      type="number" 
                      value={config.marginBottom} 
                      onChange={(e) => handleChange('marginBottom', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Kiri</Label>
                    <Input 
                      type="number" 
                      value={config.marginLeft} 
                      onChange={(e) => handleChange('marginLeft', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Kanan</Label>
                    <Input 
                      type="number" 
                      value={config.marginRight} 
                      onChange={(e) => handleChange('marginRight', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
