"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  Compass,
  GitBranch,
  BookOpen,
  MessageSquare,
  Award,
  FileCheck2,
  BarChart3,
  Search,
  CheckCircle2,
  Layers,
  Sparkles,
  Activity,
  RotateCcw,
  Menu,
  X
} from "lucide-react";
import { api } from "@/lib/api";

interface NavbarProps {
  onOpenActivity?: () => void;
}

export default function Navbar({ onOpenActivity }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Compass },
    { href: "/skills", label: "My Skills", icon: Layers },
    { href: "/gaps", label: "Skill Gaps", icon: BarChart3 },
    { href: "/roadmap", label: "Learning Path", icon: GitBranch },
    { href: "/learn", label: "Today's Plan", icon: BookOpen },
    { href: "/tutor", label: "Raizo Tutor", icon: MessageSquare },
    { href: "/practice", label: "Practice", icon: Sparkles },
    { href: "/assessment", label: "Assessments", icon: FileCheck2 },
    { href: "/evidence", label: "Evidence", icon: CheckCircle2 },
    { href: "/projects", label: "Projects", icon: Award },
    { href: "/job-analysis", label: "Job Match", icon: Search },
    { href: "/reports", label: "Reports", icon: Activity },
  ];

  const handleResetDemo = async () => {
    try {
      setIsResetting(true);
      await api.resetDemo();
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Demo reset error:", err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#080c14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#090d16]">
                <Brain className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                RAIZO
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                  AGENTIC
                </span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider">
                By Badal Kumar Sahu
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center space-x-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-2.5">
          {/* Agent Activity Drawer Trigger */}
          {onOpenActivity && (
            <button
              onClick={onOpenActivity}
              className="flex items-center space-x-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-900/50 hover:border-cyan-400 shadow-sm shadow-cyan-950"
              title="Inspect real-time agent audit logs"
            >
              <Activity className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
              <span className="hidden sm:inline">Agent Activity</span>
            </button>
          )}

          {/* Quick Demo Reset for Judges */}
          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            title="Reset demo data to canonical Alex Rivera Data Analyst state"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? "animate-spin" : ""}`} />
            <span className="hidden md:inline">Reset Demo</span>
          </button>

          {/* User Badge */}
          <Link
            href="/profile"
            className="flex items-center space-x-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 hover:border-indigo-500/40 transition-all"
          >
            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
              AR
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-medium text-slate-200 leading-tight">Alex Rivera</span>
              <span className="text-[10px] text-cyan-400 font-semibold leading-tight">Data Analyst</span>
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-white/10 bg-[#0c1220] px-4 py-3 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
