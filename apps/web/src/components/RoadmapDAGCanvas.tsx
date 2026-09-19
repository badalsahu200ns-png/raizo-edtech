"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  FileCheck2,
  Info
} from "lucide-react";
import { RoadmapNode } from "@/lib/types";

interface RoadmapDAGCanvasProps {
  nodes: RoadmapNode[];
  onSelectNode?: (node: RoadmapNode) => void;
  selectedNodeId?: string;
}

export default function RoadmapDAGCanvas({
  nodes,
  onSelectNode,
  selectedNodeId
}: RoadmapDAGCanvasProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredNodes = nodes.filter((n) => {
    if (filter === "remediation") return n.is_remediation;
    if (filter === "available") return n.status === "available" || n.status === "in_progress";
    if (filter === "passed") return n.status === "passed" || n.status === "completed";
    if (filter === "locked") return n.status === "locked";
    return true;
  });

  const getStatusBadge = (node: RoadmapNode) => {
    if (node.is_remediation) {
      return {
        label: "Remediation Inserted",
        color: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        icon: AlertTriangle
      };
    }
    switch (node.status) {
      case "passed":
      case "completed":
        return {
          label: "Milestone Verified",
          color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          icon: CheckCircle2
        };
      case "in_progress":
      case "available":
        return {
          label: "Unlocked & Ready",
          color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
          icon: Unlock
        };
      case "needs_remediation":
        return {
          label: "Needs Remediation",
          color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          icon: AlertTriangle
        };
      default:
        return {
          label: "Prerequisites Locked",
          color: "bg-slate-700/30 text-slate-400 border-slate-700/50",
          icon: Lock
        };
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">Filter Nodes:</span>
          {["all", "available", "remediation", "passed", "locked"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Passed
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> Available
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400 animate-ping" /> Remediation
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-600" /> Locked
          </span>
        </div>
      </div>

      {/* DAG Interactive Grid / Visual Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNodes.map((node) => {
          const badge = getStatusBadge(node);
          const BadgeIcon = badge.icon;
          const isSelected = selectedNodeId === node.id;
          const isRemediation = node.is_remediation;

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode && onSelectNode(node)}
              className={`group relative rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
                isRemediation
                  ? "border-rose-500/60 bg-gradient-to-br from-rose-950/40 via-[#101424] to-[#0d1220] shadow-lg shadow-rose-950/40"
                  : isSelected
                  ? "border-indigo-500 bg-indigo-950/30 shadow-xl shadow-indigo-950/50 scale-[1.02]"
                  : node.status === "passed"
                  ? "border-emerald-500/30 bg-[#0d1624] hover:border-emerald-500/50"
                  : node.status === "available"
                  ? "border-cyan-500/40 bg-[#0e1728] hover:border-cyan-400/70"
                  : "border-white/5 bg-[#090d16]/80 opacity-70 hover:opacity-100 hover:border-white/15"
              }`}
            >
              {/* Category & Status */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider truncate">
                    {node.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.color}`}
                  >
                    <BadgeIcon className="h-3 w-3" />
                    {badge.label}
                  </span>
                </div>

                {/* Node Title */}
                <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {node.title}
                </h4>

                {/* Learning Objective (Bloom's Taxonomy) */}
                <div className="mt-2.5 rounded-lg bg-black/30 p-2.5 border border-white/5 text-xs text-slate-300">
                  <span className="text-[10px] uppercase font-bold text-indigo-300 block mb-0.5">
                    Objective (Bloom's Taxonomy):
                  </span>
                  <p className="leading-relaxed line-clamp-2">{node.learning_objective}</p>
                </div>
              </div>

              {/* Node Footer Info */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    {node.estimated_duration_minutes}m
                  </span>
                  {node.score !== null && node.score !== undefined && (
                    <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                      Score: {node.score}%
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  {node.status === "available" || node.status === "needs_remediation" ? (
                    <Link
                      href={`/assessment?skill=${node.skill_id}&node=${node.id}&title=${encodeURIComponent(node.title)}`}
                      className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-2.5 py-1 text-[11px] font-bold text-white shadow hover:from-indigo-500 hover:to-cyan-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FileCheck2 className="h-3.5 w-3.5" />
                      Take Checkpoint
                    </Link>
                  ) : node.status === "passed" ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Passed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <Lock className="h-3 w-3" /> Locked
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
