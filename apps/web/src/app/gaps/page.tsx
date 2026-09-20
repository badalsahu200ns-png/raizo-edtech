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
  Info,
  ChevronRight,
  Target
} from "lucide-react";
import { api } from "@/lib/api";
import { GapMatrix, SkillGapItem } from "@/lib/types";
import { formatSkillName } from "@/lib/skillUtils";

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
      <div className="max-w-5xl mx-auto py-20 text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5B8DEF] border-t-transparent mx-auto" />
        <p className="text-xs text-[#B4BDC8]">Synthesizing role competency gap matrix...</p>
      </div>
    );
  }

  const filteredItems = matrix.gap_items.filter((item) => {
    if (filter === "missing") return item.status === "Missing";
    if (filter === "partial") return item.status === "Partial";
    if (filter === "proficient") return item.status === "Proficient";
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* 1. EDITORIAL HEADER */}
      <div className="border-b border-[#27303B] pb-6 space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5B8DEF]">
          TARGET ROLE COMPETENCY MODEL
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
          Where your skills meet the role.
        </h1>
        <p className="text-xs sm:text-sm text-[#B4BDC8] max-w-2xl leading-relaxed">
          RAIZOAGENTIC compares your demonstrated capabilities with the requirements of your target role: <strong>{matrix.target_role}</strong>.
        </p>
      </div>

      {/* 2. CURRENT STATE VS TARGET ROLE COMPARISON */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CURRENT STATE */}
        <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#27303B] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B4BDC8]">
                DEMONSTRATED CAPABILITIES
              </span>
              <h3 className="text-base font-bold text-[#F5F7FA]">CURRENT STATE</h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#5B8DEF] px-2 py-0.5 rounded bg-[#5B8DEF]/10">
              {matrix.overall_readiness_score}% Overall
            </span>
          </div>

          <div className="space-y-3">
            {[
              { name: "SQL", score: 82 },
              { name: "Python", score: 68 },
              { name: "Statistics", score: 61 },
              { name: "Visualization", score: 54 }
            ].map((s) => (
              <div key={s.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#F5F7FA]">{s.name}</span>
                  <span className="font-mono text-[#B4BDC8]">{s.score}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#1A212B] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#5B8DEF] transition-all"
                    style={{ width: `${s.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TARGET ROLE */}
        <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#27303B] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8DEF]">
                ROLE BENCHMARK
              </span>
              <h3 className="text-base font-bold text-[#F5F7FA]">TARGET ROLE: Data Analyst</h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#F5F7FA] px-2 py-0.5 rounded bg-[#1A212B]">
              {matrix.target_threshold}% Threshold
            </span>
          </div>

          <div className="space-y-3">
            {[
              { name: "SQL", required: 90 },
              { name: "Python", required: 80 },
              { name: "Statistics", required: 75 },
              { name: "Visualization", required: 80 }
            ].map((s) => (
              <div key={s.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#F5F7FA]">{s.name} Required</span>
                  <span className="font-mono text-[#5B8DEF]">{s.required}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#1A212B] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#2F7D5C] transition-all"
                    style={{ width: `${s.required}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. VISUAL GAP MAP (CRITICAL GAP SPOTLIGHT) */}
      <div className="rounded-2xl border border-[#B67A22]/30 bg-[#FFFDF7] p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FBF4E8] text-[#B67A22] border border-[#B67A22]/20">
                Critical Prerequisite Gap
              </span>
              <span className="text-xs font-bold text-[#E86A6A]">Priority: High</span>
            </div>
            <h3 className="text-lg font-bold text-[#F5F7FA]">
              SQL Window Functions & Partitioning
            </h3>
            <p className="text-xs text-[#B4BDC8]">
              <strong>Recommended Action:</strong> Complete 2 guided exercises + 1 portfolio project.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/practice"
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold shadow-sm hover:bg-[#4779D8] transition-all"
            >
              <span>Close This Gap</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. DETAILED GAP BREAKDOWN LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F7FA]">
            Detailed Competency Breakdown
          </h3>
          <div className="flex rounded-xl border border-[#27303B] bg-[#151B23] p-1 text-xs">
            {["all", "missing", "partial", "proficient"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`rounded-lg px-2.5 py-1 font-semibold capitalize transition-all ${
                  filter === tab
                    ? "bg-[#5B8DEF] text-white"
                    : "text-[#B4BDC8] hover:text-[#F5F7FA]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.skill_id}
              className="rounded-xl border border-[#27303B] bg-[#151B23] p-5 space-y-3 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#7E8996]">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold text-[#F5F7FA]">
                    {formatSkillName(item.skill_id || item.title)}
                  </h4>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-[#B4BDC8]">
                    Current: <strong className="text-[#F5F7FA]">{item.current_score}%</strong>
                  </span>
                  <span>/</span>
                  <span className="text-[#B4BDC8]">
                    Required: <strong className="text-[#5B8DEF]">{item.required_score}%</strong>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.status === "Proficient"
                      ? "bg-[#5B8DEF]/10 text-[#36C98F]"
                      : item.status === "Partial"
                      ? "bg-[#FBF4E8] text-[#B67A22]"
                      : "bg-[#FBEAEB] text-[#E86A6A]"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#B4BDC8] leading-relaxed">
                <strong>Why this matters:</strong> {item.why_explanation}
              </p>

              {item.recommended_next_step && (
                <div className="pt-2 border-t border-[#27303B] flex items-center justify-between text-xs">
                  <span className="text-[#5B8DEF] font-semibold">
                    Next Step: {item.recommended_next_step}
                  </span>
                  <Link
                    href={`/tutor?topic=${encodeURIComponent(item.title)}`}
                    className="text-xs font-bold text-[#F5F7FA] hover:text-[#5B8DEF] flex items-center gap-1"
                  >
                    <span>Practice with Tutor</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
