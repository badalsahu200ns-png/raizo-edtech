"use client";

import React, { useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface NodeDetail {
  id: string;
  stageNumber: string;
  title: string;
  subtitle: string;
  metric: string;
  metricLabel: string;
  status: "verified" | "active" | "target" | "focus";
  description: string;
  items: string[];
}

const NODES: NodeDetail[] = [
  {
    id: "goal",
    stageNumber: "01",
    title: "Career Goal",
    subtitle: "Target Objective",
    metric: "Data Analyst",
    metricLabel: "Pathway Track",
    status: "target",
    description: "Target enterprise analytical role requiring SQL, Python, and storytelling competencies.",
    items: ["Junior to Mid Data Analyst", "Analytics Engineer Track", "Business Intelligence Specialist"]
  },
  {
    id: "required",
    stageNumber: "02",
    title: "Required Skills",
    subtitle: "Role Benchmark",
    metric: "12 Skills",
    metricLabel: "Market Standard",
    status: "verified",
    description: "Evaluated against 1,200+ verified production job descriptions and competency models.",
    items: ["SQL Window Functions", "Pandas Data Cleaning", "Descriptive Statistics", "Power BI Dashboards"]
  },
  {
    id: "current",
    stageNumber: "03",
    title: "Current Skills",
    subtitle: "Demonstrated State",
    metric: "8 Verified",
    metricLabel: "68% Coverage",
    status: "verified",
    description: "Competencies backed by assessment checkpoints, applied code, or project submissions.",
    items: ["SQL Fundamentals (88%)", "SQL Joins (82%)", "Python Basics (74%)", "Data Visualization (68%)"]
  },
  {
    id: "gaps",
    stageNumber: "04",
    title: "Skill Gaps",
    subtitle: "Prerequisite Friction",
    metric: "2 Critical",
    metricLabel: "Target Gaps",
    status: "focus",
    description: "Specific prerequisite bottlenecks currently preventing full role readiness.",
    items: ["SQL Window Functions (Missing)", "Pandas Missing Value Imputation (Needs Remediation)"]
  },
  {
    id: "actions",
    stageNumber: "05",
    title: "Learning Actions",
    subtitle: "Adaptive Roadmap",
    metric: "3 Actions",
    metricLabel: "Scheduled Today",
    status: "active",
    description: "Dynamically prioritized exercises curated to resolve identified prerequisite gaps.",
    items: ["Window Function Socratic Tutor", "Applied Partitioning Sandbox", "Diagnostic Milestone Checkpoint"]
  },
  {
    id: "evidence",
    stageNumber: "06",
    title: "Evidence",
    subtitle: "Empirical Proof",
    metric: "5 Records",
    metricLabel: "Audit Trail",
    status: "verified",
    description: "Permanent verification ledger entries signed cryptographically with deterministic grading.",
    items: ["Project: Customer Churn (84%)", "Diagnostic: SQL Sets (100%)", "Checkpoint: Data Cleaning (85%)"]
  },
  {
    id: "readiness",
    stageNumber: "07",
    title: "Career Readiness",
    subtitle: "Verified Progress",
    metric: "72%",
    metricLabel: "Role Readiness",
    status: "target",
    description: "Empirically calculated probability of job competency based on verified proof.",
    items: ["Target threshold: 70%", "Readiness pacing: +14% this month", "Certificate eligibility: Active"]
  }
];

export default function RaizoSkillGraph({ className = "" }: { className?: string }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("gaps");
  const selectedNode = NODES.find((n) => n.id === selectedNodeId) || NODES[3];

  return (
    <div className={`rounded-xl border border-[#27303B] bg-[#151B23] p-5 space-y-4 shadow-sm ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#27303B] pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5B8DEF]">
              THE RAIZO SKILL GRAPH
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#5B8DEF]/15 text-[#5B8DEF] border border-[#5B8DEF]/20">
              Interactive Architecture
            </span>
          </div>
          <p className="text-xs text-[#B4BDC8] mt-0.5">
            How Raizo turns claimed competencies into verified career progression
          </p>
        </div>
        <span className="text-[11px] text-[#7E8996] font-medium hidden sm:inline">
          Click any stage to inspect live telemetry
        </span>
      </div>

      {/* Horizontal Flow Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
        {NODES.map((node, index) => {
          const isSelected = selectedNodeId === node.id;
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className={`flex flex-col text-left p-3 rounded-lg border transition-all text-xs relative cursor-pointer ${
                isSelected
                  ? "border-[#5B8DEF] bg-[#1A212B] shadow-sm ring-1 ring-[#5B8DEF]"
                  : "border-[#27303B] bg-[#11161D] hover:border-[#5B8DEF]/40 hover:bg-[#151B23]"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-mono font-bold text-[#7E8996]">
                  {node.stageNumber}
                </span>
                {node.status === "focus" && (
                  <span className="h-2 w-2 rounded-full bg-[#F2B84B]" title="Critical Priority" />
                )}
                {node.status === "active" && (
                  <span className="h-2 w-2 rounded-full bg-[#5B8DEF] animate-pulse" title="Active Focus" />
                )}
                {node.status === "verified" && (
                  <span className="h-2 w-2 rounded-full bg-[#36C98F]" title="Verified" />
                )}
                {node.status === "target" && (
                  <span className="h-2 w-2 rounded-full bg-[#7C6CF2]" title="Target Milestone" />
                )}
              </div>

              <span className="font-bold text-[#F5F7FA] text-[11px] truncate block">
                {node.title}
              </span>
              <span className="text-[10px] text-[#B4BDC8] truncate block">
                {node.subtitle}
              </span>

              <div className="mt-2 pt-1.5 border-t border-[#27303B] flex items-baseline justify-between">
                <span className="font-extrabold text-[12px] text-[#F5F7FA]">
                  {node.metric}
                </span>
                {index < NODES.length - 1 && (
                  <ArrowRight className="h-2.5 w-2.5 text-[#7E8996] hidden lg:inline" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail Inspector */}
      <div className="rounded-lg bg-[#11161D] border border-[#27303B] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#151B23] text-[#5B8DEF] border border-[#27303B]">
              Stage {selectedNode.stageNumber}
            </span>
            <h4 className="text-sm font-bold text-[#F5F7FA]">
              {selectedNode.title}: {selectedNode.metric} ({selectedNode.metricLabel})
            </h4>
          </div>
          <p className="text-xs text-[#B4BDC8] max-w-2xl leading-relaxed">
            {selectedNode.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {selectedNode.items.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2 py-1 rounded bg-[#151B23] border border-[#27303B] text-[11px] font-medium text-[#F5F7FA]"
            >
              <CheckCircle2 className="h-3 w-3 text-[#36C98F] mr-1 shrink-0" />
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
