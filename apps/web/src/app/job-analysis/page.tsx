"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  FileText,
  Upload,
  RefreshCw,
  BookOpen,
  Filter,
  Check,
  X,
  Target,
  Clock,
  Layers,
  Award,
  AlertCircle,
  Bookmark,
  ExternalLink
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { JobListing, ATSAnalysisResult, BulletAnalysis, JobApplication } from "@/lib/types";

export default function JobAnalysisPage() {
  const { user } = useAuth();

  // Navigation tabs for entry
  const [activeTab, setActiveTab] = useState<"library" | "paste" | "upload">("library");

  // Job Library State
  const [jobLibrary, setJobLibrary] = useState<JobListing[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [companyTypeFilter, setCompanyTypeFilter] = useState<string>("all");
  const [roleFamilyFilter, setRoleFamilyFilter] = useState<string>("all");

  // Custom Pasted JD State
  const [customTitle, setCustomTitle] = useState("Data Analyst, Product Operations");
  const [customCompany, setCustomCompany] = useState("Google");
  const [customCompanyType, setCustomCompanyType] = useState<"Product" | "Service / Consulting">("Product");
  const [customJdText, setCustomJdText] = useState(`Role: Data Analyst, Product Operations
Company: Google
Location: Bengaluru / Hybrid
Requirements:
• Strong SQL proficiency: writing SELECT queries, complex multi-table JOINs, aggregations, and window functions (ROW_NUMBER, RANK, LAG).
• Experience with exploratory data analysis in Python with Pandas.
• Dashboard design in Tableau, Power BI, or Looker Studio.
• Understanding of descriptive statistics, variance analysis, and A/B testing principles.
• Ability to communicate insights clearly to cross-functional stakeholders.`);

  // Upload Resume State
  const [resumeText, setResumeText] = useState("");
  const [useActiveProfile, setUseActiveProfile] = useState(true);

  // Analysis Result State
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matrixFilter, setMatrixFilter] = useState<"all" | "must_have" | "gaps">("all");

  // Bullet Quality Analyzer State
  const [testBullet, setTestBullet] = useState("Analyzed cohort transaction logs using SQL window functions, reducing query latency by 28%.");
  const [bulletResult, setBulletResult] = useState<BulletAnalysis | null>(null);
  const [isAnalyzingBullet, setIsAnalyzingBullet] = useState(false);

  // Application Tracker State
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [trackingNotes, setTrackingNotes] = useState("");

  // Load Job Database and initial analysis on mount
  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await api.getCareerJobs();
        setJobLibrary(res.jobs || []);
        if (res.jobs && res.jobs.length > 0) {
          setSelectedJob(res.jobs[0]);
          // Automatically run initial analysis on the first job
          runAnalysis(res.jobs[0].id);
        }
      } catch (err) {
        console.error("Failed to load career jobs:", err);
      }
    }

    async function loadApplications() {
      try {
        const appRes = await api.getJobApplications();
        setApplications(appRes.applications || []);
      } catch (err) {
        console.error("Failed to load applications:", err);
      }
    }

    loadJobs();
    loadApplications();
  }, []);

  const runAnalysis = async (jobId?: string) => {
    setIsAnalyzing(true);
    try {
      let payload: any = {};
      if (activeTab === "library" || jobId) {
        payload.job_id = jobId || selectedJob?.id || "job_google_da_01";
      } else if (activeTab === "paste") {
        payload.job_title = customTitle;
        payload.company = customCompany;
        payload.company_type = customCompanyType;
        payload.job_description_text = customJdText;
      }

      if (!useActiveProfile && resumeText.trim()) {
        payload.resume_text = resumeText;
      }

      const res = await api.analyzeCareerFit(payload);
      setAnalysisResult(res.result);
      if (res.job_info) {
        setSelectedJob(res.job_info);
      }
    } catch (err) {
      console.error("Analysis execution error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeBullet = async () => {
    if (!testBullet.trim()) return;
    setIsAnalyzingBullet(true);
    try {
      const res = await api.analyzeBullet(testBullet);
      setBulletResult(res);
    } catch (err) {
      console.error("Bullet analysis error:", err);
    } finally {
      setIsAnalyzingBullet(false);
    }
  };

  const handleSaveApplication = async (status = "Saved") => {
    if (!selectedJob) return;
    try {
      const res = await api.saveJobApplication({
        job_id: selectedJob.id,
        company: selectedJob.company.name,
        job_title: selectedJob.role.title,
        fit_score: analysisResult?.overall_match || 75,
        status: status as any,
        notes: trackingNotes || `Analyzed with RAIZO ATS Score: ${analysisResult?.overall_match || 75}%`
      });
      setSavedStatus(status);
      const appRes = await api.getJobApplications();
      setApplications(appRes.applications || []);
      setTimeout(() => setSavedStatus(null), 3000);
    } catch (err) {
      console.error("Failed to save application:", err);
    }
  };

  // Filtered Job Library
  const filteredJobs = jobLibrary.filter((j) => {
    const q = searchFilter.toLowerCase();
    const matchesQ =
      !q ||
      j.role.title.toLowerCase().includes(q) ||
      j.company.name.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q);
    const matchesType =
      companyTypeFilter === "all" ||
      j.company.company_type.toLowerCase().includes(companyTypeFilter.toLowerCase());
    const matchesFamily =
      roleFamilyFilter === "all" ||
      j.role.family.toLowerCase().includes(roleFamilyFilter.toLowerCase());
    return matchesQ && matchesType && matchesFamily;
  });

  // Filtered Fit Matrix Items
  const filteredMatrix = (analysisResult?.fit_matrix || []).filter((item) => {
    if (matrixFilter === "must_have") return item.importance === "Must Have";
    if (matrixFilter === "gaps") return item.gap !== "None";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-4 px-2 sm:px-4">
      {/* 1. HEADER & EDITORIAL QUOTE */}
      {/* 1. UNIFIED PAGE HEADER */}
      <div className="raizo-page-header">
        <div className="space-y-1.5">
          <span className="raizo-page-eyebrow">
            <span className="h-2 w-2 rounded-full bg-[#5B8DEF]" />
            CAREER INTELLIGENCE
          </span>
          <h1 className="raizo-page-title">
            Universal ATS Gap Analyzer
          </h1>
          <p className="raizo-page-desc">
            Match your profile against target roles across Product and Consulting companies, detect precise knowledge gaps, and close them with verified proof.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => runAnalysis()}
            disabled={isAnalyzing}
            className="raizo-btn-primary"
          >
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
            <span>{isAnalyzing ? "Analyzing..." : "Re-Analyze Match"}</span>
          </button>
          <Link
            href="/resume"
            className="raizo-btn-secondary"
          >
            <FileText className="h-4 w-4 text-[#5B8DEF]" />
            <span>Resume Optimizer</span>
          </Link>
        </div>
      </div>

      {/* 2. 3 ENTRY OPTIONS TABS */}
      <div className="space-y-4">
        <div className="flex border-b border-[#27303B] gap-2">
          <button
            onClick={() => setActiveTab("library")}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === "library"
                ? "border-[#5B8DEF] text-[#5B8DEF]"
                : "border-transparent text-[#B4BDC8] hover:text-[#F5F7FA]"
            }`}
          >
            Option 1: Search Job Library (Product & Consulting)
          </button>
          <button
            onClick={() => setActiveTab("paste")}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === "paste"
                ? "border-[#5B8DEF] text-[#5B8DEF]"
                : "border-transparent text-[#B4BDC8] hover:text-[#F5F7FA]"
            }`}
          >
            Option 2: Paste Any Job Description
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === "upload"
                ? "border-[#5B8DEF] text-[#5B8DEF]"
                : "border-transparent text-[#B4BDC8] hover:text-[#F5F7FA]"
            }`}
          >
            Option 3: Resume Input Source
          </button>
        </div>

        {/* TAB 1: JOB LIBRARY */}
        {activeTab === "library" && (
          <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-[#7E8996]" />
                <input
                  type="text"
                  placeholder="Search roles, skills, or companies..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#27303B] bg-[#11161D] focus:bg-[#151B23] focus:outline-hidden focus:border-[#5B8DEF]"
                />
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <select
                  value={companyTypeFilter}
                  onChange={(e) => setCompanyTypeFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#27303B] bg-[#151B23] text-[#F5F7FA] text-xs font-medium"
                >
                  <option value="all">All Company Types</option>
                  <option value="product">Product (Google, Microsoft, Amazon)</option>
                  <option value="service">Service / Consulting (TCS, Deloitte)</option>
                </select>

                <select
                  value={roleFamilyFilter}
                  onChange={(e) => setRoleFamilyFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#27303B] bg-[#151B23] text-[#F5F7FA] text-xs font-medium"
                >
                  <option value="all">All Role Families (30+)</option>
                  <option value="Data">Data & Analytics</option>
                  <option value="Software">Software Engineering</option>
                  <option value="Business">Business & Strategy</option>
                  <option value="Cloud">Cloud & Infrastructure</option>
                  <option value="Product">Product Management</option>
                </select>
              </div>
            </div>

            {/* Seeded Job Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => {
                      setSelectedJob(job);
                      runAnalysis(job.id);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 flex flex-col justify-between ${
                      isSelected
                        ? "border-[#5B8DEF] bg-[#5B8DEF]/10/30 shadow-xs ring-1 ring-[#176B5B]"
                        : "border-[#27303B] bg-[#11161D] hover:bg-[#151B23] hover:border-[#202832]"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8DEF]">
                          {job.company.company_type}
                        </span>
                        <span className="text-[10px] text-[#B4BDC8]">
                          {job.location.city}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-[#F5F7FA]">
                        {job.role.title}
                      </h4>
                      <p className="text-xs font-semibold text-[#B4BDC8]">
                        {job.company.name} • {job.company.industry}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#27303B]/60 flex flex-wrap gap-1">
                      {job.requirements.must_have.slice(0, 3).map((req, i) => (
                        <span key={i} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#151B23] text-[#F5F7FA] border border-[#27303B]">
                          {req}
                        </span>
                      ))}
                      {job.requirements.must_have.length > 3 && (
                        <span className="text-[9px] text-[#7E8996] self-center">
                          +{job.requirements.must_have.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PASTE JOB DESCRIPTION */}
        {activeTab === "paste" && (
          <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 space-y-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#F5F7FA] block mb-1">
                  Target Job Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#27303B] bg-[#11161D] focus:bg-[#151B23] focus:outline-hidden"
                  placeholder="e.g. Senior Data Analyst"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#F5F7FA] block mb-1">
                  Hiring Company
                </label>
                <input
                  type="text"
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#27303B] bg-[#11161D] focus:bg-[#151B23] focus:outline-hidden"
                  placeholder="e.g. Stripe, Deloitte, TCS"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#F5F7FA] block mb-1">
                  Company Architecture
                </label>
                <select
                  value={customCompanyType}
                  onChange={(e: any) => setCustomCompanyType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#27303B] bg-[#11161D] focus:bg-[#151B23]"
                >
                  <option value="Product">Product Tech (Google, Meta, Startups)</option>
                  <option value="Service / Consulting">Service / Consulting (TCS, Deloitte, Accenture)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#F5F7FA] block mb-1">
                Paste Full Job Description Text
              </label>
              <textarea
                rows={5}
                value={customJdText}
                onChange={(e) => setCustomJdText(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-[#27303B] bg-[#11161D] focus:bg-[#151B23] focus:outline-hidden font-mono"
                placeholder="Paste the job description including responsibilities, requirements, and preferred qualifications..."
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => runAnalysis()}
                disabled={isAnalyzing}
                className="px-5 py-2.5 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold hover:bg-[#4779D8] transition-all shadow-sm"
              >
                {isAnalyzing ? "Analyzing JD..." : "Analyze Pasted Job Description"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: RESUME SOURCE INPUT */}
        {activeTab === "upload" && (
          <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-[#F5F7FA]">Resume Source</h4>
                <p className="text-xs text-[#B4BDC8]">
                  Choose whether to evaluate your active RAIZO verified profile or paste/upload another resume version.
                </p>
              </div>

              <button
                onClick={() => setUseActiveProfile(!useActiveProfile)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  useActiveProfile
                    ? "bg-[#5B8DEF]/10 text-[#5B8DEF] border-[#5B8DEF]/40"
                    : "bg-[#11161D] text-[#B4BDC8] border-[#27303B]"
                }`}
              >
                {useActiveProfile ? "✓ Using Active RAIZO Profile" : "Using Custom Resume Text"}
              </button>
            </div>

            {!useActiveProfile && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#F5F7FA] block">
                  Paste Resume Plain Text (or export from LinkedIn / PDF)
                </label>
                <textarea
                  rows={6}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your full resume text here..."
                  className="w-full p-3 text-xs rounded-xl border border-[#27303B] bg-[#11161D] focus:bg-[#151B23] focus:outline-hidden font-mono"
                />
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => runAnalysis()}
                disabled={isAnalyzing}
                className="px-5 py-2.5 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold hover:bg-[#4779D8] transition-all shadow-sm"
              >
                {isAnalyzing ? "Evaluating..." : "Run ATS Gap Evaluation"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. MULTI-DIMENSIONAL SCORING DISPLAY */}
      {analysisResult && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27303B] pb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
                  TARGET ROLE ANALYSIS
                </span>
                <h2 className="text-2xl font-extrabold text-[#F5F7FA]">
                  {analysisResult.target_job_title}
                </h2>
                <p className="text-xs font-semibold text-[#B4BDC8]">
                  {analysisResult.target_company} • Benchmark Evaluation
                </p>
              </div>

              {/* Overall & ATS twin scores */}
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-[#5B8DEF]/10/50 border border-[#5B8DEF]/30 text-center min-w-[110px]">
                  <span className="text-[10px] uppercase font-bold text-[#5B8DEF] block">Overall Match</span>
                  <span className="text-3xl font-black font-mono text-[#F5F7FA]">
                    {analysisResult.overall_match}%
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#11161D] border border-[#27303B] text-center min-w-[110px]">
                  <span className="text-[10px] uppercase font-bold text-[#B4BDC8] block">ATS Pass Rate</span>
                  <span className="text-3xl font-black font-mono text-[#36C98F]">
                    {analysisResult.ats_compatibility}%
                  </span>
                </div>
              </div>
            </div>

            {/* Multi-Dimensional Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#11161D] border border-[#27303B]">
                <span className="text-xs text-[#B4BDC8] block font-medium">Must-Have</span>
                <span className="text-xl font-extrabold font-mono text-[#F5F7FA]">
                  {analysisResult.required_skills_match}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#11161D] border border-[#27303B]">
                <span className="text-xs text-[#B4BDC8] block font-medium">Preferred</span>
                <span className="text-xl font-extrabold font-mono text-[#F5F7FA]">
                  {analysisResult.preferred_skills_match}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#11161D] border border-[#27303B]">
                <span className="text-xs text-[#B4BDC8] block font-medium">Knowledge</span>
                <span className="text-xl font-extrabold font-mono text-[#F5F7FA]">
                  {analysisResult.technical_knowledge_match}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#11161D] border border-[#27303B]">
                <span className="text-xs text-[#B4BDC8] block font-medium">Experience</span>
                <span className="text-xl font-extrabold font-mono text-[#F5F7FA]">
                  {analysisResult.experience_alignment}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#11161D] border border-[#27303B]">
                <span className="text-xs text-[#B4BDC8] block font-medium">Keywords</span>
                <span className="text-xl font-extrabold font-mono text-[#F5F7FA]">
                  {analysisResult.keyword_coverage}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#11161D] border border-[#27303B]">
                <span className="text-xs text-[#B4BDC8] block font-medium">Evidence</span>
                <span className="text-xl font-extrabold font-mono text-[#5B8DEF]">
                  {analysisResult.evidence_strength}%
                </span>
              </div>
            </div>

            {/* Match Summary Explanation */}
            <div className="p-4 rounded-xl bg-[#11161D] border border-[#27303B] text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8DEF] block">
                Honest Recruiter Assessment
              </span>
              <p className="text-[#F5F7FA] leading-relaxed">
                {analysisResult.match_explanation}
              </p>
            </div>

            {/* Quick Action Button to Track this Job */}
            <div className="flex items-center justify-between pt-2 border-t border-[#27303B]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveApplication("Saved")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#27303B] bg-[#151B23] text-xs font-semibold text-[#F5F7FA] hover:bg-[#1A212B] transition-all"
                >
                  <Bookmark className="h-3.5 w-3.5 text-[#5B8DEF]" />
                  <span>{savedStatus === "Saved" ? "✓ Saved to Tracker" : "Save Job"}</span>
                </button>
                <button
                  onClick={() => handleSaveApplication("Applied")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5B8DEF] text-white text-xs font-bold hover:bg-[#4779D8] transition-all"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{savedStatus === "Applied" ? "✓ Logged as Applied" : "Mark as Applied"}</span>
                </button>
              </div>

              <Link
                href="/resume"
                className="text-xs font-bold text-[#5B8DEF] hover:underline flex items-center gap-1"
              >
                <span>View Evidence-Based Resume for this Role</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* 4. JOB FIT MATRIX */}
          <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27303B] pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#F5F7FA]">
                  Job Fit Matrix
                </h3>
                <p className="text-xs text-[#B4BDC8]">
                  Granular requirement-by-requirement mapping against your resume and verified evidence.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 bg-[#11161D] p-1 rounded-xl border border-[#27303B] text-xs">
                <button
                  onClick={() => setMatrixFilter("all")}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    matrixFilter === "all" ? "bg-[#151B23] text-[#F5F7FA] shadow-xs" : "text-[#B4BDC8]"
                  }`}
                >
                  All ({analysisResult.fit_matrix.length})
                </button>
                <button
                  onClick={() => setMatrixFilter("must_have")}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    matrixFilter === "must_have" ? "bg-[#151B23] text-[#F5F7FA] shadow-xs" : "text-[#B4BDC8]"
                  }`}
                >
                  Must Have
                </button>
                <button
                  onClick={() => setMatrixFilter("gaps")}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    matrixFilter === "gaps" ? "bg-[#151B23] text-[#F5F7FA] shadow-xs" : "text-[#B4BDC8]"
                  }`}
                >
                  Gaps Only
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#27303B] text-[#7E8996] uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 font-bold">Requirement</th>
                    <th className="py-2.5 font-bold">Importance</th>
                    <th className="py-2.5 font-bold">Resume Match</th>
                    <th className="py-2.5 font-bold">Evidence Level</th>
                    <th className="py-2.5 font-bold text-right">Gap Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE1DD]">
                  {filteredMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#11161D] transition-colors">
                      <td className="py-3 font-semibold text-[#F5F7FA]">
                        {item.requirement}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.importance === "Must Have"
                            ? "bg-[#5B8DEF]/10 text-[#5B8DEF]"
                            : "bg-[#11161D] text-[#B4BDC8]"
                        }`}>
                          {item.importance}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`font-semibold ${
                          item.resume_match === "Strong"
                            ? "text-[#36C98F]"
                            : item.resume_match === "Partial"
                            ? "text-[#B67A22]"
                            : "text-[#E86A6A]"
                        }`}>
                          {item.resume_match}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-[#B4BDC8]">{item.evidence}</span>
                      </td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.gap === "None"
                            ? "bg-[#5B8DEF]/10 text-[#36C98F]"
                            : item.gap === "Low"
                            ? "bg-[#11161D] text-[#B4BDC8]"
                            : "bg-[#FFF4E5] text-[#B67A22]"
                        }`}>
                          {item.gap === "None" ? "Aligned" : `${item.gap} Gap`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. KNOWLEDGE GAPS & DIRECT ACTION LINKS */}
          <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-4 shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
                TARGETED REMEDIATION
              </span>
              <h3 className="text-lg font-extrabold text-[#F5F7FA]">
                Knowledge Gap Breakdown
              </h3>
              <p className="text-xs text-[#B4BDC8]">
                Concepts explicitly sought by this employer that require stronger conceptual understanding or evidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {analysisResult.knowledge_gaps.map((gap, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-[#27303B] bg-[#11161D] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B67A22]">
                        {gap.category}
                      </span>
                      <span className="text-[10px] font-bold text-[#E86A6A] bg-[#FFF4E5] px-2 py-0.5 rounded-full">
                        {gap.importance}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#F5F7FA]">{gap.concept}</h4>
                    <p className="text-xs text-[#B4BDC8] leading-snug">
                      {gap.recommended_action}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#27303B] flex items-center justify-between text-xs font-bold">
                    <Link
                      href={`/learn?topic=${encodeURIComponent(gap.concept)}`}
                      className="text-[#5B8DEF] hover:underline flex items-center gap-1"
                    >
                      <BookOpen className="h-3 w-3" />
                      <span>Learn in RAIZO</span>
                    </Link>
                    <Link
                      href="/practice"
                      className="text-[#F5F7FA] hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3 text-[#B67A22]" />
                      <span>Practice in RAIZO</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. EXPERIENCE GAP & RECOMMENDED CAPSTONE */}
          <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-4 shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
                PORTFOLIO PROOF
              </span>
              <h3 className="text-lg font-extrabold text-[#F5F7FA]">
                Experience Gap & Recommended Project
              </h3>
              <p className="text-xs text-[#B4BDC8]">
                How to prove capability to hiring managers without fabricating previous job titles.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#5B8DEF]/10/30 border border-[#5B8DEF]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5B8DEF] uppercase">
                  Recommended Capstone Project
                </span>
                <span className="text-xs font-bold text-[#36C98F] bg-[#5B8DEF]/10 px-2.5 py-0.5 rounded-full">
                  High Hiring Signal
                </span>
              </div>
              <h4 className="text-base font-extrabold text-[#F5F7FA]">
                {selectedJob?.recommended_project || "User Journey Cohort Retention & Churn Analysis"}
              </h4>
              <p className="text-xs text-[#B4BDC8] leading-relaxed">
                Build an end-to-end analytical case study covering data cleaning, relational joining, cohort analysis, and executive dashboard presentation. Submitting this capstone adds permanent proof to your Verified Skills ledger.
              </p>
              <div className="pt-2">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold hover:bg-[#4779D8] transition-colors"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Start Recommended Project</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 7. INTERACTIVE EXPERIENCE BULLET QUALITY ANALYZER */}
          <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-5 shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
                RESUME BULLET OPTIMIZATION
              </span>
              <h3 className="text-lg font-extrabold text-[#F5F7FA]">
                Experience Bullet Quality Analyzer
              </h3>
              <p className="text-xs text-[#B4BDC8]">
                Hiring managers and ATS algorithms reward bullets that follow the formula: <strong>Action Verb + Quantified Metric + Business Impact + Tool Named</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={testBullet}
                  onChange={(e) => setTestBullet(e.target.value)}
                  placeholder="Paste or draft a bullet point to analyze..."
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-[#27303B] bg-[#11161D] focus:bg-[#151B23] focus:outline-hidden"
                />
                <button
                  onClick={handleAnalyzeBullet}
                  disabled={isAnalyzingBullet}
                  className="px-5 py-2.5 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold hover:bg-[#4779D8] transition-all shadow-xs shrink-0"
                >
                  {isAnalyzingBullet ? "Evaluating..." : "Evaluate Bullet Quality"}
                </button>
              </div>

              {/* Bullet Evaluation Card */}
              {bulletResult && (
                <div className="p-4 rounded-xl border border-[#27303B] bg-[#11161D] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#27303B] pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#5B8DEF]">Quality Score</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black font-mono text-[#F5F7FA]">
                          {bulletResult.quality_score}%
                        </span>
                        <span className={`text-xs font-bold ${
                          bulletResult.quality_score >= 80 ? "text-[#36C98F]" : "text-[#B67A22]"
                        }`}>
                          {bulletResult.quality_score >= 80 ? "High Impact" : "Needs Quantification"}
                        </span>
                      </div>
                    </div>

                    {/* 4 Invariant Pills */}
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                      <span className={`px-2 py-0.5 rounded-full ${
                        bulletResult.action_verb ? "bg-[#5B8DEF]/10 text-[#36C98F]" : "bg-[#1A212B] text-[#E86A6A]"
                      }`}>
                        {bulletResult.action_verb ? "✓ Action Verb" : "✗ No Action Verb"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        bulletResult.quantified_metric ? "bg-[#5B8DEF]/10 text-[#36C98F]" : "bg-[#1A212B] text-[#E86A6A]"
                      }`}>
                        {bulletResult.quantified_metric ? "✓ Quantified Metric" : "✗ Needs Numbers"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        bulletResult.business_impact ? "bg-[#5B8DEF]/10 text-[#36C98F]" : "bg-[#1A212B] text-[#E86A6A]"
                      }`}>
                        {bulletResult.business_impact ? "✓ Business Impact" : "✗ Missing Outcome"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        bulletResult.tool_named ? "bg-[#5B8DEF]/10 text-[#36C98F]" : "bg-[#1A212B] text-[#E86A6A]"
                      }`}>
                        {bulletResult.tool_named ? "✓ Tool Named" : "✗ No Tool"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#B4BDC8]">
                    <strong>Feedback:</strong> {bulletResult.feedback}
                  </p>

                  {bulletResult.suggested_rewrite && (
                    <div className="p-3 rounded-lg bg-[#151B23] border border-[#27303B] space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[#5B8DEF]">
                        Suggested Authentic Rewrite:
                      </span>
                      <p className="text-xs font-medium text-[#F5F7FA] italic">
                        “{bulletResult.suggested_rewrite}”
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 8. 4-WEEK GAP-CLOSING ROADMAP */}
          <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-4 shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
                STRUCTURED ACTION PLAN
              </span>
              <h3 className="text-lg font-extrabold text-[#F5F7FA]">
                4-Week Gap-Closing Roadmap
              </h3>
              <p className="text-xs text-[#B4BDC8]">
                Execute this weekly progression to increase your ATS and hiring match score from 72% to 85%+.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {analysisResult.gap_closing_roadmap.map((week, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[#27303B] bg-[#11161D] space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#5B8DEF]">{week.week}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        week.status === "In Progress"
                          ? "bg-[#5B8DEF]/10 text-[#5B8DEF]"
                          : "bg-[#151B23] text-[#B4BDC8] border border-[#27303B]"
                      }`}>
                        {week.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-extrabold text-[#F5F7FA]">{week.focus}</h4>
                    <p className="text-[11px] text-[#B4BDC8] leading-snug">{week.deliverable}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 9. ROLE-SPECIFIC INTERVIEW PREPARATION & SIMULATOR */}
          <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-4 shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B8DEF] block">
                INTERVIEW READINESS
              </span>
              <h3 className="text-lg font-extrabold text-[#F5F7FA]">
                Job-Specific Interview Questions & Prompts
              </h3>
              <p className="text-xs text-[#B4BDC8]">
                Prepare for technical screens, business case assessments, and behavioral rounds for {analysisResult.target_job_title}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Technical */}
              <div className="p-4 rounded-xl border border-[#27303B] bg-[#11161D] space-y-2">
                <span className="font-bold text-[#5B8DEF] uppercase text-[11px] block">
                  Technical Architecture
                </span>
                <ul className="space-y-2 text-[#F5F7FA]">
                  {analysisResult.interview_preparation.technical.map((q, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-[#5B8DEF] font-bold">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Business Case */}
              <div className="p-4 rounded-xl border border-[#27303B] bg-[#11161D] space-y-2">
                <span className="font-bold text-[#5B8DEF] uppercase text-[11px] block">
                  Business Acumen & KPIs
                </span>
                <ul className="space-y-2 text-[#F5F7FA]">
                  {analysisResult.interview_preparation.business.map((q, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-[#5B8DEF] font-bold">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Behavioral */}
              <div className="p-4 rounded-xl border border-[#27303B] bg-[#11161D] space-y-2">
                <span className="font-bold text-[#5B8DEF] uppercase text-[11px] block">
                  Behavioral & Tradeoffs
                </span>
                <ul className="space-y-2 text-[#F5F7FA]">
                  {analysisResult.interview_preparation.behavioral.map((q, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-[#5B8DEF] font-bold">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 10. SAVED APPLICATION TRACKER LIST */}
          <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#27303B] pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#F5F7FA]">
                  Job Application Tracker
                </h3>
                <p className="text-xs text-[#B4BDC8]">
                  Track pipeline statuses across companies analyzed on RAIZO.
                </p>
              </div>
              <span className="text-xs font-bold text-[#5B8DEF]">
                {applications.length} Tracked Applications
              </span>
            </div>

            {applications.length === 0 ? (
              <p className="text-xs text-[#7E8996] italic">
                No saved applications yet. Click "Save Job" or "Mark as Applied" on any analyzed job above.
              </p>
            ) : (
              <div className="divide-y divide-[#DDE1DD] text-xs">
                {applications.map((app) => (
                  <div key={app.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#F5F7FA]">{app.job_title}</h4>
                      <p className="text-[#B4BDC8]">{app.company}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#5B8DEF]">
                        {app.fit_score}% Match
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#5B8DEF]/10 text-[#5B8DEF] font-bold text-[10px]">
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
