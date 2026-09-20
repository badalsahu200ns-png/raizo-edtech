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
  Zap
} from "lucide-react";
import { api } from "@/lib/api";
import { TutorMessage } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { RaizoMark } from "@/components/RaizoLogo";

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

function TutorContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "SQL Window Functions";

  const [activeTopic, setActiveTopic] = useState(initialTopic);
  const [mode, setMode] = useState<string>("socratic");
  const [showHandbook, setShowHandbook] = useState(false);
  const [selectedCard, setSelectedCard] = useState<StudyCard | null>(null);

  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      role: "assistant",
      content: `Hello ${user?.name ? user.name.split(" ")[0] : "Alex"}. I am RAIZO Tutor. I maintain direct visibility into your diagnostic checkpoints, identified prerequisite gaps, and active learning path.\n\nWe are currently focused on **${initialTopic}**—specifically understanding how \`PARTITION BY\` preserves row granularity unlike a \`GROUP BY\` aggregation. How would you like to explore this?`,
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

  const isGuardrailResponse = (text: string) => {
    return text.includes("I'm RAIZO Tutor, focused on Data Analytics");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 py-2">
      {/* Top Header (Section 3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#27303B] pb-3 gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F5F7FA]">
            RAIZO Tutor
          </h1>
          <p className="text-xs font-medium text-[#B4BDC8]">
            Your AI learning companion for building job-ready skills.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHandbook(!showHandbook)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27303B] bg-[#151B23] hover:border-[#5B8DEF] hover:text-[#5B8DEF] text-xs font-semibold text-[#F5F7FA] transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#5B8DEF]" />
            <span>Curriculum Handbook & Study Cards</span>
          </button>
          <span className="text-xs text-[#B4BDC8] flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#2F7D5C]" />
            <span>Curriculum Memory Connected</span>
          </span>
        </div>
      </div>

      {/* Two-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-14rem)] min-h-[580px]">
        {/* LEFT PANE: Learning Context & Modules */}
        <div className="rounded-xl border border-[#27303B] bg-[#151B23] p-5 space-y-4 flex flex-col justify-between shadow-sm overflow-y-auto">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7E8996] block">
              ACTIVE LEARNING CONTEXT
            </span>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#11161D] border border-[#27303B] space-y-1">
                <span className="text-[10px] font-semibold text-[#B4BDC8] uppercase block">
                  Current Skill
                </span>
                <span className="font-bold text-[#F5F7FA] text-sm block">
                  {activeTopic}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#11161D] border border-[#27303B] space-y-1">
                <span className="text-[10px] font-semibold text-[#B4BDC8] uppercase block">
                  Assessed Level
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#F5F7FA]">Intermediate (68%)</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#5B8DEF]/10 text-[#5B8DEF]">
                    Developing
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#11161D] border border-[#27303B] space-y-1">
                <span className="text-[10px] font-semibold text-[#B4BDC8] uppercase block">
                  Current Objective
                </span>
                <p className="text-[#F5F7FA] font-medium leading-relaxed">
                  Master <code className="font-mono text-[11px] bg-[#151B23] px-1 py-0.5 rounded border border-[#27303B]">PARTITION BY</code> clauses and tie-breaking ranking functions without collapsing records.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#11161D] border border-[#27303B] space-y-1">
                <span className="text-[10px] font-semibold text-[#B4BDC8] uppercase block">
                  Prerequisite Friction
                </span>
                <p className="text-[#B67A22] font-medium leading-relaxed">
                  Confusing window partitioning with GROUP BY multi-column aggregation.
                </p>
              </div>
            </div>

            {/* Quick Curriculum Modules Switcher */}
            <div className="space-y-2 pt-2 border-t border-[#27303B]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7E8996] block">
                LEARNING TRACKS
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
                        handleSendMessage(`Let's shift focus to ${mod.title}. Give me an executive conceptual overview and a high-yield interview question.`);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-[#5B8DEF]/10 text-[#5B8DEF] font-bold border border-[#5B8DEF]/30"
                          : "hover:bg-[#11161D] text-[#475467]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
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

          <div className="pt-3 border-t border-[#27303B] flex items-center justify-between text-[11px] text-[#B4BDC8]">
            <span>Target Role: <strong>Data Analyst</strong></span>
            <Link href="/practice" className="text-[#5B8DEF] font-semibold hover:underline flex items-center gap-0.5">
              <span>Practice 30 Qs</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* RIGHT PANE: Tutor Conversation Stream */}
        <div className="lg:col-span-2 rounded-xl border border-[#27303B] bg-[#151B23] flex flex-col shadow-sm overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, index) => {
              const isAssistant = msg.role === "assistant";
              const isGuardrail = isAssistant && isGuardrailResponse(msg.content);

              return (
                <div
                  key={index}
                  className={`flex gap-3 text-xs sm:text-sm leading-relaxed ${
                    isAssistant ? "items-start" : "items-start flex-row-reverse"
                  }`}
                >
                  {isAssistant ? (
                    <div className="h-7 w-7 rounded-lg bg-[#5B8DEF]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <RaizoMark size={18} />
                    </div>
                  ) : (
                    <div className="h-7 w-7 rounded-lg bg-[#17211F] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`rounded-xl p-4 max-w-[85%] space-y-2 ${
                      isGuardrail
                        ? "bg-[#FFF9EB] border border-[#F5D485] text-[#78350F]"
                        : isAssistant
                        ? "bg-[#11161D] border border-[#27303B] text-[#F5F7FA]"
                        : "bg-[#5B8DEF] text-white"
                    }`}
                  >
                    {isGuardrail && (
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#B45309] pb-1 border-b border-[#F5D485]">
                        <Lightbulb className="h-3.5 w-3.5 text-[#B45309]" />
                        <span>Domain Scope Boundary</span>
                      </div>
                    )}

                    <div className="whitespace-pre-line font-sans leading-relaxed">
                      {msg.content}
                    </div>

                    {/* Follow-up suggestions if assistant */}
                    {isAssistant && msg.suggested_follow_ups && msg.suggested_follow_ups.length > 0 && (
                      <div className="pt-2 border-t border-[#27303B] space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B4BDC8] block">
                          Explore Further:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggested_follow_ups.map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(suggestion)}
                              className="text-[11px] px-2.5 py-1 rounded-md bg-[#151B23] border border-[#27303B] text-[#F5F7FA] hover:border-[#5B8DEF] hover:text-[#5B8DEF] transition-colors text-left font-medium"
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
              <div className="flex items-center space-x-2 text-xs text-[#B4BDC8] pl-10">
                <span className="h-2 w-2 rounded-full bg-[#5B8DEF] animate-pulse" />
                <span>Raizo is reasoning through the curriculum invariants...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Contextual Quick-Action Controls */}
          <div className="p-3 border-t border-[#27303B] bg-[#11161D] flex flex-wrap gap-1.5">
            {contextualControls.map((ctl) => (
              <button
                key={ctl.label}
                onClick={() => handleSendMessage(ctl.prompt)}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#151B23] border border-[#27303B] text-[#F5F7FA] hover:border-[#5B8DEF] hover:text-[#5B8DEF] transition-colors"
              >
                {ctl.label}
              </button>
            ))}
          </div>

          {/* Bottom Prompt Bar: Ask RAIZO */}
          <div className="p-3 bg-[#151B23] border-t border-[#27303B]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Ask RAIZO about this concept, syntax, or edge-case..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 rounded-xl border border-[#27303B] bg-[#11161D] px-4 py-2.5 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="px-4 py-2.5 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold hover:bg-[#4779D8] transition-all disabled:opacity-40 shrink-0 flex items-center gap-1.5"
              >
                <span>Ask</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Curriculum Handbook & Study Cards Modal */}
      {showHandbook && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151B23] rounded-2xl border border-[#27303B] shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#27303B] flex items-center justify-between bg-[#11161D]">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#5B8DEF]" />
                <div>
                  <h3 className="font-extrabold text-[#F5F7FA] text-base">Data Analytics Curriculum Handbook & Study Cards</h3>
                  <p className="text-xs text-[#B4BDC8]">Essential mental models, distribution laws, and chart selection invariants</p>
                </div>
              </div>
              <button
                onClick={() => setShowHandbook(false)}
                className="p-1.5 rounded-lg hover:bg-[#DDE1DD] text-[#B4BDC8] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {STUDY_CARDS.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className="p-4 rounded-xl border border-[#27303B] hover:border-[#5B8DEF] hover:shadow-sm transition-all cursor-pointer bg-[#151B23] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8DEF] px-2 py-0.5 rounded bg-[#5B8DEF]/10">
                        {card.category}
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#7E8996]" />
                    </div>
                    <h4 className="font-bold text-sm text-[#F5F7FA]">{card.title}</h4>
                    <p className="text-xs text-[#B4BDC8] line-clamp-2">{card.summary}</p>
                    <pre className="text-[10px] font-mono bg-[#11161D] p-2 rounded border border-[#27303B] text-[#F5F7FA] overflow-x-auto whitespace-pre">
                      {card.ruleOrCode}
                    </pre>
                  </div>
                ))}
              </div>

              {/* Detail view for selected study card */}
              {selectedCard && (
                <div className="p-4 rounded-xl bg-[#11161D] border border-[#5B8DEF]/30 space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5B8DEF]">{selectedCard.category} • Deep Dive</span>
                    <button
                      onClick={() => {
                        setShowHandbook(false);
                        handleSendMessage(`Explain the interview concept: ${selectedCard.title}. Specifically: ${selectedCard.interviewNote}`);
                      }}
                      className="text-xs font-bold text-[#5B8DEF] hover:underline flex items-center gap-1"
                    >
                      <span>Ask Tutor about this card</span>
                      <Send className="h-3 w-3" />
                    </button>
                  </div>
                  <h4 className="text-sm font-extrabold text-[#F5F7FA]">{selectedCard.title}</h4>
                  <pre className="text-xs font-mono bg-[#151B23] p-3 rounded-lg border border-[#27303B] text-[#F5F7FA] whitespace-pre-wrap">
                    {selectedCard.ruleOrCode}
                  </pre>
                  <div className="p-2.5 rounded-lg bg-[#5B8DEF]/10 text-xs text-[#5B8DEF]">
                    <strong>Interview Invariant:</strong> {selectedCard.interviewNote}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#27303B] bg-[#11161D] flex items-center justify-between text-xs text-[#B4BDC8]">
              <span>Aligned with the 30 Applied Practice Problems & 25-Question Diagnostic</span>
              <button
                onClick={() => setShowHandbook(false)}
                className="px-4 py-1.5 rounded-lg bg-[#17211F] text-white text-xs font-bold hover:bg-[#2A3734] transition-colors"
              >
                Close Handbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#B4BDC8]">Loading Tutor...</div>}>
      <TutorContent />
    </Suspense>
  );
}
