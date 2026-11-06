import { motion } from 'framer-motion';
import { Eye, Target } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import SectionWrapper from '@/components/shared/SectionWrapper';
import { usePublicData } from '@/hooks/use-public-data';
import SEOHead from '@/components/SEOHead';
interface VisiMisiData {
  visi: string;
  misi: string;
}
const VisiMisi = () => {
  const { data: visiMisi, isLoading } = usePublicData<VisiMisiData>(['visi-misi'], '/core/visi-misi');
  const misiList = visiMisi?.misi ? visiMisi.misi.split('\n').filter(Boolean) : [];
  return (
    <>
      <SEOHead
        title="Visi & Misi"
        description="Visi dan Misi Pondok Pesantren Modern Raudhatussalam Mahato: menjadi pesantren unggulan yang melahirkan generasi Muslim rabbani, berilmu, dan berakhlak mulia."
        path="/profil/visi-misi"
        keywords="visi misi pesantren raudhatussalam, tujuan pendidikan pesantren mahato, panca jiwa pesantren gontor riau"
      />
      <PageHeader
        title="Visi & Misi"
        subtitle="Fondasi dan arah langkah pesantren kami."
        breadcrumbs={[{ label: 'Profil', href: '/profil' }, { label: 'Visi & Misi' }]}
      />
      <SectionWrapper>
        <div className="max-w-4xl mx-auto space-y-16">
          {}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
              <Eye className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Visi</h2>
            {isLoading ? (
              <div className="h-20 bg-muted animate-pulse rounded-lg max-w-2xl mx-auto" />
            ) : (
              <p className="text-xl md:text-2xl font-arabic text-primary leading-relaxed">
                "{visiMisi?.visi || 'Belum ada visi.'}"
              </p>
            )}
          </motion.div>
          {}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Misi</h2>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                 [1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)
              ) : (
                misiList.length > 0 ? misiList.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 p-4 glass-card"
                  >
                    <span className="w-7 h-7 shrink-0 rounded-md gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">{i + 1}</span>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{item}</p>
                  </motion.div>
                )) : (
                  <p className="text-muted-foreground">Belum ada misi.</p>
                )
              )}
            </div>
          </motion.div>
        </div>
      </SectionWrapper>
    </>
  );
};
export default VisiMisi;