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
  Terminal,
  Award,
  BookOpen
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

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { loginWithGoogle, isAuthenticated, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local development flag: only true on localhost development environments
  const isLocalDev =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_ENABLE_LOCAL_DEMO === "true");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [authLoading, isAuthenticated, redirectPath, router]);

  // Load Google Identity Services script
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
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
  }, []);

  const initializeGoogleGSI = (clientId?: string) => {
    if (!window.google?.accounts?.id || !clientId) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        if (response.credential) {
          await handleCredentialSignup(response.credential);
        }
      }
    });

    const btnContainer = document.getElementById("google-signup-official-btn");
    if (btnContainer) {
      window.google.accounts.id.renderButton(btnContainer, {
        theme: "filled_blue",
        size: "large",
        width: "100%",
        text: "signup_with",
        shape: "rectangular",
        logo_alignment: "left"
      });
    }
  };

  const handleCredentialSignup = async (credential: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginWithGoogle(credential);
      if (res && res.is_new_user) {
        router.push("/onboarding");
      } else {
        router.push(redirectPath);
      }
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to register with Google. Please ensure you are using a verified Google account."
      );
    } finally {
      setLoading(false);
    }
  };

  // Localhost-only developer registration testing
  const handleLocalDevSignup = async () => {
    if (!isLocalDev) {
      setError("Dummy account creation is disabled in production.");
      return;
    }
    const rand = Math.floor(1000 + Math.random() * 9000);
    await handleCredentialSignup(
      `test_google:dev.learner.${rand}@example.com:Dev Learner ${rand}::`
    );
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden edtech-mesh-gradient">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        <div className="inline-flex justify-center">
          <RaizoEducationIcon size={64} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#F5F7FA] tracking-tight">
          Join the RAIZO Platform
        </h1>
        <p className="text-xs sm:text-sm text-[#A7B0BC] max-w-sm mx-auto">
          Start your personalized career intelligence journey. Verify genuine analytical skills with cryptographic proof.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="raizo-3d-glass py-8 px-6 border border-[#2A3649] rounded-3xl sm:px-10 space-y-6 raizo-3d-glow-azure">
          {error && (
            <div className="rounded-xl bg-[#EF4444]/10 p-3.5 border border-[#EF4444]/30 flex items-start gap-2.5 text-xs text-[#EF4444]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Official GIS Button Container */}
          <div id="google-signup-official-btn" className="min-h-[44px] flex justify-center w-full" />

          {/* Google Sign-Up Primary Action */}
          <div>
            <button
              onClick={() => {
                if (window.google?.accounts?.id) {
                  window.google.accounts.id.prompt();
                } else {
                  setError("Google Identity Services is initializing. Please try again in a moment.");
                }
              }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-[#2C384A] bg-[#11161D] hover:bg-[#161D26] hover:border-[#0EA5E9] text-xs sm:text-sm font-bold text-[#F5F7FA] shadow-md transition-all disabled:opacity-60 group cursor-pointer"
            >
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
              <span>{loading ? "Creating verified account..." : "Sign Up with Google"}</span>
              <Sparkles className="h-4 w-4 text-[#38BDF8] ml-auto" />
            </button>
          </div>

          {/* Value Props Pills */}
          <div className="space-y-2.5 pt-2 border-t border-[#222A36] text-xs text-[#A7B0BC]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
              <span>Verified Google account required for production authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
              <span>Personalized skill gap diagnosis & DAG curriculum</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
              <span>Tamper-evident HMAC-SHA256 verified credentials</span>
            </div>
          </div>

          {/* Localhost Sandbox Shortcut */}
          {isLocalDev && (
            <div className="pt-3 border-t border-dashed border-[#F59E0B]/30 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#F59E0B]">
                <div className="flex items-center gap-1">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Localhost Testing Only</span>
                </div>
                <span className="font-mono bg-[#F59E0B]/10 px-1.5 py-0.5 rounded">DEV</span>
              </div>
              <button
                type="button"
                onClick={handleLocalDevSignup}
                disabled={loading}
                className="w-full py-2 px-3 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold transition-all disabled:opacity-60 cursor-pointer"
              >
                Create Random Localhost Dev Learner
              </button>
            </div>
          )}

          {/* Switch to Login */}
          <div className="text-center pt-2 text-xs text-[#A7B0BC]">
            Already have a RAIZO account?{" "}
            <Link
              href="/login"
              className="font-bold text-[#38BDF8] hover:text-[#0EA5E9] underline decoration-[#38BDF8]/30 transition-colors"
            >
              Sign in with Google →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-10 w-10 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#A7B0BC]">Loading Sign Up...</p>
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
