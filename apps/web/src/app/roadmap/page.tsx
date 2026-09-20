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
  X,
  ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";
import { RoadmapDAG, RoadmapNode } from "@/lib/types";
import RoadmapDAGCanvas from "@/components/RoadmapDAGCanvas";
import { useAuth } from "@/lib/auth";
import { formatSkillName } from "@/lib/skillUtils";

interface JourneyStage {
  step: string;
  title: string;
  module: string;
  objective: string;
  skills: string[];
  duration: string;
  evidenceRequired: string;
  status: "completed" | "active" | "upcoming";
  completionText: string;
  actionText: string;
  actionLink: string;
}

export default function RoadmapPage() {
  const { user } = useAuth();
  const [dag, setDag] = useState<RoadmapDAG | null>(null);
  const [activeTab, setActiveTab] = useState<"journey" | "dag">("journey");
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRoadmap() {
      try {
        setIsLoading(true);
        const res = await api.getRoadmap(user?.id);
        setDag(res);
      } catch (err) {
        console.error("Failed to load roadmap:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRoadmap();
  }, [user?.id]);

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const res = await api.generateRoadmap(user?.id, user?.target_role || "data_analyst");
      setDag(res);
    } catch (err) {
      console.error("Failed to regenerate roadmap:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const stages: JourneyStage[] = [
    {
      step: "01",
      title: "DIAGNOSE",
      module: "Data Analyst Diagnostic Benchmark",
      objective: "Map demonstrated capabilities and detect prerequisite friction points.",
      skills: ["SQL Fundamentals", "Python Programming", "Descriptive Statistics"],
      duration: "30 min",
      evidenceRequired: "Diagnostic Checkpoint",
      status: "completed",
      completionText: "Verified (84% score)",
      actionText: "Review Results",
      actionLink: "/results"
    },
    {
      step: "02",
      title: "LEARN",
      module: "Window Functions & Relational Partitioning",
      objective: "Build conceptual mental models of partitioned aggregations and rank assignments.",
      skills: ["SQL Window Functions", "SQL Subqueries & CTEs"],
      duration: "45 min",
      evidenceRequired: "Socratic Dialog",
      status: "completed",
      completionText: "Completed",
      actionText: "Review Concepts",
      actionLink: "/tutor?topic=SQL%20Window%20Functions"
    },
    {
      step: "03",
      title: "PRACTICE",
      module: "SQL Analytics Applied Sandbox",
      objective: "Solve hands-on queries against retail and customer transaction tables.",
      skills: ["SQL Window Functions", "SQL Joins & Relational Sets"],
      duration: "45 min",
      evidenceRequired: "2/4 exercises completed",
      status: "active",
      completionText: "2 / 4 Completed",
      actionText: "Continue Practice",
      actionLink: "/practice"
    },
    {
      step: "04",
      title: "APPLY",
      module: "Pandas Data Cleaning & Median Imputation",
      objective: "Clean messy tabular data and handle missing value distributions.",
      skills: ["Pandas Data Cleaning", "Pandas Data Manipulation"],
      duration: "60 min",
      evidenceRequired: "Applied Script Submission",
      status: "upcoming",
      completionText: "Available Next",
      actionText: "Preview Sandbox",
      actionLink: "/practice"
    },
    {
      step: "05",
      title: "PROVE",
      module: "Customer Churn Analysis Capstone",
      objective: "Synthesize full analytical workflow into a verified portfolio project.",
      skills: ["SQL Analytics", "Python", "Data Visualization", "Business Storytelling"],
      duration: "8 hours",
      evidenceRequired: "Capstone Portfolio Submission",
      status: "upcoming",
      completionText: "Locked until Stage 04",
      actionText: "View Project Brief",
      actionLink: "/projects"
    },
    {
      step: "06",
      title: "ADVANCE",
      module: "Verified Credential & Job Alignment",
      objective: "Claim HMAC-SHA256 verified certificate and match demonstrated competencies with live job postings.",
      skills: ["All 12 Target Competencies"],
      duration: "15 min",
      evidenceRequired: "Readiness ≥ 70%",
      status: "upcoming",
      completionText: "Readiness: 72%",
      actionText: "Check Credential",
      actionLink: "/certificate"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27303B] pb-6">
        <div>
          <div className="raizo-page-eyebrow">
            <span>ADAPTIVE LEARNING PATHWAY</span>
            <span>•</span>
            <span>01 TO 06 PROGRESSION</span>
          </div>
          <h1 className="raizo-page-title">
            Adaptive Learning Roadmap
          </h1>
          <p className="raizo-page-desc">
            A structured vertical progression from diagnostic discovery to applied verification and career advancement.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Tab Toggle */}
          <div className="flex rounded-xl border border-[#27303B] bg-[#151B23] p-1 text-xs shadow-sm">
            <button
              onClick={() => setActiveTab("journey")}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeTab === "journey"
                  ? "bg-[#5B8DEF] text-white"
                  : "text-[#B4BDC8] hover:text-[#F5F7FA]"
              }`}
            >
              Vertical Journey
            </button>
            <button
              onClick={() => setActiveTab("dag")}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeTab === "dag"
                  ? "bg-[#5B8DEF] text-white"
                  : "text-[#B4BDC8] hover:text-[#F5F7FA]"
              }`}
            >
              Topological DAG
            </button>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-[#27303B] bg-[#151B23] text-xs font-semibold text-[#F5F7FA] hover:bg-[#1A212B] transition-colors"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin text-[#5B8DEF]" : ""}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeTab === "journey" ? (
        <div className="space-y-4">
          {stages.map((stage) => {
            const isCompleted = stage.status === "completed";
            const isActive = stage.status === "active";

            return (
              <div
                key={stage.step}
                className={`rounded-xl border p-5 sm:p-6 transition-all shadow-sm ${
                  isActive
                    ? "border-[#5B8DEF] bg-[#151B23] ring-1 ring-[#176B5B]"
                    : isCompleted
                    ? "border-[#27303B] bg-[#151B23]"
                    : "border-[#27303B] bg-[#11161D] opacity-80"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#1A212B] text-[#F5F7FA]">
                        {stage.step} — {stage.title}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        isCompleted
                          ? "bg-[#5B8DEF]/10 text-[#36C98F]"
                          : isActive
                          ? "bg-[#5B8DEF] text-white"
                          : "bg-[#1A212B] text-[#B4BDC8]"
                      }`}>
                        {stage.completionText}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#F5F7FA]">
                      {stage.module}
                    </h3>
                    <p className="text-xs text-[#B4BDC8] leading-relaxed">
                      {stage.objective}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] font-semibold text-[#F5F7FA] flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#B4BDC8]" />
                        {stage.duration}
                      </span>
                      <span className="text-[#DDE1DD]">•</span>
                      <div className="flex flex-wrap gap-1">
                        {stage.skills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1A212B] text-[#F5F7FA] border border-[#27303B]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Link
                      href={stage.actionLink}
                      className={`inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        isActive
                          ? "bg-[#5B8DEF] text-white hover:bg-[#4779D8]"
                          : isCompleted
                          ? "bg-[#151B23] border border-[#27303B] text-[#F5F7FA] hover:bg-[#1A212B]"
                          : "bg-[#1A212B] text-[#B4BDC8] hover:bg-[#DDE1DD]"
                      }`}
                    >
                      <span>{stage.actionText}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#27303B] bg-[#151B23] p-5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5B8DEF] block mb-2">
              Topological Dependency Graph
            </span>
            <RoadmapDAGCanvas
              nodes={dag?.nodes || []}
              onSelectNode={(node) => setSelectedNode(node)}
              selectedNodeId={selectedNode?.id}
            />
          </div>
        </div>
      )}
    </div>
  );
}
