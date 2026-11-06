import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import SectionWrapper, { SectionHeader } from '@/components/shared/SectionWrapper';
import { usePublicData } from '@/hooks/use-public-data';
import SEOHead from '@/components/SEOHead';

interface Founder {
  id: number;
  namaLengkap: string;
  jabatan: string;
  foto?: string;
  profilSingkat?: string;
  pendidikanTerakhir?: string;
  bioLengkap?: string;
  riwayatPendidikan?: string;
  prestasi?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.45 } }),
};

const EmptyState = () => (
  <div className="col-span-full py-20 flex flex-col items-center gap-4 text-muted-foreground">
    <GraduationCap className="w-12 h-12 opacity-20" />
    <p className="text-sm">Data pendiri & pengasuh belum tersedia.</p>
  </div>
);

export default function FoundersPage() {
  const { data: founders = [], isLoading } = usePublicData<Founder[]>(['founders'], '/core/founders');

  return (
    <>
      <SEOHead
        title="Para Pendiri & Pengasuh"
        description="Mengenal para pendiri dan pengasuh Pondok Pesantren Modern Raudhatussalam Mahato: tokoh-tokoh ulama dan cendekiawan yang mendedikasikan hidupnya untuk pendidikan Islam di Riau."
        path="/profil/pendiri"
        keywords="pendiri pesantren raudhatussalam, pengasuh ponpes mahato, ulama rokan hulu, tokoh pendidikan islam riau"
      />
      <PageHeader
        title="Para Pendiri & Pengasuh"
        subtitle="Tokoh-tokoh mulia yang mendedikasikan hidupnya untuk membangun pesantren dan mencetak generasi rabbani."
        breadcrumbs={[
          { label: 'Profil', href: '/sejarah' },
          { label: 'Pendiri & Pengasuh' },
        ]}
      />

      <SectionWrapper>
        <SectionHeader
          badge="Tokoh"
          title="Mengenal Para Tokoh"
          subtitle="Klik kartu untuk membaca profil dan biografi lengkap setiap tokoh."
        />

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : founders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {founders.map((founder, i) => {
              const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(founder.namaLengkap)}&background=16a34a&color=fff&size=400&font-size=0.33`;
              return (
                <motion.div
                  key={founder.id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <Link
                    to={`/profil/pendiri/${founder.id}`}
                    className="group relative block w-full rounded-2xl overflow-hidden aspect-[3/4] shadow-lg hover:shadow-2xl transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {/* Full bleed photo */}
                    <img
                      src={founder.foto || fallbackSrc}
                      alt={founder.namaLengkap}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => { e.currentTarget.src = fallbackSrc; }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    {/* Info overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white text-left">
                      <div className="backdrop-blur-sm bg-black/20 rounded-xl p-2.5 md:p-3 border border-white/10">
                        <h3 className="font-bold text-xs md:text-sm leading-snug line-clamp-2">{founder.namaLengkap}</h3>
                        <p className="text-[10px] md:text-xs text-white/80 mt-0.5 font-medium line-clamp-1">{founder.jabatan}</p>
                        {founder.pendidikanTerakhir && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <GraduationCap className="w-3 h-3 text-white/50 flex-shrink-0" />
                            <span className="text-[10px] text-white/50">Pend. {founder.pendidikanTerakhir}</span>
                          </div>
                        )}
                      </div>
                      {/* Hover: lihat profil */}
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center">
                        <span className="text-[11px] text-white/80 bg-primary/70 rounded-full px-3 py-0.5 backdrop-blur-sm flex items-center gap-1">
                          Lihat Profil <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </SectionWrapper>
    </>
  );
}
