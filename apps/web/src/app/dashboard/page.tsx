"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  Sparkles,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Award,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
  Zap,
  Target
} from "lucide-react";
import { api } from "@/lib/api";
import { RoadmapDAG, RoadmapNode, LearnerSkill, EvidenceItem, GapMatrix } from "@/lib/types";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<RoadmapDAG | null>(null);
  const [gaps, setGaps] = useState<GapMatrix | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const [profileRes, roadmapRes, gapsRes, evidenceRes] = await Promise.all([
          api.getProfile(),
          api.getRoadmap(),
          api.getGaps(),
          api.getEvidence()
        ]);
        setProfile(profileRes.user);
        setRoadmap(roadmapRes);
        setGaps(gapsRes);
        setEvidenceList(evidenceRes.evidence || []);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Find active node or remediation node
  const activeNode = roadmap?.nodes.find((n) => n.is_remediation) ||
    roadmap?.nodes.find((n) => n.status === "available" || n.status === "in_progress") ||
    roadmap?.nodes[0];

  const overallScore = gaps?.overall_readiness_score ?? 67;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. HERO HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-950/40 via-[#0e1628] to-cyan-950/30 p-6 sm:p-8 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Target Role: {profile?.target_role === "data_analyst" ? "Data Analyst" : "Analytics Professional"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Welcome back, {profile?.name || "Alex Rivera"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Your learning path is dynamically steered by evidence. Every assessment changes your topological prerequisite DAG in real time.
          </p>
        </div>

        {/* Competency Readiness Gauge */}
        <div className="flex items-center space-x-4 rounded-2xl border border-white/10 bg-[#090d16]/80 p-4 shadow-inner">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <svg className="h-20 w-20 -rotate-90">
              <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" className="text-slate-800" fill="transparent" />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray="201"
                strokeDashoffset={201 - (201 * overallScore) / 100}
                strokeLinecap="round"
                className="text-cyan-400 transition-all duration-1000"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-bold text-white leading-none">{overallScore}%</span>
              <span className="text-[9px] uppercase font-semibold text-slate-400 mt-0.5">Readiness</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              Role Readiness Estimate
              <span className="rounded bg-indigo-500/20 text-indigo-300 text-[9px] px-1.5 py-0.5">Empirical</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-tight">
              AI-assisted estimate grounded in verified evidence. Not a guaranteed job offer.
            </p>
          </div>
        </div>
      </div>

      {/* 2. NEXT BEST ACTION BANNER (The Core Highlight!) */}
      {activeNode && (
        <div className={`rounded-2xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-xl ${
          activeNode.is_remediation
            ? "border-rose-500/60 bg-gradient-to-r from-rose-950/40 via-[#101424] to-[#0a101d]"
            : "border-indigo-500/40 bg-gradient-to-r from-indigo-950/30 via-[#0d1526] to-[#0a101d]"
        }`}>
          <div className="flex items-start space-x-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 ${
              activeNode.is_remediation
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse"
                : "bg-indigo-500/20 text-cyan-400 border border-indigo-500/40"
            }`}>
              {activeNode.is_remediation ? <AlertTriangle className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Next Best Action</span>
                {activeNode.is_remediation && (
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/40">
                    Remediation Required
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {activeNode.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {activeNode.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href={`/tutor?topic=${encodeURIComponent(activeNode.title)}`}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors"
            >
              Ask Raizo Tutor
            </Link>
            <Link
              href={`/assessment?skill=${activeNode.skill_id}&node=${activeNode.id}&title=${encodeURIComponent(activeNode.title)}`}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:from-indigo-500 hover:to-cyan-400 transition-all flex items-center gap-1.5"
            >
              <span>{activeNode.is_remediation ? "Start Remediation Checkpoint" : "Launch Activity"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. FOUR KEY METRIC TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verified Skills</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {gaps?.proficient_count ?? 2} <span className="text-xs text-slate-400 font-normal">Proficient</span>
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +11% velocity this sprint
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Developing / Partial</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {gaps?.partial_count ?? 3} <span className="text-xs text-slate-400 font-normal">In Progress</span>
          </div>
          <p className="text-[11px] text-slate-400">Targeting 70% threshold</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Needs Remediation</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {gaps?.missing_count ?? 2} <span className="text-xs text-slate-400 font-normal">Gaps</span>
          </div>
          <p className="text-[11px] text-amber-300">Prerequisite weaknesses detected</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Study Velocity</span>
            <Clock className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            6.5 / 8.0 <span className="text-xs text-slate-400 font-normal">Hrs/Wk</span>
          </div>
          <p className="text-[11px] text-indigo-400">4-Day Learning Streak 🔥</p>
        </div>
      </div>

      {/* 4. MAIN WORKSPACE SPLIT: DAG Roadmap Preview & Recent Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: DAG Roadmap Preview */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-[#0d1424] p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-indigo-400" />
                Adaptive Learning Path (DAG)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Topological milestone graph with prerequisite dependency locks
              </p>
            </div>
            <Link
              href="/roadmap"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Full Graph View</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {roadmap?.nodes.slice(0, 5).map((node) => (
              <div
                key={node.id}
                className={`flex items-center justify-between rounded-xl border p-3.5 text-xs transition-all ${
                  node.is_remediation
                    ? "border-rose-500/50 bg-rose-950/20"
                    : node.status === "passed"
                    ? "border-emerald-500/30 bg-emerald-950/10"
                    : node.status === "available"
                    ? "border-cyan-500/40 bg-cyan-950/10"
                    : "border-white/5 bg-white/5 opacity-60"
                }`}
              >
                <div className="flex items-center space-x-3">
                  {node.status === "passed" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : node.is_remediation ? (
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                  ) : node.status === "available" ? (
                    <div className="h-3 w-3 rounded-full bg-cyan-400 animate-ping" />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-slate-600" />
                  )}
                  <div>
                    <h4 className="font-bold text-white">{node.title}</h4>
                    <span className="text-[10px] text-slate-400">{node.learning_objective}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-slate-400">{node.estimated_duration_minutes}m</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Recent Evidence Ledger Stream */}
        <div className="rounded-3xl border border-white/10 bg-[#0d1424] p-6 space-y-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  Evidence Ledger
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Audit trail supporting competency scores
                </p>
              </div>
              <Link
                href="/evidence"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                View All
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {evidenceList.slice(0, 4).map((evi) => (
                <div
                  key={evi.id}
                  className="rounded-xl border border-white/5 bg-[#101728] p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white truncate max-w-[170px]">
                      {evi.source_title}
                    </span>
                    <span className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                      evi.confidence === "high"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : evi.confidence === "medium"
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {evi.confidence.toUpperCase()} CONF
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="capitalize">{evi.evidence_type.replace("_", " ")}</span>
                    {evi.score !== null && evi.score !== undefined && (
                      <span className="font-mono text-indigo-300">{evi.score}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <Link
              href="/assessment"
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-white/5 border border-white/10 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <span>Take New Assessment</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
