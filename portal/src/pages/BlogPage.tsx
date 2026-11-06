import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Megaphone, Newspaper, AlertCircle, Tag, Eye, ChevronRight, Rss } from 'lucide-react';
import SectionWrapper from '@/components/shared/SectionWrapper';
import { usePublicData } from '@/hooks/use-public-data';
import { formatDate } from '@/lib/utils';
import SEOHead from '@/components/SEOHead';

interface Category { id: number; name: string; slug: string; }
interface BlogPost {
  id: number; title: string; slug: string; excerpt: string;
  featuredImage?: string; publishedAt: string; viewsCount: number;
  isFeatured: boolean; category: Category | null;
}
interface BlogResponse { data: BlogPost[]; meta: any; }
interface Announcement {
  id: number; judul: string; slug: string; konten: string;
  gambar?: string; isPenting: boolean; publishedAt: string;
}

const TABS = [
  { id: 'semua', label: 'Semua Berita', icon: Rss },
  { id: 'pengumuman', label: 'Pengumuman', icon: Megaphone },
];

const PostCard = ({ post, index, featured = false }: { post: BlogPost; index: number; featured?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04, duration: 0.35 }}
    className={featured ? 'md:col-span-2' : ''}
  >
    <Link to={`/blog/${post.slug}`} className="block group h-full">
      <div className={`glass-card rounded-xl overflow-hidden hover-lift h-full flex ${featured ? 'flex-col md:flex-row' : 'flex-col'} border border-border/40`}>
        <div className={`relative bg-muted overflow-hidden flex-shrink-0 ${featured ? 'aspect-video md:aspect-auto md:w-1/2' : 'aspect-[16/9]'}`}>
          {post.featuredImage ? (
            <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/50">
              <Newspaper className="w-10 h-10 opacity-15" />
            </div>
          )}
          {post.category && (
            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wide rounded-md shadow">
              {post.category.name}
            </span>
          )}
          {post.isFeatured && (
            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded-md">
              Pilihan
            </span>
          )}
        </div>
        <div className={`p-4 flex flex-col flex-1 ${featured ? 'md:p-6' : ''}`}>
          <h3 className={`font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 ${featured ? 'text-lg md:text-xl' : 'text-base'}`}>
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed flex-1">{post.excerpt}</p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-1 text-primary font-semibold">
              <Eye className="w-3 h-3" /> <span>{post.viewsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

const AnnouncementCard = ({ item, index }: { item: Announcement; index: number }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
    <Link to={`/blog/${item.slug}`} className="block group">
      <div className={`glass-card rounded-xl p-4 border hover-lift flex gap-4 ${item.isPenting ? 'border-destructive/30 bg-destructive/5' : 'border-border/40'}`}>
        {item.gambar && (
          <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
            <img src={item.gambar} alt={item.judul} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {item.isPenting && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-destructive uppercase">
                <AlertCircle className="w-3 h-3" /> Penting
              </span>
            )}
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatDate(item.publishedAt)}
            </span>
          </div>
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{item.judul}</h3>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 group-hover:text-primary transition-colors" />
      </div>
    </Link>
  </motion.div>
);

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'semua';
  const [search, setSearch] = useState('');
  const { data: categories = [] } = usePublicData<Category[]>(['categories'], '/blog/categories');

  const postQueryString = useMemo(() => {
    const params = new URLSearchParams();
    params.append('status', 'published');
    if (search) params.append('search', search);
    return params.toString();
  }, [search, categories]);

  const { data: postsResponse, isLoading: loadingPosts } = usePublicData<BlogResponse>(
    ['posts', postQueryString],
    `/blog/posts?${postQueryString}`,
    { enabled: currentTab !== 'pengumuman' }
  );
  const { data: announcements = [], isLoading: loadingAnnouncements } = usePublicData<Announcement[]>(
    ['announcements'], '/blog/announcements',
    { enabled: currentTab === 'pengumuman' }
  );

  const posts = postsResponse?.data || [];
  const isLoading = currentTab === 'pengumuman' ? loadingAnnouncements : loadingPosts;
  const featuredPost = posts.find(p => p.isFeatured) || posts[0];
  const regularPosts = featuredPost ? posts.filter(p => p.id !== featuredPost.id) : posts;

  return (
    <>
      <SEOHead
        title="Berita & Informasi Pesantren"
        description="Berita terkini, pengumuman resmi, dan informasi terbaru dari Pondok Pesantren Modern Raudhatussalam Mahato."
        path="/blog"
        keywords="berita pesantren raudhatussalam, informasi pesantren mahato, pengumuman pesantren riau"
      />

      {/* ── Masthead / Header Blog ── */}
      <div className="border-b border-border/60 bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Newspaper className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Portal Berita</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">Berita & Informasi</h1>
              <p className="text-sm text-muted-foreground mt-1">Informasi terbaru dan terpercaya dari Raudhatussalam Mahato</p>
            </div>
            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari berita..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 mt-5 border-b border-border/60">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setSearchParams(tab.id === 'semua' ? {} : { tab: tab.id }); setSearch(''); }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
                >
                  <Icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <SectionWrapper>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-muted/50 animate-pulse rounded-xl" />)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={currentTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* Announcements */}
              {currentTab === 'pengumuman' && (
                announcements.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>Belum ada pengumuman.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-3xl mx-auto">
                    {announcements.map((item, i) => <AnnouncementCard key={item.id} item={item} index={i} />)}
                  </div>
                )
              )}

              {/* Posts Grid — Featured hero + 3-col grid */}
              {currentTab !== 'pengumuman' && (
                posts.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>Tidak ada berita yang ditemukan.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Hero featured + sidebar */}
                    {!search && featuredPost && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Featured big card */}
                        <div className="lg:col-span-2">
                          <PostCard post={featuredPost} index={0} featured />
                        </div>
                        {/* Side list — latest 3 */}
                        <div className="space-y-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Tag className="w-3 h-3" /> Terbaru
                          </p>
                          {regularPosts.slice(0, 3).map((p, i) => (
                            <Link key={p.id} to={`/blog/${p.slug}`} className="block group">
                              <div className="flex gap-3 p-2.5 rounded-lg hover:bg-secondary/60 transition-colors">
                                <div className="w-16 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                  {p.featuredImage
                                    ? <img src={p.featuredImage} alt={p.title} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center"><Newspaper className="w-4 h-4 opacity-20" /></div>
                                  }
                                </div>
                                <div>
                                  <p className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{p.title}</p>
                                  <p className="text-[10px] text-muted-foreground mt-1">{formatDate(p.publishedAt)}</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Regular grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(search ? posts : regularPosts.slice(3)).map((post, i) => (
                        <PostCard key={post.id} post={post} index={i} />
                      ))}
                    </div>
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </SectionWrapper>
    </>
  );
}