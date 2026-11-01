"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  Role,
  UserProfile,
  Santri,
  GuruMonitoring,
  Kategori,
  Unsur,
  Indikator,
  PenilaianRecord,
  AbsensiRecord,
  AppSettings,
  StatusGuru,
  StatusSantri,
  StatusAbsensi,
  DEFAULT_SETTINGS
} from "./mock-data";

export type { UserProfile } from "./mock-data";

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export interface ClassInfo {
  id: string;
  name: string;
  gender: "Putra" | "Putri";
  waliKelas: string;
  guruId: string;
  studentCount: number;
  avgScore: number;
}

interface MizanContextType {
  currentUser: UserProfile;
  activeRole: Role | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  userList: UserProfile[];
  switchRole: (role: Role, userId?: string) => void;
  loginUser: (user: UserProfile) => void;
  logoutUser: () => void;
  updateUserAvatar: (avatarUrl: string) => void;
  santriList: Santri[];
  accessibleSantriList: Santri[];
  getSantri: (id: string) => Santri | undefined;
  addSantri: (santriData: Partial<Santri>) => Promise<{ success: boolean; message: string }>;
  importSantriBatch: (batch: Array<Partial<Santri>>) => Promise<{ success: boolean; message: string }>;
  updateSantri: (id: string, santriData: Partial<Santri>) => Promise<{ success: boolean; message: string }>;
  deleteSantri: (id: string) => Promise<{ success: boolean; message: string }>;
  categories: Kategori[];
  guruList: GuruMonitoring[];
  setGuruStatus: (guruId: string, status: StatusGuru) => void;
  penilaianList: PenilaianRecord[];
  addPenilaian: (record: Omit<PenilaianRecord, "id" | "createdAt" | "dateKey">) => void;
  deletePenilaian: (id: string) => void;
  absensiList: AbsensiRecord[];
  batchAddAbsensi: (records: Omit<AbsensiRecord, "id" | "createdAt">[]) => void;
  updateAbsensi: (id: string, status: StatusAbsensi, notes?: string) => Promise<{ success: boolean; message: string }>;
  deleteAbsensi: (id: string) => Promise<{ success: boolean; message: string }>;
  kelasList: string[];
  classList: ClassInfo[];
  addClass: (newClass: string, gender?: "Putra" | "Putri", waliKelas?: string, guruId?: string) => Promise<{ success: boolean; message: string }>;
  updateClass: (name: string, data: { gender?: "Putra" | "Putri"; waliKelas?: string; guruId?: string }) => Promise<{ success: boolean; message: string }>;
  removeClass: (className: string) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>, options?: { applyToSantri?: boolean; applyToIndicators?: boolean }) => Promise<{ success: boolean; message: string }>;
  toasts: ToastItem[];
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  dismissToast: (id: string) => void;
  addIndikatorToUnsur: (unsurId: string, ind: Omit<Indikator, "id">) => void;
  updateIndikatorItem: (indId: string, updated: Partial<Indikator>) => void;
  deleteIndikatorItem: (indId: string) => void;
  addCategory: (code: string, name: string) => void;
  addUnsurToCategory: (categoryName: string, unsurName: string) => void;
  addUser: (userData: any) => Promise<{ success: boolean; message: string }>;
  updateUser: (id: string, data: any) => Promise<{ success: boolean; message: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; message: string }>;
  refreshData: () => Promise<void>;
  isDbConnected: boolean;
}

const MizanContext = createContext<MizanContextType | undefined>(undefined);

const STORAGE_KEY_ROLE = "mizan_role_state_v4";
const STORAGE_KEY_USER = "mizan_user_id_v4";

const GUEST_USER: UserProfile = {
  id: "",
  username: "",
  name: "Tamu",
  role: "GURU",
  roleTitle: "",
  avatarInitials: "TM",
  gender: "Putra",
  assignedClass: ""
};

