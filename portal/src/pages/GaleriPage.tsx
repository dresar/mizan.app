import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import SectionWrapper from '@/components/shared/SectionWrapper';
import { usePublicData } from '@/hooks/use-public-data';
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
const GaleriPage = () => {
  const { data: galleryItems, isLoading, error } = usePublicData<DokumentasiItem[]>(['dokumentasi'], '/core/dokumentasi');
  const [selectedItem, setSelectedItem] = useState<DokumentasiItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const openLightbox = (item: DokumentasiItem) => {
    if (item.images && item.images.length > 0) {
      setSelectedItem(item);
      setCurrentImageIndex(0);
    }
  };
  const closeLightbox = () => {
    setSelectedItem(null);
    setCurrentImageIndex(0);
  };
  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedItem) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedItem.images.length);
    }
  };
  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedItem) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedItem.images.length) % selectedItem.images.length);
    }
  };
  if (isLoading) {
    return (
       <>
        <PageHeader title="Galeri Dokumentasi" subtitle="Momen-momen berkesan dari kehidupan di pesantren." breadcrumbs={[{ label: 'Galeri' }]} />
        <SectionWrapper>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3, 4, 5, 6].map((i) => (
               <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
             ))}
          </div>
        </SectionWrapper>
      </>
    );
  }
  if (error) {
     return (
      <SectionWrapper>
        <div className="text-center text-destructive">Failed to load gallery.</div>
      </SectionWrapper>
    );
  }
  return (
    <>
      <PageHeader title="Galeri Dokumentasi" subtitle="Momen-momen berkesan dari kehidupan di pesantren." breadcrumbs={[{ label: 'Galeri' }]} />
      <SectionWrapper>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems?.map((item, i) => (
            <Link key={item.id} to={`/galeri/${item.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group cursor-pointer hover-lift"
              >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-muted">
                {item.images && item.images.length > 0 ? (
                  <img 
                    src={item.images[0].gambar} 
                    alt={item.judul} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary">
                     <ImageIcon className="w-8 h-8 opacity-50" />
                   </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  {item.images?.length || 0}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.tanggalKegiatan ? new Date(item.tanggalKegiatan).toLocaleDateString('id-ID') : '-'}
                  </span>
                  {item.lokasi && (
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.lokasi}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">{item.judul}</h3>
                {item.deskripsi && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.deskripsi}</p>}
              </div>
            </motion.div>
          </Link>
        ))}
        </div>
        {(!galleryItems || galleryItems.length === 0) && (
          <div className="text-center py-10 text-muted-foreground">
            Belum ada dokumentasi.
          </div>
        )}
      </SectionWrapper>
      {}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button 
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
              <div className="relative w-full flex-1 flex items-center justify-center mb-4">
                {selectedItem.images.length > 1 && (
                  <button 
                    onClick={prevImage}
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm -ml-2 md:-ml-12"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                <img 
                  src={selectedItem.images[currentImageIndex].gambar} 
                  alt={selectedItem.judul} 
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                />
                {selectedItem.images.length > 1 && (
                  <button 
                    onClick={nextImage}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm -mr-2 md:-mr-12"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>
              <div className="text-center text-white">
                <h3 className="text-xl font-semibold mb-1">{selectedItem.judul}</h3>
                <p className="text-sm text-white/70">
                  {currentImageIndex + 1} / {selectedItem.images.length}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default GaleriPage;