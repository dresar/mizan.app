import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  ArrowLeft, Calendar, User, Eye, Download, BookOpen, Tag, Share2,
  Building2, GraduationCap, CheckCircle, Users, FileText, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { motion } from 'framer-motion';
import SectionWrapper from '@/components/shared/SectionWrapper';
import SEOHead, { SITE_URL } from '@/components/SEOHead';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ['public-article', slug],
    queryFn: async () => {
      const response = await api.get(`/publication/articles/${slug}`);
      return response.data.data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="h-56 bg-muted animate-pulse" />
        <div className="container max-w-4xl mx-auto px-4 py-10 space-y-6">
          <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-muted rounded animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-24 text-center">
        <BookOpen className="w-14 h-14 mx-auto mb-4 text-muted-foreground opacity-30" />
        <h2 className="text-2xl font-bold mb-2">Artikel Tidak Ditemukan</h2>
        <p className="text-muted-foreground mb-6">Artikel yang Anda cari tidak tersedia atau telah dihapus.</p>
        <button
          onClick={() => navigate('/artikel')}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Artikel
        </button>
      </div>
    );
  }

  const authorName = [article.author?.firstName, article.author?.lastName].filter(Boolean).join(' ') || 'Penulis';
  const initials = authorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const keywords = article.keywords ? article.keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [];

  const handleShare = async () => {
    const url = `${SITE_URL}/artikel/${article.slug}`;
    if (navigator.share) {
      await navigator.share({ title: article.title, text: article.excerpt, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link artikel disalin!');
    }
  };

  return (
    <>
      <SEOHead
        title={article.title}
        description={article.excerpt || article.title}
        path={`/artikel/${article.slug}`}
        image={article.featuredImage}
        ogType="article"
        keywords={article.keywords || ''}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.excerpt,
          image: article.featuredImage,
          datePublished: article.createdAt,
          dateModified: article.updatedAt,
          author: {
            '@type': 'Person',
            name: authorName,
          },
          publisher: {
            '@type': 'EducationalOrganization',
            name: 'Pondok Pesantren Modern Raudhatussalam Mahato',
            url: SITE_URL,
          },
          keywords: article.keywords,
        }}
      />

      {/* ── Hero Banner ── */}
      <div className="relative">
        {article.featuredImage ? (
          <div className="h-64 md:h-80 relative overflow-hidden">
            <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          </div>
        ) : (
          <div className="h-20 bg-gradient-to-br from-primary/10 via-background to-background" />
        )}
      </div>

      <SectionWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">

          {/* ── Main Content ── */}
          <div className="lg:col-span-3">
            {/* Back button */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
              <button
                onClick={() => navigate('/artikel')}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Kembali ke Bacaan Pilihan
              </button>
            </motion.div>

            {/* Category + type badge */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wide">
                <BookOpen className="w-3 h-3" />
                {article.type === 'journal' ? 'Jurnal Ilmiah' : 'Artikel'}
              </span>
              {article.category && (
                <span className="px-2.5 py-0.5 rounded-md bg-secondary text-xs font-medium text-muted-foreground border border-border/60">
                  {article.category.name}
                </span>
              )}
              {article.approvedAt && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium">
                  <CheckCircle className="w-3 h-3" /> Telah Direview
                </span>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-4"
            >
              {article.title}
            </motion.h1>

            {/* Excerpt */}
            {article.excerpt && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-base text-muted-foreground leading-relaxed border-l-4 border-primary/40 pl-4 mb-6 italic"
              >
                {article.excerpt}
              </motion.p>
            )}

            {/* Meta row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.12 }}
              className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-6 pb-6 border-b border-border/50"
            >
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(article.createdAt), 'dd MMMM yyyy', { locale: idLocale })}
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {article.viewsCount} kali dilihat
              </div>
              {article.collaboration && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Kolaborasi: {article.collaboration.title}
                </div>
              )}
              {article.volume && (
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  {article.volume.name} ({article.volume.year})
                </div>
              )}
            </motion.div>

            {/* Main content */}
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="prose prose-base dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-p:text-foreground/90 prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground
                prose-code:bg-secondary prose-code:px-1 prose-code:rounded
                prose-img:rounded-xl prose-img:shadow-md
              "
            >
              {article.content ? (
                <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }} />
              ) : (
                <p className="text-muted-foreground">Konten artikel belum tersedia.</p>
              )}
            </motion.article>

            {/* Keywords */}
            {keywords.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  {keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-secondary border border-border/60 text-xs text-muted-foreground">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* PDF Preview Area */}
            {article.pdfFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 pt-6 border-t border-border/50"
              >
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">Pratinjau Dokumen PDF</h3>
                </div>
                <div className="w-full aspect-[4/5] rounded-xl overflow-hidden border border-border shadow-inner bg-muted relative">
                  <iframe 
                    src={`${article.pdfFile}#toolbar=0`} 
                    className="w-full h-full border-0"
                    title="PDF Document Viewer"
                  />
                </div>
              </motion.div>
            )}

            {/* Action bar */}
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              {article.pdfFile && (
                <a
                  href={article.pdfFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" /> Unduh PDF
                </a>
              )}
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-sm font-semibold hover:bg-secondary/80 transition-colors"
              >
                <Share2 className="w-4 h-4" /> Bagikan
              </button>
              <Link
                to="/artikel"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Lihat Semua Artikel
              </Link>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">

            {/* Author Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="glass-card rounded-2xl border border-border/50 p-5"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Tentang Penulis
              </p>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-base font-bold text-primary flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-sm">{authorName}</p>
                  <p className="text-xs text-muted-foreground">@{article.author?.username}</p>
                </div>
              </div>

              {/* Author profile fields if available */}
              {article.author?.profile && (
                <div className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                  {article.author.profile.institution && (
                    <div className="flex items-start gap-2">
                      <Building2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/60" />
                      <span>{article.author.profile.institution}</span>
                    </div>
                  )}
                  {article.author.profile.expertise && (
                    <div className="flex items-start gap-2">
                      <GraduationCap className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/60" />
                      <span>{article.author.profile.expertise}</span>
                    </div>
                  )}
                  {article.author.profile.bio && (
                    <p className="text-xs leading-relaxed border-t border-border/50 pt-2.5 mt-2.5">
                      {article.author.profile.bio}
                    </p>
                  )}
                </div>
              )}

              {/* Fallback when no profile loaded */}
              {!article.author?.profile && article.author?.email && (
                <p className="text-xs text-muted-foreground mt-3">
                  Penulis aktif Raudhatussalam Mahato
                </p>
              )}
            </motion.div>

            {/* Article Info */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="glass-card rounded-2xl border border-border/50 p-5 space-y-3 text-sm"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Info Artikel
              </p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipe</span>
                <span className="font-medium">{article.type === 'journal' ? 'Jurnal Ilmiah' : 'Artikel'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-green-600 dark:text-green-400">{article.status === 'approved' ? 'Disetujui' : article.status}</span>
              </div>
              {article.category && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kategori</span>
                  <span className="font-medium">{article.category.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dipublikasikan</span>
                <span className="font-medium">{format(new Date(article.createdAt), 'dd MMM yyyy', { locale: idLocale })}</span>
              </div>
              {article.volume && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume</span>
                  <span className="font-medium">{article.volume.name}</span>
                </div>
              )}
              {article.pdfFile && (
                <div className="pt-2 border-t border-border/50">
                  <a
                    href={article.pdfFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary text-xs font-semibold hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Versi PDF
                  </a>
                </div>
              )}
            </motion.div>

            {/* Share box */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-card rounded-2xl border border-border/50 p-5"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" /> Bagikan Artikel
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleShare}
                  className="w-full py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5" /> Salin Link
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Baca artikel: ${article.title} - ${SITE_URL}/artikel/${article.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  Bagikan via WhatsApp
                </a>
              </div>
            </motion.div>

          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
