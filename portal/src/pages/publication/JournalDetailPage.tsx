import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ArrowLeft, Calendar, User, Eye, Download, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function JournalDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-journal', slug],
    queryFn: async () => {
      const response = await api.get(`/publication/articles/${slug}`);
      return response.data.data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="container py-10 space-y-8 animate-fade-in">
         <div className="h-8 w-32 bg-muted rounded animate-pulse mb-4" />
         <div className="h-64 w-full bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Jurnal Tidak Ditemukan</h2>
        <p className="text-muted-foreground">Jurnal yang Anda cari tidak tersedia.</p>
        <Button onClick={() => navigate('/jurnal')}>Kembali ke Daftar Jurnal</Button>
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-8 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate('/jurnal')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Jurnal
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
             <div>
                <div className="flex gap-2 mb-4">
                    {data.volume && (
                        <Badge variant="outline">{data.volume.name} ({data.volume.year})</Badge>
                    )}
                    {data.category && (
                        <Badge variant="secondary">{data.category.name}</Badge>
                    )}
                </div>
                <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{data.author?.firstName} {data.author?.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(data.createdAt), 'dd MMMM yyyy', { locale: idLocale })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>{data.viewsCount}x Dilihat</span>
                    </div>
                </div>
             </div>

             <div className="prose dark:prose-invert max-w-none">
                <h3>Abstrak</h3>
                <p>{data.excerpt || 'Tidak ada abstrak.'}</p>
                <hr />
                <div dangerouslySetInnerHTML={{ __html: data.content }} />
             </div>
         </div>

         <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-card shadow-sm space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Informasi Jurnal
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Volume</span>
                        <span className="font-medium">{data.volume?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tahun</span>
                        <span className="font-medium">{data.volume?.year || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Kategori</span>
                        <span className="font-medium">{data.category?.name || '-'}</span>
                    </div>
                </div>
                {data.pdfFile ? (
                    <Button className="w-full" onClick={() => window.open(data.pdfFile, '_blank')}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                ) : (
                    <Button className="w-full" disabled variant="secondary">
                        PDF Tidak Tersedia
                    </Button>
                )}
            </div>
         </div>
      </div>
    </div>
  );
}
