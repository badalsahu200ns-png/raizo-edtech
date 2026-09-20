"use client";

import React from "react";
import { AuthProvider } from "@/lib/auth";
import AppShell from "@/components/AppShell";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
