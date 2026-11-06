import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TableSkeleton, EmptyState } from '@/components/common';
import { Users, UserPlus, Trash, ArrowLeft, Folder, Pencil, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { publicationService } from '@/services/publication-service';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export default function AuthorCollaborationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('viewer');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'completed' | 'archived'>('active');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: collaboration, isLoading } = useQuery({
    queryKey: ['collaboration', id],
    queryFn: () => publicationService.getCollaborationById(Number(id)),
    enabled: !!id
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: { userId: number; role: 'editor' | 'viewer' }) => 
      publicationService.addMember(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration', id] });
      setIsAddMemberOpen(false);
      setNewMemberId('');
      toast({ title: 'Berhasil', description: 'Anggota berhasil ditambahkan' });
    },
    onError: (error: any) => {
      toast({ title: 'Gagal', description: error.response?.data?.error || 'Gagal menambahkan anggota', variant: 'destructive' });
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: number) => publicationService.removeMember(Number(id), memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration', id] });
      toast({ title: 'Berhasil', description: 'Anggota berhasil dihapus' });
    },
    onError: (error: any) => {
      toast({ title: 'Gagal', description: error.response?.data?.error || 'Gagal menghapus anggota', variant: 'destructive' });
    }
  });

  const updateCollaborationMutation = useMutation({
    mutationFn: (payload: { title?: string; description?: string; status?: 'active' | 'completed' | 'archived' }) =>
      publicationService.updateCollaboration(Number(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration', id] });
      queryClient.invalidateQueries({ queryKey: ['author-collaborations'] });
      setIsEditOpen(false);
      toast({ title: 'Berhasil', description: 'Proyek kolaborasi berhasil diperbarui' });
    },
    onError: (error: any) => {
      toast({ title: 'Gagal', description: error.response?.data?.error || 'Gagal memperbarui', variant: 'destructive' });
    }
  });

  const deleteCollaborationMutation = useMutation({
    mutationFn: () => publicationService.deleteCollaboration(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['author-collaborations'] });
      toast({ title: 'Berhasil', description: 'Proyek kolaborasi berhasil dihapus' });
      navigate('/author/collaborations');
    },
    onError: (error: any) => {
      toast({ title: 'Gagal', description: error.response?.data?.error || 'Gagal menghapus', variant: 'destructive' });
    }
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberId) return;
    addMemberMutation.mutate({ userId: Number(newMemberId), role: newMemberRole as 'editor' | 'viewer' });
  };

  if (isLoading) return <TableSkeleton />;
  if (!collaboration) return <EmptyState title="Kolaborasi tidak ditemukan" icon={Users} />;

  const isOwner = collaboration.myRole === 'owner';
  const isEditor = collaboration.myRole === 'editor';

  const openEdit = () => {
    setEditTitle(collaboration.title);
    setEditDescription(collaboration.description ?? '');
    setEditStatus((collaboration.status as 'active' | 'completed' | 'archived') ?? 'active');
    setIsEditOpen(true);
  };

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate('/author/collaborations')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar
      </Button>

      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
           <h1 className="text-3xl font-bold">{collaboration.title}</h1>
           <p className="text-muted-foreground mt-2">{collaboration.description || '—'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={collaboration.status === 'active' ? 'default' : 'secondary'} className="text-lg">
             {collaboration.status}
          </Badge>
          {isOwner && (
            <>
              <Button variant="outline" size="sm" onClick={openEdit}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setIsDeleteOpen(true)}>
                <Trash className="mr-2 h-4 w-4" /> Hapus Proyek
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Members Section */}
         <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" /> Anggota Tim
               </CardTitle>
               {(isOwner || isEditor) && (
                   <Button size="sm" onClick={() => setIsAddMemberOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" /> Tambah Anggota
                   </Button>
               )}
            </CardHeader>
            <CardContent>
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Bergabung</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     <TableRow>
                        <TableCell className="font-medium flex items-center gap-2">
                           <Avatar className="h-8 w-8">
                              <AvatarImage src={collaboration.owner?.avatar} />
                              <AvatarFallback>{collaboration.owner?.firstName?.[0]}</AvatarFallback>
                           </Avatar>
                           <div>
                              <div className="font-bold">{collaboration.owner?.firstName} {collaboration.owner?.lastName}</div>
                              <div className="text-xs text-muted-foreground">@{collaboration.owner?.username}</div>
                           </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">Owner</Badge></TableCell>
                        <TableCell>{new Date(collaboration.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right"></TableCell>
                     </TableRow>
                     {collaboration.members?.map((member: any) => (
                        <TableRow key={member.id}>
                           <TableCell className="font-medium flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                 <AvatarImage src={member.user?.avatar} />
                                 <AvatarFallback>{member.user?.firstName?.[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                 <div className="font-bold">{member.user?.firstName} {member.user?.lastName}</div>
                                 <div className="text-xs text-muted-foreground">@{member.user?.username}</div>
                              </div>
                           </TableCell>
                           <TableCell className="capitalize">{member.role}</TableCell>
                           <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                           <TableCell className="text-right">
                              {(isOwner || (isEditor && member.role === 'viewer')) && member.role !== 'owner' && (
                                 <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive hover:text-destructive/90"
                                    onClick={() => {
                                       if (confirm('Yakin ingin menghapus anggota ini?')) {
                                          removeMemberMutation.mutate(member.userId ?? member.user?.id);
                                       }
                                    }}
                                 >
                                    <Trash className="h-4 w-4" />
                                 </Button>
                              )}
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </CardContent>
         </Card>

         {/* Articles/Projects Section */}
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center">
                  <Folder className="mr-2 h-5 w-5" /> Artikel Terkait
               </CardTitle>
            </CardHeader>
            <CardContent>
               {collaboration.articles?.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                     Belum ada artikel yang ditautkan ke kolaborasi ini.
                  </div>
               ) : (
                  <ul className="space-y-4">
                     {collaboration.articles?.map((article: any) => (
                        <li key={article.id} className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
                           <div className="font-medium line-clamp-1">{article.title}</div>
                           <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                              <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                              <Badge variant="outline" className="text-[10px] h-5">{article.status}</Badge>
                           </div>
                        </li>
                     ))}
                  </ul>
               )}
               <Button className="w-full mt-4" variant="outline" size="sm" onClick={() => navigate(`/author/articles/new?collaborationId=${id}`)}>
                  Tautkan Artikel Baru
               </Button>
            </CardContent>
         </Card>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Proyek Kolaborasi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Judul</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Judul proyek" />
            </div>
            <div className="grid gap-2">
              <Label>Deskripsi (opsional)</Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Deskripsi proyek" rows={3} />
            </div>
            <div className="grid gap-2">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
            <Button
              onClick={() => updateCollaborationMutation.mutate({ title: editTitle.trim(), description: editDescription.trim() || undefined, status: editStatus })}
              disabled={!editTitle.trim() || updateCollaborationMutation.isPending}
            >
              {updateCollaborationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Proyek Kolaborasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus proyek &quot;{collaboration.title}&quot;? Artikel yang ditautkan ke proyek ini tidak akan dihapus, hanya tautannya yang akan dilepas. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteCollaborationMutation.mutate()}
              disabled={deleteCollaborationMutation.isPending}
            >
              {deleteCollaborationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Anggota Tim</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">ID User (Sementara)</Label>
              <Input
                id="userId"
                placeholder="Masukkan ID User"
                value={newMemberId}
                onChange={(e) => setNewMemberId(e.target.value)}
                type="number"
                required
              />
              <p className="text-xs text-muted-foreground">Masukkan ID user yang ingin diundang.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Peran</Label>
               <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                  <SelectTrigger>
                     <SelectValue placeholder="Pilih peran" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="editor">Editor</SelectItem>
                     <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
               </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={addMemberMutation.isPending}>
                {addMemberMutation.isPending ? 'Menambahkan...' : 'Tambah Anggota'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
