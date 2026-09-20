"use client";

import React, { useState } from "react";
import { DatasetAnalysis, CorrelationPair } from "@/lib/types";

interface RelationshipExplorerProps {
  analysis: DatasetAnalysis;
}

export const RelationshipExplorer: React.FC<RelationshipExplorerProps> = ({ analysis }) => {
  const { correlation_matrix } = analysis;
  const { columns, matrix, top_relationships } = correlation_matrix;

  const [selectedPair, setSelectedPair] = useState<CorrelationPair | null>(
    top_relationships[0] || null
  );

  if (columns.length < 2) {
    return (
      <div className="bg-[#151B23] rounded-3xl p-6 md:p-8 border border-[#27303B] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#5B8DEF]/10 text-[#5B8DEF]">
            Step 6
          </span>
          <h3 className="text-xl font-bold text-[#F5F7FA]">
            Relationship & Correlation Explorer
          </h3>
        </div>
        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-center text-xs text-gray-500">
          This dataset contains fewer than 2 continuous numeric dimensions. Pairwise Pearson correlation matrices require at least two numeric variables.
        </div>
      </div>
    );
  }

  // Helper color for correlation heatmap cells
  const getCellColor = (val: number | null) => {
    if (val === null || val === undefined) return "bg-gray-100 text-gray-400";
    if (val === 1.0) return "bg-[#5B8DEF] text-white font-bold";
    if (val > 0.6) return "bg-emerald-500 text-white font-bold";
    if (val > 0.3) return "bg-emerald-200 text-emerald-900 font-semibold";
    if (val > 0.05) return "bg-emerald-50 text-emerald-800";
    if (val >= -0.05) return "bg-gray-50 text-gray-700";
    if (val >= -0.3) return "bg-rose-50 text-rose-800";
    if (val >= -0.6) return "bg-rose-200 text-rose-900 font-semibold";
    return "bg-rose-500 text-white font-bold";
  };

  const handleSelectCell = (c1: string, c2: string) => {
    if (c1 === c2) return;
    const pair = top_relationships.find(
      p => (p.col1 === c1 && p.col2 === c2) || (p.col1 === c2 && p.col2 === c1)
    );
    if (pair) {
      setSelectedPair(pair);
    }
  };

  return (
    <div className="bg-[#151B23] rounded-3xl p-6 md:p-8 border border-[#27303B] shadow-sm space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#5B8DEF]/10 text-[#5B8DEF]">
              Step 6
            </span>
            <h3 className="text-xl font-bold text-[#F5F7FA]">
              Non-Causal Relationship & Correlation Explorer
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Analyze pairwise linear co-movement using Pearson's correlation coefficient (<span className="font-mono italic">r</span>) with strict non-causal interpretations.
          </p>
        </div>

        <span className="text-xs font-semibold text-[#5B8DEF] bg-[#5B8DEF]/10 px-3 py-1.5 rounded-xl">
          {columns.length} Continuous Numeric Dimensions Evaluated
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Heatmap Matrix (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Pearson Correlation Matrix Heatmap
            </h4>
            <span className="text-[11px] text-gray-400">Click any off-diagonal cell to inspect</span>
          </div>

          <div className="overflow-x-auto border border-[#27303B] rounded-2xl p-2 bg-gray-50/40">
            <table className="w-full text-center border-collapse text-xs font-mono">
              <thead>
                <tr>
                  <th className="p-2 text-left font-sans text-[11px] text-gray-400"></th>
                  {columns.map(col => (
                    <th
                      key={col}
                      className="p-2 font-bold text-gray-700 text-[11px] truncate max-w-[90px]"
                      title={col}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {columns.map(rowCol => (
                  <tr key={rowCol}>
                    <td
                      className="p-2 text-left font-sans font-bold text-gray-700 text-[11px] truncate max-w-[100px]"
                      title={rowCol}
                    >
                      {rowCol}
                    </td>
                    {columns.map(colCol => {
                      const r = matrix[rowCol]?.[colCol];
                      const isSelf = rowCol === colCol;
                      const isSelected =
                        selectedPair &&
                        ((selectedPair.col1 === rowCol && selectedPair.col2 === colCol) ||
                          (selectedPair.col1 === colCol && selectedPair.col2 === rowCol));

                      return (
                        <td
                          key={colCol}
                          onClick={() => handleSelectCell(rowCol, colCol)}
                          className={`p-2 rounded-lg transition-all select-none ${getCellColor(
                            r
                          )} ${
                            !isSelf ? "cursor-pointer hover:ring-2 hover:ring-[#176B5B]" : "opacity-90"
                          } ${isSelected ? "ring-2 ring-black font-black scale-105 shadow-md" : ""}`}
                          title={`${rowCol} vs ${colCol}: r = ${r !== null ? r : "N/A"}`}
                        >
                          {r !== null && r !== undefined ? (r > 0 && r !== 1 ? `+${r}` : r) : "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Color Scale Legend */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500" />
              <span>Strong Negative (-1.0)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-gray-100 border border-gray-300" />
              <span>Zero (0.0)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#5B8DEF]" />
              <span>Strong Positive (+1.0)</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Pair Deep-Dive Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Selected Pair Analytical Review
          </h4>

          {selectedPair ? (
            <div className="p-6 rounded-2xl bg-[#11161D] border border-[#27303B] space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Pairwise Bivariate
                  </span>
                  <h5 className="text-base font-bold text-[#F5F7FA] mt-0.5">
                    {selectedPair.col1} ↔ {selectedPair.col2}
                  </h5>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-[#F5F7FA]">
                    {selectedPair.r > 0 ? `+${selectedPair.r}` : selectedPair.r}
                  </span>
                  <div className="text-[10px] font-semibold text-[#5B8DEF]">
                    {selectedPair.strength} {selectedPair.direction}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#151B23] border border-[#27303B] space-y-1">
                <span className="text-xs font-bold text-gray-800">Interpretation:</span>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {selectedPair.description}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <span>⚠️ Non-Causal Caveat:</span>
                </span>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {selectedPair.caveat}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#11161D] border border-[#27303B] text-center text-xs text-gray-500">
              Select any relationship from the heatmap to view statistical breakdown.
            </div>
          )}

          {/* Educational Guide Card */}
          <div className="p-4 rounded-2xl bg-[#151B23] border border-[#27303B] text-xs text-gray-700 space-y-2">
            <span className="font-bold text-[#F5F7FA] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B8DEF]" />
              Executive Guide: How to Talk About Correlation
            </span>
            <ul className="list-disc list-inside space-y-1 text-gray-600 text-[11px] leading-relaxed">
              <li>
                <strong>Never say:</strong> "Increasing discounts caused profits to decline."
              </li>
              <li>
                <strong>Always say:</strong> "We observe a moderate negative correlation (r = -0.42) between discounts and profit margin."
              </li>
              <li>
                <strong>Executive takeaway:</strong> Correlation implies shared linear movement; controlled experimentation is required to prove causality.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
