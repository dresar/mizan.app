"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  X
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub, CardInset } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { StatusAbsensi, WaktuSholat } from "@/lib/mock-data";

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
  const { santriList, kelasList, currentUser, batchAddAbsensi, showToast } = useMizan();

  const [selectedPrayer, setSelectedPrayer] = useState<WaktuSholat>("Subuh");
  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const userGender = currentUser.gender || "Putra";
  const [selectedGender, setSelectedGender] = useState<"Putra" | "Putri">(
    isSuperAdmin ? "Putra" : userGender
  );

  useEffect(() => {
    if (!isSuperAdmin) {
      setSelectedGender(userGender);
    }
  }, [isSuperAdmin, userGender]);
  const [selectedClass, setSelectedClass] = useState<string>("1A");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-31");
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("04:30 WIB");
  const [attendanceMap, setAttendanceMap] = useState<Record<string, StatusAbsensi>>({});
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    try {
      const now = new Date();
      setSelectedDate(now.toISOString().split("T")[0]);
      setCurrentTimeStr(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta"
        }) + " WIB"
      );
    } catch {
      void 0;
    }
  }, []);

  const availableClasses = useMemo(() => {
    return kelasList.length > 0 ? kelasList : ["1A", "1B", "1C", "1D", "2A", "2B"];
  }, [kelasList]);

  useEffect(() => {
    if (!availableClasses.includes(selectedClass) && availableClasses.length > 0) {
      setSelectedClass(availableClasses[0]);
    }
  }, [availableClasses, selectedClass]);

  const studentsInClass = useMemo(() => {
    return santriList.filter((s) => {
      const matchClass = s.class === selectedClass;
      const matchGender = s.gender === selectedGender;
      const matchSearch =
        searchQuery.trim() === "" ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.includes(searchQuery);
      return matchClass && matchGender && matchSearch;
    });
  }, [santriList, selectedClass, selectedGender, searchQuery]);

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
      if (status === "Hadir") scoreImpact = 0.050;
      else if (status === "Alpa") scoreImpact = -0.050;

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
      <div className="space-y-4 max-w-4xl mx-auto overflow-x-hidden pb-20">
        <div className="mizan-card p-4 sm:p-5 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                  Bagian Pengasuhan Santri (BK)
                </span>
                <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#A8833E]" /> {currentTimeStr}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-serif font-black text-[#172033] mt-1">
                Absensi Sholat Santri
              </h1>
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
              Pilih Waktu Sholat
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {PRAYER_TIMES.map((time) => {
                const isSelected = selectedPrayer === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedPrayer(time)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
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

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                Kategori Santri
              </label>
              {isSuperAdmin ? (
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
                  <option key={cls} value={cls}>Kelas {cls}</option>
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
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#1B4D3E]" />
              Daftar Santri ({studentsInClass.length})
            </span>
            <button
              type="button"
              onClick={handleMarkAllHadir}
              className="text-[11px] font-bold text-[#065F46] bg-[#ECFDF5] px-3 py-1 rounded-full mizan-pill hover:bg-[#D1FAE5] transition-colors"
            >
              Semua
            </button>
          </div>

          {studentsInClass.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#94A3B8]">
              Tidak ada data santri untuk filter kelas dan kategori ini.
            </div>
          ) : (
            <div className="space-y-2">
              {studentsInClass.map((santri) => {
                const currentStatus = getAttendanceStatus(santri.id);

                return (
                  <div
                    key={santri.id}
                    className="p-3 rounded-2xl mizan-card-sub flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-[#1B4D3E]/30 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        initials={santri.avatar}
                        size="sm"
                        variant={santri.gender === "Putra" ? "primary" : "gold"}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#172033] truncate">
                          {santri.name}
                        </p>
                        <p className="text-[10px] text-[#64748B]">
                          NIS {santri.nis} • Skor: {santri.currentScore.toFixed(3).replace(".", ",")}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 shrink-0">
                      {(["Hadir", "Izin", "Sakit", "Alpa"] as const).map((status) => {
                        const isSelected = currentStatus === status;

                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleSetStatus(santri.id, status)}
                            className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition-all text-center ${
                              isSelected
                                ? status === "Hadir"
                                  ? "bg-[#1B4D3E] text-white shadow-xs"
                                  : status === "Izin"
                                  ? "bg-[#A8833E] text-white shadow-xs"
                                  : status === "Sakit"
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : "bg-red-600 text-white shadow-xs"
                                : "bg-[#EEF2F6] text-[#64748B] hover:text-[#172033]"
                            }`}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
