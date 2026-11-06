"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Activity,
  Wifi,
  WifiOff,
  Copy,
  Check,
  Download,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Terminal,
  Clock,
  User,
  ShieldAlert,
  X
} from "lucide-react";
import { RoleShell } from "@/components/RoleShell";
import { Portal } from "@/components/ui/Portal";
import { useMizan } from "@/lib/mizan-context";

interface LogActor {
  id?: string;
  name?: string;
  role?: string;
  ip?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG" | "CRITICAL";
  category: string;
  action: string;
  actor: LogActor;
  message: string;
  details?: Record<string, unknown>;
}

interface LogStats {
  total: number;
  errors: number;
  warnings: number;
  info: number;
  oldest: string;
  newest: string;
  file_size_bytes: number;
  retention: string;
  storage: string;
  file_path: string;
}

export default function AdminLogsPage() {
  const { showToast } = useMizan();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [detailModalLog, setDetailModalLog] = useState<LogEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLogs = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch("/api/logs?limit=300");
      if (!res.ok) throw new Error("Gagal memuat log");
      const json = await res.json();
      if (json?.data?.logs) {
        setLogs(json.data.logs);
      }
      if (json?.data?.stats) {
        setStats(json.data.stats);
      }
    } catch {
      showToast("Gagal mengambil log dari server", "error");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [showToast]);

  const connectWebSocket = useCallback(() => {
    if (typeof window === "undefined") return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.channel === "system_log") {
            if (payload.action === "new_log" && payload.data) {
              setLogs((prev) => {
                if (!isLive) return prev;
                const exists = prev.some((l) => l.id === payload.data.id);
                if (exists) return prev;
                return [payload.data, ...prev.slice(0, 499)];
              });
              setStats((prev) => {
                if (!prev) return prev;
                const isErr = payload.data.level === "ERROR" || payload.data.level === "CRITICAL";
                const isWarn = payload.data.level === "WARN" || payload.data.level === "WARNING";
                const isInfo = payload.data.level === "INFO";
                return {
                  ...prev,
                  total: prev.total + 1,
                  errors: isErr ? prev.errors + 1 : prev.errors,
                  warnings: isWarn ? prev.warnings + 1 : prev.warnings,
                  info: isInfo ? prev.info + 1 : prev.info,
                  newest: payload.data.timestamp
                };
              });
            } else if (payload.action === "logs_cleared") {
              setLogs([]);
              setStats((prev) => (prev ? { ...prev, total: 0, errors: 0, warnings: 0, info: 0 } : null));
            }
          }
        } catch {
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        wsRef.current = null;
        if (isLive) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 4000);
        }
      };

      ws.onerror = () => {
        setWsConnected(false);
      };
    } catch {
      setWsConnected(false);
    }
  }, [isLive]);

  useEffect(() => {
    fetchLogs(true);
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [fetchLogs, connectWebSocket]);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      if (!wsConnected) {
        fetchLogs(false);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [isLive, wsConnected, fetchLogs]);

  const handleClearLogs = async () => {
    setIsClearing(true);
    try {
      const res = await fetch("/api/logs", { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus log");
      setLogs([]);
      setStats((prev) => (prev ? { ...prev, total: 0, errors: 0, warnings: 0, info: 0 } : null));
      setShowClearConfirm(false);
      showToast("Log 24 jam berhasil dibersihkan", "success");
    } catch {
      showToast("Gagal membersihkan log", "error");
    } finally {
      setIsClearing(false);
    }
  };

  const copyForAI = (entry?: LogEntry) => {
    const dataToCopy = entry ? entry : logs.slice(0, 30);
    const text = JSON.stringify(dataToCopy, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedId(entry ? entry.id : "all");
    setTimeout(() => setCopiedId(null), 2500);
    showToast("JSON disalin ke clipboard", "success");
  };

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mizan_system_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("File log berhasil diunduh", "success");
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.category) set.add(l.category);
    });
    return Array.from(set);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedLevel !== "ALL" && log.level !== selectedLevel) return false;
      if (selectedCategory !== "ALL" && log.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const msg = (log.message || "").toLowerCase();
        const action = (log.action || "").toLowerCase();
        const actorName = (log.actor?.name || "").toLowerCase();
        const actorRole = (log.actor?.role || "").toLowerCase();
        const actorIp = (log.actor?.ip || "").toLowerCase();
        return (
          msg.includes(q) ||
          action.includes(q) ||
          actorName.includes(q) ||
          actorRole.includes(q) ||
          actorIp.includes(q)
        );
      }
      return true;
    });
  }, [logs, selectedLevel, selectedCategory, searchQuery]);

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });
    } catch {
      return ts;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case "ERROR":
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" />
            ERROR
          </span>
        );
      case "WARN":
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            WARN
          </span>
        );
      case "DEBUG":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Terminal className="w-3 h-3" />
            DEBUG
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            INFO
          </span>
        );
    }
  };

  return (
    <RoleShell>
      <div className="space-y-4 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#E2EBF4] shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">Log Real-Time</h1>
              {wsConnected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <Wifi className="w-3 h-3" />
                  Live
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  <WifiOff className="w-3 h-3" />
                  Polling
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Penyimpanan: File JSON • Siklus Reset: 24 Jam Otomatis
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsLive(!isLive)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isLive
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs"
                  : "bg-slate-100 text-slate-700 border-slate-300"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isLive ? "Stream Aktif" : "Stream Dijeda"}</span>
            </button>

            <button
              type="button"
              onClick={() => fetchLogs(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-[#172033] border border-[#CBD5E1] hover:bg-slate-50 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => copyForAI()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1B4D3E] text-white hover:bg-[#143B30] transition-all cursor-pointer shadow-xs"
            >
              {copiedId === "all" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Salin AI</span>
            </button>

            <button
              type="button"
              onClick={downloadJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-[#172033] border border-[#CBD5E1] hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh</span>
            </button>

            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E2EBF4] shadow-xs">
            <span className="text-[11px] font-bold text-[#64748B]">Total 24 Jam</span>
            <p className="text-xl sm:text-2xl font-bold text-[#172033] mt-1">{stats?.total ?? logs.length}</p>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECDD3] shadow-xs">
            <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Error</span>
            </span>
            <p className="text-xl sm:text-2xl font-bold text-rose-700 mt-1">
              {stats?.errors ?? logs.filter((l) => l.level === "ERROR" || l.level === "CRITICAL").length}
            </p>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] shadow-xs">
            <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Warning</span>
            </span>
            <p className="text-xl sm:text-2xl font-bold text-amber-700 mt-1">
              {stats?.warnings ?? logs.filter((l) => l.level === "WARN").length}
            </p>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] shadow-xs">
            <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Info</span>
            </span>
            <p className="text-xl sm:text-2xl font-bold text-emerald-800 mt-1">
              {stats?.info ?? logs.filter((l) => l.level === "INFO").length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2EBF4] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari aktivitas, URL, aktor, IP..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#CBD5E1] bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-[#F5F1E8] p-1 rounded-xl text-xs font-semibold">
                {["ALL", "ERROR", "WARN", "INFO"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedLevel === lvl
                        ? "bg-white text-[#172033] shadow-xs font-bold"
                        : "text-[#64748B] hover:text-[#172033]"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {categories.length > 0 && (
                <div className="flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-[#64748B]" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-xs py-1 px-2 rounded-xl border border-[#CBD5E1] bg-white text-[#172033] focus:outline-none"
                  >
                    <option value="ALL">Kategori: Semua</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="divide-y divide-[#F1F5F9] border border-[#F1F5F9] rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-[#64748B]">Memuat log sistem...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B]">
                Tidak ada aktivitas yang sesuai dengan filter.
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div
                    key={log.id}
                    className={`p-3 transition-colors text-xs ${
                      log.level === "ERROR" || log.level === "CRITICAL"
                        ? "bg-rose-50/40 hover:bg-rose-50/70"
                        : log.level === "WARN"
                        ? "bg-amber-50/30 hover:bg-amber-50/60"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <span className="text-[11px] font-mono text-[#64748B] whitespace-nowrap mt-0.5">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <div className="flex-shrink-0 mt-0.5">{getLevelBadge(log.level)}</div>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0">
                          {log.category || "SYSTEM"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[#172033] truncate">{log.message}</p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#64748B] flex-wrap">
                            <span className="font-mono text-[#1B4D3E] font-semibold">{log.action}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-[#94A3B8]" />
                              <span>{log.actor?.name || "System"}</span>
                              {log.actor?.role && (
                                <span className="px-1 rounded text-[9px] bg-slate-100 font-semibold">
                                  {log.actor.role}
                                </span>
                              )}
                            </span>
                            {log.actor?.ip && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-[10px] text-slate-500">{log.actor.ip}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => copyForAI(log)}
                          title="Salin JSON untuk AI"
                          className="p-1 rounded-md text-slate-500 hover:text-[#172033] hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailModalLog(log)}
                          title="Lihat Detail JSON"
                          className="p-1 rounded-md text-slate-500 hover:text-[#172033] hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="p-1 rounded-md text-slate-500 hover:text-[#172033] hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && log.details && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 font-mono text-[11px] bg-slate-900 text-slate-100 p-3 rounded-xl overflow-x-auto">
                        <pre>{JSON.stringify(log.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {detailModalLog && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white w-full max-w-2xl rounded-3xl p-5 shadow-xl border border-[#E2EBF4] space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#1B4D3E]" />
                  <h3 className="text-sm font-bold text-[#172033]">Detail Log JSON</h3>
                  {getLevelBadge(detailModalLog.level)}
                </div>
                <button
                  type="button"
                  onClick={() => setDetailModalLog(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-[#172033] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-500">Pesan:</span>
                  <p className="font-bold text-[#172033] mt-0.5">{detailModalLog.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="font-semibold text-slate-500">Waktu:</span>
                    <p className="font-mono text-slate-800">{detailModalLog.timestamp}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Aksi:</span>
                    <p className="font-mono text-[#1B4D3E] font-semibold">{detailModalLog.action}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Aktor:</span>
                    <p className="text-slate-800">
                      {detailModalLog.actor?.name || "System"} ({detailModalLog.actor?.role || "PUBLIC"})
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">IP:</span>
                    <p className="font-mono text-slate-800">{detailModalLog.actor?.ip || "-"}</p>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-500">Payload & Metadata:</span>
                  <div className="mt-1 p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60">
                    <pre>{JSON.stringify(detailModalLog, null, 2)}</pre>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => copyForAI(detailModalLog)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1B4D3E] text-white hover:bg-[#143B30] cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin untuk AI Agent</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailModalLog(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {showClearConfirm && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-xl border border-[#E2EBF4] space-y-4">
              <div className="flex items-center gap-2 text-rose-700">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold">Reset Log 24 Jam</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin mengosongkan seluruh riwayat log saat ini? File log JSON di server akan dikosongkan.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleClearLogs}
                  disabled={isClearing}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isClearing ? "Membersihkan..." : "Ya, Kosongkan"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </RoleShell>
  );
}
