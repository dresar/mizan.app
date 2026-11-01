"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Award,
  ShieldCheck,
  Target,
  Clock,
  Heart,
  BookOpen,
  CheckCircle2,
  Share2,
  Smartphone,
  Apple
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { Santri } from "@/lib/mock-data";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { ShareModal } from "@/components/ShareModal";
import { getSantriDisciplineStatus, PenilaianRecord } from "@/lib/mock-data";

export default function SantriProfilPage() {
  const { santriList, penilaianList, settings, submitSanggahan, showToast } = useMizan();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sanggahTarget, setSanggahTarget] = useState<PenilaianRecord | null>(null);
  const [sanggahReason, setSanggahReason] = useState("");
  const [isSubmittingSanggahan, setIsSubmittingSanggahan] = useState(false);

  const fallbackSantri: Santri = {
    id: "santri-1",
    nis: "20240801",
    name: "Muhammad Zaki Pratama",
    gender: "Putra",
    class: "1A",
    baseScore: 70.0,
    currentScore: 84.450,
    status: "Baik",
    avatar: "MZ"
  };

  const santri = santriList[0] || fallbackSantri;
  const history = penilaianList.filter((p) => p.santriId === santri.id);
  const totalPrestasi = history.filter((p) => p.type === "HASANAH").length;
  const totalPelanggaran = history.filter((p) => p.type === "SAYYIAH").length;

  const discipline = getSantriDisciplineStatus(santri.currentScore, settings);

  const handleSendSanggahan = async () => {
    if (!sanggahTarget || !sanggahReason.trim()) {
      showToast("Tuliskan alasan sanggahan Anda", "error");
      return;
    }
    setIsSubmittingSanggahan(true);
    await submitSanggahan(sanggahTarget.id, sanggahReason.trim());
    setIsSubmittingSanggahan(false);
    setSanggahTarget(null);
    setSanggahReason("");
  };

  const getPredikatBadge = (score: number) => {
    if (score >= 85) return { label: "Mumtaz (Istimewa)", variant: "gold" as const };
    if (score >= 70) return { label: "Baik (Jayyid)", variant: "hasanah" as const };
    return { label: "Perlu Peningkatan", variant: "perhatian" as const };
  };

  const predikat = getPredikatBadge(santri.currentScore);

  const targets = [
    { text: "Istiqamah hadir di masjid sebelum adzan shubuh", status: "Tercapai" },
    { text: "Menjaga kerapian sprei dan loker kamar setiap pagi", status: "Dalam Proses" },
    { text: "Menyelesaikan tilawah 1 juz harian dengan tartil", status: "Tercapai" },
    { text: "Menjaga adab bertutur kata santun kepada sesama santri", status: "Tercapai" }
  ];

  const formatScore = (score: number) => {
    const formatted = Math.abs(score).toFixed(3);
    return score > 0 ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="bg-[#1B4D3E] text-white p-6 rounded-2xl shadow-sm text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <Avatar
              initials={santri.avatar}
              size="xl"
              variant="gold"
              className="mb-3 ring-4 ring-white/20"
            />
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
              {santri.name}
            </h1>
            <p className="text-xs text-emerald-100 mt-1">
              NIS: {santri.nis} • Kelas {santri.class}
            </p>
            <p className="text-xs text-[#C5A059] font-medium mt-0.5">
              Santri {santri.gender} • Kelas {santri.class}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-emerald-50">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Predikat: {predikat.label}</span>
              </div>

              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#1B4D3E] text-xs font-bold hover:bg-emerald-50 transition-colors shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Bagikan</span>
              </button>
            </div>
          </div>
        </div>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1C2826] uppercase tracking-wider">
              Capaian Nilai Akhlak Saya
            </span>
            <span className="text-sm font-bold font-mono text-[#1B4D3E]">
              {santri.currentScore.toFixed(3).replace(".", ",")} / 99,000
            </span>
          </div>

          <ScoreBar score={santri.currentScore} baseScore={santri.baseScore} size="lg" />

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#F5F1E8]">
            <div className="p-3 rounded-2xl bg-[#E8F0EC]/60 border border-[#1B4D3E]/20 text-center">
              <span className="text-xs font-bold text-[#1B4D3E] block">
                {totalPrestasi} Catatan
              </span>
              <span className="text-[11px] text-[#5C6B64]">
                Amalan Hasanah & Adab
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/40 text-center">
              <span className="text-xs font-bold text-[#A8833E] block">
                {totalPelanggaran} Catatan
              </span>
              <span className="text-[11px] text-[#5C6B64]">
                Pengingat Sikap Santri
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Target & Evaluasi Diri Pekan Ini"
            subtitle="Komitmen pribadi santri dalam meningkatkan adab dan ketertiban asrama"
          />

          <div className="space-y-2.5">
            {targets.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DECE] text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      item.status === "Tercapai"
                        ? "text-[#1B4D3E]"
                        : "text-[#C5A059]"
                    }`}
                  />
                  <span className="font-medium text-[#1C2826] truncate">
                    {item.text}
                  </span>
                </div>
                <Badge
                  variant={item.status === "Tercapai" ? "hasanah" : "gold"}
                  size="sm"
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Catatan Kebaikan & Riwayat Terakhir"
            subtitle="Jejak langkah kebaikan yang tercatat di buku adab pondok"
          />

          {history.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#FAF7F2] text-center text-xs text-[#5C6B64]">
              Belum ada catatan baru. Mari terus tebarkan kebaikan di pondok.
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl border border-[#E5DECE] bg-[#FAF7F2]/40 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={item.type === "HASANAH" ? "hasanah" : "sayyiah"}
                      size="sm"
                    >
                      {item.type === "HASANAH" ? "Hasanah (+)" : "Sayyi'ah (-)"}
                    </Badge>
                    <span
                      className={`font-bold font-mono ${
                        item.score > 0 ? "text-[#1B4D3E]" : "text-[#9B2C2C]"
                      }`}
                    >
                      {formatScore(item.score)} Poin
                    </span>
                  </div>

                  <p className="font-semibold text-[#1C2826]">
                    {item.indicatorText}
                  </p>
                  <p className="text-[11px] text-[#5C6B64]">
                    {item.category} • {item.unsurName}
                  </p>

                  {item.notes && (
                    <div className="p-2 rounded-lg bg-white border border-[#E5DECE] text-[11px] text-[#1C2826] italic">
                      Nasihat Ustadz: &quot;{item.notes}&quot;
                    </div>
                  )}

                  {item.dueProcessStatus === "SANGGAHAN" && (
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-800 font-semibold">
                      Dalam Proses Hak Sanggah (Banding 1x24 Jam)
                    </div>
                  )}

                  {item.dueProcessStatus === "DIBATALKAN" && (
                    <div className="p-2 rounded-xl bg-gray-100 text-[10px] text-gray-500 line-through">
                      Sanggahan Diterima: Pemotongan Poin Dibatalkan
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-[#8A968F] pt-1 border-t border-[#E5DECE]/60">
                    <span>Oleh: {item.guruName}</span>
                    <div className="flex items-center gap-2">
                      {item.type === "SAYYIAH" && !item.dueProcessStatus && (
                        <button
                          type="button"
                          onClick={() => setSanggahTarget(item)}
                          className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold hover:bg-amber-200"
                        >
                          Sanggah
                        </button>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4 sm:p-5 space-y-3 bg-white">
          <div className="flex items-center justify-between pb-1 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#1B4D3E]" />
              <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Aplikasi Mobile
              </h2>
            </div>
            <span className="text-[10px] font-bold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
              Pilihan
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl mizan-card-sub flex flex-col justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl mizan-inset flex items-center justify-center text-[#1B4D3E] shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#172033] truncate">Android</p>
                  <p className="text-[10px] text-[#64748B] truncate">.apk (2,4 MB)</p>
                </div>
              </div>

              <a
                href="/downloads/mizan.apk"
                download="mizan.apk"
                className="w-full py-2 rounded-xl bg-[#1B4D3E] hover:bg-[#153e32] text-white text-xs font-bold text-center transition-colors block"
              >
                Unduh
              </a>
            </div>

            <div className="p-3 rounded-2xl mizan-card-sub flex flex-col justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl mizan-inset flex items-center justify-center text-[#A8833E] shrink-0">
                  <Apple className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#172033] truncate">Apple iOS</p>
                  <p className="text-[10px] text-[#64748B] truncate">.ipa & Profil</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <a
                  href="/api/download/ios-profile"
                  className="py-1.5 px-2 rounded-xl bg-[#FAF7EE] hover:bg-[#F5EED9] text-[#A8833E] border border-[#C5A059]/40 text-xs font-bold text-center transition-colors block"
                >
                  Pasang
                </a>
                <a
                  href="/downloads/mizan.ipa"
                  download="mizan.ipa"
                  className="py-1.5 px-2 rounded-xl bg-[#172033] hover:bg-black text-white text-xs font-bold text-center transition-colors block"
                >
                  Unduh
                </a>
              </div>
            </div>
          </div>
        </Card>

        <div className="p-4 rounded-2xl bg-[#FAF7EE] border border-[#C5A059]/40 text-xs text-center text-[#1C2826] space-y-1">
          <p className="font-bold text-[#A8833E]">
            Mutiara Adab Penuntut Ilmu
          </p>
          <p className="italic text-[#5C6B64]">
            &quot;Pelajarilah adab sebelum engkau mempelajari ilmu.&quot;
          </p>
          <p className="text-[10px] text-[#8A968F]">
            (Imam Malik rahimahullah)
          </p>
        </div>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          initialType="SANTRI"
          targetSantri={santri}
        />

        {sanggahTarget && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-5 space-y-3 shadow-2xl border border-[#E2EBF4]">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                  Hak Sanggah Santri (1 x 24 Jam)
                </h3>
                <button
                  type="button"
                  onClick={() => setSanggahTarget(null)}
                  className="text-xs font-bold text-[#64748B] hover:text-[#172033]"
                >
                  Tutup
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs">
                <span className="font-bold text-[#991B1B] block">Perkara yang disanggah:</span>
                <p className="text-[11px] text-[#7F1D1D] mt-0.5">{sanggahTarget.unsurName || sanggahTarget.indicatorText}</p>
                <p className="text-[10px] text-[#64748B] mt-0.5">Dicatat: {sanggahTarget.createdAt}</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                  Alasan & Kronologi Pembelaan Diri:
                </label>
                <textarea
                  rows={3}
                  value={sanggahReason}
                  onChange={(e) => setSanggahReason(e.target.value)}
                  placeholder="Jelaskan alasan sanggahan atau saksi yang dapat membuktikan..."
                  className="w-full p-2.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSanggahTarget(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSubmittingSanggahan}
                  onClick={handleSendSanggahan}
                  className="px-4 py-1.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32]"
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleShell>
  );
}
