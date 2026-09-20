"use client";

import React, { useState, useEffect } from "react";
import { X, Activity, RefreshCw } from "lucide-react";
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

  const sampleOperationalActivities = [
    {
      title: "RAIZO analyzed your latest assessment.",
      time: "2 minutes ago",
      agent: "Evaluator Agent",
      status: "completed",
      detail: "Deterministic scoring validated 84% on SQL joins. Updated competency graph."
    },
    {
      title: "RAIZO identified a gap in SQL window functions.",
      time: "18 minutes ago",
      agent: "Gap Analyzer",
      status: "alert",
      detail: "Partition key missing in Dense Rank logic. Injected targeted practice module."
    },
    {
      title: "Learning Path updated.",
      time: "32 minutes ago",
      agent: "Roadmap Planner",
      status: "completed",
      detail: "Inserted remediation node: 'SQL Window Functions' prior to Capstone challenge."
    },
    {
      title: "Project evidence verified.",
      time: "1 hour ago",
      agent: "Verification Agent",
      status: "completed",
      detail: "Cryptographic HMAC-SHA256 evidence record appended to immutable ledger."
    }
  ];

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#03070C]/75 backdrop-blur-sm transition-opacity flex justify-end">
      <div
        className="w-screen max-w-md bg-[#11161D] border-l border-[#27303B] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#27303B] px-5 py-4 bg-[#151B23]">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B8DEF]/10 text-[#5B8DEF]">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#F5F7FA] flex items-center gap-1.5">
                <span>Agent Activity Stream</span>
                <span className="h-2 w-2 rounded-full bg-[#36C98F]" />
              </h2>
              <p className="text-[11px] text-[#B4BDC8]">
                Operational reasoning & audit telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={fetchLogs}
              disabled={isLoading}
              className="rounded-lg p-1.5 text-[#7E8996] hover:bg-[#1A212B] hover:text-[#F5F7FA] transition-colors cursor-pointer"
              title="Refresh logs"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-[#5B8DEF]" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#7E8996] hover:bg-[#1A212B] hover:text-[#F5F7FA] transition-colors cursor-pointer"
              aria-label="Close activity stream"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Activity Stream List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7E8996] block">
            RECENT AGENT EVENTS
          </span>

          {/* Operational Activities */}
          <div className="space-y-2.5">
            {sampleOperationalActivities.map((act, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-[#27303B] bg-[#151B23] space-y-1.5 transition-colors hover:bg-[#1A212B]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[#5B8DEF]">
                    {act.agent}
                  </span>
                  <span className="text-[10px] font-mono text-[#7E8996]">
                    {act.time}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#F5F7FA]">
                  {act.title}
                </h4>
                <p className="text-[11px] text-[#B4BDC8] leading-relaxed">
                  {act.detail}
                </p>
              </div>
            ))}
          </div>

          {/* Server Audit Logs if available */}
          {logs.length > 0 && (
            <div className="pt-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7E8996] block">
                RAW AUDIT LOG TELEMETRY
              </span>
              <div className="space-y-2">
                {logs.slice(0, 8).map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                    className="p-3 rounded-lg border border-[#27303B] bg-[#151B23] text-xs space-y-1 cursor-pointer hover:border-[#5B8DEF]/60"
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-[#F5F7FA]">{log.agent || "Agent"}</span>
                      <span className="font-mono text-[#7E8996]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#B4BDC8] truncate">{log.action}</p>
                    {selectedLog?.id === log.id && (
                      <pre className="mt-2 text-[10px] font-mono bg-[#0B0F14] border border-[#27303B] text-[#5B8DEF] p-2 rounded overflow-x-auto">
                        {log.details_json || JSON.stringify(log, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#27303B] bg-[#151B23] text-[11px] text-[#7E8996] flex items-center justify-between">
          <span>Continuous Evaluator Loop</span>
          <span className="font-semibold text-[#F5F7FA]">Autonomous & Supervised</span>
        </div>
      </div>
    </div>
  );
}
