"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Terminal,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  Download,
  Copy,
  Check,
  Search,
  Wifi,
  WifiOff,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  AlignLeft
} from "lucide-react";
import { RoleShell } from "@/components/RoleShell";
import { useMizan } from "@/lib/mizan-context";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "WARNING" | "ERROR" | "DEBUG" | "CRITICAL" | string;
  category: string;
  action: string;
  actor: { id?: string; name?: string; role?: string; ip?: string };
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
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [wrapLines, setWrapLines] = useState(true);
  const [terminalTheme, setTerminalTheme] = useState<"dark" | "light">("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const terminalScrollRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem("mizan_log_theme");
      if (savedTheme === "light" || savedTheme === "dark") setTerminalTheme(savedTheme);
      const savedWrap = localStorage.getItem("mizan_log_wrap");
      if (savedWrap !== null) setWrapLines(savedWrap === "true");
    } catch {
      void 0;
    }
  }, []);

  const toggleTheme = () => {
    const next = terminalTheme === "dark" ? "light" : "dark";
    setTerminalTheme(next);
    try { localStorage.setItem("mizan_log_theme", next); } catch { void 0; }
  };

  const toggleWrap = () => {
    const next = !wrapLines;
    setWrapLines(next);
    try { localStorage.setItem("mizan_log_wrap", String(next)); } catch { void 0; }
  };

  const fetchLogs = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch("/api/logs?limit=300");
      if (!res.ok) throw new Error("Gagal mengambil log");
      const json = await res.json();
      if (json?.data?.logs) setLogs(json.data.logs);
      if (json?.data?.stats) setStats(json.data.stats);
    } catch {
      showToast("Gagal mengambil log dari server", "error");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [showToast]);

  const connectWebSocket = useCallback(() => {
    if (typeof window === "undefined" || (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)) return;
    try {
      const token = localStorage.getItem("mizan_token") || "";
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${proto}//${window.location.host}/ws${token ? `?token=${encodeURIComponent(token)}` : ""}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setWsConnected(true);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.channel === "system_log") {
            if (payload.action === "new_log" && payload.data) {
              setLogs((prev) => prev.some((i) => i.id === payload.data.id) ? prev : [payload.data, ...prev.slice(0, 499)]);
              setStats((prev) => {
                if (!prev) return prev;
                const isErr = payload.data.level === "ERROR" || payload.data.level === "CRITICAL";
                const isWarn = payload.data.level === "WARN" || payload.data.level === "WARNING";
                return {
                  ...prev,
                  total: prev.total + 1,
                  errors: isErr ? prev.errors + 1 : prev.errors,
                  warnings: isWarn ? prev.warnings + 1 : prev.warnings,
                  info: payload.data.level === "INFO" ? prev.info + 1 : prev.info,
                  newest: payload.data.timestamp
                };
              });
            } else if (payload.action === "logs_cleared") {
              setLogs([]);
              setStats((prev) => (prev ? { ...prev, total: 0, errors: 0, warnings: 0, info: 0 } : null));
            }
          }
        } catch {
          void 0;
        }
      };
      ws.onclose = () => {
        setWsConnected(false);
        wsRef.current = null;
        if (isLive) reconnectTimerRef.current = setTimeout(() => connectWebSocket(), 15000);
      };
      ws.onerror = () => setWsConnected(false);
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
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [fetchLogs, connectWebSocket]);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      if (!wsConnected) fetchLogs(false);
    }, 6000);
    return () => clearInterval(interval);
  }, [isLive, wsConnected, fetchLogs]);

  useEffect(() => {
    if (autoScroll && terminalScrollRef.current) terminalScrollRef.current.scrollTop = 0;
  }, [logs, autoScroll]);

  const handleClearLogs = async () => {
    if (!window.confirm("Bersihkan seluruh log sistem 24 jam terakhir?")) return;
    try {
      const res = await fetch("/api/logs", { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus log");
      setLogs([]);
      setStats((prev) => (prev ? { ...prev, total: 0, errors: 0, warnings: 0, info: 0 } : null));
      showToast("Log sistem berhasil dibersihkan", "success");
    } catch {
      showToast("Gagal membersihkan log", "error");
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast("Disalin ke clipboard", "success");
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `mizan_logs_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
    showToast("Mengunduh log sistem", "info");
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedLevel !== "ALL" && log.level !== selectedLevel) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (log.message || "").toLowerCase().includes(q) ||
          (log.action || "").toLowerCase().includes(q) ||
          (log.category || "").toLowerCase().includes(q) ||
          (log.actor?.name || "").toLowerCase().includes(q) ||
          (log.actor?.ip || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, selectedLevel, searchQuery]);

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });
    } catch {
      return ts.slice(11, 19) || ts;
    }
  };

  const isDark = terminalTheme === "dark";

  if (!mounted) {
    return (
      <RoleShell>
        <div className="w-full h-96 flex items-center justify-center font-mono text-xs text-slate-500 gap-2">
          <Terminal className="w-4 h-4 animate-pulse" />
          <span>Memuat Terminal Log Mizan...</span>
        </div>
      </RoleShell>
    );
  }

  return (
    <RoleShell>
      <div className="w-full space-y-3 pb-28">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-xs ${isDark ? "bg-slate-900 border-slate-700 text-emerald-400" : "bg-[#1B4D3E] border-[#143B2F] text-[#FAF7EE]"}`}>
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Terminal Log Sistem</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${isDark ? "bg-slate-800 text-emerald-300 border-slate-700" : "bg-[#FAF7EE] text-[#1B4D3E] border-[#C5A059]/40"}`}>
                  v2.0 Go Core
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 font-mono">Realtime audit & event monitoring pondok</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={toggleTheme}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs ${isDark ? "bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}`}
              title={isDark ? "Ganti ke Tema Terang" : "Ganti ke Tema Gelap"}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
              <span>{isDark ? "Terang" : "Gelap"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLive(!isLive)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs ${isLive ? (isDark ? "bg-emerald-950/70 text-emerald-300 border-emerald-800" : "bg-emerald-50 text-emerald-800 border-emerald-300") : (isDark ? "bg-slate-900 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-600 border-slate-300")}`}
            >
              {isLive ? <Play className="w-3 h-3 text-emerald-500" /> : <Pause className="w-3 h-3 text-amber-500" />}
              <span>{isLive ? "LIVE STREAM" : "PAUSED"}</span>
            </button>

            <button type="button" onClick={() => fetchLogs(true)} disabled={isLoading} className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 cursor-pointer shadow-2xs ${isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"}`} title="Refresh Log">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-500" : ""}`} />
            </button>
            <button type="button" onClick={handleDownload} className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 cursor-pointer shadow-2xs ${isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"}`} title="Unduh JSON Log">
              <Download className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={handleClearLogs} className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-mono flex items-center gap-1 cursor-pointer shadow-2xs" title="Bersihkan Log">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
          {[
            { label: "TOTAL", val: stats?.total || logs.length, color: isDark ? "text-emerald-400" : "text-[#1B4D3E]" },
            { label: "ERROR", val: stats?.errors || logs.filter((l) => l.level === "ERROR" || l.level === "CRITICAL").length, color: isDark ? "text-rose-400" : "text-rose-600" },
            { label: "WARN", val: stats?.warnings || logs.filter((l) => l.level === "WARN" || l.level === "WARNING").length, color: isDark ? "text-amber-400" : "text-amber-600" },
            {
              label: "SOCKET",
              val: (
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${wsConnected ? (isDark ? "text-emerald-400" : "text-emerald-700") : (isDark ? "text-amber-400" : "text-amber-700")}`}>
                  {wsConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {wsConnected ? "CONNECTED" : "POLLING"}
                </span>
              )
            }
          ].map((item, idx) => (
            <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between shadow-2xs ${isDark ? "bg-[#0F172A] border-slate-800 text-white" : "bg-white border-[#E2EBF4] text-[#172033]"}`}>
              <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>{item.label}</span>
              {typeof item.val === "object" ? item.val : <span className={`font-black text-sm ${item.color}`}>{item.val}</span>}
            </div>
          ))}
        </div>

        <div className={`rounded-2xl overflow-hidden border shadow-xl flex flex-col transition-colors duration-200 ${isDark ? "bg-[#0A0E17] border-slate-800" : "bg-[#FAF7EE] border-[#D4C9B5]"}`}>
          <div className={`px-3 py-2 border-b flex flex-wrap items-center justify-between gap-2 ${isDark ? "bg-[#101726] border-slate-800" : "bg-[#F4ECE1] border-[#E5DECE]"}`}>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/90" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/90" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/90" />
              </div>
              <span className={`text-[11px] font-mono hidden sm:inline-block ${isDark ? "text-slate-400" : "text-[#475569]"}`}>
                root@mizan-core:~ tail -f system.log
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <label className={`flex items-center gap-1 text-[10px] font-mono cursor-pointer select-none ${isDark ? "text-slate-400 hover:text-white" : "text-[#475569] hover:text-black"}`}>
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded text-emerald-500 accent-emerald-500 w-3 h-3 cursor-pointer"
                />
                <span>Auto-Scroll</span>
              </label>

              <button
                type="button"
                onClick={toggleWrap}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1 cursor-pointer transition-colors ${wrapLines ? (isDark ? "bg-emerald-950/70 text-emerald-300 border-emerald-800" : "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold") : (isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-white text-slate-600 border-slate-300")}`}
              >
                <AlignLeft className="w-2.5 h-2.5" />
                <span>{wrapLines ? "Wrap: ON" : "Wrap: OFF"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(JSON.stringify(filteredLogs, null, 2), "all")}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1 cursor-pointer ${isDark ? "bg-slate-800 text-slate-300 hover:text-white border-slate-700" : "bg-white text-slate-700 hover:text-black border-slate-300 shadow-2xs"}`}
              >
                {copiedId === "all" ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                <span>Salin</span>
              </button>
            </div>
          </div>

          <div className={`p-2 border-b flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs font-mono ${isDark ? "bg-[#0F172A]/90 border-slate-800/80" : "bg-[#FDFBF7] border-[#E5DECE]"}`}>
            <div className="relative flex-1 min-w-[140px]">
              <Search className={`w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-[#94A3B8]"}`} />
              <input
                type="text"
                placeholder="grep keyword / ip / path..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-7 pr-2.5 py-1 text-[11px] border rounded-lg focus:outline-none font-mono ${isDark ? "bg-slate-900 border-slate-700 text-emerald-300 focus:border-emerald-500 placeholder-slate-600" : "bg-white border-[#D4C9B5] text-[#1B4D3E] focus:border-[#1B4D3E] placeholder-[#94A3B8]"}`}
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0">
              {["ALL", "ERROR", "WARN", "INFO"].map((lvl) => {
                const isActive = selectedLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${isActive ? (lvl === "ERROR" ? "bg-rose-500/20 text-rose-400 border border-rose-500/60" : lvl === "WARN" ? "bg-amber-500/20 text-amber-400 border border-amber-500/60" : lvl === "INFO" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/60" : (isDark ? "bg-slate-700 text-white border border-slate-600" : "bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-2xs")) : (isDark ? "text-slate-400 hover:text-slate-200 border border-transparent" : "text-[#64748B] hover:text-[#172033] border border-transparent")}`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            ref={terminalScrollRef}
            className={`h-[58vh] sm:h-[66vh] overflow-y-auto p-2 sm:p-3 font-mono text-[11px] sm:text-xs leading-relaxed divide-y ${wrapLines ? "overflow-x-hidden" : "overflow-x-auto"} ${isDark ? "text-slate-200 divide-slate-800/40" : "text-[#172033] divide-[#E5DECE]/60"}`}
          >
            {filteredLogs.length === 0 ? (
              <div className={`py-12 text-center font-mono text-xs ${isDark ? "text-slate-500" : "text-[#94A3B8]"}`}>
                {searchQuery ? "Tidak ada baris log yang cocok dengan filter grep." : "Belum ada log sistem tercatat."}
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedId === log.id;
                const isErr = log.level === "ERROR" || log.level === "CRITICAL";
                const isWarn = log.level === "WARN" || log.level === "WARNING";
                const isCopied = copiedId === log.id;

                return (
                  <div key={log.id} className={`py-1.5 px-1 rounded transition-colors ${isDark ? "hover:bg-slate-900/60" : "hover:bg-[#F4ECE1]/70"}`}>
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      className={`flex items-baseline gap-1.5 cursor-pointer select-none group ${wrapLines ? "flex-wrap" : "whitespace-nowrap"}`}
                    >
                      <button type="button" className={`mt-0.5 shrink-0 ${isDark ? "text-slate-600 group-hover:text-slate-400" : "text-[#94A3B8] group-hover:text-[#475569]"}`}>
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      </button>

                      <span className={`shrink-0 select-all ${isDark ? "text-slate-500" : "text-[#64748B]"}`}>
                        [{formatTime(log.timestamp)}]
                      </span>

                      <span className={`font-black shrink-0 px-1 py-0.2 rounded text-[10px] border ${isErr ? (isDark ? "bg-rose-950/80 text-rose-400 border-rose-800" : "bg-rose-100 text-rose-800 border-rose-300") : isWarn ? (isDark ? "bg-amber-950/80 text-amber-400 border-amber-800" : "bg-amber-100 text-amber-800 border-amber-300") : (isDark ? "bg-emerald-950/80 text-emerald-400 border-emerald-800" : "bg-emerald-100 text-emerald-800 border-emerald-300")}`}>
                        {log.level}
                      </span>

                      <span className={`font-bold shrink-0 ${isDark ? "text-cyan-400" : "text-[#0284C7]"}`}>
                        [{log.category || "SYSTEM"}]
                      </span>

                      <span className={`flex-1 break-words ${isDark ? "text-slate-200" : "text-[#0F172A] font-medium"}`}>
                        {log.message || log.action}
                      </span>

                      {log.actor?.ip && (
                        <span className={`text-[10px] shrink-0 font-mono px-1 rounded ${isDark ? "text-slate-500 bg-slate-900" : "text-[#64748B] bg-white border border-[#E2E8F0]"}`}>
                          {log.actor.ip}
                        </span>
                      )}
                    </div>

                    {isExpanded && (
                      <div className={`mt-1.5 ml-4 p-2.5 rounded-lg border text-[10px] sm:text-[11px] space-y-1.5 ${isDark ? "bg-black/70 border-slate-800 text-slate-300" : "bg-white border-[#E5DECE] text-[#334155] shadow-xs"}`}>
                        <div className={`flex items-center justify-between pb-1 border-b ${isDark ? "border-slate-800 text-slate-400" : "border-[#E2E8F0] text-[#64748B]"}`}>
                          <span className={`font-bold ${isDark ? "text-emerald-400" : "text-[#1B4D3E]"}`}>{log.action}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(JSON.stringify(log, null, 2), log.id);
                            }}
                            className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded border cursor-pointer ${isDark ? "bg-slate-800 text-slate-300 hover:text-white border-slate-700" : "bg-[#FAF7EE] text-[#1B4D3E] hover:bg-[#F2ECE0] border-[#D4C9B5]"}`}
                          >
                            {isCopied ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                            <span>{isCopied ? "Disalin" : "Salin JSON"}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] pt-0.5">
                          <div><span className={isDark ? "text-slate-500" : "text-[#64748B]"}>ID: </span><span className="font-mono">{log.id}</span></div>
                          <div><span className={isDark ? "text-slate-500" : "text-[#64748B]"}>Waktu: </span><span className="font-mono">{log.timestamp}</span></div>
                          <div><span className={isDark ? "text-slate-500" : "text-[#64748B]"}>Aktor: </span><span>{log.actor?.name || "Guest"} ({log.actor?.role || "PUBLIC"})</span></div>
                          <div><span className={isDark ? "text-slate-500" : "text-[#64748B]"}>IP: </span><span className="font-mono">{log.actor?.ip || "127.0.0.1"}</span></div>
                        </div>

                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className={`pt-1 border-t ${isDark ? "border-slate-800/80" : "border-[#E2E8F0]"}`}>
                            <span className={`block mb-0.5 ${isDark ? "text-slate-500" : "text-[#64748B]"}`}>Payload Details:</span>
                            <pre className={`p-1.5 rounded overflow-x-auto font-mono text-[10px] border ${isDark ? "bg-slate-950 text-emerald-300 border-slate-800" : "bg-[#F8FAFC] text-[#1B4D3E] border-[#E2E8F0]"}`}>
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className={`px-3 py-1.5 border-t flex flex-wrap items-center justify-between text-[10px] font-mono gap-1 ${isDark ? "bg-[#101726] border-slate-800 text-slate-500" : "bg-[#F4ECE1] border-[#E5DECE] text-[#64748B]"}`}>
            <span>Menampilkan {filteredLogs.length} dari {logs.length} entri</span>
            <span className={isDark ? "text-slate-400" : "text-[#475569]"}>
              Mode: {terminalTheme === "dark" ? "Gelap (Dark Terminal)" : "Terang (Light Terminal)"} • Klik baris untuk detail JSON
            </span>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
