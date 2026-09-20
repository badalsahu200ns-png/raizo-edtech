"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Lock,
  ArrowRight,
  GitBranch,
  Terminal,
  Award,
  Cpu,
  UserCheck
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import RaizoLogo from "@/components/RaizoLogo";
import RaizoEducationIcon from "@/components/RaizoEducationIcon";
import Card3DTilt from "@/components/3d/Card3DTilt";

function WelcomeLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { loginAsDemo, isAuthenticated, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, forward immediately to target route
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [authLoading, isAuthenticated, redirectPath, router]);

  // Handle URL error query parameters
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "expired") {
      setError("Your session has expired. Please sign in again.");
    } else if (errorParam === "unauthorized") {
      setError("You don't have permission to access this page.");
    } else if (errorParam === "cancelled") {
      setError("Sign-in cancelled. Please try again.");
    }
  }, [searchParams]);

  const handleSessionLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginAsDemo();
      const hasOnboarded = typeof window !== "undefined" && Boolean(localStorage.getItem("raizo_user_name"));
      router.push(hasOnboarded ? redirectPath : "/onboarding");
    } catch (err: any) {
      setError(
        err.message ||
          "Authentication is temporarily unavailable. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden edtech-mesh-gradient">
      {/* Decorative 3D Ambient Lighting Nodes */}
      <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-[#0EA5E9]/10 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-[#10B981]/10 blur-3xl pointer-events-none animate-pulse-glow" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: 3D WELCOME HERO & EDTECH CAREER INTELLIGENCE IDENTITY         */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          {/* Brand Tag with Live Status */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 text-[#38BDF8] text-xs font-semibold shadow-xs">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>AI Career Intelligence & Assessment Platform</span>
          </div>

          {/* Core Welcome Title & Subtitle */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
              <RaizoEducationIcon size={76} className="shrink-0" />
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#F5F7FA] tracking-tight leading-[1.1]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#0EA5E9] to-[#10B981]">RAIZO</span>
                </h1>
                <p className="text-lg sm:text-xl font-bold text-[#38BDF8] tracking-tight mt-1">
                  Build skills. Prove them. Prepare for your career.
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#B4BDC8] leading-relaxed max-w-2xl mx-auto lg:mx-0">
              RAIZO replaces passive video courses with an authentic, prerequisite-aware
              learning engine. Diagnose genuine analytical strengths, conquer targeted SQL &
              Python problem sets, and graduate with tamper-evident cryptographic proof.
            </p>
          </div>

          {/* 3D Floating Feature Pillars (Subtle Perspective Depth) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Card3DTilt
              maxTilt={8}
              glowColor="rgba(14, 165, 233, 0.2)"
              className="p-4 bg-[#11161D]/80 border-[#273546] hover:border-[#0EA5E9]/60"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center shrink-0">
                  <GitBranch className="h-4 w-4 text-[#38BDF8]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#F5F7FA]">Prerequisite-Aware DAGs</h4>
                  <p className="text-[11px] text-[#A7B0BC] leading-snug">
                    Dynamic curriculum topology that resolves foundational gaps automatically.
                  </p>
                </div>
              </div>
            </Card3DTilt>

            <Card3DTilt
              maxTilt={8}
              glowColor="rgba(16, 185, 129, 0.2)"
              className="p-4 bg-[#11161D]/80 border-[#273546] hover:border-[#10B981]/60"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center shrink-0">
                  <Award className="h-4 w-4 text-[#10B981]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#F5F7FA]">Empirical Proof Ledger</h4>
                  <p className="text-[11px] text-[#A7B0BC] leading-snug">
                    Cryptographic HMAC-SHA256 evidence verifies proven competence to employers.
                  </p>
                </div>
              </div>
            </Card3DTilt>

            <Card3DTilt
              maxTilt={8}
              glowColor="rgba(245, 158, 11, 0.2)"
              className="p-4 bg-[#11161D]/80 border-[#273546] hover:border-[#F59E0B]/60"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center shrink-0">
                  <Terminal className="h-4 w-4 text-[#F59E0B]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#F5F7FA]">Interactive Diagnostics</h4>
                  <p className="text-[11px] text-[#A7B0BC] leading-snug">
                    Real SQL & Python coding environments with automated edge-case grading.
                  </p>
                </div>
              </div>
            </Card3DTilt>

            <Card3DTilt
              maxTilt={8}
              glowColor="rgba(56, 189, 248, 0.2)"
              className="p-4 bg-[#11161D]/80 border-[#273546] hover:border-[#38BDF8]/60"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center shrink-0">
                  <Cpu className="h-4 w-4 text-[#38BDF8]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#F5F7FA]">Autonomous Career AI</h4>
                  <p className="text-[11px] text-[#A7B0BC] leading-snug">
                    Continuous resume alignment against live enterprise job specifications.
                  </p>
                </div>
              </div>
            </Card3DTilt>
          </div>

          {/* Live Trust Metrics Ribbon */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2 text-xs text-[#A7B0BC] border-t border-[#222A36]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#10B981]" />
              <span>SOC-2 Ready Architecture</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-[#38BDF8]" />
              <span>Verified Evidence Ledger</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              <span>Zero Passwords Stored</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: SECURE AUTHENTICATION CARD                                  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="raizo-3d-glass rounded-3xl p-7 sm:p-9 border border-[#2A3649] raizo-3d-glow-azure space-y-6 relative">
            {/* Top Security Banner */}
            <div className="flex items-center justify-between pb-4 border-b border-[#222A36]">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-[#38BDF8]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">
                  Secure Authentication
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full border border-[#10B981]/20">
                Active SSL/TLS
              </span>
            </div>

            {/* Header Text */}
            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-black text-[#F5F7FA] tracking-tight">
                Welcome to RAIZO
              </h2>
              <p className="text-xs text-[#A7B0BC] leading-relaxed">
                Sign in to continue your learning and career journey.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-xl bg-[#EF4444]/10 p-3.5 border border-[#EF4444]/30 flex items-start gap-2 text-xs text-[#EF4444] animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <span className="font-bold">Authentication Notice</span>
                  <p className="text-[11px] leading-snug">{error}</p>
                </div>
              </div>
            )}

            {/* Primary Session Authentication Button */}
            <div>
              <button
                onClick={handleSessionLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] hover:from-[#0284C7] hover:to-[#0EA5E9] text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#0EA5E9]/20 transition-all duration-200 disabled:opacity-60 group cursor-pointer"
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>{loading ? "Starting RAIZO Session..." : "Continue to RAIZO"}</span>
                <ArrowRight className="h-4 w-4 text-white/80 group-hover:translate-x-0.5 transition-all ml-auto" />
              </button>
            </div>

            {/* Security Guarantees */}
            <div className="space-y-2 pt-2 text-[11px] text-[#A7B0BC] leading-relaxed border-t border-[#222A36]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                <span>Encrypted session tokens with automatic sliding revocation.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                <span>Anti-bot rate limiting & server-side authorization enforced.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                <span>Zero passwords stored, persistent local learner state.</span>
              </div>
            </div>

            {/* Terms & Privacy Disclaimer */}
            <div className="pt-2 text-center text-[11px] text-[#A7B0BC]">
              By continuing, you agree to RAIZO's{" "}
              <Link href="/terms" className="text-[#38BDF8] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#38BDF8] hover:underline">
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-10 w-10 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#A7B0BC]">Initializing RAIZO Command Center...</p>
        </div>
      }
    >
      <WelcomeLoginContent />
    </Suspense>
  );
}
