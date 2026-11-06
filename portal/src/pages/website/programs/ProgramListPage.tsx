import { BaseResourceList } from '@/components/resources/BaseResourceList';
import { ColumnDef } from '@tanstack/react-table';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
export default function ProgramListPage() {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'gambar',
      header: 'Gambar',
      cell: ({ row }) => (
        <div className="h-12 w-20 rounded-md overflow-hidden bg-muted">
          {row.original.gambar ? (
            <img src={row.original.gambar} alt="Program" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">No Image</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'nama',
      header: 'Nama Program',
      cell: ({ row }) => <span className="font-medium">{row.original.nama}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'published' ? 'default' : 'secondary'}>
          {row.original.status === 'published' ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      accessorKey: 'isFeatured',
      header: 'Featured',
      cell: ({ row }) => (
        <Badge variant={row.original.isFeatured ? 'outline' : 'secondary'}>
          {row.original.isFeatured ? 'Yes' : 'No'}
        </Badge>
      ),
    },
  ];
  return (
    <BaseResourceList
      resource="programs"
      title="Program Unggulan"
      description="Kelola program-program unggulan pesantren"
      columns={columns}
      icon={Calendar}
      basePath="/admin/programs"
      apiEndpoint="/core/programs"
    />
  );
}