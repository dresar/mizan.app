import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, User, Calendar } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import SectionWrapper from '@/components/shared/SectionWrapper';
import { usePublicData } from '@/hooks/use-public-data';
import { formatDate } from '@/lib/utils';
interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  videoUrl?: string;
  gallery?: string[];
  publishedAt: string;
  category: { name: string } | null;
  author: { firstName: string; lastName: string; username: string } | null;
}
interface BlogResponse {
  data: BlogPost[];
}
const BlogDetail = () => {
  const { slug } = useParams();
  const { data: post, isLoading, error } = usePublicData<BlogPost>(['post', slug || ''], `/blog/posts/${slug}`, {
    enabled: !!slug
  });
  const { data: relatedResponse } = usePublicData<BlogResponse>(['posts', 'related'], '/blog/posts?limit=3&status=published');
  const related = relatedResponse?.data?.filter(p => p.id !== post?.id).slice(0, 2) || [];
  if (isLoading) {
     return (
       <SectionWrapper>
        <div className="max-w-3xl mx-auto h-96 bg-muted animate-pulse rounded-xl" />
      </SectionWrapper>
    );
  }
  if (error || (!isLoading && !post)) {
    return <SectionWrapper><div className="text-center py-20"><h2 className="text-2xl font-bold mb-4">Artikel tidak ditemukan</h2><Link to="/blog" className="text-primary hover:underline">Kembali</Link></div></SectionWrapper>;
  }
  if (!post) return null;
  const authorName = post.author ? `${post.author.firstName} ${post.author.lastName || ''}`.trim() : 'Admin';
  
  // Helper for YouTube ID
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const videoId = post.videoUrl ? getYoutubeId(post.videoUrl) : null;

  return (
    <>
      <PageHeader title={post.title} breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: post.title }]} />
      <SectionWrapper>
        <div className="max-w-3xl mx-auto">
          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
            {videoId ? (
                <div className="aspect-video bg-black relative">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${videoId}`} 
                        title={post.title} 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen 
                    />
                </div>
            ) : (
                <div className="aspect-video bg-muted relative">
                {post.featuredImage ? (
                    <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">No Image</div>
                )}
                </div>
            )}
            <div className="p-5 md:p-8">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-6">
                <span className="px-2.5 py-1 rounded bg-primary/10 text-primary font-medium">{post.category?.name || 'Uncategorized'}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(post.publishedAt)}</span>
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{authorName}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 5 menit</span>
              </div>
              <div className="prose prose-sm prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed font-medium">{post.excerpt}</p>
                <div className="text-muted-foreground leading-relaxed mt-4 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: post.content }} />
                
                {/* Gallery Section */}
                {post.gallery && post.gallery.length > 0 && (
                    <div className="mt-8 not-prose">
                        <h3 className="text-lg font-semibold mb-4">Galeri Foto</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {post.gallery.map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity">
                                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            </div>
          </motion.article>
          {}
          {related.length > 0 && (
            <div className="mt-12">
              <h3 className="text-lg font-semibold mb-4">Artikel Terkait</h3>
              <div className="grid grid-cols-2 gap-3">
                {related.map((r) => (
                  <Link key={r.id} to={`/blog/${r.slug}`} className="block group">
                    <div className="glass-card overflow-hidden hover-lift h-full">
                      <div className="aspect-[4/3] bg-muted relative">
                        {r.featuredImage ? (
                           <img src={r.featuredImage} alt={r.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-secondary" />
                        )}
                      </div>
                      <div className="p-3">
                        <span className="text-[10px] text-primary font-medium">{r.category?.name}</span>
                        <h4 className="text-sm font-semibold mt-1 line-clamp-2 group-hover:text-primary transition-colors">{r.title}</h4>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mt-6">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Blog
          </Link>
        </div>
      </SectionWrapper>
    </>
  );
};
export default BlogDetail;