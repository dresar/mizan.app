"use client";

import React from "react";
import { GraduationCap, Edit2, UserCheck, X } from "lucide-react";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  classNameVal: string;
  onClassNameChange: (val: string) => void;
  genderVal: "Putra" | "Putri";
  onGenderChange: (val: "Putra" | "Putri") => void;
  waliIdVal: string;
  onWaliIdChange: (val: string) => void;
  availableTeachers: Array<{ id: string; name: string; gender?: string }>;
}

export function AddClassModal({
  isOpen,
  onClose,
  onSubmit,
  classNameVal,
  onClassNameChange,
  genderVal,
  onGenderChange,
  waliIdVal,
  onWaliIdChange,
  availableTeachers
}: AddClassModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#E2EBF4] p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#1B4D3E]" />
            <h2 className="text-sm font-bold text-[#172033] uppercase tracking-wider">
              Tambah Kelas
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] hover:text-[#172033]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                Nama Kelas
              </label>
              <input
                type="text"
                required
                value={classNameVal}
                onChange={(e) => onClassNameChange(e.target.value)}
                placeholder="Misal: 1A, 2B..."
                className="w-full p-2.5 text-xs bg-[#F8FAFC] border border-[#D4C9B5] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                Kategori Gender
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["Putra", "Putri"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onGenderChange(g)}
                    className={`py-2 rounded-xl text-xs font-bold text-center border transition-all ${
                      genderVal === g
                        ? "bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-xs"
                        : "bg-white text-[#64748B] border-[#D4C9B5] hover:bg-[#FAF7EE]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                Wali Kelas
              </label>
              <select
                value={waliIdVal}
                onChange={(e) => onWaliIdChange(e.target.value)}
                className="w-full p-2.5 text-xs bg-[#F8FAFC] border border-[#D4C9B5] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
              >
                <option value="">-- Pilih Guru Pembina --</option>
                {availableTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.gender})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#EEF2F6]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#143B2F] shadow-xs"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  targetClassName: string;
  classNameVal: string;
  onClassNameChange: (val: string) => void;
  genderVal: "Putra" | "Putri";
  onGenderChange: (val: "Putra" | "Putri") => void;
  waliIdVal: string;
  onWaliIdChange: (val: string) => void;
  availableTeachers: Array<{ id: string; name: string; gender?: string }>;
}

export function EditClassModal({
  isOpen,
  onClose,
  onSubmit,
  targetClassName,
  classNameVal,
  onClassNameChange,
  genderVal,
  onGenderChange,
  waliIdVal,
  onWaliIdChange,
  availableTeachers
}: EditClassModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#E2EBF4] p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-[#A8833E]" />
            <h2 className="text-sm font-bold text-[#172033] uppercase tracking-wider">
              Ubah Kelas {targetClassName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] hover:text-[#172033]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                Nama Kelas
              </label>
              <input
                type="text"
                required
                value={classNameVal}
                onChange={(e) => onClassNameChange(e.target.value)}
                placeholder="Misal: 1A, 2B..."
                className="w-full p-2.5 text-xs bg-[#F8FAFC] border border-[#D4C9B5] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                Kategori Gender
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["Putra", "Putri"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onGenderChange(g)}
                    className={`py-2 rounded-xl text-xs font-bold text-center border transition-all ${
                      genderVal === g
                        ? "bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-xs"
                        : "bg-white text-[#64748B] border-[#D4C9B5] hover:bg-[#FAF7EE]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
                Wali Kelas
              </label>
              <select
                value={waliIdVal}
                onChange={(e) => onWaliIdChange(e.target.value)}
                className="w-full p-2.5 text-xs bg-[#F8FAFC] border border-[#D4C9B5] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
              >
                <option value="">-- Belum Ditugaskan --</option>
                {availableTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.gender})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#EEF2F6]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#143B2F] shadow-xs"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AssignWaliModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  classNameTitle: string;
  currentWaliName: string;
  waliIdVal: string;
  onWaliIdChange: (val: string) => void;
  availableTeachers: Array<{ id: string; name: string; gender?: string }>;
}

export function AssignWaliModal({
  isOpen,
  onClose,
  onSubmit,
  classNameTitle,
  currentWaliName,
  waliIdVal,
  onWaliIdChange,
  availableTeachers
}: AssignWaliModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-blue-200 p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-blue-200">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#1E3A8A]" />
            <h2 className="text-sm font-bold text-[#172033] uppercase tracking-wider">
              Ubah Wali Kelas {classNameTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] hover:text-[#172033]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#475569] uppercase mb-1">
              Pilih Wali Kelas Baru
            </label>
            <select
              value={waliIdVal}
              onChange={(e) => onWaliIdChange(e.target.value)}
              className="w-full p-2.5 text-xs bg-[#F8FAFC] border border-[#B9D5F3] rounded-xl text-[#172033] focus:outline-none focus:border-[#1B4D3E]"
            >
              <option value="">-- Belum Ditugaskan --</option>
              {availableTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.gender})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#64748B] mt-1.5">
              Wali saat ini: <strong className="text-[#172033]">{currentWaliName}</strong>
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#EEF2F6]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B4D3E] hover:bg-[#143B2F] shadow-xs"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
