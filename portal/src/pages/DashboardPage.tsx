import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Bell, BookOpen, HelpCircle, CreditCard, ArrowRight, Lock, Bug } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useSantriDashboard, useLastPayment } from '@/hooks/use-santri';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { data, isLoading, error } = useSantriDashboard();
  const { data: lastPayment } = useLastPayment();
  const userIdentifier = (user as any)?.username || user?.id || '';

  const { data: systemSettings } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/settings');
        return response.data || {};
      } catch {
        return {};
      }
    }
  });

  const [showRegistrationClosed, setShowRegistrationClosed] = useState(false);

  useEffect(() => {
    if (systemSettings && systemSettings.allowRegistration === false) {
      const status = data?.registrationStatus?.status;
      if (!status || status === 'draft') {
        setShowRegistrationClosed(true);
      }
    }
  }, [systemSettings, data]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-10 w-1/3 rounded-[4px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[4px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2 rounded-[4px]" />
          <Skeleton className="h-64 rounded-[4px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="bg-red-500/10 p-4 rounded-[4px] mb-4">
          <HelpCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Gagal Memuat Data</h3>
        <p className="text-muted-foreground mb-6 max-w-md">Terjadi kesalahan saat mengambil data dashboard Anda. Silakan coba muat ulang halaman.</p>
        <Button onClick={() => window.location.reload()}>
          Coba Lagi
        </Button>
      </div>
    );
  }

  const statusColor = {
    draft: 'bg-muted text-muted-foreground border-border',
    submitted: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    verified: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    accepted: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    rejected: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  const statusLabel = {
    draft: 'Draft',
    submitted: 'Terkirim',
    verified: 'Diverifikasi',
    accepted: 'Diterima',
    rejected: 'Ditolak',
  };

  const quickActions = [
    { 
      icon: ClipboardList, 
      label: 'Form Pendaftaran', 
      href: `/app/form-pendaftaran/${userIdentifier}`, 
      color: 'bg-emerald-500/10 text-emerald-500',
      desc: 'Lengkapi data diri'
    },
    { 
      icon: Bell, 
      label: 'Notifikasi', 
      href: `/app/notifikasi/${userIdentifier}`, 
      color: 'bg-amber-500/10 text-amber-500',
      desc: 'Cek pesan masuk'
    },
    { 
      icon: BookOpen, 
      label: 'Akademik', 
      href: `/app/jadwal/${userIdentifier}`, 
      color: 'bg-blue-500/10 text-blue-500',
      desc: 'Jadwal & Nilai'
    },
    { 
      icon: HelpCircle, 
      label: 'Bantuan', 
      href: '/kontak', 
      color: 'bg-muted text-muted-foreground',
      desc: 'Hubungi admin'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Assalamu'alaikum, <span className="text-emerald-500 capitalize">{user?.firstName || user?.username}</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Selamat datang di Portal Santri Raudhatussalam.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {systemSettings?.debugMode && (
              <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-2 rounded-[4px] border border-amber-500/20" title="Debug Mode Active">
                <Bug className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-bold text-amber-500 hidden sm:inline">DEBUG</span>
              </div>
            )}

            <div className="flex items-center gap-2 bg-card p-2 rounded-[4px] border border-border shadow-sm">
              <div className="h-9 w-9 rounded-[4px] bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-sm">
                {(user?.firstName?.[0] || 'S').toUpperCase()}
              </div>
              <div className="pr-3">
                <p className="text-[11px] text-muted-foreground leading-none">Status Akun</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-medium text-foreground">Aktif</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="card group relative overflow-hidden rounded-[4px] border border-border bg-card p-5 hover:bg-muted/40 transition-colors min-h-[44px]"
            >
              <div className="flex flex-col items-start gap-3">
                <div className={`p-2.5 rounded-[4px] ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-foreground">{item.label}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 rounded-[4px] border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Status Pendaftaran</CardTitle>
              <CardDescription>Pantau progres pendaftaran Anda secara real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-[4px] p-5 border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-2.5 rounded-[4px] ${data?.registrationStatus?.status === 'verified' ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status Saat Ini</p>
                    <Badge variant="outline" className={`mt-1 text-xs px-2.5 py-0.5 rounded-[4px] capitalize ${statusColor[data?.registrationStatus?.status || 'draft']}`}>
                      {statusLabel[data?.registrationStatus?.status || 'draft']}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {data?.registrationStatus?.message || 'Silakan lengkapi formulir pendaftaran Anda untuk melanjutkan ke tahap berikutnya.'}
                </p>
                
                <div className="mt-5 flex gap-3">
                  <Button asChild size="sm" className="min-h-[44px] sm:min-h-0">
                    <Link to={`/app/status/${userIdentifier}`}>
                      Lihat Detail <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[4px] border border-border bg-card h-full">
            <CardHeader>
              <CardTitle className="text-lg">Pengumuman</CardTitle>
              <CardDescription>Informasi terbaru dari pondok</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.announcements && data.announcements.length > 0 ? (
                  data.announcements.slice(0, 3).map((announcement: any, idx: number) => (
                    <div key={idx} className="pb-4 border-b border-border last:border-0 last:pb-0">
                      <h4 className="font-medium text-sm text-foreground line-clamp-1 mb-1">{announcement.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{announcement.content}</p>
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded-[4px] text-muted-foreground">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Belum ada pengumuman terbaru</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {lastPayment && (
          <Card className="rounded-[4px] border border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-[4px]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Riwayat Pembayaran Terakhir</CardTitle>
                    <CardDescription>Transaksi terakhir Anda</CardDescription>
                  </div>
                </div>
                <Badge variant={lastPayment.status === 'verified' ? 'default' : 'secondary'} className="rounded-[4px]">
                  {lastPayment.status === 'verified' ? 'Berhasil' : 'Menunggu'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Tanggal</p>
                  <p className="font-medium text-foreground">{new Date(lastPayment.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                  <p className="text-xs text-muted-foreground">{new Date(lastPayment.created_at).toLocaleTimeString('id-ID')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Nominal</p>
                  <p className="font-bold text-lg text-emerald-500">Rp {Number(lastPayment.jumlah_transfer).toLocaleString('id-ID')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Bank Pengirim</p>
                  <p className="font-medium text-foreground">{lastPayment.bank_pengirim}</p>
                  <p className="text-xs text-muted-foreground">{lastPayment.no_rekening_pengirim}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Rekening Tujuan</p>
                  <p className="font-medium text-foreground">{lastPayment.rekening_tujuan}</p>
                </div>
              </div>
              
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="outline" size="sm" className="min-h-[44px] sm:min-h-0" asChild>
                  <Link to={`/app/pembayaran/${userIdentifier}`}>
                    Kelola Pembayaran
                  </Link>
                </Button>
                {lastPayment.bukti_transfer && (
                  <Button variant="ghost" size="sm" className="min-h-[44px] sm:min-h-0" asChild>
                    <a href={lastPayment.bukti_transfer} target="_blank" rel="noreferrer">
                      Lihat Bukti
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={showRegistrationClosed} onOpenChange={setShowRegistrationClosed}>
          <DialogContent className="sm:max-w-md rounded-[4px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Lock className="h-5 w-5" />
                Pendaftaran Ditutup
              </DialogTitle>
              <DialogDescription className="pt-2 text-sm text-muted-foreground">
                Mohon maaf, pendaftaran santri baru saat ini sedang ditutup oleh admin. 
                Anda masih dapat mengakses dashboard, namun fitur pendaftaran mungkin dibatasi.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-end">
              <Button variant="secondary" className="min-h-[44px] sm:min-h-0" onClick={() => setShowRegistrationClosed(false)}>
                Saya Mengerti
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
