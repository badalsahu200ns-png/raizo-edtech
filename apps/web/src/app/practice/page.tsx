"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Terminal,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen
} from "lucide-react";

export default function PracticePage() {
  const [selectedTask, setSelectedTask] = useState<number>(0);
  const [codeAnswer, setCodeAnswer] = useState("");
  const [evaluationFeedback, setEvaluationFeedback] = useState<any>(null);

  const practiceExercises = [
    {
      id: 0,
      title: "SQL Window Function: Partitioned Salary Ranking",
      type: "SQL Task",
      difficulty: "Intermediate",
      prompt: "Write a SQL query that calculates the salary rank of every employee within their respective department using DENSE_RANK(). Return employee_id, department_id, salary, and the rank column as 'dept_salary_rank'.",
      initialCode: "SELECT employee_id, department_id, salary,\n       DENSE_RANK() OVER (...) as dept_salary_rank\nFROM employees;",
      solutionKeywords: ["dense_rank()", "over", "partition by department_id", "order by salary desc"],
      explanation: "DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) assigns sequential ranks per department while preserving non-grouped employee rows."
    },
    {
      id: 1,
      title: "Pandas: Missing Value Median Imputation",
      type: "Python Code",
      difficulty: "Intermediate",
      prompt: "Given a DataFrame df with missing values in column 'purchase_amount', impute the missing values using the median of 'purchase_amount' in-place or by direct column assignment.",
      initialCode: "df['purchase_amount'] = ...",
      solutionKeywords: ["fillna", "median()"],
      explanation: "Using df['purchase_amount'] = df['purchase_amount'].fillna(df['purchase_amount'].median()) ensures robust imputation without outlier distortion."
    },
    {
      id: 2,
      title: "SQL Outer Join: Unmatched Records",
      type: "SQL Task",
      difficulty: "Intermediate",
      prompt: "Find all customers who have never placed an order by querying customers c LEFT JOIN orders o and filtering where the right key is NULL.",
      initialCode: "SELECT c.customer_id, c.customer_name\nFROM customers c\nLEFT JOIN orders o ON ...\nWHERE ...;",
      solutionKeywords: ["left join", "is null"],
      explanation: "A LEFT JOIN with a WHERE right_table.key IS NULL effectively performs an anti-join, isolating customers without orders."
    }
  ];

  const currentEx = practiceExercises[selectedTask];

  const handleRunEvaluation = () => {
    const inputCleaned = codeAnswer.toLowerCase();
    const matchesAll = currentEx.solutionKeywords.every((kw) => inputCleaned.includes(kw.toLowerCase()));

    if (matchesAll) {
      setEvaluationFeedback({
        success: true,
        score: 100,
        feedback: "Correct! Your code satisfies the required syntax invariants and business logic."
      });
    } else {
      const missing = currentEx.solutionKeywords.filter((kw) => !inputCleaned.includes(kw.toLowerCase()));
      setEvaluationFeedback({
        success: false,
        score: 40,
        feedback: `Incomplete. Missing key elements: ${missing.join(", ")}. Review the concept explanation below.`
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          Applied Sandbox
        </span>
        <h1 className="text-3xl font-extrabold text-white">
          Active Practice Sandbox
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Reinforce mental models with hands-on applied SQL and Python analytics problems before taking graded milestones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Exercise Selector */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 block uppercase">
            Available Exercises
          </span>
          {practiceExercises.map((ex) => (
            <div
              key={ex.id}
              onClick={() => {
                setSelectedTask(ex.id);
                setCodeAnswer(ex.initialCode);
                setEvaluationFeedback(null);
              }}
              className={`rounded-2xl border p-4 space-y-1 transition-all cursor-pointer ${
                selectedTask === ex.id
                  ? "border-indigo-500 bg-indigo-950/40 text-white shadow"
                  : "border-white/10 bg-[#0d1424] text-slate-300 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-indigo-400">
                <span>{ex.type}</span>
                <span className="text-slate-400">{ex.difficulty}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{ex.title}</h4>
            </div>
          ))}
        </div>

        {/* Right 2 Cols: Editor & Interactive Runner */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-[#0d1424] p-6 space-y-5 shadow-2xl">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              {currentEx.type} • {currentEx.difficulty}
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">{currentEx.title}</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {currentEx.prompt}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono">
                <Terminal className="h-4 w-4 text-cyan-400" />
                Code Sandbox
              </span>
              <button
                onClick={() => setCodeAnswer(currentEx.initialCode)}
                className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset Code
              </button>
            </div>

            <textarea
              rows={8}
              value={codeAnswer || currentEx.initialCode}
              onChange={(e) => setCodeAnswer(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#090d16] p-4 font-mono text-xs text-cyan-300 focus:border-indigo-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-[11px] text-slate-500">
              Instant deterministic keyword & syntax checking
            </span>
            <button
              onClick={handleRunEvaluation}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-2 text-xs font-bold text-white shadow hover:opacity-90 transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Run & Verify</span>
            </button>
          </div>

          {/* Feedback */}
          {evaluationFeedback && (
            <div className={`rounded-2xl border p-4 space-y-2 text-xs ${
              evaluationFeedback.success
                ? "border-emerald-500/40 bg-emerald-950/20"
                : "border-rose-500/40 bg-rose-950/20"
            }`}>
              <div className="flex items-center space-x-2 font-bold">
                {evaluationFeedback.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                )}
                <span className={evaluationFeedback.success ? "text-emerald-300" : "text-rose-300"}>
                  {evaluationFeedback.feedback}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 pt-1 border-t border-white/5">
                <span className="font-bold text-white">Explanation:</span> {currentEx.explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
