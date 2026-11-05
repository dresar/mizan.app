"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UserPlus,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Building2,
  Shield,
  GraduationCap,
  Sparkles
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { Role } from "@/lib/mock-data";
import { RoleShell } from "@/components/RoleShell";
import { Card } from "@/components/ui/Card";

function TambahUserContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const returnUrl = searchParams.get("returnUrl") || "/admin/wali-kelas";

  const { kelasList, classList, addUser, updateClass, showToast } = useMizan();

  const safeClasses = useMemo(() => {
    if (kelasList && kelasList.length > 0) return kelasList;
    return [
      "1A", "1B", "1C", "1D",
      "2A", "2B", "2C", "2D",
      "3A", "3B", "3C", "3D",
      "4A", "4B", "5A", "6A"
    ];
  }, [kelasList]);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: (roleParam === "PENGASUHAN" ? "PENGASUHAN" : roleParam === "SUPER_ADMIN" ? "SUPER_ADMIN" : "GURU") as Role,
    gender: "Putra" as "Putra" | "Putri",
    assignedClass: safeClasses[0] || "1A"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const matchedClassObj = useMemo(() => {
    if (!formData.assignedClass) return null;
    return classList.find(
      (c) => c.name.toUpperCase() === formData.assignedClass.toUpperCase()
    ) || null;
  }, [classList, formData.assignedClass]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Nama lengkap wajib diisi", "error");
      return;
    }
    if (!formData.username.trim()) {
      showToast("Username wajib diisi", "error");
      return;
    }
    if (!formData.password || formData.password.length < 4) {
      showToast("Kata sandi minimal 4 karakter", "error");
      return;
    }

    setIsSubmitting(true);

    let roleTitle = "Pembina Santri Putra";
    if (formData.role === "SUPER_ADMIN") {
      roleTitle = "Super Admin Pengasuhan";
    } else if (formData.role === "PENGASUHAN") {
      roleTitle = formData.gender === "Putri" ? "Pengasuhan Santriwati P" : "Pengasuhan Santri L";
    } else {
      roleTitle = formData.gender === "Putri" ? "Pembina Santriwati P" : "Pembina Santri L";
    }

    const cleanUsername = formData.username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, "");

    const finalAssignedClass = formData.role === "GURU" ? formData.assignedClass : "";

    const res = await addUser({
      name: formData.name.trim(),
      username: cleanUsername,
      password: formData.password,
      role: formData.role,
      gender: formData.gender,
      roleTitle,
      assignedClass: finalAssignedClass
    });

    if (res.success) {
      if (finalAssignedClass) {
        await updateClass(finalAssignedClass, {
          waliKelas: formData.name.trim(),
          gender: formData.gender
        });
      }
      showToast(`Pengguna ${formData.name} berhasil dibuat`, "success");
      router.push(returnUrl);
    } else {
      showToast(res.message || "Gagal membuat pengguna", "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pt-1 pb-36">
      <div className="flex items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href={returnUrl}
            className="p-2 sm:p-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAF7EE] text-[#1B4D3E] hover:bg-[#F2ECE0] transition-colors"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">
                Manajemen Pengguna
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-serif font-black text-[#172033] tracking-tight">
              Tambah Akun Pembina & Pengguna
            </h1>
          </div>
        </div>

        <Link
          href={returnUrl}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#EEF2F6] transition-colors"
        >
          Batal
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl border border-[#E2E8F0] p-4 sm:p-6 shadow-2xs space-y-4"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[#F1F5F9]">
            <UserPlus className="w-4 h-4 text-[#1B4D3E]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Formulir Akun Baru
            </h2>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Nama Lengkap & Gelar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Ust. Ahmad Fatih, M.Pd."
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-xl text-[#172033] font-medium focus:bg-white focus:border-[#1B4D3E] focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#94A3B8]">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value.toLowerCase().replace(/\s+/g, "")
                      })
                    }
                    placeholder="ahmadfatih"
                    className="w-full pl-8 pr-3.5 py-2.5 text-xs font-mono bg-[#FAF7EE] border border-[#E2EBF4] rounded-xl text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">
                  Kata Sandi Awal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimal 4 karakter"
                    className="w-full px-3.5 pr-10 py-2.5 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-xl text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#172033]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1.5">
                Peran Pengguna
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "GURU", label: "Guru Kelas", icon: GraduationCap },
                  { key: "PENGASUHAN", label: "Pengasuhan BK", icon: Shield },
                  { key: "SUPER_ADMIN", label: "Super Admin", icon: Sparkles }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = formData.role === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: item.key as Role })}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-start gap-1 cursor-pointer ${
                        isSelected
                          ? "bg-[#FAF7EE] border-[#1B4D3E] text-[#1B4D3E] shadow-2xs font-bold"
                          : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? "text-[#1B4D3E]" : "text-[#94A3B8]"}`} />
                      <span className="text-[11px] block">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1.5">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "Putra", code: "L", label: "L (Laki-laki)" },
                  { key: "Putri", code: "P", label: "P (Perempuan)" }
                ].map((g) => {
                  const isSelected = formData.gender === g.key;
                  return (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          gender: g.key as "Putra" | "Putri"
                        })
                      }
                      className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer font-bold flex items-center justify-center gap-2 text-xs ${
                        isSelected
                          ? g.key === "Putra"
                            ? "bg-[#ECFDF5] border-[#065F46] text-[#065F46] shadow-2xs"
                            : "bg-[#FAF7EE] border-[#A8833E] text-[#A8833E] shadow-2xs"
                          : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white border border-current flex items-center justify-center text-[10px] font-black font-mono">
                        {g.code}
                      </span>
                      <span>{g.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {formData.role === "GURU" && (
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">
                  Kelas Binaan Utama
                </label>
                <select
                  value={formData.assignedClass}
                  onChange={(e) => setFormData({ ...formData, assignedClass: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7EE] border border-[#E2EBF4] rounded-xl text-[#172033] font-bold focus:bg-white focus:border-[#1B4D3E] focus:outline-none transition-colors"
                >
                  <option value="">Bebas Tugas (Belum Ditugaskan)</option>
                  {safeClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#64748B] mt-1">
                  Penugasan kelas dapat diubah kapan saja di menu Wali & Pembina.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F1F5F9]">
            <Link
              href={returnUrl}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#143B2F] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Menyimpan..." : "Simpan Pengguna"}</span>
            </button>
          </div>
        </form>

        <div className="space-y-3">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E2E8F0] p-4 sm:p-5 shadow-2xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Pratinjau Kartu Pengguna
            </span>

            <div className="p-4 rounded-2xl bg-[#FAF7EE]/60 border border-[#E2E8F0] space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold text-base shrink-0 ${
                    formData.gender === "Putra"
                      ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]"
                      : "bg-[#FAF7EE] border-[#C5A059]/40 text-[#A8833E]"
                  }`}
                >
                  {formData.name ? formData.name.slice(0, 2).toUpperCase() : "MZ"}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-black text-[#172033] truncate">
                    {formData.name || "Nama Pengguna Baru"}
                  </h4>
                  <p className="text-[10px] font-mono text-[#94A3B8] truncate">
                    @{formData.username || "username"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#E2EBF4]/80 text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] border border-[#1B4D3E]/20">
                  {formData.role === "GURU" ? "Guru Kelas" : formData.role === "PENGASUHAN" ? "Pengasuhan BK" : "Super Admin"}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full border ${
                    formData.gender === "Putra"
                      ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                      : "bg-[#FAF7EE] text-[#A8833E] border-[#C5A059]/40"
                  }`}
                >
                  {formData.gender === "Putra" ? "L" : "P"}
                </span>

                {formData.role === "GURU" && formData.assignedClass && (
                  <span className="px-2 py-0.5 rounded-md font-mono bg-white border border-[#CBD5E1] text-[#172033]">
                    {formData.assignedClass}
                  </span>
                )}
              </div>
            </div>

            {matchedClassObj && formData.role === "GURU" && (
              <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[11px] text-[#065F46] space-y-1">
                <div className="flex items-center gap-1 font-bold">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Ruang Kelas {formData.assignedClass} Terpilih</span>
                </div>
                <p className="text-[10px] text-[#065F46]/80">
                  Kategori Gender: {matchedClassObj.gender === "Putra" ? "L" : "P"} • Wali Sebelumnya: {matchedClassObj.waliKelas || "Belum Ada"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminTambahUserPage() {
  return (
    <RoleShell>
      <Suspense fallback={<div className="p-6 text-center text-xs text-[#64748B]">Memuat halaman...</div>}>
        <TambahUserContent />
      </Suspense>
    </RoleShell>
  );
}
