import { PageHeader, ConfirmDialog } from '@/components/common';
import { FolderOpen, Plus, Trash2, Pencil } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface PublicationCategory {
  id: number;
  name: string;
  slug: string;
  type: 'article' | 'journal';
  description?: string;
  isActive: boolean;
}

export default function AdminPublicationCategoryPage() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'article' | 'journal'>('article');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-publication-categories'],
    queryFn: async () => {
      const res = await api.get('/publication/admin/categories');
      return (res.data.data ?? []) as PublicationCategory[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; type: 'article' | 'journal'; slug?: string }) => {
      return api.post('/publication/admin/categories', payload);
    },
    onSuccess: () => {
      toast.success('Kategori berhasil ditambahkan');
      queryClient.invalidateQueries({ queryKey: ['admin-publication-categories'] });
      queryClient.invalidateQueries({ queryKey: ['publication-categories'] });
      setAddOpen(false);
      setFormName('');
      setFormSlug('');
      setFormDescription('');
      setFormIsActive(true);
      setFormType('article');
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Gagal menambahkan kategori'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { name?: string; slug?: string; type?: 'article' | 'journal'; description?: string; isActive?: boolean } }) => {
      return api.patch(`/publication/admin/categories/${id}`, payload);
    },
    onSuccess: () => {
      toast.success('Kategori berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['admin-publication-categories'] });
      queryClient.invalidateQueries({ queryKey: ['publication-categories'] });
      setEditId(null);
      resetEditForm();
    },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Gagal memperbarui kategori'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/publication/admin/categories/${id}`),
    onSuccess: () => {
      toast.success('Kategori berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-publication-categories'] });
      queryClient.invalidateQueries({ queryKey: ['publication-categories'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Gagal menghapus kategori'),
  });

  const openEdit = (cat: PublicationCategory) => {
    setEditId(cat.id);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormType(cat.type);
    setFormDescription(cat.description ?? '');
    setFormIsActive(cat.isActive !== false);
  };

  const resetEditForm = () => {
    setFormName('');
    setFormSlug('');
    setFormType('article');
    setFormDescription('');
    setFormIsActive(true);
  };

  const handleEdit = () => {
    if (!editId || !formName.trim()) {
      toast.error('Nama kategori wajib diisi');
      return;
    }
    const slug = formSlug.trim() || formName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    updateMutation.mutate({
      id: editId,
      payload: { name: formName.trim(), slug, type: formType, description: formDescription.trim() || undefined, isActive: formIsActive },
    });
  };

  const handleToggleActive = (cat: PublicationCategory) => {
    updateMutation.mutate({
      id: cat.id,
      payload: { isActive: !(cat.isActive !== false) },
    });
  };

  const handleAdd = () => {
    if (!formName.trim()) {
      toast.error('Nama kategori wajib diisi');
      return;
    }
    const slug = formSlug.trim() || formName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    createMutation.mutate({ name: formName.trim(), type: formType, slug });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Kategori Artikel & Jurnal"
          description="Kelola kategori untuk artikel populer dan jurnal ilmiah. Kategori ini dipakai di form Tulis Artikel Baru (author)."
          icon={FolderOpen}
        />
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Memuat...</TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Belum ada kategori. Klik &quot;Tambah Kategori&quot; untuk menambah.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                  <TableCell>
                    <Badge variant={cat.type === 'journal' ? 'secondary' : 'outline'}>
                      {cat.type === 'journal' ? 'Jurnal' : 'Artikel'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={cat.isActive !== false}
                        onCheckedChange={() => handleToggleActive(cat)}
                        disabled={updateMutation.isPending}
                      />
                      <Badge variant={cat.isActive !== false ? 'default' : 'secondary'}>
                        {cat.isActive !== false ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(cat)}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(cat.id)}
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
            <DialogTitle>Tambah Kategori</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Kategori</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: Opini, Berita, Penelitian"
              />
            </div>
            <div className="grid gap-2">
              <Label>Tipe</Label>
              <Select value={formType} onValueChange={(v: 'article' | 'journal') => setFormType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent className="z-[200]" position="popper">
                  <SelectItem value="article">Artikel Populer</SelectItem>
                  <SelectItem value="journal">Jurnal Ilmiah</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug (opsional, auto dari nama jika kosong)</Label>
              <Input
                id="slug"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="opini"
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

      <Dialog open={!!editId} onOpenChange={(open) => !open && (setEditId(null), resetEditForm())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nama Kategori</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: Opini, Berita, Penelitian"
              />
            </div>
            <div className="grid gap-2">
              <Label>Tipe</Label>
              <Select value={formType} onValueChange={(v: 'article' | 'journal') => setFormType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent className="z-[200]" position="popper">
                  <SelectItem value="article">Artikel Populer</SelectItem>
                  <SelectItem value="journal">Jurnal Ilmiah</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="opini"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-desc">Deskripsi (opsional)</Label>
              <Textarea
                id="edit-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Deskripsi kategori"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-active"
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
              <Label htmlFor="edit-active">Kategori aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => (setEditId(null), resetEditForm())}>Batal</Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Kategori"
        description="Apakah Anda yakin ingin menghapus kategori ini? Artikel yang memakai kategori ini mungkin perlu diperbarui."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
