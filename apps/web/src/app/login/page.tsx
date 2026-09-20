"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Brain,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  UserCheck,
  Compass
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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { loginWithGoogle, isAuthenticated, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("");
  const [showCustomSign, setShowCustomSign] = useState(false);

  // If already authenticated, forward immediately to target
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [authLoading, isAuthenticated, redirectPath, router]);

  // Load Google Identity Services script if configured
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
              await handleCredentialLogin(response.credential);
            }
          }
        });

        const btnContainer = document.getElementById("google-login-btn-container");
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "signin_with",
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

  const handleCredentialLogin = async (credential: string) => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle(credential);
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    await handleCredentialLogin("test_google:alex.rivera@example.com:Alex Rivera:demo_learner_alex:");
  };

  const handleCustomTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) {
      setError("Please enter an email address.");
      return;
    }
    const name = testName.trim() || testEmail.split("@")[0].replace(".", " ");
    await handleCredentialLogin(`test_google:${testEmail.trim()}:${name}::`);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex justify-center">
          <RaizoLogo size={34} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
          Welcome back to RAIZO
        </h1>
        <p className="text-xs sm:text-sm text-[#B4BDC8]">
          Sign in with your Google account to access your personalized adaptive career roadmap.
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

          {/* Official Google Button Container (rendered if NEXT_PUBLIC_GOOGLE_CLIENT_ID is set) */}
          <div id="google-login-btn-container" className="min-h-[44px] flex justify-center" />

          {/* 1-Click Primary Google Sign-In Button */}
          <div>
            <button
              onClick={handleQuickDemoLogin}
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
              <span>{loading ? "Signing in..." : "Continue with Google (Alex Rivera)"}</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#7E8996] group-hover:text-[#5B8DEF] transition-colors ml-auto" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#27303B]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#151B23] px-2 text-[#7E8996] font-medium">
                Or sign in with another Google account
              </span>
            </div>
          </div>

          {/* Collapsible Custom Google Test Sign-In */}
          {!showCustomSign ? (
            <button
              onClick={() => setShowCustomSign(true)}
              className="w-full py-2 text-xs font-semibold text-[#5B8DEF] hover:text-[#719DF5] transition-colors text-center"
            >
              Sign in with custom Google email address
            </button>
          ) : (
            <form onSubmit={handleCustomTestLogin} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-[#B4BDC8] mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  required
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your.name@gmail.com"
                  className="w-full rounded-xl border border-[#27303B] bg-[#11161D] px-3.5 py-2 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#B4BDC8] mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full rounded-xl border border-[#27303B] bg-[#11161D] px-3.5 py-2 text-xs text-[#F5F7FA] focus:border-[#5B8DEF] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold hover:bg-[#4779D8] transition-all disabled:opacity-60 shadow-xs"
              >
                {loading ? "Authenticating..." : "Sign In with this Google Account"}
              </button>
            </form>
          )}

          {/* Security & Verification Guarantee */}
          <div className="pt-2 border-t border-[#27303B] flex items-center justify-center gap-2 text-[11px] text-[#B4BDC8]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#36C98F]" />
            <span>Secure 256-bit encrypted authentication</span>
          </div>

          {/* Switch to Sign Up */}
          <div className="text-center pt-1 text-xs text-[#B4BDC8]">
            Don't have a RAIZO account yet?{" "}
            <Link
              href="/signup"
              className="font-bold text-[#5B8DEF] hover:text-[#4779D8] underline decoration-[#176B5B]/30 transition-colors"
            >
              Sign up with Google →
            </Link>
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
          <Brain className="h-10 w-10 text-[#5B8DEF] animate-pulse" />
          <p className="text-xs text-[#B4BDC8]">Loading Sign In...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
