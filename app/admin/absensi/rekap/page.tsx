"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Download,
  Users,
  Search,
  Sparkles,
  Award,
  ChevronRight
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { WaktuSholat } from "@/lib/mock-data";

const ALL_PRAYERS: WaktuSholat[] = [
  "Tahajjud",
  "Subuh",
  "Dhuha",
  "Dzuhur",
  "Ashar",
  "Maghrib",
  "Isya"
];

export default function AdminAbsensiRekapPage() {
  const { absensiList, santriList, classList, showToast } = useMizan();

  const [selectedGender, setSelectedGender] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-11");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeView, setActiveView] = useState<"KELAS" | "SANTRI_PERHATIAN">("KELAS");

  const filteredAbsensi = useMemo(() => {
    return absensiList.filter((a) => {
      const matchMonth = a.date.startsWith(selectedMonth);
      const matchGender = selectedGender === "ALL" || a.gender === selectedGender;
      return matchMonth && matchGender;
    });
  }, [absensiList, selectedMonth, selectedGender]);

  const classesToAnalyze = useMemo(() => {
    const list = classList.filter((c) => {
      if (selectedGender === "ALL") return true;
      return c.gender === selectedGender;
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [classList, selectedGender]);

  const classRecap = useMemo(() => {
    return classesToAnalyze.map((cls) => {
      const records = filteredAbsensi.filter((a) => a.santriClass === cls.name);
      const total = records.length;
      const hadir = records.filter((a) => a.status === "Hadir").length;
      const alpa = records.filter((a) => a.status === "Alpa").length;
      const izin = records.filter((a) => a.status === "Izin" || a.status === "Sakit").length;
      const rate = total > 0 ? Math.round((hadir / total) * 100) : 0;

      const prayerRates: Record<WaktuSholat, number> = {
        Tahajjud: 0,
        Subuh: 0,
        Dhuha: 0,
        Dzuhur: 0,
        Ashar: 0,
        Maghrib: 0,
        Isya: 0
      };

      ALL_PRAYERS.forEach((p) => {
        const inPrayer = records.filter((a) => (a.waktuSholat || "Subuh") === p);
        const inPrayerHadir = inPrayer.filter((a) => a.status === "Hadir").length;
        prayerRates[p] = inPrayer.length > 0 ? Math.round((inPrayerHadir / inPrayer.length) * 100) : 0;
      });

      return {
        class: cls,
        total,
        hadir,
        alpa,
        izin,
        rate,
        prayerRates
      };
    });
  }, [classesToAnalyze, filteredAbsensi]);

  const topClasses = useMemo(() => {
    const active = classRecap.filter((c) => c.total > 0);
    return [...active].sort((a, b) => b.rate - a.rate);
  }, [classRecap]);

  const santriAlpaAttention = useMemo(() => {
    const map = new Map<string, { santriId: string; name: string; class: string; gender: string; alpaCount: number }>();

    filteredAbsensi
      .filter((a) => a.status === "Alpa")
      .forEach((a) => {
        const existing = map.get(a.santriId);
        if (existing) {
          existing.alpaCount += 1;
        } else {
          map.set(a.santriId, {
            santriId: a.santriId,
            name: a.santriName,
            class: a.santriClass,
            gender: a.gender,
            alpaCount: 1
          });
        }
      });

    const list = Array.from(map.values());
    return list.sort((a, b) => b.alpaCount - a.alpaCount);
  }, [filteredAbsensi]);

  const overallStats = useMemo(() => {
    const total = filteredAbsensi.length;
    const hadir = filteredAbsensi.filter((a) => a.status === "Hadir").length;
    const alpa = filteredAbsensi.filter((a) => a.status === "Alpa").length;
    const rate = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return {
      total,
      hadir,
      alpa,
      rate,
      bestClass: topClasses[0]?.class.name || "-"
    };
  }, [filteredAbsensi, topClasses]);

  const handleExportCSV = () => {
    const headers = [
      "Kelas",
      "Gender",
      "Wali Kelas",
      "Total Absensi",
      "Hadir",
      "Izin/Sakit",
      "Alpa",
      "Persentase Kehadiran",
      "Subuh %",
      "Dzuhur %",
      "Ashar %",
      "Maghrib %",
      "Isya %"
    ];

    const rows = classRecap.map((c) => [
      c.class.name,
      c.class.gender,
      `"${c.class.waliKelas.replace(/"/g, '""')}"`,
      c.total,
      c.hadir,
      c.izin,
      c.alpa,
      `${c.rate}%`,
      `${c.prayerRates.Subuh}%`,
      `${c.prayerRates.Dzuhur}%`,
      `${c.prayerRates.Ashar}%`,
      `${c.prayerRates.Maghrib}%`,
      `${c.prayerRates.Isya}%`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Presensi_Kelas_${selectedMonth}_${selectedGender}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Rekapitulasi berhasil diunduh");
  };

  return (
    <RoleShell>
      <div className="p-3 sm:p-5 md:p-7 max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/absensi"
              className="px-3.5 py-2 rounded-2xl bg-white border border-[#E2EBF4] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-[#1B4D3E]" />
              <span>Monitoring</span>
            </Link>
            <span className="text-xs text-[#94A3B8]">/</span>
            <span className="text-xs font-bold text-[#64748B]">Rekapitulasi Bulanan</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-2xl bg-white border border-[#E2EBF4] text-[#172033] text-xs font-bold hover:bg-[#FAF7EE] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#1B4D3E]" />
              <span>Unduh Rekap Excel/CSV</span>
            </button>
          </div>
        </div>

        <Card className="p-4 sm:p-5 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
            <div>
              <h1 className="text-lg sm:text-xl font-serif font-black text-[#172033]">
                Rekapitulasi Presensi Sholat Harian & Bulanan
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Evaluasi tingkat disiplin jama&apos;ah sholat santri Raudhatussalam Mahato
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  Bulan:
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 bg-[#EEF2F6] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSelectedGender("ALL")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedGender === "ALL" ? "bg-white text-[#172033] shadow-2xs" : "text-[#64748B]"
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender("Putra")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedGender === "Putra" ? "bg-white text-[#065F46] shadow-2xs" : "text-[#64748B]"
                  }`}
                >
                  L (Putra)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender("Putri")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedGender === "Putri" ? "bg-white text-[#BE123C] shadow-2xs" : "text-[#64748B]"
                  }`}
                >
                  P (Putri)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#065F46] block">
                Rata-rata Kehadiran
              </span>
              <div className="text-2xl font-black font-mono text-[#065F46] mt-0.5">
                {overallStats.rate}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4D3E] block">
                Kelas Paling Tertib
              </span>
              <div className="text-2xl font-black font-mono text-[#1B4D3E] mt-0.5">
                Kelas {overallStats.bestClass}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                Total Presensi Tercatat
              </span>
              <div className="text-2xl font-black font-mono text-[#172033] mt-0.5">
                {overallStats.total} <span className="text-xs font-normal text-[#94A3B8]">record</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E2EBF4] shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                Total Alpa Sholat
              </span>
              <div className="text-2xl font-black font-mono text-red-600 mt-0.5">
                {overallStats.alpa}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setActiveView("KELAS")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === "KELAS"
                  ? "bg-[#1B4D3E] text-white shadow-2xs"
                  : "bg-[#EEF2F6] text-[#64748B] hover:text-[#172033]"
              }`}
            >
              Matriks Disiplin Per Kelas ({classRecap.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveView("SANTRI_PERHATIAN")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === "SANTRI_PERHATIAN"
                  ? "bg-[#1B4D3E] text-white shadow-2xs"
                  : "bg-[#EEF2F6] text-[#64748B] hover:text-[#172033]"
              }`}
            >
              Santri Perlu Pembinaan ({santriAlpaAttention.length})
            </button>
          </div>
        </Card>

        {activeView === "KELAS" && (
          <Card className="p-4 sm:p-5 bg-white space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2EBF4] text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#FAF7EE]/60">
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">Wali Kelas</th>
                    <th className="p-3 text-center">Subuh</th>
                    <th className="p-3 text-center">Dzuhur</th>
                    <th className="p-3 text-center">Ashar</th>
                    <th className="p-3 text-center">Maghrib</th>
                    <th className="p-3 text-center">Isya</th>
                    <th className="p-3 text-center">Rata-rata</th>
                    <th className="p-3 text-center">Alpa</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EBF4]">
                  {classRecap.map((c) => (
                    <tr key={c.class.id} className="hover:bg-[#FAF7EE]/40 transition-colors">
                      <td className="p-3 font-bold text-[#172033] font-mono">
                        {c.class.name}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            c.class.gender === "Putra"
                              ? "bg-[#ECFDF5] text-[#065F46]"
                              : "bg-[#FFF1F2] text-[#BE123C]"
                          }`}
                        >
                          {c.class.gender === "Putra" ? "L" : "P"}
                        </span>
                      </td>
                      <td className="p-3 text-[#64748B]">{c.class.waliKelas}</td>
                      <td className="p-3 text-center font-mono font-semibold">
                        {c.prayerRates.Subuh > 0 ? `${c.prayerRates.Subuh}%` : "-"}
                      </td>
                      <td className="p-3 text-center font-mono font-semibold">
                        {c.prayerRates.Dzuhur > 0 ? `${c.prayerRates.Dzuhur}%` : "-"}
                      </td>
                      <td className="p-3 text-center font-mono font-semibold">
                        {c.prayerRates.Ashar > 0 ? `${c.prayerRates.Ashar}%` : "-"}
                      </td>
                      <td className="p-3 text-center font-mono font-semibold">
                        {c.prayerRates.Maghrib > 0 ? `${c.prayerRates.Maghrib}%` : "-"}
                      </td>
                      <td className="p-3 text-center font-mono font-semibold">
                        {c.prayerRates.Isya > 0 ? `${c.prayerRates.Isya}%` : "-"}
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-mono font-bold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-lg">
                          {c.rate}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {c.alpa > 0 ? (
                          <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg">
                            {c.alpa}
                          </span>
                        ) : (
                          <span className="text-[#94A3B8]">0</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href={`/admin/kelas/${c.class.name}`}
                          className="px-2.5 py-1 rounded-xl text-xs font-bold text-[#1B4D3E] bg-[#EEF2F6] hover:bg-[#E2E8F0] transition-colors inline-flex items-center gap-1"
                        >
                          <span>Detail</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeView === "SANTRI_PERHATIAN" && (
          <Card className="p-4 sm:p-5 bg-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Santri Terbanyak Alpa Sholat ({santriAlpaAttention.length})</span>
              </span>
              <span className="text-[11px] text-[#64748B]">
                Memerlukan bimbingan khusus dari tim pengasuhan & BK
              </span>
            </div>

            {santriAlpaAttention.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#065F46] font-semibold bg-[#ECFDF5] rounded-2xl">
                Alhamdulillah! Tidak ada santri yang tercatat alpa sholat pada periode ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2EBF4] text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#FAF7EE]/60">
                      <th className="p-3 w-10">No</th>
                      <th className="p-3">Santri</th>
                      <th className="p-3">Kelas</th>
                      <th className="p-3">Gender</th>
                      <th className="p-3 text-center">Jumlah Alpa</th>
                      <th className="p-3 text-right">Tindakan BK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2EBF4]">
                    {santriAlpaAttention.map((s, idx) => (
                      <tr key={s.santriId} className="hover:bg-[#FAF7EE]/40 transition-colors">
                        <td className="p-3 font-mono text-[#94A3B8]">{idx + 1}</td>
                        <td className="p-3">
                          <p className="font-bold text-[#172033]">{s.name}</p>
                          <p className="text-[10px] text-[#64748B] font-mono">NIS {s.santriId}</p>
                        </td>
                        <td className="p-3 font-bold font-mono">{s.class}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              s.gender === "Putra" ? "bg-[#ECFDF5] text-[#065F46]" : "bg-[#FFF1F2] text-[#BE123C]"
                            }`}
                          >
                            {s.gender === "Putra" ? "L" : "P"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-black font-mono bg-red-100 text-red-700">
                            {s.alpaCount}x Alpa
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            href={`/admin/santri/${s.santriId}`}
                            className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#153e32] transition-colors inline-flex items-center gap-1"
                          >
                            <span>Bina Santri</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </RoleShell>
  );
}
