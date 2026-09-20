"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Target,
  Clock,
  Shield,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  Flame,
  Award,
  BookOpen,
  UserCheck,
  LogOut,
  Lock
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("Alex Rivera");
  const [currentRole, setCurrentRole] = useState("Junior Business Analyst");
  const [targetRole, setTargetRole] = useState("data_analyst");
  const [careerGoal, setCareerGoal] = useState("Transition to Mid-Level Data Analyst at a tech company");
  const [weeklyHours, setWeeklyHours] = useState(8.0);
  const [timelineMonths, setTimelineMonths] = useState(4);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mentor Review State (Rebranded from Human Mentor Competency Override)
  const [overrideSkillId, setOverrideSkillId] = useState("pandas_data_cleaning");
  const [overrideScore, setOverrideScore] = useState("85");
  const [mentorName, setMentorName] = useState("Dr. Elena Vance (Lead Mentor)");
  const [overrideReason, setOverrideReason] = useState("Verified through direct live code review session.");
  const [overrideStatus, setOverrideStatus] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.getProfile();
        setUser(res.user);
        if (res.user?.name) setName(res.user.name);
        if (res.user?.current_role) setCurrentRole(res.user.current_role);
        if (res.user?.target_role) setTargetRole(res.user.target_role);
        if (res.user?.career_goal) setCareerGoal(res.user.career_goal);
        if (res.user?.weekly_hours) setWeeklyHours(res.user.weekly_hours);
        if (res.user?.timeline_months) setTimelineMonths(res.user.timeline_months);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api.updateProfile({
        name,
        current_role: currentRole,
        target_role: targetRole,
        career_goal: careerGoal,
        weekly_hours: weeklyHours,
        timeline_months: timelineMonths
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save profile error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitMentorReview = async () => {
    setIsSubmittingReview(true);
    try {
      await api.submitOverride({
        user_id: user?.id,
        target_type: "skill_score",
        target_id: overrideSkillId,
        override_value: overrideScore,
        mentor_name: mentorName,
        reason: overrideReason
      });
      setOverrideStatus("✓ Mentor Verified: Assessment recorded to your skill profile!");
      setTimeout(() => setOverrideStatus(null), 5000);
    } catch (err) {
      console.error("Mentor review error:", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      {/* Header - Answers: "Who am I in this system, and what are my goals?" */}
      <div className="raizo-page-header">
        <div className="raizo-page-eyebrow">
          <span>LEARNER IDENTITY</span>
          <span>•</span>
          <span>SYSTEM PREFERENCES</span>
        </div>
        <h1 className="raizo-page-title">
          Learner Profile & Calibration
        </h1>
        <p className="raizo-page-desc">
          Manage your career target, baseline credentials, and AI tutor personalization settings.
        </p>
      </div>

      {/* 1. PROFILE OVERVIEW CARD */}
      <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-[#5B8DEF] text-white flex items-center justify-center text-xl font-bold">
              {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-0.5">
              <h2 className="text-2xl font-extrabold text-[#F5F7FA]">{name}</h2>
              <span className="text-xs font-semibold text-[#5B8DEF] block">
                Target Pathway: Data Analyst
              </span>
              <p className="text-xs text-[#B4BDC8]">
                Current Role: <strong className="text-[#F5F7FA]">{currentRole}</strong>
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-end gap-2 text-right">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B67A22] bg-[#FBF4E8] px-3 py-1 rounded-full border border-[#B67A22]/20">
              <Flame className="h-3.5 w-3.5 fill-[#B67A22]" />
              18-Day Learning Streak
            </span>
            <span className="text-xs text-[#B4BDC8]">
              Career Readiness: <strong className="text-[#F5F7FA] font-mono">72%</strong>
            </span>
          </div>
        </div>

        {/* Learning Commitment Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#27303B] text-xs">
          <div className="p-3 rounded-xl bg-[#11161D] border border-[#27303B]">
            <span className="text-[#7E8996] block text-[10px] uppercase font-semibold">Weekly Commitment</span>
            <strong className="text-[#F5F7FA] font-mono text-sm">{weeklyHours} Hours/Wk</strong>
          </div>
          <div className="p-3 rounded-xl bg-[#11161D] border border-[#27303B]">
            <span className="text-[#7E8996] block text-[10px] uppercase font-semibold">Target Timeline</span>
            <strong className="text-[#F5F7FA] font-mono text-sm">{timelineMonths} Months</strong>
          </div>
          <div className="p-3 rounded-xl bg-[#11161D] border border-[#27303B]">
            <span className="text-[#7E8996] block text-[10px] uppercase font-semibold">Verified Skills</span>
            <strong className="text-[#36C98F] font-mono text-sm">8 of 13 Competencies</strong>
          </div>
          <div className="p-3 rounded-xl bg-[#11161D] border border-[#27303B]">
            <span className="text-[#7E8996] block text-[10px] uppercase font-semibold">Role Status</span>
            <strong className="text-[#5B8DEF] font-mono text-sm">Qualified (88%)</strong>
          </div>
        </div>
      </div>

      {/* 2. TARGET ROLE & PATHWAY (Section 17) */}
      <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-4 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8DEF] block">
          CAREER TARGET & PROGRESSION
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#F5F7FA]">Data Analyst Pathway</h3>
            <p className="text-xs text-[#B4BDC8]">
              Preparing for business data modeling, SQL analytics, metric dashboards, and stakeholder reporting.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#5B8DEF]/10 text-[#5B8DEF] border border-[#5B8DEF]/30 self-start">
            72% Role Match
          </span>
        </div>

        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#B4BDC8]">Competency Coverage</span>
            <span className="text-[#F5F7FA]">8 Verified · 3 Developing · 2 Unverified</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[#1A212B] overflow-hidden flex">
            <div className="h-full bg-[#2F7D5C]" style={{ width: "61.5%" }} title="8 Verified" />
            <div className="h-full bg-[#B67A22]" style={{ width: "23%" }} title="3 Developing" />
            <div className="h-full bg-[#DDE1DD]" style={{ width: "15.5%" }} title="2 Unverified" />
          </div>
        </div>

        <div className="pt-2 text-xs text-[#B4BDC8]">
          <span className="font-semibold text-[#F5F7FA]">Core Competencies Required: </span>
          <span>SQL Fundamentals · Excel Analytics · Python & Pandas · Descriptive Statistics · Data Visualization · Business Communication</span>
        </div>
      </div>

      {/* 3. PERSONAL INFORMATION FORM */}
      <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-6 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8DEF] block">
            PROFILE SETTINGS
          </span>
          <h3 className="text-lg font-bold text-[#F5F7FA] mt-0.5">
            Personal Information & Goals
          </h3>
          <p className="text-xs text-[#B4BDC8]">
            Keep your background details and time commitments up to date.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#B4BDC8] mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#27303B] bg-[#11161D] px-3.5 py-2 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#B4BDC8] mb-1">Current Role</label>
            <input
              type="text"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="w-full rounded-xl border border-[#27303B] bg-[#11161D] px-3.5 py-2 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#B4BDC8] mb-1">Target Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full rounded-xl border border-[#27303B] bg-[#11161D] px-3.5 py-2 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
            >
              <option value="data_analyst">Data Analyst</option>
              <option value="business_intelligence">Business Intelligence Analyst</option>
              <option value="analytics_engineer">Analytics Engineer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#B4BDC8] mb-1">Weekly Study Commitment (Hours)</label>
            <input
              type="number"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(parseFloat(e.target.value) || 8)}
              className="w-full rounded-xl border border-[#27303B] bg-[#11161D] px-3.5 py-2 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#B4BDC8] mb-1">Career Goal Statement</label>
          <textarea
            rows={2}
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            className="w-full rounded-xl border border-[#27303B] bg-[#11161D] p-3 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {saveSuccess && (
            <span className="text-xs font-semibold text-[#36C98F] flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Preferences saved successfully.
            </span>
          )}
          <div className="ml-auto">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold shadow-sm hover:bg-[#4779D8] transition-all"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. MENTOR REVIEW (Sections 18 & 19: User-friendly Rebranding) */}
      <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="border-b border-[#27303B] pb-4 space-y-1">
          <div className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4 text-[#5B8DEF]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8DEF]">
              MENTOR ASSESSMENT
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#F5F7FA]">
            Mentor Review
          </h3>
          <p className="text-xs text-[#B4BDC8]">
            A verified mentor can review your work and add an official assessment to your learning record.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#B4BDC8] mb-1">Skill Evaluated</label>
            <select
              value={overrideSkillId}
              onChange={(e) => setOverrideSkillId(e.target.value)}
              className="w-full rounded-xl border border-[#27303B] bg-[#11161D] p-2.5 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
            >
              <option value="pandas_data_cleaning">Pandas Data Cleaning</option>
              <option value="sql_fundamentals">SQL Fundamentals</option>
              <option value="excel_analytics">Excel Analytics</option>
              <option value="data_visualization">Data Visualization</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#B4BDC8] mb-1">Mentor Score (0–100)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={overrideScore}
              onChange={(e) => setOverrideScore(e.target.value)}
              className="w-full rounded-xl border border-[#27303B] bg-[#11161D] p-2.5 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#B4BDC8] mb-1">Mentor Name</label>
            <input
              type="text"
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
              className="w-full rounded-xl border border-[#27303B] bg-[#11161D] p-2.5 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#B4BDC8] mb-1">Review Notes</label>
          <input
            type="text"
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            placeholder="e.g. Verified through direct live code review session."
            className="w-full rounded-xl border border-[#27303B] bg-[#11161D] p-2.5 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {overrideStatus ? (
            <span className="text-xs font-bold text-[#36C98F] flex items-center gap-1.5 bg-[#5B8DEF]/10 px-3 py-1.5 rounded-lg border border-[#2F7D5C]/30">
              <CheckCircle2 className="h-4 w-4" />
              <span>{overrideStatus}</span>
            </span>
          ) : (
            <span className="text-xs text-[#B4BDC8]">
              Adds a verified mentor record to your skill profile
            </span>
          )}

          <button
            onClick={handleSubmitMentorReview}
            disabled={isSubmittingReview}
            className="ml-auto inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold hover:bg-[#4779D8] transition-all shadow-sm disabled:opacity-40"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>{isSubmittingReview ? "Submitting Review..." : "Submit Mentor Review"}</span>
          </button>
        </div>
      </div>

      {/* 5. ACCOUNT & SECURITY */}
      <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="border-b border-[#27303B] pb-4 space-y-1">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-[#5B8DEF]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8DEF]">
              ACCOUNT & SECURITY
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#F5F7FA]">
            Connected Google Identity
          </h3>
          <p className="text-xs text-[#B4BDC8]">
            Your session is authenticated via official Google OAuth with cryptographic token validation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#11161D] border border-[#27303B]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F5F7FA]">
                {authUser?.email || user?.email || "alex.rivera@example.com"}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#36C98F] bg-[#5B8DEF]/10 px-2 py-0.5 rounded-full border border-[#2F7D5C]/30">
                <CheckCircle2 className="h-3 w-3" />
                Google Verified
              </span>
            </div>
            <p className="text-[11px] text-[#B4BDC8]">
              Learner ID: <span className="font-mono">{authUser?.id || user?.id || "—"}</span>
            </p>
          </div>

          <button
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E86A6A]/10 border border-[#E86A6A]/30 text-xs font-bold text-[#E86A6A] hover:bg-[#FBE8E6] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out of RAIZO</span>
          </button>
        </div>
      </div>
    </div>
  );
}
