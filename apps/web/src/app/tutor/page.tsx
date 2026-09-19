"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Brain,
  Send,
  Sparkles,
  BookOpen,
  ExternalLink,
  Bot,
  User,
  Lightbulb,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { api } from "@/lib/api";
import { TutorMessage } from "@/lib/types";

function TutorContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "Pandas Data Cleaning";

  const [mode, setMode] = useState<string>("socratic");
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      role: "assistant",
      content: `Hello Alex! I am your Socratic Tutor. I have access to your active Data Analyst roadmap, your recent checkpoint submissions, and verified curriculum documentation.\n\nCurrently, we are focused on **${initialTopic}** where we diagnosed a critical prerequisite friction with missing value imputation. How would you like to begin?`,
      mode: "socratic",
      suggested_follow_ups: [
        "What is a SQL window function?",
        "When should I use median vs mean for missing data?",
        "Why did my roadmap insert a remediation node?",
        "Give me an applied practice question."
      ]
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const modes = [
    { id: "socratic", label: "Socratic", desc: "Guided questions to test mental models" },
    { id: "beginner", label: "Beginner", desc: "Jargon-free fundamentals" },
    { id: "technical", label: "Technical", desc: "Code syntax & edge cases" },
    { id: "analogy", label: "Analogy", desc: "Real-world visual metaphors" },
    { id: "practice", label: "Practice", desc: "Scenario problem-solving" },
    { id: "interview", label: "Interview", desc: "Data Analyst interview prep" },
    { id: "project_mentor", label: "Project Mentor", desc: "Capstone architectural advice" }
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
        user_id: "demo_learner_alex",
        message: query,
        mode,
        current_node_id: initialTopic
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4 h-[calc(100vh-5rem)] flex flex-col">
      {/* Top Mode Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Raizo Tutor
              <span className="rounded bg-cyan-500/20 text-cyan-300 text-[10px] px-2 py-0.5 font-bold border border-cyan-500/30">
                RAG Grounded
              </span>
            </h1>
            <span className="text-[11px] text-slate-400">Context: Alex Rivera • Data Analyst • {initialTopic}</span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="hidden sm:flex items-center space-x-1 rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
          {modes.slice(0, 5).map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                mode === m.id
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
              title={m.desc}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={idx}
              className={`flex space-x-3 text-sm ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 space-y-3 leading-relaxed ${
                  isUser
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "border border-white/10 bg-[#0e1628] text-slate-200 shadow-xl"
                }`}
              >
                <div className="whitespace-pre-wrap text-xs sm:text-sm">{msg.content}</div>

                {/* Sources Used (RAG Citations) */}
                {msg.sources_used && msg.sources_used.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> Grounded Curriculum Citations:
                    </span>
                    <div className="space-y-1">
                      {msg.sources_used.map((source, sIdx) => (
                        <a
                          key={sIdx}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-lg bg-black/40 px-2.5 py-1.5 text-[11px] text-slate-300 hover:text-cyan-300 border border-white/5 transition-colors group"
                        >
                          <span className="font-semibold truncate">{source.title} ({source.provider_or_source})</span>
                          <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Follow-Ups */}
                {msg.suggested_follow_ups && msg.suggested_follow_ups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {msg.suggested_follow_ups.map((fu, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSendMessage(fu)}
                        className="rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-2.5 py-1 text-[11px] text-indigo-300 hover:bg-indigo-900/50 transition-colors text-left"
                      >
                        {fu}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-slate-300 shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 pl-11">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
            <span>Raizo Tutor is evaluating context and retrieving knowledge...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <div className="shrink-0 border-t border-white/10 pt-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder={`Ask Raizo Tutor in ${mode.toUpperCase()} mode (e.g. 'What is a SQL window function?' or 'Why did my roadmap change?')...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-[#0d1424] px-4 py-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none placeholder:text-slate-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/30 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex items-center space-x-3 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
            <span>Initializing Raizo Socratic Tutor...</span>
          </div>
        </div>
      }
    >
      <TutorContent />
    </Suspense>
  );
}
