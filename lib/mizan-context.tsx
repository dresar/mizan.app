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
  DEFAULT_SETTINGS,
  getSantriDisciplineStatus,
  FeedbackRecord,
  FeedbackStatus,
  FeedbackType,
  MizanNotification,
  INITIAL_CLASSES,
  INITIAL_CATEGORIES,
  TahfidzRecord,
  KesehatanRecord,
  PerizinanRecord,
  SambanganRecord,
  TransaksiKeuangan,
  TagihanSPP,
  CatatanMusyrif
} from "./mock-data";
import { formatWIBDate, formatWIBDateTime, getWIBDate, getWIBTime } from "./date-utils";

export type { UserProfile, MizanNotification } from "./mock-data";

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
  loginUser: (user: UserProfile, token?: string) => void;
  logoutUser: () => void;
  updateUserAvatar: (avatarUrl: string) => void;
  santriList: Santri[];
  accessibleSantriList: Santri[];
  getSantri: (id: string) => Santri | undefined;
  addSantri: (santriData: Partial<Santri>) => Promise<{ success: boolean; message: string }>;
  importSantriBatch: (batch: Array<Partial<Santri>>) => Promise<{ success: boolean; message: string }>;
  updateSantri: (id: string, santriData: Partial<Santri>) => Promise<{ success: boolean; message: string }>;
  deleteSantri: (id: string) => Promise<{ success: boolean; message: string }>;
  deleteSantriBulk: (ids: string[]) => Promise<{ success: boolean; message: string }>;
  categories: Kategori[];
  guruList: GuruMonitoring[];
  setGuruStatus: (guruId: string, status: StatusGuru) => void;
  penilaianList: PenilaianRecord[];
  addPenilaian: (record: Omit<PenilaianRecord, "id" | "createdAt" | "dateKey"> & { createdAt?: string; dateKey?: string }) => void;
  deletePenilaian: (id: string) => void;
  deletePenilaianBulk: (ids: string[]) => Promise<{ success: boolean; message: string }>;
  submitSanggahan: (penilaianId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  resolveSanggahan: (penilaianId: string, decision: "TERIMA" | "TOLAK", staffName?: string, notes?: string) => Promise<{ success: boolean; message: string }>;
  absensiList: AbsensiRecord[];
  batchAddAbsensi: (records: Omit<AbsensiRecord, "id" | "createdAt">[]) => void;
  updateAbsensi: (id: string, status: StatusAbsensi, notes?: string) => Promise<{ success: boolean; message: string }>;
  deleteAbsensi: (id: string) => Promise<{ success: boolean; message: string }>;
  deleteAbsensiBulk: (ids: string[]) => Promise<{ success: boolean; message: string }>;
  kelasList: string[];
  classList: ClassInfo[];
  addClass: (newClass: string, gender?: "Putra" | "Putri", waliKelas?: string, guruId?: string) => Promise<{ success: boolean; message: string }>;
  updateClass: (name: string, data: { newName?: string; gender?: "Putra" | "Putri"; waliKelas?: string; guruId?: string }) => Promise<{ success: boolean; message: string }>;
  removeClass: (className: string) => void;
  removeClassBulk: (classNames: string[]) => Promise<{ success: boolean; message: string }>;
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
  deleteUserBulk: (ids: string[]) => Promise<{ success: boolean; message: string }>;
  refreshData: () => Promise<void>;
  isDbConnected: boolean;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  feedbackList: FeedbackRecord[];
  addFeedback: (data: Omit<FeedbackRecord, "id" | "createdAt" | "status">) => Promise<{ success: boolean; data?: FeedbackRecord; message: string }>;
  updateFeedbackStatus: (id: string, status: FeedbackStatus, adminNotes?: string) => Promise<{ success: boolean; message: string }>;
  deleteFeedback: (id: string) => Promise<{ success: boolean; message: string }>;
  isFeedbackModalOpen: boolean;
  setIsFeedbackModalOpen: (open: boolean) => void;
  feedbackInitialType: FeedbackType;
  openFeedbackModal: (type?: FeedbackType) => void;
  notificationList: MizanNotification[];
  readNotifIds: string[];
  addNotification: (item: Omit<MizanNotification, "id" | "createdAt">) => Promise<{ success: boolean; message: string }>;
  updateNotification: (id: string, updates: Partial<MizanNotification>) => Promise<{ success: boolean; message: string }>;
  deleteNotification: (id: string) => Promise<{ success: boolean; message: string }>;
  toggleNotificationActive: (id: string, currentActive: boolean) => Promise<{ success: boolean; message: string }>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  tahfidzList: TahfidzRecord[];
  addTahfidz: (data: Omit<TahfidzRecord, "id" | "createdAt">) => Promise<{ success: boolean; message: string }>;
  deleteTahfidz: (id: string) => Promise<{ success: boolean; message: string }>;
  deleteTahfidzBulk: (ids: string[]) => Promise<{ success: boolean; message: string }>;
  kesehatanList: KesehatanRecord[];
  addKesehatan: (data: Omit<KesehatanRecord, "id" | "createdAt">) => Promise<{ success: boolean; message: string }>;
  deleteKesehatan: (id: string) => Promise<{ success: boolean; message: string }>;
  perizinanList: PerizinanRecord[];
  addPerizinan: (data: Omit<PerizinanRecord, "id" | "createdAt" | "qrCodeToken" | "status">) => Promise<{ success: boolean; message: string }>;
  updatePerizinan: (data: Partial<PerizinanRecord> & { id: string }) => Promise<{ success: boolean; message: string }>;
  deletePerizinan: (id: string) => Promise<{ success: boolean; message: string }>;
  approvePerizinan: (id: string, status: "DISETUJUI" | "DITOLAK") => Promise<{ success: boolean; message: string }>;
  verifyGatePass: (token: string, action: "KELUAR" | "KEMBALI") => Promise<{ success: boolean; data?: PerizinanRecord; message: string }>;
  sambanganList: SambanganRecord[];
  addSambangan: (data: Omit<SambanganRecord, "id" | "createdAt" | "status">) => Promise<{ success: boolean; message: string }>;
  deleteSambangan: (id: string) => Promise<{ success: boolean; message: string }>;
  transaksiList: TransaksiKeuangan[];
  addTransaksi: (data: Omit<TransaksiKeuangan, "id" | "createdAt" | "saldoTerakhir">) => Promise<{ success: boolean; message: string }>;
  deleteTransaksi: (id: string) => Promise<{ success: boolean; message: string }>;
  tagihanSppList: TagihanSPP[];
  addTagihanSpp: (data: Omit<TagihanSPP, "id" | "createdAt" | "status">) => Promise<{ success: boolean; message: string }>;
  deleteTagihanSpp: (id: string) => Promise<{ success: boolean; message: string }>;
  payTagihanSpp: (id: string) => Promise<{ success: boolean; message: string }>;
  catatanMusyrifList: CatatanMusyrif[];
  addCatatanMusyrif: (data: Omit<CatatanMusyrif, "id" | "createdAt">) => Promise<{ success: boolean; message: string }>;
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
  const [kelasList, setKelasList] = useState<string[]>(INITIAL_CLASSES);
  const [classList, setClassList] = useState<ClassInfo[]>([]);
  const [categories, setCategories] = useState<Kategori[]>(INITIAL_CATEGORIES);
  const [guruList, setGuruList] = useState<GuruMonitoring[]>([]);
  const [penilaianList, setPenilaianList] = useState<PenilaianRecord[]>([]);
  const [absensiList, setAbsensiList] = useState<AbsensiRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackRecord[]>([]);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [feedbackInitialType, setFeedbackInitialType] = useState<FeedbackType>("SARAN");
  const [notificationList, setNotificationList] = useState<MizanNotification[]>([]);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);
  const [tahfidzList, setTahfidzList] = useState<TahfidzRecord[]>([]);
  const [kesehatanList, setKesehatanList] = useState<KesehatanRecord[]>([]);
  const [perizinanList, setPerizinanList] = useState<PerizinanRecord[]>([]);
  const [sambanganList, setSambanganList] = useState<SambanganRecord[]>([]);
  const [transaksiList, setTransaksiList] = useState<TransaksiKeuangan[]>([]);
  const [tagihanSppList, setTagihanSppList] = useState<TagihanSPP[]>([]);
  const [catatanMusyrifList, setCatatanMusyrifList] = useState<CatatanMusyrif[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mizan_read_notifs");
      if (stored) {
        setReadNotifIds(JSON.parse(stored));
      }
      const cached = localStorage.getItem("mizan_user_cache_v4");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.id && parsed.role) {
          setCurrentUser(parsed);
          setActiveRole(parsed.role);
          setIsAuthenticated(true);
          setIsAuthLoading(false);
        }
      }
      const offlineRaw = localStorage.getItem("mizan_offline_data_v1");
      if (offlineRaw) {
        const offlineData = JSON.parse(offlineRaw);
        if (offlineData.santri) setSantriList(offlineData.santri);
        if (offlineData.users) setUserList(offlineData.users);
        if (offlineData.kelasList && offlineData.kelasList.length > 0) {
          setKelasList(offlineData.kelasList);
        } else if (offlineData.classList && offlineData.classList.length > 0) {
          setKelasList(offlineData.classList.map((c: any) => (typeof c === "string" ? c : c.name)));
        } else if (offlineData.santri && offlineData.santri.length > 0) {
          setKelasList(Array.from(new Set(offlineData.santri.map((s: any) => s.class))).sort() as string[]);
        }
        if (offlineData.classList) setClassList(offlineData.classList);
        if (offlineData.guruList) setGuruList(offlineData.guruList);
        if (offlineData.categories && Array.isArray(offlineData.categories) && offlineData.categories.length > 0) {
          setCategories(offlineData.categories);
        }
        if (offlineData.penilaianList) setPenilaianList(offlineData.penilaianList);
        if (offlineData.absensiList) setAbsensiList(offlineData.absensiList);
        if (offlineData.settings) setSettings(offlineData.settings);
      }
    } catch {
      void 0;
    }
  }, []);

  const openFeedbackModal = (type: FeedbackType = "SARAN") => {
    setFeedbackInitialType(type);
    setIsFeedbackModalOpen(true);
  };

  const handleUnauthorized = () => {
    setIsAuthenticated(false);
    setCurrentUser(GUEST_USER);
    setActiveRole(null);
    try {
      localStorage.removeItem("mizan_token");
      localStorage.removeItem("mizan_user_cache_v4");
      localStorage.removeItem(STORAGE_KEY_ROLE);
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch {
      void 0;
    }
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (!path.startsWith("/login") && !path.startsWith("/share") && path !== "/") {
        window.location.href = "/login";
      }
    }
  };

  const refreshData = async () => {
    try {
      let token = "";
      if (typeof window !== "undefined") {
        try {
          token = localStorage.getItem("mizan_token") || "";
        } catch {
          void 0;
        }
      }
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch("/api/data", {
        headers,
        credentials: "include"
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setIsDbConnected(true);
        if (data.santri) setSantriList(data.santri);
        if (data.users && data.users.length > 0) {
          setUserList(data.users);
        }

        try {
          localStorage.setItem("mizan_offline_data_v1", JSON.stringify(data));
        } catch {
          void 0;
        }

        let authUser: UserProfile | null = null;
        let authRejected = false;
        try {
          const authRes = await fetch("/api/auth/me", {
            headers,
            credentials: "include"
          });
          if (authRes.ok) {
            const authData = await authRes.json();
            if (authData.authenticated && authData.user) {
              authUser = authData.user;
            } else {
              authRejected = true;
            }
          } else if (authRes.status === 401) {
            authRejected = true;
          }
        } catch {
          authRejected = false;
        }

        if (authUser) {
          setCurrentUser(authUser);
          setActiveRole(authUser.role);
          setIsAuthenticated(true);
          try {
            localStorage.setItem("mizan_user_cache_v4", JSON.stringify(authUser));
          } catch {
            void 0;
          }
        } else if (authRejected) {
          setCurrentUser(GUEST_USER);
          setActiveRole(null);
          setIsAuthenticated(false);
          try {
            localStorage.removeItem("mizan_user_cache_v4");
          } catch {
            void 0;
          }
        }
        const rawClasses = data.classList || data.classes || [];
        if (Array.isArray(rawClasses) && rawClasses.length > 0) {
          setClassList(rawClasses);
          const derivedNames = rawClasses.map((c: any) => (typeof c === "string" ? c : c.name));
          setKelasList(derivedNames);
        } else if (data.kelasList && data.kelasList.length > 0) {
          setKelasList(data.kelasList);
        } else if (data.santri && Array.isArray(data.santri) && data.santri.length > 0) {
          const derivedClasses = Array.from(new Set(data.santri.map((s: any) => s.class))).sort();
          setKelasList(derivedClasses as string[]);
        }
        if (data.guruList) setGuruList(data.guruList);
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
        if (data.penilaianList) setPenilaianList(data.penilaianList);
        if (data.absensiList) setAbsensiList(data.absensiList);
        if (data.settings) setSettings(data.settings);
        if (authUser) {
          try {
            const fbRes = await fetch("/api/feedback", { headers, credentials: "include" });
            if (fbRes.ok) {
              const fbData = await fbRes.json();
              if (fbData.success && Array.isArray(fbData.data)) {
                setFeedbackList(fbData.data);
              }
            }
          } catch {
            void 0;
          }
          try {
            const notifRes = await fetch("/api/notifications?all=1", { headers, credentials: "include" });
            if (notifRes.ok) {
              const notifData = await notifRes.json();
              if (notifData.success && Array.isArray(notifData.data)) {
                setNotificationList(notifData.data);
              }
            }
          } catch {
            void 0;
          }
          try {
            const catRes = await fetch("/api/categories", { headers, credentials: "include" });
            if (catRes.ok) {
              const catData = await catRes.json();
              if (catData.success && Array.isArray(catData.categories) && catData.categories.length > 0) {
                setCategories(catData.categories);
              }
            }
          } catch {
            void 0;
          }
          try {
            const [tRes, kRes, pRes, sRes, qRes, spRes, cRes] = await Promise.allSettled([
              fetch("/api/monitoring/tahfidz", { headers, credentials: "include" }),
              fetch("/api/monitoring/kesehatan", { headers, credentials: "include" }),
              fetch("/api/monitoring/perizinan", { headers, credentials: "include" }),
              fetch("/api/monitoring/sambangan", { headers, credentials: "include" }),
              fetch("/api/monitoring/keuangan", { headers, credentials: "include" }),
              fetch("/api/monitoring/spp", { headers, credentials: "include" }),
              fetch("/api/monitoring/catatan-musyrif", { headers, credentials: "include" })
            ]);
            if (tRes.status === "fulfilled" && tRes.value.ok) {
              const td = await tRes.value.json();
              if (td.success && Array.isArray(td.tahfidz)) setTahfidzList(td.tahfidz);
            }
            if (kRes.status === "fulfilled" && kRes.value.ok) {
              const kd = await kRes.value.json();
              if (kd.success && Array.isArray(kd.kesehatan)) setKesehatanList(kd.kesehatan);
            }
            if (pRes.status === "fulfilled" && pRes.value.ok) {
              const pd = await pRes.value.json();
              if (pd.success && Array.isArray(pd.perizinan)) setPerizinanList(pd.perizinan);
            }
            if (sRes.status === "fulfilled" && sRes.value.ok) {
              const sd = await sRes.value.json();
              if (sd.success && Array.isArray(sd.sambangan)) setSambanganList(sd.sambangan);
            }
            if (qRes.status === "fulfilled" && qRes.value.ok) {
              const qd = await qRes.value.json();
              if (qd.success && Array.isArray(qd.transaksi)) setTransaksiList(qd.transaksi);
            }
            if (spRes.status === "fulfilled" && spRes.value.ok) {
              const spd = await spRes.value.json();
              if (spd.success && Array.isArray(spd.tagihan)) setTagihanSppList(spd.tagihan);
            }
            if (cRes.status === "fulfilled" && cRes.value.ok) {
              const cd = await cRes.value.json();
              if (cd.success && Array.isArray(cd.catatanMusyrif)) setCatatanMusyrifList(cd.catatanMusyrif);
            }
          } catch {
            void 0;
          }
        }
      }
    } catch {
      setIsDbConnected(false);
      try {
        const offlineRaw = localStorage.getItem("mizan_offline_data_v1");
        if (offlineRaw) {
          const offlineData = JSON.parse(offlineRaw);
          if (offlineData.santri) setSantriList(offlineData.santri);
          if (offlineData.users) setUserList(offlineData.users);
          if (offlineData.kelasList && offlineData.kelasList.length > 0) {
          setKelasList(offlineData.kelasList);
        } else if (offlineData.classList && offlineData.classList.length > 0) {
          setKelasList(offlineData.classList.map((c: any) => (typeof c === "string" ? c : c.name)));
        } else if (offlineData.santri && offlineData.santri.length > 0) {
          setKelasList(Array.from(new Set(offlineData.santri.map((s: any) => s.class))).sort() as string[]);
        }
          if (offlineData.classList) setClassList(offlineData.classList);
          if (offlineData.guruList) setGuruList(offlineData.guruList);
          if (offlineData.categories && Array.isArray(offlineData.categories) && offlineData.categories.length > 0) {
            setCategories(offlineData.categories);
          }
          if (offlineData.penilaianList) setPenilaianList(offlineData.penilaianList);
          if (offlineData.absensiList) setAbsensiList(offlineData.absensiList);
          if (offlineData.settings) setSettings(offlineData.settings);
        }
      } catch {
        void 0;
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const timer = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          if (path.startsWith("/login") || path.startsWith("/share")) {
            return;
          }
        }
        refreshData();
      }
    }, 6000);
    const handleVisibility = () => {
      if (!document.hidden) {
        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          if (path.startsWith("/login") || path.startsWith("/share")) {
            return;
          }
        }
        refreshData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const accessibleSantriList = useMemo(() => {
    if (activeRole === "SUPER_ADMIN" || currentUser?.role === "SUPER_ADMIN") return santriList;
    if (currentUser?.gender === "Putra") {
      return santriList.filter((s) => s.gender === "Putra");
    }
    if (currentUser?.gender === "Putri") {
      return santriList.filter((s) => s.gender === "Putri");
    }
    if (!isAuthenticated || !currentUser?.id) return [];
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

  const loginUser = (user: UserProfile, token?: string) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    setIsAuthenticated(true);
    setIsAuthLoading(false);
    try {
      if (token) {
        localStorage.setItem("mizan_token", token);
      }
      localStorage.setItem(STORAGE_KEY_ROLE, user.role);
      localStorage.setItem(STORAGE_KEY_USER, user.id);
      localStorage.setItem("mizan_user_cache_v4", JSON.stringify(user));
      document.cookie = `mizan_auth=${user.role}; path=/; max-age=86400; SameSite=Lax`;
    } catch {
      void 0;
    }
    showToast(`Selamat datang, ${user.name}`, "success");
  };

  const logoutUser = () => {
    try {
      localStorage.removeItem("mizan_token");
    } catch {
      void 0;
    }
    setCurrentUser(GUEST_USER);
    setActiveRole(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEY_ROLE);
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem("mizan_user_cache_v4");
      sessionStorage.removeItem("mizan_entered_app");
      document.cookie = "mizan_session=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "mizan_auth=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "mizan_uid=; path=/; max-age=0; SameSite=Lax";
    } catch {
      void 0;
    }
    showToast("Anda telah keluar dari aplikasi.", "info");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
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
        const disc = getSantriDisciplineStatus(newScore, settings);
        return {
          ...s,
          currentScore: newScore,
          status: disc.status
        };
      })
    );
  };

  const submitSanggahan = async (penilaianId: string, reason: string) => {
    try {
      const res = await fetch("/api/penilaian", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: penilaianId, action: "sanggah", reason })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Sanggahan berhasil diajukan", "success");
        await refreshData();
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal mengajukan sanggahan", "error");
      return { success: false, message: data.message };
    } catch {
      showToast("Terjadi kendala jaringan", "error");
      return { success: false, message: "Kendala jaringan" };
    }
  };

  const resolveSanggahan = async (penilaianId: string, decision: "TERIMA" | "TOLAK", staffName?: string, notes?: string) => {
    try {
      const res = await fetch("/api/penilaian", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: penilaianId, action: "resolve_sanggahan", decision, staffName: staffName || currentUser.name, notes })
      });
      const data = await res.json();
      if (data.success) {
        showToast(decision === "TERIMA" ? "Sanggahan diterima, poin dipulihkan" : "Sanggahan ditolak, sanksi disahkan", "success");
        await refreshData();
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal memproses sanggahan", "error");
      return { success: false, message: data.message };
    } catch {
      showToast("Terjadi kendala jaringan", "error");
      return { success: false, message: "Kendala jaringan" };
    }
  };

  const addPenilaian = (record: Omit<PenilaianRecord, "id" | "createdAt" | "dateKey"> & { createdAt?: string; dateKey?: string }) => {
    const id = "pen-" + Date.now();
    const now = new Date();
    const isoString = record.createdAt || now.toISOString();
    const dateObj = new Date(isoString);
    const validDate = isNaN(dateObj.getTime()) ? now : dateObj;
    const formattedDisplay = formatWIBDateTime(validDate, true);
    const dateKey = record.dateKey || getWIBDate(validDate);

    const newRecord: PenilaianRecord = {
      ...record,
      id,
      createdAt: formattedDisplay,
      dateKey,
      date: formatWIBDate(validDate, "long"),
      rawCreatedAt: isoString
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
      body: JSON.stringify({
        ...record,
        createdAt: isoString,
        dateKey
      })
    })
      .then(() => refreshData())
      .catch(() => void 0);

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

  const deletePenilaianBulk = async (ids: string[]): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/penilaian?ids=${ids.join(",")}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(data.message, "info");
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal menghapus penilaian", "error");
      return { success: false, message: data.message };
    } catch (err: any) {
      showToast(err.message, "error");
      return { success: false, message: err.message };
    }
  };

  const batchAddAbsensi = (records: Omit<AbsensiRecord, "id" | "createdAt">[]) => {
    const timestamp = getWIBTime();
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

  const deleteAbsensiBulk = async (ids: string[]): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/absensi?ids=${ids.join(",")}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast(data.message || "Data absensi dihapus", "info");
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

  const deleteSantriBulk = async (ids: string[]): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/santri?ids=${ids.join(",")}`, { method: "DELETE" });
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

  const updateClass = async (name: string, data: { newName?: string; gender?: "Putra" | "Putri"; waliKelas?: string; guruId?: string }): Promise<{ success: boolean; message: string }> => {
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

  const removeClassBulk = async (classNames: string[]): Promise<{ success: boolean; message: string }> => {
    setKelasList((prev) => prev.filter((c) => !classNames.includes(c)));
    setClassList((prev) => prev.filter((c) => !classNames.includes(c.name)));

    try {
      const res = await fetch("/api/classes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: classNames })
      });
      const data = await res.json();
      await refreshData();
      showToast(data.message || `${classNames.length} kelas dihapus`, "info");
      return { success: true, message: data.message || "Berhasil dihapus" };
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus kelas", "error");
      return { success: false, message: err.message || "Gagal" };
    }
  };

  const setGuruStatus = (guruId: string, status: StatusGuru) => {
    setGuruList((prev) => prev.map((g) => (g.id === guruId ? { ...g, status } : g)));
    fetch("/api/data", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: guruId, status })
    }).catch(() => void 0);
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

  const addFeedback = async (data: Omit<FeedbackRecord, "id" | "createdAt" | "status">): Promise<{ success: boolean; data?: FeedbackRecord; message: string }> => {
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setFeedbackList((prev) => [resData.data, ...prev]);
        showToast("Terkirim", "success");
        return { success: true, data: resData.data, message: "Terkirim" };
      }
    } catch {
      void 0;
    }
    const newFb: FeedbackRecord = {
      ...data,
      id: "fb-" + Date.now().toString(36),
      status: "Baru",
      createdAt: formatWIBDateTime(new Date())
    };
    setFeedbackList((prev) => [newFb, ...prev]);
    showToast("Terkirim", "success");
    return { success: true, data: newFb, message: "Terkirim" };
  };

  const updateFeedbackStatus = async (id: string, status: FeedbackStatus, adminNotes?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, adminNotes })
      });
      const resData = await res.json();
      if (resData.success) {
        setFeedbackList((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status, adminNotes, updatedAt: formatWIBDateTime(new Date()) } : f))
        );
        showToast("Diperbarui", "success");
        return { success: true, message: "Diperbarui" };
      }
    } catch {
      void 0;
    }
    setFeedbackList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status, adminNotes, updatedAt: formatWIBDateTime(new Date()) } : f))
    );
    showToast("Diperbarui", "success");
    return { success: true, message: "Diperbarui" };
  };

  const deleteFeedback = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/feedback?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      const resData = await res.json();
      if (resData.success) {
        setFeedbackList((prev) => prev.filter((f) => f.id !== id));
        showToast("Dihapus", "success");
        return { success: true, message: "Dihapus" };
      }
    } catch {
      void 0;
    }
    setFeedbackList((prev) => prev.filter((f) => f.id !== id));
    showToast("Dihapus", "success");
    return { success: true, message: "Dihapus" };
  };

  const deleteUserBulk = async (ids: string[]): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/users?ids=${ids.join(",")}`, { method: "DELETE" });
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

  const markNotificationAsRead = (id: string) => {
    setReadNotifIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem("mizan_read_notifs", JSON.stringify(next));
      } catch {
        void 0;
      }
      return next;
    });
  };

  const markAllNotificationsAsRead = () => {
    const allIds = notificationList.map((n) => n.id);
    setReadNotifIds(allIds);
    try {
      localStorage.setItem("mizan_read_notifs", JSON.stringify(allIds));
    } catch {
      void 0;
    }
  };

  const addNotification = async (item: Omit<MizanNotification, "id" | "createdAt">): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
      const data = await res.json();
      if (data.success) {
        if (data.data) {
          setNotificationList((prev) => [data.data, ...prev.filter((n) => n.id !== data.data.id)]);
        } else {
          await refreshData();
        }
        showToast(data.message || "Notifikasi berhasil ditambahkan", "success");
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal menambah notifikasi", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
    }
  };

  const updateNotification = async (id: string, updates: Partial<MizanNotification>): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates })
      });
      const data = await res.json();
      if (data.success) {
        setNotificationList((prev) =>
          prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
        );
        showToast(data.message || "Notifikasi berhasil diperbarui", "success");
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal memperbarui notifikasi", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
    }
  };

  const deleteNotification = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setNotificationList((prev) => prev.filter((n) => n.id !== id));
        showToast(data.message || "Notifikasi dihapus", "success");
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal menghapus notifikasi", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
    }
  };

  const toggleNotificationActive = async (id: string, currentActive: boolean): Promise<{ success: boolean; message: string }> => {
    const nextActive = !currentActive;
    return updateNotification(id, { isActive: nextActive });
  };

  const addTahfidz = async (payload: Omit<TahfidzRecord, "id" | "createdAt">): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/monitoring/tahfidz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Setoran tahfidz berhasil disimpan", "success");
        await refreshData();
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal mencatat tahfidz", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
    }
  };

  const deleteTahfidz = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/monitoring/tahfidz?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTahfidzList((prev) => prev.filter((t) => t.id !== id));
        showToast("Catatan tahfidz dihapus", "success");
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (e: any) {
      return { success: false, message: e?.message };
    }
  };

  const deleteTahfidzBulk = async (ids: string[]): Promise<{ success: boolean; message: string }> => {
    setTahfidzList((prev) => prev.filter((t) => !ids.includes(t.id)));
    try {
      const res = await fetch(`/api/monitoring/tahfidz?ids=${encodeURIComponent(ids.join(","))}`, { method: "DELETE" });
      const data = await res.json();
      showToast(data.message || `${ids.length} catatan tahfidz dihapus`, "info");
      return { success: true, message: data.message || "Dihapus" };
    } catch (e: any) {
      showToast(e?.message || "Gagal menghapus", "error");
      return { success: false, message: e?.message };
    }
  };

  const addKesehatan = async (payload: Omit<KesehatanRecord, "id" | "createdAt">): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/monitoring/kesehatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Rekam poskestren berhasil disimpan", "success");
        await refreshData();
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal mencatat poskestren", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
    }
  };

  const deleteKesehatan = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/monitoring/kesehatan?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setKesehatanList((prev) => prev.filter((k) => k.id !== id));
        showToast("Catatan poskestren dihapus", "success");
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (e: any) {
      return { success: false, message: e?.message };
    }
  };

  const addPerizinan = async (payload: Omit<PerizinanRecord, "id" | "createdAt" | "qrCodeToken" | "status">): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/monitoring/perizinan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Izin berhasil diajukan", "success");
        await refreshData();
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal mengajukan izin", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
    }
  };

  const updatePerizinan = async (payload: Partial<PerizinanRecord> & { id: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/monitoring/perizinan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Perizinan berhasil diperbarui", "success");
        await refreshData();
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal memperbarui perizinan", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
    }
  };

  const deletePerizinan = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/monitoring/perizinan?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Perizinan berhasil dihapus", "success");
        await refreshData();
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal menghapus perizinan", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
    }
  };

  const approvePerizinan = async (id: string, status: "DISETUJUI" | "DITOLAK"): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/monitoring/perizinan/approve", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Status izin diperbarui", "success");
        await refreshData();
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal memproses izin", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
    }
  };

  const verifyGatePass = async (token: string, action: "KELUAR" | "KEMBALI"): Promise<{ success: boolean; data?: PerizinanRecord; message: string }> => {
    try {
      const res = await fetch("/api/monitoring/perizinan/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Verifikasi gerbang berhasil", "success");
        await refreshData();
        return { success: true, data: data.data, message: data.message };
      }
      showToast(data.message || "Verifikasi gerbang gagal", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
    }
  };

  const addSambangan = async (payload: Omit<SambanganRecord, "id" | "createdAt" | "status">): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/monitoring/sambangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Reservasi sambang berhasil", "success");
        await refreshData();
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal menjadwalkan sambang", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
    }
  };

  const deleteSambangan = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/monitoring/sambangan?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Jadwal sambang berhasil dihapus", "success");
        await refreshData();
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal menghapus sambangan", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
    }
  };

  const addTransaksi = async (payload: Omit<TransaksiKeuangan, "id" | "createdAt" | "saldoTerakhir">): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/monitoring/keuangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Transaksi uang saku dicatat", "success");
        await refreshData();
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal mencatat transaksi", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
    }
  };

  const deleteTransaksi = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/monitoring/keuangan?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Transaksi berhasil dihapus", "success");
        await refreshData();
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal menghapus transaksi", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
    }
  };

  const addTagihanSpp = async (payload: Omit<TagihanSPP, "id" | "createdAt" | "status">): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/monitoring/spp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Tagihan SPP berhasil dibuat", "success");
        await refreshData();
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal membuat tagihan SPP", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
    }
  };

  const deleteTagihanSpp = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/monitoring/spp?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Tagihan SPP berhasil dihapus", "success");
        await refreshData();
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal menghapus tagihan SPP", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
    }
  };

  const payTagihanSpp = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/monitoring/spp/pay", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "SPP disahkan lunas", "success");
        await refreshData();
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal memproses pembayaran SPP", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
    }
  };

  const addCatatanMusyrif = async (payload: Omit<CatatanMusyrif, "id" | "createdAt">): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/monitoring/catatan-musyrif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Catatan musyrif disimpan", "success");
        await refreshData();
        return { success: true, message: data.message };
      }
      showToast(data.message || "Gagal menyimpan ulasan musyrif", "error");
      return { success: false, message: data.message };
    } catch (e: any) {
      showToast(e?.message || "Kesalahan jaringan", "error");
      return { success: false, message: e?.message };
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
        deleteSantriBulk,
        categories,
        guruList,
        setGuruStatus,
        penilaianList,
        addPenilaian,
        deletePenilaian,
        deletePenilaianBulk,
        submitSanggahan,
        resolveSanggahan,
        absensiList,
        batchAddAbsensi,
        updateAbsensi,
        deleteAbsensi,
        deleteAbsensiBulk,
        kelasList,
        classList,
        addClass,
        updateClass,
        removeClass,
        removeClassBulk,
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
        deleteUserBulk,
        refreshData,
        isDbConnected,
        isMobileNavOpen,
        setIsMobileNavOpen,
        feedbackList,
        addFeedback,
        updateFeedbackStatus,
        deleteFeedback,
        isFeedbackModalOpen,
        setIsFeedbackModalOpen,
        feedbackInitialType,
        openFeedbackModal,
        notificationList,
        readNotifIds,
        addNotification,
        updateNotification,
        deleteNotification,
        toggleNotificationActive,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        tahfidzList,
        addTahfidz,
        deleteTahfidz,
        deleteTahfidzBulk,
        kesehatanList,
        addKesehatan,
        deleteKesehatan,
        perizinanList,
        addPerizinan,
        updatePerizinan,
        deletePerizinan,
        approvePerizinan,
        verifyGatePass,
        sambanganList,
        addSambangan,
        deleteSambangan,
        transaksiList,
        addTransaksi,
        deleteTransaksi,
        tagihanSppList,
        addTagihanSpp,
        deleteTagihanSpp,
        payTagihanSpp,
        catatanMusyrifList,
        addCatatanMusyrif
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
