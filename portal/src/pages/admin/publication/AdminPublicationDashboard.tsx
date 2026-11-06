import { PageHeader, StatsCard } from '@/components/common';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  Clock,
  FolderOpen,
  BookMarked,
  UserCheck,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  PenSquare,
  ArrowRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  pending: 'outline',
  approved: 'default',
  rejected: 'destructive',
};

const statusLabel: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

export default function AdminPublicationDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-publication-stats'],
    queryFn: async () => {
      const res = await api.get('/publication/admin/stats');
      return res.data.data;
    },
  });

  const recentArticles = stats?.recentArticles ?? [];
  const pendingAuthorsList = stats?.pendingAuthorsList ?? [];
  const articlesByStatus = stats?.articlesByStatus ?? { draft: 0, pending: 0, approved: 0, rejected: 0 };

  const quickLinks = [
    { title: 'Kelola Artikel', href: '/admin/publication/articles', icon: BookOpen, description: 'Daftar & tinjau artikel' },
    { title: 'Kelola Jurnal', href: '/admin/publication/journals', icon: GraduationCap, description: 'Daftar jurnal ilmiah' },
    { title: 'Kategori', href: '/admin/publication/categories', icon: FolderOpen, description: 'Kategori artikel & jurnal' },
    { title: 'Volume Jurnal', href: '/admin/publication/volumes', icon: BookMarked, description: 'Volume terbitan' },
    { title: 'Verifikasi Penulis', href: '/admin/publication/authors', icon: UserCheck, description: 'Verifikasi penulis baru' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Publikasi"
        description="Ringkasan lengkap portal publikasi: statistik, aksi cepat, artikel terbaru, dan penulis menunggu verifikasi."
        icon={LayoutDashboard}
      />

      {/* Statistik utama */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Statistik Utama</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Artikel"
            value={isLoading ? '...' : (stats?.totalArticles ?? 0)}
            icon={BookOpen}
            description="Artikel populer"
            variant="primary"
          />
          <StatsCard
            title="Total Jurnal"
            value={isLoading ? '...' : (stats?.totalJournals ?? 0)}
            icon={GraduationCap}
            description="Jurnal ilmiah"
            variant="primary"
          />
          <StatsCard
            title="Menunggu Review"
            value={isLoading ? '...' : (stats?.pendingReview ?? 0)}
            icon={Clock}
            description="Butuh tinjauan"
            variant="warning"
          />
          <StatsCard
            title="Penulis Aktif"
            value={isLoading ? '...' : (stats?.activeAuthors ?? 0)}
            icon={Users}
            description="Terverifikasi"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
          <StatsCard
            title="Total Kategori"
            value={isLoading ? '...' : (stats?.totalCategories ?? 0)}
            icon={FolderOpen}
            description="Artikel & jurnal"
          />
          <StatsCard
            title="Volume Jurnal"
            value={isLoading ? '...' : (stats?.totalVolumes ?? 0)}
            icon={BookMarked}
            description="Volume terbitan"
          />
          <StatsCard
            title="Penulis Pending"
            value={isLoading ? '...' : (stats?.pendingAuthors ?? 0)}
            icon={UserCheck}
            description="Menunggu verifikasi"
            variant={stats?.pendingAuthors ? 'warning' : 'default'}
          />
          <StatsCard
            title="Total Konten"
            value={isLoading ? '...' : ((stats?.totalArticles ?? 0) + (stats?.totalJournals ?? 0))}
            icon={FileText}
            description="Artikel + jurnal"
          />
        </div>
      </section>

      {/* Artikel per status */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Artikel per Status</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PenSquare className="h-4 w-4 text-muted-foreground" />
                Draft
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{isLoading ? '...' : articlesByStatus.draft}</p>
              <p className="text-xs text-muted-foreground">Belum diajukan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{isLoading ? '...' : articlesByStatus.pending}</p>
              <p className="text-xs text-muted-foreground">Menunggu review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Disetujui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{isLoading ? '...' : articlesByStatus.approved}</p>
              <p className="text-xs text-muted-foreground">Sudah terbit</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                Ditolak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{isLoading ? '...' : articlesByStatus.rejected}</p>
              <p className="text-xs text-muted-foreground">Perlu revisi</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} to={item.href}>
                <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Icon className="h-8 w-8 text-muted-foreground" />
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription className="text-xs">{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Artikel terbaru */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Artikel Terbaru</CardTitle>
              <CardDescription>10 artikel/jurnal terakhir yang masuk</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/publication/articles">
                Lihat semua <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentArticles.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Belum ada artikel.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentArticles.map((art: { id: number; title: string; slug: string; type: string; status: string; author?: { firstName?: string; lastName?: string } }) => (
                    <TableRow key={art.id}>
                      <TableCell className="font-medium max-w-[200px] truncate" title={art.title}>
                        {art.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{art.type === 'journal' ? 'Jurnal' : 'Artikel'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[art.status] ?? 'secondary'}>
                          {statusLabel[art.status] ?? art.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/admin/publication/articles">Tinjau</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Penulis menunggu verifikasi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Penulis Menunggu Verifikasi</CardTitle>
              <CardDescription>Penulis yang baru mendaftar, perlu verifikasi admin</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/publication/authors">
                Kelola penulis <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : pendingAuthorsList.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Tidak ada penulis menunggu verifikasi.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingAuthorsList.map((user: { id: number; firstName?: string; lastName?: string; username: string }) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {[user.firstName, user.lastName].filter(Boolean).join(' ') || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">@{user.username}</TableCell>
                      <TableCell>
                        <Button variant="default" size="sm" asChild>
                          <Link to="/admin/publication/authors">Verifikasi</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
