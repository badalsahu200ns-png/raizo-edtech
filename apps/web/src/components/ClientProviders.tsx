"use client";

import React from "react";
import { AuthProvider } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <AppShell>
          {children}
        </AppShell>
      </AuthGuard>
    </AuthProvider>
  );
}
