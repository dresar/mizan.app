import { PageHeader } from '@/components/common';
import { LayoutDashboard, FileText, GraduationCap, Clock, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function AuthorDashboardPage() {
  const { user, updateUser } = useAuthStore();
  
  // Periksa status verifikasi
  // Gunakan publicationStatus jika ada, atau fallback ke verificationStatus (legacy)
  const status = (user as any)?.publicationStatus !== 'none' 
    ? (user as any)?.publicationStatus 
    : (user as any)?.verificationStatus;
    
  const isPending = status === 'pending';
  const isRejected = status === 'rejected';
  const isVerified = (user as any)?.publicationVerified || (user as any)?.isVerified;

  // Auto-refresh status user jika pending/not verified
  useEffect(() => {
    if (isPending || (!isVerified && !isRejected)) {
       api.get('/auth/me').then(res => {
          // Response auth/me adalah object user langsung (sesuai implementasi backend)
          if (res.data) {
              updateUser(res.data);
          }
       }).catch(() => {});
    }
  }, [isPending, isVerified, isRejected, updateUser]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['author-stats'],
    queryFn: async () => {
      const response = await api.get('/publication/author/dashboard-stats');
      return response.data.data;
    },
    enabled: !!isVerified, // Hanya fetch jika verified
  });

  if (isPending) {
    return (
      <div className="container py-6 space-y-6 animate-fade-in">
        <PageHeader
          title="Dashboard Penulis"
          description="Status Akun: Menunggu Verifikasi"
          icon={LayoutDashboard}
        />
        
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Akun Sedang Ditinjau</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Terima kasih telah mendaftar. Akun Anda sedang dalam proses verifikasi oleh Admin. 
            Fitur penulisan dan publikasi akan terbuka otomatis setelah disetujui.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-50 pointer-events-none select-none">
           {/* Dummy Locked Cards */}
           <Card>
             <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="w-4 h-4"/> Tulis Artikel</CardTitle></CardHeader>
             <CardContent>Fitur terkunci</CardContent>
           </Card>
           <Card>
             <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="w-4 h-4"/> Tulis Jurnal</CardTitle></CardHeader>
             <CardContent>Fitur terkunci</CardContent>
           </Card>
           <Card>
             <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="w-4 h-4"/> Draft Saya</CardTitle></CardHeader>
             <CardContent>Fitur terkunci</CardContent>
           </Card>
        </div>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="container py-6 space-y-6 animate-fade-in">
        <PageHeader
          title="Dashboard Penulis"
          description="Status Akun: Ditolak"
          icon={LayoutDashboard}
        />
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Pendaftaran Ditolak</AlertTitle>
          <AlertDescription>
            Mohon maaf, pendaftaran penulis Anda belum dapat disetujui. 
            {(user as any)?.rejectedReason && (
                <div className="mt-2 font-medium">Alasan: {(user as any)?.rejectedReason}</div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const cards = [
    {
      title: 'Artikel Saya',
      value: stats?.totalArticles || 0,
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      title: 'Jurnal Saya',
      value: stats?.totalJournals || 0,
      icon: GraduationCap,
      color: 'text-purple-500',
    },
    {
      title: 'Menunggu Review',
      value: stats?.pendingReview || 0,
      icon: Clock,
      color: 'text-orange-500',
    },
    {
      title: 'Disetujui',
      value: stats?.approved || 0,
      icon: CheckCircle,
      color: 'text-green-500',
    },
  ];

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard Penulis"
        description="Ringkasan aktivitas dan status tulisan Anda"
        icon={LayoutDashboard}
      >
         <Button asChild>
            <Link to="/author/articles/new">
                <FileText className="mr-2 h-4 w-4" />
                Tulis Baru
            </Link>
         </Button>
      </PageHeader>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
