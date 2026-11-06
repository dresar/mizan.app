"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Bell, Layers, AlertTriangle, Shield, CheckCircle2, Info } from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card } from "@/components/ui/Card";
import { NotificationCategory, NotificationType } from "@/lib/mock-data";

const BROADCAST_CATEGORIES: NotificationCategory[] = [
  "Pengumuman Pondok",
  "Evaluasi Rapor",
  "Presensi Sholat",
  "Peringatan Disiplin"
];

export default function TambahNotifikasiPage() {
  const router = useRouter();
  const { addNotification, showToast } = useMizan();

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    category: "Pengumuman Pondok" as NotificationCategory,
    type: "info" as NotificationType,
    link: "",
    isActive: true,
    targetRole: "ALL" as "ALL" | "SUPER_ADMIN" | "PENGASUHAN" | "GURU" | "ORTU"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast("Judul notifikasi tidak boleh kosong", "error");
      return;
    }

    if (!formData.message.trim()) {
      showToast("Pesan notifikasi tidak boleh kosong", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await addNotification({
        title: formData.title.trim(),
        message: formData.message.trim(),
        category: formData.category,
        type: formData.type,
        link: formData.link.trim() || undefined,
        isActive: formData.isActive,
        targetRole: formData.targetRole,
        time: "Baru saja"
      });

      showToast("Notifikasi berhasil disiarkan", "success");
      router.push("/admin/notifikasi");
    } catch {
      showToast("Gagal menyimpan notifikasi", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 pb-36">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/notifikasi"
            className="p-2 rounded-xl bg-white border border-[#E2EBF4] text-[#64748B] hover:text-[#172033] hover:bg-[#FAF7EE] transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-[#1B4D3E] tracking-tight">
              Buat & Siarkan Notifikasi
            </h1>
            <p className="text-xs text-[#64748B]">
              Kirim pengumuman pondok, evaluasi rapor, presensi, atau peringatan disiplin santri
            </p>
          </div>
        </div>

        <Card className="p-5 sm:p-6 bg-white space-y-5 shadow-xs border border-[#E2EBF4]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172033] block uppercase tracking-wider">
                Judul Notifikasi
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Rapat Wali Santri Semester Genap"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D4C9B5] bg-white text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172033] block uppercase tracking-wider">
                Pesan Lengkap Notifikasi
              </label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tuliskan rincian pesan informasi atau instruksi yang jelas bagi santri, asatidzah, atau wali murid..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D4C9B5] bg-white text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#172033] block uppercase tracking-wider">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as NotificationCategory })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D4C9B5] bg-white text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                >
                  {BROADCAST_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#172033] block uppercase tracking-wider">
                  Tingkat Urgensi
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as NotificationType })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D4C9B5] bg-white text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                >
                  <option value="info">Informasi Umum (Kuning Emas)</option>
                  <option value="success">Prestasi & Kelulusan (Hijau)</option>
                  <option value="warning">Peringatan Disiplin (Oranye)</option>
                  <option value="urgent">Mendesak / Atensi Khusus (Merah)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#172033] block uppercase tracking-wider">
                  Target Penerima
                </label>
                <select
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D4C9B5] bg-white text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                >
                  <option value="ALL">Semua Pengguna</option>
                  <option value="SUPER_ADMIN">Super Admin Saja</option>
                  <option value="PENGASUHAN">Pengasuhan Pondok (BK)</option>
                  <option value="GURU">Asatidzah & Pembina</option>
                  <option value="ORTU">Wali Murid / Santri</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#172033] block uppercase tracking-wider">
                  Status Siaran
                </label>
                <div className="pt-2">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-[#1B4D3E] focus:ring-[#1B4D3E] border-[#D4C9B5]"
                    />
                    <span className="text-xs font-bold text-[#172033]">Langsung Tayang di Banner & Notifikasi</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172033] block uppercase tracking-wider">
                Tautan Halaman Terkait (Opsional)
              </label>
              <input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="Contoh: /admin/rapor atau /bk/penilaian"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D4C9B5] bg-white text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
              />
              <div className="flex items-center gap-1.5 pt-1.5 flex-wrap text-[10px]">
                <span className="text-[#64748B]">Pintasan Rute:</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, link: "/admin/rapor" })}
                  className="px-2 py-0.5 rounded-md bg-[#FAF7EE] border border-[#D4C9B5] text-[#1B4D3E] hover:bg-white cursor-pointer"
                >
                  /admin/rapor
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, link: "/admin/santri" })}
                  className="px-2 py-0.5 rounded-md bg-[#FAF7EE] border border-[#D4C9B5] text-[#1B4D3E] hover:bg-white cursor-pointer"
                >
                  /admin/santri
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, link: "/admin/absensi" })}
                  className="px-2 py-0.5 rounded-md bg-[#FAF7EE] border border-[#D4C9B5] text-[#1B4D3E] hover:bg-white cursor-pointer"
                >
                  /admin/absensi
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, link: "/admin/keuangan" })}
                  className="px-2 py-0.5 rounded-md bg-[#FAF7EE] border border-[#D4C9B5] text-[#1B4D3E] hover:bg-white cursor-pointer"
                >
                  /admin/keuangan
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2EBF4] flex items-center justify-end gap-2.5">
              <Link
                href="/admin/notifikasi"
                className="px-4 py-2.5 text-xs font-bold rounded-xl text-[#64748B] hover:text-[#172033] bg-[#EEF2F6] hover:bg-[#E2E8F0] transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#1B4D3E] text-white hover:bg-[#153e32] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Mengirim..." : "Kirim Notifikasi"}</span>
              </button>
            </div>
          </form>
        </Card>
      </div>
    </RoleShell>
  );
}
