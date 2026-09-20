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
  Search,
  ChevronRight,
  ChevronDown,
  Sparkles,
  BarChart3,
  FileCheck2,
  Info
} from "lucide-react";
import { api } from "@/lib/api";
import { LearnerSkill } from "@/lib/types";
import { formatSkillName, getSkillCategory, getSkillLevel, formatConfidenceLevel } from "@/lib/skillUtils";

export default function SkillsPage() {
  const [skills, setSkills] = useState<LearnerSkill[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedVerificationId, setExpandedVerificationId] = useState<string | null>(null);

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
        : filter === "verified"
        ? s.status === "Proficient" || (s.verified_score ?? 0) >= 75
        : filter === "developing"
        ? s.status === "Developing" || ((s.verified_score ?? 0) >= 40 && (s.verified_score ?? 0) < 75)
        : filter === "unverified"
        ? s.status === "Unverified" || (s.verified_score ?? 0) < 40
        : true;

    const titleStr = formatSkillName(s.skill_id || s.title);
    const catStr = getSkillCategory(s.skill_id || s.category);
    const matchesSearch =
      titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catStr.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Section 11: Claim vs Verified comparisons
  const claimComparisons = [
    {
      skill: "SQL Fundamentals",
      claimed: 90,
      demonstrated: 88,
      insight: "Demonstrated strong proficiency in core queries, joins, and aggregates; window functions need further practice."
    },
    {
      skill: "Excel Analytics",
      claimed: 85,
      demonstrated: 85,
      insight: "Demonstrated advanced formulas, pivot tables, and statistical modeling matching claimed level."
    },
    {
      skill: "Pandas Data Cleaning",
      claimed: 80,
      demonstrated: 50,
      insight: "Foundations are clear; data frame transformations, reshaping, and pipeline handling need further development."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6">
      {/* Header - Answers: "What can I actually prove?" */}
      <div className="border-b border-[#27303B] pb-6 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#5B8DEF] bg-[#5B8DEF]/10 px-2 py-0.5 rounded-full font-bold">
            [05 — PROVE]
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
          Turn learning into proof.
        </h1>
        <p className="text-sm text-[#B4BDC8] max-w-2xl leading-relaxed">
          See the skills you’ve demonstrated, assessed, and verified with tamper-evident evidence.
        </p>
        <div className="border-l-2 border-[#5B8DEF]/40 pl-3 py-1 text-xs sm:text-sm italic text-[#B4BDC8]">
          “Don’t just say you have the skill. Show the evidence.”
        </div>
        {/* Standard Status Legend */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-semibold">
          <span className="text-[10px] uppercase font-bold text-[#7E8996] mr-1">Status Standard:</span>
          <span className="px-2 py-0.5 rounded-full bg-[#5B8DEF]/10 text-[#5B8DEF] font-bold">● Assessment-backed</span>
          <span className="px-2 py-0.5 rounded-full bg-[#1A212B] text-[#36C98F] font-semibold">● Demonstrated</span>
          <span className="px-2 py-0.5 rounded-full bg-[#FFF4E5] text-[#B67A22] font-semibold">● Developing</span>
          <span className="px-2 py-0.5 rounded-full bg-[#11161D] text-[#B4BDC8] border border-[#27303B]">● Needs evidence</span>
          <span className="px-2 py-0.5 rounded-full bg-[#151B23] text-[#7E8996] border border-[#27303B]">○ Not yet assessed</span>
        </div>
      </div>

      {/* Top Summary Card (Section 9) */}
      <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#27303B]">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8DEF]">
              Career Readiness Profile
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#F5F7FA]">
              Data Analyst Target
            </h2>
            <p className="text-xs text-[#B4BDC8]">
              Empirical verification across assessments, practical exercises, and capstones.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-[#5B8DEF]/10/50 border border-[#5B8DEF]/30 px-5 py-3 rounded-2xl">
            <TrendingUp className="h-5 w-5 text-[#5B8DEF]" />
            <div>
              <span className="text-xs text-[#B4BDC8] block">Overall Readiness</span>
              <span className="text-2xl font-black font-mono text-[#F5F7FA]">72%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-6 text-center">
          <div className="p-3 rounded-xl bg-[#11161D] border border-[#27303B]">
            <span className="text-2xl font-black font-mono text-[#36C98F] block">8</span>
            <span className="text-xs font-semibold text-[#B4BDC8]">Verified Skills</span>
          </div>
          <div className="p-3 rounded-xl bg-[#11161D] border border-[#27303B]">
            <span className="text-2xl font-black font-mono text-[#B67A22] block">3</span>
            <span className="text-xs font-semibold text-[#B4BDC8]">Developing Skills</span>
          </div>
          <div className="p-3 rounded-xl bg-[#11161D] border border-[#27303B]">
            <span className="text-2xl font-black font-mono text-[#B4BDC8] block">2</span>
            <span className="text-xs font-semibold text-[#B4BDC8]">Unverified Skills</span>
          </div>
        </div>
      </div>

      {/* Section 11: Claim vs Verified Comparison */}
      <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-5 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8DEF]">
            HONEST CAPABILITY ASSESSMENT
          </span>
          <h3 className="text-lg font-bold text-[#F5F7FA] mt-0.5">
            Claim vs. Verified Comparison
          </h3>
          <p className="text-xs text-[#B4BDC8]">
            Comparing your self-reported baseline claims with empirically verified performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {claimComparisons.map((c) => (
            <div
              key={c.skill}
              className="p-4 rounded-xl bg-[#11161D] border border-[#27303B] space-y-3 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-[#F5F7FA] block">{c.skill}</span>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#27303B]">
                  <div>
                    <span className="text-[10px] text-[#B4BDC8] uppercase block">Resume Claim</span>
                    <span className="text-lg font-bold font-mono text-[#B4BDC8]">{c.claimed}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5B8DEF] uppercase font-bold block">Demonstrated</span>
                    <span className="text-lg font-bold font-mono text-[#F5F7FA]">{c.demonstrated}%</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#151B23] border border-[#27303B] text-[11px] text-[#B4BDC8] leading-relaxed">
                <strong className="text-[#F5F7FA] block mb-0.5">RAIZO Insight:</strong>
                {c.insight}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#F5F7FA]">All Competencies</h3>
          <p className="text-xs text-[#B4BDC8]">Explore individual skill records and verified evidence.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7E8996]" />
            <input
              type="text"
              placeholder="Search competencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-[#27303B] bg-[#151B23] pl-9 pr-4 py-2 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none w-52 shadow-sm"
            />
          </div>

          <div className="flex rounded-xl border border-[#27303B] bg-[#151B23] p-1 text-xs shadow-sm">
            {[
              { key: "all", label: "All" },
              { key: "verified", label: "Verified" },
              { key: "developing", label: "Developing" },
              { key: "unverified", label: "Unverified" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`rounded-lg px-3 py-1 font-semibold capitalize transition-all ${
                  filter === tab.key
                    ? "bg-[#5B8DEF] text-white shadow-sm"
                    : "text-[#B4BDC8] hover:text-[#F5F7FA]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      {isLoading ? (
        <div className="text-center py-16 space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5B8DEF] border-t-transparent mx-auto" />
          <p className="text-xs text-[#B4BDC8]">Loading verified skills...</p>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="rounded-xl border border-[#27303B] bg-[#151B23] p-12 text-center text-[#B4BDC8] space-y-2">
          <p className="text-sm font-semibold text-[#F5F7FA]">No competencies found matching your search.</p>
          <p className="text-xs">Adjust your search or filter to see your verified competencies.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSkills.map((s) => {
            const skillTitle = formatSkillName(s.skill_id || s.title);
            const category = getSkillCategory(s.skill_id || s.category);
            const score = s.verified_score ?? 70;
            const levelInfo = getSkillLevel(score);
            const isDeveloping = score < 75 && score >= 40;
            const evidenceStrength = formatConfidenceLevel(s.confidence);
            const isExpanded = expandedVerificationId === s.skill_id;

            return (
              <div
                key={s.skill_id}
                className="rounded-2xl border border-[#27303B] bg-[#151B23] p-5 space-y-4 shadow-sm transition-all hover:border-[#5B8DEF]"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8996]">
                      {category}
                    </span>
                    <h4 className="text-base font-bold text-[#F5F7FA]">
                      {skillTitle}
                    </h4>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${levelInfo.bg} ${levelInfo.color} border ${levelInfo.border}`}>
                    {score >= 75 ? "Verified" : isDeveloping ? "Developing" : "Needs Verification"}
                  </span>
                </div>

                {/* Score & Strength */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#B4BDC8]">Demonstrated Score</span>
                    <span className="font-mono text-[#F5F7FA]">{score}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#1A212B] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#5B8DEF] transition-all duration-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#B4BDC8]">
                  <span>Evidence: <strong className="text-[#F5F7FA] font-semibold">{evidenceStrength}</strong></span>
                  <span>{s.evidence_count || 1} Assessment & Project Records</span>
                </div>

                {/* Section 14: Verification Details (Expandable) */}
                {isExpanded && (
                  <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8DEF] block">
                      Verification Record Details
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#B4BDC8] block">Evidence ID:</span>
                        <span className="font-mono font-bold text-[#F5F7FA]">EVID-2026-{s.skill_id.slice(0, 6).toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="text-[#B4BDC8] block">Evaluation Method:</span>
                        <span className="text-[#F5F7FA] font-medium">Objective assessment</span>
                      </div>
                      <div>
                        <span className="text-[#B4BDC8] block">Evaluator:</span>
                        <span className="text-[#F5F7FA] font-medium">RAIZO Career Engine</span>
                      </div>
                      <div>
                        <span className="text-[#B4BDC8] block">Verification Status:</span>
                        <span className="text-[#36C98F] font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Confirmed
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="pt-2 border-t border-[#27303B] flex items-center justify-between">
                  <button
                    onClick={() => setExpandedVerificationId(isExpanded ? null : s.skill_id)}
                    className="text-xs font-semibold text-[#B4BDC8] hover:text-[#F5F7FA] inline-flex items-center gap-1"
                  >
                    <span>{isExpanded ? "Hide Details" : "Verification Details"}</span>
                    {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>

                  {isDeveloping ? (
                    <Link
                      href="/practice"
                      className="px-3 py-1.5 rounded-lg bg-[#5B8DEF] text-white text-xs font-bold hover:bg-[#4779D8] transition-all inline-flex items-center space-x-1"
                    >
                      <span>Practice Skill</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <Link
                      href={`/skills/${s.skill_id}`}
                      className="px-3 py-1.5 rounded-lg bg-[#11161D] hover:bg-[#E9EBE8] text-[#F5F7FA] text-xs font-bold transition-all inline-flex items-center space-x-1"
                    >
                      <span>View Details</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
