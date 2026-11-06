import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SystemSettingsPage() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    debugMode: false,
    sessionTimeout: '60',
    maxUploadSize: '5',
    backupFrequency: 'daily',
    logRetentionDays: '30',
  });

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/settings');
        return response.data || {};
      } catch (e) {
        return {};
      }
    },
  });

  useEffect(() => {
    if (settingsData) {
      setConfig({
        maintenanceMode: Boolean(settingsData.maintenanceMode),
        allowRegistration: settingsData.allowRegistration !== undefined ? Boolean(settingsData.allowRegistration) : true,
        debugMode: Boolean(settingsData.debugMode),
        sessionTimeout: String(settingsData.sessionTimeout || '60'),
        maxUploadSize: String(settingsData.maxUploadSize || '5'),
        backupFrequency: settingsData.backupFrequency || 'daily',
        logRetentionDays: String(settingsData.logRetentionDays || '30'),
      });
    }
  }, [settingsData]);

  const mutation = useMutation({
    mutationFn: async (values: typeof config) => {
      const payload = {
        ...values,
        sessionTimeout: parseInt(values.sessionTimeout),
        maxUploadSize: parseInt(values.maxUploadSize),
        logRetentionDays: parseInt(values.logRetentionDays),
        updatedAt: new Date().toISOString(),
      };
      
      // Always use PUT /admin/settings as it handles both insert and update (singleton)
      return api.put('/admin/settings', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
      // Update global store or context if needed here
      toast.success('Pengaturan sistem berhasil diperbarui');
      setIsSaving(false);
      
      // Reload page if critical settings change to apply them
      if (config.debugMode !== Boolean(settingsData?.debugMode)) {
         window.location.reload();
      }
    },
    onError: () => {
      toast.error('Gagal menyimpan pengaturan');
      setIsSaving(false);
    },
  });

  const handleToggle = (key: string) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    mutation.mutate(config);
  };

  if (isLoading) return <Loader2 className="animate-spin h-8 w-8 mx-auto mt-20" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Pengaturan Sistem"
        description="Konfigurasi teknis, keamanan, dan pemeliharaan sistem"
        icon={Settings}
      >
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Konfigurasi Umum</CardTitle>
              <CardDescription>Pengaturan operasional dasar sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label className="text-base">Mode Pemeliharaan (Maintenance)</Label>
                  <p className="text-sm text-muted-foreground">
                    Jika aktif, hanya admin yang dapat mengakses sistem.
                  </p>
                </div>
                <Switch
                  checked={config.maintenanceMode}
                  onCheckedChange={() => handleToggle('maintenanceMode')}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label className="text-base">Izinkan Registrasi Santri Baru</Label>
                  <p className="text-sm text-muted-foreground">
                    Jika dimatikan, pendaftaran santri baru akan menampilkan peringatan.
                  </p>
                </div>
                <Switch
                  checked={config.allowRegistration}
                  onCheckedChange={() => handleToggle('allowRegistration')}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label className="text-base">Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Menampilkan detail error teknis untuk troubleshooting.
                  </p>
                </div>
                <Switch
                  checked={config.debugMode}
                  onCheckedChange={() => handleToggle('debugMode')}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Keamanan & Sesi</CardTitle>
              <CardDescription>Pengaturan timeout dan batasan akses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Session Timeout (Menit)</Label>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={config.sessionTimeout}
                      onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                    >
                      <option value="15">15 Menit</option>
                      <option value="30">30 Menit</option>
                      <option value="60">60 Menit</option>
                      <option value="120">2 Jam</option>
                    </select>
                    <p className="text-xs text-muted-foreground">Otomatis logout jika tidak ada aktivitas.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Maksimal Ukuran Upload (MB)</Label>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={config.maxUploadSize}
                      onChange={(e) => handleChange('maxUploadSize', e.target.value)}
                    >
                      <option value="2">2 MB</option>
                      <option value="5">5 MB</option>
                      <option value="10">10 MB</option>
                      <option value="20">20 MB</option>
                    </select>
                    <p className="text-xs text-muted-foreground">Batas ukuran file yang diizinkan untuk diupload.</p>
                  </div>
               </div>
            </CardContent>
          </Card>
          
          <div className="sticky top-20">
              <Button size="lg" className="w-full" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan Konfigurasi
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}