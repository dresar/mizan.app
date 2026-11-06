import { PageHeader } from '@/components/common';
import { FileText, Plus, Edit, Trash, Upload } from 'lucide-react';
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

export default function AuthorJournalListPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['author-journals', user?.id],
    queryFn: async () => {
      const response = await api.get('/publication/author/articles', {
        params: { type: 'journal', limit: 100 }
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
      queryClient.invalidateQueries({ queryKey: ['author-journals'] });
      toast.success('Jurnal berhasil dihapus');
      setDeleteId(null);
    },
    onError: () => {
      toast.error('Gagal menghapus jurnal');
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
          title="Jurnal Saya"
          description="Daftar jurnal ilmiah yang Anda upload"
          icon={Upload}
        />
        <Button asChild>
          <Link to="/author/articles/new?type=journal">
            <Plus className="w-4 h-4 mr-2" />
            Upload Jurnal
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Volume</TableHead>
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
                  Belum ada jurnal. Upload jurnal ilmiah Anda sekarang!
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((journal: any) => (
                <TableRow key={journal.id}>
                  <TableCell className="font-medium max-w-md truncate">
                    {journal.title}
                  </TableCell>
                  <TableCell>
                    {journal.volume ? `${journal.volume.name} (${journal.volume.year})` : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(journal.status)}</TableCell>
                  <TableCell>
                    {format(new Date(journal.createdAt), 'dd MMM yyyy', { locale: idLocale })}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/author/articles/${journal.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(journal.id)}>
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
        title="Hapus Jurnal"
        description="Apakah Anda yakin ingin menghapus jurnal ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
