"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  CheckCircle2,
  Send,
  Terminal,
  FileText,
  Clock,
  ExternalLink,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { api } from "@/lib/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await api.getProjects();
        setProjects(res.projects || []);
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
    }
    loadProjects();
  }, []);

  const handleSubmitCapstone = async (projectId: string) => {
    if (!submissionText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.submitProject({
        user_id: "demo_learner_alex",
        project_id: projectId,
        submission_text: submissionText
      });
      setEvaluationResult(res);
    } catch (err) {
      console.error("Project submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          Applied Capability Synthesis
        </span>
        <h1 className="text-3xl font-extrabold text-white">
          Analytics Capstone Projects
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Real-world portfolio projects evaluated by deterministic rubrics to generate high-confidence evidence.
        </p>
      </div>

      {projects.map((proj) => (
        <div
          key={proj.id}
          className="rounded-3xl border border-white/10 bg-[#0d1424] p-8 space-y-6 shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                  Capstone Challenge
                </span>
                <span className="text-xs text-slate-400">Estimated Duration: 8 Hours</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{proj.title}</h2>
            </div>

            <span className={`rounded-xl px-3 py-1 text-xs font-bold ${
              proj.status === "completed"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
            }`}>
              {proj.status === "completed" ? "Verified & Completed" : "Available to Solve"}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {proj.description}
          </p>

          {/* Project Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-black/40 p-5 border border-white/5 text-xs text-slate-300">
            <div>
              <span className="font-bold text-indigo-400 block mb-1">Required Deliverables:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Data Cleaning Python script imputing missing transaction attributes</li>
                <li>SQL window query calculating monthly cohort retention</li>
                <li>Executive briefing summarizing key growth levers</li>
              </ul>
            </div>
            <div>
              <span className="font-bold text-indigo-400 block mb-1">Evaluation Rubric:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Data cleaning completeness (20 pts)</li>
                <li>SQL window query structure (20 pts)</li>
                <li>Executive storytelling clarity (20 pts)</li>
              </ul>
            </div>
          </div>

          {/* Submission Form */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Submit Your Analytical Findings / Code Solution:
            </label>
            <textarea
              rows={5}
              placeholder="Paste SQL queries, Python cleaning code, and executive summary notes here..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#090d16] p-4 font-mono text-xs text-cyan-300 focus:border-indigo-500 focus:outline-none leading-relaxed"
            />

            <div className="flex justify-end">
              <button
                onClick={() => handleSubmitCapstone(proj.id)}
                disabled={isSubmitting || !submissionText.trim()}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-6 py-2.5 text-xs font-bold text-white shadow hover:opacity-90 transition-all disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? "Evaluating against Rubric..." : "Submit Capstone Project"}</span>
              </button>
            </div>
          </div>

          {/* Evaluation Result Notice */}
          {evaluationResult && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-5 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle2 className="h-5 w-5" />
                <span>Capstone Project Verified: Score {evaluationResult.score}%</span>
              </div>
              <p className="text-slate-200">{evaluationResult.message}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
