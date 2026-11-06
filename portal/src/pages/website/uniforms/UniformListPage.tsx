import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { PageHeader, DataTable, getSelectionColumn } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Shirt, 
  User, 
  UserCheck 
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/stores/app-store';
import { ColumnDef } from '@tanstack/react-table';
export default function UniformListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showConfirm } = useAppStore();
  const [activeTab, setActiveTab] = useState('putra');
  const { data: responseData, isLoading } = useQuery({
    queryKey: ['generic', 'seragam'],
    queryFn: async () => {
      const response = await api.get('/admin/generic/seragam');
      return response.data;
    },
  });
  const items = Array.isArray(responseData) ? responseData : (responseData?.data || []);
  const deleteMutation = useMutation({
    mutationFn: (id: any) => api.delete(`/admin/generic/seragam/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generic', 'seragam'] });
      toast.success('Data seragam berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus data seragam');
    }
  });
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: any[]) => api.post(`/admin/generic/seragam/bulk-delete`, { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generic', 'seragam'] });
      toast.success('Data seragam berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus data seragam');
    }
  });
  const handleBulkDelete = (ids: any[]) => {
    showConfirm({
      title: 'Hapus Massal',
      description: `Apakah Anda yakin ingin menghapus ${ids.length} item? Tindakan ini tidak dapat dibatalkan.`,
      variant: 'destructive',
      onConfirm: () => bulkDeleteMutation.mutate(ids),
    });
  };
  const handleDelete = (id: any) => {
    showConfirm({
      title: 'Hapus Data Seragam',
      description: 'Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan.',
      variant: 'destructive',
      onConfirm: () => deleteMutation.mutate(id),
    });
  };
  const handleEdit = (id: any) => {
    navigate(`/admin/uniforms/${id}/edit`);
  };
  const columnsPutra: ColumnDef<any>[] = [
    getSelectionColumn(),
    {
      id: 'no',
      header: 'NO',
      cell: ({ row }) => <span className="text-muted-foreground">{row.index + 1}</span>,
      enableSorting: false,
      size: 50,
    },
    {
      accessorKey: 'hari',
      header: 'HARI',
      cell: ({ row }) => <span className="font-medium">{row.original.hari}</span>,
    },
    {
      accessorKey: 'seragamPutra',
      header: 'SERAGAM PUTRA',
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
            {row.original.gambarPutra ? (
                <div className="relative group cursor-pointer overflow-hidden rounded-lg border shadow-sm w-16 h-16 shrink-0">
                  <img 
                      src={row.original.gambarPutra} 
                      alt="Seragam Putra" 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
            ) : (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border shrink-0">
                    <Shirt className="w-6 h-6 text-muted-foreground/40" />
                </div>
            )}
            <span className="text-base">{row.original.seragamPutra || '-'}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original.id)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  const columnsPutri: ColumnDef<any>[] = [
    getSelectionColumn(),
    {
      id: 'no',
      header: 'NO',
      cell: ({ row }) => <span className="text-muted-foreground">{row.index + 1}</span>,
      enableSorting: false,
      size: 50,
    },
    {
      accessorKey: 'hari',
      header: 'HARI',
      cell: ({ row }) => <span className="font-medium">{row.original.hari}</span>,
    },
    {
      accessorKey: 'seragamPutri',
      header: 'SERAGAM PUTRI',
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
            {row.original.gambarPutri ? (
                <div className="relative group cursor-pointer overflow-hidden rounded-lg border shadow-sm w-16 h-16 shrink-0">
                  <img 
                      src={row.original.gambarPutri} 
                      alt="Seragam Putri" 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
            ) : (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border shrink-0">
                    <Shirt className="w-6 h-6 text-muted-foreground/40" />
                </div>
            )}
            <span className="text-base">{row.original.seragamPutri || '-'}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original.id)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Data Seragam" 
        description="Kelola data seragam harian santri putra dan putri" 
        icon={Shirt}
      >
        <Button onClick={() => navigate('/admin/uniforms/new')}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Data
        </Button>
      </PageHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="putra" className="flex items-center gap-2">
            <User className="w-4 h-4" /> Seragam Putra
          </TabsTrigger>
          <TabsTrigger value="putri" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" /> Seragam Putri
          </TabsTrigger>
        </TabsList>
        <TabsContent value="putra" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <DataTable 
                columns={columnsPutra} 
                data={items} 
                isLoading={isLoading}
                hideSearch={true}
                onBulkDelete={handleBulkDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="putri" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <DataTable 
                columns={columnsPutri} 
                data={items} 
                isLoading={isLoading}
                hideSearch={true}
                onBulkDelete={handleBulkDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}