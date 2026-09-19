"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Search
} from "lucide-react";
import { api } from "@/lib/api";
import { LearnerSkill } from "@/lib/types";

export default function SkillsPage() {
  const [skills, setSkills] = useState<LearnerSkill[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSkills() {
      try {
        setIsLoading(true);
        const res = await api.getSkills();
        setSkills(res.skills || []);
      } catch (err) {
        console.error("Failed to load skills:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSkills();
  }, []);

  const filteredSkills = skills.filter((s) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "proficient"
        ? s.status === "Proficient"
        : filter === "developing"
        ? s.status === "Developing"
        : filter === "remediation"
        ? s.status === "Needs Remediation"
        : s.status === "Unverified";

    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Evidence-Based Competency Graph
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Skill Intelligence Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Raizo maintains a strict distinction between self-reported claims and verified performance.
            Scores update only upon empirical evaluation.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search competencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none w-56"
            />
          </div>

          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
            {["all", "proficient", "developing", "remediation", "unverified"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`rounded-lg px-3 py-1 font-semibold capitalize transition-all ${
                  filter === tab
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSkills.map((skill) => {
          const isProficient = skill.status === "Proficient";
          const isRemediation = skill.status === "Needs Remediation";
          const isUnverified = skill.status === "Unverified";

          return (
            <Link
              key={skill.skill_id}
              href={`/skills/${skill.skill_id}`}
              className={`rounded-2xl border p-6 space-y-4 transition-all hover:scale-[1.01] flex flex-col justify-between ${
                isRemediation
                  ? "border-rose-500/50 bg-rose-950/20 hover:border-rose-400"
                  : isProficient
                  ? "border-emerald-500/30 bg-emerald-950/15 hover:border-emerald-500/60"
                  : isUnverified
                  ? "border-amber-500/30 bg-amber-950/15 hover:border-amber-500/50"
                  : "border-white/10 bg-[#0d1424] hover:border-indigo-500/50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-indigo-400 uppercase tracking-wider text-[11px]">
                    {skill.category}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                      isProficient
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : isRemediation
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : isUnverified
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                    }`}
                  >
                    {skill.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300">
                  {skill.title}
                </h3>
              </div>

              {/* Verified vs Claimed Score Comparison */}
              <div className="space-y-3 rounded-xl bg-black/40 p-4 border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Verified Score:</span>
                  <span className={`font-mono font-bold text-sm ${
                    isProficient ? "text-emerald-400" : isRemediation ? "text-rose-400" : "text-cyan-400"
                  }`}>
                    {skill.verified_score > 0 ? `${skill.verified_score}%` : "Pending Diagnostic"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isProficient ? "bg-emerald-400" : isRemediation ? "bg-rose-400" : "bg-cyan-400"
                    }`}
                    style={{ width: `${Math.max(5, skill.verified_score)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  <span>Resume Claim: {skill.claimed_score}%</span>
                  <span className="capitalize">Confidence: {skill.confidence}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                  {skill.evidence_count} Evidence Records
                </span>
                <span className="flex items-center gap-1 font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  View Detail <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
