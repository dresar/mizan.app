import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Briefcase, Users, User, X } from 'lucide-react';
import { usePublicData } from '@/hooks/use-public-data';
import SEOHead from '@/components/SEOHead';
import { SectionWrapper } from '@/components/shared/SectionWrapper';

interface OrgMember {
  id: number;
  nama: string;
  jabatan: string;
  foto?: string;
  level: number;
  order: number;
}

const levelAccents = [
  'border-l-amber-500',
  'border-l-emerald-500',
  'border-l-emerald-500',
  'border-l-zinc-500',
];

const levelIcons = [Crown, Briefcase, Users, User];

const Organisasi = () => {
  const { data: members = [], isLoading } = usePublicData<OrgMember[]>(
    ['struktur-organisasi'],
    '/core/struktur-organisasi'
  );

  const [selectedMember, setSelectedMember] = useState<OrgMember | null>(null);

  const level0 = members.filter(m => m.level === 0).sort((a, b) => a.order - b.order);
  const level1 = members.filter(m => m.level === 1).sort((a, b) => a.order - b.order);
  const level2 = members.filter(m => m.level === 2).sort((a, b) => a.order - b.order);
  const level3 = members.filter(m => m.level === 3).sort((a, b) => a.order - b.order);

  const MemberCard = ({ member, index }: { member: OrgMember; index: number }) => {
    const Icon = levelIcons[Math.min(member.level, 3)];
    const accentBorder = levelAccents[Math.min(member.level, 3)];

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        onClick={() => setSelectedMember(member)}
        className={`card card--accent hover-lift cursor-pointer flex flex-col md:flex-row items-center md:items-start gap-4 p-4 md:p-5 w-full md:w-[280px] lg:w-[320px] rounded-[4px] border border-border border-l-[3px] ${accentBorder} bg-card text-center md:text-left group`}
      >
        <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-[4px] border border-border bg-muted overflow-hidden">
          {member.foto ? (
            <img src={member.foto} alt={member.nama} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="w-8 h-8 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
          {member.level === 0 && (
            <span className="inline-flex max-w-fit items-center gap-1 text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-[4px] mb-1">
              Top Management
            </span>
          )}
          <h3 className="font-bold text-sm md:text-base leading-tight mb-1 text-foreground group-hover:text-emerald-500 transition-colors line-clamp-2">
            {member.nama}
          </h3>
          <p className="text-xs text-muted-foreground leading-snug break-words">
            {member.jabatan}
          </p>
        </div>
      </motion.div>
    );
  };

  const RenderLevel = ({ title, data }: { title?: string, data: OrgMember[] }) => {
    if (!data || data.length === 0) return null;
    return (
      <div className="flex flex-col items-center mb-12 last:mb-0 w-full relative">
        {title && (
          <div className="w-full flex items-center gap-4 mb-6">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
            <div className="h-px bg-border flex-1" />
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full max-w-5xl">
          {data.map((m, i) => <MemberCard key={m.id} member={m} index={i} />)}
        </div>
      </div>
    );
  };

  return (
    <>
      <SEOHead title="Struktur Organisasi" description="Struktur kepengurusan dan manajemen di Pondok Pesantren Raudhatussalam Mahato." path="/profil/organisasi" />

      <section className="relative py-16 md:py-24 overflow-hidden border-b border-border bg-card">
        <div className="container mx-auto max-w-4xl px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold tracking-wider uppercase rounded-[4px] bg-primary/10 text-primary border border-primary/20">
              Profil Pesantren
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 text-foreground">Struktur Organisasi</h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              Sistem manajemen berbasis kepemimpinan kolektif yang profesional demi keberlangsungan pendidikan santri.
            </p>
          </motion.div>
        </div>
      </section>

      <SectionWrapper>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground bg-muted/30 rounded-[4px] border border-border">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Data struktur organisasi belum tersedia.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <RenderLevel data={level0} />
            <RenderLevel title="Jajaran Kepengurusan Dewan" data={level1} />
            <RenderLevel title="Kepala Unit & Manajerial" data={level2} />
            <RenderLevel title="Koordinator Divisi" data={level3} />
          </div>
        )}
      </SectionWrapper>

      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMember(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-[4px] border border-border shadow-xl w-full max-w-lg overflow-hidden flex flex-col card card--accent"
            >
              <div className="relative aspect-video bg-muted overflow-hidden">
                {selectedMember.foto ? (
                  <img 
                    src={selectedMember.foto} 
                    alt={selectedMember.nama} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                    <User className="w-16 h-16 opacity-30" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 p-2 min-h-[44px] min-w-[44px] bg-black/50 hover:bg-black/70 text-white rounded-[4px] flex items-center justify-center transition-colors z-20"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute bottom-5 left-6 right-6 z-10">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary text-primary-foreground rounded-[4px] font-bold text-[10px] uppercase mb-2">
                    {selectedMember.jabatan}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                    {selectedMember.nama}
                  </h2>
                </div>
              </div>

              <div className="px-6 py-6 text-left">
                <div className="text-sm text-foreground space-y-4">
                  <p>Beliau menjabat sebagai <strong>{selectedMember.jabatan}</strong> di ranah struktural Pondok Pesantren Modern Raudhatussalam Mahato.</p>
                  <div className="p-4 bg-muted/40 rounded-[4px] border border-border">
                    <p className="text-xs italic text-muted-foreground">"Dedikasi penuh menjaga visi dan misi pesantren tetap berjalan lancar dan berkesinambungan bagi seluruh santri dan jajaran tenaga pengajar."</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Organisasi;
