"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  ShieldCheck,
  CalendarCheck,
  PenTool,
  LogOut,
  Lock,
  KeyRound,
  CheckCircle2,
  Camera,
  Save,
  Loader2
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub, CardInset } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";

export default function GuruProfilPage() {
  const router = useRouter();
  const { currentUser, penilaianList, absensiList, logoutUser, showToast, refreshData } = useMizan();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || "");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  const myPenilaian = penilaianList.filter(
    (p) => p.guruName === currentUser.name || p.guruId === currentUser.id
  );

  const myAbsensi = absensiList.filter(
    (a) => a.guruName === currentUser.name || a.guruId === currentUser.id
  );

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      showToast("Kata sandi minimal 4 karakter.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Konfirmasi kata sandi tidak cocok.", "error");
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Kata sandi berhasil diperbarui.", "success");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast(data.message || "Gagal memperbarui kata sandi.", "error");
      }
    } catch {
      showToast("Kendala koneksi ke server.", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleUpdateAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAvatar(true);
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, avatarUrl })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Foto profil berhasil diperbarui.", "success");
        await refreshData();
      } else {
        showToast(data.message || "Gagal memperbarui profil.", "error");
      }
    } catch {
      showToast("Kendala koneksi ke server.", "error");
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 max-w-4xl mx-auto overflow-x-hidden">
        <Card className="p-5 sm:p-6 text-center space-y-3 bg-white">
          <div className="mx-auto w-20 h-20 rounded-3xl mizan-card flex items-center justify-center text-2xl font-black text-[#1B4D3E] overflow-hidden">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Avatar initials={currentUser.avatarInitials || "MZ"} size="xl" variant="primary" />
            )}
          </div>

          <div>
            <h1 className="text-lg sm:text-2xl font-serif font-black text-[#172033]">
              {currentUser.name}
            </h1>
            <p className="text-xs font-bold text-[#A8833E] mt-0.5">
              {currentUser.roleTitle}
            </p>
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full mizan-pill bg-[#ECFDF5] text-[#065F46] text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Status Pembina Aktif ({currentUser.gender || "Putra"})</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-2.5">
          <CardSub className="p-4 text-center">
            <span className="text-2xl sm:text-3xl font-black text-[#1B4D3E] block font-mono">
              {myPenilaian.length}
            </span>
            <span className="text-[11px] text-[#64748B] font-bold block mt-1">
              Input Sikap Dicatat
            </span>
          </CardSub>

          <CardSub className="p-4 text-center">
            <span className="text-2xl sm:text-3xl font-black text-[#059669] block font-mono">
              {myAbsensi.length}
            </span>
            <span className="text-[11px] text-[#64748B] font-bold block mt-1">
              Catatan Absensi
            </span>
          </CardSub>
        </div>

        <Card className="p-4 sm:p-5 space-y-3 bg-white">
          <span className="text-xs font-bold text-[#172033] uppercase tracking-wider block">
            Informasi Akun Pembina
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <CardInset className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#94A3B8] font-bold uppercase">
                  Username
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#94A3B8]">
                  <Lock className="w-3 h-3" /> Terkunci
                </span>
              </div>
              <p className="font-bold text-[#172033] mt-0.5 font-mono">
                @{currentUser.username || "ustadz"}
              </p>
            </CardInset>

            <CardInset className="p-3">
              <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">
                Kelas Binaan Utama
              </span>
              <p className="font-bold text-[#172033] mt-0.5">
                Kelas {currentUser.assignedClass || "1A"}
              </p>
            </CardInset>

            <CardInset className="p-3">
              <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">
                Fokus Bimbingan
              </span>
              <p className="font-bold text-[#172033] mt-0.5">
                {currentUser.gender === "Putri" ? "Santriwati (Putri)" : "Santriwan (Putra)"}
              </p>
            </CardInset>

            <CardInset className="p-3">
              <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">
                Standar Poin Absensi
              </span>
              <p className="font-bold text-[#172033] mt-0.5">
                Hadir (+0,050) • Alpa (-0,050)
              </p>
            </CardInset>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-3 bg-white">
          <div className="flex items-center gap-2 pb-1 border-b border-[#E2E8F0]">
            <KeyRound className="w-4 h-4 text-[#1B4D3E]" />
            <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
              Ubah Kata Sandi
            </h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#475569] mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full px-3 py-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#475569] mb-1">
                  Konfirmasi Kata Sandi
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3 py-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingPassword}
              className="py-2.5 px-5 rounded-2xl bg-[#1B4D3E] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#153e32] transition-colors disabled:opacity-60"
            >
              {isSavingPassword ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Kata Sandi</span>
                </>
              )}
            </button>
          </form>
        </Card>

        <Card className="p-4 sm:p-5 space-y-3 bg-white">
          <div className="flex items-center gap-2 pb-1 border-b border-[#E2E8F0]">
            <Camera className="w-4 h-4 text-[#A8833E]" />
            <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
              Tautan Foto Profil
            </h2>
          </div>

          <form onSubmit={handleUpdateAvatar} className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-[#475569] mb-1">
                URL Foto Profil (Opsional)
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://contoh.com/foto-ustadz.jpg"
                className="w-full px-3 py-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingAvatar}
              className="py-2.5 px-5 rounded-2xl bg-[#A8833E] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#8f6d2e] transition-colors disabled:opacity-60"
            >
              {isSavingAvatar ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Perbarui Foto Profil</span>
                </>
              )}
            </button>
          </form>
        </Card>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 px-4 rounded-2xl mizan-card bg-white text-xs font-bold flex items-center justify-center gap-2 text-red-600 border border-red-200 hover:bg-red-50 transition-colors shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Aplikasi</span>
          </button>
        </div>
      </div>
    </RoleShell>
  );
}
