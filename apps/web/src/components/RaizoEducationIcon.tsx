"use client";

import React, { useState } from "react";

interface RaizoEducationIconProps {
  size?: number;
  className?: string;
  interactive?: boolean;
}

/**
 * RAIZO Distinctive Modern Education / AI 3D Emblem
 * Represents the intersection of Academic Rigor (Cap/Prism), 
 * Artificial Intelligence (Neural Nodes & Vector Tensors), 
 * and Cryptographic Skill Verification (Emerald Keypoint).
 * 
 * Styled with precision tech azure (#0EA5E9), deep cyan (#0284C7),
 * verification emerald (#10B981), and gold milestone (#F59E0B).
 */
export default function RaizoEducationIcon({
  size = 72,
  className = "",
  interactive = true
}: RaizoEducationIconProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x: y, y: x });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)"
      }}
      className={`relative inline-flex items-center justify-center select-none group cursor-pointer ${className}`}
      aria-label="RAIZO Education AI Emblem"
    >
      {/* Outer 3D Ambient Hologram Glow */}
      <div 
        className="absolute -inset-2.5 rounded-3xl bg-gradient-to-tr from-[#0EA5E9]/25 via-[#38BDF8]/15 to-[#10B981]/20 blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow"
        aria-hidden="true" 
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
      >
        <defs>
          {/* Base Prism Gradient */}
          <linearGradient id="ed-prism-base" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#16202E" />
            <stop offset="0.5" stopColor="#0F1622" />
            <stop offset="1" stopColor="#0A0E15" />
          </linearGradient>

          {/* Academic Diamond Top Surface */}
          <linearGradient id="ed-top-facet" x1="50" y1="12" x2="50" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0284C7" stopOpacity="0.9" />
            <stop offset="1" stopColor="#0369A1" stopOpacity="0.75" />
          </linearGradient>

          {/* Specular Highlight Streak */}
          <linearGradient id="ed-specular" x1="25" y1="20" x2="75" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Neural Wire Gradients */}
          <linearGradient id="ed-neural-wire" x1="20" y1="40" x2="80" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#10B981" />
          </linearGradient>

          {/* 3D Depth Shadow Filter */}
          <filter id="inner-depth" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* 1. Base Squircle Platter with Hairline 3D Edge */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="24"
          fill="url(#ed-prism-base)"
          stroke="#273546"
          strokeWidth="1.5"
        />
        <rect
          x="7.5"
          y="7.5"
          width="85"
          height="85"
          rx="22.5"
          stroke="url(#ed-specular)"
          strokeWidth="1"
          strokeOpacity="0.35"
        />

        {/* 2. Geometric Hex / Isometric Academic Prism (Mortarboard Angle) */}
        {/* Top Diamond Facet: The Cap / Knowledge Horizon */}
        <polygon
          points="50,18 82,34 50,50 18,34"
          fill="url(#ed-top-facet)"
          stroke="#38BDF8"
          strokeWidth="1.5"
          filter="url(#inner-depth)"
        />

        {/* Left 3D Drop Facet */}
        <polygon
          points="18,34 50,50 50,66 18,50"
          fill="#0B233A"
          stroke="#1E3A5F"
          strokeWidth="1"
        />

        {/* Right 3D Drop Facet */}
        <polygon
          points="50,50 82,34 82,50 50,66"
          fill="#071A2C"
          stroke="#162E49"
          strokeWidth="1"
        />

        {/* 3. Neural Learning DAG Synapses (AI & Adaptive Intelligence) */}
        <path
          d="M50 50 L50 78 M50 66 L28 76 M50 66 L72 76"
          stroke="url(#ed-neural-wire)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="2 3"
        />

        {/* Neural Nodes (Milestones) */}
        {/* Left Concept Node */}
        <circle cx="28" cy="76" r="3.5" fill="#15212E" stroke="#38BDF8" strokeWidth="1.5" />
        <circle cx="28" cy="76" r="1.5" fill="#38BDF8" />

        {/* Center Mastery Root Node */}
        <circle cx="50" cy="78" r="4.5" fill="#15212E" stroke="#10B981" strokeWidth="2" />
        <circle cx="50" cy="78" r="2" fill="#10B981" />

        {/* Right Application Node */}
        <circle cx="72" cy="76" r="3.5" fill="#15212E" stroke="#F59E0B" strokeWidth="1.5" />
        <circle cx="72" cy="76" r="1.5" fill="#F59E0B" />

        {/* 4. Center Cap Apex Gem (Verified Career Signal) */}
        <circle cx="50" cy="34" r="5" fill="#0B131D" stroke="#38BDF8" strokeWidth="1.5" />
        <circle cx="50" cy="34" r="2.5" fill="#10B981" className="animate-pulse" />

        {/* Academic Ribbon / Tassel Accent in Tech Cyan */}
        <path
          d="M50 34 C58 38, 70 42, 74 48 L76 56"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="76" cy="56" r="2.5" fill="#38BDF8" />
      </svg>
    </div>
  );
}
