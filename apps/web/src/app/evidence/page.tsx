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
  ExternalLink
} from "lucide-react";
import { api } from "@/lib/api";
import { EvidenceItem } from "@/lib/types";

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
        console.error("Failed to load evidence ledger:", err);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Immutable Audit Trail
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Competency Evidence Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Every claimed and verified competency is supported by permanent empirical records.
            Raizo never invents competencies without verifiable proof.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search evidence records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none w-56"
            />
          </div>

          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
            {["all", "checkpoint", "diagnostic", "resume_claim", "applied_task", "project"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`rounded-lg px-2.5 py-1 font-semibold capitalize transition-all ${
                  filterType === t
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ledger Table / List */}
      <div className="space-y-3">
        {filteredEvidence.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            No evidence records matched your search query.
          </div>
        ) : (
          filteredEvidence.map((item) => {
            let details: any = {};
            try {
              details = typeof item.details_json === "string" ? JSON.parse(item.details_json) : item.details_json;
            } catch (e) {}

            const isHigh = item.confidence === "high";
            const isMedium = item.confidence === "medium";

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-[#0d1424] p-5 space-y-2 hover:border-indigo-500/40 transition-all shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{item.source_title}</h3>
                      <span className="text-[11px] text-slate-400">
                        Associated Skill: {item.skill_title || item.skill_id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="rounded-lg bg-white/5 border border-white/5 px-2.5 py-1 text-xs font-mono text-slate-300">
                      Score: {item.score !== null ? `${item.score}%` : "Pending"}
                    </span>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold border ${
                        isHigh
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : isMedium
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      }`}
                    >
                      {item.confidence.toUpperCase()} CONFIDENCE
                    </span>
                  </div>
                </div>

                {/* Details context if present */}
                <div className="text-xs text-slate-300 pl-12">
                  {details.detail && <p className="leading-relaxed">{details.detail}</p>}
                  {details.context && <p className="italic text-slate-400">"{details.context}"</p>}
                  {details.weaknesses && details.weaknesses.length > 0 && (
                    <p className="text-rose-400 text-[11px] mt-1">
                      Identified Weakness: {details.weaknesses.join(", ")}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pl-12 pt-1 border-t border-white/5">
                  <span className="capitalize">Type: {item.evidence_type.replace("_", " ")}</span>
                  <span>Recorded: {item.created_at}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
