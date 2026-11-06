import { PageHeader, DataTable, StatusBadge } from '@/components/common';
import { UserCheck, CheckCircle, XCircle, RefreshCcw, Loader2, UserPlus, KeyRound, Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function generatePassword(): string {
  const digits = '0123456789';
  let four = '';
  for (let i = 0; i < 4; i++) four += digits[Math.floor(Math.random() * digits.length)];
  return 'rds' + four;
}

interface PendingAuthor {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  dateJoined: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  publicationStatus: 'pending' | 'approved' | 'rejected';
  publicationProfile?: {
    institution: string;
    expertise: string;
    whatsapp: string;
  }
}

interface UserDetail {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  publicationRole?: string;
  publicationStatus?: string;
  loginHistory: { id: number; username: string; status: string; createdAt: string; ipAddress?: string }[];
  publicationStats?: { totalArticles: number; totalJournals: number; approved: number; pending: number };
}

export default function AdminAuthorVerificationPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<{ author: PendingAuthor; action: 'approved' | 'rejected' | 'pending' } | null>(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'author' as const,
  });
  const [viewUserId, setViewUserId] = useState<number | null>(null);
  const [editAuthor, setEditAuthor] = useState<PendingAuthor | null>(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '', isActive: true });
  const [passwordAuthor, setPasswordAuthor] = useState<PendingAuthor | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [deleteAuthor, setDeleteAuthor] = useState<PendingAuthor | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending-authors'],
    queryFn: async () => {
      const res = await api.get('/publication/admin/authors/pending');
      return res.data.data as PendingAuthor[];
    },
    refetchInterval: 3000, // Faster realtime update
  });

  const { data: userDetail, isLoading: isLoadingUser } = useQuery({
    queryKey: ['admin-user-detail', viewUserId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${viewUserId}`);
      return res.data.data as UserDetail;
    },
    enabled: !!viewUserId,
  });

  const { data: editUserDetail } = useQuery({
    queryKey: ['admin-user-detail', editAuthor?.id],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${editAuthor!.id}`);
      return res.data.data as UserDetail;
    },
    enabled: !!editAuthor?.id,
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number; status: 'approved' | 'rejected' | 'pending'; reason?: string }) => {
      return api.put(`/publication/admin/authors/${id}/verify`, { status, reason });
    },
    onSuccess: (data) => {
      toast.success(data.data.message || 'Status berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-authors'] });
      setIsDialogOpen(false);
      setSelectedAuthor(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Gagal memproses permintaan');
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (payload: typeof addForm) => {
      return api.post('/admin/users', {
        ...payload,
        lastName: payload.lastName || undefined,
        isActive: true,
      });
    },
    onSuccess: () => {
      toast.success('Penulis berhasil ditambahkan. User dapat login dengan username dan password tersebut.');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-authors'] });
      setAddUserOpen(false);
      setAddForm({ username: '', email: '', password: '', firstName: '', lastName: '', role: 'author' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Gagal menambah penulis');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { firstName?: string; lastName?: string; email?: string; phone?: string; isActive?: boolean; password?: string } }) => {
      return api.put(`/admin/users/${id}`, payload);
    },
    onSuccess: () => {
      toast.success('Data user berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-authors'] });
      if (viewUserId) queryClient.invalidateQueries({ queryKey: ['admin-user-detail', viewUserId] });
      setEditAuthor(null);
      setPasswordAuthor(null);
      setNewPassword('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Gagal memperbarui user');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      toast.success('User berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-authors'] });
      setDeleteAuthor(null);
      setViewUserId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Gagal menghapus user');
    },
  });

  useEffect(() => {
    if (editAuthor && editUserDetail) {
      setEditForm({
        firstName: editUserDetail.firstName,
        lastName: editUserDetail.lastName || '',
        email: editUserDetail.email,
        phone: editUserDetail.phone || '',
        isActive: editUserDetail.isActive,
      });
    }
  }, [editAuthor?.id, editUserDetail]);

  const handleAction = (author: PendingAuthor, action: 'approved' | 'rejected' | 'pending') => {
    setSelectedAuthor({ author, action });
    setIsDialogOpen(true);
  };

  const confirmAction = () => {
    if (selectedAuthor && selectedAuthor.author) {
      mutation.mutate({ 
        id: selectedAuthor.author.id, 
        status: selectedAuthor.action,
        reason: selectedAuthor.action === 'rejected' ? 'Ditolak oleh admin' : undefined 
      });
    }
  };

  const columns: ColumnDef<PendingAuthor>[] = [
    {
      accessorKey: 'firstName',
      header: 'Nama',
      cell: ({ row }) => {
          const name = `${row.original.firstName} ${row.original.lastName || ''}`;
          // Truncate to roughly 15 chars as requested "jangan lengkap"
          return (
            <span title={name} className="truncate max-w-[120px] block">
              {name}
            </span>
          );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => {
          const email = row.original.email;
          return (
            <span title={email} className="truncate max-w-[120px] block">
              {email}
            </span>
          );
      },
    },
    {
        accessorKey: 'publicationProfile.institution',
        header: 'Institusi',
        cell: ({ row }) => {
            const inst = row.original.publicationProfile?.institution || '-';
            return (
                <span title={inst} className="truncate max-w-[100px] block">
                  {inst}
                </span>
            );
        }
    },
    {
      accessorKey: 'dateJoined',
      header: 'Tgl Daftar',
      // Format simpler: 17/2/2026
      cell: ({ row }) => format(new Date(row.original.dateJoined), 'd/M/yyyy'),
    },
    {
      accessorKey: 'publicationStatus',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge
          status={(row.original.publicationStatus || row.original.verificationStatus) as 'pending' | 'approved' | 'rejected'}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const author = row.original;
        const status = author.publicationStatus || author.verificationStatus;

        return (
          <div className="flex items-center gap-1">
            {status === 'approved' && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 text-xs border-orange-200 text-orange-700 hover:bg-orange-50"
                onClick={() => handleAction(author, 'pending')}
              >
                <RefreshCcw className="w-3 h-3 mr-1" />
                Batal
              </Button>
            )}
            {status === 'rejected' && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => handleAction(author, 'pending')}
              >
                <RefreshCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            )}
            {status === 'pending' && (
              <>
                <Button
                  size="sm"
                  className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                  onClick={() => handleAction(author, 'approved')}
                  title="Terima"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 w-8 p-0"
                  onClick={() => handleAction(author, 'rejected')}
                  title="Tolak"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewUserId(author.id)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Lihat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setEditAuthor(author);
                  setEditForm({
                    firstName: author.firstName,
                    lastName: author.lastName || '',
                    email: author.email,
                    phone: '',
                    isActive: true,
                  });
                }}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setPasswordAuthor(author);
                  setNewPassword('');
                }}>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Ubah Sandi
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteAuthor(author)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const getDialogTitle = () => {
      if (selectedAuthor?.action === 'approved') return 'Konfirmasi Verifikasi';
      if (selectedAuthor?.action === 'rejected') return 'Tolak Penulis';
      return 'Batalkan Verifikasi';
  }

  const getDialogDesc = () => {
      if (!selectedAuthor || !selectedAuthor.author) return '';
      const { author } = selectedAuthor;
      
      const details = (
        <div className="mt-4 p-3 bg-muted rounded-md text-sm space-y-2 border">
            <div className="grid grid-cols-3 gap-1">
                <span className="font-medium text-muted-foreground">Nama:</span>
                <span className="col-span-2 font-semibold text-foreground">{author.firstName} {author.lastName}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
                <span className="font-medium text-muted-foreground">Email:</span>
                <span className="col-span-2 text-foreground">{author.email}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
                <span className="font-medium text-muted-foreground">Institusi:</span>
                <span className="col-span-2 text-foreground">{author.publicationProfile?.institution || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
                <span className="font-medium text-muted-foreground">Keahlian:</span>
                <span className="col-span-2 text-foreground">{author.publicationProfile?.expertise || '-'}</span>
            </div>
             <div className="grid grid-cols-3 gap-1">
                <span className="font-medium text-muted-foreground">WhatsApp:</span>
                <span className="col-span-2 text-foreground">{author.publicationProfile?.whatsapp || '-'}</span>
            </div>
        </div>
      );

      if (selectedAuthor.action === 'approved') {
          return (
              <div className="space-y-2">
                  <p>Apakah Anda yakin ingin memverifikasi dan menyetujui akun penulis ini?</p>
                  {details}
                  <p className="text-xs text-muted-foreground mt-2">Penulis akan mendapatkan akses penuh ke fitur dashboard author.</p>
              </div>
          );
      }
      if (selectedAuthor.action === 'rejected') {
          return (
             <div className="space-y-2">
                  <p>Apakah Anda yakin ingin menolak pengajuan penulis ini?</p>
                  {details}
                  <p className="text-xs text-destructive mt-2">Penulis tidak akan dapat mengakses fitur publikasi.</p>
              </div>
          );
      }
      return (
         <div className="space-y-2">
            <p>Kembalikan status penulis ini menjadi <strong>Pending</strong>?</p>
            {details}
            <p className="text-xs text-muted-foreground mt-2">Akses fitur publikasi akan ditangguhkan sementara.</p>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Kelola Penulis"
          description="Daftar seluruh penulis publikasi"
          icon={UserCheck}
        />
        <Button onClick={() => setAddUserOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Tambah Penulis
        </Button>
      </div>
      
      <DataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        searchKey="firstName"
        searchPlaceholder="Cari penulis..."
        emptyMessage="Belum ada data penulis."
      />

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getDialogTitle()}</AlertDialogTitle>
            <AlertDialogDescription>
              {getDialogDesc()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmAction();
              }}
              disabled={mutation.isPending}
              className={selectedAuthor?.action === 'rejected' || selectedAuthor?.action === 'pending' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedAuthor?.action === 'approved' ? 'Verifikasi' : 
               selectedAuthor?.action === 'rejected' ? 'Tolak' : 'Batalkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View User / Detail + Stats + Aktivitas */}
      <Dialog open={!!viewUserId} onOpenChange={(open) => !open && setViewUserId(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Penulis</DialogTitle>
          </DialogHeader>
          {isLoadingUser && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {userDetail && !isLoadingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Nama</span><br />{userDetail.firstName} {userDetail.lastName}</div>
                <div><span className="text-muted-foreground">Username</span><br />{userDetail.username}</div>
                <div><span className="text-muted-foreground">Email</span><br />{userDetail.email}</div>
                <div><span className="text-muted-foreground">Status</span><br /><StatusBadge status={(userDetail.publicationStatus || 'none') as 'pending' | 'approved' | 'rejected'} /></div>
              </div>
              {userDetail.publicationStats && (
                <div className="rounded-lg border p-4 space-y-2">
                  <h4 className="font-medium text-sm">Statistik Publikasi</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Artikel: <strong>{userDetail.publicationStats.totalArticles}</strong></div>
                    <div>Jurnal: <strong>{userDetail.publicationStats.totalJournals}</strong></div>
                    <div>Disetujui: <strong>{userDetail.publicationStats.approved}</strong></div>
                    <div>Pending: <strong>{userDetail.publicationStats.pending}</strong></div>
                  </div>
                  <p className="text-xs text-muted-foreground">Total publish (disetujui): {userDetail.publicationStats.approved} item</p>
                </div>
              )}
              <div className="rounded-lg border p-4">
                <h4 className="font-medium text-sm mb-2">Aktivitas Login (terakhir)</h4>
                <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
                  {userDetail.loginHistory?.length ? userDetail.loginHistory.map((log) => (
                    <div key={log.id} className="flex justify-between py-1 border-b border-muted/50 last:border-0">
                      <span>{format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                      <StatusBadge status={log.status === 'success' ? 'verified' : 'rejected'} />
                    </div>
                  )) : <p className="text-muted-foreground">Belum ada riwayat login.</p>}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User */}
      <Dialog open={!!editAuthor} onOpenChange={(open) => !open && setEditAuthor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editAuthor && (
            <div className="grid gap-4 py-4">
              <p className="text-sm text-muted-foreground">Username: <strong>{editAuthor.username}</strong> (tidak dapat diubah)</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Nama Depan</Label>
                  <Input value={editForm.firstName} onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))} placeholder="Nama depan" />
                </div>
                <div className="grid gap-2">
                  <Label>Nama Belakang</Label>
                  <Input value={editForm.lastName} onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))} placeholder="Nama belakang" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@contoh.com" />
              </div>
              <div className="grid gap-2">
                <Label>Telepon</Label>
                <Input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} placeholder="08..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="edit-isActive" checked={editForm.isActive} onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded" />
                <Label htmlFor="edit-isActive">Akun aktif</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAuthor(null)}>Batal</Button>
            <Button
              disabled={updateUserMutation.isPending}
              onClick={() => {
                if (!editAuthor) return;
                updateUserMutation.mutate({
                  id: editAuthor.id,
                  payload: { firstName: editForm.firstName, lastName: editForm.lastName || undefined, email: editForm.email, phone: editForm.phone || undefined, isActive: editForm.isActive },
                });
              }}
            >
              {updateUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ubah Sandi (tanpa verifikasi - admin reset) */}
      <Dialog open={!!passwordAuthor} onOpenChange={(open) => !open && (setPasswordAuthor(null), setNewPassword(''))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Kata Sandi</DialogTitle>
          </DialogHeader>
          {passwordAuthor && (
            <>
              <p className="text-sm text-muted-foreground">
                Reset kata sandi untuk <strong>{passwordAuthor.username}</strong>. User dapat login dengan sandi baru tanpa verifikasi email.
              </p>
              <div className="grid gap-2 py-4">
                <Label>Kata sandi baru</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 karakter atau Generate"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => setNewPassword(generatePassword())} title="Generate rds + 4 angka">
                    <KeyRound className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPasswordAuthor(null); setNewPassword(''); }}>Batal</Button>
            <Button
              disabled={updateUserMutation.isPending || newPassword.length < 6}
              onClick={() => {
                if (!passwordAuthor) return;
                updateUserMutation.mutate({ id: passwordAuthor.id, payload: { password: newPassword } });
              }}
            >
              {updateUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan Sandi Baru
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hapus User */}
      <AlertDialog open={!!deleteAuthor} onOpenChange={(open) => !open && setDeleteAuthor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteAuthor && (
                <>Apakah Anda yakin ingin menghapus user <strong>{deleteAuthor.firstName} {deleteAuthor.lastName}</strong> ({deleteAuthor.username})? Data user dan riwayat login akan dihapus permanen.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUserMutation.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteUserMutation.isPending}
              onClick={() => deleteAuthor && deleteUserMutation.mutate(deleteAuthor.id)}
            >
              {deleteUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Penulis</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            User yang ditambahkan dapat login ke dashboard penulis dengan username dan password di bawah.
          </p>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-username">Username</Label>
              <Input
                id="add-username"
                value={addForm.username}
                onChange={(e) => setAddForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@contoh.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-firstName">Nama Depan</Label>
                <Input
                  id="add-firstName"
                  value={addForm.firstName}
                  onChange={(e) => setAddForm((f) => ({ ...f, firstName: e.target.value }))}
                  placeholder="Nama"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-lastName">Nama Belakang</Label>
                <Input
                  id="add-lastName"
                  value={addForm.lastName}
                  onChange={(e) => setAddForm((f) => ({ ...f, lastName: e.target.value }))}
                  placeholder="(opsional)"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-password">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="add-password"
                  type="text"
                  value={addForm.password}
                  onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 6 karakter atau gunakan Generate"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setAddForm((f) => ({ ...f, password: generatePassword() }))}
                  title="Generate: rds + 4 angka acak"
                >
                  <KeyRound className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Klik ikon kunci untuk generate password (awalan rds + 4 angka acak). Berikan ke user untuk login.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserOpen(false)}>Batal</Button>
            <Button
              onClick={() => {
                if (!addForm.username.trim() || !addForm.email.trim() || !addForm.firstName.trim()) {
                  toast.error('Username, email, dan nama depan wajib diisi');
                  return;
                }
                if (addForm.password.length < 6) {
                  toast.error('Password minimal 6 karakter');
                  return;
                }
                createUserMutation.mutate(addForm);
              }}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
