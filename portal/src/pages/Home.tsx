import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Users, GraduationCap, Award, Calendar, BookOpen, Star, ChevronRight, Quote, ChevronLeft, X, ChevronLeft as Prev, ChevronRight as Next } from 'lucide-react';
import heroImage from '@/assets/hero-pesantren.jpg';
import SectionWrapper, { SectionHeader } from '@/components/shared/SectionWrapper';
import { usePublicData } from '@/hooks/use-public-data';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import SEOHead, { SITE_URL } from '@/components/SEOHead';
interface WebsiteSettings {
  heroTagline?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaPrimaryText?: string;
  heroCtaPrimaryLink?: string;
  heroCtaSecondaryText?: string;
  heroCtaSecondaryLink?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaPrimaryText?: string;
  ctaPrimaryLink?: string;
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;
  announcementText?: string;
  announcementLink?: string;
  announcementActive?: boolean;
  deskripsi?: string;
  profilSingkat?: string;
  gambarProfil?: string;
  noTelepon?: string;
  email?: string;
}
interface HeroSection {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  order: number;
  isActive: boolean;
}
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};
const iconMap: Record<string, React.ElementType> = { Users, GraduationCap, Award, Calendar };
const HighlightTitle = ({ text }: { text: string }) => {
  if (!text) return null;
  const shouldSplitByComma = text.includes(',');
  if (shouldSplitByComma) {
    const parts = text.split(',');
    return (
      <>
        {parts[0]}, 
        <span className="text-primary block sm:inline">{parts.slice(1).join(',')}</span>
      </>
    );
  }
  const words = text.split(' ');
  if (words.length > 3) {
    const splitIndex = Math.ceil(words.length * 0.6); 
    return (
      <>
        {words.slice(0, splitIndex).join(' ')}{' '}
        <span className="text-primary">{words.slice(splitIndex).join(' ')}</span>
      </>
    );
  }
  if (words.length > 1) {
     return (
      <>
        {words.slice(0, -1).join(' ')}{' '}
        <span className="text-primary">{words[words.length - 1]}</span>
      </>
    );
  }
  return <>{text}</>;
};
const Home = () => {
  const { data: settings, isLoading: isLoadingSettings, error: settingsError } = usePublicData<WebsiteSettings>(['settings'], '/core/settings');
  const { data: heroSlides = [], isLoading: isLoadingHero, error: heroError } = usePublicData<HeroSection[]>(['heroSections'], '/core/hero', {
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: false,
  });
  const { data: programs = [] } = usePublicData<any[]>(['programs'], '/core/programs');
  const { data: educationPrograms = [] } = usePublicData<any[]>(['education-programs'], '/core/program-pendidikan');
  const { data: statistics = [] } = usePublicData<any[]>(['statistics'], '/core/statistik');
  const { data: testimonials = [] } = usePublicData<any[]>(['testimonials'], '/blog/testimonials');
  const { data: blogData } = usePublicData<any>(['latest-posts'], '/blog/posts?limit=8');
  const isMobile = useIsMobile();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [testimonialSlides, setTestimonialSlides] = useState<any[]>([]);
  // Program modal state
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [modalImgIndex, setModalImgIndex] = useState(0);
  const modalSlideTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const openProgramModal = useCallback((prog: any) => {
    setSelectedProgram(prog);
    setModalImgIndex(0);
  }, []);
  const closeProgramModal = useCallback(() => {
    setSelectedProgram(null);
    setModalImgIndex(0);
    if (modalSlideTimer.current) clearInterval(modalSlideTimer.current);
  }, []);
  // Auto-slide images in modal
  useEffect(() => {
    if (!selectedProgram) return;
    const imgs = selectedProgram.images || (selectedProgram.gambar ? [{ gambar: selectedProgram.gambar }] : []);
    if (imgs.length <= 1) return;
    modalSlideTimer.current = setInterval(() => {
      setModalImgIndex(prev => (prev + 1) % imgs.length);
    }, 3000);
    return () => { if (modalSlideTimer.current) clearInterval(modalSlideTimer.current); };
  }, [selectedProgram]);
  useEffect(() => {
    if (testimonials.length > 0) {
      const slides = testimonials.map((t, i) => ({ ...t, index: i }));
      setTestimonialSlides(slides);
    }
  }, [testimonials]);
  useEffect(() => {
    if (testimonialSlides.length <= 1) return; 
    const visibleCount = isMobile ? 1 : 3;
    if (testimonialSlides.length <= visibleCount) return;
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonialSlides.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [testimonialSlides.length, isMobile]);
  const nextTestimonial = () => setCurrentTestimonial((prev) => (prev + 1) % testimonialSlides.length);
  const prevTestimonial = () => setCurrentTestimonial((prev) => (prev - 1 + testimonialSlides.length) % testimonialSlides.length);
  const activeSlides = heroSlides.filter(s => s.isActive).sort((a, b) => a.order - b.order);
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [activeSlides.length]);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  const blogPosts = blogData?.data || [];
  return (
    <>
      {/* ═══ HERO SECTION — renders instantly, data populates silently ═══ */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center -mt-16 md:-mt-18 overflow-hidden">
        {/* Background — static asset loads immediately as LCP element */}
        <div className="absolute inset-0">
          {activeSlides.length > 0 ? (
            <AnimatePresence>
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                {/* Pillar 4: fetchpriority=high + eager — this IS the LCP element */}
                <img 
                  src={activeSlides[currentSlide].image || heroImage} 
                  alt={activeSlides[currentSlide].title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchpriority="high"
                  width={1920}
                  height={1080}
                  onError={(e) => { e.currentTarget.src = heroImage; }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-transparent/20" />
              </motion.div>
            </AnimatePresence>
          ) : isLoadingHero ? (
            // Loading state
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
               <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            // Loaded but no active slides in DB — fallback
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-transparent/20" />
            </>
          )}
        </div>
        {}
        <div className="relative container mx-auto max-w-7xl px-4 py-20 md:py-32 z-10">
          <div className="max-w-3xl mx-auto md:mx-0 text-center md:text-left">
            {settings?.announcementActive && settings?.announcementText && (
               <motion.div 
                 initial={{ opacity: 0, y: -10 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 transition={{ delay: 0.2 }}
               >
                 <Link to={settings.announcementLink || '#'}>
                  <span className="inline-block mb-6 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-sm">
                    {settings.announcementText}
                  </span>
                 </Link>
               </motion.div>
            )}
                {/* Title — shows loading skeleton, then API data */ }
                <AnimatePresence mode="wait">
                  {isLoadingHero || isLoadingSettings ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="animate-pulse"
                    >
                      <div className="h-12 sm:h-16 md:h-20 bg-white/20 rounded-lg w-3/4 mb-6 mx-auto md:mx-0"></div>
                      <div className="h-4 sm:h-5 bg-white/20 rounded w-full mb-3 mx-auto md:mx-0"></div>
                      <div className="h-4 sm:h-5 bg-white/20 rounded w-5/6 mb-8 mx-auto md:mx-0"></div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={activeSlides.length > 0 ? currentSlide : 'static'}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 drop-shadow-sm text-white">
                         <HighlightTitle text={
                           activeSlides.length > 0
                             ? activeSlides[currentSlide].title
                             : (settings?.heroTitle || 'Mencetak Pemimpin Umat Masa Depan')
                         } />
                      </h1>
                      <p className="text-base md:text-lg text-white/90 leading-relaxed mb-8 max-w-lg mx-auto md:mx-0 drop-shadow-sm">
                        {
                          activeSlides.length > 0
                            ? activeSlides[currentSlide].subtitle
                            : (settings?.heroSubtitle || 'Pondok Pesantren Modern Raudhatussalam Mahato — memadukan ilmu agama dan pengetahuan umum untuk generasi unggul berakhlak mulia.')
                        }
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 items-center justify-center md:justify-start"
            >
              {isLoadingHero || isLoadingSettings ? (
                <>
                  <div className="h-12 w-full sm:w-40 bg-white/20 rounded-xl animate-pulse"></div>
                  <div className="h-12 w-full sm:w-40 bg-white/20 rounded-xl animate-pulse"></div>
                </>
              ) : (
                <>
                  <Link
                    to={settings?.heroCtaPrimaryLink || '/pendaftaran'}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-[4px] min-h-[44px] bg-primary text-primary-foreground hover:bg-primary/90 transition-opacity w-full sm:w-auto"
                  >
                    {settings?.heroCtaPrimaryText || 'Daftar Sekarang'}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to={settings?.heroCtaSecondaryLink || '/alur-pendaftaran'}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-[4px] min-h-[44px] border border-white/30 bg-white/10 text-white hover:bg-white/20 transition-colors w-full sm:w-auto"
                  >
                    {settings?.heroCtaSecondaryText || 'Alur Pendaftaran'}
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
        {}
        {activeSlides.length > 1 && (
          <div className="hidden"></div>
        )}
        {}
        {activeSlides.length > 1 && (
          <div className="absolute bottom-10 left-4 md:left-10 flex gap-2 z-20">
            {activeSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === index ? 'w-8 bg-primary' : 'w-2 bg-primary/30 hover:bg-primary/50'
                }`}
              />
            ))}
          </div>
        )}
      </section>
      {}
      <section className="relative -mt-16 z-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {statistics.slice(0, 4).map((stat, i) => {
              const Icon = iconMap[stat.icon] || Star;
              return (
                <motion.div
                  key={stat.id || i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="glass-card p-4 md:p-6 text-center hover-lift"
                >
                  <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl md:text-3xl font-bold text-gradient-primary">{stat.nilai}</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.judul}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      {}
      <SectionWrapper className="bg-secondary/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <SectionHeader
              badge="Tentang Kami"
              title="Profil Singkat"
              centered={false}
            />
            <div className="prose prose-lg text-muted-foreground -mt-6 mb-8">
              <p className="whitespace-pre-line leading-relaxed">
                {
                  !isLoadingSettings && settings?.profilSingkat
                    ? settings.profilSingkat
                    : (settingsError
                        ? "Pondok Pesantren Raudhatussalam Mahato adalah lembaga pendidikan Islam modern yang memadukan ilmu agama dan pengetahuan umum. Kami berkomitmen mencetak generasi yang hafal Al-Qur'an, berakhlak mulia, dan siap bersaing di era global.\n\nBerdiri sejak tahun 2010, kami terus berkembang menyediakan fasilitas terbaik dan tenaga pengajar profesional untuk mendukung tumbuh kembang santri."
                        : '')
                }
              </p>
            </div>
            <Link to="/sejarah">
              <Button variant="outline" className="gap-2">
                Selengkapnya <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
          {}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-video rounded-[4px] overflow-hidden shadow-md relative z-10 border border-border">
              <img 
                src={settings?.gambarProfil || heroImage} 
                alt="Profil Pesantren" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.div>
        </div>
      </SectionWrapper>
      {/* Program Pendidikan Section — 4 grid, klik buka modal */}
      <SectionWrapper className="bg-secondary/10">
        <SectionHeader
          badge="Pendidikan"
          title="Program Pendidikan"
          subtitle="Bidang keilmuan yang diajarkan untuk membentuk santri yang cendekia dan berakhlak mulia."
        />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {educationPrograms.slice(0, 4).map((edu, i) => {
            const thumb = edu.images?.[0]?.gambar || edu.gambar || null;
            return (
              <motion.button
                key={edu.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                onClick={() => openProgramModal(edu)}
                className="card overflow-hidden hover-lift text-left group focus:outline-none focus:ring-2 focus:ring-primary rounded-[4px] w-full border border-border bg-card"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-muted/30">
                  {thumb ? (
                    <img src={thumb} alt={edu.nama} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <GraduationCap className="w-10 h-10 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {edu.akreditasi && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">{edu.akreditasi}</span>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-sm md:text-base leading-snug group-hover:text-primary transition-colors">{edu.nama}</h3>
                  {edu.images?.length > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-1">{edu.images.length} foto · Klik untuk lihat</p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </SectionWrapper>

      {/* Jenjang Pendidikan Section — 4 grid klik modal */}
      <SectionWrapper>
        <SectionHeader
          badge="Jenjang"
          title="Jenjang Pendidikan"
          subtitle="Tiga jenjang formal yang memadukan kurikulum KMI Gontor dan pendidikan nasional."
        />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {programs.slice(0, 4).map((program, i) => {
            const thumb = program.gambar || null;
            return (
              <motion.button
                key={program.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                onClick={() => openProgramModal(program)}
                className="card overflow-hidden hover-lift text-left group focus:outline-none focus:ring-2 focus:ring-primary rounded-[4px] w-full border border-border bg-card"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-muted/30">
                  {thumb ? (
                    <img src={thumb} alt={program.nama} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <BookOpen className="w-10 h-10 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {program.status === 'published' && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">Aktif</span>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-sm md:text-base leading-snug group-hover:text-primary transition-colors">{program.nama}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{program.deskripsi?.slice(0, 60)}...</p>
                </div>
              </motion.button>
            );
          })}
        </div>
        <div className="text-center mt-6">
          <Link to="/program" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            Lihat Semua Jenjang <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </SectionWrapper>

      {/* ══ PROGRAM MODAL ══ */}
      <AnimatePresence>
        {selectedProgram && (() => {
          const imgs: { gambar: string; altText?: string; alt_text?: string }[] =
            selectedProgram.images?.length > 0
              ? selectedProgram.images
              : selectedProgram.gambar
                ? [{ gambar: selectedProgram.gambar, altText: selectedProgram.nama }]
                : [];
          const hasImgs = imgs.length > 0;
          return (
            <motion.div
              key="program-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
              onClick={closeProgramModal}
            >
              <motion.div
                key="program-modal-box"
                initial={{ opacity: 0, y: 60, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 60, scale: 0.97 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg md:max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                {/* Modal image slideshow */}
                {hasImgs && (
                  <div className="relative aspect-[16/9] bg-muted/20 flex-shrink-0">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={modalImgIndex}
                        src={imgs[modalImgIndex].gambar}
                        alt={imgs[modalImgIndex].altText || imgs[modalImgIndex].alt_text || selectedProgram.nama}
                        className="absolute inset-0 w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    </AnimatePresence>
                    {/* Slide controls */}
                    {imgs.length > 1 && (
                      <>
                        <button
                          onClick={() => setModalImgIndex(p => (p - 1 + imgs.length) % imgs.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                        ><Prev className="w-4 h-4" /></button>
                        <button
                          onClick={() => setModalImgIndex(p => (p + 1) % imgs.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                        ><Next className="w-4 h-4" /></button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {imgs.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setModalImgIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-all ${idx === modalImgIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    {/* Close button */}
                    <button
                      onClick={closeProgramModal}
                      className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors z-10"
                    ><X className="w-4 h-4" /></button>
                  </div>
                )}
                {/* Modal content */}
                <div className="p-5 overflow-y-auto">
                  {!hasImgs && (
                    <button onClick={closeProgramModal} className="absolute top-3 right-3 bg-muted hover:bg-muted/80 rounded-full p-1.5 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {selectedProgram.akreditasi && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full mb-2">
                      <Award className="w-3 h-3" /> {selectedProgram.akreditasi}
                    </span>
                  )}
                  <h2 className="text-lg md:text-xl font-bold mb-3 leading-snug">{selectedProgram.nama}</h2>
                  {selectedProgram.deskripsi && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedProgram.deskripsi}</p>
                  )}
                  {selectedProgram.status === 'published' && (
                    <p className="text-xs text-emerald-600 font-semibold mt-3">✓ Program Aktif</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
      {}
      <SectionWrapper className="bg-secondary/50">
        <SectionHeader
          badge="Testimoni"
          title="Apa Kata Mereka"
          subtitle="Pengalaman wali santri dan alumni yang telah merasakan pendidikan di Raudhatussalam."
        />
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
            >
              {testimonialSlides.length > 0 && (() => {
                const visibleCount = isMobile ? 1 : 3;
                const items = [];
                if (testimonialSlides.length <= visibleCount) {
                   return testimonialSlides.map((t) => (
                     <motion.div
                       key={t.id}
                       className="glass-card p-6 hover-lift"
                     >
                       <Quote className="w-8 h-8 text-primary/30 mb-3" />
                       <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.testimoni}"</p>
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm overflow-hidden">
                           {t.foto ? <img src={t.foto} alt={t.nama} className="w-full h-full object-cover" /> : t.nama.charAt(0)}
                         </div>
                         <div>
                           <p className="text-sm font-semibold">{t.nama}</p>
                           <p className="text-xs text-muted-foreground">{t.jabatan}</p>
                         </div>
                       </div>
                     </motion.div>
                   ));
                }
                for (let i = 0; i < visibleCount; i++) {
                  items.push(testimonialSlides[(currentTestimonial + i) % testimonialSlides.length]);
                }
                return items.map((t, i) => (
                  <motion.div
                    key={`${t.id}-${i}`} 
                    className="glass-card p-6 hover-lift"
                  >
                    <Quote className="w-8 h-8 text-primary/30 mb-3" />
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.testimoni}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm overflow-hidden">
                        {t.foto ? <img src={t.foto} alt={t.nama} className="w-full h-full object-cover" /> : t.nama.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t.nama}</p>
                        <p className="text-xs text-muted-foreground">{t.jabatan}</p>
                      </div>
                    </div>
                  </motion.div>
                ));
              })()}
            </motion.div>
          </AnimatePresence>
          {}
          {testimonialSlides.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="md:hidden"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                {testimonialSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      currentTestimonial === index ? 'w-8 bg-primary' : 'w-2 bg-primary/30 hover:bg-primary/50'
                    }`}
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="md:hidden"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </SectionWrapper>
      {}
      <SectionWrapper className="!px-2 md:!px-4">
        <SectionHeader badge="Publikasi Ilmiah" title="Berita & Artikel Terkini" subtitle="Kabar terbaru dan karya tulis dari lingkungan pesantren." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6">
          {blogPosts.slice(0, 4).map((post, i) => (
            <motion.div key={post.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Link to={`/blog/${post.slug}`} className="block group">
                <div className="glass-card overflow-hidden hover-lift h-full flex flex-col">
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    {post.featuredImage && (
                        <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-2.5 md:p-5 flex-1 flex flex-col">
                    <span className="text-[9px] md:text-xs font-medium text-primary line-clamp-1">{post.category?.name}</span>
                    <h3 className="text-xs sm:text-sm md:text-base font-semibold mt-1 line-clamp-2 group-hover:text-primary transition-colors leading-tight">{post.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 hidden md:block line-clamp-2">{post.excerpt}</p>
                    <div className="mt-auto pt-2">
                        <p className="text-[9px] md:text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/publikasi" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            Semua Publikasi Ilmiah <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </SectionWrapper>


      {}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-[4px] overflow-hidden border border-border bg-card p-8 md:p-12 text-center card card--accent"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {settings?.ctaTitle || 'Siap Bergabung?'}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto mb-8">
              {settings?.ctaDescription || 'Daftarkan putra-putri Anda sekarang dan wujudkan generasi yang berilmu, beriman, dan berakhlak mulia.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={settings?.ctaPrimaryLink || '/pendaftaran'}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-[4px] min-h-[44px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {settings?.ctaPrimaryText || 'Daftar Sekarang'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={settings?.ctaSecondaryLink || '/kontak'}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-[4px] min-h-[44px] border border-border text-foreground hover:bg-secondary/80 transition-colors"
              >
                {settings?.ctaSecondaryText || 'Hubungi Kami'}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};
export default Home;
