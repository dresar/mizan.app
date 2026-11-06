"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Camera,
  Save,
  Loader2,
  LogOut,
  Sparkles,
  Eye,
  EyeOff,
  Server,
  Database,
  Layers,
  RotateCcw,
  Smartphone,
  Apple,
  Download
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";

export default function AdminProfilPage() {
  const router = useRouter();
  const { currentUser, logoutUser, showToast, refreshData, updateUserAvatar, updateUser } = useMizan();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState<"Putra" | "Putri">("Putra");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      setName(currentUser.name || "");
      setUsername(currentUser.username || "");
      setGender((currentUser.gender as "Putra" | "Putri") || "Putra");
    }
  }, [currentUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast("Pilih file foto terlebih dahulu.", "error");
      return;
    }

    setIsSavingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", currentUser.id);

      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (data.success && data.avatarUrl) {
        showToast("Foto profil admin berhasil diperbarui.", "success");
        updateUserAvatar(data.avatarUrl);
        setSelectedFile(null);
        setPreviewUrl("");
        await refreshData();
      } else {
        showToast(data.message || "Gagal mengunggah foto profil.", "error");
      }
    } catch {
      showToast("Kendala jaringan saat mengunggah berkas.", "error");
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleResetDefaultAvatar = async () => {
    const defaultUrl =
      gender === "Putri" ? "/default-avatar-ustadzah.jpg" : "/default-avatar-ustadz.jpg";
    setIsSavingAvatar(true);
    try {
      const res = await updateUser(currentUser.id, { avatar_url: defaultUrl });
      if (res.success) {
        updateUserAvatar(defaultUrl);
        setSelectedFile(null);
        setPreviewUrl("");
        showToast("Foto profil dikembalikan ke gambar baku.", "success");
      }
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Nama admin tidak boleh kosong.", "error");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await updateUser(currentUser.id, {
        name: name.trim(),
        username: username.trim(),
        gender
      });

      if (res.success) {
        showToast("Informasi akun admin berhasil disimpan.", "success");
        await refreshData();
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

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
        showToast("Kata sandi admin berhasil diperbarui.", "success");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast(data.message || "Gagal memperbarui kata sandi.", "error");
      }
    } catch {
      showToast("Kendala koneksi ke server saat memperbarui sandi.", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  const displayedAvatar = previewUrl || currentUser.avatarUrl;

  return (
    <RoleShell>
      <div className="w-full space-y-5 overflow-x-hidden pb-32">
        <Card className="p-5 sm:p-6 bg-white border border-[#E2EBF4] shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-[#1B4D3E]/20 shadow-md flex items-center justify-center bg-[#FAF7EE]">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover object-top" />
                ) : (
                  <Avatar
                    src={currentUser.avatarUrl}
                    initials={currentUser.avatarInitials || "AD"}
                    gender={gender}
                    size="3xl"
                    variant={gender === "Putri" ? "gold" : "primary"}
                  />
                )}
              </div>
              <label
                htmlFor="avatar-file-top"
                className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-[#1B4D3E] text-white shadow-md hover:bg-[#153e32] cursor-pointer transition-transform active:scale-95"
                title="Ganti Foto Profil"
              >
                <Camera className="w-4 h-4" />
              </label>
              <input
                id="avatar-file-top"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#065F46]" />
                <span>Otoritas Super Admin</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033] tracking-tight truncate">
                {currentUser.name || "Administrator Utama"}
              </h1>
              <p className="text-xs font-medium text-[#64748B] mt-0.5">
                Username: <span className="font-mono font-bold text-[#1B4D3E]">@{currentUser.username || "admin"}</span> • {currentUser.roleTitle || "Administrator Pondok"}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF7EE] text-[#A8833E] text-[11px] font-bold border border-[#E8DFC8]">
                  Gender: {gender}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] text-[#475569] text-[11px] font-semibold border border-[#E2E8F0]">
                  Role: SUPER_ADMIN
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                  Status: Aktif
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-5 space-y-4 bg-white border border-[#E2EBF4] shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
              <Camera className="w-4 h-4 text-[#1B4D3E]" />
              <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Ganti Gambar Profil
              </h2>
            </div>

            <form onSubmit={handleUploadAvatar} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#E2EBF4] shrink-0 bg-[#FAF7EE] flex items-center justify-center shadow-xs">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover object-top" />
                  ) : (
                    <Avatar
                      src={currentUser.avatarUrl}
                      initials={currentUser.avatarInitials || "AD"}
                      gender={gender}
                      size="lg"
                      variant={gender === "Putri" ? "gold" : "primary"}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <label className="block text-[11px] font-bold text-[#475569]">
                    Unggah File Foto Baru
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-[#64748B] file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-[#1B4D3E] file:text-white hover:file:bg-[#153e32] cursor-pointer"
                  />
                  <p className="text-[10px] text-[#94A3B8]">
                    Format JPG, PNG, atau WebP (Maksimal 5 MB).
                  </p>
                </div>
              </div>

              {previewUrl && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                  <span>Foto baru dipilih. Klik simpan untuk menerapkan.</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl("");
                    }}
                    className="text-[11px] font-bold text-amber-900 underline ml-2 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSavingAvatar || !selectedFile}
                  className="py-2.5 px-4 rounded-xl bg-[#1B4D3E] text-white font-bold text-xs flex items-center gap-2 hover:bg-[#153e32] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSavingAvatar ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan Foto...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Foto Baru</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetDefaultAvatar}
                  disabled={isSavingAvatar}
                  className="py-2.5 px-3.5 rounded-xl bg-[#FAF7EE] text-[#A8833E] hover:bg-[#F2ECE0] border border-[#D4C9B5] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Kembalikan ke avatar ilustrasi baku sesuai gender"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Foto Default</span>
                </button>
              </div>
            </form>
          </Card>

          <Card className="p-5 space-y-4 bg-white border border-[#E2EBF4] shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
              <User className="w-4 h-4 text-[#1B4D3E]" />
              <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Informasi Akun Admin
              </h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#475569] mb-1">
                  Nama Lengkap Admin
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap Administrator"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none font-semibold text-[#172033]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#475569] mb-1">
                  Username Akun
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-[#94A3B8]">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-7 pr-3.5 py-2.5 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none font-mono font-bold text-[#1B4D3E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#475569] mb-1">
                  Kategori Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender("Putra")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      gender === "Putra"
                        ? "bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-xs"
                        : "bg-[#FAF7EE] text-[#64748B] border-[#E2EBF4] hover:bg-[#F2ECE0]"
                    }`}
                  >
                    Putra (Ustadz)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("Putri")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      gender === "Putri"
                        ? "bg-[#C5A059] text-white border-[#C5A059] shadow-xs"
                        : "bg-[#FAF7EE] text-[#64748B] border-[#E2EBF4] hover:bg-[#F2ECE0]"
                    }`}
                  >
                    Putri (Ustadzah)
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="py-2.5 px-5 rounded-xl bg-[#1B4D3E] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#153e32] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan Akun...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan Akun</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-5 space-y-4 bg-white border border-[#E2EBF4] shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
              <KeyRound className="w-4 h-4 text-[#1B4D3E]" />
              <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Ganti Kata Sandi
              </h2>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#475569] mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full pl-3 pr-10 py-2.5 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 text-[#94A3B8] hover:text-[#475569] cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#475569] mb-1">
                  Ulangi Kata Sandi Baru
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi sandi baru"
                    className="w-full pl-3 pr-10 py-2.5 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-[#94A3B8] hover:text-[#475569] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="py-2.5 px-5 rounded-xl bg-[#1B4D3E] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#153e32] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSavingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Memperbarui Sandi...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Perbarui Kata Sandi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>

          <Card className="p-5 space-y-4 bg-white border border-[#E2EBF4] shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
                <Server className="w-4 h-4 text-[#1B4D3E]" />
                <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                  Hak Akses & Keamanan Sistem
                </h2>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF7EE] border border-[#E8DFC8]">
                  <Database className="w-4 h-4 text-[#1B4D3E] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#172033]">Basis Data PostgreSQL Terpusat</p>
                    <p className="text-[10px] text-[#64748B]">
                      Akses baca-tulis penuh seluruh tabel santri, kelas, absensi, kesehatan, dan perizinan.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF7EE] border border-[#E8DFC8]">
                  <Layers className="w-4 h-4 text-[#A8833E] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#172033]">Struktur Multi-Role Pondok</p>
                    <p className="text-[10px] text-[#64748B]">
                      Mengatur wali kelas 1A-6B, asisten pembina belajar malam, dan hak akun staf BK/guru.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#ECFDF5] border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-[#065F46] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#065F46]">Protokol Enkripsi & Sesi Aktif</p>
                    <p className="text-[10px] text-[#047857]">
                      Sesi terdaftar aman dengan otentikasi Bearer token & cookie HTTP Mizan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
                <p className="text-[11px] font-bold text-[#172033]">Unduh Aplikasi Mobile Pondok</p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="/downloads/mizan.apk"
                    download="mizan.apk"
                    className="p-2.5 rounded-xl bg-[#FAF7EE] hover:bg-[#F2ECE0] border border-[#E8DFC8] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#1B4D3E]" />
                      <div className="text-left">
                        <p className="text-[11px] font-bold text-[#172033] leading-none">Android</p>
                        <p className="text-[9px] text-[#64748B]">APK (2,7 MB)</p>
                      </div>
                    </div>
                    <Download className="w-3.5 h-3.5 text-[#1B4D3E]" />
                  </a>

                  <a
                    href="/api/download/ios-profile"
                    className="p-2.5 rounded-xl bg-[#FAF7EE] hover:bg-[#F2ECE0] border border-[#E8DFC8] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Apple className="w-4 h-4 text-[#A8833E]" />
                      <div className="text-left">
                        <p className="text-[11px] font-bold text-[#172033] leading-none">Apple iOS</p>
                        <p className="text-[9px] text-[#64748B]">Profil / IPA</p>
                      </div>
                    </div>
                    <Download className="w-3.5 h-3.5 text-[#A8833E]" />
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun Administrator</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </RoleShell>
  );
}
