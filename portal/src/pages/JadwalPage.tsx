import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/shared/PageHeader';
import SectionWrapper from '@/components/shared/SectionWrapper';
import { usePublicData } from '@/hooks/use-public-data';
import { Clock, BookOpen, Heart, Activity, Coffee, Moon, Sun } from 'lucide-react';

interface ScheduleItem {
  id: number;
  waktu: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  target?: string; // 'putra' or 'putri'
}

const typeColors: Record<string, string> = {
  ibadah: 'bg-primary/10 text-primary border-primary/20',
  akademik: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  ekstrakurikuler: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  istirahat: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

const typeIcons: Record<string, any> = {
  ibadah: Heart,
  akademik: BookOpen,
  ekstrakurikuler: Activity,
  istirahat: Coffee,
};

const JadwalPage = () => {
  const [target, setTarget] = useState<'putra' | 'putri'>('putra');
  const { data: schedule = [], isLoading } = usePublicData<ScheduleItem[]>(['jadwal-harian'], '/core/jadwal-harian');

  const filteredSchedule = schedule.filter(item => {
    // If backend doesn't support target yet, show all, or filter if 'target' exists
    if (!item.target) return true;
    return item.target.toLowerCase() === target;
  });

  return (
    <>
      <PageHeader 
        title="Jadwal Harian Santri" 
        subtitle="Rutinitas harian yang terstruktur untuk membentuk kedisiplinan dan karakter robbani." 
        breadcrumbs={[{ label: 'Kehidupan Santri' }, { label: 'Jadwal Harian' }]} 
      />

      <SectionWrapper>
        <div className="max-w-4xl mx-auto">
          {/* Tabs Putra/Putri */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1 bg-secondary rounded-2xl border border-border/50">
              <button
                onClick={() => setTarget('putra')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  target === 'putra' 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sun className={`w-4 h-4 ${target === 'putra' ? 'animate-pulse' : ''}`} />
                Santri Putra
              </button>
              <button
                onClick={() => setTarget('putri')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  target === 'putri' 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Moon className={`w-4 h-4 ${target === 'putri' ? 'animate-pulse' : ''}`} />
                Santri Putri
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-muted/40 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filteredSchedule.length === 0 ? (
            <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-border">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">Jadwal untuk kategori ini belum tersedia.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-primary/20 ml-4 md:ml-6 pl-8 md:pl-10 space-y-8">
              <AnimatePresence mode='wait'>
                <motion.div
                  key={target}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {filteredSchedule.map((item, i) => {
                    const Icon = typeIcons[item.kategori] || Clock;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="relative group mb-8 last:mb-0"
                      >
                        {/* Dot on timeline */}
                        <div className="absolute -left-[41px] md:-left-[51px] top-6 w-5 h-5 rounded-full border-4 border-background bg-primary shadow-sm z-10 group-hover:scale-125 transition-transform" />
                        
                        <div className="flex flex-col md:flex-row md:items-center gap-4 bg-background border border-border/60 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-3 shrink-0">
                            <div className={`p-2.5 rounded-xl ${typeColors[item.kategori] || 'bg-secondary text-muted-foreground'}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-lg font-mono font-bold text-foreground">
                              {item.waktu}
                            </span>
                          </div>
                          
                          <div className="h-px md:h-8 w-full md:w-px bg-border/60" />

                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                              {item.judul}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                              {item.deskripsi}
                            </p>
                          </div>

                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 hidden md:block ${typeColors[item.kategori] || 'bg-secondary'}`}>
                            {item.kategori}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </SectionWrapper>
    </>
  );
};

export default JadwalPage;