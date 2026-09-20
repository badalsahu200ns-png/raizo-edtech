"use client";

import React from "react";
import Link from "next/link";

interface RaizoLogoProps {
  variant?: "full" | "icon" | "sidebar";
  className?: string;
  size?: number;
}

/**
 * RAIZO Modern Brand Mark
 * Enterprise Intelligence Prism & Career Ascension Mark:
 * Precision Blue (#5B8DEF) & Indigo (#7C6CF2) with verified indicator.
 */
export function RaizoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-all duration-200 group-hover:scale-105 ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Primary Azure Gradient */}
        <linearGradient id="raizo-blue-grad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>

        {/* Intelligence Cyan/Emerald Accent */}
        <linearGradient id="raizo-indigo-grad" x1="16" y1="8" x2="30" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>

        {/* Subtle Amber Spark */}
        <linearGradient id="raizo-amber-grad" x1="20" y1="6" x2="28" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Background Dark Squircle with Subtle Enterprise Border */}
      <rect width="36" height="36" rx="10" fill="#151B23" stroke="#27303B" strokeWidth="1" />

      {/* Main Structural 'R' Backbone */}
      <path
        d="M8.5 7.5C8.5 6.67157 9.17157 6 10 6H13C13.8284 6 14.5 6.67157 14.5 7.5V28.5C14.5 29.3284 13.8284 30 13 30H10C9.17157 30 8.5 29.3284 8.5 28.5V7.5Z"
        fill="url(#raizo-blue-grad)"
      />

      {/* Upper Loop: Modern Geometric Facet */}
      <path
        d="M13.5 6H20.5C24.366 6 27.5 9.13401 27.5 13C27.5 16.866 24.366 20 20.5 20H13.5V6Z"
        fill="#0EA5E9"
      />
      {/* Inner Negative Space Cutout */}
      <path
        d="M14.5 10H19.5C21.1569 10 22.5 11.3431 22.5 13C22.5 14.6569 21.1569 16 19.5 16H14.5V10Z"
        fill="#151B23"
      />

      {/* Forward Career Ascension Leg */}
      <path
        d="M18.5 17.5L25.8 28.8C26.3 29.5 27.2 30 28.1 30H29.5C30.2 30 30.7 29.2 30.3 28.6L22.8 17.2C22.2 16.3 21.1 16 20.1 16.5L18.5 17.5Z"
        fill="url(#raizo-indigo-grad)"
      />

      {/* Intelligence Spark Apex */}
      <polygon
        points="22,6 27.5,13 25,13 20.5,6"
        fill="url(#raizo-amber-grad)"
      />

      {/* Verified Node Accent Pin */}
      <circle cx="27.5" cy="13" r="1.75" fill="#10B981" />
      <circle cx="11.5" cy="8.5" r="1.5" fill="#F5F7FA" opacity="0.9" />
    </svg>
  );
}

export default function RaizoLogo({
  variant = "full",
  className = "",
  size = 32
}: RaizoLogoProps) {
  if (variant === "icon") {
    return <RaizoMark size={size} className={className} />;
  }

  return (
    <Link
      href="/dashboard"
      className={`inline-flex items-center gap-3 group focus:outline-none ${className}`}
      aria-label="RAIZO Home"
    >
      <RaizoMark size={size} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-bold text-[16px] tracking-tight text-[#F5F7FA] group-hover:text-[#0EA5E9] transition-colors">
            RAIZO
          </span>
          <span className="text-[9px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-[#0EA5E9]/10 text-[#0EA5E9] uppercase border border-[#0EA5E9]/20">
            INTELLIGENCE
          </span>
        </div>
        <span className="text-[10px] text-[#7E8996] tracking-wide mt-1 font-medium">
          By Badal Kumar Sahu
        </span>
      </div>
    </Link>
  );
}
