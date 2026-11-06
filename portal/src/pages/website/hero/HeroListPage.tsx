import { BaseResourceList } from '@/components/resources/BaseResourceList';
import { ColumnDef } from '@tanstack/react-table';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
export default function HeroListPage() {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'image',
      header: 'Gambar',
      cell: ({ row }) => (
        <div className="h-12 w-20 rounded-md overflow-hidden bg-muted relative">
          {row.original.image ? (
            <img 
              src={row.original.image} 
              alt="Hero" 
              className="h-full w-full object-cover" 
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground text-center p-1">
              No Image
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Judul',
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>
    },
    {
      accessorKey: 'subtitle',
      header: 'Sub Judul',
      cell: ({ row }) => <span className="text-muted-foreground truncate max-w-[200px]">{row.original.subtitle}</span>
    },
    {
      accessorKey: 'order',
      header: 'Urutan',
      cell: ({ row }) => <div className="text-center w-10">{row.original.order}</div>
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
  ];
  return (
    <BaseResourceList
      resource="hero"
      title="Hero Section"
      description="Kelola banner utama halaman depan"
      columns={columns}
      icon={Sparkles}
      basePath="/admin/hero-sections"
      apiEndpoint="/core/hero"
    />
  );
}