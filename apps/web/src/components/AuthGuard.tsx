"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

// Routes accessible without authentication
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/onboarding"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const isPublic =
      PUBLIC_ROUTES.includes(pathname) ||
      pathname.startsWith("/verify");

    const hasCompletedOnboarding = typeof window !== "undefined" && (
      Boolean(localStorage.getItem("raizo_user_name")) ||
      Boolean(user?.onboarding_completed)
    );

    if (isAuthenticated) {
      // First-time user needs to enter their name in onboarding
      if (!hasCompletedOnboarding && pathname !== "/onboarding" && !isPublic) {
        router.replace("/onboarding");
        return;
      }

      // Returning user who already has a name shouldn't see onboarding again
      if (hasCompletedOnboarding && pathname === "/onboarding") {
        router.replace("/dashboard");
        return;
      }

      // If already logged in, visiting login or signup should redirect to dashboard
      if (pathname === "/login" || pathname === "/signup") {
        if (!hasCompletedOnboarding) {
          router.replace("/onboarding");
        } else {
          router.replace("/dashboard");
        }
      }
    } else {
      // If NOT logged in and trying to access a protected app page
      if (!isPublic) {
        // If they have never onboarded, go to onboarding directly
        if (!hasCompletedOnboarding) {
          router.replace("/onboarding");
        } else {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      }
    }
  }, [pathname, isAuthenticated, isLoading, user, router]);

  return <>{children}</>;
}
