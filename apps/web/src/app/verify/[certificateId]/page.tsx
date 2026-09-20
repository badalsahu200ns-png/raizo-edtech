"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Hash,
  Download,
  Search,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { api, API_BASE } from "@/lib/api";
import { Certificate } from "@/lib/types";
import { RaizoMark } from "@/components/RaizoLogo";

export default function VerifyCertificatePage() {
  const params = useParams();
  const router = useRouter();
  const certificateId = (params?.certificateId as string) || "";

  const [certData, setCertData] = useState<Certificate | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    async function verify() {
      if (!certificateId) {
        setIsLoading(false);
        setIsValid(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);
        const res = await api.verifyCertificate(certificateId);
        if (res && res.valid && res.certificate) {
          setCertData(res.certificate);
          setIsValid(true);
        } else {
          setIsValid(false);
          setErrorMessage(res?.error || "Certificate was not found in the RAIZO verification ledger.");
        }
      } catch (err: any) {
        console.error("Verification query failed:", err);
        setIsValid(false);
        setErrorMessage("Unable to verify credential against the security ledger.");
      } finally {
        setIsLoading(false);
      }
    }

    verify();
  }, [certificateId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      router.push(`/verify/${encodeURIComponent(searchId.trim())}`);
    }
  };

  const copyHash = () => {
    if (!certData) return;
    navigator.clipboard.writeText(certData.verification_hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 max-w-3xl mx-auto space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center space-x-2 text-[#F5F7FA] group">
          <RaizoMark size={32} />
          <span className="text-xl font-extrabold tracking-tight">RAIZOAGENTIC Verification Ledger</span>
        </Link>
        <p className="text-xs text-[#B4BDC8]">
          Public zero-leakage verification portal for verified completion credentials.
        </p>
      </div>

      {/* Verification Result Card */}
      {isLoading ? (
        <div className="w-full rounded-2xl border border-[#27303B] bg-[#151B23] p-12 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5B8DEF]/10 text-[#5B8DEF] animate-pulse">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-[#F5F7FA]">Verifying Cryptographic Ledger...</h3>
          <p className="text-xs text-[#B4BDC8]">Querying immutable HMAC-SHA256 signature records</p>
        </div>
      ) : isValid && certData ? (
        <div className="w-full rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27303B] pb-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-[#5B8DEF]/10 text-[#36C98F] flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-extrabold text-[#F5F7FA]">Valid Credential</h2>
                  <span className="rounded px-2 py-0.5 text-[11px] font-bold bg-[#5B8DEF]/10 text-[#36C98F]">
                    ✓ Authentic & Active
                  </span>
                </div>
                <span className="text-xs font-mono text-[#B4BDC8]">ID: {certData.certificate_id}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={`${API_BASE}/certificate/${certData.certificate_id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center space-x-1.5 rounded-xl bg-[#5B8DEF] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#4779D8] transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>

          {/* Credential Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-[#27303B] bg-[#11161D] p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#B4BDC8] tracking-wider">
                Recipient Name
              </span>
              <p className="text-base font-bold text-[#F5F7FA]">{certData.recipient_name}</p>
              <p className="text-[11px] text-[#36C98F] font-medium">✓ Verified Identity via Google OAuth</p>
            </div>

            <div className="rounded-xl border border-[#27303B] bg-[#11161D] p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#B4BDC8] tracking-wider">
                Competency Track
              </span>
              <p className="text-base font-bold text-[#5B8DEF]">{certData.track_title}</p>
              <p className="text-[11px] text-[#B4BDC8]">Adaptive AI Prerequisite Pathway</p>
            </div>

            <div className="rounded-xl border border-[#27303B] bg-[#11161D] p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#B4BDC8] tracking-wider">
                Issue Date
              </span>
              <p className="text-sm font-semibold text-[#F5F7FA]">
                {certData.issued_at ? certData.issued_at.slice(0, 10) : "September 2026"}
              </p>
              <p className="text-[11px] text-[#B4BDC8]">Timestamped in SQLite Evidence Ledger</p>
            </div>

            <div className="rounded-xl border border-[#27303B] bg-[#11161D] p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#B4BDC8] tracking-wider">
                Final Evaluated Score
              </span>
              <p className="text-sm font-bold text-[#F5F7FA]">{certData.final_score}% Demonstrated Mastery</p>
              <p className="text-[11px] text-[#B4BDC8]">Deterministic Rubric Passing Threshold ≥ 70%</p>
            </div>
          </div>

          {/* Issuing Authority & Application Creator */}
          <div className="rounded-xl border border-[#27303B] bg-[#11161D] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#B4BDC8] tracking-wider block">
                Application Creator
              </span>
              <p className="text-sm font-bold text-[#F5F7FA]">Badal Kumar Sahu</p>
              <p className="text-[11px] text-[#5B8DEF] font-medium">Creator & Lead AI Architect • RAIZO Learning Platform</p>
            </div>
            <div className="flex items-center gap-2">
              <img
                src="/signatures/badal_kumar_sahu.png"
                alt="Badal kumar Sahu"
                className="h-8 w-auto object-contain"
              />
            </div>
          </div>

          {/* Cryptographic Proof Hash */}
          <div className="rounded-xl border border-[#27303B] bg-[#11161D] p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-[#B4BDC8] tracking-wider">
                Cryptographic HMAC-SHA256 Signature
              </span>
              <button
                onClick={copyHash}
                className="text-[11px] font-semibold text-[#5B8DEF] hover:underline flex items-center gap-1"
              >
                {copiedHash ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedHash ? "Copied" : "Copy Hash"}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-[#151B23] border border-[#27303B] font-mono text-[11px] text-[#F5F7FA] break-all">
              {certData.verification_hash}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-2xl border border-[#B84A4A]/30 bg-[#151B23] p-8 text-center space-y-4 shadow-sm">
          <AlertTriangle className="h-8 w-8 text-[#E86A6A] mx-auto" />
          <h3 className="text-lg font-bold text-[#F5F7FA]">Certificate Not Verified</h3>
          <p className="text-xs text-[#B4BDC8]">{errorMessage || "Invalid certificate ID."}</p>
        </div>
      )}

      {/* Manual Search Form */}
      <div className="w-full rounded-2xl border border-[#27303B] bg-[#151B23] p-5 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by Certificate ID (e.g. RAIZO-CERT-2026-9941)..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="flex-1 rounded-xl border border-[#27303B] bg-[#11161D] px-3.5 py-2 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#17211F] text-white text-xs font-bold hover:bg-[#2B3B38] transition-colors"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
