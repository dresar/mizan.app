"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Plus,
  Search,
  List,
  LayoutGrid
} from "lucide-react";
import { useMizan } from "@/lib/mizan-context";
import { RoleShell } from "@/components/RoleShell";
import { CardSub } from "@/components/ui/Card";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Pagination } from "@/components/ui/Pagination";
import { AddClassModal, EditClassModal, AssignWaliModal } from "./ClassModals";
import { ClassTableView, EnrichedClassItem } from "./ClassTableView";
import { ClassGridView } from "./ClassGridView";

export default function AdminKelasPage() {
  const router = useRouter();
  const {
    kelasList,
    classList,
    santriList,
    userList,
    addClass,
    updateClass,
    removeClass,
    showToast
  } = useMizan();

  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [selectedGender, setSelectedGender] = useState<"ALL" | "Putra" | "Putri">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassGender, setNewClassGender] = useState<"Putra" | "Putri">("Putra");
  const [newWaliId, setNewWaliId] = useState("");

  const [isEditingClass, setIsEditingClass] = useState(false);
  const [targetEditClass, setTargetEditClass] = useState<EnrichedClassItem | null>(null);
  const [editClassName, setEditClassName] = useState("");
  const [editGender, setEditGender] = useState<"Putra" | "Putri">("Putra");
  const [editWaliId, setEditWaliId] = useState("");

  const [isEditingWali, setIsEditingWali] = useState(false);
  const [targetWaliClass, setTargetWaliClass] = useState<EnrichedClassItem | null>(null);
  const [quickWaliId, setQuickWaliId] = useState("");

  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; name?: string }>({ isOpen: false });

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdownId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const availableTeachers = useMemo(() => {
    return userList.filter((u) => u.role === "GURU" || u.role === "PENGASUHAN");
  }, [userList]);

  const enrichedClasses: EnrichedClassItem[] = useMemo(() => {
    return kelasList.map((clsName) => {
      const matchDb = classList.find((c) => c.name.toUpperCase() === clsName.toUpperCase());
      const students = santriList.filter((s) => s.class.toUpperCase() === clsName.toUpperCase());
      const avg =
        students.length > 0
          ? students.reduce((acc, s) => acc + s.currentScore, 0) / students.length
          : 70.0;

      let defaultGender: "Putra" | "Putri" = "Putra";
      if (matchDb?.gender) {
        defaultGender = matchDb.gender;
      } else if (clsName.endsWith("C") || clsName.endsWith("D")) {
        defaultGender = "Putri";
      }

      const assignedTeacher = userList.find(
        (u) => u.assignedClass?.toUpperCase() === clsName.toUpperCase() && (u.role === "GURU" || u.role === "PENGASUHAN")
      );

      const dominantAsrama =
        students.find((s) => s.asrama)?.asrama ||
        (defaultGender === "Putra" ? "Asrama Al-Farabi" : "Asrama Khadijah");

      return {
        id: matchDb?.id || `cls-${clsName.toLowerCase()}`,
        name: clsName,
        gender: defaultGender,
        waliKelas: assignedTeacher?.name || matchDb?.waliKelas || "Belum Ditugaskan",
        guruId: assignedTeacher?.id || matchDb?.guruId || "",
        teacherAvatarUrl: assignedTeacher?.avatarUrl,
        teacherInitials:
          assignedTeacher?.avatarInitials ||
          (assignedTeacher?.name || matchDb?.waliKelas || "WK").slice(0, 2).toUpperCase(),
        studentCount: students.length,
        avgScore: avg,
        asrama: dominantAsrama,
        students: students.slice(0, 5).map((s) => ({
          id: s.id,
          name: s.name,
          avatar: s.avatar || s.name.slice(0, 2).toUpperCase(),
          avatarUrl: s.avatarUrl,
          currentScore: s.currentScore
        }))
      };
    });
  }, [kelasList, classList, santriList, userList]);

  const filteredClasses = useMemo(() => {
    return enrichedClasses.filter((c) => {
      const matchGender = selectedGender === "ALL" || c.gender === selectedGender;
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.waliKelas.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGender && matchSearch;
    });
  }, [enrichedClasses, selectedGender, searchQuery]);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGender]);

  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedClasses = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredClasses.slice(start, start + PAGE_SIZE);
  }, [filteredClasses, safePage]);

  const handleOpenEditClass = (cls: EnrichedClassItem) => {
    setTargetEditClass(cls);
    setEditClassName(cls.name);
    setEditGender(cls.gender);
    setEditWaliId(cls.guruId);
    setIsEditingClass(true);
    setIsEditingWali(false);
  };

  const handleSaveEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEditClass) return;

    const cleanNew = editClassName.trim().toUpperCase();
    if (!cleanNew) {
      showToast("Nama kelas wajib diisi", "error");
      return;
    }

    const teacher = userList.find((u) => u.id === editWaliId);
    const res = await updateClass(targetEditClass.name, {
      newName: cleanNew,
      gender: editGender,
      waliKelas: teacher?.name || "",
      guruId: editWaliId
    });

    if (res.success) {
      setIsEditingClass(false);
      setTargetEditClass(null);
    }
  };

  const handleOpenEditWali = (cls: EnrichedClassItem) => {
    setTargetWaliClass(cls);
    setQuickWaliId(cls.guruId);
    setIsEditingWali(true);
    setIsEditingClass(false);
  };

  const handleSaveQuickWali = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWaliClass) return;

    const teacher = userList.find((u) => u.id === quickWaliId);
    const res = await updateClass(targetWaliClass.name, {
      waliKelas: teacher?.name || "",
      guruId: quickWaliId
    });

    if (res.success) {
      setIsEditingWali(false);
      setTargetWaliClass(null);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newClassName.trim().toUpperCase();
    if (!clean) {
      showToast("Nama kelas wajib diisi", "error");
      return;
    }

    const teacher = userList.find((u) => u.id === newWaliId);
    const res = await addClass(
      clean,
      newClassGender,
      teacher?.name || "",
      newWaliId
    );

    if (res.success) {
      setNewClassName("");
      setNewWaliId("");
      setIsAddingClass(false);
    }
  };

  const handleDeleteClassByName = (name: string) => {
    setDeleteModalState({ isOpen: true, name });
  };

  const handleConfirmDeleteClass = async () => {
    if (!deleteModalState.name) return;
    await removeClass(deleteModalState.name);
    setActiveDropdownId(null);
    setDeleteModalState({ isOpen: false });
  };

  return (
    <RoleShell>
      <div className="w-full space-y-4 overflow-x-hidden pb-36">
        <div className="mizan-card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white border border-[#E2EBF4]">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#1B4D3E]" />
              <h1 className="text-base sm:text-xl font-serif font-black text-[#172033] tracking-tight">
                Manajemen & Detail Kelas
              </h1>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Pantau seluruh santri dan santriwati, rata-rata skor, tingkat prestasi, serta pelanggaran secara lengkap dalam satu halaman
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingClass(true)}
            className="px-4 py-2 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153e32] transition-colors flex items-center gap-1.5 shadow-2xs self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
          <CardSub className="p-4 bg-white text-center">
            <span className="text-[10px] text-[#64748B] font-bold uppercase block">
              Total Kelas
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#172033] block mt-1">
              {kelasList.length}
            </span>
          </CardSub>

          <CardSub className="p-4 bg-white text-center">
            <span className="text-[10px] text-[#065F46] font-bold uppercase block">
              Kelas L
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#065F46] block mt-1">
              {enrichedClasses.filter((c) => c.gender === "Putra").length}
            </span>
          </CardSub>

          <CardSub className="p-4 bg-white text-center">
            <span className="text-[10px] text-[#A8833E] font-bold uppercase block">
              Kelas P
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#A8833E] block mt-1">
              {enrichedClasses.filter((c) => c.gender === "Putri").length}
            </span>
          </CardSub>

          <CardSub className="p-4 bg-white text-center">
            <span className="text-[10px] text-[#64748B] font-bold uppercase block">
              Total Santri
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#172033] block mt-1">
              {santriList.length}
            </span>
          </CardSub>
        </div>

        <div className="mizan-card p-3 sm:p-4 bg-white border border-[#E2EBF4] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-[#1B4D3E] text-white shadow-2xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Daftar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-[#1B4D3E] text-white shadow-2xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Kotak</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-full mizan-pill bg-white text-xs font-bold border border-[#E2E8F0]">
                {(["ALL", "Putra", "Putri"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGender(g)}
                    className={`py-1 px-3 rounded-full transition-all text-center cursor-pointer ${
                      selectedGender === g
                        ? "bg-[#1B4D3E] text-white shadow-xs"
                        : "text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    {g === "ALL" ? "Semua" : g === "Putra" ? "L" : "P"}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kelas atau nama wali..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E2EBF4] rounded-full text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
              />
            </div>
          </div>

          {viewMode === "list" ? (
            <ClassTableView
              classes={paginatedClasses}
              safePage={safePage}
              pageSize={PAGE_SIZE}
              activeDropdownId={activeDropdownId}
              onToggleDropdown={setActiveDropdownId}
              onOpenEditClass={handleOpenEditClass}
              onOpenEditWali={handleOpenEditWali}
              onDeleteClass={handleDeleteClassByName}
            />
          ) : (
            <ClassGridView
              classes={paginatedClasses}
              activeDropdownId={activeDropdownId}
              onToggleDropdown={setActiveDropdownId}
              onOpenEditClass={handleOpenEditClass}
              onOpenEditWali={handleOpenEditWali}
              onDeleteClass={handleDeleteClassByName}
            />
          )}

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredClasses.length}
            itemsPerPage={PAGE_SIZE}
            itemName="kelas"
          />
        </div>

        <AddClassModal
          isOpen={isAddingClass}
          onClose={() => setIsAddingClass(false)}
          onSubmit={handleCreateClass}
          classNameVal={newClassName}
          onClassNameChange={setNewClassName}
          genderVal={newClassGender}
          onGenderChange={setNewClassGender}
          waliIdVal={newWaliId}
          onWaliIdChange={setNewWaliId}
          availableTeachers={availableTeachers}
        />

        <EditClassModal
          isOpen={isEditingClass && !!targetEditClass}
          onClose={() => {
            setIsEditingClass(false);
            setTargetEditClass(null);
          }}
          onSubmit={handleSaveEditClass}
          targetClassName={targetEditClass?.name || ""}
          classNameVal={editClassName}
          onClassNameChange={setEditClassName}
          genderVal={editGender}
          onGenderChange={setEditGender}
          waliIdVal={editWaliId}
          onWaliIdChange={setEditWaliId}
          availableTeachers={availableTeachers}
        />

        <AssignWaliModal
          isOpen={isEditingWali && !!targetWaliClass}
          onClose={() => {
            setIsEditingWali(false);
            setTargetWaliClass(null);
          }}
          onSubmit={handleSaveQuickWali}
          classNameTitle={targetWaliClass?.name || ""}
          currentWaliName={targetWaliClass?.waliKelas || ""}
          waliIdVal={quickWaliId}
          onWaliIdChange={setQuickWaliId}
          availableTeachers={availableTeachers}
        />
      </div>

      <DeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false })}
        onConfirm={handleConfirmDeleteClass}
        title="Hapus Kelas"
        message={deleteModalState.name ? `Yakin ingin menghapus Kelas ${deleteModalState.name}?` : undefined}
      />
    </RoleShell>
  );
}
