import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Home, Save, Loader2, Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import heroImage from '@/assets/hero-pesantren.jpg';

export default function HomePageManager() {
  const queryClient = useQueryClient();
  const [settingsData, setSettingsData] = useState({
    announcementText: '',
    announcementLink: '',
    announcementActive: false,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['websiteSettings'],
    queryFn: async () => {
      const response = await api.get('/admin/generic/websiteSettings');
      return response.data?.data?.[0] || {};
    },
  });

  useEffect(() => {
    if (settings) {
      setSettingsData(prev => ({
        ...prev,
        announcementText: settings.announcementText || '',
        announcementLink: settings.announcementLink || '',
        announcementActive: settings.announcementActive || false,
      }));
    }
  }, [settings]);

  const settingsMutation = useMutation({
    mutationFn: async (values: typeof settingsData) => {
      if (settings?.id) {
        return api.put(`/admin/generic/websiteSettings/${settings.id}`, values);
      }
      return api.post('/admin/generic/websiteSettings', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websiteSettings'] });
      toast.success('Pengaturan halaman depan berhasil disimpan');
    },
    onError: () => toast.error('Gagal menyimpan pengaturan'),
  });

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettingsData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setSettingsData(prev => ({ ...prev, announcementActive: checked }));
  };

  if (settingsLoading) return <Loader2 className="animate-spin h-8 w-8 mx-auto mt-20" />;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <PageHeader
        title="Manajemen Halaman Depan"
        description="Atur konten yang tampil di halaman utama website (Home)"
        icon={Home}
      />

      {/* Top Banner Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pengumuman Atas (Top Banner)</CardTitle>
          <CardDescription>Baris pengumuman kecil di bagian paling atas hero section.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="announcementActive" checked={settingsData.announcementActive} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="announcementActive">Aktifkan Banner Pengumuman</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="announcementText">Teks Pengumuman</Label>
              <Input
                id="announcementText"
                name="announcementText"
                value={settingsData.announcementText}
                onChange={handleSettingsChange}
                placeholder="Contoh: Pendaftaran Santri Baru Telah Dibuka"
                disabled={!settingsData.announcementActive}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcementLink">Link Tujuan (Opsional)</Label>
              <Input
                id="announcementLink"
                name="announcementLink"
                value={settingsData.announcementLink}
                onChange={handleSettingsChange}
                placeholder="/pendaftaran"
                disabled={!settingsData.announcementActive}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Quick Link Card */}
      <Card className="bg-secondary/20 border-dashed">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h4 className="font-semibold">Statistik Website</h4>
            <p className="text-sm text-muted-foreground">Kelola angka statistik (Santri, Guru, Alumni, Prestasi)</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/admin/statistics">Kelola Statistik</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end sticky bottom-6">
        <Button size="lg" onClick={() => settingsMutation.mutate(settingsData)} disabled={settingsMutation.isPending} className="shadow-lg">
          {settingsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Simpan Semua Perubahan
        </Button>
      </div>
    </div>
  );
}