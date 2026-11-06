import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { PageHeader, DataTable, StatusBadge, CrudModal } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HelpCircle, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { FAQ } from '@/types';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
export default function FAQPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    pertanyaan: '',
    jawaban: '',
    kategori: '',
    is_published: true,
  });
  const { showConfirm } = useAppStore();
  const { data: data = [], isLoading } = useQuery({
    queryKey: ['faq'],
    queryFn: async () => (await api.get('/admin/generic/faq')).data.data,
  });
  const mutation = useMutation({
    mutationFn: async (newItem: any) => {
      if (editingItem) {
        return api.put(`/admin/generic/faq/${editingItem.id}`, newItem);
      }
      return api.post('/admin/generic/faq', newItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      toast.success(editingItem ? 'FAQ berhasil diperbarui' : 'FAQ berhasil ditambahkan');
      setIsModalOpen(false);
    },
    onError: () => toast.error('Gagal menyimpan FAQ'),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/generic/faq/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      toast.success('FAQ berhasil dihapus');
    },
    onError: () => toast.error('Gagal menghapus FAQ'),
  });
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ pertanyaan: '', jawaban: '', kategori: '', is_published: true });
    setIsModalOpen(true);
  };
  const handleEdit = (item: FAQ) => {
    setEditingItem(item);
    setFormData({
      pertanyaan: item.pertanyaan,
      jawaban: item.jawaban,
      kategori: item.kategori,
      is_published: item.is_published,
    });
    setIsModalOpen(true);
  };
  const handleSubmit = () => {
    mutation.mutate({ ...formData, order: editingItem?.order || data.length + 1 });
  };
  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Hapus FAQ',
      description: 'Yakin ingin menghapus FAQ ini?',
      variant: 'destructive',
      onConfirm: () => deleteMutation.mutate(id),
    });
  };
  const columns: ColumnDef<FAQ>[] = [
    {
      accessorKey: 'pertanyaan',
      header: 'Pertanyaan',
      cell: ({ row }) => (
        <div className="max-w-[400px]">
          <p className="font-medium line-clamp-1">{row.original.pertanyaan}</p>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{row.original.jawaban}</p>
        </div>
      ),
    },
    {
      accessorKey: 'kategori',
      header: 'Kategori',
      cell: ({ row }) => <Badge variant="outline">{row.original.kategori}</Badge>,
    },
    {
      accessorKey: 'is_published',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.is_published ? 'published' : 'draft'} />
      ),
    },
    {
      accessorKey: 'order',
      header: 'Urutan',
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(row.original.id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="FAQ" description="Kelola pertanyaan yang sering diajukan" icon={HelpCircle}>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Tambah FAQ
        </Button>
      </PageHeader>
      <DataTable columns={columns} data={data} isLoading={isLoading} searchPlaceholder="Cari pertanyaan..." />
      <CrudModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingItem ? 'Edit FAQ' : 'Tambah FAQ'}
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Pertanyaan</Label>
            <Input
              value={formData.pertanyaan}
              onChange={(e) => setFormData({ ...formData, pertanyaan: e.target.value })}
              placeholder="Bagaimana cara...?"
            />
          </div>
          <div className="space-y-2">
            <Label>Jawaban</Label>
            <Textarea
              value={formData.jawaban}
              onChange={(e) => setFormData({ ...formData, jawaban: e.target.value })}
              placeholder="Jawaban lengkap..."
              rows={5}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Input
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                placeholder="Pendaftaran, Biaya, dll"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(c) => setFormData({ ...formData, is_published: c })}
                />
                <span className="text-sm">{formData.is_published ? 'Dipublikasi' : 'Draft'}</span>
              </div>
            </div>
          </div>
        </div>
      </CrudModal>
    </div>
  );
}