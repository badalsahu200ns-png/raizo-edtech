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
  Lock
} from "lucide-react";
import { api, API_BASE } from "@/lib/api";
import { Certificate, CertificateEligibility } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { RaizoMark } from "@/components/RaizoLogo";

export default function CertificatePage() {
  const { user } = useAuth();
  const [eligibility, setEligibility] = useState<CertificateEligibility | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setActionError(null);
      const elig = await api.checkCertificateEligibility();
      setEligibility(elig);

      if (elig.existing_certificate) {
        setCertificate(elig.existing_certificate);
      } else {
        const certList = await api.getCertificates().catch(() => ({ certificates: [] }));
        if (certList.certificates && certList.certificates.length > 0) {
          setCertificate(certList.certificates[0]);
        }
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

  const handleClaimCertificate = async () => {
    try {
      setIsClaiming(true);
      setActionError(null);
      const res = await api.generateCertificate({
        recipient_name: user?.name || "Alex Rivera",
        track_title: "Data Analytics Foundations"
      });
      if (res && res.certificate) {
        setCertificate(res.certificate);
        const elig = await api.checkCertificateEligibility().catch(() => null);
        if (elig) setEligibility(elig);
      }
    } catch (err: any) {
      console.error("Certificate claim error:", err);
      setActionError(err?.message || "Failed to claim certificate.");
    } finally {
      setIsClaiming(false);
    }
  };

  const certId = certificate?.certificate_id || "RAIZO-CERT-2026-9941";
  const recipientName = certificate?.recipient_name || user?.name || "Alex Rivera";
  const score = certificate?.final_score || 84;
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

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6">
      {/* Header - Answers: "What official credential have I earned?" */}
      <div className="border-b border-[#27303B] pb-6 space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5B8DEF]">
          OFFICIAL CREDENTIALS
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
          Verified Certificates
        </h1>
        <p className="text-sm text-[#B4BDC8] max-w-2xl leading-relaxed">
          Credentials earned through demonstrated learning and verified assessment.
        </p>
      </div>

      {/* Main Certificate Display Card */}
      <div className="rounded-3xl border border-[#27303B] bg-[#151B23] p-6 sm:p-10 space-y-8 shadow-sm relative overflow-hidden">
        {/* Visual Certificate Frame */}
        <div className="rounded-2xl border-2 border-[#17211F]/10 p-6 sm:p-10 space-y-6 bg-gradient-to-b from-[#FCFCFA] to-white relative">
          <div className="flex items-center justify-between border-b border-[#27303B] pb-4">
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
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#5B8DEF]/10 text-[#36C98F] border border-[#2F7D5C]/30 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified Certificate
              </span>
            </div>
          </div>

          <div className="space-y-2 text-center py-6">
            <span className="text-xs uppercase tracking-widest text-[#7E8996] block">
              This is to certify that
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F7FA] tracking-tight">
              {recipientName}
            </h2>
            <p className="text-xs sm:text-sm text-[#B4BDC8] max-w-lg mx-auto leading-relaxed pt-1 font-serif italic">
              has satisfied all prerequisite competency benchmarks and proven practical capability in the{" "}
              <strong className="text-[#F5F7FA] font-sans font-bold">Data Analytics Foundations</strong> track.
            </p>
          </div>

          {/* Verified Skills List */}
          <div className="border-t border-b border-[#27303B] py-4 space-y-2 text-center">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#B4BDC8] pt-2">
            <div>
              <span className="text-[10px] font-semibold text-[#7E8996] block uppercase">Certificate ID</span>
              <strong className="font-mono text-[#F5F7FA] text-[11px] block mt-0.5">
                {certId}
              </strong>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-[#7E8996] block uppercase">Issued Date</span>
              <strong className="text-[#F5F7FA] text-[11px] block mt-0.5">
                {certificate?.issued_at ? new Date(certificate.issued_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "September 2026"}
              </strong>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-[#7E8996] block uppercase">Verified Score</span>
              <strong className="font-mono text-[#5B8DEF] text-[11px] block mt-0.5">
                {score}% Qualified
              </strong>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-[#7E8996] block uppercase">Application creator</span>
              <div className="mt-1 flex flex-col items-start gap-1">
                <img
                  src="/signatures/badal_kumar_sahu.png"
                  alt="Badal kumar Sahu"
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

        {/* Certificate Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/certificate/${certId}`}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-[#27303B] bg-[#11161D] hover:bg-[#E9EBE8] text-xs font-bold text-[#F5F7FA] transition-all"
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

        {/* Section 16: Technical Verification Accordion */}
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
      </div>
    </div>
  );
}
