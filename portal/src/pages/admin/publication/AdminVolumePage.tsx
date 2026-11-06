import { PageHeader, ConfirmDialog } from '@/components/common';
import { BookMarked, Plus, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useState } from 'react';

interface PublicationVolume {
  id: number;
  name: string;
  year: number;
  description?: string | null;
  isActive: boolean;
  isPublished: boolean;
}

export default function AdminVolumePage() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formYear, setFormYear] = useState(new Date().getFullYear().toString());
  const [formDescription, setFormDescription] = useState('');

  const { data: volumes = [], isLoading } = useQuery({
    queryKey: ['admin-publication-volumes'],
    queryFn: async () => {
      const res = await api.get('/publication/admin/volumes');
      return (res.data.data ?? []) as PublicationVolume[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; year: number; description?: string }) => {
      return api.post('/publication/admin/volumes', payload);
    },
    onSuccess: () => {
      toast.success('Volume jurnal berhasil ditambahkan');
      queryClient.invalidateQueries({ queryKey: ['admin-publication-volumes'] });
      queryClient.invalidateQueries({ queryKey: ['publication-volumes'] });
      setAddOpen(false);
      setFormName('');
      setFormYear(new Date().getFullYear().toString());
      setFormDescription('');
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Gagal menambah volume'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/publication/admin/volumes/${id}`),
    onSuccess: () => {
      toast.success('Volume berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-publication-volumes'] });
      queryClient.invalidateQueries({ queryKey: ['publication-volumes'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Gagal menghapus volume'),
  });

  const handleAdd = () => {
    const name = formName.trim();
    const year = parseInt(formYear, 10);
    if (!name) {
      toast.error('Nama volume wajib diisi');
      return;
    }
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      toast.error('Tahun harus antara 2000–2100');
      return;
    }
    createMutation.mutate({
      name,
      year,
      description: formDescription.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Volume Jurnal"
          description="Kelola volume/edisi terbitan jurnal (mis. Vol 1 No 1, 2024). Volume ini dipilih penulis saat membuat tulisan tipe Jurnal Ilmiah di Tulis Artikel Baru."
          icon={BookMarked}
        />
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Volume
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Tahun</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="w-[80px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Memuat...</TableCell>
              </TableRow>
            ) : volumes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Belum ada volume. Klik &quot;Tambah Volume&quot; agar penulis bisa memilih volume saat menulis jurnal.
                </TableCell>
              </TableRow>
            ) : (
              volumes.map((vol) => (
                <TableRow key={vol.id}>
                  <TableCell className="font-medium">{vol.name}</TableCell>
                  <TableCell>{vol.year}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">{vol.description ?? '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(vol.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Volume Jurnal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="vol-name">Nama Volume</Label>
              <Input
                id="vol-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: Vol 1 No 1, Vol 2 No 2"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vol-year">Tahun</Label>
              <Input
                id="vol-year"
                type="number"
                min={2000}
                max={2100}
                value={formYear}
                onChange={(e) => setFormYear(e.target.value)}
                placeholder="2024"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vol-desc">Deskripsi (opsional)</Label>
              <Input
                id="vol-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Deskripsi singkat volume"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button onClick={handleAdd} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Volume"
        description="Apakah Anda yakin ingin menghapus volume ini? Jurnal yang memakai volume ini mungkin perlu diperbarui."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
