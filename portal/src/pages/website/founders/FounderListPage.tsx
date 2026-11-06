import { BaseResourceList } from '@/components/resources/BaseResourceList';
import { ColumnDef } from '@tanstack/react-table';
import { Users } from 'lucide-react';
export default function FounderListPage() {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'foto',
      header: 'Foto',
      cell: ({ row }) => (
        <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
          <img 
            src={row.original.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.original.namaLengkap)}`} 
            alt={row.original.namaLengkap} 
            className="h-full w-full object-cover" 
          />
        </div>
      )
    },
    {
      accessorKey: 'namaLengkap',
      header: 'Nama Lengkap',
      cell: ({ row }) => <span className="font-medium">{row.original.namaLengkap}</span>
    },
    {
      accessorKey: 'jabatan',
      header: 'Jabatan',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
  ];
  return (
    <BaseResourceList
      resource="founders"
      title="Identitas Website (Pendiri & Pengasuh)"
      description="Kelola data pendiri, pengasuh, dan penasehat pesantren (Maksimal 5)."
      columns={columns}
      icon={Users}
      basePath="/admin/website/founders"
      apiEndpoint="/core/admin/founders"
    />
  );
}