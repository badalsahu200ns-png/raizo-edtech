"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  GitBranch,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";

export default function ResultsPage() {
  const [submissions, setSubmissions] = useState<any[]>([
    {
      id: "sub_1",
      title: "Applied Data Cleaning & Preprocessing Checkpoint",
      skill: "Pandas Data Cleaning",
      score: 42,
      threshold: "Needs Remediation",
      date: "Today",
      feedback: "Imputation logic failed to address missing values appropriately. Remediation node was autonomously spliced into the DAG.",
      adaptation_triggered: true
    },
    {
      id: "sub_2",
      title: "Relational SQL Querying Diagnostic",
      skill: "SQL Fundamentals",
      score: 74,
      threshold: "Proficient",
      date: "Yesterday",
      feedback: "Solid command of WHERE clauses and multi-table filtering.",
      adaptation_triggered: false
    }
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-[#27303B] pb-4">
        <div className="flex items-center space-x-2 text-[#5B8DEF] text-xs font-bold uppercase tracking-wider">
          <FileCheck2 className="h-4 w-4" />
          <span>Evaluation Ledger & Checkpoint Audit</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] mt-1">
          Assessment & Evaluation Results
        </h1>
        <p className="text-xs text-[#B4BDC8] mt-1">
          Deterministic 4-tier rubric scores, adaptation triggers, and evidence audit history.
        </p>
      </div>

      <div className="space-y-4">
        {submissions.map((sub) => (
          <div
            key={sub.id}
            className={`rounded-xl border p-6 shadow-sm space-y-4 ${
              sub.adaptation_triggered
                ? "border-[#B84A4A]/30 bg-[#FFFDFD]"
                : "border-[#27303B] bg-[#151B23]"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-[#5B8DEF] font-bold uppercase tracking-wider">
                  {sub.skill}
                </span>
                <h3 className="text-base font-bold text-[#F5F7FA]">{sub.title}</h3>
              </div>

              <div className="flex items-center space-x-3">
                <span
                  className={`text-2xl font-extrabold font-mono ${
                    sub.score >= 70
                      ? "text-[#36C98F]"
                      : sub.score >= 50
                      ? "text-[#5B8DEF]"
                      : "text-[#E86A6A]"
                  }`}
                >
                  {sub.score}%
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded ${
                    sub.score >= 70
                      ? "bg-[#5B8DEF]/10 text-[#36C98F]"
                      : "bg-[#FBEAEB] text-[#E86A6A]"
                  }`}
                >
                  {sub.threshold}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#B4BDC8] leading-relaxed bg-[#11161D] p-3 rounded-lg border border-[#27303B]">
              {sub.feedback}
            </p>

            <div className="pt-2 border-t border-[#27303B] flex items-center justify-between text-xs">
              <span className="text-[#7E8996]">{sub.date}</span>
              <div className="flex items-center space-x-3">
                <Link
                  href="/roadmap"
                  className="text-xs font-bold text-[#5B8DEF] hover:underline flex items-center gap-1"
                >
                  <span>Inspect Roadmap</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
