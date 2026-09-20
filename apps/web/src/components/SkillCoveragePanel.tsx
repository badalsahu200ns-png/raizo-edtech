"use client";

import React from "react";
import { categorizeSkills, formatSkillName } from "@/lib/skillUtils";
import { CheckCircle2, Layers } from "lucide-react";

interface SkillCoveragePanelProps {
  skills: string[];
  title?: string;
  subtitle?: string;
  variant?: "compact" | "detailed" | "chips";
  className?: string;
}

export default function SkillCoveragePanel({
  skills,
  title = "ASSESSMENT COVERAGE",
  subtitle = "Competencies evaluated and verified by this module",
  variant = "detailed",
  className = ""
}: SkillCoveragePanelProps) {
  if (!skills || skills.length === 0) return null;

  const categorized = categorizeSkills(skills);
  const categoryNames = Object.keys(categorized);

  if (variant === "chips") {
    return (
      <div className={`flex flex-wrap gap-1.5 ${className}`}>
        {skills.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#151B23] text-[#F5F7FA] border border-[#27303B]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#5B8DEF]" />
            {formatSkillName(s)}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-[#27303B] bg-[#151B23] p-4 sm:p-5 space-y-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between border-b border-[#27303B] pb-3">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5B8DEF] block">
            {title}
          </span>
          <p className="text-xs text-[#B4BDC8] mt-0.5">
            {subtitle}
          </p>
        </div>
        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#5B8DEF]/15 text-[#5B8DEF] border border-[#5B8DEF]/20">
          {skills.length} Skills
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categoryNames.map((cat) => (
          <div key={cat} className="space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#F5F7FA]">
              <Layers className="h-3.5 w-3.5 text-[#5B8DEF]" />
              <span>{cat}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categorized[cat].map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#11161D] border border-[#27303B] text-[#F5F7FA] transition-colors hover:border-[#5B8DEF]/40"
                >
                  <CheckCircle2 className="h-3 w-3 text-[#36C98F] shrink-0" />
                  <span>{item.title}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
