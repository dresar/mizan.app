"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  KeyRound,
  Trash2,
  Lock,
  ArrowLeft,
  Check,
  X,
  Save,
  Loader2,
  Smartphone,
  Apple,
  List,
  LayoutGrid,
  Search
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { Card, CardSub } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Role } from "@/lib/mock-data";

export default function AdminUsersPage() {
  const { userList, kelasList, addUser, updateUser, deleteUser, deleteUserBulk, showToast } = useMizan();

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    ids: string[];
    name?: string;
    count?: number;
    isLoading?: boolean;
  }>({
    isOpen: false,
    ids: []
  });

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

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return userList;
    return userList.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.assignedClass && u.assignedClass.toLowerCase().includes(q))
    );
  }, [userList, searchQuery]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim() || !formData.password.trim()) {
      showToast("Nama, username, dan password wajib diisi.", "error");
      return;
    }

    setIsSubmitting(true);
    let roleTitle = "Pembina Santri Putra";
    if (formData.role === "SUPER_ADMIN") {
      roleTitle = "Super Admin Pengasuhan";
    } else if (formData.role === "PENGASUHAN") {
      roleTitle = formData.gender === "Putri" ? "Pengasuhan Santriwati Putri" : "Pengasuhan Santri Putra";
    } else {
      roleTitle = formData.gender === "Putri" ? "Pembina Santriwati Putri" : "Pembina Santri Putra";
    }

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

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleOpenDeleteSingle = (user: any) => {
    setDeleteModalState({
      isOpen: true,
      ids: [user.id],
      name: user.name,
      count: 1
    });
  };

  const handleOpenDeleteBulk = () => {
    if (selectedUserIds.length === 0) return;
    setDeleteModalState({
      isOpen: true,
      ids: selectedUserIds,
      count: selectedUserIds.length
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModalState.ids.length === 0) return;
    setDeleteModalState((prev) => ({ ...prev, isLoading: true }));
    try {
      if (deleteModalState.ids.length === 1) {
        await deleteUser(deleteModalState.ids[0]);
      } else {
        await deleteUserBulk(deleteModalState.ids);
      }
      setSelectedUserIds((prev) => prev.filter((id) => !deleteModalState.ids.includes(id)));
      setDeleteModalState({ isOpen: false, ids: [] });
    } finally {
      setDeleteModalState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/dashboard"
                className="text-xs font-bold text-[#1B4D3E] hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
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
            <span>{isAddingUser ? "Batal" : "Tambah"}</span>
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
                    <option value="PENGASUHAN">Bagian Pengasuhan & BK (Presensi Sholat)</option>
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
                      <span>Simpan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>
        )}

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

        <Card className="p-4 sm:p-5 space-y-3 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#E2E8F0] gap-2">
            <div>
              <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                Daftar Semua Akun Terdaftar ({filteredUsers.length})
              </h2>
              <span className="text-[10px] text-[#64748B]">
                Username bersifat tetap, kata sandi dapat diatur ulang
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-[#EEF2F6] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === "list"
                      ? "bg-white text-[#1B4D3E] shadow-2xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Daftar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-[#1B4D3E] shadow-2xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Kotak</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSelectAllUsers}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                  selectedUserIds.length > 0 && selectedUserIds.length === filteredUsers.length
                    ? "bg-[#1B4D3E] text-white border-[#1B4D3E]"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0 ? "Batal" : "Pilih"}</span>
              </button>

              {selectedUserIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleOpenDeleteBulk}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Cari pengguna berdasarkan nama, username, atau kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-[#EEF2F6] border border-transparent rounded-xl text-[#172033] focus:bg-white focus:border-[#1B4D3E] focus:outline-none transition-colors"
            />
          </div>

          {viewMode === "list" ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-3 w-10 text-center">
                      <span className="sr-only">Pilih</span>
                    </th>
                    <th className="py-3 px-3.5">Pengguna</th>
                    <th className="py-3 px-3.5">Username</th>
                    <th className="py-3 px-3.5">Peran</th>
                    <th className="py-3 px-3.5">Kelas</th>
                    <th className="py-3 px-3.5 text-right w-44">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredUsers.map((user) => {
                    const isSuper = user.role === "SUPER_ADMIN";
                    const isPutri = user.gender === "Putri";
                    const isEditingThisPwd = editingPasswordUserId === user.id;
                    const isSelected = selectedUserIds.includes(user.id);

                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-[#FAF7EE]/60 transition-colors ${
                          isSelected ? "bg-red-50/20" : ""
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectUser(user.id)}
                            className="w-4 h-4 rounded text-[#1B4D3E] accent-[#1B4D3E] cursor-pointer"
                            aria-label={`Pilih ${user.name}`}
                          />
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={user.avatarUrl}
                              initials={user.avatarInitials}
                              size="md"
                              variant={isSuper ? "gold" : isPutri ? "neutral" : "primary"}
                              className="w-12 h-12 shadow-2xs"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-[#172033] text-sm truncate">
                                {user.name}
                              </p>
                              <p className="text-[11px] text-[#64748B]">
                                {user.roleTitle || "Pembina"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 font-mono text-[#475569]">
                          @{user.username || "user"}
                        </td>
                        <td className="py-3 px-3.5">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                              isSuper
                                ? "bg-[#FEF3C7] text-[#92400E]"
                                : isPutri
                                ? "bg-[#FDF2F8] text-[#BE185D]"
                                : "bg-[#ECFDF5] text-[#065F46]"
                            }`}
                          >
                            {isSuper ? "Super Admin" : isPutri ? "Ustadzah (Putri)" : "Ustadz (Putra)"}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-bold text-[#172033]">
                          {!isSuper && user.assignedClass ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEF2F6] text-[#475569]">
                              Kelas {user.assignedClass}
                            </span>
                          ) : (
                            <span className="text-[#94A3B8]">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          {isEditingThisPwd ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <input
                                type="password"
                                value={newPasswordVal}
                                onChange={(e) => setNewPasswordVal(e.target.value)}
                                placeholder="Sandi baru..."
                                className="w-28 px-2 py-1 text-xs bg-[#EEF2F6] border border-transparent rounded-lg focus:bg-white focus:border-[#1B4D3E] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSavePassword(user.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#1B4D3E] text-white text-xs font-bold"
                              >
                                Simpan
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPasswordUserId(null);
                                  setNewPasswordVal("");
                                }}
                                className="px-2 py-1 rounded-lg text-[#64748B] hover:bg-[#EEF2F6] text-xs font-bold"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPasswordUserId(user.id);
                                  setNewPasswordVal("");
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7EE] text-[#A8833E] border border-[#C5A059]/30 hover:bg-[#C5A059] hover:text-white text-xs font-bold transition-colors"
                              >
                                <KeyRound className="w-3 h-3" />
                                <span>Sandi</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteSingle(user)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white text-xs font-bold transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-[#94A3B8]">
                        Tidak ada pengguna yang cocok dengan pencarian
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredUsers.map((user) => {
                const isSuper = user.role === "SUPER_ADMIN";
                const isPutri = user.gender === "Putri";
                const isEditingThisPwd = editingPasswordUserId === user.id;
                const isSelected = selectedUserIds.includes(user.id);

                return (
                  <div
                    key={user.id}
                    className={`p-3.5 rounded-2xl mizan-card-sub space-y-3 hover:border-[#1B4D3E]/40 transition-all ${
                      isSelected ? "ring-2 ring-red-400 bg-red-50/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectUser(user.id)}
                          className="w-4 h-4 rounded text-[#1B4D3E] accent-[#1B4D3E] cursor-pointer shrink-0 mt-3"
                          aria-label={`Pilih ${user.name}`}
                        />
                        <Avatar
                          src={user.avatarUrl}
                          initials={user.avatarInitials}
                          size="md"
                          variant={isSuper ? "gold" : isPutri ? "neutral" : "primary"}
                          className="w-12 h-12 shadow-2xs shrink-0"
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
                        onClick={() => handleOpenDeleteSingle(user)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus"
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
                            className="p-1 rounded-lg text-[#64748B] hover:text-[#172033] text-xs font-bold"
                          >
                            Batal
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
                            <span>Sandi</span>
                          </button>

                          <span className="text-[10px] text-[#94A3B8] flex items-center gap-1 font-bold">
                            <Lock className="w-3 h-3" />
                            <span>Terkunci</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="col-span-full py-12 text-center text-xs text-[#94A3B8]">
                  Tidak ada pengguna yang cocok dengan pencarian
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <DeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, ids: [] })}
        onConfirm={handleConfirmDelete}
        count={deleteModalState.count}
        message={
          deleteModalState.count === 1 && deleteModalState.name
            ? `Hapus akun pengguna ${deleteModalState.name}?`
            : undefined
        }
        isLoading={deleteModalState.isLoading}
      />
    </RoleShell>
  );
}