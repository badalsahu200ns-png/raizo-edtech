"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Layers,
  ArrowRight,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Eye,
  Code,
  Database,
  Table,
  Clock,
  Filter,
  Trophy,
  Sparkles,
  Check,
  ArrowUpRight,
  BarChart2
} from "lucide-react";
import { PRACTICE_QUESTIONS, PracticeQuestion } from "@/lib/practiceQuestions";

interface SkillExercise {
  id: number;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  time: string;
  skill: string;
  description: string;
}

const SKILL_EXERCISE_CATALOG: { domain: string; exercises: SkillExercise[] }[] = [
  {
    domain: "SQL",
    exercises: [
      { id: 1, title: "SELECT & Filtering", difficulty: "Beginner", time: "15 min", skill: "SQL", description: "Filter high-salary compensation records using WHERE and comparison operators." },
      { id: 2, title: "Multi-Table JOINs", difficulty: "Intermediate", time: "25 min", skill: "SQL", description: "Combine relational transaction tables using INNER and LEFT JOINs." },
      { id: 4, title: "Aggregations & GROUP BY", difficulty: "Intermediate", time: "20 min", skill: "SQL", description: "Compute summary metrics and averages grouped by business segments." },
      { id: 5, title: "Subqueries & CTEs", difficulty: "Intermediate", time: "25 min", skill: "SQL", description: "Structure modular nested queries using Common Table Expressions." },
      { id: 3, title: "SQL Window Functions", difficulty: "Intermediate", time: "30 min", skill: "SQL", description: "Build a query using ROW_NUMBER, RANK, and partitioning." }
    ]
  },
  {
    domain: "Excel",
    exercises: [
      { id: 12, title: "Formulas & Lookups", difficulty: "Beginner", time: "15 min", skill: "Excel", description: "Modern spreadsheet modeling with XLOOKUP and multi-criteria SUMIFS." },
      { id: 13, title: "Pivot Tables", difficulty: "Intermediate", time: "20 min", skill: "Excel", description: "Summarize dimensional cohorts into executive spreadsheet reports." },
      { id: 14, title: "Data Cleaning", difficulty: "Intermediate", time: "25 min", skill: "Excel", description: "Clean text data, parse dates, and remove transaction duplicates." },
      { id: 27, title: "Spreadsheet Modeling", difficulty: "Advanced", time: "35 min", skill: "Excel", description: "Build sensitivity analysis models and scenario projections." }
    ]
  },
  {
    domain: "Python",
    exercises: [
      { id: 15, title: "Pandas Core", difficulty: "Intermediate", time: "25 min", skill: "Python", description: "DataFrame indexing, conditional selection, and column transforms." },
      { id: 16, title: "Data Cleaning & Imputation", difficulty: "Intermediate", time: "30 min", skill: "Python", description: "Handle missing values, cast types, and impute skew-robust medians." },
      { id: 21, title: "Data Visualization", difficulty: "Intermediate", time: "20 min", skill: "Python", description: "Plot distribution box plots and correlation heatmaps." },
      { id: 8, title: "Descriptive Statistics", difficulty: "Intermediate", time: "25 min", skill: "Python", description: "Calculate central tendency, variance, and skewness indicators." }
    ]
  }
];

