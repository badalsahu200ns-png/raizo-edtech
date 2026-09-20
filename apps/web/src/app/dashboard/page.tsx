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
  ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";
import { RoadmapDAG, EvidenceItem, GapMatrix, Certificate, CertificateEligibility } from "@/lib/types";
import RaizoSkillGraph from "@/components/RaizoSkillGraph";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<RoadmapDAG | null>(null);
  const [gaps, setGaps] = useState<GapMatrix | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [eligibility, setEligibility] = useState<CertificateEligibility | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const firstName = profile?.name ? profile.name.split(" ")[0] : "Alex";
  const targetRole = profile?.target_role === "data_analyst" ? "Data Analyst" : "Data Analyst";
  const currentRole = profile?.current_role || "Junior Business Analyst";
  const careerGoal = profile?.career_goal || "Transition into a High-Growth Data Analyst role";
  const weeklyHours = profile?.weekly_hours || 8;
  const readinessPercent = gaps?.overall_readiness_score ?? 72;

  // Meaningful user activities as specified in Section 2
  const recentActivities = [
    {
      id: "act-1",
      title: "Completed SQL assessment",
      time: "2 hours ago",
      icon: FileCheck2,
      tag: "Assessment"
    },
    {
      id: "act-2",
      title: "Submitted Excel project",
      time: "Yesterday",
      icon: Layers,
      tag: "Project"
    },
    {
      id: "act-3",
      title: "Earned Data Analytics certificate",
      time: "3 days ago",
      icon: Award,
      tag: "Certificate"
    },
    {
      id: "act-4",
      title: "Completed Pandas checkpoint",
      time: "4 days ago",
      icon: CheckCircle2,
      tag: "Checkpoint"
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* 1. WELCOME SECTION */}
      <div className="border-b border-[#27303B] pb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#5B8DEF]/10 text-[#5B8DEF]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5B8DEF]" />
              AI Career Intelligence Command Center
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F7FA] tracking-tight">
              Hello, {firstName}.
            </h1>
            <p className="text-sm font-semibold text-[#5B8DEF]">
              Learn with purpose. Prove your skills. Build your future.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <Link
              href="/job-analysis"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold shadow-sm hover:bg-[#4779D8] transition-all"
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>ATS Gap Analyzer</span>
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#151B23] border border-[#27303B] text-[#F5F7FA] text-xs font-semibold hover:bg-[#1A212B] transition-all"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#B4BDC8]" />
              <span>Continue Learning</span>
            </Link>
          </div>
        </div>

        {/* Editorial Quote */}
        <div className="border-l-2 border-[#5B8DEF]/40 pl-3.5 py-1 text-xs sm:text-sm italic text-[#B4BDC8]">
          “True career readiness isn’t about how much content you’ve watched. It’s about what you can demonstrate under real-world scrutiny.”
        </div>

        {/* Progression Steps */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#B4BDC8] bg-[#151B23] p-3 rounded-xl border border-[#27303B]">
          <span className="text-[10px] uppercase font-bold text-[#7E8996] mr-1">Progression:</span>
          <span className="text-[#F5F7FA] font-bold">1. Target Role</span>
          <span className="text-[#CBD2CB]">→</span>
          <span className="text-[#5B8DEF] font-bold">2. Current Readiness</span>
          <span className="text-[#CBD2CB]">→</span>
          <span className="text-[#F5F7FA] font-bold">3. Skill Gaps</span>
          <span className="text-[#CBD2CB]">→</span>
          <span className="text-[#5B8DEF] font-bold">4. Next Best Action</span>
        </div>
      </div>

      {/* 2. CAREER TARGET & READINESS TWIN CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Career Target Card */}
        <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-7 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7E8996]">
                CAREER TARGET
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

        {/* Career Readiness Card */}
        <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-7 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7E8996]">
                CAREER READINESS
              </span>
              <span className="text-xs font-semibold text-[#36C98F] bg-[#5B8DEF]/10 px-2.5 py-0.5 rounded-full">
                On Track
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-[#B4BDC8] block">{targetRole} Readiness</span>
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-extrabold font-mono text-[#F5F7FA]">
                  {readinessPercent}%
                </span>
                <span className="text-xs font-semibold text-[#5B8DEF]">
                  Target: 70% reached
                </span>
              </div>
            </div>

            {/* Simple progress bar */}
            <div className="space-y-1.5 pt-1">
              <div className="h-3 w-full rounded-full bg-[#1A212B] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#5B8DEF] transition-all duration-700"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>
              <p className="text-xs font-semibold text-[#F5F7FA]">
                8 skills verified · 3 skills developing
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

      {/* 3. RECOMMENDED NEXT STEP HERO BANNER */}
      <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
              RECOMMENDED NEXT STEP
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#F5F7FA]">
              Strengthen SQL Window Functions
            </h3>
            <p className="text-xs sm:text-sm text-[#B4BDC8] leading-relaxed">
              Your current SQL evidence shows strong fundamentals. Complete the Window Functions checkpoint to improve your role readiness.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              href="/practice"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold shadow-sm hover:bg-[#4779D8] transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#11161D] border border-[#27303B] text-[#F5F7FA] text-xs font-semibold hover:bg-[#1A212B] transition-all"
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

      {/* 4. LEARNING PROGRESS & RECENT ACTIVITY DUAL COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress Summary */}
        <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#27303B] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#F5F7FA]">Learning Progress</h3>
              <p className="text-xs text-[#B4BDC8]">Key milestones completed along your journey</p>
            </div>
            <Link href="/skills" className="text-xs font-semibold text-[#5B8DEF] hover:underline">
              View All Skills
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
              <span className="text-[11px] text-[#B4BDC8] block">Courses completed</span>
              <span className="text-xl font-bold font-mono text-[#F5F7FA]">3</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
              <span className="text-[11px] text-[#B4BDC8] block">Practice activities</span>
              <span className="text-xl font-bold font-mono text-[#F5F7FA]">12</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
              <span className="text-[11px] text-[#B4BDC8] block">Assessments</span>
              <span className="text-xl font-bold font-mono text-[#F5F7FA]">4</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
              <span className="text-[11px] text-[#B4BDC8] block">Projects completed</span>
              <span className="text-xl font-bold font-mono text-[#F5F7FA]">1</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#5B8DEF]/10/50 border border-[#5B8DEF]/30 space-y-1 sm:col-span-2">
              <span className="text-[11px] text-[#5B8DEF] font-semibold block">Skills verified</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold font-mono text-[#5B8DEF]">8</span>
                <span className="text-[11px] text-[#36C98F] font-semibold">Ready for portfolio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Meaningful Activity */}
        <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#27303B] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#F5F7FA]">Recent Activity</h3>
              <p className="text-xs text-[#B4BDC8]">Your verified accomplishments</p>
            </div>
            <span className="text-xs text-[#7E8996]">Recent</span>
          </div>

          <div className="space-y-2.5">
            {recentActivities.map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#27303B] bg-[#11161D] text-xs hover:border-[#5B8DEF]/40 transition-colors"
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
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#151B23] text-[#B4BDC8] border border-[#27303B]">
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
