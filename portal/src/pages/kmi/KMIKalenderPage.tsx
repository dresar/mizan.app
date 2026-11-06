import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Plus, ChevronLeft, ChevronRight, School, Sun, Trophy, XCircle, Star, BookOpen, Zap, Beaker } from 'lucide-react';
import { useKMIMode } from '@/hooks/use-kmi-mode';

interface KalenderEvent {
  id: number;
  judul: string;
  tanggalMulai: string;
  tanggalSelesai?: string;
  tipe: 'libur' | 'ujian' | 'kegiatan' | 'penting' | 'hari_besar';
  deskripsi?: string;
  warna: string;
}

const EVENTS: KalenderEvent[] = [
  { id: 1, judul: 'Awal Tahun Ajaran Baru 2025/2026', tanggalMulai: '2025-07-14', tipe: 'penting', warna: '#10B981' },
  { id: 2, judul: 'Masa Ta\'aruf Santri Baru (MATASBA)', tanggalMulai: '2025-07-14', tanggalSelesai: '2025-07-21', tipe: 'kegiatan', warna: '#3B82F6' },
  { id: 3, judul: 'Ulangan Harian 1 (UH-1)', tanggalMulai: '2025-08-25', tanggalSelesai: '2025-08-30', tipe: 'ujian', warna: '#F59E0B' },
  { id: 4, judul: 'Libur Maulid Nabi 1447H', tanggalMulai: '2025-09-05', tanggalSelesai: '2025-09-06', tipe: 'libur', warna: '#6B7280' },
  { id: 5, judul: 'Ulangan Harian 2 (UH-2)', tanggalMulai: '2025-10-06', tanggalSelesai: '2025-10-11', tipe: 'ujian', warna: '#F59E0B' },
  { id: 6, judul: 'Hari Santri Nasional', tanggalMulai: '2025-10-22', tipe: 'kegiatan', warna: '#10B981' },
  { id: 7, judul: 'UTS — Imtihan Nishfu Al-Sanah', tanggalMulai: '2025-11-17', tanggalSelesai: '2025-11-28', tipe: 'ujian', warna: '#EF4444' },
  { id: 8, judul: 'Libur Akhir Semester Ganjil', tanggalMulai: '2025-12-29', tanggalSelesai: '2026-01-03', tipe: 'libur', warna: '#6B7280' },
  { id: 9, judul: 'Awal Semester Genap 2025/2026', tanggalMulai: '2026-01-05', tipe: 'penting', warna: '#10B981' },
  { id: 10, judul: 'UH-1 Semester Genap', tanggalMulai: '2026-02-09', tanggalSelesai: '2026-02-14', tipe: 'ujian', warna: '#F59E0B' },
  { id: 11, judul: 'Libur Idul Fitri 1447H', tanggalMulai: '2026-03-28', tanggalSelesai: '2026-04-12', tipe: 'libur', warna: '#6B7280' },
  { id: 12, judul: 'UTS Semester Genap', tanggalMulai: '2026-04-13', tanggalSelesai: '2026-04-24', tipe: 'ujian', warna: '#EF4444' },
  { id: 13, judul: 'UAS — Imtihan Al-Sanah / UA-KMI', tanggalMulai: '2026-06-01', tanggalSelesai: '2026-06-13', tipe: 'ujian', warna: '#EF4444', deskripsi: 'Ujian Akhir KMI untuk kelas VI' },
  { id: 14, judul: 'Wisuda Akbar KMI 2026', tanggalMulai: '2026-06-20', tipe: 'penting', warna: '#10B981', deskripsi: 'Wisuda santri kelas VI' },
  { id: 15, judul: 'Akhir Tahun Ajaran 2025/2026', tanggalMulai: '2026-06-30', tipe: 'penting', warna: '#6B7280' },
];

