"use client";

import React, { useState } from "react";
import { ColumnStats } from "@/lib/types";

interface ColumnInspectionTableProps {
  profiles: ColumnStats[];
}

export const ColumnInspectionTable: React.FC<ColumnInspectionTableProps> = ({ profiles }) => {
  const [selectedCol, setSelectedCol] = useState<ColumnStats | null>(null);

  return (
    <div className="bg-[#151B23] rounded-3xl p-6 md:p-8 border border-[#27303B] shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#5B8DEF]/10 text-[#5B8DEF]">
              Step 3
            </span>
            <h3 className="text-xl font-bold text-[#F5F7FA]">
              Column-by-Column Inspection & Schema Meaning
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Conservative schema interpretation grounded strictly in data attributes, sample distributions, and statistical variance.
          </p>
        </div>

        <span className="text-xs font-semibold text-gray-500 bg-[#11161D] px-3 py-1.5 rounded-xl border border-[#27303B]">
          {profiles.length} Total Columns Profiled
        </span>
      </div>

      {/* Main Inspection Table */}
      <div className="overflow-x-auto border border-[#27303B] rounded-2xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#11161D] text-gray-700 font-semibold border-b border-[#27303B]">
            <tr>
              <th className="py-3 px-4">Column Name</th>
              <th className="py-3 px-4">Inferred Type</th>
              <th className="py-3 px-4">Analytical Meaning</th>
              <th className="py-3 px-4 text-center">Missing</th>
              <th className="py-3 px-4 text-center">Uniques</th>
              <th className="py-3 px-4">Sample Values</th>
              <th className="py-3 px-4 text-right">Deep Dive</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-sans">
            {profiles.map(col => {
              const hasMissing = col.missing_count > 0;

              return (
                <tr key={col.name} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#F5F7FA] whitespace-nowrap">
                    {col.name}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium text-[11px] ${
                        col.inferred_type === "numeric"
                          ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                          : col.inferred_type === "datetime"
                          ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                          : col.inferred_type === "categorical"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : col.inferred_type === "boolean"
                          ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {col.inferred_type}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-gray-700 max-w-xs leading-relaxed">
                    {col.semantic_meaning}
                  </td>

                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {hasMissing ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                        <span>{col.missing_count}</span>
                        <span className="text-[10px] text-red-500">({col.missing_percentage}%)</span>
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium text-[11px] inline-flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>0%</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center font-mono text-gray-800 whitespace-nowrap">
                    {col.unique_count.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 text-gray-600 max-w-sm">
                    <div className="flex flex-wrap gap-1">
                      {col.sample_values.slice(0, 3).map((val, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono text-gray-700 truncate max-w-[120px]"
                        >
                          {String(val)}
                        </span>
                      ))}
                      {col.sample_values.length > 3 && (
                        <span className="text-[10px] text-gray-400 self-center">
                          +{col.sample_values.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedCol(col)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#5B8DEF] hover:text-[#135447] hover:bg-[#5B8DEF]/10 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <span>Stats</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected Column Diagnostic Modal / Drawer */}
      {selectedCol && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedCol(null)}
        >
          <div
            className="bg-[#151B23] rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-[#27303B] space-y-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                    {selectedCol.inferred_type}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">Column Diagnostic</span>
                </div>
                <h4 className="text-xl font-bold text-[#F5F7FA] mt-1">{selectedCol.name}</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCol(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Semantic Meaning */}
            <div className="p-4 rounded-2xl bg-[#11161D] border border-[#27303B]">
              <span className="text-xs font-bold text-[#F5F7FA]">Analytical Role:</span>
              <p className="text-xs text-gray-700 mt-1 leading-relaxed">{selectedCol.semantic_meaning}</p>
            </div>

            {/* If Numeric: Descriptive Stats Breakdown */}
            {selectedCol.numeric_stats && (
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Parametric & Non-Parametric Metrics
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-500">Mean</span>
                    <p className="text-sm font-bold text-gray-900 font-mono">
                      {selectedCol.numeric_stats.mean.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-500">Median (Q2)</span>
                    <p className="text-sm font-bold text-gray-900 font-mono">
                      {selectedCol.numeric_stats.median.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-500">Std Deviation</span>
                    <p className="text-sm font-bold text-gray-900 font-mono">
                      {selectedCol.numeric_stats.std.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-500">Interquartile (IQR)</span>
                    <p className="text-sm font-bold text-gray-900 font-mono">
                      {selectedCol.numeric_stats.iqr.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-500">Min</span>
                    <p className="text-sm font-bold text-gray-900 font-mono">
                      {selectedCol.numeric_stats.min.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-500">Max</span>
                    <p className="text-sm font-bold text-gray-900 font-mono">
                      {selectedCol.numeric_stats.max.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-500">Q1 (25th %)</span>
                    <p className="text-sm font-bold text-gray-900 font-mono">
                      {selectedCol.numeric_stats.q1.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-500">Q3 (75th %)</span>
                    <p className="text-sm font-bold text-gray-900 font-mono">
                      {selectedCol.numeric_stats.q3.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Skewness Callout */}
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 text-xs text-blue-900">
                  <span className="font-semibold">Distribution Shape: </span>
                  <span>{selectedCol.numeric_stats.skewness}.</span>
                  {selectedCol.numeric_stats.outliers_count > 0 && (
                    <span className="block text-red-700 font-semibold mt-1">
                      ⚠️ {selectedCol.numeric_stats.outliers_count} IQR outlier(s) detected beyond Tukey bounds.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* If Categorical: Frequency Breakdown */}
            {selectedCol.top_categories && selectedCol.top_categories.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Top Distinct Frequencies
                </h5>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedCol.top_categories.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50">
                      <span className="font-medium text-gray-800">{cat.value}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-mono">{cat.count}</span>
                        <span className="px-1.5 py-0.5 bg-[#5B8DEF]/10 text-[#5B8DEF] font-bold rounded text-[10px]">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCol(null)}
                className="px-5 py-2 bg-[#5B8DEF] hover:bg-[#135447] text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Close Diagnostic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
