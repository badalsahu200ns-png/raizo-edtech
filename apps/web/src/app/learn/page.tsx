"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Send,
  BookOpen,
  User,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Layers,
  Target,
  Sparkles,
  HelpCircle,
  X,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Database,
  FileSpreadsheet,
  Code2,
  Award,
  Zap,
  ArrowRight,
  Flame,
  Clock
} from "lucide-react";
import { api } from "@/lib/api";
import { TutorMessage } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { RaizoMark } from "@/components/RaizoLogo";
import { DataLabSection } from "@/components/data-lab/DataLabSection";

interface StudyCard {
  id: string;
  category: string;
  title: string;
  summary: string;
  ruleOrCode: string;
  interviewNote: string;
}

const STUDY_CARDS: StudyCard[] = [
  {
    id: "sc-1",
    category: "SQL Window Functions",
    title: "DENSE_RANK vs RANK vs ROW_NUMBER",
    summary: "Window ranking assigns ranks within partitions without collapsing row counts.",
    ruleOrCode: "ROW_NUMBER(): 1, 2, 3, 4 (strictly unique sequential)\nRANK():       1, 2, 2, 4 (skips rank after duplicates)\nDENSE_RANK(): 1, 2, 2, 3 (no gaps/skips after ties)",
    interviewNote: "DENSE_RANK is mandatory for questions like 'find Nth highest salary per department' to avoid missing valid subsequent tiers."
  },
  {
    id: "sc-2",
    category: "Statistics & EDA",
    title: "Skewness & Central Tendency Rules",
    summary: "How distribution asymmetry impacts the relative positions of Mean, Median, and Mode.",
    ruleOrCode: "Right-Skewed (Positive): Mean > Median > Mode (extreme high outliers pull the mean)\nNormal (Symmetric):      Mean = Median = Mode\nLeft-Skewed (Negative):  Mode > Median > Mean (extreme low outliers pull the mean)",
    interviewNote: "Always use Median for right-skewed metric distributions (income, house prices, customer lifetime value) because it is robust to outliers."
  },
  {
    id: "sc-3",
    category: "Data Visualization",
    title: "Chart Selection Invariants",
    summary: "Rules for selecting the appropriate visualization based on variable count and relationship type.",
    ruleOrCode: "Continuous over Time:     Line Chart\nDiscrete Categories:       Bar Chart (horizontal if labels are long)\nBivariate Correlation:     Scatter Plot\nSpread & Outlier Auditing: Box Plot / Histogram\nPart-to-Whole (>5 items):  Treemap or Stacked 100% Bar (avoid pie charts)",
    interviewNote: "Never use pie charts with more than 4 slices. Use box plots to visually prove outlier bounds (Q1 - 1.5*IQR to Q3 + 1.5*IQR)."
  },
  {
    id: "sc-4",
    category: "Pandas & Python",
    title: "Merge vs Join vs Groupby Invariants",
    summary: "Core idioms for combining and summarizing DataFrames.",
    ruleOrCode: "Merge: pd.merge(df1, df2, on='key', how='inner'|'left'|'right'|'outer')\nGroupby: df.groupby('cat')['val'].agg(['mean', 'count', 'std'])\nImputation: df['val'] = df['val'].fillna(df['val'].median())",
    interviewNote: "Always check df.shape before and after merges to catch accidental Cartesian explosion from non-unique join keys."
  },
  {
    id: "sc-5",
    category: "Excel & Spreadsheets",
    title: "Modern Lookup & Aggregation Rules",
    summary: "Modern Excel replaces fragile VLOOKUP with XLOOKUP and multi-criteria SUMIFS.",
    ruleOrCode: "XLOOKUP: =XLOOKUP(lookup_val, lookup_array, return_array, \"Not Found\", 0)\nSUMIFS:  =SUMIFS(sum_range, criteria_range1, crit1, criteria_range2, crit2)",
    interviewNote: "XLOOKUP does not require sorting, searches left or right, and defaults to exact match without index offsets."
  }
];

