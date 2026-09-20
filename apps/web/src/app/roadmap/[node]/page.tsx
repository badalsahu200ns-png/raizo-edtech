"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  GitBranch,
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  Brain,
  FileCheck2,
  ExternalLink
} from "lucide-react";
import { api } from "@/lib/api";
import { RoadmapDAG, RoadmapNode } from "@/lib/types";

export default function RoadmapNodePage({
  params
}: {
  params: Promise<{ node: string }>;
}) {
  const resolvedParams = use(params);
  const nodeId = resolvedParams.node;

  const [dag, setDag] = useState<RoadmapDAG | null>(null);
  const [node, setNode] = useState<RoadmapNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNode() {
      try {
        setIsLoading(true);
        const res = await api.getRoadmap();
        setDag(res);
        const found = res.nodes.find((n) => n.id === nodeId || n.id.toLowerCase() === nodeId.toLowerCase());
        setNode(found || null);
      } catch (err) {
        console.error("Failed to load node:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadNode();
  }, [nodeId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading roadmap milestone details...
      </div>
    );
  }

  if (!node) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Milestone Node Not Found</h2>
        <p className="text-xs text-slate-400">The requested roadmap milestone node ({nodeId}) does not exist in the active DAG.</p>
        <Link
          href="/roadmap"
          className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Roadmap DAG</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/roadmap"
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Interactive DAG Canvas</span>
      </Link>

      {/* Header Card */}
      <div className="rounded-3xl border border-white/10 bg-[#0d1424] p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 text-xs font-semibold">
            {node.week_assigned ? `Week ${node.week_assigned} • ` : ""}
            {node.estimated_duration_minutes ? `${Math.round(node.estimated_duration_minutes / 60)}h Estimated` : "Estimated 2h"}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              node.status === "completed" || (node.status as string) === "COMPLETED"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : node.status === "in_progress" || (node.status as string) === "IN_PROGRESS"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse"
                : node.status === "needs_remediation"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-slate-800 text-slate-400 border border-white/10"
            }`}
          >
            {node.status}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          {node.title}
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed">
          {node.description}
        </p>

        {node.learning_objective && (
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Bloom&apos;s Learning Objective
            </h4>
            <p className="text-xs text-slate-300 bg-[#151B23]/[0.02] p-3 rounded-xl border border-white/5">
              {node.learning_objective}
            </p>
          </div>
        )}
      </div>

      {/* Prerequisites & Dependencies */}
      <div className="rounded-3xl border border-white/10 bg-[#0d1424] p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
          <GitBranch className="h-4 w-4 text-cyan-400" />
          <span>Topological Prerequisites</span>
        </h3>

        {node.prerequisites && node.prerequisites.length > 0 ? (
          <div className="space-y-2">
            {node.prerequisites.map((prereqId) => {
              const prereqNode = dag?.nodes.find((n) => n.id === prereqId);
              const isPrereqDone = prereqNode?.status === "completed" || (prereqNode?.status as string) === "COMPLETED";
              return (
                <div
                  key={prereqId}
                  className="rounded-xl border border-white/5 bg-[#060a12] p-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2">
                    {isPrereqDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Lock className="h-4 w-4 text-slate-500" />
                    )}
                    <span className="text-white font-medium">
                      {prereqNode?.title || prereqId}
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px]">
                    Status: {prereqNode?.status || "LOCKED"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            No upstream dependencies. This is a foundational root node in the learning graph.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Link
          href={`/assessment?skill=${encodeURIComponent(node.skill_id || "")}`}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-2.5 text-xs font-semibold text-white hover:opacity-95 transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
        >
          <FileCheck2 className="h-4 w-4" />
          <span>Launch Checkpoint Assessment</span>
        </Link>

        <Link
          href={`/tutor?topic=${encodeURIComponent(node.title)}`}
          className="rounded-xl border border-white/10 bg-[#151B23]/5 px-5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-[#151B23]/10 transition-colors flex items-center space-x-2"
        >
          <Brain className="h-4 w-4 text-indigo-400" />
          <span>Consult Socratic Tutor</span>
        </Link>
      </div>
    </div>
  );
}
