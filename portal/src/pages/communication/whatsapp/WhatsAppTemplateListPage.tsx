import { BaseResourceList } from '@/components/resources/BaseResourceList';
import { ColumnDef } from '@tanstack/react-table';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
export default function WhatsAppTemplateListPage() {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'nama',
      header: 'Nama Template',
      cell: ({ row }) => <span className="font-medium">{row.original.nama}</span>
    },
    {
      accessorKey: 'pesan',
      header: 'Isi Pesan',
      cell: ({ row }) => <span className="text-muted-foreground truncate max-w-[300px]">{row.original.pesan}</span>
    },
    {
      accessorKey: 'tipe',
      header: 'Tipe / Role',
      cell: ({ row }) => {
        const type = row.original.tipe;
        let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
        if (type === 'admin') variant = "destructive";
        if (type === 'user') variant = "default";
        if (type === 'public') variant = "outline";
        return (
          <Badge variant={variant}>
            {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'variabel',
      header: 'Variabel',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.variabel || '-'}</span>
    },
    {
      accessorKey: 'order',
      header: 'Urutan',
      cell: ({ row }) => <div className="text-center w-10">{row.original.order}</div>
    },
  ];
  return (
    <BaseResourceList
      resource="whatsappTemplates"
      title="Template WhatsApp"
      description="Kelola template pesan WhatsApp untuk Admin dan User"
      columns={columns}
      icon={MessageSquare}
      basePath="/admin/whatsapp-templates"
      apiEndpoint="/admin/generic/whatsappTemplates"
    />
  );
}