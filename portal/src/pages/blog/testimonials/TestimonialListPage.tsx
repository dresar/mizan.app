import { BaseResourceList } from '@/components/resources/BaseResourceList';
import { ColumnDef } from '@tanstack/react-table';
import { MessageSquareQuote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
export default function TestimonialListPage() {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'foto',
      header: 'Foto',
      cell: ({ row }) => (
        <div className="h-10 w-10 rounded-full overflow-hidden bg-muted relative group">
          {row.original.foto ? (
            <img 
                src={row.original.foto} 
                alt={row.original.nama} 
                className="h-full w-full object-cover"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.querySelector('.fallback')?.classList.remove('hidden');
                }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">No Img</div>
          )}
          <div className="fallback hidden absolute inset-0 flex items-center justify-center bg-muted text-[10px] text-muted-foreground">
            Err
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'nama',
      header: 'Nama',
      cell: ({ row }) => (
        <div>
            <div className="font-medium">{row.original.nama}</div>
            <div className="text-xs text-muted-foreground">{row.original.jabatan}</div>
        </div>
      )
    },
    {
      accessorKey: 'testimoni',
      header: 'Testimoni',
      cell: ({ row }) => <div className="truncate max-w-[300px] text-sm italic">"{row.original.testimoni}"</div>
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => <span className="font-medium text-yellow-600">★ {row.original.rating}</span>
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
      resource="blogTestimoni"
      title="Testimoni"
      description="Kelola testimoni dari wali santri, alumni, atau tokoh"
      columns={columns}
      icon={MessageSquareQuote}
      basePath="/admin/testimonials"
      apiEndpoint="/admin/generic/blogTestimoni"
    />
  );
}