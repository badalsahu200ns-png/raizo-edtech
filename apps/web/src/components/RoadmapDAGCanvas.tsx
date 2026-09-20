"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileCheck2
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
        color: "bg-[#E86A6A]/10 text-[#E86A6A] border-[#E86A6A]/30",
        icon: AlertTriangle
      };
    }
    switch (node.status) {
      case "passed":
      case "completed":
        return {
          label: "Milestone Verified",
          color: "bg-[#36C98F]/10 text-[#36C98F] border-[#36C98F]/30",
          icon: CheckCircle2
        };
      case "in_progress":
      case "available":
        return {
          label: "Unlocked & Ready",
          color: "bg-[#5B8DEF]/10 text-[#5B8DEF] border-[#5B8DEF]/30",
          icon: Unlock
        };
      case "needs_remediation":
        return {
          label: "Needs Remediation",
          color: "bg-[#F2B84B]/10 text-[#F2B84B] border-[#F2B84B]/30",
          icon: AlertTriangle
        };
      default:
        return {
          label: "Prerequisites Locked",
          color: "bg-[#1A212B] text-[#7E8996] border-[#27303B]",
          icon: Lock
        };
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#27303B] pb-3">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[#B4BDC8] font-medium">Filter Nodes:</span>
          {["all", "available", "remediation", "passed", "locked"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === f
                  ? "bg-[#5B8DEF] text-white shadow-sm"
                  : "bg-[#151B23] border border-[#27303B] text-[#B4BDC8] hover:text-[#F5F7FA]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 text-xs text-[#B4BDC8]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#36C98F]" /> Verified
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#5B8DEF]" /> Ready
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#E86A6A]" /> Remediation
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#27303B]" /> Locked
          </span>
        </div>
      </div>

      {/* DAG Grid */}
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
              className={`group relative rounded-xl border p-5 transition-all cursor-pointer flex flex-col justify-between shadow-sm ${
                isRemediation
                  ? "border-[#E86A6A]/40 bg-[#151B23]"
                  : isSelected
                  ? "border-[#5B8DEF] bg-[#1A212B] ring-1 ring-[#5B8DEF]"
                  : node.status === "passed"
                  ? "border-[#36C98F]/30 bg-[#151B23] hover:border-[#36C98F]"
                  : node.status === "available"
                  ? "border-[#5B8DEF]/30 bg-[#151B23] hover:border-[#5B8DEF]"
                  : "border-[#27303B] bg-[#11161D] opacity-75 hover:opacity-100"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold text-[#5B8DEF] uppercase tracking-wider truncate">
                    {node.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${badge.color}`}
                  >
                    <BadgeIcon className="h-3 w-3" />
                    {badge.label}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#F5F7FA] group-hover:text-[#5B8DEF] transition-colors leading-snug">
                  {node.title}
                </h4>

                <div className="mt-2.5 rounded-lg bg-[#11161D] p-2.5 border border-[#27303B] text-xs text-[#B4BDC8]">
                  <span className="text-[10px] uppercase font-bold text-[#F5F7FA] block mb-0.5">
                    Objective:
                  </span>
                  <p className="leading-relaxed line-clamp-2">{node.learning_objective}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#27303B] flex items-center justify-between text-xs text-[#7E8996]">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#7E8996]" />
                    {node.estimated_duration_minutes}m
                  </span>
                  {node.score !== null && node.score !== undefined && (
                    <span className="font-mono font-bold text-[#5B8DEF]">
                      {node.score}%
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  {node.status === "available" || node.status === "needs_remediation" ? (
                    <Link
                      href={`/assessment?skill=${node.skill_id}&node=${node.id}&title=${encodeURIComponent(node.title)}`}
                      className="flex items-center gap-1 rounded-lg bg-[#5B8DEF] hover:bg-[#719DF5] px-2.5 py-1 text-[11px] font-bold text-white transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FileCheck2 className="h-3 w-3" />
                      Take Checkpoint
                    </Link>
                  ) : node.status === "passed" ? (
                    <span className="flex items-center gap-1 text-[#36C98F] text-[11px] font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Passed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[#7E8996] text-[11px]">
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
