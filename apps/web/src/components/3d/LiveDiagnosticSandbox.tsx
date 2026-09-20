"use client";

import React, { useState } from "react";
import { Play, CheckCircle2, AlertTriangle, Sparkles, Database, ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import Card3DTilt from "./Card3DTilt";

interface OptionChoice {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation: string;
}

export default function LiveDiagnosticSandbox() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasRunQuery, setHasRunQuery] = useState(false);

  const options: OptionChoice[] = [
    {
      id: "rank",
      label: "RANK() OVER (PARTITION BY dept ORDER BY salary DESC)",
      isCorrect: false,
      explanation: "Incorrect: RANK() skips ranks after ties (e.g., ties at rank 1 result in 1, 1, 3, skipping 2)."
    },
    {
      id: "dense_rank",
      label: "DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)",
      isCorrect: true,
      explanation: "Correct! DENSE_RANK() guarantees sequential ranks without gaps (e.g. 1, 1, 2) when duplicate values occur."
    },
    {
      id: "row_number",
      label: "ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC)",
      isCorrect: false,
      explanation: "Incorrect: ROW_NUMBER() assigns strictly unique integers (1, 2, 3) arbitrarily resolving ties."
    },
    {
      id: "ntile",
      label: "NTILE(4) OVER (PARTITION BY dept ORDER BY salary DESC)",
      isCorrect: false,
      explanation: "Incorrect: NTILE(4) divides rows into 4 equal quartiles rather than evaluating ordinal rank."
    }
  ];

  const selectedData = options.find((o) => o.id === selectedOption);

  const sampleRows = [
    { employee: "Alex Rivera", dept: "Marketing", salary: "$95,000", rankVal: "1", denseRankVal: "1", rowNumVal: "1" },
    { employee: "Elena Chen", dept: "Marketing", salary: "$95,000", rankVal: "1", denseRankVal: "1", rowNumVal: "2" },
    { employee: "Marcus Vance", dept: "Marketing", salary: "$88,000", rankVal: "3 (Skipped 2!)", denseRankVal: "2 (No Gap!)", rowNumVal: "3" },
    { employee: "Sophia Patel", dept: "Marketing", salary: "$82,000", rankVal: "4", denseRankVal: "3", rowNumVal: "4" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#38BDF8] block">
            INTERACTIVE EDTECH SANDBOX
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
            Test Your Knowledge in Real Time
          </h2>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
          SQL Window Functions Lab
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Question Card (with 3D Tilt) */}
        <div className="lg:col-span-7">
          <Card3DTilt className="space-y-5 bg-[#121824] border-[#27303B]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#38BDF8] flex items-center gap-1.5">
                <Database className="h-4 w-4" />
                <span>Diagnostic Checkpoint #3</span>
              </span>
              <span className="text-[11px] font-semibold text-[#94A3B8]">
                Estimated time: 45 sec
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#F5F7FA] leading-snug">
              In PostgreSQL & BigQuery, which window function produces sequential ranks without skipping numbers when ties occur?
            </h3>

            {/* Selectable Options */}
            <div className="space-y-2.5">
              {options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSelectedOption(opt.id);
                      setHasRunQuery(true);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-mono transition-all flex items-center justify-between ${
                      isSelected
                        ? opt.isCorrect
                          ? "bg-[#10B981]/15 border-[#10B981] text-[#F5F7FA]"
                          : "bg-[#F43F5E]/15 border-[#F43F5E] text-[#F5F7FA]"
                        : "bg-[#0D121A] border-[#27303B] text-[#94A3B8] hover:border-[#38BDF8]/50 hover:text-[#F5F7FA]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      opt.isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 ml-2" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-[#F43F5E] shrink-0 ml-2" />
                      )
                    )}
                  </button>
                );
              })}
            </div>

            {/* Live Explanation Pill */}
            {selectedData && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-1.5 animate-in fade-in ${
                  selectedData.isCorrect
                    ? "bg-[#10B981]/10 border-[#10B981]/40 text-[#F5F7FA]"
                    : "bg-[#F43F5E]/10 border-[#F43F5E]/40 text-[#F5F7FA]"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className={selectedData.isCorrect ? "text-[#10B981]" : "text-[#F43F5E]"}>
                    {selectedData.isCorrect ? "✓ Mastered Concept (+15 XP)" : "Misconception Detected"}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-[#94A3B8]">
                    Socratic Diagnostic
                  </span>
                </div>
                <p className="text-[#B4BDC8] leading-relaxed">
                  {selectedData.explanation}
                </p>
              </div>
            )}
          </Card3DTilt>
        </div>

        {/* Right Column: Interactive SQL Simulation Output */}
        <div className="lg:col-span-5">
          <Card3DTilt className="space-y-4 bg-[#0F141E] border-[#27303B]">
            <div className="flex items-center justify-between border-b border-[#27303B] pb-3">
              <span className="text-xs font-mono font-bold text-[#F5F7FA] flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                query_sandbox.sql
              </span>
              <button
                onClick={() => {
                  setSelectedOption("dense_rank");
                  setHasRunQuery(true);
                }}
                className="text-[11px] font-semibold text-[#38BDF8] hover:underline flex items-center gap-1"
              >
                <Play className="h-3 w-3" />
                <span>Simulate Query</span>
              </button>
            </div>

            {/* SQL Code Block */}
            <div className="p-3.5 rounded-xl bg-[#080B10] border border-[#27303B] font-mono text-[11px] text-[#B4BDC8] leading-relaxed">
              <span className="text-[#38BDF8]">SELECT</span> employee, dept, salary,<br />
              &nbsp;&nbsp;<span className="text-[#10B981] font-bold">DENSE_RANK()</span> <span className="text-[#38BDF8]">OVER</span> (<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#FBBF24]">PARTITION BY</span> dept <span className="text-[#FBBF24]">ORDER BY</span> salary <span className="text-[#FBBF24]">DESC</span><br />
              &nbsp;&nbsp;) <span className="text-[#38BDF8]">AS</span> dept_salary_rank<br />
              <span className="text-[#38BDF8]">FROM</span> employees;
            </div>

            {/* Live Dataset Output Table */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                Execution Output Result (4 Rows):
              </span>
              <div className="overflow-x-auto rounded-xl border border-[#27303B] bg-[#0A0E15]">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-[#121822] text-[#94A3B8] border-b border-[#27303B]">
                    <tr>
                      <th className="p-2">Employee</th>
                      <th className="p-2">Salary</th>
                      <th className="p-2 text-[#38BDF8]">DENSE_RANK</th>
                      <th className="p-2 text-[#94A3B8]">RANK()</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27303B] text-[#F5F7FA]">
                    {sampleRows.map((r, i) => (
                      <tr key={i} className="hover:bg-[#151C28]">
                        <td className="p-2">{r.employee}</td>
                        <td className="p-2 text-[#94A3B8]">{r.salary}</td>
                        <td className="p-2 font-bold text-[#10B981]">{r.denseRankVal}</td>
                        <td className="p-2 text-[#94A3B8]">{r.rankVal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">Want to solve 100+ real problem sets?</span>
              <Link
                href="/practice"
                className="font-bold text-[#38BDF8] hover:underline flex items-center gap-1"
              >
                <span>Launch Practice Lab</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Card3DTilt>
        </div>
      </div>
    </div>
  );
}
