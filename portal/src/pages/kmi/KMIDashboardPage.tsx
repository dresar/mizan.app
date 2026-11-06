import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  School, BookOpen, Users, Calendar, CheckSquare,
  NotebookPen, ScrollText, BookCheck,
  ChevronRight, Activity, Beaker
} from 'lucide-react';
import { api } from '@/lib/api';
import { useKMIMode } from '@/hooks/use-kmi-mode';
import { MOCK_DASHBOARD } from './KMI_MOCKS';
import { Card } from '@/components/ui/card';

interface DashboardStats {
  totalKelas: number;
  totalSantri: number;
  totalMapel: number;
  totalGuru: number;
  absensiHariIni: number;
  nilaiMenunggu: number;
  raporDraft: number;
  tahunAjaran: string;
  semesterAktif: string;
}

const StatCard = ({ icon: Icon, label, value, href, accent = false }: {
  icon: any; label: string; value: string | number; href?: string; accent?: boolean;
}) => (
  <Card
    className={`card relative overflow-hidden rounded-[4px] p-5 border border-border bg-card transition-all duration-200 ${accent ? 'card--accent border-l-[3px] border-l-[#10b981]' : ''}`}
  >
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
      <div className="w-10 h-10 rounded-[4px] bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
    </div>
    {href && (
      <Link to={href} className="absolute inset-0" aria-label={label} />
    )}
  </Card>
);

