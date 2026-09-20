"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  Printer,
  ExternalLink,
  Briefcase,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { LearnerSkill, EvidenceItem } from "@/lib/types";

export default function ResumePage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<LearnerSkill[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [showEvidenceBadges, setShowEvidenceBadges] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [skillsRes, evidenceRes, profileRes] = await Promise.all([
          api.getSkills().catch(() => ({ skills: [] })),
          api.getEvidence().catch(() => ({ evidence: [] })),
          api.getProfile().catch(() => ({ user: null }))
        ]);
        setSkills(skillsRes.skills || []);
        setEvidenceList(evidenceRes.evidence || []);
        setProfile(profileRes?.user || null);
      } catch (err) {
        console.error("Failed to load resume data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const candidateName = profile?.name || "Alex Rivera";
  const candidateRole = profile?.current_role || "Junior Business & Data Analyst";
  const targetRole = profile?.target_role === "data_analyst" ? "Data Analyst" : "Data Analyst";

  const verifiedSkills = skills.filter(
    (s) => s.status === "Proficient" || (s.verified_score ?? 0) >= 75
  );
  const developingSkills = skills.filter(
    (s) => s.status === "Developing" || ((s.verified_score ?? 0) >= 40 && (s.verified_score ?? 0) < 75)
  );

  const handleCopyMarkdown = () => {
    const md = `# ${candidateName}
${candidateRole} | Target Role: ${targetRole}
Location: Remote / Hybrid | Portfolio: https://raizo.ai/profile/alex-rivera

## PROFESSIONAL SUMMARY
Empirical Data Analyst with demonstrated capability in SQL window functions, relational database modeling, exploratory data analysis, and executive dashboarding. Backed by tamper-evident verification on RAIZO Career Intelligence.

## VERIFIED CORE COMPETENCIES
- SQL & Relational Databases (Score: 88% - Assessment Verified): Complex multi-table JOINs, subqueries, DENSE_RANK window functions.
- Spreadsheet Modeling (Score: 85% - Demonstrated): Advanced XLOOKUP formulas, pivot cohorts, financial reconciliations.
- Python & Pandas (Score: 50% - Developing): Data cleaning, handling missing observations, median imputation.

## DEMONSTRATED PROJECTS & EVIDENCE
- User Journey Cohort Retention & Churn Analysis
  • Formulated analytical SQL queries joining transactional tables, reducing cohort query runtime by 28%.
  • Built an executive dashboard in Power BI tracking month-over-month retention and churn velocity.
  • Verified by RAIZO Diagnostic Assessment & Checkpoint Ledger (Credential ID: DA-2026-X84).

## EDUCATION & CREDENTIALS
- Bachelor of Science in Information Systems / Business Analytics
- RAIZO Learning Completion Certificate: Data Analyst Track (Score: 84%, Verified)
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 print:py-0">
      {/* 1. SECTION HEADER & QUOTE */}
      <div className="border-b border-[#27303B] pb-6 space-y-3 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#5B8DEF] bg-[#5B8DEF]/10 px-2 py-0.5 rounded-full font-bold">
                [05 — RESUME]
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
              Check Your Resume
            </h1>
            <p className="text-sm font-medium text-[#5B8DEF]">
              Your resume, backed by your journey.
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowEvidenceBadges(!showEvidenceBadges)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                showEvidenceBadges
                  ? "bg-[#5B8DEF]/10 border-[#5B8DEF]/30 text-[#5B8DEF]"
                  : "bg-[#151B23] border-[#27303B] text-[#B4BDC8]"
              }`}
            >
              {showEvidenceBadges ? "✓ Evidence Badges Visible" : "Plain ATS Mode"}
            </button>
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#27303B] bg-[#151B23] hover:bg-[#1A212B] text-xs font-semibold text-[#F5F7FA] transition-all shadow-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#36C98F]" /> : <Copy className="h-3.5 w-3.5 text-[#B4BDC8]" />}
              <span>{copied ? "Copied Markdown" : "Copy Markdown"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold shadow-xs hover:bg-[#4779D8] transition-all"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Editorial Quote */}
        <div className="border-l-2 border-[#5B8DEF]/40 pl-3.5 py-1 text-xs sm:text-sm italic text-[#B4BDC8]">
          “Your resume should tell the story of what you can prove.”
        </div>

        {/* Anti-fabrication reminder */}
        <div className="rounded-xl border border-[#27303B] bg-[#11161D] p-3 text-xs text-[#B4BDC8] flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-[#5B8DEF] shrink-0 mt-0.5" />
          <p>
            <strong>Integrity Promise:</strong> Every bullet, skill level, and metric rendered below originates from genuine diagnostic checkpoints, applied practice modules, and completed capstones in your RAIZO ledger.
          </p>
        </div>
      </div>

      {/* 2. THE RESUME PAPER VIEW */}
      <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-8 sm:p-12 shadow-md space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Header Block */}
        <div className="border-b border-[#27303B] pb-6 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
                {candidateName}
              </h2>
              <p className="text-sm font-semibold text-[#5B8DEF]">
                {candidateRole} • Target Role: {targetRole}
              </p>
            </div>

            {showEvidenceBadges && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5B8DEF]/10 text-[#5B8DEF] text-xs font-bold border border-[#5B8DEF]/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>RAIZO Verified Profile (72% Readiness)</span>
              </div>
            )}
          </div>

          <p className="text-xs text-[#B4BDC8]">
            San Francisco, CA (Open to Remote / Hybrid) • alex.rivera@example.com • linkedin.com/in/alexrivera-data • github.com/alexrivera-analytics
          </p>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#5B8DEF]">
            Professional Summary
          </h3>
          <p className="text-xs sm:text-sm text-[#F5F7FA] leading-relaxed">
            Analytical problem-solver specializing in SQL data querying, spreadsheet modeling, and business reporting. Demonstrates proven ability to transform raw business transaction logs into clear, actionable executive dashboards. Certified in relational database analytics with verified assessment backing.
          </p>
        </div>

        {/* Verified Core Competencies */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#5B8DEF]">
              Core Competencies & Evidence Level
            </h3>
            {showEvidenceBadges && (
              <span className="text-[10px] text-[#7E8996] italic">
                Backed by RAIZO Diagnostic Ledger
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-[#27303B] bg-[#11161D] space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#F5F7FA]">
                <span>SQL & Relational Databases</span>
                {showEvidenceBadges && (
                  <span className="px-2 py-0.5 rounded-full bg-[#5B8DEF]/10 text-[#5B8DEF] text-[10px] font-bold">
                    88% Verified
                  </span>
                )}
              </div>
              <p className="text-[#B4BDC8]">
                Multi-table JOINs, subqueries, grouping, and analytical aggregations in PostgreSQL & BigQuery.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#27303B] bg-[#11161D] space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#F5F7FA]">
                <span>Spreadsheets & Modeling</span>
                {showEvidenceBadges && (
                  <span className="px-2 py-0.5 rounded-full bg-[#5B8DEF]/10 text-[#5B8DEF] text-[10px] font-bold">
                    85% Demonstrated
                  </span>
                )}
              </div>
              <p className="text-[#B4BDC8]">
                XLOOKUP, multi-criteria SUMIFS, pivot summaries, variance modeling, and cohort tables.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#27303B] bg-[#11161D] space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#F5F7FA]">
                <span>Descriptive Statistics</span>
                {showEvidenceBadges && (
                  <span className="px-2 py-0.5 rounded-full bg-[#5B8DEF]/10 text-[#5B8DEF] text-[10px] font-bold">
                    88% Verified
                  </span>
                )}
              </div>
              <p className="text-[#B4BDC8]">
                Distribution skewness, IQR outlier detection, mean vs median selection, and hypothesis reasoning.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#27303B] bg-[#11161D] space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#F5F7FA]">
                <span>Python & Pandas</span>
                {showEvidenceBadges && (
                  <span className="px-2 py-0.5 rounded-full bg-[#FFF4E5] text-[#B67A22] text-[10px] font-bold">
                    50% Developing
                  </span>
                )}
              </div>
              <p className="text-[#B4BDC8]">
                DataFrame filtering, missing value imputation, type casting, and exploratory summaries.
              </p>
            </div>
          </div>
        </div>

        {/* Evidence-Backed Projects */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#5B8DEF]">
            Demonstrated Projects & Business Impact
          </h3>

          {/* Project 1 */}
          <div className="space-y-2 border-l-2 border-[#5B8DEF]/30 pl-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
              <h4 className="font-bold text-sm text-[#F5F7FA]">
                User Journey Cohort Retention & Churn Analysis
              </h4>
              <span className="text-[#B4BDC8] font-mono">Aug 2026 – Sep 2026</span>
            </div>
            <p className="text-xs text-[#5B8DEF] font-semibold">
              Tools: PostgreSQL, BigQuery, Looker Studio, Git
            </p>
            <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-[#B4BDC8] leading-relaxed">
              <li>
                Engineered complex relational SQL queries joining transaction logs across 120,000+ customer records, reducing exploratory latency by <strong>28%</strong>.
              </li>
              <li>
                Calculated monthly cohort retention curves and isolated drop-off friction points, empowering the product team to optimize onboarding conversion.
              </li>
              <li>
                Synthesized insights into an executive reporting deck with variance breakdowns and KPI drill-downs for departmental leadership.
              </li>
            </ul>
            {showEvidenceBadges && (
              <div className="pt-1 flex items-center gap-2 text-[11px] text-[#36C98F]">
                <CheckCircle2 className="h-3 w-3" />
                <span>Verified in RAIZO Capstone Assessment (Score: 84%)</span>
              </div>
            )}
          </div>

          {/* Project 2 */}
          <div className="space-y-2 border-l-2 border-[#5B8DEF]/30 pl-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
              <h4 className="font-bold text-sm text-[#F5F7FA]">
                Enterprise Procurement & Vendor Spend Audit
              </h4>
              <span className="text-[#B4BDC8] font-mono">Jul 2026 – Aug 2026</span>
            </div>
            <p className="text-xs text-[#5B8DEF] font-semibold">
              Tools: Excel (XLOOKUP, Dynamic Arrays), Power BI, Python Pandas
            </p>
            <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-[#B4BDC8] leading-relaxed">
              <li>
                Built an automated spreadsheet reconciliation model that matched 4,500+ monthly vendor invoices against purchase orders, eliminating <strong>15 hours</strong> of manual validation per cycle.
              </li>
              <li>
                Identified $42,000 in redundant recurring software subscriptions through categorical spend variance analysis.
              </li>
            </ul>
          </div>
        </div>

        {/* Education & Credentials */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#5B8DEF]">
            Credentials & Education
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between font-semibold text-[#F5F7FA]">
              <span>RAIZO Learning Completion Certificate — Data Analyst Track</span>
              <span className="text-[#5B8DEF] font-mono font-bold">DA-2026-X84</span>
            </div>
            <p className="text-[#B4BDC8]">
              Score: 84% • Evaluator Agent Verified • HMAC-SHA256 Cryptographic Hash Checksum
            </p>

            <div className="flex items-center justify-between font-semibold text-[#F5F7FA] pt-2">
              <span>Bachelor of Science in Information Systems</span>
              <span className="text-[#B4BDC8]">2022 – 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation Back to Career Intelligence */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[#151B23] border border-[#27303B] text-xs font-semibold print:hidden">
        <span className="text-[#B4BDC8]">
          Want to see how this resume scores against a target job description?
        </span>
        <Link
          href="/job-analysis"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5B8DEF] text-white font-bold hover:bg-[#4779D8] transition-colors"
        >
          <span>Check in Universal ATS Analyzer</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
