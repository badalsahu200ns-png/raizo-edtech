"use client";

import React from "react";
import Link from "next/link";
import {
  Brain,
  ArrowRight,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Search,
  FileText,
  BarChart3,
  Cpu,
  Lock
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-24 px-4 sm:px-6 lg:px-8 py-16">
      {/* 1. HERO SECTION */}
      <section className="relative max-w-5xl text-center space-y-8 pt-8">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md shadow-inner">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Agentic AI Hackathon 2026 — EduPath Problem Statement</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Your skills are unique. <br />
          <span className="gradient-text">Your learning path should be too.</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
          Raizo analyzes what you claim to know, verifies what you can actually demonstrate,
          detects precise competency gaps against target roles, and continuously adapts your
          prerequisite-aware roadmap when you struggle.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/onboarding"
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-cyan-400 transition-all hover:scale-105"
          >
            <span>Build My Learning Path</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center space-x-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm hover:bg-white/10 hover:border-white/25 transition-all"
          >
            <Play className="h-4 w-4 text-cyan-400 fill-cyan-400" />
            <span>Launch Live Demo (Alex Rivera)</span>
          </Link>
        </div>

        {/* Core Tagline Banner */}
        <div className="pt-6">
          <p className="text-xs font-mono tracking-widest text-slate-400 uppercase">
            Learn what you need • Prove what you know • Adapt as you grow
          </p>
        </div>
      </section>

      {/* 2. THE PROBLEM VS THE RAIZO DIFFERENCE */}
      <section className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-3xl border border-rose-500/20 bg-rose-950/10 p-8 space-y-4">
          <div className="flex items-center space-x-2 text-rose-400 text-sm font-bold">
            <AlertTriangle className="h-4 w-4" />
            <span>THE TRADITIONAL STATIC FLAW</span>
          </div>
          <h3 className="text-2xl font-bold text-white">Generic Chatbots & Static Syllabi</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Standard platforms dump 80-hour generic video playlists or use generic conversational chatbots with no persistent memory.
            If you struggle with a prerequisite like missing values or SQL join cardinality, they force you forward blindly or repeat the same shallow prompt.
          </p>
          <ul className="space-y-2 text-xs text-slate-400 pt-2">
            <li className="flex items-center gap-2">✗ Unverified claims accepted as verified skill</li>
            <li className="flex items-center gap-2">✗ Linear rigid curriculums without prerequisites</li>
            <li className="flex items-center gap-2">✗ Zero adaptation when you fail a checkpoint</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-[#0e1628] to-[#0a101d] p-8 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-cyan-400 text-sm font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>THE RAIZO AGENTIC BREAKTHROUGH</span>
          </div>
          <h3 className="text-2xl font-bold text-white">Evidence-Based Competency Intelligence</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Raizo treats skill verification like an immutable scientific ledger.
            When you fail an applied assessment (e.g. 42% on Pandas Data Cleaning), the Evaluator Agent diagnoses the exact root weakness and dynamically rewrites your DAG roadmap to insert a targeted remediation milestone.
          </p>
          <ul className="space-y-2 text-xs text-cyan-200/80 pt-2">
            <li className="flex items-center gap-2">✓ Strict Claim vs Verified Evidence Ledger</li>
            <li className="flex items-center gap-2">✓ Prerequisite-aware Directed Acyclic Graph (DAG)</li>
            <li className="flex items-center gap-2">✓ Automatic re-routing & dynamic remediation</li>
          </ul>
        </div>
      </section>

      {/* 3. THE 10-STEP CONTINUOUS ADAPTIVE LOOP */}
      <section className="max-w-6xl w-full text-center space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Architectural Core</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            The Autonomous Competency Pipeline
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Raizo operates across an integrated 10-stage state machine that updates continuously as you prove mastery.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-left">
          {[
            { step: "01", title: "PROFILE", desc: "Resume parsing & self-reported claims" },
            { step: "02", title: "VERIFY", desc: "Separate claims from verified evidence" },
            { step: "03", title: "DIAGNOSE", desc: "Empirical diagnostic assessments" },
            { step: "04", title: "PLAN", desc: "Topological DAG generation" },
            { step: "05", title: "LEARN", desc: "Socratic RAG-grounded tutoring" },
            { step: "06", title: "PRACTICE", desc: "Applied SQL, code & scenario tasks" },
            { step: "07", title: "EVALUATE", desc: "Deterministic rubric scoring" },
            { step: "08", title: "ADAPT", desc: "Root cause diagnosis & DAG re-routing" },
            { step: "09", title: "REASSESS", desc: "Targeted remediation checkpoints" },
            { step: "10", title: "PROGRESS", desc: "Verified milestone unlock & reports" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-[#0e1424] p-4 space-y-1.5 hover:border-indigo-500/50 hover:bg-[#121b30] transition-all"
            >
              <span className="text-xs font-mono font-bold text-cyan-400">{item.step}</span>
              <h4 className="text-sm font-bold text-white tracking-wide">{item.title}</h4>
              <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 7-AGENT SPECIALIZED ECOSYSTEM */}
      <section className="max-w-6xl w-full space-y-8">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Agentic Architecture</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">
            7 Specialized Agents Working in Concert
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            No single monolithic prompt. Specialized agents with structured Pydantic input/output contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              name: "Profile Agent",
              role: "Parses PDF/DOCX resumes, normalizes career records, and marks initial capabilities as unverified claims.",
              icon: FileText,
              color: "text-blue-400"
            },
            {
              name: "Assessment Agent",
              role: "Generates multi-modal diagnostic & checkpoint assessments mapped directly to prerequisite sub-skills.",
              icon: Cpu,
              color: "text-cyan-400"
            },
            {
              name: "Skill Gap Analyzer",
              role: "Compares verified learner capabilities against standardized competency models (ESCO/O*NET) with 'Why?' explanations.",
              icon: BarChart3,
              color: "text-indigo-400"
            },
            {
              name: "Roadmap Planner",
              role: "Builds a prerequisite-aware Directed Acyclic Graph (DAG) and constructs personalized weekly schedules.",
              icon: GitBranch,
              color: "text-purple-400"
            },
            {
              name: "Adaptive Tutor",
              role: "Socratic pedagogical tutor with 8 tutoring modes, persistent memory, and verified source citations.",
              icon: Brain,
              color: "text-pink-400"
            },
            {
              name: "Evaluator Agent",
              role: "Applies deterministic rubrics (0-49 remediation, 50-69 developing, 70-84 proficient, 85-100 strong).",
              icon: ShieldCheck,
              color: "text-emerald-400"
            },
            {
              name: "Adaptation Agent",
              role: "Detects failure root causes, injects remediation nodes into the DAG, and unlocks verified successors.",
              icon: RotateCcw,
              color: "text-rose-400"
            },
          ].map((agent, i) => {
            const Icon = agent.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-[#0d1424]/90 p-5 space-y-3 hover:border-indigo-500/40 hover:bg-[#11192e] transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                    <Icon className={`h-5 w-5 ${agent.color}`} />
                  </div>
                  <h4 className="text-base font-bold text-white">{agent.name}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{agent.role}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. CALL TO ACTION FOOTER */}
      <section className="max-w-4xl w-full rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-[#0d1527] to-cyan-950/40 p-10 text-center space-y-6 shadow-2xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Experience Evidence-Based Skill Intelligence
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Start with your resume, prove your capabilities through diagnostic checkpoints,
          and watch Raizo dynamically build and adapt your roadmap.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/onboarding"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-500 transition-all"
          >
            Start Personalized Onboarding
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-all"
          >
            Explore Demo Dashboard
          </Link>
        </div>

        <div className="pt-4 border-t border-white/10 text-xs text-slate-400">
          Created for the Agentic AI Hackathon 2026 • By Badal Kumar Sahu
        </div>
      </section>
    </div>
  );
}
