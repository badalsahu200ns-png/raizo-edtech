"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  Flame,
  Award,
  Sparkles
} from "lucide-react";
import { api } from "@/lib/api";

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await api.getWeeklyReport();
        setReport(res);
      } catch (err) {
        console.error("Failed to load report:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, []);

  if (isLoading || !report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4" />
        Generating periodic progress intelligence report...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          Executive Competency Telemetry
        </span>
        <h1 className="text-3xl font-extrabold text-white">
          {report.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Generated on {report.generated_at} for Alex Rivera • Target Role: Data Analyst
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
          <span className="text-xs text-slate-400 block">Assessment Avg</span>
          <span className="text-2xl font-bold font-mono text-white">{report.assessment_average}</span>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" /> {report.velocity_improvement} vs last week
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
          <span className="text-xs text-slate-400 block">Logged Hours</span>
          <span className="text-2xl font-bold font-mono text-cyan-400">
            {report.weekly_hours_logged} / {report.target_hours}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Hrs/Wk Pacing</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
          <span className="text-xs text-slate-400 block">Active Streak</span>
          <span className="text-2xl font-bold font-mono text-amber-400 flex items-center gap-1.5">
            <Flame className="h-5 w-5 fill-amber-400" /> {report.streak_days} Days
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Consistent Learning</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
          <span className="text-xs text-slate-400 block">Velocity Trend</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">Accelerating</span>
          <span className="text-[11px] text-emerald-400/80 block mt-1">Low Friction</span>
        </div>
      </div>

      {/* Report Breakdown Sections */}
      <div className="rounded-3xl border border-white/10 bg-[#0d1424] p-8 space-y-6 shadow-2xl">
        <div className="space-y-4">
          {/* Acquired Skills */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="h-4 w-4" /> Skills Acquired & Verified
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {report.skills_acquired.map((s: string, idx: number) => (
                <div key={idx} className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-xs text-white flex items-center justify-between">
                  <span className="font-semibold">{s}</span>
                  <span className="rounded bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 font-bold">
                    ✓ Verified
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Improving Skills */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-2">
              <Sparkles className="h-4 w-4" /> Improving / In Progress
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {report.improving.map((s: string, idx: number) => (
                <div key={idx} className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3 text-xs text-white flex items-center justify-between">
                  <span className="font-semibold">{s}</span>
                  <span className="rounded bg-cyan-500/20 text-cyan-300 text-[10px] px-2 py-0.5 font-bold">
                    ◐ Developing
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Remaining Gaps */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-4 w-4" /> Remaining Gaps & Prerequisites
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {report.remaining_gaps.map((s: string, idx: number) => (
                <div key={idx} className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-3 text-xs text-white flex items-center justify-between">
                  <span className="font-semibold">{s}</span>
                  <span className="rounded bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 font-bold">
                    • Gap
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Best Action Banner */}
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-5 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
            Synthesized Next Best Action
          </span>
          <p className="text-sm font-bold text-white">
            {report.next_best_action}
          </p>
        </div>
      </div>
    </div>
  );
}
