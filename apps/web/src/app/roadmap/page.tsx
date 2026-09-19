"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GitBranch,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  FileCheck2,
  X
} from "lucide-react";
import { api } from "@/lib/api";
import { RoadmapDAG, RoadmapNode, WeeklyPlan } from "@/lib/types";
import RoadmapDAGCanvas from "@/components/RoadmapDAGCanvas";

export default function RoadmapPage() {
  const [dag, setDag] = useState<RoadmapDAG | null>(null);
  const [activeTab, setActiveTab] = useState<"dag" | "schedule">("dag");
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRoadmap() {
      try {
        setIsLoading(true);
        const res = await api.getRoadmap();
        setDag(res);
      } catch (err) {
        console.error("Failed to load roadmap:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRoadmap();
  }, []);

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const res = await api.generateRoadmap("demo_learner_alex", "data_analyst");
      setDag(res);
    } catch (err) {
      console.error("Failed to regenerate roadmap:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading || !dag) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4" />
        Calculating topological prerequisite DAG...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Prerequisite-Aware Topology
            </span>
            <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
              Directed Acyclic Graph (DAG)
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Personalized Learning Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Nodes have explicit prerequisite dependencies. Advanced concepts unlock only when predecessor competencies are verified.
          </p>
        </div>

        {/* View Toggles & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
            <button
              onClick={() => setActiveTab("dag")}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeTab === "dag"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>DAG Milestones</span>
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeTab === "schedule"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Weekly Schedule</span>
            </button>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            title="Recompute topological DAG based on updated weekly hours and verified competencies"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>Recompute DAG</span>
          </button>
        </div>
      </div>

      {/* Progress & Milestone Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-4">
          <span className="text-xs text-slate-400 block">DAG Completion</span>
          <span className="text-2xl font-bold font-mono text-cyan-400">{dag.completion_percentage}%</span>
          <div className="h-1.5 w-full rounded-full bg-slate-800 mt-2 overflow-hidden">
            <div className="h-full rounded-full bg-cyan-400 transition-all duration-700" style={{ width: `${dag.completion_percentage}%` }} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-4">
          <span className="text-xs text-slate-400 block">Total Milestones</span>
          <span className="text-2xl font-bold font-mono text-white">{dag.total_nodes_count}</span>
          <span className="text-[11px] text-slate-500 block mt-1">{dag.completed_nodes_count} Verified</span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-4">
          <span className="text-xs text-slate-400 block">Target Timeline</span>
          <span className="text-2xl font-bold font-mono text-white">{dag.target_timeline_months} Months</span>
          <span className="text-[11px] text-indigo-300 block mt-1">Structured Path</span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-4">
          <span className="text-xs text-slate-400 block">Pace Allocation</span>
          <span className="text-2xl font-bold font-mono text-white">{dag.weekly_hours_available} Hrs/Wk</span>
          <span className="text-[11px] text-emerald-400 block mt-1">Configured</span>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE DAG VISUALIZATION */}
      {activeTab === "dag" && (
        <RoadmapDAGCanvas
          nodes={dag.nodes}
          selectedNodeId={selectedNode?.id}
          onSelectNode={(node) => setSelectedNode(node)}
        />
      )}

      {/* TAB 2: PERSONALIZED WEEKLY SCHEDULE */}
      {activeTab === "schedule" && (
        <div className="space-y-6">
          {dag.weekly_plans.map((week) => (
            <div
              key={week.week_number}
              className="rounded-3xl border border-white/10 bg-[#0d1424] p-6 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="rounded-xl bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow">
                    Week {week.week_number}
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Focus: {week.focus_skills.map((s) => s.replace("_", " ").toUpperCase()).join(", ")}
                  </h3>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 rounded-lg px-2.5 py-1">
                  {week.total_hours} Hours Allocated
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {week.days.map((daySlot) => (
                  <div
                    key={daySlot.day}
                    className="rounded-2xl border border-white/5 bg-[#101728] p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                      <span>{daySlot.day}</span>
                      <span className="text-slate-400 font-normal">{daySlot.total_minutes} min</span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {daySlot.nodes.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => setSelectedNode(n)}
                          className="rounded-lg bg-white/5 p-2 text-xs hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <div className="font-semibold text-white truncate">{n.title}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{n.learning_objective}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Node Inspector Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl border border-white/15 bg-[#0b101e] p-6 text-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  {selectedNode.category}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{selectedNode.title}</h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Description & Objective */}
            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedNode.description}
              </p>

              <div className="rounded-xl bg-black/40 p-3.5 border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase text-indigo-300">
                  Actionable Objective (Bloom's Taxonomy):
                </span>
                <p className="text-xs text-white leading-relaxed">{selectedNode.learning_objective}</p>
              </div>
            </div>

            {/* Prerequisites */}
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">Prerequisite Dependencies:</span>
              {selectedNode.prerequisites.length === 0 ? (
                <span className="text-xs text-emerald-400">None (Foundational Entrypoint)</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.prerequisites.map((p) => (
                    <span
                      key={p}
                      className="rounded-lg bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 text-xs text-indigo-300 font-mono"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <Link
                href={`/tutor?topic=${encodeURIComponent(selectedNode.title)}`}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                Learn with Raizo Tutor
              </Link>

              {selectedNode.status === "available" || selectedNode.status === "needs_remediation" ? (
                <Link
                  href={`/assessment?skill=${selectedNode.skill_id}&node=${selectedNode.id}&title=${encodeURIComponent(selectedNode.title)}`}
                  className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2 text-xs font-bold text-white shadow hover:opacity-90"
                >
                  <FileCheck2 className="h-4 w-4" />
                  <span>Launch Assessment</span>
                </Link>
              ) : selectedNode.status === "passed" ? (
                <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="h-4 w-4" /> Verified Milestone
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                  <Lock className="h-4 w-4" /> Locked by Prerequisites
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
