import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
};
const FasilitasPage = () => {
  const { data: facilities, isLoading, error } = usePublicData<Fasilitas[]>(['fasilitas'], '/core/fasilitas');
  if (isLoading) {
    return (
       <>
        <PageHeader
          title="Fasilitas"
          subtitle="Sarana dan prasarana modern yang mendukung proses pendidikan berkualitas."
          breadcrumbs={[{ label: 'Fasilitas' }]}
        />
        <SectionWrapper>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
             {[1, 2, 3].map((i) => (
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
        <div className="text-center text-destructive">Failed to load facilities.</div>
      </SectionWrapper>
    );
  }
  return (
    <>
      <PageHeader
        title="Fasilitas"
        subtitle="Sarana dan prasarana modern yang mendukung proses pendidikan berkualitas."
        breadcrumbs={[{ label: 'Fasilitas' }]}
      />
      <SectionWrapper>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {facilities?.map((f, i) => {
            const Icon = LucideIcons[f.icon] || LucideIcons.Landmark;
            const slug = slugify(f.nama);
            return (
              <motion.div key={f.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to={`/fasilitas/${slug}`} className="block group">
                  <div className="glass-card overflow-hidden hover-lift h-full">
                    <div className="aspect-video bg-muted relative">
                      {f.gambar ? (
                        <img src={f.gambar} alt={f.nama} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center bg-secondary">
                           <Icon className="w-12 h-12 text-muted-foreground/20" />
                         </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{f.nama}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        Fasilitas {f.nama} yang modern dan nyaman untuk mendukung kegiatan santri sehari-hari.
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </SectionWrapper>
    </>
  );
};
export default FasilitasPage;