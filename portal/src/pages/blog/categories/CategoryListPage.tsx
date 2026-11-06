import { BaseResourceList } from '@/components/resources/BaseResourceList';
import { ColumnDef } from '@tanstack/react-table';
import { Folder } from 'lucide-react';
export default function CategoryListPage() {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Kategori',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.slug}</span>
    },
    {
      accessorKey: 'order',
      header: 'Urutan',
      cell: ({ row }) => <div className="text-center w-10">{row.original.order}</div>
    },
  ];
  return (
    <BaseResourceList
      resource="blogCategory"
      title="Kategori Blog"
      description="Kelola kategori untuk artikel blog"
      columns={columns}
      icon={Folder}
      basePath="/admin/blog/categories"
      apiEndpoint="/admin/generic/blogCategory"
    />
  );
}