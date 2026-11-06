import { BaseResourceList } from '@/components/resources/BaseResourceList';
import { ColumnDef } from '@tanstack/react-table';
import { GraduationCap } from 'lucide-react';
export default function EducationListPage() {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'gambar',
      header: 'Gambar',
      cell: ({ row }) => (
        <div className="h-12 w-20 rounded-md overflow-hidden bg-muted">
          {row.original.gambar ? (
            <img src={row.original.gambar} alt="Education" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">No Image</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'nama',
      header: 'Program Pendidikan',
      cell: ({ row }) => <span className="font-medium">{row.original.nama}</span>
    },
    {
      accessorKey: 'akreditasi',
      header: 'Akreditasi',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.akreditasi || '-'}</span>
    },
    {
      accessorKey: 'order',
      header: 'Urutan',
      cell: ({ row }) => <div className="text-center w-10">{row.original.order}</div>
    },
  ];
  return (
    <BaseResourceList
      resource="education"
      title="Program Pendidikan"
      description="Kelola program pendidikan formal dan non-formal"
      columns={columns}
      icon={GraduationCap}
      basePath="/admin/education"
      apiEndpoint="/core/program-pendidikan"
    />
  );
}