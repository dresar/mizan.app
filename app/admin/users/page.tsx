"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  ShieldCheck,
  BookOpen,
  HeartHandshake,
  KeyRound,
  Trash2,
  Lock,
  ArrowLeft,
  CheckCircle2,
  X,
  Save,
  Loader2
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardHeader, CardSub, CardInset } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Role } from "@/lib/mock-data";

export default function AdminUsersPage() {
  const { userList, kelasList, addUser, updateUser, deleteUser, showToast } = useMizan();

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingPasswordUserId, setEditingPasswordUserId] = useState<string | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "GURU" as Role,
    gender: "Putra" as "Putra" | "Putri",
    assignedClass: "1A"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalTeachersPutra = userList.filter((u) => u.role === "GURU" && u.gender === "Putra").length;
  const totalTeachersPutri = userList.filter((u) => u.role === "GURU" && u.gender === "Putri").length;
  const totalAdmins = userList.filter((u) => u.role === "SUPER_ADMIN").length;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim() || !formData.password.trim()) {
      showToast("Nama, username, dan password wajib diisi.", "error");
      return;
    }

    setIsSubmitting(true);
    const roleTitle =
      formData.role === "SUPER_ADMIN"
        ? "Super Admin Pengasuhan"
        : formData.gender === "Putri"
        ? "Pembina Santriwati Putri"
        : "Pembina Santri Putra";

    const res = await addUser({
      ...formData,
      roleTitle,
      username: formData.username.trim().toLowerCase()
    });

    setIsSubmitting(false);
    if (res.success) {
      setIsAddingUser(false);
      setFormData({
        name: "",
        username: "",
        password: "",
        role: "GURU",
        gender: "Putra",
        assignedClass: kelasList[0] || "1A"
      });
    }
  };

  const handleSavePassword = async (userId: string) => {
    if (!newPasswordVal || newPasswordVal.length < 4) {
      showToast("Kata sandi minimal 4 karakter.", "error");
      return;
    }

    const res = await updateUser(userId, { password: newPasswordVal });
    if (res.success) {
      setEditingPasswordUserId(null);
      setNewPasswordVal("");
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (confirm(`Yakin ingin menghapus akun ${userName}?`)) {
      await deleteUser(userId);
    }
  };

  return (
    <RoleShell>
      <div className="space-y-5 max-w-5xl mx-auto overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/dashboard"
                className="text-xs font-bold text-[#1B4D3E] hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Dashboard</span>
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-[#172033] tracking-tight mt-1">
              Manajemen Pengguna & Akun Pembina
            </h1>
            <p className="text-xs text-[#64748B]">
              Pembuatan akun hanya dapat dilakukan melalui admin panel
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingUser(!isAddingUser)}
            className="px-4 py-2.5 rounded-2xl bg-[#1B4D3E] text-white text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-[#153e32] transition-all self-start sm:self-auto"
          >
            {isAddingUser ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{isAddingUser ? "Batal Tambah" : "Tambah Pengguna Baru"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          <CardSub className="p-3.5 text-center">
            <span className="text-xl sm:text-2xl font-black font-mono text-[#172033] block">
              {userList.length}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block mt-0.5">
              Total Pengguna
            </span>
          </CardSub>

          <CardSub className="p-3.5 text-center">
            <span className="text-xl sm:text-2xl font-black font-mono text-[#065F46] block">
              {totalTeachersPutra}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block mt-0.5">
              Ustadz (Putra)
            </span>
          </CardSub>

          <CardSub className="p-3.5 text-center">
            <span className="text-xl sm:text-2xl font-black font-mono text-[#BE185D] block">
              {totalTeachersPutri}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block mt-0.5">
              Ustadzah (Putri)
            </span>
          </CardSub>

          <CardSub className="p-3.5 text-center">
            <span className="text-xl sm:text-2xl font-black font-mono text-[#A8833E] block">
              {totalAdmins}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block mt-0.5">
              Super Admin
            </span>
          </CardSub>
        </div>

        {isAddingUser && (
          <Card className="p-4 sm:p-5 space-y-4 bg-white border border-[#1B4D3E]/30 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#1B4D3E]" />
                <h2 className="text-xs sm:text-sm font-bold text-[#172033] uppercase tracking-wider">
                  Formulir Buat Akun Pengguna Baru
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="text-[#94A3B8] hover:text-[#172033]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#475569] mb-1">
                    Nama Lengkap & Gelar
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Ustadz Zulkifli, S.Pd.I"
                    className="w-full px-3 py-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#475569] mb-1">
                    Username (Terkunci permanen setelah dibuat)
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                    placeholder="Contoh: ustadz_zul"
                    className="w-full px-3 py-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl font-mono focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#475569] mb-1">
                    Kata Sandi Awal
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimal 4 karakter"
                    className="w-full px-3 py-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#475569] mb-1">
                    Peran Pengguna
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                    className="w-full px-3 py-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                  >
                    <option value="GURU">Guru / Pembina Asrama</option>
                    <option value="SUPER_ADMIN">Super Admin Pengasuhan</option>
                  </select>
                </div>

                {formData.role === "GURU" && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-[#475569] mb-1">
                        Kategori Pembina
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as "Putra" | "Putri" })}
                        className="w-full px-3 py-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                      >
                        <option value="Putra">Ustadz (Khusus Santri Putra)</option>
                        <option value="Putri">Ustadzah (Khusus Santriwati Putri)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#475569] mb-1">
                        Kelas Binaan Utama
                      </label>
                      <select
                        value={formData.assignedClass}
                        onChange={(e) => setFormData({ ...formData, assignedClass: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#EEF2F6] border border-transparent rounded-xl focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                      >
                        {kelasList.map((cls) => (
                          <option key={cls} value={cls}>Kelas {cls}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#EEF2F6]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#153e32] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Buat Akun</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>
        )}

        <Card className="p-4 sm:p-5 space-y-3 bg-white">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
              Daftar Semua Akun Terdaftar ({userList.length})
            </h2>
            <span className="text-[10px] text-[#64748B]">
              Username bersifat tetap, kata sandi dapat diatur ulang
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userList.map((user) => {
              const isSuper = user.role === "SUPER_ADMIN";
              const isPutri = user.gender === "Putri";
              const isEditingThisPwd = editingPasswordUserId === user.id;

              return (
                <div
                  key={user.id}
                  className="p-3.5 rounded-2xl mizan-card-sub space-y-3 hover:border-[#1B4D3E]/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Avatar
                        initials={user.avatarInitials}
                        size="md"
                        variant={isSuper ? "gold" : isPutri ? "neutral" : "primary"}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#172033] truncate">
                          {user.name}
                        </p>
                        <p className="text-[10px] font-mono text-[#64748B]">
                          @{user.username || "user"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              isSuper
                                ? "bg-[#FEF3C7] text-[#92400E]"
                                : isPutri
                                ? "bg-[#FDF2F8] text-[#BE185D]"
                                : "bg-[#ECFDF5] text-[#065F46]"
                            }`}
                          >
                            {isSuper ? "Super Admin" : isPutri ? "Ustadzah (Putri)" : "Ustadz (Putra)"}
                          </span>
                          {!isSuper && user.assignedClass && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EEF2F6] text-[#475569]">
                              Kelas {user.assignedClass}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(user.id, user.name)}
                      className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus Pengguna"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                    {isEditingThisPwd ? (
                      <div className="w-full flex items-center gap-2">
                        <input
                          type="password"
                          value={newPasswordVal}
                          onChange={(e) => setNewPasswordVal(e.target.value)}
                          placeholder="Sandi baru..."
                          className="w-full px-2.5 py-1 text-[11px] bg-[#EEF2F6] border border-transparent rounded-lg focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSavePassword(user.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#1B4D3E] text-white text-[11px] font-bold shrink-0"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPasswordUserId(null);
                            setNewPasswordVal("");
                          }}
                          className="p-1 rounded-lg text-[#94A3B8] hover:text-[#172033]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPasswordUserId(user.id);
                            setNewPasswordVal("");
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1B4D3E] hover:underline"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Atur Ulang Sandi</span>
                        </button>

                        <span className="text-[10px] text-[#94A3B8] flex items-center gap-1 font-bold">
                          <Lock className="w-3 h-3" />
                          Username Terkunci
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </RoleShell>
  );
}
