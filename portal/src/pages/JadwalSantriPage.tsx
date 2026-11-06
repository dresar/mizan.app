import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Moon, Dumbbell, Coffee } from 'lucide-react';
import { useSantriSchedule } from '@/hooks/use-santri';
import { Skeleton } from '@/components/ui/skeleton';
const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const typeConfig: Record<string, { icon: any, color: string }> = {
  akademik: { icon: BookOpen, color: 'bg-primary/10 text-primary border-primary/20' },
  ibadah: { icon: Moon, color: 'bg-accent/10 text-accent border-accent/20' },
  ekstrakurikuler: { icon: Dumbbell, color: 'bg-secondary text-secondary-foreground border-border' },
  istirahat: { icon: Coffee, color: 'bg-muted text-muted-foreground border-border' },
};
const JadwalSantriPage = () => {
  const [activeDay, setActiveDay] = useState('Senin');
  const { data: items, isLoading, error } = useSantriSchedule(activeDay);
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1">Jadwal Pelajaran</h1>
        <p className="text-sm text-muted-foreground mb-6">Jadwal mingguan kelas MTs Semester Genap 2026.</p>
        {}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeDay === day
                  ? 'gradient-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        {}
        <div className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              Gagal memuat jadwal.
            </div>
          ) : items && items.length > 0 ? (
            items.map((item: any, i: number) => {
              const config = typeConfig[item.type] || typeConfig.akademik;
              const Icon = config.icon;
              return (
                <motion.div
                  key={`${activeDay}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${config.color}`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.activity}</p>
                    <p className="text-xs opacity-70">{item.time}</p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada jadwal untuk hari ini.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
export default JadwalSantriPage;