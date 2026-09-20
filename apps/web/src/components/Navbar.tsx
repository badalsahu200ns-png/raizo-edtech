"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  BookOpen,
  Award,
  FileCheck2,
  BarChart3,
  CheckCircle2,
  Layers,
  Sparkles,
  Activity,
  Menu,
  X,
  Briefcase,
  FileText,
  FileSpreadsheet,
  LogOut
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import RaizoLogo from "./RaizoLogo";

interface NavbarProps {
  onOpenActivity?: () => void;
}

export default function Navbar({ onOpenActivity }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Home", icon: Compass },
    { href: "/assessment", label: "Assessment", icon: FileCheck2 },
    { href: "/learn", label: "Learn", icon: BookOpen },
    { href: "/learn/data-lab", label: "Data Lab", icon: FileSpreadsheet },
    { href: "/practice", label: "Practice", icon: Sparkles },
    { href: "/skills", label: "Verified Skills", icon: CheckCircle2 },
    { href: "/job-analysis", label: "Career Intelligence", icon: Briefcase },
    { href: "/resume", label: "Resume", icon: FileText },
    { href: "/reports", label: "Progress", icon: BarChart3 },
    { href: "/projects", label: "Projects", icon: Layers },
    { href: "/certificate", label: "Certificates", icon: Award }
  ];

  const getInitials = (name?: string) => {
    if (!name) return "AR";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#27303B] bg-[#11161D]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <RaizoLogo size={28} />
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
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#5B8DEF]/12 text-[#5B8DEF] font-semibold border border-[#5B8DEF]/30"
                    : "text-[#B4BDC8] hover:text-[#F5F7FA] hover:bg-[#151B23]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#5B8DEF]" : "text-[#7E8996]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-3">
          {/* Agent Activity Drawer Trigger */}
          {onOpenActivity && (
            <button
              onClick={onOpenActivity}
              className="flex items-center space-x-1.5 rounded-lg border border-[#27303B] bg-[#151B23] px-3 py-1.5 text-xs font-medium text-[#5B8DEF] transition-all hover:bg-[#1A212B] hover:border-[#5B8DEF]/40 cursor-pointer"
              title="Inspect real-time agent audit logs"
            >
              <Activity className="h-3.5 w-3.5 animate-pulse text-[#5B8DEF]" />
              <span className="hidden sm:inline">Agent Activity</span>
            </button>
          )}

          {/* Learner Profile & Auth Controls */}
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2">
              <Link
                href="/profile"
                className="flex items-center space-x-2.5 rounded-xl border border-[#27303B] bg-[#151B23] px-3 py-1.5 hover:border-[#0EA5E9]/50 transition-all group"
                title="Learner Profile & Settings"
              >
                {user.photo_url || user.picture ? (
                  <img
                    src={user.photo_url || user.picture}
                    alt={user.display_name || user.name || "User"}
                    className="h-7 w-7 rounded-full object-cover border border-[#27303B]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-[#0EA5E9] flex items-center justify-center text-[11px] font-bold text-white shadow-xs">
                    {getInitials(user.display_name || user.name)}
                  </div>
                )}

                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#F5F7FA] group-hover:text-[#38BDF8] transition-colors">
                    {user.display_name || user.name || "RAIZO Learner"}
                  </span>
                  <span className="text-[10px] text-[#0EA5E9] font-medium">
                    {user?.target_role === "data_analyst" ? "Data Analyst Track" : "Analytics Pathway"}
                  </span>
                </div>
              </Link>

              {/* Log Out Button */}
              <button
                onClick={async () => {
                  await logout();
                  router.push("/login");
                }}
                className="rounded-lg p-2 text-[#A7B0BC] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="rounded-lg bg-[#0EA5E9] hover:bg-[#38BDF8] px-3.5 py-1.5 text-xs font-bold text-white transition-all shadow-xs"
              >
                Continue with Google
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden rounded-lg p-2 text-[#7E8996] hover:bg-[#1A212B] hover:text-[#F5F7FA] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-[#27303B] bg-[#11161D] px-4 py-3 space-y-1">
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
                    ? "bg-[#5B8DEF]/12 text-[#5B8DEF] font-semibold border border-[#5B8DEF]/30"
                    : "text-[#B4BDC8] hover:text-[#F5F7FA] hover:bg-[#151B23]"
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
