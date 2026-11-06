import { BaseResourceList } from '@/components/resources/BaseResourceList';
import { ColumnDef } from '@tanstack/react-table';
import { ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
export default function GalleryListPage() {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'gambar',
      header: 'Preview',
      cell: ({ row }) => (
        <div className="h-12 w-20 rounded-md overflow-hidden bg-muted">
          {row.original.gambar ? (
            <img src={row.original.gambar} alt="Galeri" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">No Image</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'judul',
      header: 'Judul',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.judul}</div>
          <div className="text-xs text-muted-foreground">{row.original.tipe}</div>
        </div>
      )
    },
    {
      accessorKey: 'isPublished',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isPublished ? 'default' : 'secondary'}>
          {row.original.isPublished ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
  ];
  return (
    <BaseResourceList
      resource="media"
      title="Galeri Media"
      description="Kelola foto dan video galeri kegiatan"
      columns={columns}
      icon={ImageIcon}
      basePath="/admin/gallery"
      apiEndpoint="/admin/generic/media"
    />
  );
}