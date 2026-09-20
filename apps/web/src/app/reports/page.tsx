"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  Flame,
  Award,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        setIsLoading(true);
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
      <div className="max-w-4xl mx-auto py-20 text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5B8DEF] border-t-transparent mx-auto" />
        <p className="text-xs text-[#B4BDC8]">Generating executive competency report...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-[#27303B] pb-6 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#5B8DEF] bg-[#5B8DEF]/10 px-2 py-0.5 rounded-full font-bold">
            [06 — PROGRESS]
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
          Career Readiness Progression
        </h1>
        <p className="text-xs sm:text-sm text-[#B4BDC8]">
          Generated on {report.generated_at || "September 2026"} for Alex Rivera • Target Role: Data Analyst
        </p>
        <div className="border-l-2 border-[#5B8DEF]/40 pl-3 py-1 text-xs sm:text-sm italic text-[#B4BDC8]">
          “Progress isn’t about knowing more. It’s about becoming more capable.”
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#B4BDC8] pt-1">
          <span className="text-[10px] font-bold uppercase text-[#7E8996]">Timeline:</span>
          <span className="text-[#B4BDC8] font-semibold">BEFORE (Initial Diagnostic: 58%)</span>
          <span className="text-[#CBD2CB]">→</span>
          <span className="text-[#5B8DEF] font-bold">CURRENT (Verified Evidence: 72%)</span>
          <span className="text-[#CBD2CB]">→</span>
          <span className="text-[#F5F7FA] font-bold">TARGET (Interview Ready: 85%+)</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#27303B] bg-[#151B23] p-4 space-y-1">
          <span className="text-xs font-medium text-[#B4BDC8] block">Assessment Avg</span>
          <span className="text-2xl font-extrabold font-mono text-[#F5F7FA]">
            {report.assessment_average || "84%"}
          </span>
          <span className="text-[11px] text-[#36C98F] font-semibold block pt-1">
            ↑ {report.velocity_improvement || "+14%"} velocity
          </span>
        </div>

        <div className="rounded-xl border border-[#27303B] bg-[#151B23] p-4 space-y-1">
          <span className="text-xs font-medium text-[#B4BDC8] block">Logged Hours</span>
          <span className="text-2xl font-extrabold font-mono text-[#5B8DEF]">
            {report.weekly_hours_logged || "6.5"} / {report.target_hours || "8.0"}
          </span>
          <span className="text-[11px] text-[#B4BDC8] block pt-1">Target Pacing</span>
        </div>

        <div className="rounded-xl border border-[#27303B] bg-[#151B23] p-4 space-y-1">
          <span className="text-xs font-medium text-[#B4BDC8] block">Active Streak</span>
          <span className="text-2xl font-extrabold font-mono text-[#B67A22]">
            {report.streak_days || 18} Days
          </span>
          <span className="text-[11px] text-[#36C98F] font-semibold block pt-1">Consistent Routine</span>
        </div>

        <div className="rounded-xl border border-[#27303B] bg-[#151B23] p-4 space-y-1">
          <span className="text-xs font-medium text-[#B4BDC8] block">Velocity Trend</span>
          <span className="text-2xl font-extrabold font-mono text-[#36C98F]">Accelerating</span>
          <span className="text-[11px] text-[#B4BDC8] block pt-1">Low Friction</span>
        </div>
      </div>

      {/* Core Insights Over Decoration */}
      <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-3 border-b border-[#27303B] pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5B8DEF]">
            Key Insight: Competency Acceleration
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#F5F7FA]">
            “Your SQL proficiency increased 14% over the last 30 days.”
          </h2>
          <p className="text-xs text-[#B4BDC8] leading-relaxed">
            <strong>Evidence behind this statement:</strong> You completed 2 diagnostic checkpoints on relational joins (100%) and submitted 1 capstone project validating window partitioning.
          </p>
        </div>

        {/* Breakdown Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2.5">
            <span className="font-bold text-[#F5F7FA] uppercase block">
              Verified Competencies Acquired
            </span>
            <ul className="space-y-1.5">
              {[
                "SQL Joins & Relational Sets (100% Checkpoint Score)",
                "Descriptive Statistics & Variance (88% Assessment Score)",
                "Pandas Data Imputation (85% Applied Submission)"
              ].map((s, i) => (
                <li key={i} className="flex items-center gap-2 text-[#F5F7FA] bg-[#11161D] p-2 rounded-lg border border-[#27303B]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#36C98F] shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            <span className="font-bold text-[#F5F7FA] uppercase block">
              Active Focus Areas
            </span>
            <ul className="space-y-1.5">
              {[
                "SQL Window Functions (Remediation DAG Milestone)",
                "Power BI Business Storytelling (Upcoming Capstone)",
                "A/B Testing Methodologies (Scheduled Week 5)"
              ].map((s, i) => (
                <li key={i} className="flex items-center gap-2 text-[#F5F7FA] bg-[#11161D] p-2 rounded-lg border border-[#27303B]">
                  <span className="h-2 w-2 rounded-full bg-[#B67A22] shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
