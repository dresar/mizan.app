import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageHeader, TableSkeleton, EmptyState } from '@/components/common';
import { Users, Plus, Calendar, Pencil, Trash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { publicationService } from '@/services/publication-service';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const COLLAB_QUERY_KEY = ['author-collaborations'];

export default function AuthorCollaborationsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCollabTitle, setNewCollabTitle] = useState('');
  const [newCollabDesc, setNewCollabDesc] = useState('');
  const [editingCollab, setEditingCollab] = useState<{ id: number; title: string; description?: string; status?: string } | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'completed' | 'archived'>('active');
  const [deletingCollab, setDeletingCollab] = useState<{ id: number; title: string } | null>(null);

  const { data: collaborations, isLoading } = useQuery({
    queryKey: COLLAB_QUERY_KEY,
    queryFn: publicationService.getCollaborations
  });

  const createMutation = useMutation({
    mutationFn: publicationService.createCollaboration,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: COLLAB_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['collaborations'] });
      setIsCreateOpen(false);
      setNewCollabTitle('');
      setNewCollabDesc('');
      toast({ title: 'Berhasil', description: 'Kolaborasi berhasil dibuat' });
      navigate(`/author/collaborations/${data.data.id}`);
    },
    onError: (error: any) => {
      toast({ title: 'Gagal', description: error.response?.data?.error || 'Gagal membuat kolaborasi', variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { title?: string; description?: string; status?: 'active' | 'completed' | 'archived' } }) =>
      publicationService.updateCollaboration(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: COLLAB_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['collaborations'] });
      queryClient.invalidateQueries({ queryKey: ['collaboration', id] });
      setEditingCollab(null);
      toast({ title: 'Berhasil', description: 'Nama proyek kolaborasi berhasil diperbarui' });
    },
    onError: (error: any) => {
      toast({ title: 'Gagal', description: error.response?.data?.error || 'Gagal memperbarui', variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => publicationService.deleteCollaboration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLAB_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['collaborations'] });
      setDeletingCollab(null);
      toast({ title: 'Berhasil', description: 'Proyek kolaborasi berhasil dihapus' });
    },
    onError: (error: any) => {
      toast({ title: 'Gagal', description: error.response?.data?.error || 'Gagal menghapus', variant: 'destructive' });
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollabTitle) return;
    createMutation.mutate({ title: newCollabTitle, description: newCollabDesc });
  };

  const openEdit = (collab: { id: number; title: string; description?: string; status?: string }) => {
    setEditingCollab(collab);
    setEditTitle(collab.title);
    setEditDescription(collab.description ?? '');
    setEditStatus((collab.status as 'active' | 'completed' | 'archived') ?? 'active');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollab || !editTitle.trim()) return;
    updateMutation.mutate({
      id: editingCollab.id,
      payload: { title: editTitle.trim(), description: editDescription.trim() || undefined, status: editStatus }
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingCollab) return;
    deleteMutation.mutate(deletingCollab.id);
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Kolaborasi"
          description="Proyek kolaborasi dengan penulis lain"
          icon={Users}
        />
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Buat Kolaborasi Baru
        </Button>
      </div>

      {!collaborations || collaborations.length === 0 ? (
        <EmptyState
          title="Belum Ada Kolaborasi"
          description="Anda belum memiliki proyek kolaborasi. Buat proyek baru untuk mulai menulis bersama."
          icon={Users}
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Buat Kolaborasi
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaborations.map((collab: any) => (
            <Card
              key={collab.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/author/collaborations/${collab.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={collab.status === 'active' ? 'default' : 'secondary'} className="mb-2">
                      {collab.status}
                    </Badge>
                    {collab.myRole === 'owner' && <Badge variant="outline">Owner</Badge>}
                  </div>
                  {collab.myRole === 'owner' && (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(collab)}
                        title="Edit nama proyek"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeletingCollab({ id: collab.id, title: collab.title })}
                        title="Hapus proyek"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardTitle className="line-clamp-1">{collab.title}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-[40px]">
                  {collab.description || 'Tidak ada deskripsi'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Calendar className="mr-2 h-4 w-4" />
                  Dibuat {new Date(collab.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarImage src={collab.owner?.avatar} />
                      <AvatarFallback>{collab.owner?.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    {collab.members?.slice(0, 3).map((m: any) => (
                      <Avatar key={m.id} className="h-8 w-8 border-2 border-background">
                        <AvatarImage src={m.user?.avatar} />
                        <AvatarFallback>{m.user?.firstName?.[0]}</AvatarFallback>
                      </Avatar>
                    ))}
                    {collab.members?.length > 3 && (
                      <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                        +{collab.members.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {collab.articlesCount || 0} Artikel
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Proyek Kolaborasi</DialogTitle>
            <DialogDescription>
              Buat ruang kerja bersama untuk menulis artikel dengan penulis lain.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Proyek</Label>
              <Input
                id="title"
                placeholder="Misal: Buku Antologi Ramadhan"
                value={newCollabTitle}
                onChange={(e) => setNewCollabTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Jelaskan tujuan kolaborasi ini..."
                value={newCollabDesc}
                onChange={(e) => setNewCollabDesc(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Membuat...' : 'Buat Proyek'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Nama/Proyek Kolaborasi */}
      <Dialog open={!!editingCollab} onOpenChange={(open) => !open && setEditingCollab(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Proyek Kolaborasi</DialogTitle>
            <DialogDescription>
              Ubah judul, deskripsi, atau status proyek kolaborasi.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Judul Proyek</Label>
              <Input
                id="edit-title"
                placeholder="Nama proyek kolaborasi"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Deskripsi (opsional)</Label>
              <Textarea
                id="edit-description"
                placeholder="Deskripsi proyek"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={(v: 'active' | 'completed' | 'archived') => setEditStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="archived">Arsip</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingCollab(null)}>
                Batal
              </Button>
              <Button type="submit" disabled={!editTitle.trim() || updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Konfirmasi Hapus Proyek Kolaborasi */}
      <AlertDialog open={!!deletingCollab} onOpenChange={(open) => !open && setDeletingCollab(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Proyek Kolaborasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus proyek &quot;{deletingCollab?.title}&quot;? Artikel yang ditautkan tidak akan dihapus, hanya tautannya yang dilepas. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
