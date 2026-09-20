"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Award,
  ArrowLeft,
  Terminal,
  Send,
  CheckCircle2,
  AlertTriangle,
  FolderGit2
} from "lucide-react";
import { api } from "@/lib/api";

export default function ProjectDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<any | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      try {
        setIsLoading(true);
        const res = await api.getProjects();
        const found = (res.projects || []).find((p: any) => p.id === projectId);
        setProject(
          found || {
            id: projectId,
            title: "Applied E-Commerce Analytics Capstone",
            description:
              "Clean, transform, and model raw transaction logs to compute monthly churn, CLV cohorts, and executive revenue storytelling.",
            skills: ["SQL", "Pandas", "Statistics", "Power BI"],
            tasks: [
              "Extract raw order records and join customer metadata using relational SQL",
              "Address missing values and outlier purchase amounts with Python",
              "Formulate business hypotheses and calculate statistical significance"
            ]
          }
        );
      } catch (err) {
        console.error("Failed to load project:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProject();
  }, [projectId]);

  const handleSubmit = async () => {
    if (!submissionText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.submitProject({
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading capstone project details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/projects"
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to All Capstones</span>
      </Link>

      <div className="rounded-3xl border border-white/10 bg-[#0d1424] p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <FolderGit2 className="h-4 w-4" />
          <span>Milestone Capstone Workspace</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{project.title}</h1>
        <p className="text-sm text-slate-300 leading-relaxed">{project.description}</p>
      </div>

      {evaluationResult ? (
        <div className="rounded-3xl border border-emerald-500/30 bg-[#0d1424] p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-semibold text-white">Project Evaluation Score</h3>
            <span className="text-2xl font-bold text-emerald-400">{evaluationResult.score}%</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-[#151B23]/[0.02] p-4 rounded-xl border border-white/5">
            {evaluationResult.feedback || "Capstone verified and registered in the Evidence Ledger."}
          </p>
          <Link
            href="/evidence"
            className="inline-block rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            View Cryptographic Evidence
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-[#0d1424] p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span>Capstone Implementation / Code Solution</span>
          </div>
          <textarea
            rows={10}
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="Paste your SQL script, Python data pipeline, or analysis repository link..."
            className="w-full rounded-2xl border border-white/10 bg-[#060a12] p-4 text-xs font-mono text-cyan-300 focus:border-indigo-500 focus:outline-none"
          />
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !submissionText.trim()}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-2.5 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50 flex items-center space-x-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "Evaluating Rubrics..." : "Submit for Evaluation"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
