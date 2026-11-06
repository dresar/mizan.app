import { PageHeader } from '@/components/common';
import { FileText, Plus, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common';
import { useState } from 'react';

export default function AuthorArticleListPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['author-articles', user?.id],
    queryFn: async () => {
      const response = await api.get('/publication/author/articles', {
        params: { limit: 100 }
      });
      return response.data;
    },
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/publication/author/articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['author-articles'] });
      toast.success('Artikel berhasil dihapus');
      setDeleteId(null);
    },
    onError: () => {
      toast.error('Gagal menghapus artikel');
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-500">Disetujui</Badge>;
      case 'pending': return <Badge className="bg-orange-500">Menunggu</Badge>;
      case 'rejected': return <Badge className="bg-red-500">Ditolak</Badge>;
      default: return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Tulisan Saya"
          description="Daftar artikel dan jurnal yang Anda tulis"
          icon={FileText}
        />
        <Button asChild>
          <Link to="/author/articles/new">
            <Plus className="w-4 h-4 mr-2" />
            Tulis Baru
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Memuat...</TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Belum ada tulisan. Mulai menulis sekarang!
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((article: any) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-md truncate">
                    {article.title}
                  </TableCell>
                  <TableCell className="capitalize">{article.type}</TableCell>
                  <TableCell>{getStatusBadge(article.status)}</TableCell>
                  <TableCell>
                    {format(new Date(article.createdAt), 'dd MMM yyyy', { locale: idLocale })}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/author/articles/${article.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(article.id)}>
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Artikel"
        description="Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
