import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';
import {
  Network,
  Plus,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Briefcase,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function OrganisasiListPage() {
  type Member = Record<string, unknown>;

  const asArray = <T,>(raw: unknown): T[] => {
    if (Array.isArray(raw)) return raw as T[];
    const wrapped = (raw as { data?: unknown })?.data;
    if (Array.isArray(wrapped)) return wrapped as T[];
    return [];
  };

  const pick = (obj: Record<string, unknown>, camel: string, snake: string): unknown =>
    obj?.[camel] ?? obj?.[snake];

  const levelName = (levelValue: unknown) => {
    const level = Number(levelValue);
    const levels = ['Pimpinan', 'Kepala Bidang', 'Staff', 'Anggota'];
    return levels[level] || `Level ${level}`;
  };

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showConfirm } = useAppStore();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const { data: rawMembers, isLoading } = useQuery({
    queryKey: ['resource', 'strukturOrganisasi'],
    queryFn: async () => {
      const res = await api.get('/admin/struktur-organisasi');
      return res.data;
    },
  });

  const members = useMemo(() => asArray<Member>(rawMembers), [rawMembers]);

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => api.delete(`/admin/struktur-organisasi/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', 'strukturOrganisasi'] });
      toast.success('Data struktur organisasi berhasil dihapus');
    },
    onError: () => toast.error('Gagal menghapus data'),
  });

  const handleDelete = (id: string | number) => {
    showConfirm({
      title: 'Hapus Struktur Organisasi',
      description: 'Yakin ingin menghapus data ini?',
      variant: 'destructive',
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Struktur Organisasi"
        description="Kelola hierarki kepengurusan dalam tampilan grid"
        icon={Network}
      >
        <Button onClick={() => navigate('/admin/organisasi/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Anggota
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-[340px] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl text-muted-foreground">
          Belum ada data struktur organisasi.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => {
            const id = Number(member.id);
            const nama = String(pick(member, 'nama', 'nama') || 'Tanpa Nama');
            const jabatan = String(pick(member, 'jabatan', 'jabatan') || 'Jabatan belum diisi');
            const foto = String((member.foto as string) || '');
            const level = pick(member, 'level', 'level');
            const order = pick(member, 'order', 'order');
            const isActive = Boolean(pick(member, 'isActive', 'is_active'));

            return (
              <Card key={id} className="overflow-hidden border border-border bg-card group rounded-[4px] max-w-[360px] w-full mx-auto card">
                <div className="relative h-[360px] bg-muted">
                  {foto ? (
                    <img
                      src={foto}
                      alt={nama}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground">
                      <Users className="h-10 w-10 mb-2" />
                      <span className="text-xs">Tanpa Foto</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                    <div className="bg-black/60 rounded-[4px] px-3 py-2 max-w-[82%]">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-primary-foreground/80 line-clamp-1">{levelName(level)}</p>
                      <p className="text-white text-[9px] font-semibold leading-tight break-words line-clamp-3">{nama}</p>
                    </div>
                    <Badge variant={isActive ? 'default' : 'secondary'} className="shadow-md rounded-[4px] px-2 py-0.5 text-[9px]">
                      {isActive ? 'Aktif' : 'Non-Aktif'}
                    </Badge>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white/90 text-[9px] line-clamp-1 mb-2">{jabatan}</p>
                    <div className="flex items-center gap-2">
                      <Button className="h-9 px-4 rounded-[4px] text-xs min-h-[36px]" onClick={() => setSelectedMember(member)}>
                        Detail
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="outline" className="h-9 w-9 rounded-[4px] min-h-[36px] min-w-[36px] bg-black/40 border-white/30 text-white hover:bg-black/60 hover:text-white">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/organisasi/${id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDelete(id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {selectedMember && (
            <div className="flex flex-col max-h-[85vh]">
              <div className="relative h-64 bg-muted">
                {(selectedMember.foto as string) ? (
                  <img
                    src={selectedMember.foto as string}
                    alt={String(pick(selectedMember, 'nama', 'nama') || 'Anggota')}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <Users className="h-14 w-14" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="mb-2">{levelName(pick(selectedMember, 'level', 'level'))}</Badge>
                  <h2 className="text-white text-2xl font-bold">
                    {String(pick(selectedMember, 'nama', 'nama') || '-')}
                  </h2>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <DialogHeader>
                  <DialogTitle>Detail Struktur Organisasi</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5" /> Jabatan
                    </p>
                    <p className="text-sm font-medium">{String(pick(selectedMember, 'jabatan', 'jabatan') || '-')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Urutan Tampil</p>
                    <p className="text-sm font-medium">{String(order ?? '-')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