const CURRICULUM_MODULES = [
  { id: "mod_sql", title: "SQL Window Functions & Joins", icon: Database, questionsCount: "Q1–Q7" },
  { id: "mod_stats", title: "Descriptive Statistics & Distributions", icon: BarChart3, questionsCount: "Q8–Q11" },
  { id: "mod_excel", title: "Excel Analytics & Spreadsheets", icon: FileSpreadsheet, questionsCount: "Q12–Q14" },
  { id: "mod_py", title: "Python & Pandas Wrangling", icon: Code2, questionsCount: "Q15–Q22" },
  { id: "mod_bi", title: "Business Intelligence & KPIs", icon: Sparkles, questionsCount: "Q23–Q26" },
  { id: "mod_int", title: "Technical Interview Problem Solving", icon: Target, questionsCount: "Q27–Q30" },
];

function LearnContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "SQL Window Functions";

  const [activeTopic, setActiveTopic] = useState(initialTopic);
  const [mode, setMode] = useState<string>("socratic");
  const [showHandbook, setShowHandbook] = useState(false);
  const [selectedCard, setSelectedCard] = useState<StudyCard | null>(null);

  const tabParam = searchParams.get("tab");
  const [mainTab, setMainTab] = useState<"curriculum" | "data-lab">(
    tabParam === "data-lab" ? "data-lab" : "curriculum"
  );

  useEffect(() => {
    if (tabParam === "data-lab") {
      setMainTab("data-lab");
    }
  }, [tabParam]);

  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      role: "assistant",
      content: `Hello ${user?.name ? user.name.split(" ")[0] : "Alex"}. I am your RAIZO Tutor. I am here to help you build practical, job-ready skills for your target role as a Data Analyst.\n\nYour current focus area is **${initialTopic}**. How can I help you today? Would you like a concept explanation, a practical example, or guided practice?`,
      mode: "socratic",
      suggested_follow_ups: [
        "Explain the difference between PARTITION BY and GROUP BY",
        "Give me a dense ranking example with salary data",
        "Why does DENSE_RANK not skip numbers on ties?",
        "Test me with an applied query question"
      ]
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const contextualControls = [
    { label: "Explain differently", prompt: "Could you explain this concept from an alternative angle using an intuitive real-world analogy?" },
    { label: "Give example", prompt: "Provide a concrete SQL code snippet demonstrating this with sample input and output tables." },
    { label: "Give me a hint", prompt: "Give me a gentle conceptual hint on how to structure this query without revealing the full solution." },
    { label: "Test me", prompt: "Pose a short analytical question or edge-case scenario to test my mental model on this concept." },
    { label: "Show mistake", prompt: "What is the most common syntax or logic mistake practitioners make when writing this query?" },
    { label: "Generate practice", prompt: "Generate an applied practice problem for this topic that I can solve in the practice sandbox." }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isTyping) return;

    const userMsg: TutorMessage = {
      role: "user",
      content: query,
      mode
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const res = await api.sendTutorMessage({
        user_id: user?.id,
        message: query,
        mode,
        current_node_id: activeTopic
      });
      setMessages((prev) => [...prev, res]);
    } catch (err) {
      console.error("Tutor error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I encountered a transient network connection error. Please try again.",
          mode
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      {/* 1. UNIFIED PAGE HEADER */}
      <div className="raizo-page-header">
        <div className="space-y-1.5">
          <span className="raizo-page-eyebrow">
            <span className="h-2 w-2 rounded-full bg-[#5B8DEF]" />
            LEARNING
          </span>
          <h1 className="raizo-page-title">
            Learn by doing.
          </h1>
          <p className="raizo-page-desc">
            Build practical skills through guided learning, real datasets, assessments, and applied projects.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#B4BDC8] pt-1">
            <span className="text-[10px] font-bold uppercase text-[#7E8996]">Progression:</span>
            <span className="text-[#F5F7FA] font-bold">TARGETED CONCEPT</span>
            <span className="text-[#5B8DEF] font-bold">→</span>
            <span className="text-[#38BDF8] font-bold">GUIDED INTUITION</span>
            <span className="text-[#5B8DEF] font-bold">→</span>
            <span className="text-[#36C98F] font-bold">APPLIED FOUNDATION</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowHandbook(!showHandbook)}
            className="raizo-btn-secondary"
          >
            <BookOpen className="h-4 w-4 text-[#5B8DEF]" />
            <span>Study Handbook</span>
          </button>
          <Link
            href="/practice"
            className="raizo-btn-primary"
          >
            <span>Go to Practice</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Docked Tab Switcher (Huddlekit style) */}
      <div className="flex items-center gap-2 pb-2">
        <button
          type="button"
          onClick={() => setMainTab("curriculum")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            mainTab === "curriculum"
              ? "bg-[#5B8DEF] text-white shadow-xs"
              : "bg-[#151B23] text-[#B4BDC8] hover:bg-[#18202A] hover:text-[#F5F7FA] border border-[#27303B]"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curriculum & AI Tutor</span>
        </button>
        <button
          type="button"
          onClick={() => setMainTab("data-lab")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            mainTab === "data-lab"
              ? "bg-[#5B8DEF] text-white shadow-xs"
              : "bg-[#151B23] text-[#B4BDC8] hover:bg-[#18202A] hover:text-[#F5F7FA] border border-[#27303B]"
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Data Analysis Lab</span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#F97316] text-white uppercase">
            New
          </span>
        </button>
      </div>

      {mainTab === "data-lab" ? (
        <DataLabSection />
      ) : (
        <>
          {/* Data Lab Highlight Card */}
          <div className="rounded-2xl border border-[#5B8DEF]/30 bg-gradient-to-r from-[#18202A] via-[#151B23] to-[#11161D] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-[#5B8DEF]/10 text-[#5B8DEF] flex items-center justify-center shrink-0">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8DEF] bg-[#5B8DEF]/10 px-2 py-0.5 rounded-md">
                    Interactive Lab
                  </span>
                  <span className="text-xs font-bold text-[#F5F7FA]">RAIZO Data Analysis Lab</span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Upload real CSV or Excel datasets to audit missingness, detect IQR outliers, deduplicate rows, and explore correlations.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMainTab("data-lab")}
              className="raizo-btn-primary whitespace-nowrap"
            >
              <span>Launch Data Lab</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 2. LEARNING RECOMMENDATION BANNER */}
          <div className="rounded-xl border border-[#5B8DEF]/30 bg-[#151B23] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-[#5B8DEF]/10 text-[#5B8DEF] flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5B8DEF]">
                  Learning Recommendation
                </h4>
                <p className="text-xs text-[#F5F7FA] font-medium">
                  Your SQL assessment indicates that Window Functions need more practice.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <Link
                href="/practice"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#5B8DEF] text-white text-xs font-bold hover:bg-[#4779D8] transition-colors"
              >
                <span>Practice Window Functions</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

      {/* 3. TWO-PANE TUTOR WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[580px]">
        {/* LEFT PANE: Learning Context & Modules */}
        <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-5 space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7E8996] block">
              TOPIC FOCUS
            </span>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
                <span className="text-[10px] font-semibold text-[#B4BDC8] uppercase block">
                  Current Skill
                </span>
                <span className="font-bold text-[#F5F7FA] text-sm block">
                  {activeTopic}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
                <span className="text-[10px] font-semibold text-[#B4BDC8] uppercase block">
                  Target Role Alignment
                </span>
                <span className="font-semibold text-[#F5F7FA] block">
                  Data Analyst • Core Competency
                </span>
              </div>
            </div>

            {/* Curriculum Modules */}
            <div className="space-y-2 pt-2 border-t border-[#27303B]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7E8996] block">
                CURRICULUM TOPICS
              </span>
              <div className="space-y-1">
                {CURRICULUM_MODULES.map((mod) => {
                  const Icon = mod.icon;
                  const isSelected = activeTopic.includes(mod.title.split(" ")[0]);
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        setActiveTopic(mod.title);
                        handleSendMessage(`Let's focus on ${mod.title}. Please provide a clear explanation with practical examples for a Data Analyst role.`);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-[#5B8DEF]/10 text-[#5B8DEF] font-bold border border-[#5B8DEF]/30"
                          : "hover:bg-[#11161D] text-[#B4BDC8]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate max-w-[140px]">{mod.title}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-70">{mod.questionsCount}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#27303B] flex items-center justify-between text-xs text-[#B4BDC8]">
            <span>Target Role: <strong className="text-[#F5F7FA]">Data Analyst</strong></span>
            <Link href="/practice" className="text-[#5B8DEF] font-semibold hover:underline flex items-center gap-0.5">
              <span>Practice Exercises</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* RIGHT PANE: Tutor Conversation Stream */}
        <div className="lg:col-span-2 rounded-2xl border border-[#27303B] bg-[#151B23] flex flex-col shadow-xs overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[460px]">
            {messages.map((msg, index) => {
              const isAssistant = msg.role === "assistant";

              return (
                <div
                  key={index}
                  className={`flex gap-3 text-xs sm:text-sm leading-relaxed ${
                    isAssistant ? "items-start" : "items-start flex-row-reverse"
                  }`}
                >
                  {isAssistant ? (
                    <div className="h-8 w-8 rounded-xl bg-[#5B8DEF]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <RaizoMark size={18} />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-xl bg-[#17211F] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      <User className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl p-4 max-w-[85%] space-y-2.5 ${
                      isAssistant
                        ? "bg-[#11161D] border border-[#27303B] text-[#F5F7FA]"
                        : "bg-[#5B8DEF] text-white"
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans leading-relaxed">
                      {msg.content}
                    </div>

                    {/* Follow-up suggestions */}
                    {isAssistant && msg.suggested_follow_ups && msg.suggested_follow_ups.length > 0 && (
                      <div className="pt-2 border-t border-[#27303B] space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B4BDC8] block">
                          Suggested Questions:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggested_follow_ups.map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(suggestion)}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#151B23] border border-[#27303B] text-[#F5F7FA] hover:border-[#5B8DEF] hover:text-[#5B8DEF] transition-colors text-left font-medium"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center space-x-2 text-xs text-[#B4BDC8] p-2">
                <div className="h-2 w-2 rounded-full bg-[#5B8DEF] animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-[#5B8DEF] animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 rounded-full bg-[#5B8DEF] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-[#7E8996] ml-2">RAIZO Tutor is composing response...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Contextual Action Chips */}
          <div className="border-t border-[#27303B] bg-[#11161D]/60 px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-[10px] font-bold uppercase text-[#7E8996] shrink-0 mr-1">
              Ask:
            </span>
            {contextualControls.map((ctrl) => (
              <button
                key={ctrl.label}
                onClick={() => handleSendMessage(ctrl.prompt)}
                disabled={isTyping}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-[#151B23] border border-[#27303B] text-[#F5F7FA] hover:border-[#5B8DEF] hover:text-[#5B8DEF] transition-colors font-medium text-[11px] disabled:opacity-50"
              >
                {ctrl.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-[#27303B] bg-[#151B23]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Ask RAIZO Tutor about ${activeTopic}...`}
                disabled={isTyping}
                className="flex-1 rounded-xl border border-[#27303B] bg-[#11161D] px-4 py-2.5 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none disabled:opacity-50 shadow-xs"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#5B8DEF] text-white hover:bg-[#4779D8] disabled:opacity-40 transition-colors shrink-0 shadow-xs"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. STUDY HANDBOOK SLIDE-OVER */}
      {showHandbook && (
        <div className="fixed inset-0 z-50 bg-[#17211F]/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-[#151B23] h-full shadow-2xl p-6 overflow-y-auto space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#27303B]">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-[#5B8DEF]" />
                  <h3 className="text-sm font-bold text-[#F5F7FA]">Study Handbook & Concepts</h3>
                </div>
                <button
                  onClick={() => setShowHandbook(false)}
                  className="rounded-lg p-1.5 text-[#7E8996] hover:bg-[#1A212B] hover:text-[#F5F7FA]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-[#B4BDC8]">
                Key conceptual summaries to review while discussing with your tutor.
              </p>

              <div className="space-y-3">
                {STUDY_CARDS.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className="p-4 rounded-xl border border-[#27303B] bg-[#11161D] hover:border-[#5B8DEF] transition-colors cursor-pointer space-y-1.5"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8DEF]">
                      {card.category}
                    </span>
                    <h4 className="text-xs font-bold text-[#F5F7FA]">{card.title}</h4>
                    <p className="text-[11px] text-[#B4BDC8] line-clamp-2 leading-relaxed">
                      {card.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowHandbook(false)}
              className="w-full py-2 rounded-xl bg-[#17211F] text-white text-xs font-bold"
            >
              Close Handbook
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#B4BDC8]">Loading RAIZO Tutor...</div>}>
      <LearnContent />
    </Suspense>
  );
}
