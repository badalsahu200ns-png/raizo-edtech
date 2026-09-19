"use client";

import React, { useState, useEffect } from "react";
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
  Sliders
} from "lucide-react";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("data_analyst");
  const [careerGoal, setCareerGoal] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(8.0);
  const [timelineMonths, setTimelineMonths] = useState(4);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Human Mentor Override State
  const [overrideSkillId, setOverrideSkillId] = useState("pandas_data_cleaning");
  const [overrideScore, setOverrideScore] = useState("85");
  const [mentorName, setMentorName] = useState("Dr. Elena Vance (Lead Mentor)");
  const [overrideReason, setOverrideReason] = useState("Verified through direct live code review session.");
  const [overrideStatus, setOverrideStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.getProfile();
        setUser(res.user);
        setName(res.user.name || "");
        setCurrentRole(res.user.current_role || "");
        setTargetRole(res.user.target_role || "data_analyst");
        setCareerGoal(res.user.career_goal || "");
        setWeeklyHours(res.user.weekly_hours || 8.0);
        setTimelineMonths(res.user.timeline_months || 4);
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

  const handleApplyOverride = async () => {
    try {
      await api.submitOverride({
        user_id: "demo_learner_alex",
        target_type: "skill_score",
        target_id: overrideSkillId,
        override_value: overrideScore,
        mentor_name: mentorName,
        reason: overrideReason
      });
      setOverrideStatus("Human mentor override applied successfully to evidence ledger!");
      setTimeout(() => setOverrideStatus(null), 4000);
    } catch (err) {
      console.error("Override error:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          Learner Parameters
        </span>
        <h1 className="text-3xl font-extrabold text-white">
          Account Settings & Learning Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Customize your target timeline, study pacing, and review verified evidence records.
        </p>
      </div>

      {/* Profile Form */}
      <div className="rounded-3xl border border-white/10 bg-[#0d1424] p-8 space-y-6 shadow-2xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <User className="h-5 w-5 text-indigo-400" />
          Personal & Career Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Role</label>
            <input
              type="text"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#090d16] px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="data_analyst">Data Analyst (Active Demo)</option>
              <option value="business_analyst">Business Analyst</option>
              <option value="product_analyst">Product Analyst</option>
              <option value="data_scientist">Data Scientist</option>
              <option value="software_developer">Software Developer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Weekly Available Hours: {weeklyHours} Hrs
            </label>
            <input
              type="range"
              min="2"
              max="30"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 mt-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Career Goal Statement</label>
          <textarea
            rows={3}
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white focus:border-indigo-500 focus:outline-none leading-relaxed"
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Changes saved successfully!
            </span>
          )}
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="ml-auto flex items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {/* HUMAN MENTOR OVERRIDE SECTION (Section 53 requirement) */}
      <div className="rounded-3xl border border-purple-500/30 bg-[#0d1424] p-8 space-y-5 shadow-2xl">
        <div className="border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Sliders className="h-4 w-4" />
            <span>Mentor & Admin Authority Controls</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Human Mentor Override</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Allows certified human mentors to manually verify or adjust competency scores.
            Overrides are stored distinctly from AI-generated evaluations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Skill</label>
            <select
              value={overrideSkillId}
              onChange={(e) => setOverrideSkillId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#090d16] px-3.5 py-2 text-xs text-white"
            >
              <option value="pandas_data_cleaning">Pandas Data Cleaning</option>
              <option value="sql_fundamentals">SQL Fundamentals</option>
              <option value="excel_analytics">Excel Analytics</option>
              <option value="descriptive_statistics">Descriptive Statistics</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">New Verified Score (0-100)</label>
            <input
              type="number"
              value={overrideScore}
              onChange={(e) => setOverrideScore(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Certified Mentor Name</label>
            <input
              type="text"
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Verification Reason / Notes</label>
            <input
              type="text"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          {overrideStatus && (
            <span className="text-xs text-emerald-400 font-semibold">{overrideStatus}</span>
          )}
          <button
            onClick={handleApplyOverride}
            className="ml-auto rounded-xl border border-purple-500/40 bg-purple-950/40 px-5 py-2 text-xs font-bold text-purple-300 hover:bg-purple-900/50"
          >
            Apply Mentor Override
          </button>
        </div>
      </div>
    </div>
  );
}
