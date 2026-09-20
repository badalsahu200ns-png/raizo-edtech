"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileCheck2,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  GitBranch,
  Terminal
} from "lucide-react";
import { api } from "@/lib/api";
import { Assessment, EvaluationResult } from "@/lib/types";

export default function SpecificAssessmentPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const assessmentId = resolvedParams.id;
  const router = useRouter();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [adaptationData, setAdaptationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAssessment() {
      try {
        setIsLoading(true);
        const res = await api.getAssessment(assessmentId);
        setAssessment(res);
      } catch (err) {
        console.error("Failed to load specific assessment:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAssessment();
  }, [assessmentId]);

  const handleSelectAnswer = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    try {
      setIsSubmitting(true);
      const res = await api.submitAssessment({
        assessment_id: assessment.id,
        skill_id: assessment.skill_id || assessment.skills_covered?.[0] || "sql_fundamentals",
        answers
      });
      setEvaluationResult(res.evaluation);
      setAdaptationData(res.adaptation);
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading assessment {assessmentId}...
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Assessment Not Found</h2>
        <p className="text-xs text-slate-400">Assessment ID ({assessmentId}) could not be retrieved.</p>
        <Link
          href="/assessment"
          className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Assessments</span>
        </Link>
      </div>
    );
  }

  const currentQ = assessment.questions[currentQIndex];
  const qFormat = currentQ?.format || currentQ?.type || "mcq";
  const qPrompt = currentQ?.question_text || currentQ?.prompt || "";
  const displayScore = evaluationResult
    ? evaluationResult.overall_score ?? evaluationResult.score ?? 0
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/assessment"
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Assessments</span>
      </Link>

      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-[#0d1424] p-6 sm:p-8 shadow-xl space-y-2">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <FileCheck2 className="h-4 w-4" />
          <span>{assessment.type} Assessment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{assessment.title}</h1>
        <p className="text-xs text-slate-400">{assessment.description}</p>
      </div>

      {/* Evaluation Result View */}
      {evaluationResult ? (
        <div className="rounded-3xl border border-white/10 bg-[#0d1424] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-white">Evaluation Results</h2>
            <span
              className={`text-2xl font-extrabold ${
                displayScore >= 70
                  ? "text-emerald-400"
                  : displayScore >= 50
                  ? "text-cyan-400"
                  : "text-amber-400"
              }`}
            >
              {displayScore}%
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-[#151B23]/[0.02] p-4 rounded-xl border border-white/5">
            {evaluationResult.detailed_feedback || evaluationResult.feedback || "Assessment evaluated successfully."}
          </p>

          {adaptationData && adaptationData.action_taken === "INJECT_REMEDIATION_NODE" && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitBranch className="h-4 w-4 shrink-0" />
                <span>Adaptation Agent: Remediation node injected into active roadmap DAG.</span>
              </div>
              <Link href="/roadmap" className="text-cyan-400 underline font-semibold">
                View DAG
              </Link>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Link
              href="/dashboard"
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* Question Answering View */
        <div className="rounded-3xl border border-white/10 bg-[#0d1424] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-3">
            <span>
              Question {currentQIndex + 1} of {assessment.questions.length}
            </span>
            <span className="capitalize">{qFormat}</span>
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-white">
            {qPrompt}
          </h3>

          {/* Multiple Choice Options */}
          {(qFormat === "mcq" || qFormat === "conceptual") && currentQ.options && (
            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const optId = typeof opt === "string" ? opt : opt.id;
                const optText = typeof opt === "string" ? opt : opt.text;
                const isSelected = answers[currentQ.id] === optId;
                return (
                  <button
                    key={typeof opt === "string" ? `${idx}-${opt}` : opt.id}
                    onClick={() => handleSelectAnswer(currentQ.id, optId)}
                    className={`w-full text-left rounded-xl border p-3.5 text-xs sm:text-sm transition-all ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/10 text-white font-semibold"
                        : "border-white/10 bg-[#060a12] text-slate-300 hover:border-white/20"
                    }`}
                  >
                    {optText}
                  </button>
                );
              })}
            </div>
          )}

          {/* Code / Text Answer */}
          {(qFormat === "sql" || qFormat === "sql_query" || qFormat === "python" || qFormat === "python_code" || qFormat === "short_answer") && (
            <div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1.5 font-mono">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                <span>{qFormat.toUpperCase()} Workspace</span>
              </div>
              <textarea
                rows={6}
                value={answers[currentQ.id] || ""}
                onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                placeholder="Enter your solution code or answer..."
                className="w-full rounded-xl border border-white/10 bg-[#060a12] p-4 text-xs font-mono text-cyan-300 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}

          {/* Navigation & Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
              disabled={currentQIndex === 0}
              className="text-xs text-slate-400 hover:text-white disabled:opacity-30"
            >
              Previous
            </button>

            {currentQIndex < assessment.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQIndex(currentQIndex + 1)}
                className="rounded-xl bg-[#151B23]/5 border border-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-[#151B23]/10"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-2.5 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50 flex items-center space-x-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Evaluating..." : "Submit Assessment"}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
