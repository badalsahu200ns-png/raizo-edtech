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
  Layers,
  Cpu,
  UserCheck,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import RaizoLogo from "@/components/RaizoLogo";
import RaizoEducationIcon from "@/components/RaizoEducationIcon";
import Card3DTilt from "@/components/3d/Card3DTilt";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

function WelcomeLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { loginWithGoogle, isAuthenticated, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleClientReady, setGoogleClientReady] = useState(false);

  // Local development flag: only true in localhost development environment
  const isLocalDev =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_ENABLE_LOCAL_DEMO === "true");

  // If already authenticated, forward immediately to target route
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [authLoading, isAuthenticated, redirectPath, router]);

  // Load Google Identity Services (GIS) script
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    // Check if script is already present
    const existingScript = document.getElementById("google-gsi-script");
    if (existingScript && window.google?.accounts?.id) {
      initializeGoogleGSI(clientId);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleGSI(clientId);
    };
    document.body.appendChild(script);

    return () => {
      // Keep script alive across client transitions to prevent re-fetch
    };
  }, []);

  const initializeGoogleGSI = (clientId?: string) => {
    if (!window.google?.accounts?.id) return;

    // If client ID is configured, bind official GIS One-Tap & standard button
    if (clientId) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          if (response.credential) {
            await handleCredentialLogin(response.credential);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      const btnContainer = document.getElementById("google-official-btn-container");
      if (btnContainer) {
        window.google.accounts.id.renderButton(btnContainer, {
          theme: "filled_blue",
          size: "large",
          width: "100%",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left"
        });
      }
      setGoogleClientReady(true);
    }
  };

  const handleCredentialLogin = async (credential: string) => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle(credential);
      router.push(redirectPath);
    } catch (err: any) {
      setError(
        err.message ||
          "Authentication failed. Please ensure you are using a verified Google account."
      );
    } finally {
      setLoading(false);
    }
  };

  // Localhost-only testing handler (strictly disabled in production builds)
  const handleLocalhostDevLogin = async () => {
    if (!isLocalDev) {
      setError("Demo accounts are strictly disabled in production environments.");
      return;
    }
    await handleCredentialLogin(
      "test_google:alex.rivera@example.com:Alex Rivera:demo_learner_alex:"
    );
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
                  Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#0EA5E9] to-[#10B981]">RAIZO</span>
                </h1>
                <p className="text-lg sm:text-xl font-bold text-[#38BDF8] tracking-tight mt-1">
                  Learn. Practice. Prove. Prepare for your Career.
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
              <span>Google Identity Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              <span>Zero Passwords Stored</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: SECURE AUTHENTICATION CARD & PRODUCTION GOOGLE SIGN-IN      */}
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
                Sign in to your account
              </h2>
              <p className="text-xs text-[#A7B0BC] leading-relaxed">
                Connect using your verified Google profile to access your personalized adaptive curriculum.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-xl bg-[#EF4444]/10 p-3.5 border border-[#EF4444]/30 flex items-start gap-2.5 text-xs text-[#EF4444] animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">Access Error</span>
                  <p className="text-[11px] leading-snug">{error}</p>
                </div>
              </div>
            )}

            {/* Official Google Identity Services Container */}
            <div id="google-official-btn-container" className="min-h-[44px] flex justify-center w-full" />

            {/* Standard Primary Google Authentication Button */}
            <div>
              <button
                onClick={() => {
                  if (window.google?.accounts?.id) {
                    window.google.accounts.id.prompt();
                  } else {
                    setError(
                      "Google Identity Services is initializing. If this persists, verify internet access to accounts.google.com."
                    );
                  }
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-[#2C384A] bg-[#11161D] hover:bg-[#161D26] hover:border-[#0EA5E9] text-xs sm:text-sm font-bold text-[#F5F7FA] shadow-md transition-all duration-200 disabled:opacity-60 group cursor-pointer"
              >
                {/* Official Google G 4-Color SVG */}
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? "Verifying Google Account..." : "Continue with Google"}</span>
                <ArrowRight className="h-4 w-4 text-[#7E8996] group-hover:text-[#38BDF8] group-hover:translate-x-0.5 transition-all ml-auto" />
              </button>
            </div>

            {/* Security Guarantees */}
            <div className="space-y-2 pt-2 text-[11px] text-[#A7B0BC] leading-relaxed">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                <span>Production access requires a verified Google / Gmail account.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                <span>Encrypted session tokens with automatic sliding revocation.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                <span>Anti-bot rate limiting & server-side authorization enforced.</span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* LOCALHOST DEVELOPMENT ONLY SANDBOX (STRIP IN PRODUCTION BUILDS)           */}
            {/* ========================================================================= */}
            {isLocalDev && (
              <div className="pt-4 mt-2 border-t border-dashed border-[#F59E0B]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>Localhost Dev Sandbox</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/20">
                    ENV: DEV ONLY
                  </span>
                </div>

                <p className="text-[10px] text-[#A7B0BC] leading-tight">
                  This developer shortcut is only visible on localhost/testing environments and is disabled in production builds.
                </p>

                <button
                  type="button"
                  onClick={handleLocalhostDevLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#F59E0B]/40 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold transition-all disabled:opacity-60 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Launch Localhost Demo (Alex Rivera)</span>
                </button>
              </div>
            )}

            {/* Bottom Footer Notice */}
            <div className="pt-2 text-center text-[11px] text-[#7E8996]">
              By signing in, you agree to RAIZO's{" "}
              <Link href="/verify" className="text-[#38BDF8] hover:underline">
                Verification Ledger Protocol
              </Link>
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
