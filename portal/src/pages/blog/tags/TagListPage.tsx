import { BaseResourceList } from '@/components/resources/BaseResourceList';
import { ColumnDef } from '@tanstack/react-table';
import { Tag } from 'lucide-react';
export default function TagListPage() {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Tag',
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
      resource="blogTag"
      title="Tag Blog"
      description="Kelola tag/label untuk artikel blog"
      columns={columns}
      icon={Tag}
      basePath="/admin/blog/tags"
      apiEndpoint="/admin/generic/blogTag"
    />
  );
}