const QuickAction = ({ icon: Icon, label, href, color }: {
  icon: any; label: string; href: string; color: string;
}) => (
  <Link to={href} className="min-h-[44px] flex items-center">
    <div className="flex items-center gap-3 p-3 rounded-[4px] border border-border bg-card hover:bg-muted/40 transition-colors w-full min-h-[44px]">
      <div className={`w-8 h-8 rounded-[4px] ${color} flex items-center justify-center text-white shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
      <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
    </div>
  </Link>
);

export default function KMIDashboardPage() {
  const { isBetaMode } = useKMIMode();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [kalender, setKalender] = useState<any[]>([]);

  useEffect(() => {
    if (isBetaMode) {
      setStats(MOCK_DASHBOARD);
      setKalender([]);
      return;
    }

    const load = async () => {
      try {
        const [statsRes, kalRes] = await Promise.all([
          api.get('/kmi/dashboard/stats').catch(() => ({ data: null })),
          api.get('/kmi/kalender?upcoming=5').catch(() => ({ data: [] })),
        ]);
        setStats(statsRes.data || MOCK_DASHBOARD);
        setKalender(kalRes.data || []);
      } catch {
        setStats(MOCK_DASHBOARD);
      }
    };
    load();
  }, [isBetaMode]);

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[4px] bg-emerald-500 text-white flex items-center justify-center shadow-sm">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard KMI</h1>
            <p className="text-sm text-muted-foreground">Kulliyatul Mu'allimin Al-Islamiyah — {today}</p>
          </div>
        </div>
        {stats && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-muted/60 border border-border text-xs font-medium text-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Tahun Ajaran {stats.tahunAjaran} • Semester {stats.semesterAktif}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-[4px] p-4 flex items-center gap-4 text-foreground card card--accent">
        <div className="w-10 h-10 rounded-[4px] bg-amber-500/10 flex items-center justify-center shrink-0">
          <Beaker className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Fitur Dalam Pengembangan (Demo)</h3>
          <p className="text-xs text-muted-foreground">
            Halaman ini adalah pratinjau antarmuka untuk fitur Manajemen Akademik KMI dengan data simulasi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Santri" value={stats?.totalSantri ?? '—'} href="/admin/kmi/kelas" accent={true} />
        <StatCard icon={School} label="Total Kelas" value={stats?.totalKelas ?? '—'} href="/admin/kmi/kelas" />
        <StatCard icon={BookOpen} label="Mata Pelajaran" value={stats?.totalMapel ?? '—'} href="/admin/kmi/mapel" />
        <StatCard icon={Users} label="Tenaga Pengajar" value={stats?.totalGuru ?? '—'} href="/admin/kmi/guru-mapel" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { icon: CheckSquare, label: 'Kelas Belum Absen', value: stats?.absensiHariIni ?? 0, color: 'border-l-amber-500', href: '/admin/kmi/absensi', desc: 'kelas belum input absensi' },
          { icon: NotebookPen, label: 'Nilai Menunggu', value: stats?.nilaiMenunggu ?? 0, color: 'border-l-emerald-500', href: '/admin/kmi/nilai', desc: 'entri nilai belum diinput' },
          { icon: ScrollText, label: 'Rapor Draft', value: stats?.raporDraft ?? 0, color: 'border-l-blue-500', href: '/admin/kmi/rapor', desc: 'rapor perlu difinalisasi' },
        ].map(({ icon: Icon, label, value, color, href, desc }) => (
          <Link to={href} key={label} className="min-h-[44px]">
            <div className={`card rounded-[4px] border border-border border-l-[3px] ${color} p-4 bg-card hover:bg-muted/40 transition-colors`}>
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold text-foreground">{value} <span className="text-xs font-normal text-muted-foreground">{desc}</span></p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[4px] border border-border bg-card p-6 card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h2 className="font-semibold text-foreground">Aksi Cepat</h2>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <QuickAction icon={CheckSquare} label="Input Absensi Hari Ini" href="/admin/kmi/absensi/input" color="bg-amber-600" />
            <QuickAction icon={NotebookPen} label="Input Nilai Santri" href="/admin/kmi/nilai" color="bg-emerald-600" />
            <QuickAction icon={Users} label="Lihat Daftar Kelas" href="/admin/kmi/kelas" color="bg-emerald-600" />
            <QuickAction icon={BookOpen} label="Mata Pelajaran KMI" href="/admin/kmi/mapel" color="bg-emerald-600" />
            <QuickAction icon={ScrollText} label="Generate Rapor" href="/admin/kmi/rapor" color="bg-rose-600" />
            <QuickAction icon={BookCheck} label="Ko-Kurikuler (Muwajjah)" href="/admin/kmi/kokur" color="bg-amber-600" />
          </div>
        </div>

        <div className="rounded-[4px] border border-border bg-card p-6 card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <h2 className="font-semibold text-foreground">Agenda Akademik Mendatang</h2>
            </div>
            <Link to="/admin/kmi/kalender" className="text-xs text-emerald-500 hover:underline">Lihat semua</Link>
          </div>
          <div className="space-y-3">
            {kalender.length === 0 ? (
              [
                { judul: 'Imtihan Al-Sanah (UAS)', tipe: 'ujian', tanggal_mulai: '2026-06-01', warna: '#EF4444' },
                { judul: 'Wisuda Akbar KMI 2026', tipe: 'penting', tanggal_mulai: '2026-06-20', warna: '#10B981' },
                { judul: 'Input Nilai UAS Deadline', tipe: 'penting', tanggal_mulai: '2026-06-15', warna: '#10B981' },
              ].map((ev, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-[4px] bg-muted/40 border border-border">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ev.warna }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ev.judul}</p>
                    <p className="text-xs text-muted-foreground">{new Date(ev.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-[4px] font-medium ${
                    ev.tipe === 'ujian' ? 'bg-red-500/10 text-red-500' :
                    ev.tipe === 'libur' ? 'bg-muted text-muted-foreground' :
                    'bg-emerald-500/10 text-emerald-500'
                  }`}>{ev.tipe}</span>
                </div>
              ))
            ) : kalender.map((ev: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-[4px] bg-muted/40 border border-border">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ev.warna || '#6B7280' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{ev.judul}</p>
                  <p className="text-xs text-muted-foreground">{new Date(ev.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[4px] bg-card border border-border p-6 text-foreground card card--accent">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <h3 className="text-base font-bold mb-1 text-foreground">Kulliyatul Mu'allimin Wal-Muallimat Al-Islamiyah</h3>
            <p className="text-sm text-muted-foreground">
              Sistem pendidikan integral 24 jam — Memadukan <strong>100% Ulum Islamiyah</strong> dan <strong>100% Ulum Ammah</strong>.
              Program Reguler 6 tahun & Program Intensif 4 tahun.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-muted/50 border border-border rounded-[4px] px-4 py-2">
              <div className="text-2xl font-bold text-foreground">30+</div>
              <div className="text-xs text-muted-foreground">Mata Pelajaran</div>
            </div>
            <div className="bg-muted/50 border border-border rounded-[4px] px-4 py-2">
              <div className="text-2xl font-bold text-foreground">6</div>
              <div className="text-xs text-muted-foreground">Jenjang KMI</div>
            </div>
            <div className="bg-muted/50 border border-border rounded-[4px] px-4 py-2">
              <div className="text-2xl font-bold text-foreground">3</div>
              <div className="text-xs text-muted-foreground">Rumpun Ilmu</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
