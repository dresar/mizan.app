import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, FileText, Users, Eye, Download, Search, Calendar,
  GraduationCap, Building2, ArrowRight, ChevronRight, Award,
  Tag, Layers, BookMarked, PenSquare, Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import SectionWrapper from '@/components/shared/SectionWrapper';
import SEOHead, { SITE_URL } from '@/components/SEOHead';

const TABS = [
  { id: 'semua', label: 'Semua', icon: Layers },
  { id: 'article', label: 'Artikel', icon: BookOpen },
  { id: 'journal', label: 'Jurnal Ilmiah', icon: BookMarked },
];

// ─── Publication Card ────────────────────────────────
function PublicationCard({ item, index }: { item: any; index: number }) {
  const authorName = [item.author?.firstName, item.author?.lastName].filter(Boolean).join(' ') || 'Penulis';
  const initials = authorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const href = item.type === 'journal' ? `/jurnal/${item.slug}` : `/artikel/${item.slug}`;
  const keywords = item.keywords ? item.keywords.split(',').slice(0, 3).map((k: string) => k.trim()) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="h-full"
    >
      <Link to={href} className="block group h-full">
        <div className="h-full glass-card border border-border/40 rounded-xl overflow-hidden hover-lift flex flex-col">
          {/* Top accent */}
          <div className={`h-1 ${item.type === 'journal' ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 'bg-gradient-to-r from-primary to-primary/40'}`} />

          {/* Cover image */}
          {item.featuredImage && (
            <div className="aspect-[16/6] overflow-hidden">
              <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
            </div>
          )}

          <div className="p-4 flex flex-col flex-1">
            {/* Type + Category badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${item.type === 'journal' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                {item.type === 'journal' ? 'Jurnal' : 'Artikel'}
              </span>
              {item.category && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border/50">
                  {item.category.name}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-bold text-sm leading-snug line-clamp-3 group-hover:text-primary transition-colors flex-1 mb-3">
              {item.title}
            </h3>

            {/* Excerpt */}
            {item.excerpt && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.excerpt}</p>
            )}

            {/* Keywords */}
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {keywords.map((kw: string, i: number) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/80 text-muted-foreground">
                    {kw}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="text-[11px] font-semibold leading-none">{authorName}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    {format(new Date(item.createdAt), 'MMM yyyy', { locale: idLocale })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Eye className="w-3 h-3" /> {item.viewsCount}
                {item.pdfFile && <Download className="w-3 h-3 text-primary" />}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Author Row ───────────────────────────────────────
function AuthorRow({ author, rank }: { author: any; rank: number }) {
  const name = [author.firstName, author.lastName].filter(Boolean).join(' ') || author.username;
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors group">
      <div className="text-2xl font-black text-primary/20 w-7 text-center flex-shrink-0">
        {rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : rank}
      </div>
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{name}</p>
        {author.profile?.institution && (
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <Building2 className="w-2.5 h-2.5 flex-shrink-0" />
            {author.profile.institution}
          </p>
        )}
        {author.profile?.expertise && (
          <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
            <GraduationCap className="w-2.5 h-2.5 flex-shrink-0" />
            {author.profile.expertise}
          </p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-primary">{author.count}</p>
        <p className="text-[10px] text-muted-foreground">karya</p>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────
export default function PublikasiPage() {
  const [activeTab, setActiveTab] = useState('semua');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['publikasi-all', activeTab, search, page],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit: 12, status: 'approved' };
      if (activeTab !== 'semua') params.type = activeTab;
      if (search) params.search = search;
      const res = await api.get('/publication/articles', { params });
      return res.data;
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['publikasi-stats'],
    queryFn: async () => {
      const [all, article, journal] = await Promise.all([
        api.get('/publication/articles?limit=1&status=approved'),
        api.get('/publication/articles?limit=1&status=approved&type=article'),
        api.get('/publication/articles?limit=1&status=approved&type=journal'),
      ]);
      return {
        total: all.data?.pagination?.total ?? 0,
        article: article.data?.pagination?.total ?? 0,
        journal: journal.data?.pagination?.total ?? 0,
      };
    },
  });

  // Derive author leaderboard from loaded articles
  const authorMap = new Map<number, any>();
  (data?.data || []).forEach((item: any) => {
    if (!item.author) return;
    const existing = authorMap.get(item.author.id);
    if (existing) {
      existing.count += 1;
    } else {
      authorMap.set(item.author.id, { ...item.author, count: 1 });
    }
  });
  const authors = Array.from(authorMap.values()).sort((a, b) => b.count - a.count);

  const publications = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <SEOHead
        title="Publikasi Ilmiah"
        description="Publikasi ilmiah, artikel, dan jurnal dari para penulis aktif Pondok Pesantren Modern Raudhatussalam Mahato. Transparan, terverifikasi, dan terbuka untuk publik."
        path="/publikasi"
        keywords="publikasi ilmiah pesantren, jurnal pendidikan islam riau, artikel ilmiah raudhatussalam, karya tulis santri pesantren"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ScholarlyArticle',
          name: 'Publikasi Ilmiah Raudhatussalam Mahato',
          publisher: {
            '@type': 'EducationalOrganization',
            name: 'Pondok Pesantren Modern Raudhatussalam Mahato',
            url: SITE_URL,
          },
        }}
      />

      {/* ── Header ── */}
      <div className="border-b border-border/60 bg-gradient-to-br from-amber-500/5 via-background to-background">
        <div className="container mx-auto max-w-7xl px-4 py-6 md:py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                  <BookMarked className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  Publikasi Ilmiah
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">Portal Publikasi</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Kumpulan karya ilmiah, artikel, dan jurnal dari para penulis aktif Raudhatussalam Mahato. Terbuka dan transparan untuk publik.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-3 mt-4">
                {[
                  { label: 'Total Publikasi', val: statsData?.total ?? '—', icon: Layers },
                  { label: 'Artikel', val: statsData?.article ?? '—', icon: BookOpen },
                  { label: 'Jurnal', val: statsData?.journal ?? '—', icon: BookMarked },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border/60 text-xs">
                    <s.icon className="w-3 h-3 text-amber-500" />
                    <span className="font-bold">{s.val}</span>
                    <span className="text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Tulis */}
            <div className="flex flex-col gap-2">
              <Link
                to="/publikasi/register"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm"
              >
                <PenSquare className="w-4 h-4" /> Daftar Sebagai Penulis
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm font-medium hover:bg-secondary/80 transition-colors text-center justify-center"
              >
                Login & Tulis Artikel
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 border-b border-border/60">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setPage(1); setSearch(''); }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${active ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
                >
                  <Icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <SectionWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* ── Main: publication grid ── */}
          <div className="lg:col-span-3">
            {/* Search + Filter bar */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari judul, kata kunci, penulis..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-secondary border border-border focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary border border-border text-xs text-muted-foreground">
                <Filter className="w-3.5 h-3.5" />
                {pagination?.total ?? 0} hasil
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)}
              </div>
            ) : publications.length === 0 ? (
              <div className="text-center py-20 bg-secondary/30 rounded-2xl border border-dashed border-border">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-20" />
                <h3 className="font-semibold mb-1">Belum Ada Publikasi</h3>
                <p className="text-sm text-muted-foreground mb-4">Data akan muncul setelah SQL seed dijalankan di Neon.</p>
                <Link to="/publikasi/register" className="text-sm text-amber-500 font-semibold hover:underline">
                  Daftar sebagai penulis pertama &rarr;
                </Link>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeTab}-${page}-${search}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {publications.map((item: any, i: number) => (
                      <PublicationCard key={item.id} item={item} index={i} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        &larr; Sebelumnya
                      </button>
                      <span className="text-sm font-medium px-3">
                        {page} / {pagination.totalPages}
                      </span>
                      <button
                        disabled={page === pagination.totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                      >
                        Berikutnya <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">

            {/* Penulis Aktif Leaderboard */}
            <div className="glass-card rounded-2xl border border-border/50 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold">Penulis Aktif</h3>
              </div>
              {authors.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-4">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  Belum ada penulis
                </div>
              ) : (
                <div className="space-y-1">
                  {authors.slice(0, 8).map((author, i) => (
                    <AuthorRow key={author.id} author={author} rank={i + 1} />
                  ))}
                </div>
              )}
              <Link
                to="/publikasi/register"
                className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline pt-3 border-t border-border/40"
              >
                <PenSquare className="w-3.5 h-3.5" /> Jadi Penulis
              </Link>
            </div>

            {/* Kategori Filter */}
            <div className="glass-card rounded-2xl border border-border/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-primary/60" />
                <h3 className="text-sm font-bold">Jenis Publikasi</h3>
              </div>
              <div className="space-y-1.5">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setPage(1); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === tab.id ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold' : 'hover:bg-secondary text-muted-foreground'}`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" /> {tab.label}
                      </div>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Panduan Publikasi */}
            <div className="glass-card rounded-2xl border border-amber-500/15 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold">Panduan Publikasi</h3>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {[
                  'Daftar sebagai penulis terverifikasi',
                  'Tulis artikel atau jurnal ilmiah',
                  'Kirim untuk direview tim editorial',
                  'Setelah disetujui, tampil di publik',
                  'Download PDF tersedia untuk jurnal',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
              <Link
                to="/publikasi/register"
                className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Mulai Sekarang <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
