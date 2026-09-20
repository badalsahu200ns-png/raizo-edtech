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
  Activity,
  Compass,
  Database,
  Code,
  BarChart2,
  Check
} from "lucide-react";
import Interactive3dHero from "@/components/3d/Interactive3dHero";
import LiveDiagnosticSandbox from "@/components/3d/LiveDiagnosticSandbox";
import EdtechCurriculumExplorer from "@/components/3d/EdtechCurriculumExplorer";
import Card3DTilt from "@/components/3d/Card3DTilt";
import RaizoSkillGraph from "@/components/RaizoSkillGraph";

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
      tag: "Assessment"
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
    <div className="space-y-20 py-4 max-w-6xl mx-auto">
      {/* ========================================================= */}
      {/* 1. EDITORIAL HEADER & BRAND PROMISE                       */}
      {/* ========================================================= */}
      <section className="space-y-6 pt-4 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] text-xs font-semibold border border-[#38BDF8]/20">
            <span className="h-2 w-2 rounded-full bg-[#38BDF8] animate-pulse" />
            <span>Next-Generation 3D EdTech Platform</span>
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-semibold border border-[#10B981]/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Tamper-Evident Proof</span>
          </div>
        </div>

        <div className="max-w-4xl space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black text-[#F5F7FA] tracking-tight leading-[1.08]">
            Learn With Purpose. <br className="hidden sm:inline" />
            Prove Real Skills. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#34D399]">
              Build Your Future in 3D.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#B4BDC8] leading-relaxed max-w-3xl">
            RAIZO transforms passive courses into an authentic, evidence-driven learning journey. Explore an interactive 3D knowledge constellation, master SQL and Python in hands-on sandboxes, and earn cryptographically verified credentials.
          </p>
        </div>

        {/* 6-Stage Core Journey Pipeline */}
        <div className="pt-2 pb-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#B4BDC8] bg-[#111622] p-3.5 rounded-2xl border border-[#27303B] shadow-sm">
            <span className="text-[#38BDF8] uppercase text-[10px] tracking-widest mr-1">The Journey:</span>
            {["DISCOVER", "DIAGNOSE", "LEARN", "PRACTICE", "PROVE", "ADVANCE"].map((stage, idx) => (
              <React.Fragment key={stage}>
                <span className="px-2.5 py-1 rounded-lg bg-[#0B0F17] border border-[#27303B] text-[#F5F7FA]">
                  {stage}
                </span>
                {idx < 5 && <span className="text-[#38BDF8] font-bold">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#38BDF8] text-[#070A0F] text-sm font-bold shadow-lg shadow-[#38BDF8]/25 hover:bg-[#60A5FA] transition-all hover:translate-y-[-1px]"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/assessment"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#151B24] border border-[#38BDF8]/30 text-[#38BDF8] text-sm font-bold hover:bg-[#38BDF8]/10 transition-all shadow-xs"
          >
            <FileCheck2 className="h-4 w-4 text-[#38BDF8]" />
            <span>Take Diagnostic Assessment</span>
          </Link>
          <Link
            href="/resume"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#121822] border border-[#27303B] text-[#F5F7FA] text-sm font-semibold hover:bg-[#1A2230] transition-all"
          >
            <Sparkles className="h-4 w-4 text-[#10B981]" />
            <span>Resume Intelligence</span>
          </Link>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. INTERACTIVE 3D KNOWLEDGE CONSTELLATION HERO           */}
      {/* ========================================================= */}
      <section className="space-y-4">
        <Interactive3dHero />
      </section>

      {/* ========================================================= */}
      {/* 3. REAL-TIME INTERACTIVE DIAGNOSTIC SANDBOX               */}
      {/* ========================================================= */}
      <section className="space-y-4">
        <LiveDiagnosticSandbox />
      </section>

      {/* ========================================================= */}
      {/* 4. GENUINE EDTECH CURRICULUM EXPLORER (3D TILT)           */}
      {/* ========================================================= */}
      <section className="space-y-4">
        <EdtechCurriculumExplorer />
      </section>

      {/* ========================================================= */}
      {/* 5. 3D SKILL GRAPH: PREREQUISITE TOPOLOGY                  */}
      {/* ========================================================= */}
      <section className="space-y-4">
        <RaizoSkillGraph />
      </section>

      {/* ========================================================= */}
      {/* 6. CASE STUDY PROGRESSION WITH 3D TILT CARDS              */}
      {/* ========================================================= */}
      <section className="rounded-3xl border border-[#27303B] bg-gradient-to-b from-[#111622] to-[#0D121B] p-6 sm:p-10 space-y-8 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#38BDF8]">
            CASE STUDY ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
            From Skill Gap to Verified Career Evidence
          </h2>
          <p className="text-sm text-[#B4BDC8] leading-relaxed">
            See how the platform guides a learner who discovers an analytical weakness in SQL into an indisputable, verified credential.
          </p>
        </div>

        {/* Narrative Progression Grid with 3D Tilt Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {narrativeSteps.map((step) => (
            <Card3DTilt
              key={step.num}
              className="p-5 space-y-3 flex flex-col justify-between bg-[#0F141E] border-[#27303B] hover:border-[#38BDF8]"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#38BDF8]">
                    {step.num}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#151B24] text-[#B4BDC8] border border-[#27303B]">
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
            </Card3DTilt>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. TRUST & PROOF: BUILT AROUND EVIDENCE                   */}
      {/* ========================================================= */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#10B981]">
            CONTINUOUS VERIFICATION
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
            Built Around Evidence
          </h2>
          <p className="text-sm text-[#B4BDC8]">
            Unlike traditional learning portals, RAIZO tracks empirical milestones rather than time spent watching videos.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card3DTilt className="p-5 space-y-1 bg-[#111622] border-[#27303B]">
            <span className="text-xs font-semibold text-[#B4BDC8] block">Skills Tracked</span>
            <span className="text-3xl font-extrabold text-[#F5F7FA] font-mono">12</span>
            <span className="text-[11px] text-[#38BDF8] font-medium flex items-center gap-1 pt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
              Production Data Analyst Taxonomy
            </span>
          </Card3DTilt>

          <Card3DTilt className="p-5 space-y-1 bg-[#111622] border-[#27303B]">
            <span className="text-xs font-semibold text-[#B4BDC8] block">Learning Actions</span>
            <span className="text-3xl font-extrabold text-[#F5F7FA] font-mono">45</span>
            <span className="text-[11px] text-[#38BDF8] font-medium flex items-center gap-1 pt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
              Adaptive DAG Modules
            </span>
          </Card3DTilt>

          <Card3DTilt className="p-5 space-y-1 bg-[#111622] border-[#27303B]">
            <span className="text-xs font-semibold text-[#B4BDC8] block">Evidence Collected</span>
            <span className="text-3xl font-extrabold text-[#F5F7FA] font-mono">5</span>
            <span className="text-[11px] text-[#10B981] font-medium flex items-center gap-1 pt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              Cryptographically Verified Records
            </span>
          </Card3DTilt>

          <Card3DTilt className="p-5 space-y-1 bg-[#111622] border-[#27303B]">
            <span className="text-xs font-semibold text-[#B4BDC8] block">Career Signals</span>
            <span className="text-3xl font-extrabold text-[#F5F7FA] font-mono">72%</span>
            <span className="text-[11px] text-[#FBBF24] font-medium flex items-center gap-1 pt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FBBF24]" />
              Target Role Readiness Index
            </span>
          </Card3DTilt>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. COMPARISON: TRADITIONAL LMS VS RAIZO (3D TILT)         */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card3DTilt className="p-6 sm:p-8 space-y-4 bg-[#111622] border-[#27303B]">
          <div className="flex items-center space-x-2 text-[#F43F5E] text-xs font-bold uppercase tracking-wider">
            <span>Traditional EdTech & Video Catalogs</span>
          </div>
          <h3 className="text-xl font-bold text-[#F5F7FA]">
            Passive consumption without empirical validation
          </h3>
          <p className="text-xs text-[#B4BDC8] leading-relaxed">
            Learners sit through 60-hour video playlists without active verification. When a prerequisite concept like SQL join cardinality is missed, the curriculum forces them forward blindly with zero dynamic adjustment.
          </p>
          <ul className="space-y-2 text-xs text-[#B4BDC8] pt-2">
            <li className="flex items-center gap-2 text-[#F43F5E]">
              <span className="font-bold">✗</span> Self-reported claims mistaken for verified proficiency
            </li>
            <li className="flex items-center gap-2 text-[#F43F5E]">
              <span className="font-bold">✗</span> Static linear syllabus unable to remediate weaknesses
            </li>
            <li className="flex items-center gap-2 text-[#F43F5E]">
              <span className="font-bold">✗</span> Certificates based on video completion rather than demonstrated skill
            </li>
          </ul>
        </Card3DTilt>

        <Card3DTilt className="p-6 sm:p-8 space-y-4 bg-[#111724] border-[#38BDF8]/30">
          <div className="flex items-center space-x-2 text-[#38BDF8] text-xs font-bold uppercase tracking-wider">
            <span>RAIZO Intelligence</span>
          </div>
          <h3 className="text-xl font-bold text-[#F5F7FA]">
            Prerequisite-aware DAG with permanent proof
          </h3>
          <p className="text-xs text-[#B4BDC8] leading-relaxed">
            When you struggle with a checkpoint (e.g. 42% on Pandas Data Cleaning), the Evaluator Agent diagnoses root misconceptions and dynamically rewrites your topological roadmap to insert targeted remediation.
          </p>
          <ul className="space-y-2 text-xs text-[#F5F7FA] pt-2">
            <li className="flex items-center gap-2 text-[#38BDF8] font-medium">
              <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
              <span>Strict separation between claimed and empirically verified competencies</span>
            </li>
            <li className="flex items-center gap-2 text-[#38BDF8] font-medium">
              <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
              <span>Socratic tutoring contextualized to your exact learning path node</span>
            </li>
            <li className="flex items-center gap-2 text-[#38BDF8] font-medium">
              <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
              <span>Tamper-evident HMAC-SHA256 verified credentials with live verification</span>
            </li>
          </ul>
        </Card3DTilt>
      </section>

      {/* ========================================================= */}
      {/* 9. CALL TO ACTION BANNER                                  */}
      {/* ========================================================= */}
      <section className="rounded-3xl border border-[#27303B] bg-gradient-to-b from-[#121824] to-[#0A0E15] text-white p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#38BDF8]/15 via-transparent to-transparent" />
        <div className="space-y-3 max-w-xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
            <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
            Career Readiness Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F7FA] tracking-tight">
            Ready to measure your genuine analytical readiness?
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            Launch your personalized dashboard, review diagnosed prerequisite gaps, and start closing them with targeted practice in our 3D EdTech platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 relative z-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#38BDF8] text-[#070A0F] text-xs font-bold shadow-lg shadow-[#38BDF8]/25 hover:bg-[#60A5FA] transition-all hover:translate-y-[-1px]"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/assessment"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#18202C] border border-[#27303B] text-[#F5F7FA] text-xs font-semibold hover:bg-[#222C3D] transition-all"
          >
            <FileCheck2 className="h-4 w-4 text-[#38BDF8]" />
            <span>Take Diagnostic Assessment</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
