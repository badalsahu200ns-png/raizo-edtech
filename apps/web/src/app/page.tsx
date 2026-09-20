"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  Target,
  FileCheck2,
  BookOpen,
  GitBranch,
  ChevronRight,
  Activity
} from "lucide-react";
import RaizoSkillGraph from "@/components/RaizoSkillGraph";
import { RaizoMark } from "@/components/RaizoLogo";

export default function LandingPage() {
  const narrativeSteps = [
    {
      num: "01",
      title: "Discover where you stand",
      desc: "Baseline evaluation establishes current capability and clarifies prerequisites without assumptions.",
      tag: "Discover"
    },
    {
      num: "02",
      title: "Learn core foundations",
      desc: "Prerequisite-aware curriculum and Socratic AI guidance build strong conceptual understanding.",
      tag: "Learn"
    },
    {
      num: "03",
      title: "Practice applied exercises",
      desc: "Targeted SQL, Python, and analytics problem sets turn knowledge into working muscle memory.",
      tag: "Practice"
    },
    {
      num: "04",
      title: "Assess your readiness",
      desc: "Empirical diagnostic assessments test real-world problem solving against industry benchmarks.",
      tag: "Assess"
    },
    {
      num: "05",
      title: "Build practical projects",
      desc: "Real-world portfolio capstones demonstrate end-to-end analytical problem solving to employers.",
      tag: "Build"
    },
    {
      num: "06",
      title: "Verify your skills",
      desc: "Evidence-backed skill ledger confirms demonstrated competence with tamper-evident credentials.",
      tag: "Verify"
    },
    {
      num: "07",
      title: "Prepare for your career",
      desc: "Bridge confirmed skills with job requirements, employer expectations, and mentor guidance.",
      tag: "Prepare for Career"
    }
  ];

  return (
    <div className="space-y-20 py-6 max-w-6xl mx-auto">
      {/* 1. EDITORIAL HERO */}
      <section className="space-y-8 pt-4 sm:pt-8 text-center sm:text-left">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#5B8DEF]/10 text-[#5B8DEF] text-xs font-semibold border border-[#5B8DEF]/20">
          <span className="h-2 w-2 rounded-full bg-[#5B8DEF]" />
          <span>AI Career Intelligence Platform</span>
        </div>

        <div className="max-w-4xl space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#F5F7FA] tracking-tight leading-[1.1]">
            Learn with purpose. <br className="hidden sm:inline" />
            Prove your skills. <br className="hidden sm:inline" />
            <span className="text-[#5B8DEF]">Build your future.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#B4BDC8] leading-relaxed max-w-3xl">
            RAIZO connects your skills, learning, practice, evidence, and career goals into one intelligent career journey. Move beyond passive courses and inflated resumes with an AI-driven platform that measures real capability and prepares you for your target role.
          </p>
        </div>

        {/* 6-Stage Core Journey Pipeline */}
        <div className="pt-2 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#B4BDC8] bg-[#151B23] p-3.5 rounded-2xl border border-[#27303B] shadow-xs">
            <span className="text-[#5B8DEF] uppercase text-[10px] tracking-widest mr-1">The Journey:</span>
            {["DISCOVER", "DIAGNOSE", "LEARN", "PRACTICE", "PROVE", "ADVANCE"].map((stage, idx) => (
              <React.Fragment key={stage}>
                <span className="px-2 py-0.5 rounded-md bg-[#11161D] border border-[#27303B] text-[#F5F7FA]">
                  {stage}
                </span>
                {idx < 5 && <span className="text-[#CBD2CB]">?</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#5B8DEF] text-white text-sm font-bold shadow-sm hover:bg-[#4779D8] transition-all hover:translate-y-[-1px]"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/job-analysis"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#151B23] border border-[#5B8DEF]/30 text-[#5B8DEF] text-sm font-bold hover:bg-[#5B8DEF]/10/30 transition-all shadow-xs"
          >
            <Sparkles className="h-4 w-4 text-[#5B8DEF]" />
            <span>Universal ATS Gap Analyzer</span>
          </Link>
          <Link
            href="/skills"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#1A212B] text-[#F5F7FA] text-sm font-semibold hover:bg-[#E0E2DC] transition-all"
          >
            <Layers className="h-4 w-4 text-[#B4BDC8]" />
            <span>Verified Skills</span>
          </Link>
        </div>
      </section>

      {/* 2. SIGNATURE VISUAL: THE RAIZO SKILL GRAPH */}
      <section className="space-y-4">
        <RaizoSkillGraph />
      </section>

      {/* 3. CASE STUDY STORYTELLING: FROM SKILL GAP TO CAREER EVIDENCE */}
      <section className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-10 space-y-8 shadow-sm">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5B8DEF]">
            CASE STUDY ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
            From Skill Gap to Career Evidence
          </h2>
          <p className="text-sm text-[#B4BDC8] leading-relaxed">
            See how the platform guides a learner who discovers an analytical weakness in SQL into an indisputable, verified credential.
          </p>
        </div>

        {/* Narrative Progression Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {narrativeSteps.map((step) => (
            <div
              key={step.num}
              className="rounded-xl border border-[#27303B] bg-[#11161D] p-5 space-y-3 flex flex-col justify-between transition-colors hover:border-[#5B8DEF] hover:bg-[#151B23]"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#5B8DEF]">
                    {step.num}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#151B23] text-[#B4BDC8] border border-[#27303B]">
                    {step.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#F5F7FA]">
                  {step.title}
                </h3>
                <p className="text-xs text-[#B4BDC8] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TRUST & PROOF SECTION: BUILT AROUND EVIDENCE */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5B8DEF]">
            CONTINUOUS VERIFICATION
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
            Built Around Evidence
          </h2>
          <p className="text-sm text-[#B4BDC8]">
            Unlike traditional learning portals, RAIZOAGENTIC tracks empirical milestones rather than time spent watching videos.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-[#27303B] bg-[#151B23] p-5 space-y-1">
            <span className="text-xs font-semibold text-[#B4BDC8] block">Skills Tracked</span>
            <span className="text-3xl font-extrabold text-[#F5F7FA] font-mono">12</span>
            <span className="text-[11px] text-[#5B8DEF] font-medium block pt-1">
              ? Production Data Analyst Taxonomy
            </span>
          </div>

          <div className="rounded-xl border border-[#27303B] bg-[#151B23] p-5 space-y-1">
            <span className="text-xs font-semibold text-[#B4BDC8] block">Learning Actions</span>
            <span className="text-3xl font-extrabold text-[#F5F7FA] font-mono">45</span>
            <span className="text-[11px] text-[#5B8DEF] font-medium block pt-1">
              ? Adaptive DAG Modules
            </span>
          </div>

          <div className="rounded-xl border border-[#27303B] bg-[#151B23] p-5 space-y-1">
            <span className="text-xs font-semibold text-[#B4BDC8] block">Evidence Collected</span>
            <span className="text-3xl font-extrabold text-[#F5F7FA] font-mono">5</span>
            <span className="text-[11px] text-[#36C98F] font-medium block pt-1">
              ? Cryptographically Verified Records
            </span>
          </div>

          <div className="rounded-xl border border-[#27303B] bg-[#151B23] p-5 space-y-1">
            <span className="text-xs font-semibold text-[#B4BDC8] block">Career Signals</span>
            <span className="text-3xl font-extrabold text-[#F5F7FA] font-mono">72%</span>
            <span className="text-[11px] text-[#B67A22] font-medium block pt-1">
              ? Target Role Readiness Index
            </span>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL COMPARISON: TRADITIONAL LMS VS RAIZO */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2 text-[#E86A6A] text-xs font-bold uppercase tracking-wider">
            <span>Traditional EdTech & Video Catalogs</span>
          </div>
          <h3 className="text-xl font-bold text-[#F5F7FA]">
            Passive consumption without empirical validation
          </h3>
          <p className="text-xs text-[#B4BDC8] leading-relaxed">
            Learners sit through 60-hour video playlists without active verification. When a prerequisite concept like SQL join cardinality is missed, the curriculum forces them forward blindly with zero dynamic adjustment.
          </p>
          <ul className="space-y-2 text-xs text-[#B4BDC8] pt-2">
            <li className="flex items-center gap-2 text-[#E86A6A]">
              ? Self-reported claims mistaken for verified proficiency
            </li>
            <li className="flex items-center gap-2 text-[#E86A6A]">
              ? Static linear syllabus unable to remediate weaknesses
            </li>
            <li className="flex items-center gap-2 text-[#E86A6A]">
              ? Certificates based on video completion rather than demonstrated skill
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-[#5B8DEF]/30 bg-[#5B8DEF]/10/20 p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2 text-[#5B8DEF] text-xs font-bold uppercase tracking-wider">
            <span>RAIZOAGENTIC Intelligence</span>
          </div>
          <h3 className="text-xl font-bold text-[#F5F7FA]">
            Prerequisite-aware DAG with permanent proof
          </h3>
          <p className="text-xs text-[#B4BDC8] leading-relaxed">
            When you struggle with a checkpoint (e.g. 42% on Pandas Data Cleaning), the Evaluator Agent diagnoses root misconceptions and dynamically rewrites your topological roadmap to insert targeted remediation.
          </p>
          <ul className="space-y-2 text-xs text-[#F5F7FA] pt-2">
            <li className="flex items-center gap-2 text-[#5B8DEF] font-medium">
              ? Strict separation between claimed and empirically verified competencies
            </li>
            <li className="flex items-center gap-2 text-[#5B8DEF] font-medium">
              ? Socratic tutoring contextualized to your exact learning path node
            </li>
            <li className="flex items-center gap-2 text-[#5B8DEF] font-medium">
              ? Tamper-evident HMAC-SHA256 verified credentials with live verification
            </li>
          </ul>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER BANNER */}
      <section className="rounded-2xl border border-[#27303B] bg-[#17211F] text-white p-8 sm:p-12 text-center space-y-6 shadow-xl">
        <div className="space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-bold tracking-widest text-[#D9A441] uppercase">
            Start Your Pathway
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Ready to measure your genuine analytical readiness?
          </h2>
          <p className="text-xs sm:text-sm text-[#7E8996] leading-relaxed">
            Launch your personalized dashboard, review diagnosed prerequisite gaps, and start closing them with targeted practice.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold shadow-md hover:bg-[#4779D8] transition-all"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/assessment"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#151B23]/10 text-white text-xs font-semibold hover:bg-[#151B23]/20 transition-all"
          >
            <FileCheck2 className="h-4 w-4" />
            <span>Take Diagnostic Assessment</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
