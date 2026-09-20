"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  Printer,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Download,
  AlertCircle,
  Clock,
  ShieldAlert,
  Search,
  FileCheck2,
  ChevronRight,
  RefreshCw,
  Layers,
  Award,
  AlertTriangle,
  HelpCircle,
  Edit3,
  Sliders,
  Eye,
  XCircle,
  X
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  ResumeData,
  DEFAULT_ALEX_RIVERA_RESUME,
  TARGET_ROLE_PRESETS,
  TargetRolePreset,
  calculateAtsCompatibility,
  analyzeResumeStrengths,
  analyzeResumeGaps,
  getPrioritizedChanges,
  analyzeJobDescription,
  rewriteBulletXYZ,
  generateOptimizedResume,
  AtsBreakdown,
  JobMatchResult,
  ImprovementComparison
} from "@/lib/resumeIntelligence";

export default function ResumePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resume State
  const [originalResume, setOriginalResume] = useState<ResumeData>(DEFAULT_ALEX_RIVERA_RESUME);
  const [activeTargetRole, setActiveTargetRole] = useState<string>("Data Analyst");
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleText, setCustomRoleText] = useState("");

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Active View / Modes: "preview" | "original" | "improvements" | "editor"
  const [activeViewMode, setActiveViewMode] = useState<"preview" | "original" | "improvements" | "editor">("preview");

  // Optimization & Rewrite State
  const [isOptimized, setIsOptimized] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState<ResumeData | null>(null);
  const [resumeImprovements, setResumeImprovements] = useState<ImprovementComparison[]>([]);

  // Priority Filter for Changes: "all" | "High" | "Medium" | "Low"
  const [priorityFilter, setPriorityFilter] = useState<"all" | "High" | "Medium" | "Low">("all");

  // Job Description Optimization State
  const [jdInputText, setJdInputText] = useState("");
  const [isAnalyzingJd, setIsAnalyzingJd] = useState(false);
  const [jdMatchResult, setJdMatchResult] = useState<JobMatchResult | null>(null);

  // Interactive XYZ Bullet Optimizer State
  const [interactiveDraftBullet, setInteractiveDraftBullet] = useState(
    "Managed database queries and built reports for cross-functional business teams."
  );
  const [interactiveMetricInput, setInteractiveMetricInput] = useState("");
  const [interactiveBulletResult, setInteractiveBulletResult] = useState<any>(null);

  // Copied toast state
  const [copiedState, setCopiedState] = useState<string | null>(null);

  // Editable Resume Text (for Edit Resume mode)
  const [editableResumeSummary, setEditableResumeSummary] = useState("");

  // Target role string resolution
  const effectiveTargetRole = isCustomRole && customRoleText.trim() ? customRoleText.trim() : activeTargetRole;

  // Active displayed resume: if optimized, show optimized in preview, otherwise original
  const currentDisplayedResume = isOptimized && optimizedResume ? optimizedResume : originalResume;

  // ATS Calculations (Deterministic)
  const originalAtsBreakdown: AtsBreakdown = useMemo(() => {
    return calculateAtsCompatibility(originalResume, effectiveTargetRole);
  }, [originalResume, effectiveTargetRole]);

  const optimizedAtsBreakdown: AtsBreakdown | null = useMemo(() => {
    if (!optimizedResume) return null;
    return calculateAtsCompatibility(optimizedResume, effectiveTargetRole);
  }, [optimizedResume, effectiveTargetRole]);

  const currentAtsBreakdown = isOptimized && optimizedAtsBreakdown ? optimizedAtsBreakdown : originalAtsBreakdown;

  // Strengths, Gaps, and Prioritized Recommendations
  const resumeStrengths = useMemo(() => {
    return analyzeResumeStrengths(currentDisplayedResume, effectiveTargetRole);
  }, [currentDisplayedResume, effectiveTargetRole]);

  const resumeGaps = useMemo(() => {
    return analyzeResumeGaps(originalResume, effectiveTargetRole);
  }, [originalResume, effectiveTargetRole]);

  const prioritizedChanges = useMemo(() => {
    return getPrioritizedChanges(originalResume, effectiveTargetRole);
  }, [originalResume, effectiveTargetRole]);

  const filteredChanges = useMemo(() => {
    if (priorityFilter === "all") return prioritizedChanges;
    return prioritizedChanges.filter((c) => c.priority === priorityFilter);
  }, [prioritizedChanges, priorityFilter]);

  // Load user profile name if available
  useEffect(() => {
    async function initProfile() {
      try {
        const res = await api.getProfile();
        if (res?.user?.name) {
          setOriginalResume((prev) => ({
            ...prev,
            candidateName: res.user.name
          }));
        }
      } catch (e) {
        // Fallback to Alex Rivera default
      }
    }
    initProfile();
  }, []);

  // Initialize editable text when preview changes
  useEffect(() => {
    setEditableResumeSummary(currentDisplayedResume.summary);
  }, [currentDisplayedResume]);

  // 1. File Upload Handler
  const handleFileUpload = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "doc", "docx", "txt"].includes(ext || "")) {
      setUploadError("Supported file formats are PDF, DOC, and DOCX.");
      return;
    }

    setUploadError(null);
    setUploadedFile(file);
    setIsUploading(true);

    try {
      if (ext === "txt") {
        const text = await file.text();
        setOriginalResume((prev) => ({
          ...prev,
          candidateName: text.split("\n")[0]?.trim() || prev.candidateName,
          rawText: text
        }));
      } else {
        // Try calling the backend API if available, with graceful client fallback
        try {
          const res = await api.uploadResumeFile(file);
          if (res?.extracted_profile) {
            const p = res.extracted_profile;
            setOriginalResume((prev) => ({
              ...prev,
              candidateName: p.name || prev.candidateName,
              summary: p.summary || prev.summary,
              rawText: p.summary || prev.rawText
            }));
          }
        } catch (apiErr) {
          console.warn("Backend parse fallback to client-side structure:", apiErr);
        }
      }

      setUploadSuccess(true);
      setIsOptimized(false);
      setOptimizedResume(null);
      setActiveViewMode("preview");
    } catch (err: any) {
      setUploadError(err.message || "Failed to process resume document.");
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Target Role Change Handler
  const handleTargetRoleSelect = (role: TargetRolePreset) => {
    if (role === "Other") {
      setIsCustomRole(true);
    } else {
      setIsCustomRole(false);
      setActiveTargetRole(role);
    }
    // If already optimized, recalculate
    if (isOptimized) {
      const { optimized, improvements } = generateOptimizedResume(
        originalResume,
        role === "Other" && customRoleText.trim() ? customRoleText.trim() : role,
        jdInputText
      );
      setOptimizedResume(optimized);
      setResumeImprovements(improvements);
    }
  };

  // 3. Job Description Analyzer
  const handleAnalyzeJd = () => {
    if (!jdInputText.trim()) return;
    setIsAnalyzingJd(true);
    setTimeout(() => {
      const result = analyzeJobDescription(originalResume, effectiveTargetRole, jdInputText);
      setJdMatchResult(result);
      setIsAnalyzingJd(false);
    }, 600);
  };

  // 4. XYZ Interactive Rewriter
  const handleRewriteInteractiveBullet = () => {
    if (!interactiveDraftBullet.trim()) return;
    const res = rewriteBulletXYZ(interactiveDraftBullet, interactiveMetricInput);
    setInteractiveBulletResult(res);
  };

  // 5. Full Resume Rewrite Action
  const handleRewriteFullResume = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const { optimized, improvements } = generateOptimizedResume(
        originalResume,
        effectiveTargetRole,
        jdInputText
      );
      setOptimizedResume(optimized);
      setResumeImprovements(improvements);
      setIsOptimized(true);
      setIsOptimizing(false);
      setActiveViewMode("preview");
      // Smooth scroll down to preview
      document.getElementById("resume-preview-panel")?.scrollIntoView({ behavior: "smooth" });
    }, 850);
  };

  // Copy Clipboard Helper
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(label);
    setTimeout(() => setCopiedState(null), 2200);
  };

  // Copy full resume markdown
  const handleCopyFullResume = () => {
    const res = currentDisplayedResume;
    const md = `# ${res.candidateName}
${res.targetRole} | ${res.contactInfo.location}
Email: ${res.contactInfo.email} | Phone: ${res.contactInfo.phone}
LinkedIn: ${res.contactInfo.linkedin} | Portfolio: ${res.contactInfo.portfolio || "https://raizo.ai"}

## PROFESSIONAL SUMMARY
${res.summary}

## TECHNICAL SKILLS
- Analytics & Modeling: ${res.skills.analytics.join(", ")}
- Programming: ${res.skills.programming.join(", ")}
- Databases & Querying: ${res.skills.databases.join(", ")}
- Visualization & BI: ${res.skills.visualization.join(", ")}
- Business Tools: ${res.skills.businessTools.join(", ")}

## PROFESSIONAL EXPERIENCE
${res.experiences
  .map(
    (exp) => `### ${exp.role} — ${exp.company}
${exp.period} | ${exp.location}
${exp.bullets.map((b) => `- ${b}`).join("\n")}`
  )
  .join("\n\n")}

## PROJECTS
${res.projects
  .map(
    (p) => `### ${p.name} | ${p.technologies.join(", ")}
- Problem: ${p.problem}
- Action: ${p.action}
- Implementation: ${p.technicalImplementation}
- Outcome: ${p.measurableOutcome || "Verified"}`
  )
  .join("\n\n")}

## EDUCATION
${res.education.map((edu) => `- ${edu.degree}, ${edu.institution} (${edu.year})`).join("\n")}

## CERTIFICATIONS
${res.certifications.map((c) => `- ${c}`).join("\n")}
`;
    handleCopyText(md, "resume-markdown");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-4 print:py-0">
      {/* ========================================================= */}
      {/* 1. UNIFIED PAGE HEADER & ACTIONS                          */}
      {/* ========================================================= */}
      <div className="raizo-page-header print:hidden">
        <div className="space-y-1.5">
          <span className="raizo-page-eyebrow">
            <span className="h-2 w-2 rounded-full bg-[#5B8DEF]" />
            RESUME INTELLIGENCE & ATS COMPATIBILITY
          </span>
          <h1 className="raizo-page-title">
            Resume Analyzer, ATS Checker & Truthful Optimizer
          </h1>
          <p className="raizo-page-desc">
            Analyze your resume against real ATS scanner benchmarks, identify concrete role gaps, and generate truthful, XYZ-structured improvements tailored to your target career.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {isOptimized ? (
            <button
              onClick={() => setActiveViewMode(activeViewMode === "original" ? "preview" : "original")}
              className="raizo-btn-secondary"
            >
              <Eye className="h-4 w-4 text-[#5B8DEF]" />
              <span>{activeViewMode === "original" ? "View Optimized" : "View Original"}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveViewMode("original")}
              className="raizo-btn-secondary"
            >
              <Eye className="h-4 w-4 text-[#B4BDC8]" />
              <span>View Original Resume</span>
            </button>
          )}

          <button
            onClick={handleRewriteFullResume}
            disabled={isOptimizing}
            className="raizo-btn-primary"
          >
            {isOptimizing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{isOptimized ? "Re-Optimize Resume" : "Optimize Resume"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="raizo-btn-secondary"
            title="Print or export as PDF"
          >
            <Printer className="h-4 w-4 text-[#B4BDC8]" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Mandatory Notification Banner */}
      <div className="rounded-2xl border border-[#5B8DEF]/30 bg-[#5B8DEF]/10 p-4 sm:p-5 flex items-start gap-3.5 print:hidden">
        <Sparkles className="h-5 w-5 text-[#5B8DEF] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5B8DEF]">
            Resume Intelligence Active
          </h4>
          <p className="text-xs sm:text-sm text-[#F5F7FA] font-medium leading-relaxed">
            “Your resume has been analyzed. RAIZO identified the strengths, gaps, ATS risks, and changes that can improve your alignment with your target role.”
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. STEP 1: RESUME UPLOAD                                  */}
      {/* ========================================================= */}
      <section className="print:hidden space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
              PHASE 1: INGESTION
            </span>
            <h2 className="text-xl font-extrabold text-[#F5F7FA]">
              Upload Your Resume
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#94A3B8]">
            Accepted: <strong className="text-[#F5F7FA]">PDF • DOC • DOCX • TXT</strong>
          </span>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
            uploadSuccess
              ? "border-[#36C98F]/50 bg-[#36C98F]/5"
              : "border-[#27303B] bg-[#151B23] hover:border-[#5B8DEF]/60 hover:bg-[#18202A]"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-xl bg-[#5B8DEF]/10 text-[#5B8DEF] flex items-center justify-center">
              {isUploading ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : uploadSuccess ? (
                <CheckCircle2 className="h-6 w-6 text-[#36C98F]" />
              ) : (
                <Upload className="h-6 w-6" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-[#F5F7FA]">
                {uploadedFile
                  ? `Active File: ${uploadedFile.name}`
                  : "Click to upload or drag and drop your PDF or DOCX resume"}
              </p>
              <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
                {uploadSuccess
                  ? "Resume parsed accurately. Original content preserved. Role-specific ATS evaluation updated below."
                  : "RAIZO extracts candidate entities, work experience, technical keywords, and formatting structure without altering your original document."}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#11161D] border border-[#27303B] text-[11px] font-mono text-[#94A3B8]">
              <span>PDF</span>
              <span>•</span>
              <span>DOC</span>
              <span>•</span>
              <span>DOCX</span>
              <span>•</span>
              <span>Max 10MB</span>
            </div>
          </div>
        </div>

        {uploadError && (
          <div className="rounded-xl bg-[#E86A6A]/10 border border-[#E86A6A]/30 p-3 flex items-center gap-2 text-xs text-[#E86A6A]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 3. STEP 2: TARGET ROLE SELECTION                          */}
      {/* ========================================================= */}
      <section className="print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
              PHASE 2: ROLE CALIBRATION
            </span>
            <h2 className="text-xl font-extrabold text-[#F5F7FA]">
              What role are you targeting?
            </h2>
          </div>
          <span className="text-xs font-medium text-[#94A3B8]">
            Selected target affects ATS keywords, rubrics, and gap analysis.
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#151B23] border border-[#27303B] space-y-4">
          <div className="flex flex-wrap gap-2">
            {TARGET_ROLE_PRESETS.map((role) => {
              const isSelected = !isCustomRole && activeTargetRole === role;
              const isOtherSelected = isCustomRole && role === "Other";
              const active = isSelected || isOtherSelected;
              return (
                <button
                  key={role}
                  onClick={() => handleTargetRoleSelect(role)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    active
                      ? "bg-[#5B8DEF] text-white border-[#5B8DEF] shadow-xs"
                      : "bg-[#11161D] text-[#B4BDC8] border-[#27303B] hover:border-[#5B8DEF]/40 hover:text-[#F5F7FA]"
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>

          {isCustomRole && (
            <div className="pt-2 border-t border-[#27303B] space-y-2">
              <label className="text-xs font-semibold text-[#94A3B8] block">
                Enter Custom Target Role Title:
              </label>
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={customRoleText}
                  onChange={(e) => setCustomRoleText(e.target.value)}
                  placeholder="e.g. Risk Analytics Specialist, Growth Operations Analyst"
                  className="raizo-input"
                />
                <button
                  onClick={() => {
                    if (isOptimized) handleRewriteFullResume();
                  }}
                  className="raizo-btn-primary shrink-0"
                >
                  Set Role
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. STEP 3: ATS CHECKER — ROLE-SPECIFIC DETERMINISTIC SCORE*/}
      {/* ========================================================= */}
      <section className="print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
              PHASE 3: AUDIT
            </span>
            <h2 className="text-xl font-extrabold text-[#F5F7FA]">
              RAIZO ATS Compatibility Score
            </h2>
          </div>
          <span className="text-xs font-mono text-[#5B8DEF] bg-[#5B8DEF]/10 px-3 py-1 rounded-full border border-[#5B8DEF]/30">
            Targeting: {effectiveTargetRole}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-[#151B23] border border-[#27303B] space-y-6">
          {/* Main Score & Before vs After View */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#27303B]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                  Compatibility Benchmark
                </span>
                {isOptimized && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#36C98F]/10 text-[#36C98F] border border-[#36C98F]/30">
                    Optimized Version Active
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black font-mono text-[#F5F7FA]">
                  {currentAtsBreakdown.totalScore}
                </span>
                <span className="text-base font-bold text-[#94A3B8]">/ 100</span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Deterministic calculation based on {effectiveTargetRole} keyword density, technical skill match, and metric frequency.
              </p>
            </div>

            {/* Before vs After Score Pill */}
            {isOptimized && optimizedAtsBreakdown && (
              <div className="p-4 rounded-xl bg-[#11161D] border border-[#27303B] space-y-2 min-w-[280px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8DEF] block">
                  ATS Score Before vs After
                </span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">Before Optimization:</span>
                  <span className="font-mono font-bold text-[#F5F7FA]">{originalAtsBreakdown.totalScore}/100</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">After Optimization:</span>
                  <span className="font-mono font-bold text-[#36C98F]">{optimizedAtsBreakdown.totalScore}/100</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#27303B] font-bold text-[#36C98F]">
                  <span>Score Improvement:</span>
                  <span>+{optimizedAtsBreakdown.totalScore - originalAtsBreakdown.totalScore} points</span>
                </div>
              </div>
            )}
          </div>

          {/* Transparent 7-Metric Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Transparent Attribute Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
                <span className="text-[11px] text-[#94A3B8] block">Keyword Match</span>
                <span className="text-lg font-bold font-mono text-[#F5F7FA]">{currentAtsBreakdown.keywordMatch}/100</span>
                <div className="w-full bg-[#27303B] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#5B8DEF] h-full" style={{ width: `${currentAtsBreakdown.keywordMatch}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
                <span className="text-[11px] text-[#94A3B8] block">Skills Match</span>
                <span className="text-lg font-bold font-mono text-[#F5F7FA]">{currentAtsBreakdown.skillsMatch}/100</span>
                <div className="w-full bg-[#27303B] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#5B8DEF] h-full" style={{ width: `${currentAtsBreakdown.skillsMatch}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
                <span className="text-[11px] text-[#94A3B8] block">Experience Relevance</span>
                <span className="text-lg font-bold font-mono text-[#F5F7FA]">{currentAtsBreakdown.experienceRelevance}/100</span>
                <div className="w-full bg-[#27303B] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#5B8DEF] h-full" style={{ width: `${currentAtsBreakdown.experienceRelevance}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
                <span className="text-[11px] text-[#94A3B8] block">Achievement Strength</span>
                <span className="text-lg font-bold font-mono text-[#F5F7FA]">{currentAtsBreakdown.achievementStrength}/100</span>
                <div className="w-full bg-[#27303B] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#5B8DEF] h-full" style={{ width: `${currentAtsBreakdown.achievementStrength}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
                <span className="text-[11px] text-[#94A3B8] block">Education & Certs</span>
                <span className="text-lg font-bold font-mono text-[#F5F7FA]">{currentAtsBreakdown.educationCertifications}/100</span>
                <div className="w-full bg-[#27303B] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#5B8DEF] h-full" style={{ width: `${currentAtsBreakdown.educationCertifications}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
                <span className="text-[11px] text-[#94A3B8] block">ATS Formatting</span>
                <span className="text-lg font-bold font-mono text-[#F5F7FA]">{currentAtsBreakdown.atsFormatting}/100</span>
                <div className="w-full bg-[#27303B] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#5B8DEF] h-full" style={{ width: `${currentAtsBreakdown.atsFormatting}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-[#94A3B8] block">Role Alignment</span>
                <span className="text-lg font-bold font-mono text-[#F5F7FA]">{currentAtsBreakdown.roleAlignment}/100</span>
                <div className="w-full bg-[#27303B] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#36C98F] h-full" style={{ width: `${currentAtsBreakdown.roleAlignment}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] text-[11px] text-[#94A3B8] leading-relaxed">
            <strong className="text-[#F5F7FA]">Disclaimer: </strong>
            “This score estimates resume-to-role compatibility based on the uploaded resume and selected target role. Actual ATS results may vary by employer and job description.”
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. STEP 4: RESUME STRENGTHS                               */}
      {/* ========================================================= */}
      <section className="print:hidden space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#36C98F] block">
            PHASE 4: COMPETENCY HIGHLIGHTS
          </span>
          <h2 className="text-xl font-extrabold text-[#F5F7FA]">
            What Your Resume Does Well
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resumeStrengths.map((s, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#151B23] border border-[#27303B] space-y-2 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#36C98F]" />
                  <h4 className="text-xs font-bold text-[#F5F7FA]">{s.title}</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#36C98F]/10 text-[#36C98F]">
                  Verified from Resume
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {s.evidence}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. STEP 5: RESUME GAPS                                    */}
      {/* ========================================================= */}
      <section className="print:hidden space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#F2B84B] block">
            PHASE 5: ROLE DEFICITS
          </span>
          <h2 className="text-xl font-extrabold text-[#F5F7FA]">
            What You Should Improve
          </h2>
        </div>

        <div className="space-y-3">
          {resumeGaps.map((g, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#151B23] border border-[#27303B] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#F2B84B]" />
                  <h4 className="text-xs font-bold text-[#F5F7FA]">{g.gap}</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F2B84B]/10 text-[#F2B84B]">
                  Potential Gap
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1 border-t border-[#27303B]">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#94A3B8]">Why It Matters:</span>
                  <p className="text-[#94A3B8] leading-relaxed">{g.whyItMatters}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#5B8DEF]">Recommended Change:</span>
                  <p className="text-[#F5F7FA] leading-relaxed">{g.recommendedChange}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. STEP 6: WHAT SHOULD I CHANGE? (PRIORITIZED)            */}
      {/* ========================================================= */}
      <section className="print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
              PHASE 6: ACTIONABLE EDITS
            </span>
            <h2 className="text-xl font-extrabold text-[#F5F7FA]">
              What Should You Change to Improve Your Chances?
            </h2>
          </div>

          {/* Priority Filter */}
          <div className="flex rounded-xl bg-[#151B23] p-1 border border-[#27303B] text-xs font-semibold">
            {(["all", "High", "Medium", "Low"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  priorityFilter === p
                    ? "bg-[#5B8DEF] text-white"
                    : "text-[#94A3B8] hover:text-[#F5F7FA]"
                }`}
              >
                {p === "all" ? "All Priorities" : `${p} Priority`}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredChanges.map((change, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#151B23] border border-[#27303B] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    change.priority === "High"
                      ? "bg-[#E86A6A]/10 text-[#E86A6A] border border-[#E86A6A]/30"
                      : change.priority === "Medium"
                      ? "bg-[#F2B84B]/10 text-[#F2B84B] border border-[#F2B84B]/30"
                      : "bg-[#5B8DEF]/10 text-[#5B8DEF] border border-[#5B8DEF]/30"
                  }`}
                >
                  {change.priority} Priority
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#11161D] text-[#94A3B8] border border-[#27303B]">
                  Recommended Improvement
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#E86A6A]">Current:</span>
                  <p className="text-[#94A3B8] font-mono text-[11px] leading-relaxed">
                    “{change.current}”
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#5B8DEF]/30 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#36C98F]">Recommended:</span>
                  <p className="text-[#F5F7FA] font-medium text-[11px] leading-relaxed">
                    “{change.recommended}”
                  </p>
                </div>
              </div>

              <div className="text-xs text-[#94A3B8] pt-1">
                <strong className="text-[#F5F7FA]">Reason: </strong>
                {change.reason}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. STEP 7: JOB DESCRIPTION OPTIMIZATION                   */}
      {/* ========================================================= */}
      <section className="print:hidden space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
            PHASE 7: JOB-SPECIFIC FIT
          </span>
          <h2 className="text-xl font-extrabold text-[#F5F7FA]">
            Optimize for a Specific Job
          </h2>
        </div>

        <div className="p-6 rounded-2xl bg-[#151B23] border border-[#27303B] space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#94A3B8] block">
              Paste the job description to optimize your resume for this specific role:
            </label>
            <textarea
              rows={5}
              value={jdInputText}
              onChange={(e) => setJdInputText(e.target.value)}
              placeholder="Paste responsibilities, required skills, tools, and qualification requirements from LinkedIn, Indeed, or Greenhouse job post..."
              className="raizo-input font-mono text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setJdInputText(
                    `Senior Data Analyst\nRequirements:\n• 3+ years experience with advanced SQL, window functions, and relational data modeling.\n• Proven Python / Pandas capability for automated ETL pipelines and data hygiene.\n• Hands-on dashboarding in Power BI or Tableau tracking cohort retention and business KPIs.\n• Strong stakeholder management and statistical hypothesis testing (A/B testing).`
                  )
                }
                className="text-xs text-[#5B8DEF] hover:underline"
              >
                Load Sample Job Description
              </button>
              {jdInputText && (
                <button
                  onClick={() => {
                    setJdInputText("");
                    setJdMatchResult(null);
                  }}
                  className="text-xs text-[#94A3B8] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={handleAnalyzeJd}
              disabled={isAnalyzingJd || !jdInputText.trim()}
              className="raizo-btn-primary"
            >
              {isAnalyzingJd ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span>Analyze Job Description</span>
            </button>
          </div>

          {/* Job Match Result Panel */}
          {jdMatchResult && (
            <div className="p-5 rounded-xl bg-[#11161D] border border-[#5B8DEF]/30 space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#27303B]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8DEF] block">
                    Job Match Evaluation
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-mono text-[#F5F7FA]">
                      {jdMatchResult.jobMatchScore}
                    </span>
                    <span className="text-xs font-bold text-[#94A3B8]">/ 100 Match Score</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#36C98F]/10 text-[#36C98F] border border-[#36C98F]/30">
                  Matched to Job Description
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Matched */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-[#36C98F] block">
                    Matched Requirements ({jdMatchResult.matchedRequirements.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdMatchResult.matchedRequirements.map((r) => (
                      <span key={r} className="px-2 py-1 rounded bg-[#36C98F]/10 text-[#36C98F] text-[11px] font-semibold">
                        ✓ {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Partially Matched */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-[#F2B84B] block">
                    Developing Evidence ({jdMatchResult.partiallyMatchedRequirements.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdMatchResult.partiallyMatchedRequirements.map((r) => (
                      <span key={r} className="px-2 py-1 rounded bg-[#F2B84B]/10 text-[#F2B84B] text-[11px] font-semibold">
                        ~ {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-[#E86A6A] block">
                    Missing Requirements ({jdMatchResult.missingRequirements.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdMatchResult.missingRequirements.map((r) => (
                      <span key={r} className="px-2 py-1 rounded bg-[#E86A6A]/10 text-[#E86A6A] text-[11px] font-semibold">
                        ✗ {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Natural Incorporations & Experience to Emphasize */}
              <div className="pt-3 border-t border-[#27303B] space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase text-[#5B8DEF] block">
                  Experience That Should Be Emphasized:
                </span>
                <ul className="list-disc pl-5 space-y-1 text-[#94A3B8]">
                  {jdMatchResult.experienceToEmphasize.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. STEP 8: XYZ ACHIEVEMENT FORMAT (GOOGLE/AMAZON STYLE)   */}
      {/* ========================================================= */}
      <section className="print:hidden space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
            PHASE 8: BULLET OPTIMIZATION
          </span>
          <h2 className="text-xl font-extrabold text-[#F5F7FA]">
            Google / Amazon XYZ Achievement Formatter
          </h2>
        </div>

        <div className="p-6 rounded-2xl bg-[#151B23] border border-[#27303B] space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#5B8DEF]">
              Formula: Accomplished [X], as measured by [Y], by doing [Z].
            </span>
            <p className="text-xs text-[#94A3B8]">
              Convert passive, task-oriented duty descriptions into quantified, achievement-oriented bullets without fabricating fake numbers.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#94A3B8] block">
              Draft Experience Bullet:
            </label>
            <input
              type="text"
              value={interactiveDraftBullet}
              onChange={(e) => setInteractiveDraftBullet(e.target.value)}
              placeholder="e.g. Worked on sales analysis and generated reports"
              className="raizo-input text-xs"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#94A3B8]">
                Optional: Enter Known Metric (If known, e.g. 35%, $50K, 12 hrs/wk):
              </label>
              <span className="text-[10px] font-bold text-[#F2B84B]">
                User Input Required (Never Invented)
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={interactiveMetricInput}
                onChange={(e) => setInteractiveMetricInput(e.target.value)}
                placeholder="e.g. 35% turnaround reduction"
                className="raizo-input text-xs"
              />
              <button
                onClick={handleRewriteInteractiveBullet}
                className="raizo-btn-primary shrink-0"
              >
                <Sparkles className="h-4 w-4" />
                <span>Format XYZ</span>
              </button>
            </div>
          </div>

          {interactiveBulletResult && (
            <div className="p-4 rounded-xl bg-[#11161D] border border-[#5B8DEF]/30 space-y-2 animate-in fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#5B8DEF]">
                  {interactiveBulletResult.isXyz ? "✓ Standard XYZ Bullet" : "Qualitative Achievement Bullet"}
                </span>
                <button
                  onClick={() => handleCopyText(interactiveBulletResult.rewritten, "xyz-bullet")}
                  className="text-xs text-[#5B8DEF] hover:underline flex items-center gap-1"
                >
                  {copiedState === "xyz-bullet" ? "Copied!" : "Copy Bullet"}
                </button>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#F5F7FA] leading-relaxed">
                • {interactiveBulletResult.rewritten}
              </p>
              {interactiveBulletResult.requiresMetricInput && (
                <p className="text-[11px] text-[#F2B84B]">
                  Notice: No metric was fabricated. Provide your real metric above to add formal [Y] quantification.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. STEP 9: RESUME REWRITE & BEFORE vs AFTER COMPARISON   */}
      {/* ========================================================= */}
      {isOptimized && resumeImprovements.length > 0 && (
        <section className="print:hidden space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#36C98F] block">
                PHASE 9: VERIFIABLE TRANSFORMATION
              </span>
              <h2 className="text-xl font-extrabold text-[#F5F7FA]">
                Resume Improvements (Before vs After)
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#36C98F]/10 text-[#36C98F]">
              4 Transformative Optimizations
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#27303B] bg-[#151B23]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#27303B] bg-[#11161D] text-[#94A3B8] uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4 w-1/4">Original Section</th>
                  <th className="p-4 w-1/3">Optimized Version</th>
                  <th className="p-4 w-5/12">Why This Change Was Made</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27303B]">
                {resumeImprovements.map((imp, idx) => (
                  <tr key={idx} className="hover:bg-[#18202A] transition-colors">
                    <td className="p-4 align-top">
                      <span className="text-[11px] font-bold text-[#F5F7FA] block mb-1">
                        {imp.section}
                      </span>
                      <p className="text-[11px] text-[#94A3B8] font-mono leading-relaxed line-clamp-4">
                        “{imp.original}”
                      </p>
                    </td>
                    <td className="p-4 align-top">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#36C98F]/10 text-[#36C98F] inline-block mb-1">
                        Optimized
                      </span>
                      <p className="text-[11px] text-[#F5F7FA] font-medium leading-relaxed">
                        “{imp.optimized}”
                      </p>
                    </td>
                    <td className="p-4 align-top text-[#94A3B8] leading-relaxed">
                      {imp.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 11. STEP 10: PROFESSIONAL RESUME PREVIEW PANEL            */}
      {/* ========================================================= */}
      <section id="resume-preview-panel" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
                PHASE 10: RESUME PREVIEW & EXPORT
              </span>
              <h2 className="text-xl font-extrabold text-[#F5F7FA]">
                Professional Resume Document
              </h2>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl bg-[#151B23] p-1 border border-[#27303B] text-xs font-semibold">
              <button
                onClick={() => setActiveViewMode("preview")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeViewMode === "preview"
                    ? "bg-[#5B8DEF] text-white"
                    : "text-[#94A3B8] hover:text-[#F5F7FA]"
                }`}
              >
                {isOptimized ? "Optimized View" : "Resume Preview"}
              </button>
              <button
                onClick={() => setActiveViewMode("original")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeViewMode === "original"
                    ? "bg-[#5B8DEF] text-white"
                    : "text-[#94A3B8] hover:text-[#F5F7FA]"
                }`}
              >
                Original Raw
              </button>
              <button
                onClick={() => setActiveViewMode("editor")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeViewMode === "editor"
                    ? "bg-[#5B8DEF] text-white"
                    : "text-[#94A3B8] hover:text-[#F5F7FA]"
                }`}
              >
                Edit Resume
              </button>
            </div>

            <button
              onClick={handleCopyFullResume}
              className="raizo-btn-secondary"
            >
              <Copy className="h-4 w-4 text-[#B4BDC8]" />
              <span>{copiedState === "resume-markdown" ? "Copied!" : "Copy Markdown"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="raizo-btn-primary"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* View Mode: Original Raw Text */}
        {activeViewMode === "original" && (
          <div className="p-6 rounded-2xl bg-[#151B23] border border-[#27303B] space-y-3 print:hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5F7FA]">
                Original Ingested Resume Plain Text
              </span>
              <button
                onClick={() => handleCopyText(originalResume.rawText, "raw-text")}
                className="text-xs text-[#5B8DEF] hover:underline"
              >
                {copiedState === "raw-text" ? "Copied Raw Text" : "Copy Raw Text"}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#11161D] border border-[#27303B] font-mono text-xs text-[#B4BDC8] whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {originalResume.rawText}
            </pre>
          </div>
        )}

        {/* View Mode: Live Inline Editor */}
        {activeViewMode === "editor" && (
          <div className="p-6 rounded-2xl bg-[#151B23] border border-[#27303B] space-y-4 print:hidden">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-[#F5F7FA]">Live Resume Content Editor</h4>
                <p className="text-xs text-[#94A3B8]">
                  Adjust your summary or bullet statements directly. Changes update the ATS evaluation in real-time.
                </p>
              </div>
              <button
                onClick={() => {
                  if (optimizedResume) {
                    setOptimizedResume({
                      ...optimizedResume,
                      summary: editableResumeSummary
                    });
                  } else {
                    setOriginalResume({
                      ...originalResume,
                      summary: editableResumeSummary
                    });
                  }
                  setActiveViewMode("preview");
                }}
                className="raizo-btn-primary"
              >
                <Check className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#94A3B8] block">
                Professional Summary:
              </label>
              <textarea
                rows={4}
                value={editableResumeSummary}
                onChange={(e) => setEditableResumeSummary(e.target.value)}
                className="raizo-input text-xs leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Standard Clean Resume Document Preview (Without Evidence Badges) */}
        {activeViewMode === "preview" && (
          <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-8 sm:p-12 shadow-md space-y-8 print:shadow-none print:border-none print:p-0 print:bg-white print:text-black">
            {/* Header Block */}
            <div className="border-b border-[#27303B] pb-6 space-y-2 print:border-black/20">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <h3 className="text-3xl font-black text-[#F5F7FA] tracking-tight print:text-black uppercase">
                  {currentDisplayedResume.candidateName}
                </h3>
                <span className="text-xs font-bold text-[#5B8DEF] font-mono print:text-black uppercase">
                  Target: {effectiveTargetRole}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] print:text-gray-600">
                {currentDisplayedResume.contactInfo.location} • {currentDisplayedResume.contactInfo.email} • {currentDisplayedResume.contactInfo.phone}
              </p>
              <p className="text-[11px] text-[#94A3B8] print:text-gray-600">
                LinkedIn: {currentDisplayedResume.contactInfo.linkedin} • Portfolio: {currentDisplayedResume.contactInfo.portfolio || "https://raizo.ai"}
              </p>
            </div>

            {/* Professional Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#5B8DEF] print:text-black">
                PROFESSIONAL SUMMARY
              </h4>
              <p className="text-xs sm:text-sm text-[#F5F7FA] leading-relaxed print:text-gray-900">
                {currentDisplayedResume.summary}
              </p>
            </div>

            {/* Technical Skills Grouped Logically (Without Evidence Badges) */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#5B8DEF] print:text-black">
                TECHNICAL SKILLS
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {currentDisplayedResume.skills.analytics.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-[#27303B] bg-[#11161D] space-y-1 print:border-gray-300 print:bg-gray-50">
                    <span className="font-bold text-[#F5F7FA] print:text-black block">Analytics & Modeling</span>
                    <p className="text-[#94A3B8] print:text-gray-700">
                      {currentDisplayedResume.skills.analytics.join(", ")}
                    </p>
                  </div>
                )}

                {currentDisplayedResume.skills.databases.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-[#27303B] bg-[#11161D] space-y-1 print:border-gray-300 print:bg-gray-50">
                    <span className="font-bold text-[#F5F7FA] print:text-black block">Databases & Querying</span>
                    <p className="text-[#94A3B8] print:text-gray-700">
                      {currentDisplayedResume.skills.databases.join(", ")}
                    </p>
                  </div>
                )}

                {currentDisplayedResume.skills.programming.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-[#27303B] bg-[#11161D] space-y-1 print:border-gray-300 print:bg-gray-50">
                    <span className="font-bold text-[#F5F7FA] print:text-black block">Programming & Data Pipelines</span>
                    <p className="text-[#94A3B8] print:text-gray-700">
                      {currentDisplayedResume.skills.programming.join(", ")}
                    </p>
                  </div>
                )}

                {currentDisplayedResume.skills.visualization.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-[#27303B] bg-[#11161D] space-y-1 print:border-gray-300 print:bg-gray-50">
                    <span className="font-bold text-[#F5F7FA] print:text-black block">Visualization & BI</span>
                    <p className="text-[#94A3B8] print:text-gray-700">
                      {currentDisplayedResume.skills.visualization.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Experience */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#5B8DEF] print:text-black">
                PROFESSIONAL EXPERIENCE
              </h4>

              <div className="space-y-4 text-xs">
                {currentDisplayedResume.experiences.map((exp) => (
                  <div key={exp.id} className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between font-bold text-[#F5F7FA] print:text-black">
                      <span>{exp.role} — {exp.company}</span>
                      <span className="text-[#94A3B8] font-normal text-[11px] print:text-gray-600">{exp.period} | {exp.location}</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-1.5 text-[#94A3B8] print:text-gray-700 leading-relaxed">
                      {exp.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects (With Problem / Action / Implementation / Outcome) */}
            {currentDisplayedResume.projects.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#5B8DEF] print:text-black">
                  PROJECTS & TECHNICAL IMPLEMENTATIONS
                </h4>
                <div className="space-y-3 text-xs">
                  {currentDisplayedResume.projects.map((proj) => (
                    <div key={proj.id} className="p-4 rounded-xl border border-[#27303B] bg-[#11161D] space-y-2 print:border-gray-300 print:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#F5F7FA] print:text-black">
                          {proj.name} | {proj.technologies.join(", ")}
                        </span>
                        {proj.measurableOutcome && (
                          <span className="text-[11px] font-semibold text-[#36C98F] print:text-black">
                            {proj.measurableOutcome}
                          </span>
                        )}
                      </div>
                      <p className="text-[#94A3B8] print:text-gray-700">
                        <strong>Problem:</strong> {proj.problem}
                      </p>
                      <p className="text-[#F5F7FA] print:text-gray-900">
                        <strong>Action & Implementation:</strong> {proj.action} {proj.technicalImplementation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#5B8DEF] print:text-black">
                EDUCATION
              </h4>
              <div className="text-xs space-y-1">
                {currentDisplayedResume.education.map((edu) => (
                  <div key={edu.id}>
                    <p className="font-bold text-[#F5F7FA] print:text-black">
                      {edu.degree} — {edu.institution}
                    </p>
                    <p className="text-[#94A3B8] print:text-gray-700 text-[11px]">
                      {edu.year} {edu.details ? `• ${edu.details}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {currentDisplayedResume.certifications.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#5B8DEF] print:text-black">
                  CERTIFICATIONS & CREDENTIALS
                </h4>
                <ul className="list-disc pl-5 text-xs text-[#94A3B8] print:text-gray-700 space-y-1">
                  {currentDisplayedResume.certifications.map((c, i) => (
                    <li key={i} className="font-medium text-[#F5F7FA] print:text-black">{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Completeness & Incomplete Section Audit */}
            <div className="pt-4 border-t border-[#27303B] print:hidden space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Resume Completeness Audit
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-[#11161D] border border-[#27303B] text-[#36C98F] font-semibold">
                  ✓ Contact Info: Complete
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#11161D] border border-[#27303B] text-[#36C98F] font-semibold">
                  ✓ Experience: 2 Roles Documented
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#11161D] border border-[#27303B] text-[#36C98F] font-semibold">
                  ✓ Projects: Capstone Included
                </span>
                {currentDisplayedResume.missingSections.length > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#F2B84B]/10 border border-[#F2B84B]/30 text-[#F2B84B] font-semibold">
                    ~ Optional Incomplete: {currentDisplayedResume.missingSections.join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 12. FINAL ACTIONS DOCK                                    */}
      {/* ========================================================= */}
      <div className="raizo-dock-toolbar print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={handleRewriteFullResume}
            disabled={isOptimizing}
            className="raizo-dock-btn text-[#5B8DEF]"
          >
            {isOptimizing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{isOptimized ? "Recalculate ATS & Optimize" : "Rewrite My Resume"}</span>
          </button>

          <button
            onClick={() => {
              setJdInputText("");
              setJdMatchResult(null);
              window.scrollTo({ top: 900, behavior: "smooth" });
            }}
            className="raizo-dock-btn"
          >
            <Briefcase className="h-4 w-4 text-[#B4BDC8]" />
            <span>Analyze Another Job</span>
          </button>

          <button
            onClick={handlePrint}
            className="raizo-dock-btn"
          >
            <Download className="h-4 w-4 text-[#36C98F]" />
            <span>Download Optimized Resume</span>
          </button>
        </div>
      </div>
    </div>
  );
}
