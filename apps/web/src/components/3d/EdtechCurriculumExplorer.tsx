"use client";

import React, { useState } from "react";
import { BookOpen, Database, Code, BarChart2, Award, Clock, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import Card3DTilt from "./Card3DTilt";

interface CurriculumTrack {
  id: string;
  name: string;
  badge: string;
  icon: any;
  color: string;
  duration: string;
  modulesCount: number;
  description: string;
  modules: {
    title: string;
    time: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    actionLink: string;
  }[];
}

export default function EdtechCurriculumExplorer() {
  const tracks: CurriculumTrack[] = [
    {
      id: "sql",
      name: "SQL & Relational Warehousing",
      badge: "Core Prerequisite",
      icon: Database,
      color: "#38BDF8",
      duration: "18 Hours",
      modulesCount: 6,
      description: "Master multi-table relational joins, CTEs, aggregation hierarchies, and partitioning with window functions (ROW_NUMBER, DENSE_RANK).",
      modules: [
        { title: "Relational Schemas & Multi-Table Joins", time: "25 min", difficulty: "Beginner", actionLink: "/practice" },
        { title: "GROUP BY, Aggregations & Subqueries", time: "30 min", difficulty: "Intermediate", actionLink: "/practice" },
        { title: "Window Functions: ROW_NUMBER & DENSE_RANK", time: "35 min", difficulty: "Intermediate", actionLink: "/tutor?topic=SQL%20Window%20Functions" },
        { title: "Common Table Expressions & Recursive Queries", time: "40 min", difficulty: "Advanced", actionLink: "/practice" }
      ]
    },
    {
      id: "python",
      name: "Python & Pandas Data Wrangling",
      badge: "High Demand",
      icon: Code,
      color: "#34D399",
      duration: "24 Hours",
      modulesCount: 8,
      description: "Automate messy data ingestion, audit missingness, impute outliers, reshape DataFrames, and construct reproducible ETL cleaning pipelines.",
      modules: [
        { title: "DataFrame Indexing & Type Casting", time: "20 min", difficulty: "Beginner", actionLink: "/practice" },
        { title: "Missing Value Auditing & Median Imputation", time: "30 min", difficulty: "Intermediate", actionLink: "/learn/data-lab" },
        { title: "Vectorized Transformations & Group Reshaping", time: "35 min", difficulty: "Intermediate", actionLink: "/practice" },
        { title: "Automated CSV Hygiene & Pipeline Scripting", time: "45 min", difficulty: "Advanced", actionLink: "/learn/data-lab" }
      ]
    },
    {
      id: "statistics",
      name: "Descriptive Statistics & Inference",
      badge: "Analytical Rigor",
      icon: BarChart2,
      color: "#FBBF24",
      duration: "14 Hours",
      modulesCount: 5,
      description: "Distinguish between mean and median for skewed commercial metrics, audit anomalies with IQR, and formulate rigorous A/B hypotheses.",
      modules: [
        { title: "Central Tendency & Skewness Analysis", time: "20 min", difficulty: "Beginner", actionLink: "/learn" },
        { title: "IQR Outlier Boundaries & Boxplots", time: "25 min", difficulty: "Intermediate", actionLink: "/practice" },
        { title: "Hypothesis Testing & p-Value Interpretation", time: "35 min", difficulty: "Advanced", actionLink: "/learn" }
      ]
    },
    {
      id: "bi",
      name: "Executive BI & Dashboarding",
      badge: "Business Impact",
      icon: Award,
      color: "#818CF8",
      duration: "16 Hours",
      modulesCount: 5,
      description: "Design stakeholder-facing dashboards in Power BI and Tableau. Track cohort retention, customer churn velocity, and executive revenue KPIs.",
      modules: [
        { title: "Data Model Architecture & Star Schemas", time: "30 min", difficulty: "Intermediate", actionLink: "/learn" },
        { title: "Cohort Retention & Churn Velocity Curves", time: "35 min", difficulty: "Advanced", actionLink: "/practice" },
        { title: "Executive KPI Deck Presentation", time: "25 min", difficulty: "Intermediate", actionLink: "/projects" }
      ]
    }
  ];

  const [activeTrackId, setActiveTrackId] = useState("sql");
  const activeTrack = tracks.find((t) => t.id === activeTrackId) || tracks[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#38BDF8] block">
            GENUINE CURRICULUM ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
            Industry-Aligned Learning Tracks
          </h2>
        </div>
        <p className="text-xs text-[#94A3B8] max-w-sm">
          Hands-on tracks designed around actual enterprise data stack expectations, not outdated academic theory.
        </p>
      </div>

      {/* Track Tabs */}
      <div className="flex flex-wrap gap-2 pb-2">
        {tracks.map((t) => {
          const isActive = t.id === activeTrackId;
          const IconComponent = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTrackId(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                isActive
                  ? "bg-[#182232] text-[#F5F7FA] border-[#38BDF8] shadow-md shadow-[#38BDF8]/10"
                  : "bg-[#11161D] text-[#94A3B8] border-[#27303B] hover:border-[#38BDF8]/40 hover:text-[#F5F7FA]"
              }`}
            >
              <IconComponent className="h-4 w-4" style={{ color: t.color }} />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Track Overview & Interactive Module Grid (with 3D Tilt) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Track Detail Hero (Left) */}
        <div className="lg:col-span-5">
          <Card3DTilt className="space-y-5 bg-[#121822] border-[#27303B] h-full">
            <div className="flex items-center justify-between">
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: `${activeTrack.color}15`, color: activeTrack.color }}
              >
                {activeTrack.badge}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] font-mono">
                <Clock className="h-3.5 w-3.5" />
                <span>{activeTrack.duration}</span>
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-[#F5F7FA]">
              {activeTrack.name}
            </h3>

            <p className="text-xs sm:text-sm text-[#B4BDC8] leading-relaxed">
              {activeTrack.description}
            </p>

            <div className="pt-4 border-t border-[#27303B] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">Practical Labs:</span>
                <span className="font-mono font-bold text-[#F5F7FA]">{activeTrack.modulesCount} Hands-on Modules</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">Evidence Deliverable:</span>
                <span className="font-mono font-bold text-[#10B981]">Cryptographic Credential</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#38BDF8] text-[#070A0F] text-xs font-bold hover:bg-[#60A5FA] transition-all shadow-md"
              >
                <span>Launch Full Track</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Card3DTilt>
        </div>

        {/* Modules List (Right) */}
        <div className="lg:col-span-7 space-y-3">
          {activeTrack.modules.map((mod, i) => (
            <Card3DTilt
              key={i}
              className="p-4 bg-[#11161D] border-[#27303B] hover:border-[#38BDF8]/50 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#38BDF8]">
                    MODULE 0{i + 1}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      mod.difficulty === "Beginner"
                        ? "bg-[#10B981]/10 text-[#10B981]"
                        : mod.difficulty === "Intermediate"
                        ? "bg-[#38BDF8]/10 text-[#38BDF8]"
                        : "bg-[#FBBF24]/10 text-[#FBBF24]"
                    }`}
                  >
                    {mod.difficulty}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#F5F7FA]">
                  {mod.title}
                </h4>
                <span className="text-[11px] text-[#94A3B8] font-mono flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {mod.time} estimated completion
                </span>
              </div>

              <Link
                href={mod.actionLink}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#18202A] border border-[#27303B] text-xs font-semibold text-[#F5F7FA] hover:bg-[#38BDF8] hover:text-[#070A0F] transition-all shrink-0"
              >
                <span>Start Lab</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Card3DTilt>
          ))}
        </div>
      </div>
    </div>
  );
}
