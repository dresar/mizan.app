import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { PageHeader, DataTable, getSelectionColumn, StatusBadge, CrudModal } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Newspaper, Plus, MoreHorizontal, Eye, Pencil, Trash2, FolderOpen, Tags as TagsIcon } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import type { BlogPost, Category, Tag } from '@/types';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
export default function BlogPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('posts');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '' });
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagForm, setTagForm] = useState({ name: '', slug: '' });
  const { showConfirm } = useAppStore();
  const { data: posts = [] } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => (await api.get('/admin/generic/blogBlogpost')).data.data,
    refetchInterval: 10000,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => (await api.get('/admin/generic/blogCategory')).data.data,
    refetchInterval: 60000, 
  });
  const { data: tags = [] } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => (await api.get('/admin/generic/blogTag')).data.data,
    refetchInterval: 60000,
  });
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return '-';
    const category = categories.find((c: any) => String(c.id) === String(categoryId));
    return category?.name || '-';
  };
  const categoryMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingCategory) {
        return api.put(`/admin/generic/blogCategory/${editingCategory.id}`, data);
      }
      return api.post('/admin/generic/blogCategory', data);
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['blog-categories'] });
      const previous = queryClient.getQueryData(['blog-categories']);
      queryClient.setQueryData(['blog-categories'], (old: any[] = []) => {
        if (editingCategory) {
           return old.map(c => c.id === editingCategory.id ? { ...c, ...newData } : c);
        }
        return [...old, { id: 'temp-' + Date.now(), ...newData }];
      });
      return { previous };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['blog-categories'], context?.previous);
      toast.error('Gagal menyimpan kategori');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
      setIsCategoryModalOpen(false);
      toast.success(editingCategory ? 'Kategori diperbarui' : 'Kategori ditambahkan');
    }
  });
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/generic/blogCategory/${id}`),
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
       toast.success('Kategori dihapus');
    }
  });
  const tagMutation = useMutation({
    mutationFn: async (data: any) => {
       if (editingTag) {
         return api.put(`/admin/generic/blogTag/${editingTag.id}`, data);
       }
       return api.post('/admin/generic/blogTag', data);
    },
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
       setIsTagModalOpen(false);
       toast.success(editingTag ? 'Tag diperbarui' : 'Tag ditambahkan');
    }
  });
  const deleteTagMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/generic/blogTag/${id}`),
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
       toast.success('Tag dihapus');
    }
  });
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => api.delete(`/admin/generic/blogBlogpost/${id}`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Artikel terpilih berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus beberapa artikel');
    }
  });
  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/generic/blogBlogpost/${id}`),
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
       toast.success('Artikel dihapus');
    }
  });
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', slug: '' });
    setIsCategoryModalOpen(true);
  };
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, slug: category.slug });
    setIsCategoryModalOpen(true);
  };
  const handleSaveCategory = () => {
    const slug = categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-');
    categoryMutation.mutate({ ...categoryForm, slug, order: 0 }); 
  };
  const handleDeleteCategory = (id: string) => {
    showConfirm({
      title: 'Hapus Kategori',
      description: 'Yakin ingin menghapus kategori ini?',
      variant: 'destructive',
      onConfirm: () => deleteCategoryMutation.mutate(id),
    });
  };
  const handleAddTag = () => {
    setEditingTag(null);
    setTagForm({ name: '', slug: '' });
    setIsTagModalOpen(true);
  };
  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagForm({ name: tag.name, slug: tag.slug });
    setIsTagModalOpen(true);
  };
  const handleSaveTag = () => {
    const slug = tagForm.slug || tagForm.name.toLowerCase().replace(/\s+/g, '-');
    tagMutation.mutate({ ...tagForm, slug, order: 0 });
  };
  const handleDeleteTag = (id: string) => {
    showConfirm({
      title: 'Hapus Tag',
      description: 'Yakin ingin menghapus tag ini?',
      variant: 'destructive',
      onConfirm: () => deleteTagMutation.mutate(id),
    });
  };
  const handleDeletePost = (id: string) => {
    showConfirm({
      title: 'Hapus Artikel',
      description: 'Yakin ingin menghapus artikel ini?',
      variant: 'destructive',
      onConfirm: () => deletePostMutation.mutate(id),
    });
  };
  const postColumns: ColumnDef<BlogPost>[] = [
    getSelectionColumn<BlogPost>(),
    {
      accessorKey: 'title',
      header: 'Judul',
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <Link to={`/blog/${row.original.id}/edit`} className="font-medium hover:text-primary hover:underline">
            {row.original.title}
          </Link>
          <p className="text-xs text-muted-foreground truncate">{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: 'category_id',
      header: 'Kategori',
      cell: ({ row }) => (
        <Badge variant="outline">{getCategoryName(row.original.category_id)}</Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'views_count',
      header: 'Views',
      cell: ({ row }) => <span className="text-muted-foreground">{Number(row.original.views_count || 0).toLocaleString()}</span>,
    },
    {
      accessorKey: 'created_at',
      header: 'Tanggal',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDateTime(row.original.created_at)}</span>
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
            <DropdownMenuItem asChild>
              <Link to={`/blog/${row.original.id}`}><Eye className="mr-2 h-4 w-4" /> Lihat</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/blog/${row.original.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeletePost(row.original.id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  const categoryColumns: ColumnDef<Category>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Kategori',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <FolderOpen className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">/{row.original.slug}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'order',
      header: 'Urutan',
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEditCategory(row.original)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(row.original.id)} className="text-destructive">
            Hapus
          </Button>
        </div>
      ),
    },
  ];
  const tagColumns: ColumnDef<Tag>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Tag',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20">
            <TagsIcon className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">/{row.original.slug}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'order',
      header: 'Urutan',
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEditTag(row.original)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteTag(row.original.id)} className="text-destructive">
            Hapus
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Blog" description="Kelola artikel, kategori, dan tag" icon={Newspaper}>
        {activeTab === 'posts' && (
          <Button asChild>
            <Link to="/blog/new"><Plus className="mr-2 h-4 w-4" /> Tulis Artikel</Link>
          </Button>
        )}
        {activeTab === 'categories' && (
          <Button onClick={handleAddCategory}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
          </Button>
        )}
        {activeTab === 'tags' && (
          <Button onClick={handleAddTag}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Tag
          </Button>
        )}
      </PageHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="posts">Artikel ({posts.length})</TabsTrigger>
          <TabsTrigger value="categories">Kategori ({categories.length})</TabsTrigger>
          <TabsTrigger value="tags">Tag ({tags.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">
          <DataTable
            columns={postColumns}
            data={posts}
            searchPlaceholder="Cari artikel..."
            onBulkDelete={(ids) => {
              showConfirm({
                title: 'Hapus Artikel Terpilih',
                description: `Apakah Anda yakin ingin menghapus ${ids.length} artikel ini?`,
                variant: 'destructive',
                onConfirm: () => bulkDeleteMutation.mutate(ids as string[]),
              });
            }}
          />
        </TabsContent>
        <TabsContent value="categories" className="mt-6">
          <DataTable columns={categoryColumns} data={categories} searchPlaceholder="Cari kategori..." />
        </TabsContent>
        <TabsContent value="tags" className="mt-6">
          <DataTable columns={tagColumns} data={tags} searchPlaceholder="Cari tag..." />
        </TabsContent>
      </Tabs>
      {}
      <CrudModal
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
        onSubmit={handleSaveCategory}
        isSubmitting={categoryMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Kategori</Label>
            <Input
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="Nama kategori"
            />
          </div>
          <div className="space-y-2">
            <Label>Slug (opsional)</Label>
            <Input
              value={categoryForm.slug}
              onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
              placeholder="nama-kategori"
            />
          </div>
        </div>
      </CrudModal>
      {}
      <CrudModal
        open={isTagModalOpen}
        onOpenChange={setIsTagModalOpen}
        title={editingTag ? 'Edit Tag' : 'Tambah Tag'}
        onSubmit={handleSaveTag}
        isSubmitting={tagMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Tag</Label>
            <Input
              value={tagForm.name}
              onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
              placeholder="Nama tag"
            />
          </div>
          <div className="space-y-2">
            <Label>Slug (opsional)</Label>
            <Input
              value={tagForm.slug}
              onChange={(e) => setTagForm({ ...tagForm, slug: e.target.value })}
              placeholder="nama-tag"
            />
          </div>
        </div>
      </CrudModal>
    </div>
  );
}