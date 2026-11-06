import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/common';
import { GraduationCap, Search, Calendar, User, Eye, Download, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function JournalListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [volumeId, setVolumeId] = useState<string>('all');

  const { data: volumes } = useQuery({
    queryKey: ['public-volumes'],
    queryFn: async () => {
      const response = await api.get('/publication/volumes');
      return response.data.data;
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-journals', page, search, volumeId],
    queryFn: async () => {
      const params = {
        type: 'journal',
        status: 'approved',
        page,
        limit: 10,
        search,
        volumeId: volumeId !== 'all' ? volumeId : undefined,
      };
      const response = await api.get('/publication/articles', { params });
      return response.data;
    },
  });

  return (
    <div className="container py-10 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader
          title="Jurnal Ilmiah"
          description="Publikasi ilmiah dan penelitian santri & asatidz"
          icon={GraduationCap}
        />
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
           <Select value={volumeId} onValueChange={(val) => { setVolumeId(val); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Volume" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Volume</SelectItem>
              {volumes?.map((vol: any) => (
                <SelectItem key={vol.id} value={String(vol.id)}>{vol.name} ({vol.year})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari jurnal..."
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-muted-foreground">
          Gagal memuat jurnal. Silakan coba lagi nanti.
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Belum ada jurnal yang ditemukan.
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {data.data.map((journal: any) => (
              <Card key={journal.id} className="flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-shadow">
                <div className="w-full md:w-48 bg-muted flex items-center justify-center p-4 border-b md:border-b-0 md:border-r">
                   {journal.featuredImage ? (
                      <img src={journal.featuredImage} alt={journal.title} className="w-full h-full object-cover rounded-md" />
                   ) : (
                      <FileText className="h-16 w-16 text-muted-foreground/30" />
                   )}
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       {journal.volume && (
                         <Badge variant="outline" className="text-xs">
                           {journal.volume.name} ({journal.volume.year})
                         </Badge>
                       )}
                       {journal.category && (
                         <Badge variant="secondary" className="text-xs">
                           {journal.category.name}
                         </Badge>
                       )}
                    </div>
                    <Link to={`/jurnal/${journal.slug}`} className="hover:underline">
                      <h3 className="text-xl font-bold mb-2 text-primary">{journal.title}</h3>
                    </Link>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {journal.excerpt || 'Tidak ada abstrak.'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                       <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{journal.author?.firstName} {journal.author?.lastName}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(journal.createdAt), 'dd MMM yyyy', { locale: idLocale })}</span>
                       </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 md:mt-0 gap-2">
                     <Button variant="outline" size="sm" asChild>
                        <Link to={`/jurnal/${journal.slug}`}>
                           Lihat Detail
                        </Link>
                     </Button>
                     {journal.pdfFile && (
                        <Button size="sm" variant="default" onClick={() => window.open(journal.pdfFile, '_blank')}>
                           <Download className="mr-2 h-4 w-4" /> PDF
                        </Button>
                     )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data?.pagination?.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center px-4 text-sm font-medium">
                Halaman {page} dari {data.pagination.totalPages}
              </div>
              <Button
                variant="outline"
                disabled={page === data.pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
