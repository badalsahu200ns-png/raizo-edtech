"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Layers,
  BarChart3,
  BookOpen,
  Sparkles,
  FileCheck2,
  CheckCircle2,
  Award,
  Activity,
  User,
  Settings,
  Menu,
  X,
  Mail,
  ChevronRight,
  Briefcase,
  FileText,
  FileSpreadsheet,
  LogOut,
  ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import RaizoLogo from "./RaizoLogo";
import ContactModal from "./ContactModal";
import Footer from "./Footer";
import AgentActivityDrawer from "./AgentActivityDrawer";
import { useAuth } from "@/lib/auth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Compass },
  { href: "/learn", label: "Learning", icon: BookOpen },
  { href: "/assessment", label: "Assessment", icon: FileCheck2 },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/job-analysis", label: "Career Intelligence", icon: Briefcase, badge: "ATS" },
  { href: "/tutor", label: "Tutor", icon: Sparkles },
  { href: "/learn/data-lab", label: "Data Lab", icon: FileSpreadsheet, badge: "Lab" },
  { href: "/evidence", label: "Evidence", icon: CheckCircle2 }
];

const SECONDARY_NAV: NavItem[] = [
  { href: "/practice", label: "Practice", icon: Layers },
  { href: "/skills", label: "Skills Catalog", icon: Award },
  { href: "/projects", label: "Projects", icon: Layers },
  { href: "/reports", label: "Progress Reports", icon: BarChart3 },
  { href: "/certificate", label: "Certificates", icon: Award }
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // If on landing page "/", don't show full internal app sidebar, but keep clean top/footer
  const isLanding = pathname === "/";

  const getInitials = (name?: string) => {
    if (!name) return "AR";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F14] text-[#F5F7FA]">
      {/* 1. TOP BAR */}
      <header className="sticky top-0 z-30 w-full border-b border-[#27303B] bg-[#11161D]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center space-x-3">
            {!isLanding && (
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden rounded-lg p-2 text-[#B4BDC8] hover:bg-[#1A212B] hover:text-[#F5F7FA] transition-colors"
                aria-label="Open Navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <RaizoLogo size={28} />
          </div>

          {/* Center Context / Pathway Tag */}
          <div className="hidden md:flex items-center space-x-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151B23] text-[#F5F7FA] font-medium border border-[#27303B]">
              <span className="h-2 w-2 rounded-full bg-[#5B8DEF]" />
              Data Analyst Track
            </span>
            <span className="text-[#7E8996]">•</span>
            <span className="text-[#B4BDC8] font-medium">
              Career Readiness: <strong className="text-[#F5F7FA] font-mono">72%</strong>
            </span>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2.5">
            {/* Agent Activity Trigger */}
            <button
              onClick={() => setActivityDrawerOpen(true)}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-[#27303B] bg-[#151B23] px-3 py-1.5 text-xs font-medium text-[#F5F7FA] hover:bg-[#1A212B] hover:border-[#5B8DEF]/40 transition-all"
              title="Inspect real-time agent audit logs"
            >
              <Activity className="h-3.5 w-3.5 text-[#5B8DEF] animate-pulse" />
              <span className="hidden sm:inline">Agent Activity</span>
            </button>

            {/* Contact Button */}
            <button
              onClick={() => setContactModalOpen(true)}
              className="inline-flex items-center space-x-1 rounded-lg border border-[#27303B] bg-[#151B23] px-3 py-1.5 text-xs font-semibold text-[#5B8DEF] hover:bg-[#5B8DEF]/10 hover:border-[#5B8DEF]/40 transition-all"
              title="Contact Badal Kumar Sahu"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Contact</span>
            </button>

            {/* Authenticated User Menu or Sign In / Sign Up Buttons */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 rounded-lg border border-[#27303B] bg-[#151B23] px-2.5 py-1.5 hover:border-[#5B8DEF]/50 transition-all group cursor-pointer"
                  title="Learner Account Menu"
                >
                  <div className="h-6 w-6 rounded-full bg-[#5B8DEF] text-white flex items-center justify-center text-[10px] font-bold">
                    {getInitials(user?.name)}
                  </div>
                  <span className="text-xs font-semibold text-[#F5F7FA] hidden lg:inline group-hover:text-[#5B8DEF] transition-colors">
                    {user?.name || "Alex Rivera"}
                  </span>
                  <ChevronDown className="h-3 w-3 text-[#7E8996] group-hover:text-[#F5F7FA]" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#27303B] bg-[#151B23] p-2 shadow-2xl z-50 animate-in fade-in">
                      <div className="px-3 py-2 border-b border-[#27303B] mb-1">
                        <p className="text-xs font-bold text-[#F5F7FA] truncate">{user?.name}</p>
                        <p className="text-[11px] text-[#B4BDC8] truncate">{user?.email}</p>
                        <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold uppercase tracking-wider text-[#36C98F] bg-[#36C98F]/10 border border-[#36C98F]/20 px-1.5 py-0.5 rounded">
                          ✓ Google Verified
                        </span>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#F5F7FA] hover:bg-[#1A212B] rounded-lg transition-colors"
                      >
                        <Settings className="h-3.5 w-3.5 text-[#7E8996]" />
                        <span>Profile & Settings</span>
                      </Link>

                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await logout();
                          router.push("/login");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#E86A6A] hover:bg-[#E86A6A]/10 rounded-lg transition-colors text-left mt-1 border-t border-[#27303B] pt-2 cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-1.5 rounded-lg border border-[#27303B] bg-[#151B23] px-3 py-1.5 text-xs font-semibold text-[#F5F7FA] hover:bg-[#1A212B] transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-[#7E8996]" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center space-x-1.5 rounded-lg bg-[#5B8DEF] hover:bg-[#719DF5] active:bg-[#4779D8] text-white px-3 py-1.5 text-xs font-bold transition-colors shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. BODY WITH SIDEBAR OR FLUID CONTAINER */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {/* Desktop Sidebar (Rendered on non-landing pages) */}
        {!isLanding && (
          <aside className="hidden lg:block w-64 shrink-0 border-r border-[#27303B] bg-[#11161D] py-6 px-4 space-y-6" suppressHydrationWarning>
            <div className="space-y-1" suppressHydrationWarning>
              <span className="text-[10px] font-bold tracking-widest text-[#7E8996] uppercase px-3 block mb-2">
                MAIN PRODUCTS
              </span>
              {PRIMARY_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#18202A] text-[#F5F7FA] font-semibold border-l-2 border-[#5B8DEF] shadow-xs"
                        : "text-[#B4BDC8] hover:text-[#F5F7FA] hover:bg-[#151B23]"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? "text-[#5B8DEF]" : "text-[#7E8996]"}`} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-[#5B8DEF]/15 text-[#5B8DEF] border border-[#5B8DEF]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {isActive && <ChevronRight className="h-3 w-3 text-[#5B8DEF]" />}
                  </Link>
                );
              })}
            </div>

            {/* Secondary Tools & Catalog */}
            <div className="space-y-1 pt-3 border-t border-[#27303B]/60" suppressHydrationWarning>
              <span className="text-[10px] font-bold tracking-widest text-[#7E8996] uppercase px-3 block mb-2">
                APPLIED PRACTICE & PROOF
              </span>
              {SECONDARY_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href === "/skills" && pathname?.startsWith("/skills"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#18202A] text-[#F5F7FA] font-semibold border-l-2 border-[#5B8DEF]"
                        : "text-[#B4BDC8] hover:text-[#F5F7FA] hover:bg-[#151B23]"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#5B8DEF]" : "text-[#7E8996]"}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-3 w-3 text-[#5B8DEF]" />}
                  </Link>
                );
              })}
            </div>

            {/* Career Readiness Journey Narrative */}
            <div className="pt-4 border-t border-[#27303B] space-y-2 px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8996] block">
                CAREER INTELLIGENCE
              </span>
              <div className="rounded-xl bg-[#151B23] p-3 border border-[#27303B] text-[11px] space-y-2">
                <div className="flex items-center justify-between font-bold text-[#F5F7FA]">
                  <span>Data Analyst</span>
                  <span className="text-[#5B8DEF] font-mono">72% Match</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#0B0F14] overflow-hidden">
                  <div className="h-full rounded-full bg-[#5B8DEF] w-[72%]" />
                </div>
                <p className="text-[10px] text-[#7E8996]">
                  8 skills verified · 3 developing
                </p>
              </div>
            </div>

            {/* Clean AI Career Intelligence Assistant Status */}
            <div className="pt-2">
              <button
                onClick={() => setActivityDrawerOpen(true)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#151B23] border border-[#27303B] hover:bg-[#1A212B] transition-colors text-left"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-[#5B8DEF] uppercase block">
                    AI CAREER INTELLIGENCE
                  </span>
                  <span className="text-xs font-semibold text-[#F5F7FA] block">
                    Autonomous Engine
                  </span>
                </div>
                <span className="h-2 w-2 rounded-full bg-[#36C98F]" />
              </button>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* 3. MOBILE SLIDE-OUT DRAWER */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#11161D] border-r border-[#27303B] h-full shadow-2xl p-5 overflow-y-auto space-y-6 z-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#27303B]">
                <RaizoLogo size={26} />
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-[#7E8996] hover:bg-[#1A212B] hover:text-[#F5F7FA]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-1" suppressHydrationWarning>
                <span className="text-[10px] font-bold tracking-widest text-[#7E8996] uppercase px-3 block mb-1">
                  MAIN PRODUCTS
                </span>
                {PRIMARY_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#18202A] text-[#F5F7FA] font-bold border-l-2 border-[#5B8DEF]"
                          : "text-[#B4BDC8] hover:text-[#F5F7FA] hover:bg-[#151B23]"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`h-4 w-4 ${isActive ? "text-[#5B8DEF]" : "text-[#7E8996]"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="rounded-full bg-[#5B8DEF]/15 text-[#5B8DEF] border border-[#5B8DEF]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-1 pt-3 border-t border-[#27303B]/60" suppressHydrationWarning>
                <span className="text-[10px] font-bold tracking-widest text-[#7E8996] uppercase px-3 block mb-1">
                  APPLIED PRACTICE & PROOF
                </span>
                {SECONDARY_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href === "/skills" && pathname?.startsWith("/skills"));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#18202A] text-[#F5F7FA] font-bold border-l-2 border-[#5B8DEF]"
                          : "text-[#B4BDC8] hover:text-[#F5F7FA] hover:bg-[#151B23]"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#5B8DEF]" : "text-[#7E8996]"}`} />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#27303B] space-y-3">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 px-1">
                    <div className="h-8 w-8 rounded-full bg-[#5B8DEF] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {getInitials(user?.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#F5F7FA] truncate">{user?.name}</p>
                      <p className="text-[10px] text-[#B4BDC8] truncate">{user?.email}</p>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#27303B] bg-[#151B23] text-xs font-semibold text-[#F5F7FA] hover:bg-[#1A212B] transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-[#7E8996]" />
                    <span>Profile & Settings</span>
                  </Link>

                  <button
                    onClick={async () => {
                      setMobileDrawerOpen(false);
                      await logout();
                      router.push("/login");
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#E86A6A]/10 border border-[#E86A6A]/30 text-xs font-bold text-[#E86A6A] hover:bg-[#E86A6A]/20 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#27303B] bg-[#151B23] text-xs font-semibold text-[#F5F7FA] hover:bg-[#1A212B]"
                  >
                    <User className="h-3.5 w-3.5 text-[#7E8996]" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#5B8DEF] hover:bg-[#719DF5] text-white text-xs font-bold shadow-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Sign Up with Google</span>
                  </Link>
                </div>
              )}

              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setContactModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#27303B] bg-[#151B23] text-[#5B8DEF] text-xs font-bold shadow-xs hover:bg-[#5B8DEF]/10 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Contact Badal Kumar Sahu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. ENTERPRISE FOOTER */}
      <Footer onOpenContact={() => setContactModalOpen(true)} />

      {/* 5. CONTACT MODAL */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      {/* 6. AGENT ACTIVITY DRAWER */}
      <AgentActivityDrawer
        isOpen={activityDrawerOpen}
        onClose={() => setActivityDrawerOpen(false)}
      />
    </div>
  );
}
