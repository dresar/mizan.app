import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { PageHeader, DataTable, CrudModal } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Fasilitas } from '@/types';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
export default function FacilitiesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Fasilitas | null>(null);
  const [formData, setFormData] = useState({ nama: '', icon: '' });
  const { showConfirm } = useAppStore();
  const { data: data = [], isLoading } = useQuery({
    queryKey: ['fasilitas'],
    queryFn: async () => (await api.get('/admin/generic/fasilitas')).data.data,
  });
  const mutation = useMutation({
    mutationFn: async (newItem: any) => {
      if (editingItem) {
        return api.put(`/admin/generic/fasilitas/${editingItem.id}`, newItem);
      }
      return api.post('/admin/generic/fasilitas', newItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fasilitas'] });
      toast.success(editingItem ? 'Fasilitas berhasil diperbarui' : 'Fasilitas berhasil ditambahkan');
      setIsModalOpen(false);
    },
    onError: () => toast.error('Gagal menyimpan fasilitas'),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/generic/fasilitas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fasilitas'] });
      toast.success('Fasilitas berhasil dihapus');
    },
    onError: () => toast.error('Gagal menghapus fasilitas'),
  });
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ nama: '', icon: '' });
    setIsModalOpen(true);
  };
  const handleEdit = (item: Fasilitas) => {
    setEditingItem(item);
    setFormData({ nama: item.nama, icon: item.icon });
    setIsModalOpen(true);
  };
  const handleSubmit = () => {
    mutation.mutate({ ...formData, order: editingItem?.order || data.length + 1 });
  };
  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Hapus Fasilitas',
      description: 'Yakin ingin menghapus fasilitas ini?',
      variant: 'destructive',
      onConfirm: () => deleteMutation.mutate(id),
    });
  };
  const columns: ColumnDef<Fasilitas>[] = [
    {
      accessorKey: 'nama',
      header: 'Nama Fasilitas',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <span className="font-medium">{row.original.nama}</span>
        </div>
      ),
    },
    {
      accessorKey: 'icon',
      header: 'Icon',
      cell: ({ row }) => <code className="text-sm">{row.original.icon}</code>,
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
      <PageHeader title="Fasilitas" description="Kelola daftar fasilitas pesantren" icon={Building2}>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Fasilitas
        </Button>
      </PageHeader>
      <DataTable columns={columns} data={data} isLoading={isLoading} searchPlaceholder="Cari fasilitas..." />
      <CrudModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingItem ? 'Edit Fasilitas' : 'Tambah Fasilitas'}
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Fasilitas</Label>
            <Input
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Nama fasilitas"
            />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <Input
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="building, mosque, library, dll"
            />
          </div>
        </div>
      </CrudModal>
    </div>
  );
}