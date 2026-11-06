import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { ChevronLeft, ChevronRight, X, Clock, Calendar, CheckCircle2, LayoutGrid, Info } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import SectionWrapper from '@/components/shared/SectionWrapper';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EkstrakurikulerImage {
  id: number;
  gambar: string;
  altText: string;
}

interface Ekstrakurikuler {
  id: number;
  nama: string;
  icon: string;
  gambar?: string;
  images?: EkstrakurikulerImage[];
  deskripsi?: string;
}

const EkstrakurikulerPage = () => {
  const [page, setPage] = useState(1);
  const [selectedExtra, setSelectedExtra] = useState<Ekstrakurikuler | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['ekstrakurikuler-public', page],
    queryFn: async () => {
      const res = await api.get(`/core/ekstrakurikuler?page=${page}&limit=20`);
      return res.data;
    }
  });

  const extracurriculars = data?.data || [];
  const pagination = data?.pagination;

  // Auto-slide logic
  useEffect(() => {
    if (!selectedExtra || !selectedExtra.images || selectedExtra.images.length <= 1) return;
    
    const allImages = [
        ...(selectedExtra.gambar ? [{ id: 0, gambar: selectedExtra.gambar, altText: selectedExtra.nama }] : []),
        ...(selectedExtra.images || [])
    ];

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % allImages.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [selectedExtra]);

  if (isLoading) {
    return (
       <>
        <PageHeader title="Ekstrakurikuler" subtitle="Pengembangan bakat dan minat santri melalui beragam kegiatan." breadcrumbs={[{ label: 'Kehidupan Santri' }, { label: 'Ekstrakurikuler' }]} />
        <SectionWrapper>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
               <div key={i} className="h-64 glass-card animate-pulse rounded-2xl border border-border/40" />
             ))}
          </div>
        </SectionWrapper>
      </>
    );
  }

  const allModalImages = selectedExtra ? [
    ...(selectedExtra.gambar ? [{ id: -1, gambar: selectedExtra.gambar, altText: selectedExtra.nama }] : []),
    ...(selectedExtra.images || [])
  ] : [];

  return (
    <>
      <PageHeader 
        title="Ekstrakurikuler" 
        subtitle="Membangun karakter dan menggali potensi santri melalui kawah candradimuka berbagai bidang." 
        breadcrumbs={[{ label: 'Kehidupan Santri' }, { label: 'Ekstrakurikuler' }]} 
      />
      
      <SectionWrapper>
        <div className="flex flex-col gap-10">
            {/* Grid Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {extracurriculars.map((e: Ekstrakurikuler, i: number) => {
                    const Icon = (LucideIcons as any)[e.icon] || LucideIcons.Compass;
                    return (
                        <motion.div
                            key={e.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => {
                                setSelectedExtra(e);
                                setCurrentSlide(0);
                            }}
                            className="group cursor-pointer"
                        >
                            <div className="h-full glass-card border border-border/40 rounded-2xl overflow-hidden hover-lift flex flex-col relative">
                                {/* Header / Icon area */}
                                <div className="p-6 pb-0 flex justify-between items-start relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/20 text-[10px] py-0 px-2">
                                        EXTRA
                                    </Badge>
                                </div>

                                <div className="p-6 pt-4 flex flex-col flex-1 relative z-10">
                                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{e.nama}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                        {e.deskripsi || `Program pengembangan bakat ${e.nama} yang dirancang untuk mengasah ketajaman berpikir dan kreativitas santri di lingkungan pesantren.`}
                                    </p>
                                    
                                    <div className="mt-auto flex items-center gap-2 text-primary font-semibold text-xs opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                                        Lihat Detail <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Background Accent */}
                                {e.gambar && (
                                    <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 scale-150 group-hover:scale-[1.6]">
                                        <img src={e.gambar} alt="" className="w-40 h-40 object-cover rounded-full" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-8 border-t border-border/40">
                    <Button
                        variant="ghost"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-xl"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Sebelumnya
                    </Button>
                    <div className="flex gap-2">
                        {Array.from({ length: pagination.totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${page === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-secondary hover:bg-secondary/80'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="rounded-xl"
                    >
                        Selanjutnya <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            )}
        </div>
      </SectionWrapper>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedExtra && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
                onClick={() => setSelectedExtra(null)}
            >
                <motion.div 
                    initial={{ opacity: 0, y: 100, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.9 }}
                    className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-border/40 shadow-2xl flex flex-col md:flex-row"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Media section (Slider) */}
                    <div className="w-full md:w-1/2 aspect-square md:aspect-auto h-[300px] md:h-auto bg-black relative group/slider">
                        <AnimatePresence mode="wait">
                            <motion.img 
                                key={currentSlide}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                src={allModalImages[currentSlide]?.gambar || selectedExtra.gambar}
                                className="w-full h-full object-cover"
                            />
                        </AnimatePresence>
                        
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                        {/* Navigation Arrows */}
                        {allModalImages.length > 1 && (
                            <>
                                <button 
                                    onClick={() => setCurrentSlide(p => (p - 1 + allModalImages.length) % allModalImages.length)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all opacity-0 group-hover/slider:opacity-100"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setCurrentSlide(p => (p + 1) % allModalImages.length)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all opacity-0 group-hover/slider:opacity-100"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}
                        
                        {/* Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
                            {allModalImages.map((_, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setCurrentSlide(i)}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentSlide ? 'bg-primary w-4' : 'bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Content section */}
                    <div className="flex-1 p-8 md:p-10 overflow-y-auto relative bg-background/50">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-4 top-4 rounded-full h-10 w-10 hover:bg-destructive/10 hover:text-destructive transition-all"
                            onClick={() => setSelectedExtra(null)}
                        >
                            <X className="w-5 h-5" />
                        </Button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                {(() => {
                                    const Icon = (LucideIcons as any)[selectedExtra.icon] || LucideIcons.Compass;
                                    return <Icon className="w-6 h-6" />;
                                })()}
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Ekstrakurikuler</span>
                                <h2 className="text-3xl font-black leading-tight">{selectedExtra.nama}</h2>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 rounded-2xl bg-secondary/50 border border-border/40">
                                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                                    <Info className="w-3.5 h-3.5 text-primary" /> Deskripsi Kegiatan
                                </h4>
                                <p className="text-sm leading-relaxed text-foreground/80">
                                    {selectedExtra.deskripsi || `${selectedExtra.nama} merupakan salah satu program unggulan di Pondok Pesantren yang berfokus pada pembentukan karakter, kedisiplinan, dan pengembangan kreativitas santri. Melalui bimbingan para pelatih profesional, santri diajak untuk mengeksplorasi minat mereka secara mendalam.`}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Waktu</p>
                                        <p className="text-xs font-semibold">Setiap Sore</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Jadwal</p>
                                        <p className="text-xs font-semibold">Tersedia Harian</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border/40">
                                <Button className="w-full rounded-2xl h-12 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Gabung Sekarang
                                </Button>
                                <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-tighter">
                                    Hubungi Bagian Pengasuhan untuk Pendaftaran
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EkstrakurikulerPage;