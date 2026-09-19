"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Search,
  Sparkles,
  Info
} from "lucide-react";
import { api } from "@/lib/api";
import { GapMatrix, SkillGapItem } from "@/lib/types";

export default function GapsPage() {
  const [matrix, setMatrix] = useState<GapMatrix | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGaps() {
      try {
        setIsLoading(true);
        const res = await api.getGaps();
        setMatrix(res);
      } catch (err) {
        console.error("Failed to load gap matrix:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadGaps();
  }, []);

  if (isLoading || !matrix) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4" />
        Synthesizing role competency gap matrix...
      </div>
    );
  }

  const filteredItems = matrix.gap_items.filter((item) => {
    if (filter === "missing") return item.status === "Missing";
    if (filter === "partial") return item.status === "Partial";
    if (filter === "proficient") return item.status === "Proficient";
    if (filter === "unverified") return item.status === "Unverified";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          Target Role Competency Model
        </span>
        <h1 className="text-3xl font-extrabold text-white">
          Skill Gap Analysis Matrix: {matrix.target_role}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Every gap includes a transparent "Why?" explanation derived from prerequisite sub-skills and empirical evidence.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
          <span className="text-xs text-slate-400 block">Overall Readiness</span>
          <span className="text-3xl font-bold font-mono text-cyan-400">{matrix.overall_readiness_score}%</span>
          <span className="text-[11px] text-slate-500 block mt-1">Target Threshold: {matrix.target_threshold}%</span>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-5">
          <span className="text-xs text-emerald-400 block">Proficient Skills</span>
          <span className="text-3xl font-bold font-mono text-white">{matrix.proficient_count}</span>
          <span className="text-[11px] text-emerald-400/80 block mt-1">Verified Competencies</span>
        </div>
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/15 p-5">
          <span className="text-xs text-cyan-400 block">Developing Skills</span>
          <span className="text-3xl font-bold font-mono text-white">{matrix.partial_count}</span>
          <span className="text-[11px] text-cyan-400/80 block mt-1">Partial Competency</span>
        </div>
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/15 p-5">
          <span className="text-xs text-rose-400 block">Critical Gaps</span>
          <span className="text-3xl font-bold font-mono text-white">{matrix.missing_count}</span>
          <span className="text-[11px] text-rose-400/80 block mt-1">Action Required</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3 text-xs">
        <span className="text-slate-400 font-semibold mr-2">Filter Gaps:</span>
        {["all", "missing", "partial", "proficient", "unverified"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-lg px-3 py-1 font-semibold capitalize transition-all ${
              filter === tab
                ? "bg-indigo-600 text-white shadow"
                : "bg-white/5 text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Gap Matrix Cards */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const isProficient = item.status === "Proficient";
          const isMissing = item.status === "Missing";
          const isPartial = item.status === "Partial";

          return (
            <div
              key={item.skill_id}
              className={`rounded-3xl border p-6 space-y-4 transition-all ${
                isMissing
                  ? "border-rose-500/40 bg-rose-950/10"
                  : isPartial
                  ? "border-cyan-500/30 bg-[#0d1526]"
                  : "border-emerald-500/30 bg-emerald-950/10"
              }`}
            >
              {/* Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                        isProficient
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : isMissing
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{item.title}</h3>
                </div>

                {/* Score Delta */}
                <div className="flex items-center space-x-4 text-right">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Current</span>
                    <span className="text-base font-bold font-mono text-white">{item.current_score}%</span>
                  </div>
                  <div className="text-slate-500">/</div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Required</span>
                    <span className="text-base font-bold font-mono text-indigo-400">{item.required_score}%</span>
                  </div>
                  {item.gap_score > 0 && (
                    <span className="rounded-lg bg-rose-500/20 px-2 py-1 text-xs font-bold text-rose-300 border border-rose-500/30">
                      -{item.gap_score}% Gap
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isProficient ? "bg-emerald-400" : isMissing ? "bg-rose-400" : "bg-cyan-400"
                  }`}
                  style={{ width: `${Math.max(5, item.current_score)}%` }}
                />
              </div>

              {/* Explainable Why Section (Crucial Requirement!) */}
              <div className="rounded-2xl bg-black/40 p-4 border border-white/5 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-white">
                  <Info className="h-4 w-4 text-cyan-400" />
                  <span>Why does this gap exist?</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.why_explanation}
                </p>

                {/* Sub-skills Breakdown */}
                {item.sub_skills_breakdown && item.sub_skills_breakdown.length > 0 && (
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.sub_skills_breakdown.map((sub) => (
                      <div
                        key={sub.sub_skill_id}
                        className="flex items-center space-x-2 text-xs text-slate-300"
                      >
                        {sub.demonstrated ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        )}
                        <span className="truncate">{sub.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2">
                <span className="text-slate-300">
                  <span className="text-slate-400">Recommended Next Step:</span>{" "}
                  <span className="font-semibold text-cyan-300">{item.recommended_next_step}</span>
                </span>

                <div className="flex items-center space-x-2">
                  <Link
                    href={`/skills/${item.skill_id}`}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-slate-200 hover:bg-white/10"
                  >
                    View Evidence
                  </Link>
                  <Link
                    href={`/assessment?skill=${item.skill_id}&title=${encodeURIComponent(item.title)}`}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white hover:bg-indigo-500 shadow"
                  >
                    Take Assessment
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
