import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { PageHeader, DataTable } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAppStore } from '@/stores/app-store';
import { useNavigate } from 'react-router-dom';
interface ExamSchedule {
  id: number;
  santriId: number;
  santri: {
    namaLengkap: string;
    nisn: string;
  };
  type: 'written' | 'interview' | 'quran';
  scheduledDate: string;
  location: string;
  examiner?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}
export default function ExamSchedulesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showConfirm } = useAppStore();
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['exam-schedules'],
    queryFn: async () => {
      const res = await api.get('/psb/schedules');
      return res.data;
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/psb/schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-schedules'] });
      toast.success('Jadwal berhasil dihapus');
    },
  });
  const handleCreate = () => {
    navigate('/admin/admissions/schedules/new');
  };
  const handleEdit = (item: ExamSchedule) => {
    navigate(`/admin/admissions/schedules/${item.id}/edit`);
  };
  const handleDelete = (id: number) => {
    showConfirm({
      title: 'Hapus Jadwal',
      description: 'Apakah Anda yakin ingin menghapus jadwal ini?',
      variant: 'destructive',
      onConfirm: () => deleteMutation.mutate(id),
    });
  };
  const columns: ColumnDef<ExamSchedule>[] = [
    {
      accessorKey: 'santri.namaLengkap',
      header: 'Nama Santri',
    },
    {
      accessorKey: 'type',
      header: 'Jenis Tes',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        const labels: Record<string, string> = {
            written: 'Tes Tulis',
            interview: 'Wawancara',
            quran: 'Tes Al-Qur\'an'
        };
        return <Badge variant="outline">{labels[type] || type}</Badge>;
      }
    },
    {
      accessorKey: 'scheduledDate',
      header: 'Waktu',
      cell: ({ row }) => format(new Date(row.getValue('scheduledDate')), 'dd MMM yyyy HH:mm', { locale: idLocale }),
    },
    {
      accessorKey: 'location',
      header: 'Lokasi',
    },
    {
      accessorKey: 'examiner',
      header: 'Penguji',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          scheduled: 'default',
          completed: 'secondary',
          cancelled: 'destructive',
        };
        return <Badge variant={variants[status]}>{status}</Badge>;
      },
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
    <div className="space-y-6">
      <PageHeader title="Jadwal Seleksi" description="Kelola jadwal tes masuk dan wawancara" icon={Calendar}>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Buat Jadwal
        </Button>
      </PageHeader>
      <DataTable columns={columns} data={schedules} isLoading={isLoading} searchPlaceholder="Cari jadwal..." />
    </div>
  );
}