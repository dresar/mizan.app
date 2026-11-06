import { PageHeader, DataTable, StatusBadge, ConfirmDialog } from '@/components/common';
import { BookOpen, Eye, CheckCircle, XCircle, Trash2, PenBox } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Article {
  id: number;
  title: string;
  slug: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  type: 'article' | 'journal';
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
    username: string;
  };
  category?: {
    name: string;
  };
}

export default function AdminArticleListPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-articles', statusFilter],
    queryFn: async () => {
      const params: any = { limit: 100, type: 'article' }; // Fetch up to 100 articles
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res = await api.get('/publication/admin/articles', { params });
      return res.data.data as Article[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/publication/admin/articles/${id}`);
    },
    onSuccess: () => {
      toast.success('Artikel berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setIsDeleteDialogOpen(false);
    },
    onError: () => toast.error('Gagal menghapus artikel'),
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.put(`/publication/admin/articles/${id}/approve`);
    },
    onSuccess: () => {
      toast.success('Artikel berhasil disetujui');
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setIsApproveDialogOpen(false);
    },
    onError: () => toast.error('Gagal menyetujui artikel'),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      return api.put(`/publication/admin/articles/${id}/reject`, { status: 'rejected', rejectionReason: reason });
    },
    onSuccess: () => {
      toast.success('Artikel berhasil ditolak');
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setIsRejectDialogOpen(false);
    },
    onError: () => toast.error('Gagal menolak artikel'),
  });

  const handleDelete = (article: Article) => {
    setSelectedArticle(article);
    setIsDeleteDialogOpen(true);
  };

  const handleApprove = (article: Article) => {
    setSelectedArticle(article);
    setIsApproveDialogOpen(true);
  };

  const handleReject = (article: Article) => {
    setSelectedArticle(article);
    setIsRejectDialogOpen(true);
  };

  const columns: ColumnDef<Article>[] = [
    {
      accessorKey: 'title',
      header: 'Judul',
      cell: ({ row }) => (
        <div>
          <div className="font-medium line-clamp-1">{row.original.title}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.category?.name || 'Tanpa Kategori'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'author',
      header: 'Penulis',
      cell: ({ row }) => `${row.original.author.firstName} ${row.original.author.lastName || ''}`,
    },
    {
      accessorKey: 'createdAt',
      header: 'Tanggal',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'dd MMM yyyy', { locale: idLocale }),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" asChild title="Lihat">
            <Link to={`/artikel/${row.original.slug}`} target="_blank">
              <Eye className="w-4 h-4" />
            </Link>
          </Button>

          <Button size="icon" variant="ghost" asChild title="Edit">
            <Link to={`/author/articles/${row.original.id}/edit`}>
              <PenBox className="w-4 h-4" />
            </Link>
          </Button>
          
          {row.original.status === 'pending' && (
            <>
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleApprove(row.original)}
                title="Setujui"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleReject(row.original)}
                title="Tolak"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}

          <Button 
            size="icon" 
            variant="ghost" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => handleDelete(row.original)}
            title="Hapus"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Manajemen Artikel"
          description="Kelola, moderasi, dan publikasi artikel"
          icon={BookOpen}
        />
        <Button asChild>
          <Link to="/author/articles/new?type=article">
            <BookOpen className="mr-2 h-4 w-4" /> Tulis Artikel Baru
          </Link>
        </Button>
      </div>
      
      <DataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Cari judul artikel..."
        filterComponent={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu Review</SelectItem>
              <SelectItem value="approved">Disetujui</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Hapus Artikel"
        description="Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={() => selectedArticle && deleteMutation.mutate(selectedArticle.id)}
        confirmText="Hapus"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        title="Setujui Artikel"
        description="Artikel ini akan dipublikasikan dan dapat dilihat oleh publik."
        onConfirm={() => selectedArticle && approveMutation.mutate(selectedArticle.id)}
        confirmText="Setujui & Publish"
        variant="default"
        isLoading={approveMutation.isPending}
      />

       <ConfirmDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        title="Tolak Artikel"
        description="Artikel akan dikembalikan ke penulis dengan status ditolak."
        onConfirm={() => selectedArticle && rejectMutation.mutate({ id: selectedArticle.id, reason: 'Konten tidak sesuai standar.' })} // TODO: Add reason input
        confirmText="Tolak Artikel"
        variant="destructive"
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}
