"use client";

import React, { useState, useEffect } from "react";
import { X, Activity, RefreshCw, CheckCircle2, AlertCircle, Clock, ChevronRight, Terminal } from "lucide-react";
import { api } from "@/lib/api";
import { AuditLogEntry } from "@/lib/types";

interface AgentActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentActivityDrawer({ isOpen, onClose }: AgentActivityDrawerProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAuditLogs(30);
      setLogs(res.logs || []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-xl border-l border-white/10 bg-[#090e1a] text-slate-100 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#0d1424]">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Activity className="h-4 w-4 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Agent Execution & Audit Log
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                    Live
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Inspect behind-the-scenes agent orchestration & operational reasoning
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchLogs}
                disabled={isLoading}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                title="Refresh logs"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No agent events logged yet. Perform an action to see agents execute!
              </div>
            ) : (
              logs.map((log, idx) => {
                const isSelected = selectedLog?.id === log.id || (selectedLog?.timestamp === log.timestamp && selectedLog?.action === log.action);
                const isSuccess = log.status === "SUCCESS";
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedLog(isSelected ? null : log)}
                    className={`rounded-xl border p-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/30 shadow-md shadow-indigo-950/50"
                        : "border-white/5 bg-[#0e1526]/80 hover:border-white/15 hover:bg-[#121b30]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {isSuccess ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-white tracking-wide">
                          {log.agent}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {log.timestamp}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 rounded px-1.5 py-0.5">
                        {log.duration_ms} ms
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>{log.action.replace(/_/g, " ").toUpperCase()}</span>
                      <ChevronRight className={`h-3.5 w-3.5 text-slate-500 transition-transform ${isSelected ? "rotate-90 text-indigo-400" : ""}`} />
                    </div>

                    <div className="mt-1 text-[11px] text-slate-400 truncate">
                      <span className="text-slate-500">Output:</span> {log.output_ref}
                    </div>

                    {/* Expandable Details */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-[11px] font-mono text-slate-300">
                        <div>
                          <span className="text-indigo-400">Input Reference:</span> {log.input_ref}
                        </div>
                        <div>
                          <span className="text-emerald-400">Status:</span> {log.status}
                        </div>
                        {log.details_json && (
                          <div className="bg-[#070b14] p-2.5 rounded-lg border border-white/5 overflow-x-auto">
                            <span className="text-slate-400 block mb-1 text-[10px]">Context Payload:</span>
                            <pre className="text-[10px] text-slate-300 leading-relaxed">
                              {typeof log.details_json === "string" ? log.details_json : JSON.stringify(log.details_json, null, 2)}
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

          {/* Drawer Footer */}
          <div className="border-t border-white/10 px-6 py-3 bg-[#0d1424] text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-indigo-400" />
              Showing last {logs.length} operations
            </span>
            <span className="text-slate-500">Deterministic Engine Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
