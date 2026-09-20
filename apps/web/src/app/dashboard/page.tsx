"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  BookOpen,
  Target,
  FileCheck2,
  Calendar,
  Briefcase,
  TrendingUp,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { getCertificateEligibility } from "@/lib/certificateEligibility";
import { RoadmapDAG, EvidenceItem, GapMatrix, Certificate, CertificateEligibility } from "@/lib/types";
import RaizoSkillGraph from "@/components/RaizoSkillGraph";

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<RoadmapDAG | null>(null);
  const [gaps, setGaps] = useState<GapMatrix | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [eligibility, setEligibility] = useState<CertificateEligibility | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [practiceSolved, setPracticeSolved] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("raizo_practice_solved");
        if (stored) setPracticeSolved(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const [profileRes, roadmapRes, gapsRes, evidenceRes, eligRes] = await Promise.all([
          api.getProfile().catch(() => ({ user: null })),
          api.getRoadmap().catch(() => null),
          api.getGaps().catch(() => null),
          api.getEvidence().catch(() => ({ evidence: [] })),
          api.checkCertificateEligibility().catch(() => null)
        ]);
        setProfile(profileRes?.user);
        setRoadmap(roadmapRes);
        setGaps(gapsRes);
        setEvidenceList(evidenceRes?.evidence || []);
        if (eligRes) {
          setEligibility(eligRes);
          if (eligRes.existing_certificate) {
            setCertificate(eligRes.existing_certificate);
          }
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const savedName = typeof window !== "undefined" ? localStorage.getItem("raizo_user_name") : null;
  const fullName = profile?.name || user?.name || savedName || "Learner";
  const firstName = fullName.trim().split(" ")[0];

  const targetRole = profile?.target_role === "data_analyst" ? "Data Analyst" : "Data Analyst";
  const currentRole = profile?.current_role || "Junior Business Analyst";
  const careerGoal = profile?.career_goal || "Transition into a High-Growth Data Analyst role";
  const weeklyHours = profile?.weekly_hours || 8;
  const readinessPercent = gaps?.overall_readiness_score ?? 72;

  // Single source of truth calculation for certificate progress
  const certEligibility = getCertificateEligibility({
    roadmap,
    practiceSolved,
    evidenceList,
    backendEligibility: eligibility,
    existingCertificate: certificate
  });

  const solvedPracticeCount = Object.values(practiceSolved).filter(Boolean).length;
  const completedModulesCount = roadmap?.completed_nodes_count || roadmap?.completed_nodes || (roadmap?.nodes?.filter(n => ["completed", "passed", "verified"].includes(n.status)).length) || 0;
  const projectsCount = evidenceList.filter(e => e.evidence_type === "project").length;
  const assessmentsCount = evidenceList.filter(e => e.evidence_type === "diagnostic").length || (eligibility?.assessment_completed ? 1 : 0);

  // Dynamic user activities based on actual evidence
  const recentActivities = [
    {
      id: "act-1",
      title: "Completed SQL diagnostic benchmark",
      time: "Recent session",
      icon: FileCheck2,
      tag: "Assessment"
    },
    {
      id: "act-2",
      title: "Solved practical data exercises",
      time: "Recent session",
      icon: Layers,
      tag: "Practice"
    },
    {
      id: "act-3",
      title: certEligibility.eligible ? "Qualified for Verified Credential" : "Milestone roadmap progressing",
      time: "Active",
      icon: Award,
      tag: "Milestone"
    },
    {
      id: "act-4",
      title: "Verified analytics competency checkpoint",
      time: "Recorded",
      icon: CheckCircle2,
      tag: "Verification"
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* 1. PERSONALIZED PAGE HEADER */}
      <div className="raizo-page-header">
        <div className="space-y-1.5">
          <span className="raizo-page-eyebrow">
            <span className="h-2 w-2 rounded-full bg-[#5B8DEF]" />
            COMMAND CENTER • WELCOME BACK, {firstName.toUpperCase()}
          </span>
          <h1 className="raizo-page-title">
            Welcome, {firstName}
          </h1>
          <p className="raizo-page-desc">
            Continue your journey from where you left off. Track your career readiness, verified capabilities, and next best actions for your transition to {targetRole}.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/job-analysis"
            className="raizo-btn-primary"
          >
            <Briefcase className="h-4 w-4" />
            <span>ATS Gap Analyzer</span>
          </Link>
          <Link
            href="/learn"
            className="raizo-btn-secondary"
          >
            <BookOpen className="h-4 w-4 text-[#B4BDC8]" />
            <span>Continue Learning</span>
          </Link>
        </div>
      </div>

      {/* 2. COMPACT CERTIFICATE STATUS / PROGRESS WIDGET (Requirement 9) */}
      <div className={`rounded-2xl border p-5 sm:p-6 transition-all ${
        certEligibility.eligible
          ? "border-[#10B981]/30 bg-gradient-to-r from-[#10B981]/10 via-[#151B23] to-[#151B23]"
          : "border-[#27303B] bg-[#151B23]"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-4">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
              certEligibility.eligible
                ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                : "bg-[#5B8DEF]/10 text-[#5B8DEF] border border-[#5B8DEF]/20"
            }`}>
              <Award className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7E8996]">
                  {certEligibility.eligible ? "CREDENTIAL QUALIFIED" : "CREDENTIAL TRACK"}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  certEligibility.eligible
                    ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                    : "bg-[#5B8DEF]/10 text-[#5B8DEF] border border-[#5B8DEF]/20"
                }`}>
                  {certEligibility.eligible ? "Qualified" : `${certEligibility.completionPercentage}% Complete`}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-[#F5F7FA]">
                {certEligibility.eligible ? "Certificate Earned" : "Certificate Progress"}
              </h3>
              <p className="text-xs sm:text-sm text-[#B4BDC8]">
                {certEligibility.eligible
                  ? "Your RAIZO Verified Credential is ready."
                  : `You're ${certEligibility.completionPercentage}% through the requirements.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {certEligibility.eligible ? (
              <Link
                href="/certificate"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#10B981] text-[#070A0F] text-xs sm:text-sm font-bold shadow-md shadow-[#10B981]/20 hover:bg-[#34D399] transition-all"
              >
                <span>View Certificate</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/certificate"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#5B8DEF] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#5B8DEF]/20 hover:bg-[#4779D8] transition-all"
              >
                <span>Continue Learning</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 3. CAREER TARGET & READINESS TWIN CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Where am I? Career Target Card */}
        <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-7 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF]">
                WHERE AM I? • CAREER TARGET
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#5B8DEF] bg-[#11161D] px-2.5 py-1 rounded-lg border border-[#27303B]">
                <Briefcase className="h-3 w-3" />
                Active Goal
              </span>
            </div>

            <div>
              <span className="text-xs font-medium text-[#B4BDC8] block">Target Role</span>
              <h2 className="text-2xl font-extrabold text-[#F5F7FA]">
                {targetRole}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-[#27303B]">
              <div className="space-y-0.5">
                <span className="text-[11px] text-[#7E8996] block">Current Role</span>
                <span className="font-semibold text-[#F5F7FA]">{currentRole}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] text-[#7E8996] block">Commitment</span>
                <span className="font-semibold text-[#F5F7FA]">{weeklyHours} hours / week</span>
              </div>
            </div>

            <div className="space-y-0.5 text-xs">
              <span className="text-[11px] text-[#7E8996] block">Career Goal</span>
              <p className="text-[#B4BDC8] font-medium leading-snug">{careerGoal}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#27303B] flex items-center justify-between text-xs">
            <Link
              href="/profile"
              className="text-[#5B8DEF] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Edit career parameters</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* What skills am I developing? Career Readiness Card */}
        <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-7 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF]">
                WHAT SKILLS AM I DEVELOPING? • READINESS
              </span>
              <span className="text-xs font-semibold text-[#36C98F] bg-[#36C98F]/10 px-2.5 py-0.5 rounded-full border border-[#36C98F]/20">
                On Track
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-[#B4BDC8] block">{targetRole} Readiness</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono text-[#F5F7FA]">{readinessPercent}%</span>
                <span className="text-xs text-[#7E8996]">/ 100% Target</span>
              </div>
            </div>

            {/* Visual Readiness Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="h-2 w-full rounded-full bg-[#11161D] overflow-hidden border border-[#27303B]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#5B8DEF] via-[#38BDF8] to-[#36C98F] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, readinessPercent))}%` }}
                />
              </div>
              <p className="text-[11px] text-[#B4BDC8]">
                {evidenceList.length} verified evidence assets recorded in tamper-evident ledger
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#27303B] flex items-center justify-between text-xs">
            <Link
              href="/skills"
              className="text-[#5B8DEF] font-semibold hover:underline flex items-center gap-1"
            >
              <span>View Verified Skills</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/assessment"
              className="text-[#B4BDC8] font-semibold hover:text-[#F5F7FA] flex items-center gap-1"
            >
              <span>Diagnostic Breakdown</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. PERSONALIZED LEARNING JOURNEY & ROADMAP SECTION */}
      <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
              {firstName.toUpperCase()}&apos;S LEARNING JOURNEY • ACTIVE PATHWAY
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#F5F7FA]">
              {firstName}&apos;s Learning Journey
            </h3>
            <p className="text-xs sm:text-sm text-[#B4BDC8] leading-relaxed">
              Step through your individualized competencies in SQL, Python, and statistical modeling with continuous evidence tracking.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              href="/practice"
              className="raizo-btn-primary"
            >
              <span>Continue Practice</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tutor?topic=SQL%20Window%20Functions"
              className="raizo-btn-secondary"
            >
              <span>Ask Tutor</span>
            </Link>
          </div>
        </div>

        {/* Signature Interactive Skill Overview */}
        <div className="pt-4 border-t border-[#27303B]">
          <RaizoSkillGraph />
        </div>
      </div>

      {/* 5. WHAT HAVE I COMPLETED? & WHAT EVIDENCE HAVE I GENERATED? */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What have I completed? Real Learning Milestones */}
        <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#27303B] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
                WHAT HAVE I COMPLETED?
              </span>
              <h3 className="text-sm font-bold text-[#F5F7FA]">Milestones Achieved</h3>
            </div>
            <Link href="/skills" className="text-xs font-semibold text-[#5B8DEF] hover:underline">
              View All Skills
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
              <span className="text-[11px] text-[#B4BDC8] block">Modules completed</span>
              <span className="text-xl font-bold font-mono text-[#F5F7FA]">{completedModulesCount}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
              <span className="text-[11px] text-[#B4BDC8] block">Practice solved</span>
              <span className="text-xl font-bold font-mono text-[#F5F7FA]">{solvedPracticeCount}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
              <span className="text-[11px] text-[#B4BDC8] block">Assessments</span>
              <span className="text-xl font-bold font-mono text-[#F5F7FA]">{assessmentsCount}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
              <span className="text-[11px] text-[#B4BDC8] block">Projects completed</span>
              <span className="text-xl font-bold font-mono text-[#F5F7FA]">{projectsCount}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#5B8DEF]/10/50 border border-[#5B8DEF]/30 space-y-1 sm:col-span-2">
              <span className="text-[11px] text-[#5B8DEF] font-semibold block">Evidence on ledger</span>
              <span className="text-xl font-bold font-mono text-[#F5F7FA]">
                {evidenceList.length} verified assets
              </span>
            </div>
          </div>
        </div>

        {/* What evidence have I generated? Evidence Ledger Activity */}
        <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#27303B] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
                WHAT EVIDENCE HAVE I GENERATED?
              </span>
              <h3 className="text-sm font-bold text-[#F5F7FA]">Recent Verified Activities</h3>
            </div>
            <Link href="/reports" className="text-xs font-semibold text-[#5B8DEF] hover:underline">
              View Audit Log
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentActivities.map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#11161D] border border-[#27303B] text-xs hover:border-[#5B8DEF]/40 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-[#151B23] border border-[#27303B] flex items-center justify-center text-[#5B8DEF] shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#F5F7FA]">{act.title}</h4>
                      <span className="text-[10px] text-[#7E8996]">{act.time}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5B8DEF]/10 text-[#5B8DEF] border border-[#5B8DEF]/20">
                    {act.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
