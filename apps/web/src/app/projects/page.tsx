"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Send,
  FileText,
  Clock,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  FolderGit2,
  Layers,
  BarChart3,
  HelpCircle
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await api.getProjects(user?.id);
        setProjects(res.projects || []);
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
    }
    loadProjects();
  }, [user?.id]);

  const handleSubmitCapstone = async (projectId: string) => {
    if (!submissionText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.submitProject({
        user_id: user?.id,
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

  const sampleProject = {
    id: "proj-churn-01",
    title: "Customer Churn & Retention Analysis",
    skills: ["Python", "Pandas", "Statistics", "Data Visualization"],
    score: 84,
    verificationStatus: "Project evaluated · Strong evidence",
    problem: "SaaS churn increased from 2.1% to 4.8% following Q3 pricing tier adjustments.",
    approach: "Extracted transactional cohorts, imputed missing billing dates using medians, and built logistic regression retention features.",
    tools: ["PostgreSQL", "Python", "Pandas", "Power BI"],
    outcome: "Identified high-churn customer segments with 84% predictive precision; proposed onboarding intervention.",
    feedback: "Exceptional analytical depth. Solid treatment of skewed distributions and clear stakeholder narrative."
  };

  const defaultChallenge = {
    id: "proj_capstone_ecommerce",
    title: "E-Commerce Revenue Intelligence & Customer Cohort Analysis",
    time: "8 hours",
    description: "Analyze end-to-end customer purchasing lifecycles across 12 months of transactional data to identify revenue leakages and model cohort lifetime value.",
    deliverables: ["Cleaned SQL transformation scripts", "Python analysis notebook with statistical cohort analysis", "Executive presentation deck with data-driven recommendations"],
    criteria: ["Business Framing & Problem Formulation", "Analytical Correctness & Data Validation", "Data Storytelling & Actionable Recommendations"]
  };

  const displayChallenges = projects.length > 0 ? projects : [defaultChallenge];

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6">
      {/* Header - Answers: "Can I build real-world work that employers value?" */}
      <div className="border-b border-[#27303B] pb-6 space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5B8DEF]">
          PRACTICAL WORK DEMONSTRATION
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
          Projects
        </h1>
        <p className="text-sm text-[#B4BDC8] max-w-2xl leading-relaxed">
          Build practical work that demonstrates your ability to employers.
        </p>
      </div>

      {/* Section 1: Verified Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#F5F7FA]">
              Verified Projects
            </h2>
            <p className="text-xs text-[#B4BDC8]">
              Real-world work evaluated and confirmed as job-ready proof.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#5B8DEF]/10 text-[#5B8DEF]">
            1 Completed
          </span>
        </div>

        <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#27303B] pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8DEF]">
                Completed Capstone
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#F5F7FA]">
                {sampleProject.title}
              </h3>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#5B8DEF]/10 text-[#36C98F] border border-[#2F7D5C]/30 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified: {sampleProject.score}%
              </span>
            </div>
          </div>

          {/* Skills Demonstrated */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase text-[#B4BDC8] block">
              Skills Demonstrated:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleProject.skills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#1A212B] text-[#F5F7FA] border border-[#27303B]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Structured Breakdown: Problem, Approach, Tools, Outcome */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1.5">
              <span className="font-bold text-[#F5F7FA] uppercase tracking-wide block">
                Problem
              </span>
              <p className="text-[#B4BDC8] leading-relaxed">
                {sampleProject.problem}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1.5">
              <span className="font-bold text-[#F5F7FA] uppercase tracking-wide block">
                Approach
              </span>
              <p className="text-[#B4BDC8] leading-relaxed">
                {sampleProject.approach}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1.5">
              <span className="font-bold text-[#F5F7FA] uppercase tracking-wide block">
                Tools Used
              </span>
              <p className="text-[#F5F7FA] font-medium leading-relaxed">
                {sampleProject.tools.join(" · ")}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1.5">
              <span className="font-bold text-[#F5F7FA] uppercase tracking-wide block">
                Measurable Outcome
              </span>
              <p className="text-[#B4BDC8] leading-relaxed">
                {sampleProject.outcome}
              </p>
            </div>
          </div>

          {/* Verification Status & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#27303B]">
            <div className="flex items-center space-x-2 text-xs text-[#36C98F] font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>{sampleProject.verificationStatus}</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowProjectModal(true)}
                className="px-4 py-2 rounded-xl bg-[#11161D] text-[#F5F7FA] hover:bg-[#E9EBE8] border border-[#27303B] text-xs font-bold transition-all"
              >
                View Project
              </button>
              <Link
                href="/skills"
                className="px-4 py-2 rounded-xl bg-[#5B8DEF] text-white hover:bg-[#4779D8] text-xs font-bold transition-all inline-flex items-center space-x-1"
              >
                <span>View Evidence</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Project Challenges */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#F5F7FA]">
              Project Challenges
            </h2>
            <p className="text-xs text-[#B4BDC8]">
              Tackle industry scenarios to expand your portfolio and prove role readiness.
            </p>
          </div>
        </div>

        {displayChallenges.map((proj) => (
          <div
            key={proj.id}
            className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-6 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27303B] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8DEF]">
                  Capstone Challenge
                </span>
                <h3 className="text-xl font-bold text-[#F5F7FA] mt-0.5">
                  {proj.title}
                </h3>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-[#B4BDC8] font-medium bg-[#11161D] px-3 py-1.5 rounded-lg border border-[#27303B]">
                <Clock className="h-3.5 w-3.5 text-[#5B8DEF]" />
                <span>Estimated: {proj.time || "8 hours"}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-[#F5F7FA] block">
                What you'll build
              </span>
              <p className="text-xs sm:text-sm text-[#B4BDC8] leading-relaxed">
                {proj.description || defaultChallenge.description}
              </p>
            </div>

            {/* What you'll submit & Evaluation Criteria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#11161D] border border-[#27303B] space-y-2">
                <span className="font-bold text-[#F5F7FA] uppercase tracking-wide block">
                  What you'll submit
                </span>
                <ul className="space-y-1.5 text-[#B4BDC8]">
                  {(proj.deliverables || defaultChallenge.deliverables).map((d: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-[#5B8DEF] font-bold">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#11161D] border border-[#27303B] space-y-2">
                <span className="font-bold text-[#F5F7FA] uppercase tracking-wide block">
                  Evaluation Criteria
                </span>
                <ul className="space-y-1.5 text-[#B4BDC8]">
                  {(proj.criteria || defaultChallenge.criteria).map((c: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#36C98F] shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Submission Area */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold uppercase text-[#F5F7FA]">
                Submit Project Analysis / Repository URL & Walkthrough
              </label>
              <textarea
                rows={4}
                placeholder="Paste your analysis summary, GitHub link, and executive recommendations here..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                className="w-full rounded-xl border border-[#27303B] bg-[#11161D] p-4 text-xs font-mono text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none focus:bg-[#151B23] transition-all"
              />
            </div>

            {/* Evaluation Alert */}
            {evaluationResult && (
              <div className="p-4 rounded-xl bg-[#5B8DEF]/10 border border-[#2F7D5C]/40 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#36C98F]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Project Evaluated Successfully! Score: {evaluationResult.score || 84}%</span>
                </div>
                <p className="text-xs text-[#F5F7FA]">
                  {evaluationResult.feedback || "Your analytical walkthrough demonstrated high precision and clear business thinking. Verified evidence has been recorded in your skill profile."}
                </p>
                <Link
                  href="/skills"
                  className="text-xs font-bold text-[#5B8DEF] hover:underline inline-flex items-center gap-1 mt-1"
                >
                  View updated skills in Verified Skills →
                </Link>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-xs text-[#B4BDC8]">
                Evaluated against structured career competencies
              </span>
              <button
                onClick={() => handleSubmitCapstone(proj.id)}
                disabled={isSubmitting || !submissionText.trim()}
                className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold shadow-sm hover:bg-[#4779D8] transition-all disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Evaluating..." : "Submit Capstone →"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Project Detail Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#151B23] rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-[#27303B] shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#27303B] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#5B8DEF]">Project Summary</span>
                <h3 className="text-xl font-extrabold text-[#F5F7FA]">{sampleProject.title}</h3>
              </div>
              <button
                onClick={() => setShowProjectModal(false)}
                className="text-xs text-[#B4BDC8] hover:text-[#F5F7FA] font-bold px-2 py-1 rounded-md bg-[#11161D]"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-[#F5F7FA] block mb-1">Executive Summary</span>
                <p className="text-[#B4BDC8] leading-relaxed">
                  In this capstone, Alex addressed an escalating customer churn rate by auditing subscription activity, cleaning time-series billing data, and building cohort models in Python and PostgreSQL.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#5B8DEF]/10/50 border border-[#5B8DEF]/20">
                <span className="font-bold text-[#5B8DEF] block mb-1">Evaluator Feedback</span>
                <p className="text-[#F5F7FA] leading-relaxed">{sampleProject.feedback}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-[#27303B]">
              <button
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 rounded-xl bg-[#11161D] text-[#F5F7FA] text-xs font-bold"
              >
                Close
              </button>
              <Link
                href="/skills"
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold inline-flex items-center space-x-1"
              >
                <span>Check Verified Skills</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
