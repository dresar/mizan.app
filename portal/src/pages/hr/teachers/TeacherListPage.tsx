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
  UserCheck,
  Plus,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  GraduationCap,
  BookOpen,
  Briefcase,
  Award,
  Quote,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Teacher = Record<string, unknown>;

const asArray = <T,>(raw: unknown): T[] => {
  if (Array.isArray(raw)) return raw as T[];
  const wrapped = (raw as { data?: unknown })?.data;
  if (Array.isArray(wrapped)) return wrapped as T[];
  return [];
};

const pick = (obj: Record<string, unknown>, camel: string, snake: string): unknown =>
  obj?.[camel] ?? obj?.[snake];

export default function TeacherListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showConfirm } = useAppStore();
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const { data: rawTeachers, isLoading } = useQuery({
    queryKey: ['resource', 'tenagaPengajar'],
    queryFn: async () => {
      const res = await api.get('/admin/generic/tenagaPengajar');
      return res.data;
    },
  });

  const teachers = useMemo(() => asArray<Teacher>(rawTeachers), [rawTeachers]);

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => api.delete(`/admin/generic/tenagaPengajar/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', 'tenagaPengajar'] });
      toast.success('Data pengajar berhasil dihapus');
    },
    onError: () => toast.error('Gagal menghapus data pengajar'),
  });

  const handleDelete = (id: string | number) => {
    showConfirm({
      title: 'Hapus Data Pengajar',
      description: 'Yakin ingin menghapus data pengajar ini?',
      variant: 'destructive',
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Tenaga Pengajar"
        description="Kelola data guru dengan tampilan kartu profesional"
        icon={UserCheck}
      >
        <Button onClick={() => navigate('/admin/teachers/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pengajar
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-[340px] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl text-muted-foreground">
          Belum ada data tenaga pengajar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => {
            const id = teacher.id;
            const nama = pick(teacher, 'namaLengkap', 'nama_lengkap') || 'Tanpa Nama';
            const bidang = pick(teacher, 'bidangKeahlian', 'bidang_keahlian') || 'Pengajar';
            const mataPelajaran = pick(teacher, 'mataPelajaran', 'mata_pelajaran') || '-';
            const isPublished = pick(teacher, 'isPublished', 'is_published');
            const foto = teacher.foto;

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
                      <p className="text-[9px] uppercase tracking-[0.18em] text-primary-foreground/80 line-clamp-1">{bidang}</p>
                      <p className="text-white text-[9px] font-semibold leading-tight break-words line-clamp-3">{nama}</p>
                    </div>
                    <Badge variant={isPublished ? 'default' : 'secondary'} className="shadow-md rounded-[4px] px-2 py-0.5 text-[9px]">
                      {isPublished ? 'Aktif' : 'Non-Aktif'}
                    </Badge>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white/90 text-[9px] line-clamp-1 mb-2">{mataPelajaran}</p>
                    <div className="flex items-center gap-2">
                      <Button className="h-9 px-4 rounded-[4px] text-xs min-h-[36px]" onClick={() => setSelectedTeacher(teacher)}>
                        Detail Pengajar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="outline" className="h-9 w-9 rounded-[4px] min-h-[36px] min-w-[36px] bg-black/40 border-white/30 text-white hover:bg-black/60 hover:text-white">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/teachers/${id}/edit`)}>
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

      <Dialog open={!!selectedTeacher} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {selectedTeacher && (
            <div className="flex flex-col max-h-[85vh]">
              <div className="relative h-64 bg-muted">
                {selectedTeacher.foto ? (
                  <img
                    src={selectedTeacher.foto}
                    alt={pick(selectedTeacher, 'namaLengkap', 'nama_lengkap') || 'Pengajar'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <Users className="h-14 w-14" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="mb-2">
                    {pick(selectedTeacher, 'bidangKeahlian', 'bidang_keahlian') || 'Pengajar'}
                  </Badge>
                  <h2 className="text-white text-2xl font-bold">
                    {pick(selectedTeacher, 'namaLengkap', 'nama_lengkap') || '-'}
                  </h2>
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <DialogHeader>
                  <DialogTitle>Detail Pengajar</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5" /> Mata Pelajaran
                    </p>
                    <p className="text-sm font-medium">{pick(selectedTeacher, 'mataPelajaran', 'mata_pelajaran') || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5" /> Pendidikan Terakhir
                    </p>
                    <p className="text-sm font-medium">
                      {pick(selectedTeacher, 'pendidikanTerakhir', 'pendidikan_terakhir') || '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5" /> Bidang Keahlian
                    </p>
                    <p className="text-sm font-medium">{pick(selectedTeacher, 'bidangKeahlian', 'bidang_keahlian') || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Award className="h-3.5 w-3.5" /> Pengalaman
                    </p>
                    <p className="text-sm font-medium">
                      {pick(selectedTeacher, 'pengalamanMengajar', 'pengalaman_mengajar') || '-'}
                    </p>
                  </div>
                </div>

                {pick(selectedTeacher, 'motto', 'motto') && (
                  <div className="rounded-xl border bg-muted/40 p-4 relative">
                    <Quote className="h-10 w-10 text-primary/20 absolute top-2 right-2" />
                    <p className="italic text-sm pr-10">"{pick(selectedTeacher, 'motto', 'motto')}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
