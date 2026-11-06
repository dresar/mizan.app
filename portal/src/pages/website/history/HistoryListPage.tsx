import { BaseResourceList } from '@/components/resources/BaseResourceList';
import { ColumnDef } from '@tanstack/react-table';
import { BookOpen } from 'lucide-react';

const shortText = (text?: string, max = 110) => {
  if (!text) return '-';
  const normalized = text.replace(/\s+/g, ' ').trim();
  return normalized.length > max ? `${normalized.slice(0, max).trimEnd()}...` : normalized;
};

export default function HistoryListPage() {
  type HistoryItem = {
    id: number | string;
    images?: { id: number; gambar: string }[];
    judul: string;
    deskripsi?: string;
    order?: number;
  };

  const columns: ColumnDef<HistoryItem>[] = [
    {
      accessorKey: 'gambar',
      header: 'Gambar',
      cell: ({ row }) => {
        const firstImage = row.original.images?.[0]?.gambar;
        return firstImage ? (
          <img src={firstImage} alt={row.original.judul} className="h-12 w-20 object-cover rounded-md border" />
        ) : (
          <div className="h-12 w-20 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground border">No Img</div>
        );
      }
    },
    {
      accessorKey: 'timeline',
      header: 'Sejarah & Timeline',
      cell: ({ row }) => <span className="font-medium">{row.original.judul}</span>
    },
    {
      accessorKey: 'timelineDetail',
      header: 'Ringkasan',
      cell: ({ row }) => (
        <div className="relative pl-5 py-1 max-w-[420px]">
          <div className="absolute left-0 top-1.5 bottom-1.5 w-px bg-border" />
          <div className="absolute left-0 top-1.5 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-primary" />
          <p className="text-sm font-semibold leading-snug">{row.original.judul}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{shortText(row.original.deskripsi)}</p>
        </div>
      )
    },
    {
      accessorKey: 'order',
      header: 'Urutan',
      cell: ({ row }) => <div className="text-center w-12 font-semibold">{row.original.order}</div>
    },
  ];
  return (
    <BaseResourceList
      resource="history"
      title="Sejarah & Timeline"
      description="Kelola timeline sejarah perkembangan pesantren"
      columns={columns}
      icon={BookOpen}
      basePath="/admin/history"
      apiEndpoint="/core/sejarah-timeline"
    />
  );
}
