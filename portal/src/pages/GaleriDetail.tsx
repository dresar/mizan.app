import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, MapPin, ImageIcon, 
  ChevronLeft, ChevronRight, X, Maximize2 
} from 'lucide-react';
import { useState, useMemo } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import SectionWrapper from '@/components/shared/SectionWrapper';
import { usePublicData } from '@/hooks/use-public-data';
import { Button } from '@/components/ui/button';

interface DokumentasiImage {
  id: number;
  gambar: string;
  altText: string;
}

interface DokumentasiItem {
  id: number;
  judul: string;
  deskripsi: string;
  kategori: string;
  tanggalKegiatan: string;
  lokasi: string;
  images: DokumentasiImage[];
}

export default function GaleriDetail() {
  const { id } = useParams();
  const { data: item, isLoading, error } = usePublicData<DokumentasiItem>(
    ['dokumentasi', id || ''], 
    `/core/dokumentasi/${id}`,
    { enabled: !!id }
  );

  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const images = useMemo(() => item?.images || [], [item]);

  const handleNext = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  const handlePrev = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + images.length) % images.length);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Memuat..." breadcrumbs={[{ label: 'Galeri', href: '/galeri' }]} />
        <SectionWrapper>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          </div>
        </SectionWrapper>
      </div>
    );
  }

  if (error || !item) {
    return (
      <SectionWrapper>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Galeri tidak ditemukan</h2>
          <Button asChild variant="outline">
            <Link to="/galeri">Kembali ke Galeri</Link>
          </Button>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title={item.judul} 
        subtitle={item.kategori}
        breadcrumbs={[
          { label: 'Galeri', href: '/galeri' },
          { label: item.judul }
        ]} 
      />

      <SectionWrapper>
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8"
          >
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-4 text-sm text-primary font-semibold tracking-wide uppercase">
                <span className="bg-primary/10 px-3 py-1 rounded-full">{item.kategori}</span>
                <span className="flex items-center gap-1.5 text-muted-foreground normal-case font-medium">
                  <Calendar className="w-4 h-4" />
                  {new Date(item.tanggalKegiatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {item.deskripsi}
              </p>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 text-primary/60" />
                <span>{item.lokasi}</span>
              </div>
            </div>
            
            <Link to="/galeri">
              <Button variant="ghost" className="group">
                <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Kembali ke Galeri
              </Button>
            </Link>
          </motion.div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {images.map((img, index) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-muted cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
                onClick={() => setSelectedImage(index)}
              >
                <img 
                  src={img.gambar} 
                  alt={img.altText || item.judul}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {images.length === 0 && (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">Belum ada foto dalam album ini.</p>
            </div>
          )}
        </div>
      </SectionWrapper>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
          >
            <div className="absolute top-6 right-6 flex items-center gap-4">
              <span className="text-white/60 text-sm font-medium">
                {selectedImage + 1} / {images.length}
              </span>
              <button 
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div 
              className="relative w-full max-w-6xl max-h-screen px-4 flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              {images.length > 1 && (
                <>
                  <button 
                    className="absolute left-6 p-4 rounded-full bg-white/5 text-white hover:bg-white/10 transition-all active:scale-90"
                    onClick={handlePrev}
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button 
                    className="absolute right-6 p-4 rounded-full bg-white/5 text-white hover:bg-white/10 transition-all active:scale-90"
                    onClick={handleNext}
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}

              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={images[selectedImage].gambar}
                alt={images[selectedImage].altText || item.judul}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
