import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { PageHeader, DataTable, getSelectionColumn, StatusBadge, CrudModal } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, MoreHorizontal, Eye, Pencil, Trash2, Shield, UserX, UserCheck } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import type { User, UserRole } from '@/types';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
const roleLabels: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  bendahara: 'Bendahara',
  petugaspendaftaran: 'Petugas Pendaftaran',
  author: 'Editor Berita',
  // Role lain yang ditampilkan sebagai "User" biasa di tabel
  user: 'User',
  santri: 'Santri',
};
const roleColors: Record<string, string> = {
  superadmin: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  bendahara: 'bg-warning/10 text-warning border-warning/30',
  petugaspendaftaran: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  author: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  user: 'bg-muted text-muted-foreground border-muted-foreground/30',
  santri: 'bg-muted text-muted-foreground border-muted-foreground/30',
};

// Hanya 4 role yang boleh dipilih lewat UI admin:
// - superadmin
// - bendahara
// - petugaspendaftaran
// - author (role berita)
const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: 'superadmin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'bendahara', label: 'Bendahara' },
  { value: 'petugaspendaftaran', label: 'Petugas Pendaftaran' },
  { value: 'author', label: 'Editor Berita' },
  { value: 'santri', label: 'Santri' },
  { value: 'user', label: 'User' },
];
export default function UsersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    role: 'staff' as UserRole,
    password: '',
    isActive: true,
  });
  const { showConfirm } = useAppStore();
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/admin/users', {
        params: { page: 1, limit: 200 },
      });
      return response.data.data;
    },
  });
  const createUserMutation = useMutation({
    mutationFn: async (newUser: any) => {
      return await api.post('/admin/users', newUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User berhasil ditambahkan');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Gagal menambahkan user');
    },
  });
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await api.put(`/admin/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User berhasil diperbarui');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Gagal memperbarui user');
    },
  });
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Gagal menghapus user');
    },
  });
  const handleCreate = () => {
    setEditingUser(null);
    setFormData({ firstName: '', lastName: '', username: '', email: '', phone: '', role: 'staff', password: '', isActive: true });
    setIsModalOpen(true);
  };
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: '', 
      isActive: user.isActive !== false,
    });
    setIsModalOpen(true);
  };
  const handleView = (user: User) => {
    setViewingUser(user);
    setIsViewModalOpen(true);
  };
  const handleSubmit = async () => {
    const payload = { ...formData };
    if (editingUser) {
      if (!payload.password) delete (payload as any).password; 
      updateUserMutation.mutate({ id: editingUser.id, data: payload });
    } else {
      createUserMutation.mutate(payload);
    }
  };
  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Hapus User',
      description: 'Apakah Anda yakin ingin menghapus user ini?',
      variant: 'destructive',
      onConfirm: () => {
        deleteUserMutation.mutate(id);
      },
    });
  };
  const handleToggleStatus = (user: User) => {
    updateUserMutation.mutate({ 
        id: user.id, 
        data: { isActive: !(user.isActive !== false) } 
    });
  };
  const columns: ColumnDef<User>[] = [
    getSelectionColumn<User>(),
    {
      accessorKey: 'firstName',
      header: 'Nama',
      cell: ({ row }) => {
        const user = row.original;
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {initials || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{firstName} {lastName}</p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={roleColors[row.original.role] || 'bg-muted/20 text-muted-foreground border-muted-foreground/20'}
        >
          <Shield className="mr-1 h-3 w-3" />
          {roleLabels[row.original.role] || row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.isActive !== false ? 'active' : 'inactive'} />
      ),
    },
    {
      accessorKey: 'lastLogin',
      header: 'Login Terakhir',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.lastLogin ? formatDateTime(row.original.lastLogin) : '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(user)}>
                <Eye className="mr-2 h-4 w-4" /> Lihat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(user)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                {user.isActive !== false ? (
                  <><UserX className="mr-2 h-4 w-4" /> Nonaktifkan</>
                ) : (
                  <><UserCheck className="mr-2 h-4 w-4" /> Aktifkan</>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Pengguna" description="Kelola pengguna sistem" icon={Users}>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Tambah User
        </Button>
      </PageHeader>
      <DataTable
        columns={columns}
        data={usersData || []}
        isLoading={isLoading}
        searchPlaceholder="Cari nama, email..."
        pageSize={20}
      />
      {}
      <CrudModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingUser ? 'Edit User' : 'Tambah User Baru'}
        description={editingUser ? 'Perbarui informasi user' : 'Isi form untuk menambah user baru'}
        onSubmit={handleSubmit}
        isSubmitting={createUserMutation.isPending || updateUserMutation.isPending}
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nama Depan</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Nama depan"
            />
          </div>
          <div className="space-y-2">
            <Label>Nama Belakang</Label>
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Nama belakang"
            />
          </div>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="username"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label>No. HP</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="081234567890"
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? "Kosongkan jika tidak ingin mengubah password" : "Password (minimal 6 karakter)"}
            />
          </div>
        </div>
      </CrudModal>
      {}
      <CrudModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        title="Detail User"
        hideFooter
        size="md"
      >
        {viewingUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {(viewingUser.firstName || '?')[0]}{(viewingUser.lastName || '?')[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{viewingUser.firstName} {viewingUser.lastName}</h3>
                <p className="text-muted-foreground">@{viewingUser.username}</p>
              </div>
            </div>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Email</span>
                <span>{viewingUser.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Phone</span>
                <span>{viewingUser.phone || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Role</span>
                <Badge
                  variant="outline"
                  className={roleColors[viewingUser.role] || 'bg-muted/20 text-muted-foreground border-muted-foreground/20'}
                >
                  {roleLabels[viewingUser.role] || viewingUser.role}
                </Badge>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={viewingUser.isActive !== false ? 'active' : 'inactive'} />
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Login Terakhir</span>
                <span>{viewingUser.lastLogin ? formatDateTime(viewingUser.lastLogin) : '-'}</span>
              </div>
            </div>
          </div>
        )}
      </CrudModal>
    </div>
  );
}