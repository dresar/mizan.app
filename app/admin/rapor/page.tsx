"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  FileText,
  Printer,
  Users,
  Award,
  Clock,
  X,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Bell
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { CardSub } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Santri, formatScore, formatScoreWithSign } from "@/lib/mock-data";
import { generateSantriPdf } from "@/lib/pdf-generator";

function getPredikatAdab(score: number): { label: string; badgeCls: string } {
  if (score >= 85) {
    return {
      label: "Mumtaz",
      badgeCls: "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
    };
  }
  if (score >= 75) {
    return {
      label: "Jayyid Jiddan",
      badgeCls: "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]"
    };
  }
  if (score >= 65) {
    return {
      label: "Jayyid",
      badgeCls: "bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]"
    };
  }
  if (score >= 55) {
    return {
      label: "Perhatian",
      badgeCls: "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]"
    };
  }
  return {
    label: "Perlu Pembinaan",
    badgeCls: "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]"
  };
}

export default function AdminRaporPage() {
  const {
    santriList,
    penilaianList,
    absensiList,
    kelasList,
    showToast,
    refreshData
  } = useMizan();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedPredikat, setSelectedPredikat] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"score_desc" | "score_asc" | "name_asc" | "nis_asc">("score_desc");
  const [selectedDetailSantri, setSelectedDetailSantri] = useState<Santri | null>(null);
  const [isAlertBannerVisible, setIsAlertBannerVisible] = useState(true);
  const [isPrintingAll, setIsPrintingAll] = useState(false);

  const santriAnalytics = useMemo(() => {
    return santriList.map((s) => {
      const studentPenilaian = penilaianList.filter((p) => p.santriId === s.id);
      const studentAbsensi = absensiList.filter((a) => a.santriId === s.id);

      const hasanahRecords = studentPenilaian.filter((p) => p.type === "HASANAH");
      const hasanahScore = hasanahRecords.reduce((acc, p) => acc + (p.score || 0), 0);

      const sayyiahRecords = studentPenilaian.filter((p) => p.type === "SAYYIAH");
      const sayyiahScore = sayyiahRecords.reduce((acc, p) => acc + (p.score || 0), 0);

      const hadirCount = studentAbsensi.filter((a) => a.status === "Hadir").length;
      const totalRecordedAbsensi = studentAbsensi.length;
      const effectiveHadir = totalRecordedAbsensi > 0 ? hadirCount : (s.totalHadir || 28);
      const effectiveTotal = totalRecordedAbsensi > 0 ? totalRecordedAbsensi : 28;
      const attendancePercent = ((effectiveHadir / effectiveTotal) * 100).toFixed(1);

      const predikat = getPredikatAdab(s.currentScore);

      return {
        santri: s,
        hasanahScore,
        hasanahCount: hasanahRecords.length,
        sayyiahScore,
        sayyiahCount: sayyiahRecords.length,
        effectiveHadir,
        effectiveTotal,
        attendancePercent,
        predikat,
        studentPenilaian,
        studentAbsensi
      };
    });
  }, [santriList, penilaianList, absensiList]);

  const summary = useMemo(() => {
    const total = santriAnalytics.length || 1;
    const putraCount = santriAnalytics.filter((item) => item.santri.gender === "Putra").length;
    const putriCount = santriAnalytics.filter((item) => item.santri.gender === "Putri").length;
    const avgScore = santriAnalytics.reduce((acc, item) => acc + item.santri.currentScore, 0) / total;
    const mumtazCount = santriAnalytics.filter((item) => item.santri.currentScore >= 85).length;
    const lulusCount = santriAnalytics.filter((item) => item.santri.currentScore >= 65).length;
    const attentionCount = santriAnalytics.filter((item) => item.santri.currentScore < 65).length;

    return {
      total: santriAnalytics.length,
      putraCount,
      putriCount,
      avgScore,
      mumtazCount,
      passRate: ((lulusCount / total) * 100).toFixed(1),
      attentionCount
    };
  }, [santriAnalytics]);

  const filteredItems = useMemo(() => {
    return santriAnalytics.filter((item) => {
      const matchGender = selectedGender === "ALL" || item.santri.gender === selectedGender;
      const matchClass = selectedClass === "ALL" || item.santri.class === selectedClass;
      const matchSearch =
        item.santri.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.santri.nis.includes(searchQuery);

      let matchPredikat = true;
      if (selectedPredikat === "MUMTAZ") matchPredikat = item.santri.currentScore >= 85;
      else if (selectedPredikat === "JAYYID_JIDDAN") matchPredikat = item.santri.currentScore >= 75 && item.santri.currentScore < 85;
      else if (selectedPredikat === "JAYYID") matchPredikat = item.santri.currentScore >= 65 && item.santri.currentScore < 75;
      else if (selectedPredikat === "PERHATIAN") matchPredikat = item.santri.currentScore < 65;

      return matchGender && matchClass && matchSearch && matchPredikat;
    }).sort((a, b) => {
      if (sortBy === "score_desc") return b.santri.currentScore - a.santri.currentScore;
      if (sortBy === "score_asc") return a.santri.currentScore - b.santri.currentScore;
      if (sortBy === "name_asc") return a.santri.name.localeCompare(b.santri.name);
      if (sortBy === "nis_asc") return a.santri.nis.localeCompare(b.santri.nis);
      return 0;
    });
  }, [santriAnalytics, selectedGender, selectedClass, searchQuery, selectedPredikat, sortBy]);

  const handlePrintSingle = (item: (typeof santriAnalytics)[0]) => {
    try {
      showToast(`Mengunduh rapor ${item.santri.name}...`, "info");
      generateSantriPdf(item.santri, item.studentPenilaian, item.studentAbsensi);
      showToast(`Rapor ${item.santri.name} berhasil diunduh`, "success");
    } catch {
      showToast("Gagal mengunduh rapor", "error");
    }
  };

  const handlePrintAllVisible = () => {
    if (filteredItems.length === 0) {
      showToast("Tidak ada data rapor untuk dicetak", "error");
      return;
    }
    setIsPrintingAll(true);
    showToast(`Menyiapkan ${filteredItems.length} berkas rapor santri...`, "info");
    filteredItems.forEach((item, index) => {
      setTimeout(() => {
        try {
          generateSantriPdf(item.santri, item.studentPenilaian, item.studentAbsensi);
        } catch {
          void 0;
        }
        if (index === filteredItems.length - 1) {
          setIsPrintingAll(false);
          showToast(`Semua rapor (${filteredItems.length} santri) selesai diunduh`, "success");
        }
      }, index * 250);
    });
  };

  const handleRefresh = async () => {
    showToast("Memperbarui data rapor...", "info");
    await refreshData();
    showToast("Data rapor berhasil diperbarui", "success");
  };

  const activeDetailData = useMemo(() => {
    if (!selectedDetailSantri) return null;
    return santriAnalytics.find((item) => item.santri.id === selectedDetailSantri.id) || null;
  }, [selectedDetailSantri, santriAnalytics]);

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="mizan-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/30">
                Pusat Evaluasi & Rapor
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                {santriAnalytics.length} Santri Terdata
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-serif font-black text-[#172033] tracking-tight mt-1">
              Rapor Akhlak & Adab Santri
            </h1>
            <p className="text-[11px] text-[#64748B]">
              Rekapitulasi komprehensif penilaian adab, hasanah, sayyi&apos;ah, dan presensi sholat 7 waktu santri dan santriwati
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#D4C9B5] text-[#172033] hover:bg-[#FAF7EE] text-xs font-bold shadow-2xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#A8833E]" />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              disabled={isPrintingAll || filteredItems.length === 0}
              onClick={handlePrintAllVisible}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1B4D3E] text-white hover:bg-[#153e32] text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
          </div>
        </div>

        {isAlertBannerVisible && (
          <div className="mizan-card p-3.5 sm:p-4 bg-[#FAF7EE] border-2 border-[#C5A059]/40 flex items-start justify-between gap-3 transition-all">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#C5A059]/40 flex items-center justify-center shrink-0 text-[#A8833E] mt-0.5 shadow-2xs">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#172033] tracking-tight">
                    Notifikasi Evaluasi Rapor Santri
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#1B4D3E] text-white">
                    Aktif
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                  Terdapat <strong className="text-[#B91C1C] font-bold">{summary.attentionCount} santri</strong> dalam batas perhatian pembinaan khusus, dan <strong className="text-[#065F46] font-bold">{summary.mumtazCount} santri</strong> meraih predikat Mumtaz. Seluruh lembar rapor dapat langsung dicetak per santri atau massal.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAlertBannerVisible(false)}
              className="p-1 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-black/5 shrink-0 transition-colors"
              aria-label="Tutup Notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <CardSub className="p-4 bg-white">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Santri</span>
              <div className="w-8 h-8 rounded-xl mizan-inset text-[#1B4D3E] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#172033]">
              {summary.total}
            </div>
            <p className="text-[10px] text-[#64748B] mt-1 font-semibold">
              {summary.putraCount} Santri Putra • {summary.putriCount} Santriwati
            </p>
          </CardSub>

          <CardSub className="p-4 bg-white">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Rata-Rata Adab</span>
              <div className="w-8 h-8 rounded-xl mizan-inset text-[#A8833E] flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#172033]">
              {formatScore(summary.avgScore)}
            </div>
            <p className="text-[10px] text-[#64748B] mt-1 font-semibold">
              Standar minimum kelulusan: 65,000
            </p>
          </CardSub>

          <CardSub className="p-4 bg-white">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Kelulusan Adab</span>
              <div className="w-8 h-8 rounded-xl mizan-inset text-[#065F46] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#065F46]">
              {summary.passRate}%
            </div>
            <p className="text-[10px] text-[#065F46] mt-1 font-semibold">
              {summary.mumtazCount} Santri Predikat Mumtaz
            </p>
          </CardSub>

          <CardSub className="p-4 bg-white">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Perlu Binaan</span>
              <div className="w-8 h-8 rounded-xl mizan-inset text-[#B91C1C] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#B91C1C]">
              {summary.attentionCount}
            </div>
            <p className="text-[10px] text-[#B91C1C] mt-1 font-semibold">
              Skor adab di bawah 65,000
            </p>
          </CardSub>
        </div>

        <div className="mizan-card p-3 sm:p-4 bg-white space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                placeholder="Cari santri berdasarkan nama lengkap atau NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-2xl text-[#172033] font-medium focus:outline-none focus:border-[#1B4D3E]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-2xl p-0.5 bg-[#FAF7EE] border border-[#E2EBF4] shrink-0">
                {(["ALL", "Putra", "Putri"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setSelectedGender(g);
                      showToast(`Filter gender: ${g === "ALL" ? "Semua" : g}`, "info");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedGender === g
                        ? "bg-[#1B4D3E] text-white shadow-2xs"
                        : "text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    {g === "ALL" ? "Semua" : g === "Putra" ? "Santri (Putra)" : "Santriwati (Putri)"}
                  </button>
                ))}
              </div>

              <select
                aria-label="Pilih Kelas"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  showToast(`Filter kelas: ${e.target.value === "ALL" ? "Semua Kelas" : `Kelas ${e.target.value}`}`, "info");
                }}
                className="px-3 py-2 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-2xl text-[#172033] font-bold focus:outline-none shrink-0"
              >
                <option value="ALL">Semua Kelas</option>
                {kelasList.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>

              <select
                aria-label="Pilih Predikat"
                value={selectedPredikat}
                onChange={(e) => setSelectedPredikat(e.target.value)}
                className="px-3 py-2 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-2xl text-[#172033] font-bold focus:outline-none shrink-0"
              >
                <option value="ALL">Semua Predikat</option>
                <option value="MUMTAZ">Mumtaz (≥ 85)</option>
                <option value="JAYYID_JIDDAN">Jayyid Jiddan (75 - 84.9)</option>
                <option value="JAYYID">Jayyid (65 - 74.9)</option>
                <option value="PERHATIAN">Perlu Pembinaan (&lt; 65)</option>
              </select>

              <select
                aria-label="Urutkan"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "score_desc" | "score_asc" | "name_asc" | "nis_asc")}
                className="px-3 py-2 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-2xl text-[#172033] font-bold focus:outline-none shrink-0"
              >
                <option value="score_desc">Skor Tertinggi</option>
                <option value="score_asc">Skor Terendah</option>
                <option value="name_asc">Nama A-Z</option>
                <option value="nis_asc">Nomor NIS</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mizan-card overflow-hidden bg-white border border-[#E2EBF4]">
          <div className="px-4 py-3 bg-[#FAF7EE] border-b border-[#E2EBF4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1B4D3E]" />
              <span className="text-xs font-bold text-[#172033]">
                Lembar Data Rapor Terpadu ({filteredItems.length} Santri)
              </span>
            </div>
            <span className="text-[10px] text-[#64748B] font-semibold">
              Tahun Ajaran 2026/2027 • Semester Ganjil
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E2EBF4] bg-[#F8FAFC] text-[#64748B] font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-3.5 w-12 text-center">No</th>
                  <th className="py-3 px-3.5">Santri / Santriwati</th>
                  <th className="py-3 px-3 text-center">Skor Awal</th>
                  <th className="py-3 px-3 text-center">Prestasi (Hasanah)</th>
                  <th className="py-3 px-3 text-center">Pelanggaran (Sayyi&apos;ah)</th>
                  <th className="py-3 px-3 text-center">Sholat 7 Waktu</th>
                  <th className="py-3 px-3 text-center">Skor Akhir Adab</th>
                  <th className="py-3 px-3 text-center">Predikat Kelulusan</th>
                  <th className="py-3 px-3.5 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2EBF4]">
                {filteredItems.map((item, index) => {
                  const s = item.santri;
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-[#FAF7EE]/60 transition-colors group"
                    >
                      <td className="py-3 px-3.5 text-center font-mono font-bold text-[#64748B]">
                        {index + 1}
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={s.avatar}
                            initials={s.name.slice(0, 2).toUpperCase()}
                            size="sm"
                            variant={s.gender === "Putri" ? "gold" : "primary"}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-[#172033] truncate max-w-[200px]">
                              {s.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-[#64748B]">
                                NIS: {s.nis}
                              </span>
                              <span className="text-[10px] text-[#64748B]">•</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#EEF2F6] text-[#172033]">
                                Kelas {s.class}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  s.gender === "Putra"
                                    ? "bg-[#EFF6FF] text-[#1D4ED8]"
                                    : "bg-[#FDF2F8] text-[#BE185D]"
                                }`}
                              >
                                {s.gender}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-semibold text-[#64748B]">
                        {formatScore(s.baseScore)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-[#065F46] block">
                          +{formatScore(item.hasanahScore)}
                        </span>
                        <span className="text-[10px] text-[#64748B] font-medium block mt-0.5">
                          {item.hasanahCount} Catatan
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-[#B91C1C] block">
                          {item.sayyiahScore !== 0 ? formatScoreWithSign(item.sayyiahScore) : "0,000"}
                        </span>
                        <span className="text-[10px] text-[#64748B] font-medium block mt-0.5">
                          {item.sayyiahCount} Catatan
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-[#172033] block">
                          {item.attendancePercent}%
                        </span>
                        <span className="text-[10px] text-[#065F46] font-semibold block mt-0.5">
                          {item.effectiveHadir}/{item.effectiveTotal} Hadir
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-mono text-sm font-black px-2.5 py-1 rounded-xl inline-block ${
                            s.currentScore >= 85
                              ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                              : s.currentScore >= 65
                              ? "bg-white text-[#172033] border border-[#E2EBF4]"
                              : "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]"
                          }`}
                        >
                          {formatScore(s.currentScore)}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${item.predikat.badgeCls}`}>
                          {item.predikat.label}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailSantri(s)}
                            className="px-2.5 py-1 rounded-lg bg-[#FAF7EE] text-[#A8833E] hover:bg-[#C5A059] hover:text-white text-[11px] font-bold border border-[#C5A059]/30 transition-colors"
                          >
                            Detail
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePrintSingle(item)}
                            className="px-2.5 py-1 rounded-lg bg-[#1B4D3E] text-white hover:bg-[#153e32] text-[11px] font-bold transition-colors"
                          >
                            Cetak
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-xs text-[#94A3B8]">
                      Tidak ada santri atau santriwati yang sesuai dengan filter pencarian rapor
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#FAF7EE]/60 border-t border-[#E2EBF4] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#64748B]">
            <span>
              Menampilkan <strong className="text-[#172033]">{filteredItems.length}</strong> dari <strong className="text-[#172033]">{santriAnalytics.length}</strong> seluruh data santri
            </span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Skor Kelulusan: Mumtaz (≥85) • Jayyid (≥65) • Perhatian (&lt;65)</span>
            </div>
          </div>
        </div>

        {selectedDetailSantri && activeDetailData && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E2EBF4] flex flex-col max-h-[90vh] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#E2EBF4] flex items-center justify-between bg-[#FAF7EE]">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={selectedDetailSantri.avatar}
                    initials={selectedDetailSantri.name.slice(0, 2).toUpperCase()}
                    size="md"
                    variant={selectedDetailSantri.gender === "Putri" ? "gold" : "primary"}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#172033]">
                        {selectedDetailSantri.name}
                      </h3>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${activeDetailData.predikat.badgeCls}`}>
                        {activeDetailData.predikat.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      NIS: {selectedDetailSantri.nis} • Kelas {selectedDetailSantri.class} ({selectedDetailSantri.gender}) • {selectedDetailSantri.asrama || "Asrama Pondok"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDetailSantri(null)}
                  className="p-1.5 rounded-xl hover:bg-black/5 text-[#64748B] hover:text-[#172033]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/30">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                      Skor Akhir Adab
                    </span>
                    <span className="text-xl font-black font-mono text-[#1B4D3E] mt-1 block">
                      {formatScore(selectedDetailSantri.currentScore)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]">
                    <span className="text-[10px] font-bold text-[#065F46] uppercase block">
                      Prestasi Hasanah
                    </span>
                    <span className="text-xl font-black font-mono text-[#065F46] mt-1 block">
                      +{formatScore(activeDetailData.hasanahScore)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#FECACA]">
                    <span className="text-[10px] font-bold text-[#B91C1C] uppercase block">
                      Penalti Sayyi&apos;ah
                    </span>
                    <span className="text-xl font-black font-mono text-[#B91C1C] mt-1 block">
                      {activeDetailData.sayyiahScore !== 0 ? formatScoreWithSign(activeDetailData.sayyiahScore) : "0,000"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#A8833E]" />
                    Presensi Sholat 7 Waktu Santri
                  </h4>
                  <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2EBF4] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#172033]">
                        Tingkat Kehadiran: {activeDetailData.attendancePercent}%
                      </p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Tercatat hadir {activeDetailData.effectiveHadir} dari {activeDetailData.effectiveTotal} sesi sholat fardhu &amp; sunnah
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                      Istiqamah
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#065F46]" />
                    Catatan Hasanah Terakhir ({activeDetailData.hasanahCount})
                  </h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {activeDetailData.studentPenilaian
                      .filter((p) => p.type === "HASANAH")
                      .map((p) => (
                        <div
                          key={p.id}
                          className="p-2.5 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5]/50 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-[#172033]">{p.unsurName || p.indicatorText}</p>
                            <p className="text-[10px] text-[#64748B]">
                              Oleh {p.guruName} • {p.date || p.createdAt || p.dateKey}
                            </p>
                          </div>
                          <span className="font-mono font-bold text-[#065F46]">
                            +{formatScore(p.score)}
                          </span>
                        </div>
                      ))}
                    {activeDetailData.hasanahCount === 0 && (
                      <p className="text-xs text-[#94A3B8] italic">Belum ada catatan hasanah khusus</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#B91C1C]" />
                    Catatan Sayyi&apos;ah Terakhir ({activeDetailData.sayyiahCount})
                  </h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {activeDetailData.studentPenilaian
                      .filter((p) => p.type === "SAYYIAH")
                      .map((p) => (
                        <div
                          key={p.id}
                          className="p-2.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2]/50 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-[#172033]">{p.unsurName || p.indicatorText}</p>
                            <p className="text-[10px] text-[#64748B]">
                              Oleh {p.guruName} • {p.date || p.createdAt || p.dateKey}
                            </p>
                          </div>
                          <span className="font-mono font-bold text-[#B91C1C]">
                            {formatScoreWithSign(p.score)}
                          </span>
                        </div>
                      ))}
                    {activeDetailData.sayyiahCount === 0 && (
                      <p className="text-xs text-[#94A3B8] italic">Alhamdulillah, nihil pelanggaran</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#E2EBF4] bg-[#FAF7EE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDetailSantri(null)}
                  className="px-4 py-2 rounded-full border border-[#D4C9B5] text-[#172033] text-xs font-bold hover:bg-white"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintSingle(activeDetailData)}
                  className="px-4 py-2 rounded-full bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32]"
                >
                  Cetak
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleShell>
  );
}
