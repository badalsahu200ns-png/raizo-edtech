"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileCheck2,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  RotateCcw,
  Sparkles,
  GitBranch,
  Terminal,
  ShieldAlert
} from "lucide-react";
import { api } from "@/lib/api";
import { Assessment, AssessmentQuestion, EvaluationResult } from "@/lib/types";

function AssessmentInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const skillParam = searchParams.get("skill");
  const nodeParam = searchParams.get("node");
  const titleParam = searchParams.get("title");

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
        const type = skillParam ? "checkpoint" : "diagnostic";
        const res = await api.generateAssessment(type, skillParam || undefined, titleParam || undefined);
        setAssessment(res);
      } catch (err) {
        console.error("Failed to load assessment:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAssessment();
  }, [skillParam, titleParam]);

  const handleSelectAnswer = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    setIsSubmitting(true);
    try {
      const res = await api.submitAssessment({
        user_id: "demo_learner_alex",
        assessment_id: assessment.id,
        skill_id: assessment.skills_covered[0] || "pandas_data_cleaning",
        node_id: nodeParam || undefined,
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

  if (isLoading || !assessment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4" />
        Assessment Agent: Generating prerequisite-mapped questions...
      </div>
    );
  }

  // If completed, show comprehensive Result View
  if (evaluationResult) {
    const isPassed = evaluationResult.passed;

    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Results Header */}
        <div className={`rounded-3xl border p-8 space-y-6 shadow-2xl ${
          isPassed
            ? "border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-[#0d1424] to-[#090e1a]"
            : "border-rose-500/50 bg-gradient-to-br from-rose-950/40 via-[#0d1424] to-[#090e1a]"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`rounded-full px-3 py-1 text-xs font-bold border ${
              isPassed
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-rose-500/20 text-rose-300 border-rose-500/40"
            }`}>
              {isPassed ? "Milestone Verified" : "Needs Remediation"}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Confidence: {evaluationResult.confidence.toUpperCase()}
            </span>
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-5xl font-black font-mono text-white">
              {evaluationResult.overall_score}%
            </span>
            <span className="text-sm font-semibold uppercase text-slate-400">
              Deterministic Benchmark Score
            </span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed max-w-2xl">
            {evaluationResult.detailed_feedback}
          </p>

          {/* DYNAMIC ROADMAP ADAPTATION CALLOUT */}
          {adaptationData && adaptationData.action_taken && (
            <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/30 p-5 space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <GitBranch className="h-4 w-4" />
                <span>Autonomous Adaptation Agent Action: {adaptationData.action_taken}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {adaptationData.adaptation_action.explanation}
              </p>
              {adaptationData.adaptation_action.inserted_node && (
                <div className="mt-2 rounded-xl bg-black/40 p-3 border border-white/5 text-xs text-slate-300 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-rose-400 font-bold block uppercase">
                      New Prerequisite Node Injected:
                    </span>
                    <span className="font-semibold text-white">
                      {adaptationData.adaptation_action.inserted_node.title}
                    </span>
                  </div>
                  <Link
                    href="/roadmap"
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    View in Roadmap
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/roadmap"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition-colors"
            >
              Inspect Adapted Roadmap
            </Link>
            <Link
              href="/evidence"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              View Updated Evidence Ledger
            </Link>
            <button
              onClick={() => {
                setEvaluationResult(null);
                setCurrentQIndex(0);
                setAnswers({});
              }}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5"
            >
              Reattempt Assessment
            </button>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Question Review & Rubric Breakdown</h3>
          {evaluationResult.question_results.map((qr, idx) => (
            <div
              key={qr.question_id}
              className={`rounded-2xl border p-5 space-y-2 text-xs ${
                qr.is_correct ? "border-emerald-500/30 bg-[#0d1624]" : "border-rose-500/40 bg-rose-950/15"
              }`}
            >
              <div className="flex justify-between items-center font-bold">
                <span className="text-white">Question {idx + 1} ({qr.type.toUpperCase()})</span>
                <span className={qr.is_correct ? "text-emerald-400" : "text-rose-400"}>
                  {qr.earned_score} / {qr.max_score} pts
                </span>
              </div>
              <p className="text-slate-300 font-mono text-[11px] bg-black/30 p-2.5 rounded-lg">
                Your Answer: {qr.user_answer || "(Empty)"}
              </p>
              <p className="text-slate-400">{qr.feedback}</p>
              <div className="text-[11px] text-indigo-400 pt-1">
                Prerequisite Tested: {qr.prerequisite_concept}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentQ = assessment.questions[currentQIndex];
  const isLastQuestion = currentQIndex === assessment.questions.length - 1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Assessment Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            {assessment.type.toUpperCase()} BENCHMARK
          </span>
          <h1 className="text-xl font-bold text-white mt-0.5">{assessment.title}</h1>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
          <Clock className="h-4 w-4 text-cyan-400" />
          <span>{assessment.time_limit_minutes} min remaining</span>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Question {currentQIndex + 1} of {assessment.questions.length}</span>
          <span>{assessment.skills_covered.join(", ")}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all"
            style={{ width: `${((currentQIndex + 1) / assessment.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-3xl border border-white/10 bg-[#0d1424] p-8 space-y-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold">
            <span>Difficulty: {currentQ.difficulty}</span>
            <span>{currentQ.weight} Points</span>
          </div>
          <h2 className="text-base font-bold text-white leading-relaxed">
            {currentQ.question_text}
          </h2>
        </div>

        {/* Code Snippet if present */}
        {currentQ.code_snippet && (
          <div className="rounded-xl bg-[#090d16] border border-white/10 p-4 font-mono text-xs text-cyan-300 overflow-x-auto">
            <pre>{currentQ.code_snippet}</pre>
          </div>
        )}

        {/* MCQ Options */}
        {currentQ.options && currentQ.options.length > 0 && (
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = answers[currentQ.id] === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectAnswer(currentQ.id, opt.id)}
                  className={`rounded-xl border p-4 text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-start space-x-3 ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-950"
                      : "border-white/10 bg-[#101728] text-slate-300 hover:border-white/20 hover:bg-[#131d33]"
                  }`}
                >
                  <span className={`h-5 w-5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                    isSelected ? "border-indigo-400 bg-indigo-500 text-white" : "border-slate-600 text-slate-400"
                  }`}>
                    {opt.id}
                  </span>
                  <span className="leading-relaxed">{opt.text}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Applied Code Input */}
        {(currentQ.type === "sql_query" || currentQ.type === "python_code" || currentQ.type === "short_answer") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                Applied Code Editor
              </span>
              <span>Deterministic Rubric Evaluated</span>
            </div>
            <textarea
              rows={4}
              placeholder={currentQ.type === "sql_query" ? "SELECT ... FROM ... GROUP BY ..." : "df['column'] = ..."}
              value={answers[currentQ.id] || ""}
              onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#090d16] p-4 font-mono text-xs text-cyan-300 focus:border-indigo-500 focus:outline-none leading-relaxed"
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <button
            onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
            disabled={currentQIndex === 0}
            className="flex items-center space-x-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 disabled:opacity-30 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {!isLastQuestion ? (
            <button
              onClick={() => setCurrentQIndex(currentQIndex + 1)}
              className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-90 transition-all"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? "Scoring against Rubrics..." : "Submit & Evaluate"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Assessment...</div>}>
      <AssessmentInner />
    </Suspense>
  );
}
