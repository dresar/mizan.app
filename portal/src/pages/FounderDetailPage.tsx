import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { GraduationCap, Trophy, BookOpen, ArrowLeft, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import SectionWrapper from '@/components/shared/SectionWrapper';
import { usePublicData } from '@/hooks/use-public-data';
import SEOHead, { SITE_URL } from '@/components/SEOHead';

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

/* Accordion section component */
const AccordionSection = ({
  title,
  icon,
  iconColor,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor}`}>
            {icon}
          </div>
          <span className="font-bold text-base">{title}</span>
        </div>
        {open
          ? <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          : <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        }
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* Render multiline text as bullet items */
const BulletList = ({ text }: { text: string }) => {
  const lines = text.split('\n').filter(l => l.trim());
  return (
    <div className="space-y-3 mt-1">
      {lines.map((line, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[9px] font-bold text-primary">{i + 1}</span>
          </div>
          <span className="text-sm text-muted-foreground leading-relaxed">{line.replace(/^•\s*/, '')}</span>
        </div>
      ))}
    </div>
  );
};

export default function FounderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: founders = [], isLoading } = usePublicData<Founder[]>(['founders'], '/core/founders');

  const founder = founders.find(f => String(f.id) === id);
  const fallbackSrc = founder
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(founder.namaLengkap)}&background=16a34a&color=fff&size=600&font-size=0.25`
    : '';

  if (isLoading) {
    return (
      <>
        <div className="h-80 bg-muted animate-pulse" />
        <SectionWrapper>
          <div className="space-y-4 max-w-2xl">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-muted animate-pulse rounded-2xl" />)}
          </div>
        </SectionWrapper>
      </>
    );
  }

  if (!founder) {
    return (
      <>
        <PageHeader
          title="Tokoh Tidak Ditemukan"
          subtitle="Data yang Anda cari tidak ada atau telah dihapus."
          breadcrumbs={[
            { label: 'Sejarah', href: '/sejarah' },
            { label: 'Pendiri & Pengasuh', href: '/profil/pendiri' },
            { label: 'Tidak Ditemukan' },
          ]}
        />
        <SectionWrapper>
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <Users className="w-16 h-16 text-muted-foreground/20" />
            <p className="text-muted-foreground">Data tidak ditemukan.</p>
            <Link to="/profil/pendiri" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mt-2">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Pendiri
            </Link>
          </div>
        </SectionWrapper>
      </>
    );
  }

  // Other founders for "Lihat Juga" section
  const others = founders.filter(f => f.id !== founder.id).slice(0, 3);

  return (
    <>
      <SEOHead
        title={`${founder.namaLengkap} — ${founder.jabatan}`}
        description={founder.profilSingkat || `Profil ${founder.namaLengkap}, ${founder.jabatan} Pondok Pesantren Modern Raudhatussalam Mahato, Rokan Hulu, Riau.`}
        path={`/profil/pendiri/${founder.id}`}
        image={founder.foto || undefined}
        ogType="profile"
        keywords={`${founder.namaLengkap}, ${founder.jabatan}, pesantren raudhatussalam, tokoh pesantren rokan hulu`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: founder.namaLengkap,
          jobTitle: founder.jabatan,
          image: founder.foto,
          description: founder.profilSingkat,
          worksFor: {
            '@type': 'EducationalOrganization',
            name: 'Pondok Pesantren Modern Raudhatussalam Mahato',
            url: SITE_URL,
          },
          url: `${SITE_URL}/profil/pendiri/${founder.id}`,
        }}
      />
      {/* ── Hero Section ── */}
      <div className="relative min-h-[55vh] md:min-h-[65vh] flex items-end overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={founder.foto || fallbackSrc}
            alt={founder.namaLengkap}
            className="w-full h-full object-cover object-top"
            onError={(e) => { e.currentTarget.src = fallbackSrc; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        </div>

        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <Link
            to="/profil/pendiri"
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </Link>
        </div>

        {/* Name + jabatan overlay */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8 pb-10 md:pb-14 text-white">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-xs font-semibold bg-primary/80 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
              {founder.jabatan}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-3">{founder.namaLengkap}</h1>
            {founder.pendidikanTerakhir && (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <GraduationCap className="w-4 h-4" />
                <span>Pendidikan Terakhir: <strong className="text-white/90">{founder.pendidikanTerakhir}</strong></span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <SectionWrapper>
        <div className="max-w-3xl mx-auto space-y-4">

          {/* Profil Singkat */}
          {founder.profilSingkat && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-primary/5 border border-primary/15 rounded-2xl p-5 md:p-6"
            >
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed italic">
                "{founder.profilSingkat}"
              </p>
            </motion.div>
          )}

          {/* Biografi Lengkap */}
          {founder.bioLengkap && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <AccordionSection
                title="Biografi"
                icon={<BookOpen className="w-4 h-4 text-blue-500" />}
                iconColor="bg-blue-500/10"
                defaultOpen={true}
              >
                <div className="space-y-4 mt-1">
                  {founder.bioLengkap.split('\n\n').filter(p => p.trim()).map((para, i) => (
                    <p key={i} className="text-sm md:text-base text-muted-foreground leading-relaxed">{para.trim()}</p>
                  ))}
                </div>
              </AccordionSection>
            </motion.div>
          )}

          {/* Riwayat Pendidikan */}
          {founder.riwayatPendidikan && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <AccordionSection
                title="Riwayat Pendidikan"
                icon={<GraduationCap className="w-4 h-4 text-orange-500" />}
                iconColor="bg-orange-500/10"
              >
                <BulletList text={founder.riwayatPendidikan} />
              </AccordionSection>
            </motion.div>
          )}

          {/* Prestasi & Kontribusi */}
          {founder.prestasi && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <AccordionSection
                title="Prestasi & Kontribusi"
                icon={<Trophy className="w-4 h-4 text-yellow-500" />}
                iconColor="bg-yellow-500/10"
                defaultOpen={true}
              >
                <BulletList text={founder.prestasi} />
              </AccordionSection>
            </motion.div>
          )}

          {/* Back button */}
          <div className="pt-4">
            <Link
              to="/profil/pendiri"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Lihat Semua Pendiri & Pengasuh
            </Link>
          </div>
        </div>
      </SectionWrapper>

      {/* ── Lihat Juga ── */}
      {others.length > 0 && (
        <SectionWrapper className="bg-secondary/20">
          <h2 className="text-xl font-bold mb-6">Tokoh Lainnya</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {others.map((other, i) => {
              const fb = `https://ui-avatars.com/api/?name=${encodeURIComponent(other.namaLengkap)}&background=16a34a&color=fff&size=400`;
              return (
                <motion.div
                  key={other.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/profil/pendiri/${other.id}`}
                    className="group relative block w-full rounded-xl overflow-hidden aspect-[3/4] shadow-md hover:shadow-xl transition-shadow duration-500"
                  >
                    <img
                      src={other.foto || fb}
                      alt={other.namaLengkap}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.src = fb; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <h3 className="font-bold text-xs md:text-sm leading-snug line-clamp-2">{other.namaLengkap}</h3>
                      <p className="text-[10px] md:text-xs text-white/70 mt-0.5">{other.jabatan}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </SectionWrapper>
      )}
    </>
  );
}
