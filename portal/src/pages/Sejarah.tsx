import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, X, Users, MapPin, BookOpen, Star, GraduationCap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import SectionWrapper, { SectionHeader } from '@/components/shared/SectionWrapper';
import { usePublicData } from '@/hooks/use-public-data';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface TimelineImage {
  id: number;
  gambar: string;
}
interface TimelineEvent {
  id: number;
  judul: string;
  deskripsi: string;
  order: number;
  images?: TimelineImage[];
}
interface WebsiteSettings {
  profilSingkat?: string;
  profilLengkap?: string;
  deskripsi?: string;
  gambarProfil?: string;
}
interface Founder {
  id: number;
  namaLengkap: string;
  jabatan: string;
  foto?: string;
  profilSingkat?: string;
  pendidikanTerakhir?: string;
}
interface VisiMisi {
  visi?: string;
  misi?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="col-span-full text-center py-12 text-muted-foreground">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
        <Star className="w-6 h-6 opacity-30" />
      </div>
      <p className="text-sm">{message}</p>
    </div>
  </div>
);

// Render text with newlines as separate paragraphs/items
const MultilineText = ({ text, className = '' }: { text: string; className?: string }) => {
  const lines = text.split('\n').filter(l => l.trim());
  return (
    <div className={`space-y-1.5 ${className}`}>
      {lines.map((line, i) => (
        <p key={i} className="leading-relaxed">{line}</p>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   FOUNDER CARD — Professional full-image card → links to detail page
═══════════════════════════════════════════════ */
const FounderCard = ({ founder, index }: { founder: Founder; index: number }) => {
  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(founder.namaLengkap)}&background=16a34a&color=fff&size=400&font-size=0.33`;
  return (
    <motion.div
      custom={index}
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
          {/* Hover hint */}
          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center">
            <span className="text-[11px] text-white/80 bg-primary/70 rounded-full px-3 py-0.5 backdrop-blur-sm flex items-center gap-1">
              Lihat Profil <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════
   FOUNDER DETAIL MODAL
═══════════════════════════════════════════════ */
const FounderModal = ({ founder, onClose }: { founder: Founder; onClose: () => void }) => {
  const [showFullBio, setShowFullBio] = useState(false);
  const [showPrestasi, setShowPrestasi] = useState(true);
  const [showRiwayat, setShowRiwayat] = useState(false);
  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(founder.namaLengkap)}&background=16a34a&color=fff&size=400`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="bg-background rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl overflow-hidden max-h-[92vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Hero — Photo + name */}
          <div className="relative h-52 sm:h-64 flex-shrink-0">
            <img
              src={founder.foto || fallbackSrc}
              alt={founder.namaLengkap}
              className="absolute inset-0 w-full h-full object-cover object-top"
              onError={(e) => { e.currentTarget.src = fallbackSrc; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors backdrop-blur-sm z-10"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Name overlay */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-[11px] font-semibold bg-primary/80 text-white px-2.5 py-0.5 rounded-full mb-2 inline-block backdrop-blur-sm">
                {founder.jabatan}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">{founder.namaLengkap}</h2>
              {founder.pendidikanTerakhir && (
                <p className="text-sm text-white/70 flex items-center gap-1 mt-1">
                  <GraduationCap className="w-3.5 h-3.5" /> Pendidikan Terakhir: {founder.pendidikanTerakhir}
                </p>
              )}
            </div>
          </div>

          {/* Modal scrollable body */}
          <div className="overflow-y-auto flex-1 p-5 space-y-5">

            {/* Profil Singkat */}
            {founder.profilSingkat && (
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{founder.profilSingkat}"</p>
              </div>
            )}

            {/* Biografi Lengkap */}
            {founder.bioLengkap && (
              <div>
                <button
                  className="flex items-center justify-between w-full text-left group"
                  onClick={() => setShowFullBio(!showFullBio)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <span className="font-bold text-sm">Biografi</span>
                  </div>
                  {showFullBio
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  }
                </button>
                <AnimatePresence>
                  {showFullBio && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        <MultilineText text={founder.bioLengkap} />
                      </div>
                    </motion.div>
                  )}
                  {!showFullBio && (
                    <p
                      className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3 cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => setShowFullBio(true)}
                    >
                      {founder.bioLengkap.split('\n')[0]}
                    </p>
                  )}
                </AnimatePresence>
                {!showFullBio && (
                  <button
                    onClick={() => setShowFullBio(true)}
                    className="text-xs text-primary mt-1 hover:underline"
                  >
                    Baca selengkapnya...
                  </button>
                )}
              </div>
            )}

            {/* Riwayat Pendidikan */}
            {founder.riwayatPendidikan && (
              <div className="border-t pt-4">
                <button
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => setShowRiwayat(!showRiwayat)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <GraduationCap className="w-3.5 h-3.5 text-orange-500" />
                    </div>
                    <span className="font-bold text-sm">Riwayat Pendidikan</span>
                  </div>
                  {showRiwayat
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  }
                </button>
                <AnimatePresence>
                  {showRiwayat && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-2">
                        {founder.riwayatPendidikan.split('\n').filter(l => l.trim()).map((item, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="leading-relaxed">{item.replace(/^•\s*/, '')}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Prestasi & Kontribusi */}
            {founder.prestasi && (
              <div className="border-t pt-4">
                <button
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => setShowPrestasi(!showPrestasi)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                    </div>
                    <span className="font-bold text-sm">Prestasi & Kontribusi</span>
                  </div>
                  {showPrestasi
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  }
                </button>
                <AnimatePresence>
                  {showPrestasi && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-2">
                        {founder.prestasi.split('\n').filter(l => l.trim()).map((item, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-sm">
                            <div className="w-5 h-5 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-[9px] font-bold text-yellow-600">{i + 1}</span>
                            </div>
                            <span className="text-muted-foreground leading-relaxed">{item.replace(/^•\s*/, '')}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
const Sejarah = () => {
  const { data: timeline = [], isLoading: isLoadingTimeline } = usePublicData<TimelineEvent[]>(['sejarah-timeline'], '/core/sejarah-timeline');
  const { data: settings, isLoading: isLoadingSettings } = usePublicData<WebsiteSettings>(['settings'], '/core/settings');
  const { data: founders = [], isLoading: isLoadingFounders } = usePublicData<Founder[]>(['founders'], '/core/founders');
  const { data: visiMisi, isLoading: isLoadingVisiMisi } = usePublicData<VisiMisi>(['visi-misi'], '/core/visi-misi');
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const deskripsiLengkap = settings?.profilLengkap || settings?.deskripsi || null;

  return (
    <>
      <SEOHead
        title="Sejarah Pesantren"
        description="Perjalanan panjang Pondok Pesantren Modern Raudhatussalam Mahato sejak 2008: berdiri, dibina Gontor, berkembang, dan terus mencetak generasi Islam terbaik di Rokan Hulu, Riau."
        path="/sejarah"
        keywords="sejarah pesantren raudhatussalam, profil pondok mahato, pendiri pesantren rokan hulu, timeline pesantren riau, visi misi pesantren gontor riau"
      />
      <PageHeader
        title="Sejarah Pesantren"
        subtitle="Perjalanan panjang membangun generasi emas Raudhatussalam Mahato."
        breadcrumbs={[{ label: 'Profil', href: '/profil' }, { label: 'Sejarah' }]}
      />

      {/* ═══ PROFIL LENGKAP ═══ */}
      <SectionWrapper>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="aspect-video rounded-2xl overflow-hidden shadow-xl border border-border bg-muted/20">
              {isLoadingSettings ? (
                <div className="w-full h-full animate-pulse bg-muted" />
              ) : settings?.gambarProfil ? (
                <img
                  src={settings.gambarProfil}
                  alt="Profil Pesantren"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1000'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                  <BookOpen className="w-16 h-16" />
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Profil Lengkap</h2>
            {isLoadingSettings ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-4 bg-muted animate-pulse rounded" />)}
              </div>
            ) : deskripsiLengkap ? (
              <div className="prose prose-lg text-muted-foreground">
                <p className="whitespace-pre-line leading-relaxed">{deskripsiLengkap}</p>
              </div>
            ) : (
              <p className="text-muted-foreground italic">Deskripsi lengkap belum tersedia.</p>
            )}
          </motion.div>
        </div>
      </SectionWrapper>

      {/* ═══ VISI & MISI ═══ */}
      {(!isLoadingVisiMisi && (visiMisi?.visi || visiMisi?.misi)) && (
        <SectionWrapper className="bg-primary/5">
          <SectionHeader badge="Arah" title="Visi & Misi" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {visiMisi?.visi && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-6"
              >
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3">Visi</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{visiMisi.visi}</p>
              </motion.div>
            )}
            {visiMisi?.misi && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3">Misi</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{visiMisi.misi}</p>
              </motion.div>
            )}
          </div>
        </SectionWrapper>
      )}

      {/* ═══ JEJAK LANGKAH KAMI ═══ */}
      <SectionWrapper className="bg-secondary/30">
        <SectionHeader badge="Timeline" title="Jejak Langkah Kami" subtitle="Tonggak-tonggak penting dalam perjalanan pesantren kami." />
        {isLoadingTimeline ? (
          <div className="max-w-3xl mx-auto space-y-8">
            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : timeline.length === 0 ? (
          <div className="max-w-3xl mx-auto">
            <EmptyState message="Data jejak langkah belum tersedia." />
          </div>
        ) : (
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />
            {timeline.map((event, i) => (
              <motion.div
                key={event.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                variants={fadeUp}
                className={`relative flex items-start gap-6 mb-8 md:mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full gradient-primary border-2 border-background -translate-x-1.5 mt-1.5 z-10" />
                <div className={`ml-10 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}>
                  <h3 className="text-lg font-semibold mt-1">{event.judul}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{event.deskripsi}</p>
                  {event.images && event.images.length > 0 && (
                    <div className={`mt-3 flex ${i % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                      <Button variant="outline" size="sm" className="gap-2 h-8 text-xs" onClick={() => setSelectedEvent(event)}>
                        <ImageIcon className="w-3.5 h-3.5" />
                        Lihat Foto ({event.images.length})
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* ═══ PARA PENDIRI & PENGASUH — 4 GRID, LINK KE HALAMAN DETAIL ═══ */}
      <SectionWrapper>
        <SectionHeader
          badge="Tokoh"
          title="Para Pendiri & Pengasuh"
          subtitle="Tokoh-tokoh yang berjasa merintis dan mengembangkan pesantren. Klik kartu untuk membaca profil lengkap."
        />
        {isLoadingFounders ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />)}
          </div>
        ) : founders.length === 0 ? (
          <EmptyState message="Data pendiri & pengasuh belum tersedia." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {founders.map((founder, i) => (
              <FounderCard key={founder.id} founder={founder} index={i} />
            ))}
          </div>
        )}
        <div className="text-center mt-6">
          <Link
            to="/profil/pendiri"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Lihat Semua Pendiri & Pengasuh <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </SectionWrapper>

      {/* ═══ TIMELINE IMAGE LIGHTBOX ═══ */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-2xl bg-black/95 border-white/10 p-0 text-white overflow-hidden">
          <div className="relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute right-4 top-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {selectedEvent?.images && (
              <div className="flex flex-col">
                <div className="p-6 pb-2">
                  <h3 className="text-xl font-bold">{selectedEvent.judul}</h3>
                  <p className="text-sm text-white/60 mt-1 line-clamp-2">{selectedEvent.deskripsi}</p>
                </div>
                <div className="p-6 pt-4 flex justify-center">
                  <Carousel className="w-full max-w-lg">
                    <CarouselContent>
                      {selectedEvent.images.map((img, index) => (
                        <CarouselItem key={index}>
                          <div className="aspect-video relative rounded-lg overflow-hidden bg-white/5 border border-white/10">
                            <img src={img.gambar} alt={`${selectedEvent.judul} - ${index + 1}`} className="w-full h-full object-contain" />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {selectedEvent.images.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2 bg-black/50 border-transparent text-white hover:bg-black/70 hover:text-white" />
                        <CarouselNext className="right-2 bg-black/50 border-transparent text-white hover:bg-black/70 hover:text-white" />
                      </>
                    )}
                  </Carousel>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default Sejarah;