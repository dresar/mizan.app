import { BaseResourceList } from '@/components/resources/BaseResourceList';
import { ColumnDef } from '@tanstack/react-table';
import { Building2 } from 'lucide-react';
export default function FacilitiesListPage() {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'gambar',
      header: 'Gambar',
      cell: ({ row }) => (
        <div className="h-12 w-20 rounded-md overflow-hidden bg-muted">
          {row.original.gambar ? (
            <img src={row.original.gambar} alt="Fasilitas" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">No Image</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'nama',
      header: 'Nama Fasilitas',
      cell: ({ row }) => <span className="font-medium">{row.original.nama}</span>
    },
    {
      accessorKey: 'icon',
      header: 'Icon',
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.icon}</span>
    },
    {
      accessorKey: 'order',
      header: 'Urutan',
      cell: ({ row }) => <div className="text-center w-10">{row.original.order}</div>
    },
  ];
  return (
    <BaseResourceList
      resource="facilities"
      title="Fasilitas"
      description="Kelola fasilitas pesantren"
      columns={columns}
      icon={Building2}
      basePath="/admin/facilities"
      apiEndpoint="/core/fasilitas"
    />
  );
}