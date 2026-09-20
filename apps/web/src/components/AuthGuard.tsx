"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

// Routes accessible without authentication
const PUBLIC_ROUTES = ["/", "/login", "/signup"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const isPublic =
      PUBLIC_ROUTES.includes(pathname) ||
      pathname.startsWith("/verify");

    if (isAuthenticated) {
      // If already logged in, visiting login or signup should redirect to dashboard
      if (pathname === "/login" || pathname === "/signup") {
        router.replace("/dashboard");
      }
    } else {
      // If NOT logged in and trying to access a protected app page, redirect to login
      if (!isPublic) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [pathname, isAuthenticated, isLoading, router]);

  return <>{children}</>;
}
