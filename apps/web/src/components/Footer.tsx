"use client";

import React from "react";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import RaizoLogo from "./RaizoLogo";

function LinkedinIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function GithubIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

interface FooterProps {
  onOpenContact?: () => void;
}

export default function Footer({ onOpenContact }: FooterProps) {
  const email = "badalasahu200ns@gmail.com";
  const linkedin = "https://www.linkedin.com/in/badalsahu200ns";
  const github = "https://github.com/badalsahu200ns-png";

  return (
    <footer className="w-full border-t border-[#27303B] bg-[#11161D] mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Left Column: Brand Story */}
          <div className="md:col-span-2 space-y-4">
            <RaizoLogo size={32} />
            <p className="text-sm text-[#B4BDC8] max-w-md leading-relaxed">
              Turn your skills into measurable career progress. An evidence-based learning intelligence platform that diagnoses skill gaps, steers adaptive pathways, and verifies competencies with empirical proof.
            </p>
            <div className="pt-2 text-xs text-[#7E8996]">
              Architected & Built by <span className="font-semibold text-[#F5F7FA]">Badal Kumar Sahu</span>
            </div>
          </div>

          {/* Middle Column: Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">
              Platform
            </h4>
            <ul className="space-y-2 text-xs font-medium text-[#B4BDC8]">
              <li>
                <Link href="/skills" className="hover:text-[#5B8DEF] transition-colors">
                  My Skills
                </Link>
              </li>
              <li>
                <Link href="/gaps" className="hover:text-[#5B8DEF] transition-colors">
                  Skill Gaps
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="hover:text-[#5B8DEF] transition-colors">
                  Learning Path
                </Link>
              </li>
              <li>
                <Link href="/evidence" className="hover:text-[#5B8DEF] transition-colors">
                  Evidence Ledger
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-[#5B8DEF] transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/certificate" className="hover:text-[#5B8DEF] transition-colors">
                  Verified Certificate
                </Link>
              </li>
              <li>
                <Link href="/job-analysis" className="hover:text-[#5B8DEF] transition-colors">
                  Job Match
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Column: Connect & Creator */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">
              Connect
            </h4>
            <ul className="space-y-2 text-xs font-medium text-[#B4BDC8]">
              <li>
                {onOpenContact ? (
                  <button
                    onClick={onOpenContact}
                    className="hover:text-[#5B8DEF] transition-colors text-left flex items-center gap-1 group cursor-pointer"
                  >
                    <span>Contact Dialog</span>
                    <ArrowRight className="h-3 w-3 text-[#7E8996] group-hover:text-[#5B8DEF]" />
                  </button>
                ) : (
                  <a
                    href={`mailto:${email}`}
                    className="hover:text-[#5B8DEF] transition-colors flex items-center gap-1 group"
                  >
                    <span>Contact</span>
                    <ArrowRight className="h-3 w-3 text-[#7E8996] group-hover:text-[#5B8DEF]" />
                  </a>
                )}
              </li>
              <li>
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#5B8DEF] transition-colors flex items-center gap-1 group"
                >
                  <LinkedinIcon className="h-3.5 w-3.5 text-[#0A66C2]" />
                  <span>LinkedIn</span>
                  <ArrowRight className="h-3 w-3 text-[#7E8996] group-hover:text-[#5B8DEF]" />
                </a>
              </li>
              <li>
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#5B8DEF] transition-colors flex items-center gap-1 group"
                >
                  <GithubIcon className="h-3.5 w-3.5 text-[#F5F7FA]" />
                  <span>GitHub</span>
                  <ArrowRight className="h-3 w-3 text-[#7E8996] group-hover:text-[#5B8DEF]" />
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="hover:text-[#5B8DEF] transition-colors flex items-center gap-1 group truncate"
                >
                  <Mail className="h-3.5 w-3.5 text-[#5B8DEF]" />
                  <span className="truncate">{email}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#27303B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7E8996]">
          <span>
            © 2026 RAIZO. Built for continuous learning and career growth.
          </span>
          <div className="flex items-center space-x-6">
            <span>Evidence-Driven Architecture</span>
            <span className="h-1 w-1 rounded-full bg-[#27303B]" />
            <span>Deterministic Rubrics</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
