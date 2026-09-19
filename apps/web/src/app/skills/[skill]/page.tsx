"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  ExternalLink,
  Sparkles,
  FileCheck2,
  TrendingUp,
  Award
} from "lucide-react";
import { api } from "@/lib/api";

export default function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const skillId = params.skill as string;

  const [detail, setDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      try {
        setIsLoading(true);
        const res = await api.getSkillDetail(skillId);
        setDetail(res);
      } catch (err) {
        console.error("Failed to load skill detail:", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (skillId) {
      loadDetail();
    }
  }, [skillId]);

  if (isLoading || !detail) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4" />
        Loading verified skill intelligence...
      </div>
    );
  }

  const { skill, evidence_history, submissions, recommended_resources } = detail;
  const isProficient = skill.status === "Proficient";
  const isRemediation = skill.status === "Needs Remediation";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to All Skills</span>
      </button>

      {/* Header Card */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-950/40 via-[#0d1424] to-[#090e1a] p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              {skill.category}
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-1">{skill.title}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Evaluated with strict claim vs empirical verification separation.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold border ${
                isProficient
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : isRemediation
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
              }`}
            >
              Status: {skill.status}
            </span>
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/40">
              Confidence: {skill.confidence.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl bg-black/40 p-5 border border-white/5 text-center">
          <div>
            <span className="text-xs text-slate-400 block">Verified Score</span>
            <span className="text-2xl font-bold font-mono text-white">{skill.verified_score}%</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Target Benchmark</span>
            <span className="text-2xl font-bold font-mono text-indigo-400">75%</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Resume Claim</span>
            <span className="text-2xl font-bold font-mono text-amber-300">{skill.claimed_score}%</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Evidence Records</span>
            <span className="text-2xl font-bold font-mono text-cyan-400">{evidence_history.length}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-300">
            <span className="text-slate-400">Recommended Next Action:</span>{" "}
            <span className="font-semibold text-white">
              {isRemediation
                ? "Complete targeted remediation on Missing Value Detection & Imputation."
                : isProficient
                ? "Maintain competency with applied analytical capstone tasks."
                : "Complete intermediate checkpoint questions to reach 70% benchmark."}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href={`/tutor?topic=${encodeURIComponent(skill.title)}`}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              Ask Tutor
            </Link>
            <Link
              href={`/assessment?skill=${skill.skill_id}&title=${encodeURIComponent(skill.title)}`}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-indigo-500 flex items-center gap-1.5"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Test This Skill</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Evidence History Timeline */}
      <div className="rounded-3xl border border-white/10 bg-[#0d1424] p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="border-b border-white/10 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            Complete Evidence History Ledger
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Every score change is backed by an auditable diagnostic, checkpoint, or applied task submission.
          </p>
        </div>

        <div className="space-y-4">
          {evidence_history.map((item: any, idx: number) => {
            let detailsObj: any = {};
            try {
              detailsObj = typeof item.details_json === "string" ? JSON.parse(item.details_json) : item.details_json;
            } catch (e) {}

            return (
              <div
                key={item.id || idx}
                className="relative pl-6 border-l-2 border-indigo-500/30 space-y-1 py-1"
              >
                <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-[#090e1a] border-2 border-indigo-400" />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{item.source_title}</span>
                  <span className="text-[11px] text-slate-400">{item.created_at}</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                  <span className="capitalize">Type: {item.evidence_type.replace("_", " ")}</span>
                  <span>•</span>
                  <span>Score: {item.score}%</span>
                  <span>•</span>
                  <span className="capitalize text-cyan-300">Confidence: {item.confidence}</span>
                </div>
                {detailsObj.weaknesses && detailsObj.weaknesses.length > 0 && (
                  <div className="text-[11px] text-rose-400 pt-1">
                    Diagnosed Weaknesses: {detailsObj.weaknesses.join(", ")}
                  </div>
                )}
                {detailsObj.context && (
                  <p className="text-[11px] text-slate-300 italic pt-1">"{detailsObj.context}"</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Learning Resources */}
      {recommended_resources && recommended_resources.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-[#0d1424] p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              Curated Educational Resources (Verified Links)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Authoritative references with zero hallucinations. Every URL is verified.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommended_resources.map((res: any) => (
              <a
                key={res.resource_id}
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/10 bg-[#101728] p-5 space-y-2 hover:border-indigo-500/50 hover:bg-[#131d33] transition-all block group"
              >
                <div className="flex items-center justify-between text-xs text-indigo-400">
                  <span>{res.provider}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {res.title}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-2 border-t border-white/5">
                  <span>{res.resource_type}</span>
                  <span>•</span>
                  <span>{res.duration_minutes}m</span>
                  <span>•</span>
                  <span className="text-emerald-400">{res.source_reliability}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