const TIPE_CONFIG = {
  libur: { label: 'Libur', icon: Sun, bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-400', border: 'border-l-gray-400' },
  ujian: { label: 'Ujian', icon: School, bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', border: 'border-l-red-400' },
  kegiatan: { label: 'Kegiatan', icon: Trophy, bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', border: 'border-l-blue-400' },
  penting: { label: 'Penting', icon: Star, bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', border: 'border-l-emerald-400' },
  hari_besar: { label: 'Hari Besar', icon: BookOpen, bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', border: 'border-l-amber-400' },
};

// Group events by month
const groupByMonth = (events: KalenderEvent[]) => {
  const map: Record<string, KalenderEvent[]> = {};
  events.forEach(ev => {
    const date = new Date(ev.tanggalMulai);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!map[key]) map[key] = [];
    map[key].push(ev);
  });
  return map;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export default function KMIKalenderPage() {
  const { isBetaMode, toggleMode } = useKMIMode();
  const [filterTipe, setFilterTipe] = useState<string>('ALL');
  const grouped = groupByMonth(
    EVENTS.filter(e => filterTipe === 'ALL' || e.tipe === filterTipe)
      .sort((a, b) => a.tanggalMulai.localeCompare(b.tanggalMulai))
  );

  const months = Object.keys(grouped).sort();

  const monthLabel = (key: string) => {
    const [y, m] = key.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Kalender Akademik KMI</h1>
            <p className="text-sm text-muted-foreground">Tahun Ajaran 2025/2026 — Pondok Pesantren Raudhatussalam Mahato</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Action buttons */}
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /> Tambah Event
          </button>
        </div>
      </div>

      {/* Legend & Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterTipe('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
            filterTipe === 'ALL' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-transparent text-muted-foreground'
          }`}
        >
          Semua
        </button>
        {Object.entries(TIPE_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => setFilterTipe(filterTipe === key ? 'ALL' : key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                filterTipe === key ? 'bg-primary text-primary-foreground border-primary' : `${cfg.bg} ${cfg.text} border-transparent`
              }`}
            >
              <Icon className="w-3 h-3" />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(TIPE_CONFIG).map(([key, cfg]) => {
          const count = EVENTS.filter(e => e.tipe === key).length;
          const Icon = cfg.icon;
          return (
            <div key={key} className={`rounded-xl p-3 ${cfg.bg} border border-transparent`}>
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${cfg.text}`} />
                <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
              </div>
              <p className={`text-2xl font-bold ${cfg.text} mt-1`}>{count}</p>
              <p className={`text-xs ${cfg.text} opacity-70`}>agenda</p>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {months.map(month => (
          <div key={month}>
            {/* Month Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <h2 className="font-bold text-lg">{monthLabel(month)}</h2>
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{grouped[month].length} agenda</span>
            </div>

            {/* Event Cards */}
            <div className="space-y-3 pl-5">
              {grouped[month].map((ev, i) => {
                const cfg = TIPE_CONFIG[ev.tipe];
                const Icon = cfg.icon;
                const isMultiDay = ev.tanggalSelesai && ev.tanggalSelesai !== ev.tanggalMulai;
                return (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`relative flex items-start gap-4 p-4 rounded-xl border-l-4 ${cfg.border} ${cfg.bg} group`}
                  >
                    {/* Date indicator */}
                    <div className="flex-shrink-0 min-w-[80px] text-center">
                      <div className="text-lg font-bold">
                        {new Date(ev.tanggalMulai).getDate()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(ev.tanggalMulai).toLocaleDateString('id-ID', { month: 'short' })}
                      </div>
                      {isMultiDay && (
                        <div className="text-xs text-muted-foreground">
                          s/d {new Date(ev.tanggalSelesai!).getDate()} {new Date(ev.tanggalSelesai!).toLocaleDateString('id-ID', { month: 'short' })}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-semibold ${cfg.text}`}>{ev.judul}</p>
                        <span className={`flex-shrink-0 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border`}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>
                      {ev.deskripsi && (
                        <p className="text-sm text-muted-foreground mt-1">{ev.deskripsi}</p>
                      )}
                      {isMultiDay && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(ev.tanggalMulai)} — {formatDate(ev.tanggalSelesai!)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
