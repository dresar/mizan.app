import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { PageHeader, DataTable, getSelectionColumn, CrudModal } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Pencil, Trash2, Database, LayoutGrid, List, Image as ImageIcon, Search, Filter } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
interface GenericResourcePageProps {
  resource: string;
  title: string;
  description?: string;
  basePath?: string; 
  viewMode?: 'table' | 'grid';
}
export default function GenericResourcePage({ resource, title, description, basePath, viewMode: initialViewMode = 'table' }: GenericResourcePageProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(initialViewMode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { showConfirm } = useAppStore();
  const { data: responseData, isLoading } = useQuery({
    queryKey: ['generic', resource],
    queryFn: async () => {
      const response = await api.get(`/admin/generic/${resource}`);
      return response.data;
    },
    staleTime: 60000, 
    refetchInterval: 30000,
  });
  const items = Array.isArray(responseData) ? responseData : (responseData?.data || []);
  const filteredItems = items.filter((item: any) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchable = [
        item.title, item.nama, item.name, item.description, item.content, 
        item.slug, item.excerpt, item.pertanyaan, item.jawaban
      ].filter(Boolean).join(' ').toLowerCase();
      if (!searchable.includes(query)) return false;
    }
    if (statusFilter !== 'all') {
      const status = item.status || (item.is_active ? 'active' : 'inactive') || (item.is_published ? 'published' : 'draft');
      if (String(status).toLowerCase() !== statusFilter.toLowerCase()) return false;
    }
    return true;
  });
  const getDynamicColumns = (data: any[]): ColumnDef<any>[] => {
    if (!data || data.length === 0) return [];
    const sample = data[0];
    const keys = Object.keys(sample).filter(k => 
      !['id', 'created_at', 'updated_at', 'createdAt', 'updatedAt', 'image', 'cover_image', 'content', 'description'].includes(k) &&
      typeof sample[k] !== 'object'
    ).slice(0, 5); 
    const generatedColumns: ColumnDef<any>[] = keys.map(key => ({
      accessorKey: key,
      header: key.replace(/_/g, ' ').toUpperCase(),
      cell: ({ row }) => {
        const val = row.getValue(key);
        if (typeof val === 'boolean') return <Badge variant={val ? 'default' : 'secondary'}>{val ? 'Yes' : 'No'}</Badge>;
        if (key === 'warna' && typeof val === 'string') {
           const colorMap: Record<string, string> = {
             green: 'bg-green-500',
             blue: 'bg-blue-500',
             purple: 'bg-purple-500',
             orange: 'bg-orange-500',
             red: 'bg-red-500',
             teal: 'bg-teal-500',
             pink: 'bg-pink-500',
           };
           const colorClass = colorMap[val] || 'bg-gray-500';
           return (
             <div className="flex items-center gap-2">
               <div className={`w-4 h-4 rounded-full ${colorClass}`} />
               <span>{val}</span>
             </div>
           );
        }
        return <div className="truncate max-w-[200px]" title={String(val)}>{String(val)}</div>;
      }
    }));
    return [
      getSelectionColumn(),
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <span className="text-xs text-muted-foreground">#{row.original.id}</span>,
      },
      ...generatedColumns,
      {
        id: 'actions',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(item)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];
  };
  const columns = getDynamicColumns(filteredItems);
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/admin/generic/${resource}`, data),
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['generic', resource] });
      const previous = queryClient.getQueryData(['generic', resource]);
      queryClient.setQueryData(['generic', resource], (old: any) => {
        const oldData = old?.data || [];
        return {
           ...old,
           data: [...oldData, { id: 'temp-' + Date.now(), ...newItem }]
        };
      });
      return { previous };
    },
    onError: (err, newItem, context) => {
       queryClient.setQueryData(['generic', resource], context?.previous);
       toast.error('Gagal menambahkan');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['generic', resource] });
      setIsModalOpen(false);
      toast.success('Berhasil ditambahkan');
    }
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: any, data: any }) => api.put(`/admin/generic/${resource}/${id}`, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['generic', resource] });
      const previous = queryClient.getQueryData(['generic', resource]);
      queryClient.setQueryData(['generic', resource], (old: any) => {
         const oldData = old?.data || [];
         return {
            ...old,
            data: oldData.map((item: any) => item.id === id ? { ...item, ...data } : item)
         };
      });
      return { previous };
    },
    onError: (err, vars, context) => {
       queryClient.setQueryData(['generic', resource], context?.previous);
       toast.error('Gagal memperbarui');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['generic', resource] });
      setIsModalOpen(false);
      toast.success('Berhasil diperbarui');
    }
  });
  const deleteMutation = useMutation({
    mutationFn: (id: any) => api.delete(`/admin/generic/${resource}/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['generic', resource] });
      const previous = queryClient.getQueryData(['generic', resource]);
      queryClient.setQueryData(['generic', resource], (old: any) => {
         const oldData = old?.data || [];
         return {
            ...old,
            data: oldData.filter((item: any) => item.id !== id)
         };
      });
      return { previous };
    },
    onError: (err, id, context) => {
       queryClient.setQueryData(['generic', resource], context?.previous);
       toast.error('Gagal menghapus');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['generic', resource] });
      toast.success('Berhasil dihapus');
    }
  });
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: any[]) => api.post(`/admin/generic/${resource}/bulk-delete`, { ids }),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ['generic', resource] });
      const previous = queryClient.getQueryData(['generic', resource]);
      queryClient.setQueryData(['generic', resource], (old: any) => {
         const oldData = old?.data || [];
         return {
            ...old,
            data: oldData.filter((item: any) => !ids.includes(item.id))
         };
      });
      return { previous };
    },
    onError: (err, ids, context) => {
       queryClient.setQueryData(['generic', resource], context?.previous);
       toast.error('Gagal menghapus massal');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['generic', resource] });
      setSelectedIds([]);
      toast.success('Berhasil dihapus massal');
    }
  });
  const handleCreate = () => {
    if (basePath) {
      navigate(`${basePath}/new`);
      return;
    }
    setEditingItem(null);
    setFormData({});
    setIsModalOpen(true);
  };
  const handleEdit = (item: any) => {
    if (basePath) {
      navigate(`${basePath}/${item.id}/edit`);
      return;
    }
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };
  const handleDelete = (id: any) => {
    showConfirm({
      title: 'Hapus Item',
      description: 'Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan.',
      variant: 'destructive',
      onConfirm: () => deleteMutation.mutate(id),
    });
  };
  const handleBulkDelete = (ids: any[]) => {
    showConfirm({
      title: 'Hapus Massal',
      description: `Apakah Anda yakin ingin menghapus ${ids.length} item? Tindakan ini tidak dapat dibatalkan.`,
      variant: 'destructive',
      onConfirm: () => bulkDeleteMutation.mutate(ids),
    });
  };
  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };
  const defaultFields = ['nama', 'deskripsi', 'keterangan', 'status', 'is_active'];
  
  // Configuration for specific resources
  const resourceConfig: Record<string, { 
    fields: string[], 
    types?: Record<string, 'text' | 'number' | 'textarea' | 'boolean' | 'image' | 'select'>,
    labels?: Record<string, string>,
    options?: Record<string, { label: string, value: any }[]>
  }> = {
    blogTestimoni: {
      fields: ['nama', 'jabatan', 'testimoni', 'rating', 'order', 'isPublished', 'foto'],
      types: {
        testimoni: 'textarea',
        rating: 'number',
        order: 'number',
        isPublished: 'boolean',
        foto: 'image'
      },
      labels: {
        isPublished: 'Publikasi'
      }
    },
    blogCategory: {
      fields: ['name', 'slug', 'order'],
      types: { order: 'number' }
    },
    blogTag: {
      fields: ['name', 'slug', 'order'],
      types: { order: 'number' }
    },
    faq: {
      fields: ['pertanyaan', 'jawaban', 'isPublished', 'order'],
      types: {
        jawaban: 'textarea',
        isPublished: 'boolean',
        order: 'number'
      },
      labels: {
        isPublished: 'Publikasi'
      }
    },
    statistik: {
      fields: ['judul', 'nilai', 'icon', 'deskripsi', 'warna', 'order', 'isPublished'],
      types: {
        deskripsi: 'textarea',
        order: 'number',
        isPublished: 'boolean',
        icon: 'image'
      },
      labels: {
        isPublished: 'Publikasi',
        icon: 'Ikon / Gambar'
      }
    },
    biayaPendidikan: {
      fields: ['tipe', 'nama', 'jumlah', 'keterangan', 'order'],
      types: {
        jumlah: 'number',
        order: 'number',
        keterangan: 'textarea'
      }
    },
    registrationFlow: {
      fields: ['title', 'description', 'icon', 'order', 'isActive'],
      types: {
        description: 'textarea',
        order: 'number',
        isActive: 'boolean',
        icon: 'image'
      },
      labels: {
        isActive: 'Aktif'
      }
    },
    bagianJabatan: {
      fields: ['nama', 'deskripsi', 'order', 'isActive'],
      types: {
        deskripsi: 'textarea',
        order: 'number',
        isActive: 'boolean'
      },
      labels: {
        isActive: 'Aktif'
      }
    },
    contactPersons: {
      fields: ['nama', 'foto', 'noHp', 'order', 'isActive'],
      types: {
        foto: 'image',
        order: 'number',
        isActive: 'boolean'
      },
      labels: {
        isActive: 'Aktif'
      }
    },
    socialMedia: {
      fields: ['platform', 'username', 'url', 'order', 'isActive'],
      types: {
        order: 'number',
        isActive: 'boolean'
      },
      labels: {
        isActive: 'Aktif'
      }
    }
  };

  const currentConfig = resourceConfig[resource] || {};
  
  const formFields = currentConfig.fields || (items.length > 0 
    ? Object.keys(items[0]).filter(k => 
        !['id', 'created_at', 'updated_at', 'createdAt', 'updatedAt'].includes(k) &&
        typeof items[0][k] !== 'object'
      )
    : defaultFields);

  const getFieldType = (key: string) => {
    if (currentConfig.types?.[key]) return currentConfig.types[key];
    if (key.includes('deskripsi') || key.includes('content') || key.includes('alamat')) return 'textarea';
    if (key.includes('email')) return 'email';
    if (key.includes('tanggal')) return 'date';
    if (key.startsWith('is') || key.startsWith('has')) return 'boolean';
    if (key === 'order' || key.includes('jumlah') || key.includes('harga')) return 'number';
    if (key.includes('image') || key.includes('foto') || key.includes('gambar')) return 'image';
    return 'text';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={title} description={description || `Kelola data ${title}`} icon={Database}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          {}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9">
                <Filter className="w-3.5 h-3.5 mr-2 opacity-70" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {viewMode === 'grid' && selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => handleBulkDelete(selectedIds)}>
                <Trash2 className="mr-2 h-4 w-4" /> Hapus ({selectedIds.length})
              </Button>
            )}
            <div className="flex bg-muted rounded-lg p-1 mr-2">
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleCreate} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Tambah
            </Button>
          </div>
        </div>
      </PageHeader>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {}
          {items.map((item: any) => {
            const imageUrl = item.featuredImage || item.featured_image || item.image || item.cover_image || item.thumbnail || item.gambar || item.gambarPutra || item.gambarPutri || null;
            const itemTitle = item.title || item.nama || item.name || `Item #${item.id}`;
            const itemDescription = item.description || item.excerpt || item.summary || item.content || '';
            const plainDescription = typeof itemDescription === 'string' 
              ? itemDescription.replace(/<[^>]*>?/gm, '').substring(0, 150) + (itemDescription.length > 150 ? '...' : '')
              : '';
            const isSelected = selectedIds.includes(item.id);
            return (
              <Card 
                key={item.id} 
                className={`overflow-hidden group hover:shadow-lg transition-all duration-300 border-muted/60 flex flex-col h-full ${isSelected ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="aspect-[16/10] w-full bg-muted/30 relative overflow-hidden">
                  <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity data-[checked=true]:opacity-100" data-checked={isSelected}>
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleSelection(item.id)}
                      className="bg-background/80 backdrop-blur-sm border-white/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-5 w-5"
                    />
                  </div>
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={itemTitle}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground/40 bg-muted/50 fallback-icon">
                      <ImageIcon className="h-14 w-14 mb-3 opacity-50" />
                      <span className="text-sm font-medium">No Cover Image</span>
                    </div>
                  )}
                  {/* Fallback for image error (hidden by default if image exists) */}
                  {imageUrl && (
                     <div className="hidden absolute inset-0 flex flex-col items-center justify-center w-full h-full text-muted-foreground/40 bg-muted/50 fallback-icon pointer-events-none">
                        <ImageIcon className="h-14 w-14 mb-3 opacity-50" />
                        <span className="text-sm font-medium">Image Error</span>
                     </div>
                  )}
                  {}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full shadow-sm bg-background/90 backdrop-blur-sm hover:bg-background" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-9 w-9 rounded-full shadow-sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-5 flex-grow flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    {item.category && (
                       <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-auto font-medium">
                          {typeof item.category === 'object' ? item.category.name : item.category}
                       </Badge>
                    )}
                    {item.created_at && (
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-xl line-clamp-2 leading-snug mb-3 group-hover:text-primary transition-colors" title={itemTitle}>
                    {itemTitle}
                  </h3>
                  {plainDescription && (
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {plainDescription}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {items.length === 0 && (
             <div className="col-span-full text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center gap-3">
                   <div className="bg-muted/50 p-4 rounded-full">
                      <LayoutGrid className="h-8 w-8 opacity-50" />
                   </div>
                   <p>Belum ada data untuk ditampilkan dalam mode grid.</p>
                </div>
             </div>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          isLoading={isLoading}
          searchPlaceholder="Cari data..."
          onBulkDelete={handleBulkDelete}
          hideSearch={true}
        />
      )}
      {!basePath && (
        <CrudModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          title={editingItem ? `Edit ${title}` : `Tambah ${title}`}
          description={editingItem ? 'Perbarui data' : 'Isi form untuk menambah data baru'}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          size="lg"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {formFields.map((key) => {
              const fieldType = getFieldType(key);
              const label = currentConfig.labels?.[key] || key.replace(/_/g, ' ');

              if (fieldType === 'textarea') {
                return (
                  <div key={key} className="space-y-2 col-span-2">
                    <Label className="capitalize">{label}</Label>
                    <textarea
                      value={formData[key] || ''}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      placeholder={`Masukkan ${key.replace(/_/g, ' ')}`}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={4}
                    />
                  </div>
                );
              }

              if (fieldType === 'boolean') {
                return (
                  <div key={key} className="space-y-2 flex flex-col justify-end">
                    <Label className="capitalize mb-2">{label}</Label>
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            checked={Boolean(formData[key])}
                            onCheckedChange={(checked) => setFormData({ ...formData, [key]: !!checked })}
                        />
                        <span className="text-sm text-muted-foreground">{formData[key] ? 'Ya' : 'Tidak'}</span>
                    </div>
                  </div>
                );
              }

              if (fieldType === 'number') {
                return (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{label}</Label>
                    <Input
                      type="number"
                      value={formData[key] || ''}
                      onChange={(e) => setFormData({ ...formData, [key]: Number(e.target.value) })}
                      placeholder={`0`}
                    />
                  </div>
                );
              }

              if (fieldType === 'image') {
                  // Basic text input for image URL for now, could be upgraded to DualImageInput later
                  return (
                    <div key={key} className="space-y-2 col-span-2">
                      <Label className="capitalize">{label}</Label>
                      <Input
                        value={formData[key] || ''}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        placeholder="https://..."
                      />
                      {formData[key] && (
                          <div className="mt-2 w-20 h-20 rounded border overflow-hidden">
                              <img src={formData[key]} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                      )}
                    </div>
                  );
              }

              return (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{label}</Label>
                  <Input
                    value={formData[key] || ''}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    placeholder={`Masukkan ${key}`}
                  />
                </div>
              );
            })}
            {formFields.length === 0 && (
              <div className="col-span-2 text-center text-muted-foreground py-4">
                Belum ada data untuk mendeteksi kolom. Silakan tambahkan data pertama melalui database atau API langsung.
              </div>
            )}
          </div>
        </CrudModal>
      )}
    </div>
  );
}
