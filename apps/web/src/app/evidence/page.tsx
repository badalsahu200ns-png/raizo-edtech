"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  FileText,
  Search,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Layers,
  ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";
import { EvidenceItem } from "@/lib/types";
import { formatSkillName, formatConfidenceLevel, formatEvidenceType } from "@/lib/skillUtils";

export default function EvidenceLedgerPage() {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvidence() {
      try {
        setIsLoading(true);
        const res = await api.getEvidence();
        setEvidenceList(res.evidence || []);
      } catch (err) {
        console.error("Failed to load evidence records:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvidence();
  }, []);

  const filteredEvidence = evidenceList.filter((item) => {
    const matchesFilter = filterType === "all" ? true : item.evidence_type === filterType;
    const matchesSearch =
      item.source_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.skill_title && item.skill_title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      {/* 1. UNIFIED PAGE HEADER */}
      <div className="raizo-page-header">
        <div className="space-y-1.5">
          <span className="raizo-page-eyebrow">
            <span className="h-2 w-2 rounded-full bg-[#5B8DEF]" />
            EVIDENCE LEDGER
          </span>
          <h1 className="raizo-page-title">
            Verified Competency Records
          </h1>
          <p className="raizo-page-desc">
            Every claimed and verified capability is supported by demonstrated records. Scores reflect objective assessments rather than self-reported assumptions.
          </p>
        </div>

        {/* Search & Filter Dock */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7E8996]" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-[#27303B] bg-[#151B23] pl-9 pr-4 py-2 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none w-52 shadow-xs transition-colors"
            />
          </div>

          <div className="flex rounded-xl border border-[#27303B] bg-[#151B23] p-1 text-xs shadow-xs">
            {[
              { key: "all", label: "All" },
              { key: "diagnostic", label: "Assessments" },
              { key: "project", label: "Projects" },
              { key: "checkpoint", label: "Checkpoints" }
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setFilterType(t.key)}
                className={`rounded-lg px-2.5 py-1 font-semibold capitalize transition-all ${
                  filterType === t.key
                    ? "bg-[#5B8DEF] text-white shadow-xs"
                    : "text-[#B4BDC8] hover:text-[#F5F7FA]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Verification Journey Pipeline */}
      <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 space-y-4 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
          HOW RAIZO VERIFIES YOUR CAPABILITIES
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
            <span className="text-[10px] font-bold text-[#B4BDC8] uppercase">01 Demonstrated Skill</span>
            <h4 className="font-bold text-[#F5F7FA]">SQL Window Functions</h4>
            <p className="text-[11px] text-[#B4BDC8]">Identified as key role prerequisite.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
            <span className="text-[10px] font-bold text-[#5B8DEF] uppercase">02 Practical Work</span>
            <h4 className="font-bold text-[#F5F7FA]">Project Submission</h4>
            <p className="text-[11px] text-[#B4BDC8]">Evaluated against objective criteria: 84%.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
            <span className="text-[10px] font-bold text-[#36C98F] uppercase">03 Evidence Strength</span>
            <h4 className="font-bold text-[#F5F7FA]">Strong Evidence</h4>
            <p className="text-[11px] text-[#B4BDC8]">Confirmed across multiple checkpoints.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#5B8DEF]/10/40 border border-[#5B8DEF]/30 space-y-1">
            <span className="text-[10px] font-bold text-[#5B8DEF] uppercase">04 Career Readiness</span>
            <h4 className="font-bold text-[#F5F7FA]">72% Role Match</h4>
            <p className="text-[11px] text-[#36C98F] font-semibold">Ready for junior-to-mid roles.</p>
          </div>
        </div>
      </div>

      {/* 3. Evidence Records */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-16 space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5B8DEF] border-t-transparent mx-auto" />
            <p className="text-xs text-[#B4BDC8]">Loading evidence records...</p>
          </div>
        ) : filteredEvidence.length === 0 ? (
          <div className="rounded-xl border border-[#27303B] bg-[#151B23] p-12 text-center text-[#B4BDC8] space-y-2">
            <p className="text-sm font-semibold text-[#F5F7FA]">No evidence records yet.</p>
            <p className="text-xs">Complete your first practical project or assessment to begin building verified evidence.</p>
            <div className="pt-2">
              <Link
                href="/assessment"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold"
              >
                <span>Take Skill Assessment</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvidence.map((item) => {
              let details: any = {};
              try {
                details = typeof item.details_json === "string" ? JSON.parse(item.details_json) : item.details_json || {};
              } catch (e) {
                details = {};
              }

              const skillName = formatSkillName(item.skill_id || item.skill_title || "General Skill");
              const isStrong = item.confidence === "high";

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#27303B] bg-[#151B23] p-5 space-y-3 shadow-sm transition-all hover:border-[#5B8DEF]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8996]">
                        {formatEvidenceType(item.evidence_type)}
                      </span>
                      <h4 className="text-sm font-bold text-[#F5F7FA]">
                        {item.source_title}
                      </h4>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isStrong
                        ? "bg-[#5B8DEF]/10 text-[#36C98F]"
                        : "bg-[#FBF4E8] text-[#B67A22]"
                    }`}>
                      {formatConfidenceLevel(item.confidence)}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-[#B4BDC8]">
                    <div className="flex justify-between">
                      <span>Evaluated Skill:</span>
                      <strong className="text-[#F5F7FA]">{skillName}</strong>
                    </div>
                    {item.score !== null && item.score !== undefined && (
                      <div className="flex justify-between">
                        <span>Score:</span>
                        <strong className="font-mono text-[#5B8DEF]">{item.score}%</strong>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Recorded:</span>
                      <span>{new Date(item.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>

                  {details?.feedback && (
                    <p className="text-[11px] text-[#B4BDC8] bg-[#11161D] p-2.5 rounded-lg border border-[#27303B] leading-relaxed">
                      {details.feedback}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
