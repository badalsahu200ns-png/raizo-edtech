"use client";

import React, { useEffect, useState } from "react";
import { Mail, X, Copy, Check, ExternalLink } from "lucide-react";

function LinkedinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const email = "badalasahu200ns@gmail.com";
  const linkedin = "https://www.linkedin.com/in/badalsahu200ns";
  const github = "https://github.com/badalsahu200ns-png";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03070C]/75 backdrop-blur-sm transition-all duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#151B23] rounded-2xl border border-[#27303B] shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150 text-[#F5F7FA]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5B8DEF]">
              Get in Touch
            </span>
            <h3 id="contact-modal-title" className="text-xl font-extrabold text-[#F5F7FA]">
              Connect with Badal Kumar Sahu
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#7E8996] hover:bg-[#1A212B] hover:text-[#F5F7FA] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Introduction */}
        <p className="text-sm text-[#B4BDC8] leading-relaxed">
          Inquiries regarding platform architecture, pedagogical methodologies, career intelligence features, or enterprise collaborations are welcome.
        </p>

        {/* Channels Card */}
        <div className="space-y-3">
          {/* Email Row */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#11161D] border border-[#27303B]">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-[#5B8DEF]/10 text-[#5B8DEF] flex items-center justify-center">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#F5F7FA] block">
                  Direct Email
                </span>
                <span className="text-xs font-mono text-[#B4BDC8] select-all">
                  {email}
                </span>
              </div>
            </div>
            <button
              onClick={handleCopyEmail}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#151B23] border border-[#27303B] text-xs font-semibold text-[#F5F7FA] hover:bg-[#1A212B] transition-colors cursor-pointer"
              title="Copy email to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#36C98F]" />
                  <span className="text-[#36C98F]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#7E8996]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Social Profiles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] hover:border-[#5B8DEF]/60 hover:bg-[#1A212B] transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-lg bg-[#0A66C2]/15 text-[#0A66C2] flex items-center justify-center">
                  <LinkedinIcon className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#F5F7FA] group-hover:text-[#5B8DEF] transition-colors">
                    LinkedIn
                  </span>
                  <span className="text-[11px] text-[#7E8996] block">/in/badalsahu200ns</span>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-[#7E8996] group-hover:text-[#5B8DEF] transition-colors" />
            </a>

            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#11161D] border border-[#27303B] hover:border-[#5B8DEF]/60 hover:bg-[#1A212B] transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-lg bg-[#151B23] border border-[#27303B] text-[#F5F7FA] flex items-center justify-center">
                  <GithubIcon className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#F5F7FA] group-hover:text-[#5B8DEF] transition-colors">
                    GitHub
                  </span>
                  <span className="text-[11px] text-[#7E8996] block">/badalsahu200ns-png</span>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-[#7E8996] group-hover:text-[#5B8DEF] transition-colors" />
            </a>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#B4BDC8] hover:text-[#F5F7FA] hover:bg-[#1A212B] transition-colors cursor-pointer"
          >
            Close
          </button>
          <a
            href={`mailto:${email}?subject=Inquiry%20regarding%20RAIZO`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5B8DEF] text-white text-xs font-bold shadow-sm hover:bg-[#719DF5] transition-all"
          >
            <Mail className="h-4 w-4" />
            <span>Send Email</span>
          </a>
        </div>
      </div>
    </div>
  );
}