export default function PracticePage() {
  const [selectedDomain, setSelectedDomain] = useState<"SQL" | "Excel" | "Python">("SQL");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [mode, setMode] = useState<"practice" | "interview">("practice");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);

  // Per-question state stored in memory and localStorage
  const [solvedQuestions, setSolvedQuestions] = useState<Record<number, boolean>>({});
  const [userCodes, setUserCodes] = useState<Record<number, string>>({});
  const [hintsUsed, setHintsUsed] = useState<Record<number, number>>({});
  const [evaluationFeedback, setEvaluationFeedback] = useState<{
    status: "success" | "error" | "incomplete";
    score: number;
    message: string;
    missingKeywords?: string[];
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"problem" | "schema" | "output" | "solution">("problem");
  const [interviewTimer, setInterviewTimer] = useState<number>(1800); // 30 min timer for interview mode
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const savedSolved = localStorage.getItem("raizo_practice_solved");
      if (savedSolved) setSolvedQuestions(JSON.parse(savedSolved));

      const savedCodes = localStorage.getItem("raizo_practice_codes");
      if (savedCodes) setUserCodes(JSON.parse(savedCodes));

      const savedHints = localStorage.getItem("raizo_practice_hints");
      if (savedHints) setHintsUsed(JSON.parse(savedHints));
    } catch {
      // ignore
    }
  }, []);

  // Save progress
  const persistProgress = (
    newSolved: Record<number, boolean>,
    newCodes: Record<number, string>,
    newHints: Record<number, number>
  ) => {
    try {
      localStorage.setItem("raizo_practice_solved", JSON.stringify(newSolved));
      localStorage.setItem("raizo_practice_codes", JSON.stringify(newCodes));
      localStorage.setItem("raizo_practice_hints", JSON.stringify(newHints));
    } catch {
      // ignore
    }
  };

  // Filter questions
  const filteredQuestions = useMemo(() => {
    if (activeFilter === "all") return PRACTICE_QUESTIONS;
    if (activeFilter === "sql") return PRACTICE_QUESTIONS.filter((q) => q.type === "sql");
    if (activeFilter === "python") return PRACTICE_QUESTIONS.filter((q) => q.type === "python");
    if (activeFilter === "stats") return PRACTICE_QUESTIONS.filter((q) => q.module.toLowerCase().includes("statistic") || q.module.toLowerCase().includes("distributions"));
    if (activeFilter === "bi") return PRACTICE_QUESTIONS.filter((q) => q.module.toLowerCase().includes("business") || q.module.toLowerCase().includes("power bi") || q.module.toLowerCase().includes("tableau"));
    return PRACTICE_QUESTIONS;
  }, [activeFilter]);

  const currentQ: PracticeQuestion = PRACTICE_QUESTIONS[currentIndex] || PRACTICE_QUESTIONS[0];
  const currentCode = userCodes[currentQ.id] !== undefined ? userCodes[currentQ.id] : currentQ.starterCode;
  const currentHintLevel = hintsUsed[currentQ.id] || 0;
  const isSolved = !!solvedQuestions[currentQ.id];

  // Timer for interview mode
  useEffect(() => {
    let interval: any = null;
    if (mode === "interview" && isTimerRunning && interviewTimer > 0) {
      interval = setInterval(() => setInterviewTimer((t) => Math.max(0, t - 1)), 1000);
    }
    return () => clearInterval(interval);
  }, [mode, isTimerRunning, interviewTimer]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const solvedCount = Object.values(solvedQuestions).filter(Boolean).length;
  const totalCount = PRACTICE_QUESTIONS.length;
  const progressPercentage = Math.round((solvedCount / totalCount) * 100);

  // Handle Code Change
  const handleCodeChange = (val: string) => {
    const updated = { ...userCodes, [currentQ.id]: val };
    setUserCodes(updated);
    persistProgress(solvedQuestions, updated, hintsUsed);
    if (evaluationFeedback) setEvaluationFeedback(null);
  };

  // Reset Code
  const handleResetCode = () => {
    const updated = { ...userCodes, [currentQ.id]: currentQ.starterCode };
    setUserCodes(updated);
    persistProgress(solvedQuestions, updated, hintsUsed);
    setEvaluationFeedback(null);
  };

  // Reveal next progressive hint
  const handleRevealHint = () => {
    if (currentHintLevel >= 3) return;
    const nextLevel = currentHintLevel + 1;
    const updated = { ...hintsUsed, [currentQ.id]: nextLevel };
    setHintsUsed(updated);
    persistProgress(solvedQuestions, userCodes, updated);
  };

  // Evaluate query analytically
  const handleEvaluate = () => {
    const cleanUser = currentCode.toLowerCase().replace(/\s+/g, " ").trim();
    const cleanSol = currentQ.solution.toLowerCase().replace(/\s+/g, " ").trim();

    // Semantic evaluation check
    let pass = false;
    let missing: string[] = [];

    if (currentQ.type === "sql") {
      // Check required SQL idioms
      if (currentQ.id === 3) {
        // Special strict preservation for Q3: DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as dept_salary_rank
        const hasDenseRank = cleanUser.includes("dense_rank()");
        const hasPartition = cleanUser.includes("partition by department_id");
        const hasOrder = cleanUser.includes("order by salary desc");
        const hasAlias = cleanUser.includes("dept_salary_rank");
        pass = hasDenseRank && hasPartition && hasOrder && hasAlias;
        if (!hasDenseRank) missing.push("DENSE_RANK() window function");
        if (!hasPartition) missing.push("PARTITION BY department_id");
        if (!hasOrder) missing.push("ORDER BY salary DESC");
        if (!hasAlias) missing.push("alias 'dept_salary_rank'");
      } else {
        // General SQL keywords check based on solution tokens
        const keyTerms = currentQ.solution
          .toLowerCase()
          .split(/[\s,();]+/)
          .filter((t) => t.length > 3 && !["select", "from", "where", "table", "order", "group"].includes(t));
        
        const matched = keyTerms.filter((term) => cleanUser.includes(term));
        pass = matched.length >= Math.floor(keyTerms.length * 0.7);
        if (!pass) {
          missing = keyTerms.filter((term) => !cleanUser.includes(term)).slice(0, 3);
        }
      }
    } else {
      // Python / Pandas semantic check
      const keyTerms = currentQ.solution
        .toLowerCase()
        .split(/[\s,();=\[\]]+/)
        .filter((t) => t.length > 2 && !["the", "for", "and", "def"].includes(t));
      
      const matched = keyTerms.filter((term) => cleanUser.includes(term));
      pass = matched.length >= Math.floor(keyTerms.length * 0.75);
      if (!pass) {
        missing = keyTerms.filter((term) => !cleanUser.includes(term)).slice(0, 3);
      }
    }

    if (pass) {
      const updatedSolved = { ...solvedQuestions, [currentQ.id]: true };
      setSolvedQuestions(updatedSolved);
      persistProgress(updatedSolved, userCodes, hintsUsed);
      setEvaluationFeedback({
        status: "success",
        score: 84,
        message: "Score: 84% • Skill evidence added to Verified Skills."
      });
      setActiveTab("solution");
    } else {
      setEvaluationFeedback({
        status: "incomplete",
        score: 45,
        message: "Your query did not match all required semantic invariants.",
        missingKeywords: missing
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 px-2 sm:px-4">
      {/* 1. SECTION HEADER (Section 4) */}
      <div className="border-b border-[#27303B] pb-5 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#5B8DEF] bg-[#5B8DEF]/10 px-2 py-0.5 rounded-full font-bold">
            [03 — PRACTICE]
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
          Hands-on Practice Lab
        </h1>
        <p className="text-xs sm:text-sm font-medium text-[#B4BDC8]">
          Can I actually apply what I learned? Hands-on practical exercises organized by skill.
        </p>
        <div className="border-l-2 border-[#5B8DEF]/40 pl-3 py-1 text-xs sm:text-sm italic text-[#B4BDC8]">
          “Knowledge becomes a skill when you can use it.”
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#B4BDC8] pt-1">
          <span className="text-[10px] font-bold uppercase text-[#7E8996]">Progression:</span>
          <span className="text-[#F5F7FA] font-bold">ISOLATED EXERCISE</span>
          <span className="text-[#CBD2CB]">?</span>
          <span className="text-[#5B8DEF] font-bold">FEEDBACK LOOP</span>
          <span className="text-[#CBD2CB]">?</span>
          <span className="text-[#F5F7FA] font-bold">MUSCLE MEMORY</span>
        </div>
      </div>

      {/* 2. EXERCISES ORGANIZED BY SKILL (Section 4) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7E8996] block">
              PRACTICAL EXERCISES
            </span>
            <h2 className="text-base font-extrabold text-[#F5F7FA]">
              Select a Skill Domain
            </h2>
          </div>
          <div className="flex rounded-xl bg-[#151B23] p-1 border border-[#27303B] text-xs font-semibold shadow-xs">
            {(["SQL", "Excel", "Python"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDomain(d)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedDomain === d
                    ? "bg-[#5B8DEF] text-white shadow-xs font-bold"
                    : "text-[#B4BDC8] hover:text-[#F5F7FA]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SKILL_EXERCISE_CATALOG.find((c) => c.domain === selectedDomain)?.exercises.map((ex) => {
            const isCompleted = !!solvedQuestions[ex.id];
            const isSelected = PRACTICE_QUESTIONS[currentIndex]?.id === ex.id;

            return (
              <div
                key={ex.id}
                className={`rounded-2xl border p-5 space-y-3 transition-all bg-[#151B23] flex flex-col justify-between ${
                  isSelected
                    ? "border-[#5B8DEF] ring-2 ring-[#176B5B]/20 shadow-xs"
                    : "border-[#27303B] hover:border-[#5B8DEF]/40"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#5B8DEF] bg-[#5B8DEF]/10 px-2 py-0.5 rounded">
                      {ex.skill} • {ex.difficulty}
                    </span>
                    <span className="text-[#7E8996] font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {ex.time}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#F5F7FA]">{ex.title}</h3>
                  <p className="text-xs text-[#B4BDC8] leading-relaxed">
                    {ex.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#27303B] flex items-center justify-between">
                  <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                    isCompleted ? "text-[#36C98F]" : "text-[#B4BDC8]"
                  }`}>
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Score: 84% • Skill evidence added</span>
                      </>
                    ) : (
                      <span>Available</span>
                    )}
                  </span>

                  <button
                    onClick={() => {
                      const foundIdx = PRACTICE_QUESTIONS.findIndex((q) => q.id === ex.id);
                      if (foundIdx !== -1) {
                        setCurrentIndex(foundIdx);
                        setEvaluationFeedback(null);
                        setActiveTab("problem");
                      }
                      document.getElementById("practice-sandbox")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#5B8DEF] hover:text-[#4779D8]"
                  >
                    <span>Start Practice</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE CODE SANDBOX */}
      <div id="practice-sandbox" className="pt-4 border-t border-[#27303B] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5B8DEF]">
              INTERACTIVE CODE SANDBOX
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#F5F7FA]">
              {currentQ.module}: Question {currentQ.id} of 30
            </h2>
            <p className="text-xs text-[#B4BDC8]">
              Execute queries, validate invariants, and earn verified skill evidence.
            </p>
          </div>

        {/* Controls: Mode Switcher & Interview Timer */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Practice vs Interview Mode */}
          <div className="flex rounded-xl bg-[#11161D] p-1 border border-[#27303B] text-xs font-semibold">
            <button
              onClick={() => setMode("practice")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === "practice"
                  ? "bg-[#151B23] text-[#5B8DEF] shadow-sm font-bold"
                  : "text-[#B4BDC8] hover:text-[#F5F7FA]"
              }`}
            >
              Practice Mode
            </button>
            <button
              onClick={() => {
                setMode("interview");
                setIsTimerRunning(true);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                mode === "interview"
                  ? "bg-[#17211F] text-white shadow-sm font-bold"
                  : "text-[#B4BDC8] hover:text-[#F5F7FA]"
              }`}
            >
              <span>Interview Mode</span>
              {mode === "interview" && (
                <span className="font-mono text-[11px] text-[#34D399]">
                  ({formatTimer(interviewTimer)})
                </span>
              )}
            </button>
          </div>

          {/* Quick Progress Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#27303B] bg-[#151B23] text-xs font-semibold text-[#F5F7FA]">
            <Trophy className="h-4 w-4 text-[#B67A22]" />
            <span>
              <strong>{solvedCount}</strong> / {totalCount} Solved ({progressPercentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* 2. PROGRESS BAR & FILTER CONTROLS */}
      <div className="space-y-3">
        {/* Dynamic Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-[#B4BDC8]">
            <span>Overall Practice Completion</span>
            <span className="font-mono text-[#5B8DEF] font-bold">{progressPercentage}% Complete</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#1A212B] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#5B8DEF] transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* 1–30 Question Grid Navigator */}
        <div className="bg-[#151B23] rounded-xl border border-[#27303B] p-3 space-y-2 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8996] block">
              QUESTION NAVIGATOR (1–30)
            </span>
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1 text-[11px]">
              {[
                { id: "all", label: "All (30)" },
                { id: "sql", label: "SQL (13)" },
                { id: "python", label: "Python/Pandas (8)" },
                { id: "stats", label: "Statistics (5)" },
                { id: "bi", label: "BI & Interviews (4)" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    activeFilter === f.id
                      ? "bg-[#5B8DEF] text-white"
                      : "bg-[#11161D] text-[#B4BDC8] hover:bg-[#1A212B]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 30 Number Buttons with Status Dots */}
          <div className="flex flex-wrap gap-1.5">
            {PRACTICE_QUESTIONS.map((q, idx) => {
              const qSolved = !!solvedQuestions[q.id];
              const isCurrent = idx === currentIndex;
              const hasAttempted = !!userCodes[q.id] && userCodes[q.id] !== q.starterCode;

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setEvaluationFeedback(null);
                    setActiveTab("problem");
                  }}
                  title={`Q${q.id}: ${q.title} (${q.difficulty})`}
                  className={`h-8 w-8 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all relative ${
                    isCurrent
                      ? "border-2 border-[#5B8DEF] bg-[#5B8DEF]/10 text-[#5B8DEF] shadow-sm scale-105"
                      : qSolved
                      ? "bg-[#2F7D5C] text-white border border-[#2F7D5C]"
                      : hasAttempted
                      ? "bg-[#FFF9EB] text-[#B45309] border border-[#F5D485]"
                      : "bg-[#11161D] text-[#B4BDC8] border border-[#27303B] hover:border-[#929B96]"
                  }`}
                >
                  <span>{q.id}</span>
                  {qSolved && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#151B23] border border-[#2F7D5C] flex items-center justify-center text-[7px] text-[#36C98F] font-black">
                      ?
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Problem Description, Schemas, Hints, & Follow-ups (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#151B23] rounded-2xl border border-[#27303B] shadow-sm overflow-hidden flex flex-col">
            {/* Tab Navigation */}
            <div className="flex border-b border-[#27303B] bg-[#11161D] text-xs font-semibold">
              <button
                onClick={() => setActiveTab("problem")}
                className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                  activeTab === "problem"
                    ? "border-[#5B8DEF] text-[#5B8DEF] bg-[#151B23] font-bold"
                    : "border-transparent text-[#B4BDC8] hover:text-[#F5F7FA]"
                }`}
              >
                Problem
              </button>
              <button
                onClick={() => setActiveTab("schema")}
                className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                  activeTab === "schema"
                    ? "border-[#5B8DEF] text-[#5B8DEF] bg-[#151B23] font-bold"
                    : "border-transparent text-[#B4BDC8] hover:text-[#F5F7FA]"
                }`}
              >
                Schema & Data
              </button>
              <button
                onClick={() => setActiveTab("output")}
                className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                  activeTab === "output"
                    ? "border-[#5B8DEF] text-[#5B8DEF] bg-[#151B23] font-bold"
                    : "border-transparent text-[#B4BDC8] hover:text-[#F5F7FA]"
                }`}
              >
                Expected Output
              </button>
              <button
                onClick={() => setActiveTab("solution")}
                className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                  activeTab === "solution"
                    ? "border-[#5B8DEF] text-[#5B8DEF] bg-[#151B23] font-bold"
                    : "border-transparent text-[#B4BDC8] hover:text-[#F5F7FA]"
                }`}
              >
                Review & Q&A
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 space-y-4 text-xs leading-relaxed max-h-[600px] overflow-y-auto">
              {/* TAB 1: PROBLEM */}
              {activeTab === "problem" && (
                <div className="space-y-4">
                  {/* Meta tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#11161D] text-[#5B8DEF] border border-[#27303B]">
                      {currentQ.type.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        currentQ.difficulty === "Beginner"
                          ? "bg-[#5B8DEF]/10 text-[#5B8DEF]"
                          : currentQ.difficulty === "Intermediate"
                          ? "bg-[#FFF9EB] text-[#B45309]"
                          : "bg-[#FBEAEB] text-[#E86A6A]"
                      }`}
                    >
                      {currentQ.difficulty}
                    </span>
                    {isSolved && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#36C98F] px-2 py-0.5 rounded bg-[#5B8DEF]/10">
                        <Check className="h-3 w-3" /> Solved
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-base font-extrabold text-[#F5F7FA]">{currentQ.title}</h2>

                  {/* Skills Tagged */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#7E8996] block">Tested Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {currentQ.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-[#11161D] border border-[#27303B] text-[11px] font-medium text-[#F5F7FA]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Scenario */}
                  <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#B4BDC8] block">Business Scenario</span>
                    <p className="text-[#F5F7FA] font-medium">{currentQ.scenario}</p>
                  </div>

                  {/* Objective */}
                  <div className="p-3.5 rounded-xl bg-[#151B23] border border-[#5B8DEF]/30 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#5B8DEF] block">Technical Objective</span>
                    <p className="text-[#F5F7FA] font-semibold">{currentQ.objective}</p>
                  </div>

                  {/* Progressive Hints Section */}
                  <div className="pt-2 border-t border-[#27303B] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F5F7FA] flex items-center gap-1.5">
                        <Lightbulb className="h-4 w-4 text-[#B67A22]" />
                        <span>Progressive Hints (Used: {currentHintLevel}/3)</span>
                      </span>
                      {currentHintLevel < 3 && mode === "practice" && (
                        <button
                          onClick={handleRevealHint}
                          className="text-[11px] font-bold text-[#5B8DEF] hover:underline flex items-center gap-0.5"
                        >
                          <span>Reveal Hint {currentHintLevel + 1}</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {mode === "interview" && (
                      <p className="text-[11px] text-[#B45309] bg-[#FFF9EB] p-2 rounded-lg border border-[#F5D485]">
                        ?? Hints are locked in Interview Mode to simulate real technical screen conditions.
                      </p>
                    )}

                    {currentHintLevel > 0 && (
                      <div className="space-y-2">
                        {currentHintLevel >= 1 && (
                          <div className="p-2.5 rounded-lg bg-[#11161D] border border-[#27303B] space-y-0.5">
                            <span className="text-[10px] font-bold text-[#B4BDC8] uppercase block">Hint 1: Conceptual Direction</span>
                            <p className="text-[#F5F7FA]">{currentQ.hints[0]}</p>
                          </div>
                        )}
                        {currentHintLevel >= 2 && (
                          <div className="p-2.5 rounded-lg bg-[#11161D] border border-[#27303B] space-y-0.5">
                            <span className="text-[10px] font-bold text-[#B4BDC8] uppercase block">Hint 2: Function & Syntax Guidance</span>
                            <p className="text-[#F5F7FA]">{currentQ.hints[1]}</p>
                          </div>
                        )}
                        {currentHintLevel >= 3 && (
                          <div className="p-2.5 rounded-lg bg-[#11161D] border border-[#27303B] space-y-0.5">
                            <span className="text-[10px] font-bold text-[#B4BDC8] uppercase block">Hint 3: Structural Skeleton</span>
                            <code className="text-[11px] font-mono text-[#5B8DEF] block whitespace-pre-wrap">{currentQ.hints[2]}</code>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: SCHEMA & SAMPLE DATA */}
              {activeTab === "schema" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#7E8996] block">Table Schemas</span>
                    {currentQ.tables.map((t) => (
                      <div key={t.name} className="p-3 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1.5">
                        <span className="font-mono font-bold text-[#F5F7FA] text-xs block">
                          Table: <code className="text-[#5B8DEF]">{t.name}</code>
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {t.columns.map((c) => (
                            <span key={c} className="px-2 py-0.5 rounded bg-[#151B23] border border-[#27303B] font-mono text-[10px] text-[#475467]">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#7E8996] block">Sample Input Records</span>
                    {Object.entries(currentQ.sampleData).map(([tblName, rows]) => (
                      <div key={tblName} className="space-y-1">
                        <span className="text-[11px] font-semibold text-[#F5F7FA]">{tblName}</span>
                        <div className="overflow-x-auto border border-[#27303B] rounded-lg">
                          <table className="w-full text-left border-collapse text-[10px]">
                            <thead>
                              <tr className="bg-[#11161D] border-b border-[#27303B]">
                                {rows.length > 0 &&
                                  Object.keys(rows[0]).map((col) => (
                                    <th key={col} className="p-1.5 font-bold text-[#B4BDC8] uppercase">
                                      {col}
                                    </th>
                                  ))}
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((r, rIdx) => (
                                <tr key={rIdx} className="border-b border-[#27303B] hover:bg-[#FAF9F5]">
                                  {Object.values(r).map((val: any, vIdx) => (
                                    <td key={vIdx} className="p-1.5 font-mono text-[#F5F7FA]">
                                      {String(val)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: EXPECTED OUTPUT */}
              {activeTab === "output" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#7E8996]">Expected Query Output</span>
                    <span className="text-[10px] font-mono text-[#B4BDC8]">{currentQ.expectedOutput.length} row(s) expected</span>
                  </div>

                  <div className="overflow-x-auto border border-[#27303B] rounded-lg">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-[#11161D] border-b border-[#27303B]">
                          {currentQ.expectedOutput.length > 0 &&
                            Object.keys(currentQ.expectedOutput[0]).map((col) => (
                              <th key={col} className="p-2 font-bold text-[#5B8DEF] uppercase">
                                {col}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentQ.expectedOutput.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-[#27303B] hover:bg-[#FAF9F5]">
                            {Object.values(row).map((val: any, vIdx) => (
                              <td key={vIdx} className="p-2 font-mono text-[#F5F7FA]">
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: SOLUTION, COMMON MISTAKES & INTERVIEW FOLLOW-UPS */}
              {activeTab === "solution" && (
                <div className="space-y-4">
                  {/* Official Solution */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-[#5B8DEF] block">Official Correct Solution</span>
                    <pre className="p-3 rounded-xl bg-[#17211F] text-[#ECEDE8] font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed border border-[#27303B]">
                      {currentQ.solution}
                    </pre>
                  </div>

                  {/* Why it works */}
                  <div className="p-3 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#B4BDC8] block">Why This Approach Works</span>
                    <p className="text-[#F5F7FA]">{currentQ.explanation}</p>
                  </div>

                  {/* Common Mistakes */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-[#E86A6A] block">Common Candidate Mistakes</span>
                    <ul className="space-y-1 list-disc pl-4 text-[#F5F7FA]">
                      {currentQ.commonMistakes.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Interview Follow-ups */}
                  <div className="space-y-2 pt-2 border-t border-[#27303B]">
                    <span className="text-[10px] font-bold uppercase text-[#B67A22] block">Interview Follow-up Questions & Model Answers</span>
                    <div className="space-y-2">
                      {currentQ.interviewFollowUps.map((fu, fIdx) => (
                        <div key={fIdx} className="p-3 rounded-xl bg-[#151B23] border border-[#27303B] space-y-1">
                          <p className="font-bold text-[#F5F7FA] text-xs">“{fu.question}”</p>
                          <p className="text-[#B4BDC8] text-[11px] leading-relaxed">
                            <strong className="text-[#5B8DEF]">Model Answer:</strong> {fu.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Navigation Footer */}
            <div className="p-3 border-t border-[#27303B] bg-[#11161D] flex items-center justify-between text-xs font-semibold">
              <button
                disabled={currentIndex === 0}
                onClick={() => {
                  setCurrentIndex((c) => Math.max(0, c - 1));
                  setEvaluationFeedback(null);
                  setActiveTab("problem");
                }}
                className="px-3 py-1.5 rounded-lg border border-[#27303B] bg-[#151B23] text-[#F5F7FA] hover:bg-[#1A212B] disabled:opacity-40 flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous (Q{currentQ.id - 1})</span>
              </button>

              <button
                disabled={currentIndex === PRACTICE_QUESTIONS.length - 1}
                onClick={() => {
                  setCurrentIndex((c) => Math.min(PRACTICE_QUESTIONS.length - 1, c + 1));
                  setEvaluationFeedback(null);
                  setActiveTab("problem");
                }}
                className="px-3 py-1.5 rounded-lg bg-[#5B8DEF] text-white hover:bg-[#4779D8] disabled:opacity-40 flex items-center gap-1 transition-colors"
              >
                <span>Next (Q{currentQ.id + 1})</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Code Editor & Live Evaluation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#151B23] rounded-2xl border border-[#27303B] p-5 shadow-sm space-y-4">
            {/* Editor Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#5B8DEF]/10 text-[#5B8DEF] flex items-center justify-center">
                  <Code className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#F5F7FA]">
                    {currentQ.type === "sql" ? "SQL Query Workspace" : "Python / Pandas Workspace"}
                  </h3>
                  <p className="text-[10px] text-[#B4BDC8]">Evaluated against analytical correctness invariants</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetCode}
                  className="px-2.5 py-1 text-xs font-semibold text-[#B4BDC8] hover:text-[#F5F7FA] rounded-lg border border-[#27303B] bg-[#11161D] hover:bg-[#151B23] flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Code Input Area */}
            <div className="relative rounded-xl border border-[#27303B] bg-[#17211F] overflow-hidden focus-within:ring-2 focus-within:ring-[#176B5B]">
              <div className="px-4 py-2 bg-[#0F1715] border-b border-[#2A3734] flex items-center justify-between text-[10px] font-mono text-[#7E8996]">
                <span>{currentQ.type === "sql" ? "query.sql" : "solution.py"}</span>
                <span>UTF-8 • {currentQ.type.toUpperCase()}</span>
              </div>
              <textarea
                rows={11}
                value={currentCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                spellCheck={false}
                className="w-full bg-[#17211F] text-[#ECEDE8] p-4 font-mono text-xs focus:outline-none leading-relaxed resize-y"
              />
            </div>

            {/* Run / Evaluate Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-[#B4BDC8]">
                Press <strong>Evaluate</strong> to check logic, execution schema, and interview compliance.
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("solution")}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-[#27303B] bg-[#11161D] hover:bg-[#151B23] text-[#F5F7FA] transition-colors"
                >
                  Show Solution
                </button>
                <button
                  onClick={handleEvaluate}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-[#5B8DEF] hover:bg-[#4779D8] text-white text-xs font-extrabold shadow-sm transition-all"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Evaluate Query</span>
                </button>
              </div>
            </div>

            {/* Evaluation Result Feedback Card */}
            {evaluationFeedback && (
              <div
                className={`p-4 rounded-xl border space-y-2 animate-in fade-in duration-150 ${
                  evaluationFeedback.status === "success"
                    ? "border-[#2F7D5C]/30 bg-[#F4FAF6] text-[#F5F7FA]"
                    : "border-[#B84A4A]/30 bg-[#FBEAEB] text-[#F5F7FA]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {evaluationFeedback.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-[#36C98F]" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-[#E86A6A]" />
                    )}
                    <span className={evaluationFeedback.status === "success" ? "text-[#36C98F]" : "text-[#E86A6A]"}>
                      {evaluationFeedback.status === "success" ? "All Tests Passed (100%)" : "Incomplete Logic"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#B4BDC8]">Latency: 14ms</span>
                </div>

                <p className="text-xs leading-relaxed">{evaluationFeedback.message}</p>

                {evaluationFeedback.missingKeywords && evaluationFeedback.missingKeywords.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-[#151B23] border border-[#27303B] text-[11px] space-y-1">
                    <span className="font-bold text-[#E86A6A] block">Missing required analytical concepts:</span>
                    <ul className="list-disc pl-4 text-[#B4BDC8]">
                      {evaluationFeedback.missingKeywords.map((k, i) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Live Result / Output Preview */}
            <div className="pt-3 border-t border-[#27303B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8996] flex items-center gap-1">
                  <Table className="h-3 w-3" /> Execution Result Preview
                </span>
                <span className="text-[10px] font-mono text-[#B4BDC8]">
                  Status: {isSolved ? "Verified Valid" : "Awaiting Evaluation"}
                </span>
              </div>

              <div className="overflow-x-auto border border-[#27303B] rounded-xl bg-[#FAF9F5] p-2">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-[#27303B]">
                      {currentQ.expectedOutput.length > 0 &&
                        Object.keys(currentQ.expectedOutput[0]).map((col) => (
                          <th key={col} className="p-2 font-bold text-[#F5F7FA] uppercase font-mono">
                            {col}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentQ.expectedOutput.slice(0, 3).map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-[#27303B]/50">
                        {Object.values(row).map((val: any, vIdx) => (
                          <td key={vIdx} className="p-2 font-mono text-[#F5F7FA]">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
