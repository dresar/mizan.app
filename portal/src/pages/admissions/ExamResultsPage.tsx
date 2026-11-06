import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { PageHeader, DataTable } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ClipboardList, Plus, MoreHorizontal, Pencil, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
interface ExamResult {
  id: number;
  santriId: number;
  santri: {
    namaLengkap: string;
    nisn: string;
  };
  writtenTestScore?: number;
  interviewScore?: number;
  quranTestScore?: number;
  totalScore?: number;
  status: 'lulus' | 'tidak_lulus' | 'pending' | 'cadangan';
  isPublished: boolean;
  notes?: string;
}
export default function ExamResultsPage() {
  const navigate = useNavigate();
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['exam-results'],
    queryFn: async () => {
      const res = await api.get('/psb/results');
      return res.data;
    },
  });
  const handleCreate = () => {
    navigate('/admin/admissions/results/new');
  };
  const handleEdit = (item: ExamResult) => {
    navigate(`/admin/admissions/results/${item.id}/edit`);
  };
  const columns: ColumnDef<ExamResult>[] = [
    {
      accessorKey: 'santri.namaLengkap',
      header: 'Nama Santri',
    },
    {
      accessorKey: 'writtenTestScore',
      header: 'Nilai Tulis',
      cell: ({ row }) => row.getValue('writtenTestScore') || '-',
    },
    {
      accessorKey: 'interviewScore',
      header: 'Nilai Wawancara',
      cell: ({ row }) => row.getValue('interviewScore') || '-',
    },
    {
      accessorKey: 'quranTestScore',
      header: 'Nilai Quran',
      cell: ({ row }) => row.getValue('quranTestScore') || '-',
    },
    {
      accessorKey: 'totalScore',
      header: 'Total',
      cell: ({ row }) => <span className="font-bold">{row.getValue('totalScore') || '-'}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status Kelulusan',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          lulus: 'default', 
          tidak_lulus: 'destructive',
          pending: 'secondary',
          cadangan: 'outline',
        };
        return (
            <Badge variant={variants[status]} className={status === 'lulus' ? 'bg-green-500 hover:bg-green-600' : ''}>
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
      },
    },
    {
      accessorKey: 'isPublished',
      header: 'Publikasi',
      cell: ({ row }) => (
        row.getValue('isPublished') 
            ? <CheckCircle2 className="h-5 w-5 text-green-500" /> 
            : <span className="text-muted-foreground text-sm">Draft</span>
      ),
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
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Hasil Seleksi" description="Input nilai dan status kelulusan santri" icon={ClipboardList}>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Input Nilai
        </Button>
      </PageHeader>
      <DataTable columns={columns} data={results} isLoading={isLoading} searchPlaceholder="Cari hasil..." />
    </div>
  );
}