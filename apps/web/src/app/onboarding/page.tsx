"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Award,
  AlertCircle,
  Sparkles,
  UserCheck
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import RaizoLogo, { RaizoMark } from "@/components/RaizoLogo";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, login, refreshUser, isAuthenticated } = useAuth();

  const [fullName, setFullName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);

  // Check if returning user already completed onboarding
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("raizo_user_name");
      const onboardingDone = localStorage.getItem("raizo_onboarding_completed");
      if ((savedName && onboardingDone) || (user && user.onboarding_completed && user.name && user.name !== "Alex Rivera")) {
        router.replace("/dashboard");
        return;
      }
    }
    setIsCheckingSession(false);
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Trim unnecessary spaces while preserving the exact entered name
    const trimmed = fullName.trim().replace(/\s+/g, " ");

    // 2. Strict validation: full name is required, no empty submission
    if (!trimmed) {
      setError("Please enter your full name to continue.");
      return;
    }

    if (trimmed.length < 2) {
      setError("Please enter a valid full name (at least 2 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      // Ensure an active session is established without creating duplicate auth systems
      if (!isAuthenticated) {
        await login();
      }

      // Update the user's profile on the backend using the existing model
      await api.updateProfile({
        name: trimmed,
        display_name: trimmed,
        onboarding_completed: true
      }).catch((err) => {
        console.warn("Backend profile sync notice:", err);
      });

      // Persist the name locally for returning users
      if (typeof window !== "undefined") {
        localStorage.setItem("raizo_user_name", trimmed);
        localStorage.setItem("raizo_onboarding_completed", "true");

        // Sync with existing cached user object
        const cached = localStorage.getItem("raizo_user");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            parsed.name = trimmed;
            parsed.display_name = trimmed;
            parsed.onboarding_completed = true;
            localStorage.setItem("raizo_user", JSON.stringify(parsed));
          } catch {
            // Ignore parse errors
          }
        }
      }

      // Refresh auth context so all dashboard greetings and certificates update immediately
      await refreshUser();

      // Navigate to the main dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Failed to complete onboarding:", err);
      setError(err?.message || "Failed to personalize your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center text-center space-y-3">
        <div className="h-9 w-9 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#A7B0BC]">Preparing your learning environment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[88vh] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] rounded-full bg-[#0EA5E9]/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[250px] rounded-full bg-[#10B981]/6 blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 text-[#38BDF8] text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Learner Personalization</span>
          </div>

          <div className="flex justify-center pt-1">
            <RaizoLogo size={36} />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F7FA] tracking-tight">
              Welcome to RAIZO
            </h1>
            <p className="text-sm sm:text-base text-[#B4BDC8] leading-relaxed">
              Let&apos;s personalize your learning journey.
            </p>
          </div>
        </div>

        {/* Clean, Professional EdTech Card */}
        <div className="rounded-3xl border border-[#27303B] bg-[#151B23] p-7 sm:p-10 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="block text-sm sm:text-base font-bold text-[#F5F7FA]"
              >
                What is your full name?
              </label>
              <p className="text-xs text-[#7E8996] leading-relaxed">
                Your name will appear on official certificates, verified credentials, and your personalized learning pathway.
              </p>

              <div className="pt-2">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoFocus
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (error) setError(null);
                  }}
                  className={`w-full rounded-xl border px-4 py-3.5 text-sm sm:text-base text-[#F5F7FA] placeholder-[#7E8996] bg-[#0D1117] transition-all focus:outline-none ${
                    error
                      ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]"
                      : "border-[#27303B] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]"
                  }`}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 pt-1.5 text-xs text-[#EF4444] animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#38BDF8] hover:bg-[#60A5FA] text-[#070A0F] text-sm sm:text-base font-bold shadow-lg shadow-[#38BDF8]/20 transition-all duration-200 disabled:opacity-60 cursor-pointer"
              >
                <span>{isSubmitting ? "Personalizing your dashboard..." : "Continue to RAIZO"}</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            </div>
          </form>

          {/* Trust Guarantees & Credentials Notice */}
          <div className="pt-4 border-t border-[#27303B] space-y-2.5 text-[11px] text-[#A7B0BC]">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#38BDF8] shrink-0" />
              <span>Official certificates and credentials will be issued directly in this full name.</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#10B981] shrink-0" />
              <span>Cryptographically signed with tamper-evident HMAC verification.</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-[#38BDF8] shrink-0" />
              <span>No unnecessary personal data collected or shared.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
