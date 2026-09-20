"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Target,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  FileText,
  AlertCircle
} from "lucide-react";
import ResumeDropzone from "@/components/ResumeDropzone";
import ExtractedProfileReview from "@/components/ExtractedProfileReview";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resume Document Review State
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null);
  const [extractedProfile, setExtractedProfile] = useState<any | null>(null);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  // Step 1 State: Basic Profile
  const [name, setName] = useState("Alex Rivera");
  const [currentRole, setCurrentRole] = useState("Marketing & Operations Associate");
  const [yearsExperience, setYearsExperience] = useState(3.0);
  const [education, setEducation] = useState("B.S. in Business & Quantitative Analytics");
  const [location, setLocation] = useState("San Francisco, CA");
  const [industry, setIndustry] = useState("E-Commerce & Retail Operations");

  // Step 2 State: Career Goal
  const [targetRole, setTargetRole] = useState("data_analyst");
  const [careerGoal, setCareerGoal] = useState("Transition into a high-impact Data Analyst role delivering business intelligence");
  const [timelineMonths, setTimelineMonths] = useState(4);
  const [weeklyHours, setWeeklyHours] = useState(8.0);

  // Step 3 State: Self-reported Skills
  const [selectedSkills, setSelectedSkills] = useState<Array<{ skill_id: string; title: string; category: string; level: string }>>([
    { skill_id: "excel_analytics", title: "Excel Analytics & Pivot Tables", category: "Data Visualization & BI", level: "Advanced" },
    { skill_id: "sql_fundamentals", title: "SQL Fundamentals & SELECT", category: "Relational Data Querying & SQL", level: "Intermediate" },
    { skill_id: "python_fundamentals", title: "Python Core Scripting", category: "Python Programming & Analytics", level: "Intermediate" },
    { skill_id: "pandas_data_cleaning", title: "Pandas Data Cleaning", category: "Python Programming & Analytics", level: "Beginner" }
  ]);

  const [customSkillInput, setCustomSkillInput] = useState("");

  const handleProfileExtracted = (parsedProfile: any, docId: string) => {
    setUploadedDocumentId(docId);
    setExtractedProfile(parsedProfile);
    setIsReviewing(true);

    if (parsedProfile.name) setName(parsedProfile.name);
    if (parsedProfile.current_role) setCurrentRole(parsedProfile.current_role);
    if (parsedProfile.years_experience_total) setYearsExperience(parsedProfile.years_experience_total);
    if (parsedProfile.education && parsedProfile.education[0]) {
      setEducation(`${parsedProfile.education[0].degree} (${parsedProfile.education[0].institution})`);
    }

    // Merge extracted skills
    if (parsedProfile.skills) {
      const newSkills = parsedProfile.skills.map((s: any) => ({
        skill_id: s.skill_id,
        title: s.name,
        category: s.category,
        level: s.claimed_level || "Intermediate"
      }));
      setSelectedSkills(newSkills);
    }
  };

  const handleConfirmedReview = (confirmedData: any) => {
    if (confirmedData.name) setName(confirmedData.name);
    if (confirmedData.current_role) setCurrentRole(confirmedData.current_role);
    if (confirmedData.target_role) setTargetRole(confirmedData.target_role);
    if (confirmedData.skills) {
      setSelectedSkills(
        confirmedData.skills.map((s: any) => ({
          skill_id: s.skill_id,
          title: s.name || s.title,
          category: s.category,
          level: s.claimed_level || "Intermediate"
        }))
      );
    }
    setIsReviewing(false);
    setStep(2); // Automatically advance to Step 2
  };

  const addCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    const sId = customSkillInput.toLowerCase().replace(/\s+/g, "_");
    setSelectedSkills([
      ...selectedSkills,
      {
        skill_id: sId,
        title: customSkillInput.trim(),
        category: "Custom Capabilities",
        level: "Intermediate"
      }
    ]);
    setCustomSkillInput("");
  };

  const removeSkill = (id: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s.skill_id !== id));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await api.completeOnboarding({
        user_id: user?.id,
        name: name || user?.name || "Verified Learner",
        current_role: currentRole,
        years_experience: yearsExperience,
        education,
        location,
        industry,
        target_role: targetRole,
        career_goal: careerGoal,
        target_timeline_months: timelineMonths,
        weekly_available_hours: weeklyHours,
        self_reported_skills: selectedSkills
      });

      // Generate customized roadmap DAG
      await api.generateRoadmap(user?.id, targetRole);
      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Wizard Progress Indicator */}
      <div className="mb-10 text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          Personalized Onboarding
        </span>
        <h1 className="text-3xl font-extrabold text-white">
          Configure Your Learning Intelligence
        </h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Raizo adapts to your background, time availability, and target goals.
          All claims remain unverified until tested.
        </p>

        {/* Step Tabs */}
        <div className="flex items-center justify-center space-x-3 pt-4">
          {[
            { num: 1, title: "Background & Resume", icon: User },
            { num: 2, title: "Target Role & Goal", icon: Target },
            { num: 3, title: "Initial Skill Claims", icon: Layers }
          ].map((s) => {
            const Icon = s.icon;
            const isCurrent = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div
                key={s.num}
                onClick={() => setStep(s.num)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
                  isCurrent
                    ? "border-indigo-500 bg-indigo-950/50 text-indigo-300 shadow-md shadow-indigo-950"
                    : isCompleted
                    ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-400"
                    : "border-white/10 bg-[#151B23]/5 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{s.num}. {s.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Basic Profile & Resume Upload */}
      {step === 1 && (
        <div className="rounded-3xl border border-white/10 bg-[#0d1424] p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                {isReviewing ? "Step 1: Review Extracted Profile Claims" : "Step 1: Background & Resume Upload"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isReviewing
                  ? "Carefully review and edit extracted capabilities. Claims are registered as Unverified."
                  : "Upload your resume for automatic capability extraction, or configure your background manually."}
              </p>
            </div>
            {isReviewing && (
              <button
                onClick={() => setIsReviewing(false)}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Upload Different File
              </button>
            )}
          </div>

          {isReviewing && extractedProfile && uploadedDocumentId ? (
            <ExtractedProfileReview
              documentId={uploadedDocumentId}
              initialProfile={extractedProfile}
              onConfirmed={handleConfirmedReview}
              onCancel={() => setIsReviewing(false)}
            />
          ) : (
            <>
              {/* Resume Upload Component */}
              <ResumeDropzone onProfileExtracted={handleProfileExtracted} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#151B23]/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Role / Title</label>
              <input
                type="text"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#151B23]/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Years of Total Experience</label>
              <input
                type="number"
                step="0.5"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-white/10 bg-[#151B23]/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Highest Education</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#151B23]/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#151B23]/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#151B23]/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
              >
                <span>Next: Target Goal</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    )}

      {/* STEP 2: Career Goal & Availability */}
      {step === 2 && (
        <div className="rounded-3xl border border-white/10 bg-[#0d1424] p-8 space-y-6 shadow-2xl">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-white">Step 2: Target Role & Availability</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your transition objective. Raizo will synthesize a DAG roadmap fitted to your exact weekly hours.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#090d16] px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="data_analyst">Data Analyst (Primary Hackathon Demo)</option>
                <option value="business_analyst">Business Analyst</option>
                <option value="product_analyst">Product Analyst</option>
                <option value="data_scientist">Data Scientist</option>
                <option value="software_developer">Software Developer</option>
                <option value="ai_ml_engineer">AI/ML Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Career Objective</label>
              <textarea
                rows={3}
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#151B23]/5 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Timeline: {timelineMonths} Months
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={timelineMonths}
                  onChange={(e) => setTimelineMonths(parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>1 mo (Accelerated)</span>
                  <span>4 mo (Standard)</span>
                  <span>12 mo (Paced)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Weekly Available Study: {weeklyHours} Hours/Week
                </label>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>4 hrs (Casual)</span>
                  <span>8 hrs (Recommended)</span>
                  <span>20+ hrs (Full-time)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center space-x-2 rounded-xl border border-white/10 bg-[#151B23]/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#151B23]/10"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
            >
              <span>Next: Initial Skills</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Initial Skill Claims */}
      {step === 3 && (
        <div className="rounded-3xl border border-white/10 bg-[#0d1424] p-8 space-y-6 shadow-2xl">
          <div className="border-b border-white/10 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Step 3: Self-Reported Capabilities</h2>
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/40">
                Marked Unverified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select or modify your claimed skills. Remember: Raizo strictly labels these as unverified claims until you complete empirical diagnostic benchmarks.
            </p>
          </div>

          {/* Add custom skill */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add additional skill (e.g. A/B Testing, Tableau)..."
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomSkill()}
              className="flex-1 rounded-xl border border-white/10 bg-[#151B23]/5 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={addCustomSkill}
              className="rounded-xl border border-indigo-500/40 bg-indigo-950/40 px-4 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-900/50"
            >
              Add Skill
            </button>
          </div>

          {/* Skill Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {selectedSkills.map((s) => (
              <div
                key={s.skill_id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-[#101728] p-3 text-xs"
              >
                <div>
                  <h4 className="font-semibold text-white">{s.title}</h4>
                  <span className="text-[10px] text-slate-400">{s.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={s.level}
                    onChange={(e) => {
                      const updated = selectedSkills.map((item) =>
                        item.skill_id === s.skill_id ? { ...item, level: e.target.value } : item
                      );
                      setSelectedSkills(updated);
                    }}
                    className="rounded-lg border border-white/10 bg-[#090d16] px-2 py-1 text-[11px] text-cyan-300"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Elementary">Elementary</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button
                    onClick={() => removeSkill(s.skill_id)}
                    className="text-slate-500 hover:text-rose-400 text-xs px-1"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 text-xs text-indigo-300 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-white">Next Step: The Diagnostic Benchmark</span>
              Upon completing onboarding, Raizo will unlock your initial diagnostic assessment to turn these self-reported claims into verified evidence.
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center space-x-2 rounded-xl border border-white/10 bg-[#151B23]/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#151B23]/10"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-90 transition-all"
            >
              <span>{isSubmitting ? "Synthesizing Roadmap..." : "Launch Learning Intelligence"}</span>
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
