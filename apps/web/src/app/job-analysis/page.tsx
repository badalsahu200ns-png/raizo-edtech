"use client";

import React, { useState } from "react";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building,
  Briefcase,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { api } from "@/lib/api";

export default function JobAnalysisPage() {
  const [jobTitle, setJobTitle] = useState("Junior Data Analyst");
  const [company, setCompany] = useState("FinTech Growth Corp");
  const [jdText, setJdText] = useState(`Job Title: Junior Data Analyst
Company: FinTech Growth Corp
Location: Remote / Hybrid

Role Overview:
We are seeking a proactive Data Analyst to interpret transactional records, calculate key SaaS and revenue metrics, and build automated reporting dashboards.

Required Qualifications:
• 1-3 years experience in an analytical, operations, or business reporting capacity.
• Strong foundational SQL proficiency: ability to write SELECT queries, multi-table JOINs, and GROUP BY aggregations.
• Experience manipulating tabular datasets in Python with Pandas (filtering, dealing with missing values).
• Familiarity with statistical concepts (mean, median distributions, A/B testing).
• Experience designing dashboards in Power BI or Tableau.
• Excellent business storytelling and cross-functional stakeholder communication.`);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!jdText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeJob({
        user_id: "demo_learner_alex",
        job_title: jobTitle,
        company,
        job_description_text: jdText
      });
      setAnalysisResult(res);
    } catch (err) {
      console.error("Job analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          Target Role Comparison
        </span>
        <h1 className="text-3xl font-extrabold text-white">
          Job Description Alignment Analyzer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Paste any live target job posting. Raizo extracts required competencies and compares them against your verified profile.
        </p>
      </div>

      {/* Input Form */}
      <div className="rounded-3xl border border-white/10 bg-[#0d1424] p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Organization</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Paste Job Description Text
          </label>
          <textarea
            rows={8}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#090d16] p-4 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none leading-relaxed"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !jdText.trim()}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-6 py-2.5 text-xs font-bold text-white shadow hover:opacity-90 disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            <span>{isAnalyzing ? "Comparing against Profile..." : "Analyze Job Alignment"}</span>
          </button>
        </div>
      </div>

      {/* Analysis Result */}
      {analysisResult && (
        <div className="rounded-3xl border border-indigo-500/30 bg-[#0d1424] p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                Alignment Report: {analysisResult.job_title} @ {analysisResult.company}
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-0.5">
                Role Competency Readiness: {analysisResult.role_readiness_estimate}
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 max-w-xs text-right">
              AI-assisted estimate based on verified evidence. Not a hiring guarantee.
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {analysisResult.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Matched */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-4 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Matched Verified Skills ({analysisResult.matched_skills.length})
              </span>
              <div className="space-y-1.5 pt-1">
                {analysisResult.matched_skills.map((m: any, idx: number) => (
                  <div key={idx} className="rounded-lg bg-black/30 p-2 text-xs text-white flex justify-between">
                    <span>{m.skill}</span>
                    <span className="font-mono text-emerald-400">{m.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Partial Matches */}
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/15 p-4 space-y-2">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> Developing / Partial ({analysisResult.partial_matches.length})
              </span>
              <div className="space-y-1.5 pt-1">
                {analysisResult.partial_matches.map((p: any, idx: number) => (
                  <div key={idx} className="rounded-lg bg-black/30 p-2 text-xs text-white flex justify-between">
                    <span>{p.skill}</span>
                    <span className="font-mono text-cyan-400">{p.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Gaps */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/15 p-4 space-y-2">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Unverified / Missing ({analysisResult.missing_skills.length})
              </span>
              <div className="space-y-1.5 pt-1">
                {analysisResult.missing_skills.map((msg: any, idx: number) => (
                  <div key={idx} className="rounded-lg bg-black/30 p-2 text-xs text-white flex justify-between">
                    <span>{msg.skill}</span>
                    <span className="text-[10px] text-rose-400">Action Needed</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
