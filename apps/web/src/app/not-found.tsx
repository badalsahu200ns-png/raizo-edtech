"use client";

import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="h-16 w-16 rounded-2xl bg-[#5B8DEF]/10 text-[#5B8DEF] flex items-center justify-center mb-6">
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      </div>
      <h1 className="text-3xl font-extrabold text-[#F5F7FA] mb-3">Page Not Found</h1>
      <p className="text-sm text-[#B4BDC8] max-w-md mb-8">
        The learning pathway or resource you are looking for does not exist or has been relocated within the intelligence engine.
      </p>
      <Link
        href="/dashboard"
        className="px-5 py-2.5 rounded-lg bg-[#5B8DEF] text-white text-xs font-bold shadow-sm hover:bg-[#12584B] transition-colors"
      >
        Return to Overview
      </Link>
    </div>
  );
}
