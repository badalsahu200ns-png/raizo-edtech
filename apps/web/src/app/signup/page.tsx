"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Brain,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserCheck,
  Compass,
  Layers,
  GraduationCap
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import RaizoLogo from "@/components/RaizoLogo";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [targetRole, setTargetRole] = useState("data_analyst");

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load Google Identity Services script if client ID is set
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response.credential) {
              await handleCredentialSignup(response.credential);
            }
          }
        });

        const btnContainer = document.getElementById("google-signup-btn-container");
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "signup_with",
            shape: "rectangular",
            logo_alignment: "left"
          });
        }
      }
    };
    document.body.appendChild(script);

    return () => {
      try {
        document.body.removeChild(script);
      } catch {
        // ignore
      }
    };
  }, []);

  const handleCredentialSignup = async (credential: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginWithGoogle(credential);
      // If newly registered user, route to onboarding or dashboard
      if (res && res.is_new_user) {
        router.push("/onboarding");
      } else {
        router.push(redirectPath);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInstantNewUserSignup = async () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const demoNewEmail = `new.learner.${randomId}@example.com`;
    const demoNewName = `Jane Learner ${randomId}`;
    await handleCredentialSignup(`test_google:${demoNewEmail}:${demoNewName}::`);
  };

  const handleFormSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      setError("Please provide both your name and Google email address.");
      return;
    }
    await handleCredentialSignup(`test_google:${email.trim()}:${name.trim()}::`);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex justify-center">
          <RaizoLogo size={34} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
          Create your RAIZO account
        </h1>
        <p className="text-xs sm:text-sm text-[#B4BDC8]">
          Sign up with Google to begin your adaptive learning journey and turn skills into verified career progress.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#151B23] py-8 px-6 shadow-sm border border-[#27303B] rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="rounded-xl bg-[#E86A6A]/10 p-3.5 border border-[#E86A6A]/30 flex items-start gap-2.5 text-xs text-[#E86A6A]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Official Google GIS Button Container */}
          <div id="google-signup-btn-container" className="min-h-[44px] flex justify-center" />

          {/* 1-Click Fast New Learner Registration */}
          <div>
            <button
              onClick={handleInstantNewUserSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#202832] bg-[#151B23] hover:bg-[#11161D] hover:border-[#5B8DEF] text-xs sm:text-sm font-bold text-[#F5F7FA] shadow-xs transition-all disabled:opacity-60 group"
            >
              {/* Google G SVG */}
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
              <span>{loading ? "Creating account..." : "Sign Up with Google (1-Click)"}</span>
              <Sparkles className="h-3.5 w-3.5 text-[#5B8DEF] ml-auto" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#27303B]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#151B23] px-2 text-[#7E8996] font-medium">
                Or enter your Google profile details
              </span>
            </div>
          </div>

          {/* New User Google Registration Form */}
          <form onSubmit={handleFormSignup} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#B4BDC8] mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full rounded-xl border border-[#27303B] bg-[#11161D] px-3.5 py-2 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#B4BDC8] mb-1">
                Google Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane.doe@gmail.com"
                className="w-full rounded-xl border border-[#27303B] bg-[#11161D] px-3.5 py-2 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#B4BDC8] mb-1">
                Initial Career Track
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded-xl border border-[#27303B] bg-[#11161D] px-3.5 py-2 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
              >
                <option value="data_analyst">Data Analyst Track</option>
                <option value="business_intelligence">Business Intelligence Analyst</option>
                <option value="analytics_engineer">Analytics Engineer</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#5B8DEF] text-white text-xs sm:text-sm font-bold hover:bg-[#4779D8] transition-all disabled:opacity-60 shadow-sm"
            >
              <span>{loading ? "Registering Account..." : "Create Account with Google"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Value Props Pills */}
          <div className="space-y-2 pt-2 border-t border-[#27303B] text-xs text-[#B4BDC8]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#36C98F] shrink-0" />
              <span>Personalized skill gap diagnosis & DAG roadmap</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#36C98F] shrink-0" />
              <span>Verifiable credentials backed by cryptographic ledger</span>
            </div>
          </div>

          {/* Switch to Login */}
          <div className="text-center pt-2 text-xs text-[#B4BDC8]">
            Already have a RAIZO account?{" "}
            <Link
              href="/login"
              className="font-bold text-[#5B8DEF] hover:text-[#4779D8] underline decoration-[#176B5B]/30 transition-colors"
            >
              Sign in with Google ?
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
          <Brain className="h-10 w-10 text-[#5B8DEF] animate-pulse" />
          <p className="text-xs text-[#B4BDC8]">Loading Sign Up...</p>
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