export function MizanProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile>(GUEST_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [userList, setUserList] = useState<UserProfile[]>([]);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [kelasList, setKelasList] = useState<string[]>(["1A", "1B", "1C", "1D", "2A", "2B"]);
  const [classList, setClassList] = useState<ClassInfo[]>([]);
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [guruList, setGuruList] = useState<GuruMonitoring[]>([]);
  const [penilaianList, setPenilaianList] = useState<PenilaianRecord[]>([]);
  const [absensiList, setAbsensiList] = useState<AbsensiRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isDbConnected, setIsDbConnected] = useState(false);

  const refreshData = async () => {
    try {
      const res = await fetch("/api/data");
      const data = await res.json();
      if (data.success) {
        setIsDbConnected(true);
        if (data.santri) setSantriList(data.santri);
        if (data.users && data.users.length > 0) {
          setUserList(data.users);
          const savedUserId = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_USER) : null;
          if (savedUserId) {
            const matched = data.users.find((u: UserProfile) => u.id === savedUserId);
            if (matched) {
              setCurrentUser(matched);
              setActiveRole(matched.role);
              setIsAuthenticated(true);
            } else {
              setCurrentUser(GUEST_USER);
              setActiveRole(null);
              setIsAuthenticated(false);
            }
          } else {
            setCurrentUser(GUEST_USER);
            setActiveRole(null);
            setIsAuthenticated(false);
          }
        }
        if (data.kelasList && data.kelasList.length > 0) setKelasList(data.kelasList);
        if (data.classList) setClassList(data.classList);
        if (data.guruList) setGuruList(data.guruList);
        if (data.categories) setCategories(data.categories);
        if (data.penilaianList) setPenilaianList(data.penilaianList);
        if (data.absensiList) setAbsensiList(data.absensiList);
        if (data.settings) setSettings(data.settings);
      }
    } catch {
      setIsDbConnected(false);
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const accessibleSantriList = useMemo(() => {
    if (!isAuthenticated || !currentUser.id) return [];
    if (activeRole === "SUPER_ADMIN") return santriList;
    if (currentUser.gender === "Putra") {
      return santriList.filter((s) => s.gender === "Putra");
    }
    if (currentUser.gender === "Putri") {
      return santriList.filter((s) => s.gender === "Putri");
    }
    return santriList;
  }, [activeRole, currentUser, isAuthenticated, santriList]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = "toast-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loginUser = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, user.role);
      localStorage.setItem(STORAGE_KEY_USER, user.id);
      document.cookie = `mizan_auth=${user.role}; path=/; max-age=86400; SameSite=Lax`;
    } catch {
      void 0;
    }
    showToast(`Selamat datang, ${user.name}`, "success");
  };

  const logoutUser = () => {
    setCurrentUser(GUEST_USER);
    setActiveRole(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEY_ROLE);
      localStorage.removeItem(STORAGE_KEY_USER);
      document.cookie = "mizan_auth=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "mizan_uid=; path=/; max-age=0; SameSite=Lax";
    } catch {
      void 0;
    }
    showToast("Anda telah keluar dari aplikasi.", "info");
  };

  const updateUserAvatar = (newUrl: string) => {
    if (!currentUser.id) return;
    setCurrentUser((prev) => ({
      ...prev,
      avatarUrl: newUrl
    }));
    setUserList((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, avatarUrl: newUrl } : u))
    );
  };

  const switchRole = (role: Role, userId?: string) => {
    let target = userList.find((u) => u.role === role);
    if (userId) {
      const match = userList.find((u) => u.id === userId);
      if (match) target = match;
    }
    if (target) {
      loginUser(target);
    }
  };

  const getSantri = (id: string) => {
    return santriList.find((s) => s.id === id);
  };

  const updateSantriScoreLocally = (id: string, delta: number) => {
    setSantriList((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const maxVal = settings.maxScore || 100;
        const newScore = Math.max(0, Math.min(maxVal, Number((s.currentScore + delta).toFixed(3))));
        const minBaik = settings.minScoreBaik ?? 80;
        const minPerhatian = settings.minScorePerhatian ?? 70;
        let newStatus: StatusSantri = "Baik";
        if (newScore < minPerhatian) newStatus = "Perlu Pembinaan";
        else if (newScore < minBaik) newStatus = "Perhatian";
        return {
          ...s,
          currentScore: newScore,
          status: newStatus
        };
      })
    );
  };

  const addPenilaian = (record: Omit<PenilaianRecord, "id" | "createdAt" | "dateKey">) => {
    const id = "pen-" + Date.now();
    const newRecord: PenilaianRecord = {
      ...record,
      id,
      createdAt: "Hari ini, baru saja",
      dateKey: "today"
    };

    setPenilaianList((prev) => [newRecord, ...prev]);
    updateSantriScoreLocally(record.santriId, record.score);

    setGuruList((prev) =>
      prev.map((g) => {
        if (g.name === record.guruName) {
          return {
            ...g,
            reportCountToday: g.reportCountToday + 1,
            status: "Sudah Lapor" as StatusGuru
          };
        }
        return g;
      })
    );

    fetch("/api/penilaian", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record)
    }).catch(() => void 0);

    showToast("Catatan penilaian berhasil disimpan", "success");
  };

  const deletePenilaian = (id: string) => {
    const item = penilaianList.find((p) => p.id === id);
    if (!item) return;

    setPenilaianList((prev) => prev.filter((p) => p.id !== id));
    updateSantriScoreLocally(item.santriId, -item.score);

    fetch(`/api/penilaian?id=${id}`, {
      method: "DELETE"
    }).catch(() => void 0);

    showToast("Penilaian dihapus", "info");
  };

  const batchAddAbsensi = (records: Omit<AbsensiRecord, "id" | "createdAt">[]) => {
    const timestamp = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const newItems: AbsensiRecord[] = records.map((r, idx) => ({
      ...r,
      id: `abs-${Date.now()}-${idx}`,
      createdAt: `Hari ini, ${timestamp} WIB`
    }));

    setAbsensiList((prev) => [...newItems, ...prev]);

    records.forEach((r) => {
      if (r.scoreImpact !== 0) {
        updateSantriScoreLocally(r.santriId, r.scoreImpact);
      }
      setSantriList((prev) =>
        prev.map((s) => {
          if (s.id !== r.santriId) return s;
          return {
            ...s,
            totalHadir: (s.totalHadir || 0) + (r.status === "Hadir" ? 1 : 0),
            totalAlpa: (s.totalAlpa || 0) + (r.status === "Alpa" ? 1 : 0)
          };
        })
      );
    });

    fetch("/api/absensi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records })
    })
      .then(() => refreshData())
      .catch(() => void 0);

    showToast(`Absensi ${records.length} santri disimpan`, "success");
  };

  const updateAbsensi = async (id: string, status: StatusAbsensi, notes?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/absensi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, notes })
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast("Status absensi diperbarui", "success");
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal memperbarui absensi", "error");
      return { success: false, message: data.message };
    } catch (err: any) {
      showToast(err.message, "error");
      return { success: false, message: err.message };
    }
  };

  const deleteAbsensi = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/absensi?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast("Data absensi dihapus", "info");
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal menghapus absensi", "error");
      return { success: false, message: data.message };
    } catch (err: any) {
      showToast(err.message, "error");
      return { success: false, message: err.message };
    }
  };

  const addSantri = async (santriData: Partial<Santri>): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/santri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(santriData)
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(data.message, "success");
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal menambah santri", "error");
      return { success: false, message: data.message || "Gagal menambah santri" };
    } catch (err: any) {
      showToast(err.message, "error");
      return { success: false, message: err.message };
    }
  };

  const importSantriBatch = async (batch: Array<Partial<Santri>>): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/santri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch)
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(data.message, "success");
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal mengimpor data santri", "error");
      return { success: false, message: data.message || "Gagal mengimpor data santri" };
    } catch (err: any) {
      showToast(err.message, "error");
      return { success: false, message: err.message };
    }
  };

  const updateSantri = async (id: string, santriData: Partial<Santri>): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/santri", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...santriData })
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(data.message, "success");
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal memperbarui santri", "error");
      return { success: false, message: data.message || "Gagal memperbarui santri" };
    } catch (err: any) {
      showToast(err.message, "error");
      return { success: false, message: err.message };
    }
  };

  const deleteSantri = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/santri?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(data.message, "info");
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal menghapus santri", "error");
      return { success: false, message: data.message || "Gagal menghapus santri" };
    } catch (err: any) {
      showToast(err.message, "error");
      return { success: false, message: err.message };
    }
  };

  const addClass = async (newClass: string, gender: "Putra" | "Putri" = "Putra", waliKelas = "", guruId = ""): Promise<{ success: boolean; message: string }> => {
    const clean = newClass.trim().toUpperCase();
    if (!clean) return { success: false, message: "Nama kelas wajib diisi." };
    if (kelasList.includes(clean)) {
      showToast("Kelas sudah ada", "error");
      return { success: false, message: "Kelas sudah ada." };
    }
    setKelasList((prev) => [...prev, clean]);

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clean, gender, waliKelas, guruId })
      });
      const data = await res.json();
      await refreshData();
      showToast(`Kelas ${clean} berhasil ditambahkan`, "success");
      return { success: true, message: data.message || `Kelas ${clean} berhasil ditambahkan.` };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const updateClass = async (name: string, data: { gender?: "Putra" | "Putri"; waliKelas?: string; guruId?: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, ...data })
      });
      const resData = await res.json();
      if (resData.success) {
        await refreshData();
        showToast(resData.message, "success");
        return { success: true, message: resData.message };
      }
      showToast(resData.message || "Gagal memperbarui kelas", "error");
      return { success: false, message: resData.message || "Gagal memperbarui kelas" };
    } catch (err: any) {
      showToast(err.message, "error");
      return { success: false, message: err.message };
    }
  };

  const removeClass = (className: string) => {
    setKelasList((prev) => prev.filter((c) => c !== className));
    setClassList((prev) => prev.filter((c) => c.name !== className));

    fetch(`/api/classes?name=${className}`, {
      method: "DELETE"
    }).then(() => refreshData()).catch(() => void 0);

    showToast(`Kelas ${className} dihapus`, "info");
  };

  const setGuruStatus = (guruId: string, status: StatusGuru) => {
    setGuruList((prev) => prev.map((g) => (g.id === guruId ? { ...g, status } : g)));
  };

  const updateSettings = async (
    newSettings: Partial<AppSettings>,
    options?: { applyToSantri?: boolean; applyToIndicators?: boolean }
  ): Promise<{ success: boolean; message: string }> => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: merged,
          applyToSantri: options?.applyToSantri || false,
          applyToIndicators: options?.applyToIndicators || false
        })
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast("Pengaturan berhasil disimpan", "success");
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal menyimpan pengaturan", "error");
      return { success: false, message: data.message };
    } catch {
      showToast("Pengaturan disimpan", "success");
      return { success: true, message: "Pengaturan disimpan" };
    }
  };

  const addIndikatorToUnsur = (unsurId: string, ind: Omit<Indikator, "id">) => {
    const id = "ind-" + Date.now();
    const newIndikator: Indikator = { ...ind, id };
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        unsurs: cat.unsurs.map((uns) => {
          if (uns.id === unsurId) {
            return { ...uns, indicators: [...uns.indicators, newIndikator] };
          }
          return uns;
        })
      }))
    );

    fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ADD_INDICATOR", unsurId, ...ind })
    }).catch(() => void 0);

    showToast("Indikator ditambahkan", "success");
  };

  const updateIndikatorItem = (indId: string, updated: Partial<Indikator>) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        unsurs: cat.unsurs.map((uns) => ({
          ...uns,
          indicators: uns.indicators.map((ind) =>
            ind.id === indId ? { ...ind, ...updated } : ind
          )
        }))
      }))
    );

    fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "UPDATE_INDICATOR", indId, ...updated })
    }).catch(() => void 0);

    showToast("Indikator diperbarui", "success");
  };

  const deleteIndikatorItem = (indId: string) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        unsurs: cat.unsurs.map((uns) => ({
          ...uns,
          indicators: uns.indicators.filter((ind) => ind.id !== indId)
        }))
      }))
    );

    fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DELETE_INDICATOR", indId })
    }).catch(() => void 0);

    showToast("Indikator dihapus", "info");
  };

  const addCategory = (code: string, name: string) => {
    const newCat: Kategori = {
      code,
      name,
      unsurs: []
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Kategori ${name} ditambahkan`, "success");
  };

  const addUnsurToCategory = (categoryName: string, unsurName: string) => {
    const newUnsur: Unsur = {
      id: "unsur-" + Date.now(),
      name: unsurName,
      indicators: []
    };
    setCategories((prev) =>
      prev.map((cat) =>
        cat.name === categoryName
          ? { ...cat, unsurs: [...cat.unsurs, newUnsur] }
          : cat
      )
    );
    showToast(`Unsur ${unsurName} ditambahkan`, "success");
  };

  const addUser = async (userData: any): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(data.message, "success");
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal membuat pengguna", "error");
      return { success: false, message: data.message || "Gagal membuat pengguna" };
    } catch (err: any) {
      showToast(err.message, "error");
      return { success: false, message: err.message };
    }
  };

  const updateUser = async (id: string, data: any): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data })
      });
      const resData = await res.json();
      if (resData.success) {
        await refreshData();
        showToast(resData.message, "success");
        return { success: true, message: resData.message };
      }
      showToast(resData.message || "Gagal memperbarui pengguna", "error");
      return { success: false, message: resData.message || "Gagal memperbarui pengguna" };
    } catch (err: any) {
      showToast(err.message, "error");
      return { success: false, message: err.message };
    }
  };

  const deleteUser = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      const resData = await res.json();
      if (resData.success) {
        await refreshData();
        showToast(resData.message, "info");
        return { success: true, message: resData.message };
      }
      showToast(resData.message || "Gagal menghapus pengguna", "error");
      return { success: false, message: resData.message || "Gagal menghapus pengguna" };
    } catch (err: any) {
      showToast(err.message, "error");
      return { success: false, message: err.message };
    }
  };

  return (
    <MizanContext.Provider
      value={{
        currentUser,
        activeRole,
        isAuthenticated,
        isAuthLoading,
        userList,
        switchRole,
        loginUser,
        logoutUser,
        updateUserAvatar,
        santriList,
        accessibleSantriList,
        getSantri,
        addSantri,
        importSantriBatch,
        updateSantri,
        deleteSantri,
        categories,
        guruList,
        setGuruStatus,
        penilaianList,
        addPenilaian,
        deletePenilaian,
        absensiList,
        batchAddAbsensi,
        updateAbsensi,
        deleteAbsensi,
        kelasList,
        classList,
        addClass,
        updateClass,
        removeClass,
        settings,
        updateSettings,
        toasts,
        showToast,
        dismissToast,
        addIndikatorToUnsur,
        updateIndikatorItem,
        deleteIndikatorItem,
        addCategory,
        addUnsurToCategory,
        addUser,
        updateUser,
        deleteUser,
        refreshData,
        isDbConnected
      }}
    >
      {children}
    </MizanContext.Provider>
  );
}

export function useMizan() {
  const context = useContext(MizanContext);
  if (!context) {
    throw new Error("useMizan must be used within a MizanProvider");
  }
  return context;
}
