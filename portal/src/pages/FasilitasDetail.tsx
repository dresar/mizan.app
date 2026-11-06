import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, Info } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import SectionWrapper from '@/components/shared/SectionWrapper';
import { usePublicData } from '@/hooks/use-public-data';
import { slugify } from '@/lib/utils';
interface Fasilitas {
  id: number;
  nama: string;
  icon: string;
  gambar?: string;
}
const FasilitasDetail = () => {
  const { slug } = useParams();
  const { data: facilities, isLoading, error } = usePublicData<Fasilitas[]>(['fasilitas'], '/core/fasilitas');
  const facility = facilities?.find((f) => slugify(f.nama) === slug);
  if (isLoading) {
     return (
       <SectionWrapper>
        <div className="max-w-3xl mx-auto h-96 bg-muted animate-pulse rounded-xl" />
      </SectionWrapper>
    );
  }
  if (error || (!isLoading && !facility)) {
    return (
      <SectionWrapper>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Fasilitas tidak ditemukan</h2>
          <Link to="/fasilitas" className="text-primary hover:underline">Kembali</Link>
        </div>
      </SectionWrapper>
    );
  }
  if (!facility) return null;
  const Icon = LucideIcons[facility.icon] || LucideIcons.Info;
  return (
    <>
      <PageHeader title={facility.nama} subtitle={`Detail fasilitas ${facility.nama}`} breadcrumbs={[{ label: 'Fasilitas', href: '/fasilitas' }, { label: facility.nama }]} />
      <SectionWrapper>
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
             <div className="aspect-video bg-muted relative">
               {facility.gambar ? (
                 <img src={facility.gambar} alt={facility.nama} className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <Icon className="w-24 h-24 text-muted-foreground/20" />
                  </div>
               )}
             </div>
            <div className="p-6 md:p-8">
              <h3 className="text-lg font-semibold mb-4">Fitur Unggulan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {['Kondisi Baik & Terawat', 'Mendukung Pembelajaran', 'Sesuai Standar', 'Akses Mudah'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg bg-secondary">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fasilitas {facility.nama} ini disediakan untuk menunjang kegiatan santri di pondok pesantren. 
                Kami terus berupaya meningkatkan kualitas fasilitas untuk mendukung kenyamanan dan efektivitas pembelajaran santri.
              </p>
            </div>
          </motion.div>
          <Link to="/fasilitas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mt-6">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
        </div>
      </SectionWrapper>
    </>
  );
};
export default FasilitasDetail;