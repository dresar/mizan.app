import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { PageHeader, DataTable } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Clock, Plus, MoreHorizontal, Pencil, Trash2, CalendarDays } from 'lucide-react';
import type { JadwalHarian } from '@/types';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const kategoriColors: Record<string, string> = {
  ibadah: 'bg-primary/10 text-primary border-primary/30',
  pendidikan: 'bg-info/10 text-info border-info/30',
  istirahat: 'bg-warning/10 text-warning border-warning/30',
  kegiatan: 'bg-success/10 text-success border-success/30',
};

export default function DailySchedulePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'putra' | 'putri'>('putra');
  const { showConfirm } = useAppStore();

  const { data: allData = [], isLoading } = useQuery({
    queryKey: ['jadwalHarian'],
    queryFn: async () => {
        const res = await api.get('/admin/generic/jadwalHarian');
        return res.data.data || res.data;
    },
  });

  // Filter data based on active tab (target)
  const data = (Array.isArray(allData) ? allData : []).filter((item: any) => {
      // Backward compatibility: if no target, assume based on old category or default to 'semua'
      const itemTarget = item.target || (['putra', 'putri'].includes(item.kategori) ? item.kategori : 'semua');
      return itemTarget === activeTab || itemTarget === 'semua';
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/generic/jadwalHarian/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwalHarian'] });
      toast.success('Jadwal berhasil dihapus');
    },
    onError: () => toast.error('Gagal menghapus jadwal'),
  });

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Hapus Jadwal',
      description: 'Yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan.',
      variant: 'destructive',
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const columns: ColumnDef<JadwalHarian>[] = [
    {
      accessorKey: 'waktu',
      header: 'Waktu',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <code className="text-sm font-medium">{row.original.waktu}</code>
        </div>
      ),
    },
    {
      accessorKey: 'judul',
      header: 'Kegiatan',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-base">{row.original.judul}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">{row.original.deskripsi}</p>
        </div>
      ),
    },
    {
      accessorKey: 'kategori',
      header: 'Kategori',
      cell: ({ row }) => (
        <Badge variant="outline" className={`${kategoriColors[row.original.kategori] || ''} capitalize`}>
          {row.original.kategori}
        </Badge>
      ),
    },
    {
      accessorKey: 'target',
      header: 'Target',
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
            {row.original.target || 'Semua'}
        </Badge>
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
            <DropdownMenuItem onClick={() => navigate(`/admin/daily-schedule/${row.original.id}/edit`)}>
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
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader 
        title="Jadwal Harian" 
        description="Kelola jadwal aktivitas harian santri secara terstruktur." 
        icon={CalendarDays}
      >
        <Button onClick={() => navigate('/admin/daily-schedule/new')} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" /> Tambah Jadwal
        </Button>
      </PageHeader>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-muted/30 p-4 rounded-lg border">
        <div className="flex gap-2">
            <Button 
            variant={activeTab === 'putra' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('putra')}
            className={`w-32 ${activeTab === 'putra' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
            Putra
            </Button>
            <Button 
            variant={activeTab === 'putri' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('putri')}
            className={`w-32 ${activeTab === 'putri' ? 'bg-pink-600 hover:bg-pink-700' : ''}`}
            >
            Putri
            </Button>
        </div>
        <div className="text-sm text-muted-foreground">
            Menampilkan {data.length} kegiatan untuk santri <span className="font-medium capitalize">{activeTab}</span>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        isLoading={isLoading} 
        searchPlaceholder="Cari nama kegiatan atau waktu..." 
      />
    </div>
  );
}
