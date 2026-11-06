import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Search, GraduationCap, Users, MapPin, Briefcase, Award, X, BookOpen, Quote, ChevronRight, ChevronLeft } from 'lucide-react';
import SectionWrapper, { SectionHeader } from '@/components/shared/SectionWrapper';
import SEOHead, { SITE_URL } from '@/components/SEOHead';

// Shared component for Tenaga Pengajar Card
const PengajarCard = ({ data, onClick }: { data: any; onClick: () => void }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card overflow-hidden group cursor-pointer border border-border/60 hover:border-primary/40 transition-all flex flex-col h-full rounded-2xl"
      onClick={onClick}
    >
      <div className="aspect-[4/5] relative bg-muted/30 overflow-hidden">
        {data.foto ? (
          <img src={data.foto} alt={data.namaLengkap} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 bg-secondary">
            <Users className="w-16 h-16 mb-2" />
            <span className="text-xs uppercase tracking-widest font-bold">Tanpa Foto</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        {data.isFeatured && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-yellow-500 text-white text-[10px] font-bold uppercase rounded-md shadow-lg">
            Anggota Kehormatan
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs font-semibold text-primary/80 uppercase tracking-widest mb-1">{data.bidangKeahlian || 'Pengajar'}</p>
          <h3 className="text-sm md:text-base font-bold text-white line-clamp-2 leading-snug">{data.namaLengkap}</h3>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start gap-2 mb-2 text-sm text-muted-foreground">
          <BookOpen className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" />
          <p className="line-clamp-2 leading-relaxed text-xs">{data.mataPelajaran || '-'}</p>
        </div>
        <div className="flex items-start gap-2 text-sm text-muted-foreground mt-auto">
          <GraduationCap className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" />
          <p className="line-clamp-1 leading-relaxed text-xs">{data.pendidikanTerakhir || '-'}</p>
        </div>
      </div>
    </motion.div>
  );
};

const TenagaPengajarPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPengajar, setSelectedPengajar] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['tenaga-pengajar', search, page],
    queryFn: async () => {
      const res = await api.get('/core/tenaga-pengajar', { params: { search, page, limit: 12, isPublished: true } });
      return res.data;
    },
  });

  const pengajarList = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <SEOHead
        title="Tenaga Pengajar"
        description="Profil Ustadz dan Ustadzah pendidik di Pondok Pesantren Modern Raudhatussalam Mahato."
        path="/profil/pengajar"
      />

      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-primary/10 to-background">
        <div className="absolute inset-0 opacity-5 islamic-pattern pointer-events-none" />
        <div className="container mx-auto max-w-4xl px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block mb-4 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
              Profil Pesantren
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Tenaga Pengajar</h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              Jajaran asatidz dan ustadzah yang mendedikasikan hidupnya untuk mendidik generasi robbani, membimbing santri dengan ilmu, akhlak, dan keteladanan.
            </p>
          </motion.div>
        </div>
      </section>

      <SectionWrapper>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <SectionHeader badge="Pengajar" title="Daftar Ustadz & Ustadzah" centered={false} />
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama atau mata pelajaran..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-[4/5] bg-muted/50 rounded-2xl animate-pulse" />)}
          </div>
        ) : pengajarList.length === 0 ? (
          <div className="text-center py-24 bg-secondary/30 rounded-2xl border border-dashed border-border/50">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">Belum ada data tenaga pengajar yang dipublikasikan.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {pengajarList.map((p: any) => (
                <PengajarCard key={p.id} data={p} onClick={() => setSelectedPengajar(p)} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2.5 text-sm rounded-xl border border-border hover:bg-secondary disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-9 h-9 text-xs font-semibold rounded-lg flex items-center justify-center transition-colors ${page === i + 1 ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-secondary'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2.5 text-sm rounded-xl border border-border hover:bg-secondary disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </SectionWrapper>

      {/* Modal Detail Pengajar */}
      <AnimatePresence>
        {selectedPengajar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPengajar(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="relative aspect-video sm:aspect-[21/9] bg-muted overflow-hidden flex-shrink-0">
                {selectedPengajar.foto ? (
                  <img 
                    src={selectedPengajar.foto} 
                    alt={selectedPengajar.namaLengkap} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary">
                    <Users className="w-20 h-20 opacity-20" />
                  </div>
                )}
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <button
                  onClick={() => setSelectedPengajar(null)}
                  className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md z-20"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute bottom-6 left-6 right-6 z-10">
                   <div className="flex flex-wrap items-center gap-3 mb-2">
                    {selectedPengajar.isFeatured && (
                      <span className="px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-bold uppercase rounded-md shadow-lg">
                        Anggota Kehormatan
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-primary/90 text-white text-[10px] font-bold uppercase rounded-md shadow-lg backdrop-blur-sm">
                      {selectedPengajar.bidangKeahlian || 'Pengajar'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-md">
                    {selectedPengajar.namaLengkap}
                  </h2>
                </div>
              </div>

              <div className="px-6 sm:px-8 py-8 overflow-y-auto">
                <div className="flex flex-col gap-6">
                  {selectedPengajar.namaPanggilan && (
                    <div className="pb-4 border-b border-border/50">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Nama Sapaan</p>
                      <p className="text-lg font-semibold text-primary">Ustadz/Ustadzah {selectedPengajar.namaPanggilan}</p>
                    </div>
                  )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  {selectedPengajar.bidangKeahlian && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Bidang Keahlian</p>
                      <p className="text-sm font-medium">{selectedPengajar.bidangKeahlian}</p>
                    </div>
                  )}
                  {selectedPengajar.mataPelajaran && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Mengajar</p>
                      <p className="text-sm font-medium">{selectedPengajar.mataPelajaran}</p>
                    </div>
                  )}
                  {selectedPengajar.pendidikanTerakhir && (
                    <div className="space-y-1 sm:col-span-2">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Riwayat Pendidikan</p>
                      <p className="text-sm font-medium">{selectedPengajar.pendidikanTerakhir} {selectedPengajar.universitas ? `- ${selectedPengajar.universitas}` : ''}</p>
                      {selectedPengajar.riwayatPendidikan && (
                        <p className="text-xs text-muted-foreground mt-1">{selectedPengajar.riwayatPendidikan}</p>
                      )}
                    </div>
                  )}
                  {selectedPengajar.pengalamanMengajar && (
                    <div className="space-y-1 sm:col-span-2">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Pengalaman</p>
                      <p className="text-sm text-foreground/90">{selectedPengajar.pengalamanMengajar}</p>
                    </div>
                  )}
                </div>

                {selectedPengajar.motto && (
                  <div className="bg-secondary/40 rounded-2xl p-5 border border-border/60 relative">
                    <Quote className="absolute top-4 right-4 w-12 h-12 text-primary/10" />
                    <p className="text-sm italic font-medium leading-relaxed max-w-[90%] relative z-10 text-foreground/80">"{selectedPengajar.motto}"</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
);
};

export default TenagaPengajarPage;
