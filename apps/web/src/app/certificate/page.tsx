"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Download,
  Share2,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Lock,
  AlertTriangle,
  FileCheck2,
  BookOpen,
  Layers,
  Clock
} from "lucide-react";
import { api, API_BASE } from "@/lib/api";
import { Certificate, CertificateEligibility } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { RaizoMark } from "@/components/RaizoLogo";
import {
  getCertificateEligibility,
  CertificateEligibilityResult
} from "@/lib/certificateEligibility";

export default function CertificatePage() {
  const { user } = useAuth();
  const [backendEligibility, setBackendEligibility] = useState<CertificateEligibility | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [roadmap, setRoadmap] = useState<any | null>(null);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [practiceSolved, setPracticeSolved] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Exact saved full name (Section 4 requirement)
  const savedName = typeof window !== "undefined" ? localStorage.getItem("raizo_user_name") : null;
  const exactFullName = (user?.name && user.name !== "Alex Rivera" ? user.name : null) || savedName || user?.name || "Verified Learner";
  const firstName = exactFullName.trim().split(" ")[0];

  const loadData = async () => {
    try {
      setIsLoading(true);
      setActionError(null);

      // Load local practice solved state
      if (typeof window !== "undefined") {
        try {
          const storedSolved = localStorage.getItem("raizo_practice_solved");
          if (storedSolved) setPracticeSolved(JSON.parse(storedSolved));
        } catch {
          // ignore
        }
      }

      // Concurrently fetch all genuine application progress
      const [eligRes, roadmapRes, evidenceRes, certListRes] = await Promise.all([
        api.checkCertificateEligibility().catch(() => null),
        api.getRoadmap().catch(() => null),
        api.getEvidence().catch(() => ({ evidence: [] })),
        api.getCertificates().catch(() => ({ certificates: [] }))
      ]);

      if (eligRes) setBackendEligibility(eligRes);
      if (roadmapRes) setRoadmap(roadmapRes);
      if (evidenceRes?.evidence) setEvidenceList(evidenceRes.evidence);

      if (eligRes?.existing_certificate) {
        setCertificate(eligRes.existing_certificate);
      } else if (certListRes?.certificates && certListRes.certificates.length > 0) {
        setCertificate(certListRes.certificates[0]);
      }
    } catch (err: any) {
      console.error("Failed to load certificate eligibility:", err);
      setActionError(err?.message || "Failed to load eligibility status.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Centralized single source of truth calculation (Section 7 requirement)
  const eligibilityResult: CertificateEligibilityResult = getCertificateEligibility({
    roadmap,
    practiceSolved,
    evidenceList,
    backendEligibility,
    existingCertificate: certificate
  });

  const handleClaimCertificate = async () => {
    try {
      setIsClaiming(true);
      setActionError(null);
      const res = await api.generateCertificate({
        recipient_name: exactFullName,
        track_title: "Data Analytics Foundations"
      });
      if (res && res.certificate) {
        setCertificate(res.certificate);
        const refreshed = await api.checkCertificateEligibility().catch(() => null);
        if (refreshed) setBackendEligibility(refreshed);
      }
    } catch (err: any) {
      console.error("Certificate claim error:", err);
      setActionError(err?.message || "Failed to claim certificate.");
    } finally {
      setIsClaiming(false);
    }
  };

  const certId = certificate?.certificate_id || "RAIZO-2026-DA-PREVIEW";
  const verifiedScore = certificate?.final_score || eligibilityResult.assessmentScore || 84;
  const verifiedSkills = ["SQL Analytics", "Python & Pandas", "Descriptive Statistics", "Data Visualization"];

  const copyVerificationLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://raizo.ai";
    const link = `${origin}/certificate/${certId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const copyHash = () => {
    const hash = certificate?.verification_hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="h-9 w-9 border-2 border-[#5B8DEF] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#B4BDC8]">Evaluating certification eligibility ledger...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* 1. STATE HEADER */}
      {eligibilityResult.eligible ? (
        // STATE B: ELIGIBLE
        <div className="raizo-page-header">
          <div className="raizo-page-eyebrow">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>OFFICIAL CREDENTIAL EARNED</span>
            <span>•</span>
            <span>CRYPTOGRAPHICALLY VERIFIED</span>
          </div>
          <h1 className="raizo-page-title text-3xl sm:text-4xl font-extrabold text-[#F5F7FA]">
            Congratulations, {firstName}!
          </h1>
          <p className="raizo-page-desc">
            You have earned your RAIZO Verified Credential. All certification requirements have been satisfied.
          </p>
        </div>
      ) : (
        // STATE A: NOT ELIGIBLE
        <div className="raizo-page-header">
          <div className="raizo-page-eyebrow text-[#F59E0B]">
            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
            <span>CERTIFICATE PREVIEW</span>
            <span>•</span>
            <span>REQUIREMENTS IN PROGRESS</span>
          </div>
          <h1 className="raizo-page-title text-3xl sm:text-4xl font-extrabold text-[#F5F7FA]">
            Certificate Preview
          </h1>
          <p className="raizo-page-desc text-[#F59E0B] font-medium">
            You&apos;re not eligible for your certificate yet.
          </p>
          <p className="text-xs sm:text-sm text-[#B4BDC8] max-w-2xl mt-1">
            Complete the required learning modules, practice activities, and pass the final diagnostic assessment to unlock your official verifiable credential.
          </p>
        </div>
      )}

      {/* 2. CERTIFICATE PROGRESS SECTION (Section 6 requirement) */}
      <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-7 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27303B] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7E8996]">
              COMPLETION AUDIT
            </span>
            <h2 className="text-lg font-bold text-[#F5F7FA]">
              Certificate Progress
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-[#B4BDC8]">Overall Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide border ${
                eligibilityResult.eligible
                  ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
                  : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
              }`}
            >
              {eligibilityResult.overallStatus}
            </span>
          </div>
        </div>

        {/* Live Requirements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {eligibilityResult.requirements.map((req) => (
            <div
              key={req.key}
              className={`rounded-xl border p-4 space-y-2 text-xs transition-colors ${
                req.completed
                  ? "bg-[#11161D] border-[#10B981]/30"
                  : "bg-[#11161D]/70 border-[#27303B]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#B4BDC8] block truncate">
                  {req.label}
                </span>
                {req.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border border-[#7E8996] shrink-0" />
                )}
              </div>

              <div className="space-y-1">
                <strong
                  className={`text-sm font-bold block ${
                    req.completed ? "text-[#10B981]" : "text-[#F5F7FA]"
                  }`}
                >
                  {req.completed ? "✓ Completed" : req.statusText}
                </strong>
                <p className="text-[11px] text-[#7E8996] leading-snug line-clamp-2">
                  {req.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Missing Requirements Guidance when Incomplete */}
        {!eligibilityResult.eligible && eligibilityResult.missingRequirements.length > 0 && (
          <div className="pt-3 border-t border-[#27303B] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1 text-[#B4BDC8]">
              <span className="font-bold text-[#F5F7FA] block">Pending Requirements to Unlock:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#A7B0BC]">
                {eligibilityResult.missingRequirements.map((mr, idx) => (
                  <li key={idx}>{mr}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/learn"
                className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-[#11161D] border border-[#27303B] text-xs font-semibold text-[#F5F7FA] hover:bg-[#1A212B]"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#5B8DEF]" />
                <span>Modules</span>
              </Link>
              <Link
                href="/practice"
                className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-[#11161D] border border-[#27303B] text-xs font-semibold text-[#F5F7FA] hover:bg-[#1A212B]"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#5B8DEF]" />
                <span>Practice</span>
              </Link>
              <Link
                href="/assessment"
                className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold hover:bg-[#4779D8]"
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>Assessment</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 3. CERTIFICATE DISPLAY CONTAINER */}
      <div className="rounded-3xl border border-[#27303B] bg-[#151B23] p-6 sm:p-10 space-y-8 shadow-sm relative overflow-hidden">
        {/* Certificate Card Frame */}
        <div className="rounded-2xl border-2 border-[#27303B] p-6 sm:p-10 space-y-6 bg-gradient-to-b from-[#11161D] to-[#0D1117] relative overflow-hidden">
          {/* DEMO WATERMARK OVERLAY (When NOT eligible - Section 5 requirement) */}
          {!eligibilityResult.eligible && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-20">
              {/* Semi-transparent protective backdrop */}
              <div className="absolute inset-0 bg-[#070A0F]/55 backdrop-blur-[1px]" />

              {/* Bold diagonal watermark ribbon */}
              <div className="relative -rotate-12 bg-[#EF4444]/90 text-white text-base sm:text-2xl font-black tracking-widest px-8 py-3 rounded-xl border-2 border-white/30 shadow-2xl uppercase text-center max-w-[90%]">
                DEMO CERTIFICATE — NOT EARNED
              </div>
              <p className="relative mt-3 text-xs sm:text-sm font-semibold text-white/90 bg-black/60 px-4 py-1.5 rounded-full border border-white/20">
                Preview Demonstration • Official Credential Locked
              </p>
            </div>
          )}

          {/* Top Bar with Credential Title & Status */}
          <div className="flex items-center justify-between border-b border-[#27303B] pb-4 relative z-10">
            <div className="flex items-center space-x-3">
              <RaizoMark size={32} />
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-[#5B8DEF] uppercase block">
                  RAIZO VERIFIED CREDENTIAL
                </span>
                <span className="text-base sm:text-lg font-extrabold text-[#F5F7FA]">
                  Data Analytics Foundations
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {eligibilityResult.eligible ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Status: QUALIFIED
                </span>
              ) : (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  DEMO PREVIEW • NOT EARNED
                </span>
              )}
            </div>
          </div>

          {/* Recipient Section (Exact user full name - Section 4 requirement) */}
          <div className="space-y-2 text-center py-6 relative z-10">
            <span className="text-xs uppercase tracking-widest text-[#7E8996] block">
              Presented to
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F7FA] tracking-tight">
              {exactFullName}
            </h2>
            <p className="text-xs sm:text-sm text-[#B4BDC8] max-w-lg mx-auto leading-relaxed pt-1 font-serif italic">
              has satisfied all prerequisite competency benchmarks and proven practical capability in the{" "}
              <strong className="text-[#F5F7FA] font-sans font-bold">Data Analytics Foundations</strong> track.
            </p>
          </div>

          {/* Verified Skills List */}
          <div className="border-t border-b border-[#27303B] py-4 space-y-2 text-center relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8996] block">
              Verified Skills Included
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {verifiedSkills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#11161D] border border-[#27303B] text-[#F5F7FA]"
                >
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#B4BDC8] pt-2 relative z-10">
            <div>
              <span className="text-[10px] font-semibold text-[#7E8996] block uppercase">Certificate ID</span>
              <strong className="font-mono text-[#F5F7FA] text-[11px] block mt-0.5">
                {eligibilityResult.eligible ? certId : "DEMO-NOT-EARNED"}
              </strong>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-[#7E8996] block uppercase">Issued Date</span>
              <strong className="text-[#F5F7FA] text-[11px] block mt-0.5">
                {certificate?.issued_at
                  ? new Date(certificate.issued_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                  : "September 2026"}
              </strong>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-[#7E8996] block uppercase">Verified Score</span>
              <strong className="font-mono text-[#5B8DEF] text-[11px] block mt-0.5">
                {eligibilityResult.eligible ? `${verifiedScore}% Qualified` : `${eligibilityResult.assessmentScore}% / 70% Required`}
              </strong>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-[#7E8996] block uppercase">Application Creator</span>
              <div className="mt-1 flex flex-col items-start gap-1">
                <img
                  src="/signatures/badal_kumar_sahu.png"
                  alt="Badal Kumar Sahu"
                  className="h-7 w-auto object-contain"
                />
                <div className="border-t border-[#17211F]/15 pt-0.5 w-full">
                  <span className="text-[11px] font-bold text-[#F5F7FA] block leading-tight">Badal Kumar Sahu</span>
                  <span className="text-[9px] text-[#5B8DEF] font-semibold block">Creator & Lead Architect</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Actions Bar */}
        {eligibilityResult.eligible ? (
          // STATE B ACTIONS: Claim, Download, Verification URL
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/certificate/${certId}`}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-[#27303B] bg-[#11161D] hover:bg-[#1A212B] text-xs font-bold text-[#F5F7FA] transition-all"
              >
                <span>View Credential Page</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>

              <button
                onClick={copyVerificationLink}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-[#27303B] bg-[#151B23] text-xs font-semibold text-[#F5F7FA] hover:bg-[#1A212B] transition-colors"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-[#36C98F]" /> : <Copy className="h-3.5 w-3.5 text-[#B4BDC8]" />}
                <span>{copiedLink ? "Link Copied" : "Copy Verification URL"}</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={`${API_BASE}/certificate/${certId}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold shadow-sm hover:bg-[#4779D8] transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        ) : (
          // STATE A ACTIONS: Explain demo state, offer roadmap / practice links
          <div className="p-4 rounded-2xl bg-[#11161D] border border-[#27303B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5 text-[#B4BDC8]">
              <Lock className="h-4 w-4 text-[#F59E0B] shrink-0" />
              <span>Official vector PDF and cryptographic signatures unlock upon meeting all criteria.</span>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#5B8DEF] hover:underline"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Technical Cryptographic Verification Accordion */}
        {eligibilityResult.eligible && (
          <div className="pt-4 border-t border-[#27303B]">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="text-xs font-semibold text-[#B4BDC8] hover:text-[#F5F7FA] inline-flex items-center space-x-1.5 transition-colors"
            >
              {showTechnicalDetails ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span>Technical Verification (Expand to view cryptographic details)</span>
            </button>

            {showTechnicalDetails && (
              <div className="mt-4 p-5 rounded-2xl bg-[#11161D] border border-[#27303B] space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#B4BDC8] block text-[11px]">Cryptographic Signature:</span>
                    <span className="font-semibold text-[#F5F7FA]">HMAC-SHA256 Tamper-Evident</span>
                  </div>
                  <div>
                    <span className="text-[#B4BDC8] block text-[11px]">Evaluation Method:</span>
                    <span className="font-semibold text-[#F5F7FA]">Objective assessment & rubric evaluation</span>
                  </div>
                  <div>
                    <span className="text-[#B4BDC8] block text-[11px]">Audit Status:</span>
                    <span className="font-semibold text-[#36C98F]">Permanently Recorded</span>
                  </div>
                  <div>
                    <span className="text-[#B4BDC8] block text-[11px]">Verification URL:</span>
                    <span className="font-mono text-[#5B8DEF] truncate block">https://raizo.ai/certificate/{certId}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#27303B]">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[#B4BDC8] text-[11px]">Verification Hash:</span>
                    <button
                      onClick={copyHash}
                      className="text-[11px] font-bold text-[#5B8DEF] hover:underline"
                    >
                      {copiedHash ? "Hash Copied" : "Copy Hash"}
                    </button>
                  </div>
                  <code className="text-[10px] font-mono text-[#B4BDC8] block break-all bg-[#151B23] p-2.5 rounded-lg border border-[#27303B]">
                    {certificate?.verification_hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                  </code>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
