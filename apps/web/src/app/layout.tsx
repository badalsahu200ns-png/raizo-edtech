"use client";

import React, { useState } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AgentActivityDrawer from "@/components/AgentActivityDrawer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);

  return (
    <html lang="en" className="dark">
      <head>
        <title>RAIZO — Adaptive AI Learning & Skill Intelligence Agent</title>
        <meta
          name="description"
          content="Evidence-based, adaptive learning agent that analyzes learner capabilities, verifies skills through assessments, and dynamically updates learning roadmaps. By Badal Kumar Sahu."
        />
      </head>
      <body className="bg-[#080c14] text-slate-100 min-h-screen selection:bg-indigo-500 selection:text-white antialiased">
        {/* Ambient background glow effects */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[20%] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute top-[40%] right-[-5%] h-[600px] w-[600px] rounded-full bg-cyan-600/10 blur-[140px]" />
          <div className="absolute bottom-[-10%] left-[10%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[130px]" />
        </div>

        <Navbar onOpenActivity={() => setActivityDrawerOpen(true)} />

        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>

        <AgentActivityDrawer
          isOpen={activityDrawerOpen}
          onClose={() => setActivityDrawerOpen(false)}
        />
      </body>
    </html>
  );
}
