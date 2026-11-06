import { BaseResourceList } from '@/components/resources/BaseResourceList';
import { ColumnDef } from '@tanstack/react-table';
import { Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
export default function AnnouncementListPage() {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'gambar',
      header: 'Gambar',
      cell: ({ row }) => (
        <div className="h-12 w-20 rounded-md overflow-hidden bg-muted">
          {row.original.gambar ? (
            <img src={row.original.gambar} alt="Pengumuman" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">No Image</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'judul',
      header: 'Judul Pengumuman',
      cell: ({ row }) => <span className="font-medium">{row.original.judul}</span>
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
      accessorKey: 'isPenting',
      header: 'Penting',
      cell: ({ row }) => (
        <Badge variant={row.original.isPenting ? 'destructive' : 'outline'}>
          {row.original.isPenting ? 'Ya' : 'Tidak'}
        </Badge>
      ),
    },
  ];
  return (
    <BaseResourceList
      resource="blogPengumuman"
      title="Pengumuman"
      description="Kelola pengumuman dan informasi penting"
      columns={columns}
      icon={Megaphone}
      basePath="/admin/announcements"
      apiEndpoint="/admin/generic/blogPengumuman"
    />
  );
}