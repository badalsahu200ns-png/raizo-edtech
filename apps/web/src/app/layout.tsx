import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "RAIZOAGENTIC — Turn your skills into measurable career progress",
  description:
    "RAIZOAGENTIC: An AI-powered career intelligence and adaptive learning platform that understands learner capabilities, identifies skill gaps, steers personalized learning paths, and verifies competencies with empirical proof. By Badal Kumar Sahu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-[#0B0F14] text-[#F5F7FA] min-h-screen selection:bg-[#5B8DEF] selection:text-white antialiased font-sans" suppressHydrationWarning>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
