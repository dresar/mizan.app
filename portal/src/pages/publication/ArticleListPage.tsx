import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BookOpen, Search, Calendar, User, Eye, ArrowRight, PenSquare, GraduationCap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { motion } from 'framer-motion';
import SectionWrapper from '@/components/shared/SectionWrapper';
import SEOHead from '@/components/SEOHead';

const ArticleCard = ({ article, index }: { article: any; index: number }) => {
  const authorName = [article.author?.firstName, article.author?.lastName].filter(Boolean).join(' ') || 'Penulis';
  const initials = authorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/artikel/${article.slug}`} className="block group h-full">
        <div className="h-full glass-card border border-border/40 rounded-xl overflow-hidden hover-lift flex flex-col">
          {/* Colored top accent bar by category */}
          <div className="h-1 bg-gradient-to-r from-primary to-primary/40" />

          <div className="p-5 flex flex-col flex-1">
            {/* Category badge */}
            {article.category && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5 mb-3 w-fit">
                <BookOpen className="w-3 h-3" /> {article.category.name}
              </span>
            )}

            <h3 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
              {article.title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1">
              {article.excerpt || article.content?.replace(/<[^>]+>/g, '').substring(0, 180)}
            </p>

            {/* Keywords */}
            {article.keywords && (
              <div className="flex flex-wrap gap-1 mt-3">
                {article.keywords.split(',').slice(0, 3).map((kw: string, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/50">
                    {kw.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[11px] font-bold text-primary flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="text-xs font-semibold leading-none">{authorName}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    {format(new Date(article.createdAt), 'dd MMM yyyy', { locale: idLocale })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.viewsCount}</div>
                <div className="flex items-center gap-0.5 text-primary font-semibold group-hover:gap-1 transition-all">
                  Baca <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function ArticleListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-articles', page, search],
    queryFn: async () => {
      const response = await api.get('/publication/articles', {
        params: { type: 'article', status: 'approved', page, limit: 9, search },
      });
      return response.data;
    },
  });

  return (
    <>
      <SEOHead
        title="Bacaan Pilihan - Artikel Ilmiah"
        description="Kumpulan artikel ilmiah dan kajian mendalam dari para penulis aktif Pondok Pesantren Modern Raudhatussalam Mahato tentang pendidikan Islam, bahasa Arab, fikih, dan akhlak."
        path="/artikel"
        keywords="artikel ilmiah pesantren, kajian Islam raudhatussalam, jurnal pendidikan Islam riau, artikel bahasa Arab pesantren"
      />

      {/* ── Header Khusus Artikel (beda dari Blog) ── */}
      <div className="border-b border-border/60 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="container mx-auto max-w-7xl px-4 py-6 md:py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <PenSquare className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Karya Penulis</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">Bacaan Pilihan</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Artikel ilmiah dan kajian mendalam dari para penulis aktif — asatidz, santri, dan alumni Raudhatussalam
              </p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary border border-border/60 rounded-full px-3 py-1">
                  <GraduationCap className="w-3 h-3 text-primary" />
                  <span>Artikel Ilmiah</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary border border-border/60 rounded-full px-3 py-1">
                  <User className="w-3 h-3 text-primary" />
                  <span>Penulis Terverifikasi</span>
                </div>
              </div>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari artikel..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Perbedaan jelas dari Blog: tidak ada "tab berita/pengumuman", ini murni karya ilmiah */}
      <SectionWrapper>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>Gagal memuat artikel. Silakan coba lagi.</p>
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>Belum ada artikel yang ditemukan.</p>
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
              <p className="text-sm text-muted-foreground">
                Menampilkan <span className="font-semibold text-foreground">{data.data.length}</span> artikel
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span>Direview oleh tim editorial pesantren</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.data.map((article: any, i: number) => (
                <ArticleCard key={article.id} article={article} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {data?.pagination?.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  &larr; Sebelumnya
                </button>
                <span className="flex items-center px-4 text-sm font-medium">
                  {page} / {data.pagination.totalPages}
                </span>
                <button
                  disabled={page === data.pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  Berikutnya <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* CTA untuk penulis */}
            <div className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/15 text-center">
              <PenSquare className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-base mb-1">Ingin Berbagi Tulisan?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Daftarkan diri sebagai penulis aktif dan bagikan karya ilmiah Anda kepada komunitas pesantren.
              </p>
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                Mulai Menulis <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </SectionWrapper>
    </>
  );
}
