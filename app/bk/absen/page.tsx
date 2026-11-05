"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  Search,
  Check,
  Calendar,
  Clock,
  Users,
  Eye,
  X,
  ChevronDown,
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub, CardInset } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { StatusAbsensi, WaktuSholat } from "@/lib/mock-data";
import { getWIBDate, getWIBTime } from "@/lib/date-utils";

function getAutoPrayerTime(date = new Date()): WaktuSholat {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeVal = hours * 60 + minutes;

  if (timeVal >= 180 && timeVal < 375) return "Subuh";
  if (timeVal >= 375 && timeVal < 675) return "Dhuha";
  if (timeVal >= 675 && timeVal < 885) return "Dzuhur";
  if (timeVal >= 885 && timeVal < 1065) return "Ashar";
  if (timeVal >= 1065 && timeVal < 1145) return "Maghrib";
  if (timeVal >= 1145 && timeVal <= 1439) return "Isya";
  return "Tahajjud";
}

const PRAYER_TIMES: WaktuSholat[] = [
  "Subuh",
  "Dhuha",
  "Dzuhur",
  "Ashar",
  "Maghrib",
  "Isya",
  "Tahajjud"
];

export default function PengasuhanAbsenPage() {
  const router = useRouter();
  const { accessibleSantriList, kelasList, currentUser, batchAddAbsensi, showToast, settings } = useMizan();

  const [selectedPrayer, setSelectedPrayer] = useState<WaktuSholat>(() => getAutoPrayerTime());
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const canToggleGender = isSuperAdmin;
  const userGender = (currentUser.gender === "Putri" ? "Putri" : "Putra") as "Putra" | "Putri";
  const [selectedGender, setSelectedGender] = useState<"Putra" | "Putri">(userGender);

  useEffect(() => {
    if (currentUser?.gender && !isSuperAdmin) {
      setSelectedGender(currentUser.gender === "Putri" ? "Putri" : "Putra");
    }
  }, [currentUser?.gender, isSuperAdmin]);

  const availableClasses = useMemo(() => {
    const list = kelasList.length > 0 ? kelasList : ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B", "6A", "6B"];
    if (isSuperAdmin) return list;
    if (userGender === "Putri") {
      return list.filter((c) => c.endsWith("B"));
    }
    return list.filter((c) => c.endsWith("A"));
  }, [kelasList, isSuperAdmin, userGender]);

  const [selectedClass, setSelectedClass] = useState<string>(
    userGender === "Putri" ? "1B" : "1A"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-31");
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("04:30 WIB");
  const [attendanceMap, setAttendanceMap] = useState<Record<string, StatusAbsensi>>({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [attendancePhoto, setAttendancePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const now = new Date();
      setSelectedDate(getWIBDate(now));
      setCurrentTimeStr(getWIBTime(now) + " WIB");
      setSelectedPrayer(getAutoPrayerTime(now));
    } catch {
      void 0;
    }
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran foto maksimal 5 MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAttendancePhoto(reader.result as string);
      showToast("Foto bukti absensi berhasil dimuat", "success");
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!availableClasses.includes(selectedClass) && availableClasses.length > 0) {
      setSelectedClass(availableClasses[0]);
    }
  }, [availableClasses, selectedClass]);

  const studentsInClass = useMemo(() => {
    return accessibleSantriList.filter((s) => {
      const matchClass = s.class === selectedClass;
      const targetGender = isSuperAdmin ? selectedGender : userGender;
      const matchGender = s.gender === targetGender;
      const matchSearch =
        searchQuery.trim() === "" ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.includes(searchQuery);
      return matchClass && matchGender && matchSearch;
    });
  }, [accessibleSantriList, selectedClass, isSuperAdmin, selectedGender, userGender, searchQuery]);

  const getAttendanceStatus = (santriId: string): StatusAbsensi => {
    return attendanceMap[santriId] || "Hadir";
  };

  const handleSetStatus = (santriId: string, status: StatusAbsensi) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [santriId]: status
    }));
  };

  const handleMarkAllHadir = () => {
    const updated: Record<string, StatusAbsensi> = { ...attendanceMap };
    studentsInClass.forEach((s) => {
      updated[s.id] = "Hadir";
    });
    setAttendanceMap(updated);
    showToast(`Semua santri ${selectedClass} ditandai Hadir`, "info");
  };

  const stats = useMemo(() => {
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;

    studentsInClass.forEach((s) => {
      const st = getAttendanceStatus(s.id);
      if (st === "Hadir") hadir++;
      else if (st === "Izin") izin++;
      else if (st === "Sakit") sakit++;
      else if (st === "Alpa") alpa++;
    });

    return { hadir, izin, sakit, alpa };
  }, [studentsInClass, attendanceMap]);

  const nonHadirStudents = useMemo(() => {
    return studentsInClass
      .filter((s) => getAttendanceStatus(s.id) !== "Hadir")
      .map((s) => ({
        ...s,
        status: getAttendanceStatus(s.id)
      }));
  }, [studentsInClass, attendanceMap]);

  const handleConfirmSave = () => {
    if (studentsInClass.length === 0) {
      showToast("Tidak ada data santri dalam kelas ini.", "error");
      return;
    }

    const records = studentsInClass.map((s) => {
      const status = getAttendanceStatus(s.id);
      let scoreImpact = 0.0;
      if (status === "Hadir") scoreImpact = settings.absenHadirScore ?? 0.050;
      else if (status === "Alpa") scoreImpact = settings.absenAlpaScore ?? -0.050;
      else if (status === "Izin") scoreImpact = settings.absenIzinScore ?? 0.000;
      else if (status === "Sakit") scoreImpact = settings.absenSakitScore ?? 0.000;

      return {
        santriId: s.id,
        santriName: s.name,
        santriClass: s.class,
        gender: s.gender,
        guruId: currentUser.id,
        guruName: currentUser.name,
        waktuSholat: selectedPrayer,
        date: selectedDate,
        status,
        scoreImpact
      };
    });

    batchAddAbsensi(records);
    setShowReviewModal(false);
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="mizan-card p-4 sm:p-5 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h1 className="text-lg sm:text-xl font-serif font-black text-[#172033]">
                Absensi Sholat Santri
              </h1>
              <p className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-[#A8833E]" /> {currentTimeStr}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                Pilih Waktu Sholat
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-[#065F46]" />
                <span>Otomatis {selectedPrayer}</span>
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {PRAYER_TIMES.map((time) => {
                const isSelected = selectedPrayer === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedPrayer(time)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                      isSelected
                        ? "bg-[#1B4D3E] text-white shadow-xs"
                        : "bg-[#EEF2F6] text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#1B4D3E]" />
                <span>Foto Bukti Waktu Absen Sholat</span>
              </label>
              {attendancePhoto && (
                <span className="text-[10px] font-bold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                  Foto Siap
                </span>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
            />

            {!attendancePhoto ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[#FAF7EE]/50 hover:bg-[#FAF7EE] hover:border-[#1B4D3E]/40 transition-all cursor-pointer flex items-center justify-center gap-2.5 text-[#64748B]"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#1B4D3E] shadow-2xs">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#172033]">Ambil Foto / Unggah Bukti Sholat</p>
                  <p className="text-[10px] text-[#94A3B8]">Dokumentasi jama&apos;ah sholat santri di masjid/musholla</p>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-2xl bg-white border border-[#E2EBF4] flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img
                      src={attendancePhoto}
                      alt="Bukti Absen"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#172033] truncate">Foto Bukti Terlampir</p>
                    <p className="text-[10px] text-[#64748B]">Sholat {selectedPrayer} • {selectedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#FAF7EE] text-[#172033] hover:bg-[#F0ECE1] border border-[#E2E8F0] transition-colors cursor-pointer"
                  >
                    Ganti
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendancePhoto(null)}
                    className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Hapus Foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                Kategori Santri
              </label>
              {canToggleGender ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {(["Putra", "Putri"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGender(g)}
                      className={`py-1.5 rounded-xl text-xs font-bold text-center transition-all ${
                        selectedGender === g
                          ? "bg-[#172033] text-white shadow-xs"
                          : "bg-[#EEF2F6] text-[#64748B]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-1.5 px-3 rounded-xl text-xs font-bold bg-[#1B4D3E] text-white text-center">
                  Santri {userGender}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                Pilih Kelas
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EEF2F6] border border-transparent text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
              >
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative pt-1">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama santri atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <CardSub className="p-2.5 text-center">
            <span className="text-base sm:text-lg font-black font-mono text-[#065F46] block">
              {stats.hadir}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block">Hadir</span>
          </CardSub>

          <CardSub className="p-2.5 text-center">
            <span className="text-base sm:text-lg font-black font-mono text-[#854D0E] block">
              {stats.izin}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block">Izin</span>
          </CardSub>

          <CardSub className="p-2.5 text-center">
            <span className="text-base sm:text-lg font-black font-mono text-blue-700 block">
              {stats.sakit}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block">Sakit</span>
          </CardSub>

          <CardSub className="p-2.5 text-center">
            <span className="text-base sm:text-lg font-black font-mono text-red-600 block">
              {stats.alpa}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block">Alpa</span>
          </CardSub>
        </div>

        <Card className="p-4 sm:p-5 space-y-3 bg-white">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#1B4D3E]" />
              Daftar Santri ({studentsInClass.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllHadir}
                className="text-[11px] font-bold text-[#065F46] bg-[#ECFDF5] px-3 py-1.5 rounded-xl border border-[#A7F3D0] hover:bg-[#D1FAE5] transition-colors cursor-pointer"
              >
                Semua Hadir
              </button>
              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-1.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Absensi</span>
              </button>
            </div>
          </div>

          {studentsInClass.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#94A3B8]">
              Tidak ada data santri untuk filter kelas dan kategori ini.
            </div>
          ) : (
            <div className="space-y-2">
              {studentsInClass.map((santri) => {
                const currentStatus = getAttendanceStatus(santri.id);
                const pointDelta =
                  currentStatus === "Hadir"
                    ? settings.absenHadirScore ?? 0.050
                    : currentStatus === "Alpa"
                    ? settings.absenAlpaScore ?? -0.050
                    : currentStatus === "Izin"
                    ? settings.absenIzinScore ?? 0.000
                    : settings.absenSakitScore ?? 0.000;
                const projectedScore = Math.max(0, Math.min(100, santri.currentScore + pointDelta));

                return (
                  <div
                    key={santri.id}
                    className="p-3.5 rounded-2xl mizan-card-sub flex items-center justify-between gap-3 hover:border-[#1B4D3E]/30 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Avatar
                        initials={santri.avatar}
                        size="sm"
                        variant={santri.gender === "Putra" ? "primary" : "gold"}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#172033] truncate">
                          {santri.name}
                        </p>
                        <p className="text-[10px] text-[#64748B] font-mono">
                          NIS {santri.nis} • {santri.class}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="relative">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleSetStatus(santri.id, e.target.value as StatusAbsensi)}
                          className={`appearance-none px-3 py-1.5 pr-7 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none ${
                            currentStatus === "Hadir"
                              ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                              : currentStatus === "Izin"
                              ? "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]"
                              : currentStatus === "Sakit"
                              ? "bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]"
                              : "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
                          }`}
                        >
                          <option value="Hadir">Hadir</option>
                          <option value="Izin">Izin</option>
                          <option value="Sakit">Sakit</option>
                          <option value="Alpa">Alpa</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>

                      <div className="flex flex-col items-end min-w-[72px]">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-black font-mono text-[#172033]">
                            {projectedScore.toFixed(3).replace(".", ",")}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-md ${
                            pointDelta > 0
                              ? "bg-[#ECFDF5] text-[#065F46]"
                              : pointDelta < 0
                              ? "bg-[#FEF2F2] text-[#991B1B]"
                              : "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {pointDelta > 0
                            ? `+${pointDelta.toFixed(3).replace(".", ",")}`
                            : pointDelta < 0
                            ? pointDelta.toFixed(3).replace(".", ",")
                            : "0,000"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-[#64748B]">
              <span className="font-bold text-[#172033]">{stats.hadir}</span> Hadir •{" "}
              <span className="font-bold text-amber-700">{stats.izin}</span> Izin •{" "}
              <span className="font-bold text-blue-700">{stats.sakit}</span> Sakit •{" "}
              <span className="font-bold text-red-600">{stats.alpa}</span> Alpa
              {attendancePhoto && (
                <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                  • Foto terlampir
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="px-5 py-2.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Absensi ({stats.hadir} Hadir)</span>
            </button>
          </div>
        </Card>

        <div className="fixed bottom-16 md:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 z-20">
          <button
            type="button"
            onClick={() => setShowReviewModal(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#1B4D3E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl hover:bg-[#153e32] active:scale-[0.99] transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Simpan</span>
          </button>
        </div>

        {showReviewModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md mizan-card p-5 bg-white space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                  Konfirmasi Absensi Sholat {selectedPrayer}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="p-1 rounded-lg text-[#94A3B8] hover:text-[#172033]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {attendancePhoto && (
                <div className="relative rounded-xl overflow-hidden border border-[#E2E8F0] bg-slate-100 max-h-40">
                  <img
                    src={attendancePhoto}
                    alt="Bukti Absensi"
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                    Bukti Sholat {selectedPrayer}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-[#ECFDF5] text-[#065F46]">
                  <span className="text-sm font-black block">{stats.hadir}</span>
                  <span className="text-[10px] font-bold">Hadir</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 text-[#854D0E]">
                  <span className="text-sm font-black block">{stats.izin}</span>
                  <span className="text-[10px] font-bold">Izin</span>
                </div>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <span className="text-sm font-black block">{stats.sakit}</span>
                  <span className="text-[10px] font-bold">Sakit</span>
                </div>
                <div className="p-2 rounded-xl bg-red-50 text-red-600">
                  <span className="text-sm font-black block">{stats.alpa}</span>
                  <span className="text-[10px] font-bold">Alpa</span>
                </div>
              </div>

              {nonHadirStudents.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-[#172033]">
                    Santri Tidak Hadir ({nonHadirStudents.length}):
                  </p>
                  <div className="max-h-36 overflow-y-auto space-y-1 p-2 rounded-xl bg-[#F8FAFC]">
                    {nonHadirStudents.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg"
                      >
                        <span className="font-semibold text-[#172033]">{s.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.status === "Alpa"
                              ? "bg-red-100 text-red-700"
                              : s.status === "Sakit"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#ECFDF5] text-xs text-[#065F46] font-semibold text-center">
                  Alhamdulillah, seluruh santri kelas {selectedClass} hadir lengkap.
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#64748B] bg-[#EEF2F6] hover:bg-[#E2E8F0]"
                >
                  Periksa
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#153e32]"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleShell>
  );
}
