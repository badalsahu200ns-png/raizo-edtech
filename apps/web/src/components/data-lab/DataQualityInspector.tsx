"use client";

import React, { useState } from "react";
import { DataQualityAudit } from "@/lib/types";

interface DataQualityInspectorProps {
  quality: DataQualityAudit;
  onQuickCleanAction?: (actionType: "remove_duplicates" | "trim_whitespace") => void;
}

export const DataQualityInspector: React.FC<DataQualityInspectorProps> = ({
  quality,
  onQuickCleanAction
}) => {
  const [activeTab, setActiveTab] = useState<"duplicates" | "missing" | "casing" | "outliers">("duplicates");

  return (
    <div className="bg-[#151B23] rounded-3xl p-6 md:p-8 border border-[#27303B] shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#5B8DEF]/10 text-[#5B8DEF]">
              Step 4
            </span>
            <h3 className="text-xl font-bold text-[#F5F7FA]">
              Data Quality & Hygiene Audit
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Automated diagnostic scans detecting duplicate rows, missing entries, casing fragmentation, and statistical outlier fences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-gray-500">Hygiene Health Score</div>
            <div className="text-xl font-black text-[#F5F7FA]">
              {quality.data_health_score} <span className="text-xs font-normal text-gray-400">/ 100</span>
            </div>
          </div>
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              quality.data_health_score >= 80
                ? "bg-emerald-500 shadow-sm shadow-emerald-200"
                : quality.data_health_score >= 60
                ? "bg-amber-500 shadow-sm shadow-amber-200"
                : "bg-red-500 shadow-sm shadow-red-200"
            }`}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#27303B] gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("duplicates")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === "duplicates"
              ? "border-[#5B8DEF] text-[#5B8DEF]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <span>Duplicate Records</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              quality.duplicate_rows_count > 0
                ? "bg-red-100 text-red-700 font-bold"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {quality.duplicate_rows_count}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("missing")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === "missing"
              ? "border-[#5B8DEF] text-[#5B8DEF]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <span>Missing Values</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              quality.total_missing_cells > 0
                ? "bg-amber-100 text-amber-800 font-bold"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {quality.total_missing_cells} cells
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("casing")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === "casing"
              ? "border-[#5B8DEF] text-[#5B8DEF]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <span>Casing & Inconsistencies</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              quality.casing_inconsistencies.length > 0
                ? "bg-purple-100 text-purple-700 font-bold"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {quality.casing_inconsistencies.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("outliers")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === "outliers"
              ? "border-[#5B8DEF] text-[#5B8DEF]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <span>Outliers (Tukey IQR)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              quality.outliers_detected.length > 0
                ? "bg-blue-100 text-blue-700 font-bold"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {quality.outliers_detected.length} cols
          </span>
        </button>
      </div>

      {/* Tab 1: Duplicates */}
      {activeTab === "duplicates" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#11161D] border border-[#27303B] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#F5F7FA]">
                {quality.duplicate_rows_count > 0
                  ? `${quality.duplicate_rows_count} Identical Duplicate Rows Found (${quality.duplicate_rows_percentage}%)`
                  : "Zero Duplicate Records Detected"}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                Exact duplicates occur when every single cell in a row matches an earlier row. In transactional analytics, duplicate rows artificially double revenue and distort statistical variance.
              </p>
            </div>

            {quality.duplicate_rows_count > 0 && onQuickCleanAction && (
              <button
                type="button"
                onClick={() => onQuickCleanAction("remove_duplicates")}
                className="px-4 py-2 bg-[#5B8DEF] hover:bg-[#135447] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 whitespace-nowrap self-start md:self-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Remove {quality.duplicate_rows_count} Duplicates (Clean)</span>
              </button>
            )}
          </div>

          {quality.duplicate_rows_count > 0 && (
            <div className="border border-red-200 bg-red-50/40 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                <span>Row Indices Flagged as Duplicates:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quality.duplicate_sample_indices.map(idx => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-[#151B23] border border-red-200 text-xs font-mono font-bold text-red-700 shadow-2xs"
                  >
                    Row #{idx + 1}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Educational Callout */}
          <div className="p-4 rounded-2xl bg-[#151B23] border border-[#27303B] text-xs text-gray-600 space-y-1">
            <span className="font-bold text-[#F5F7FA]">When is a duplicate NOT an error?</span>
            <p className="leading-relaxed">
              If your dataset does NOT possess unique primary keys (e.g. anonymous point-of-sale cash purchases of standard $5 coffee), identical rows could genuinely represent two independent customers. Always verify business domain context before discarding data!
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Missing Values */}
      {activeTab === "missing" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#11161D] border border-[#27303B]">
            <h4 className="text-sm font-bold text-[#F5F7FA]">
              Missing Value Landscape ({quality.total_missing_cells} cells, {quality.missing_cells_percentage}% of total cells)
            </h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Missing values occur in three distinct statistical regimes: <span className="font-semibold text-[#F5F7FA]">MCAR</span> (Completely at Random), <span className="font-semibold text-[#F5F7FA]">MAR</span> (At Random), or <span className="font-semibold text-[#F5F7FA]">MNAR</span> (Not at Random). Deleting entire rows can introduce systematic bias if missingness is correlated with customer churn or lower income.
            </p>
          </div>

          {quality.columns_with_missing.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-center text-xs text-emerald-800 font-semibold">
              🎉 Zero missing values detected across all columns in this dataset!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quality.columns_with_missing.map(item => (
                <div
                  key={item.column}
                  className="p-4 rounded-2xl bg-[#151B23] border border-[#27303B] flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-[#F5F7FA]">{item.column}</span>
                    <p className="text-[11px] text-gray-500">
                      Sample missing row indices: {item.sample_row_indices.map(i => `#${i + 1}`).join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 font-mono">
                      {item.missing_count} missing ({item.missing_percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Casing & Inconsistencies */}
      {activeTab === "casing" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#11161D] border border-[#27303B]">
            <h4 className="text-sm font-bold text-[#F5F7FA]">
              Categorical Casing Inconsistencies ({quality.casing_inconsistencies.length} columns affected)
            </h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              When humans enter data without strict dropdown controls, capitalization differences like <span className="font-mono bg-[#151B23] px-1 py-0.5 rounded border border-gray-200">Month-to-month</span> vs. <span className="font-mono bg-[#151B23] px-1 py-0.5 rounded border border-gray-200">month-to-month</span> split single categories into fragmented bars during visualization.
            </p>
          </div>

          {quality.casing_inconsistencies.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-center text-xs text-emerald-800 font-semibold">
              ✨ No casing fragmentation found. All text dimensions exhibit uniform casing.
            </div>
          ) : (
            <div className="space-y-3">
              {quality.casing_inconsistencies.map(item => (
                <div key={item.column} className="p-4 rounded-2xl bg-[#151B23] border border-[#27303B] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#F5F7FA]">
                      Column: <span className="text-[#5B8DEF]">{item.column}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      {item.variants.length} variant group(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.variants.map((v, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                        <span className="text-gray-500 text-[10px]">Conflicting spellings:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {v.original_variants.map((orig, i) => (
                            <span key={i} className="font-mono px-1.5 py-0.5 rounded bg-[#151B23] border border-gray-300 text-gray-800 text-[11px]">
                              "{orig}"
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                          Recommended Standard: "{v.clean}" ({v.count} occurrences)
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Outliers */}
      {activeTab === "outliers" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#11161D] border border-[#27303B]">
            <h4 className="text-sm font-bold text-[#F5F7FA]">
              Tukey IQR Outlier Bounds ({quality.outliers_detected.length} columns with extreme values)
            </h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Using the standard Tukey rule: any value falling below <span className="font-mono font-semibold">Q1 - 1.5×IQR</span> or above <span className="font-mono font-semibold">Q3 + 1.5×IQR</span> is audited as an outlier.
            </p>
          </div>

          {quality.outliers_detected.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-center text-xs text-emerald-800 font-semibold">
              🎯 No extreme IQR outliers detected in numeric dimensions.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quality.outliers_detected.map(item => (
                <div key={item.column} className="p-4 rounded-2xl bg-[#151B23] border border-[#27303B] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#F5F7FA]">{item.column}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 font-mono">
                      {item.count} outlier(s)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-2 rounded-xl">
                    <span>Lower Fence: <span className="font-mono font-bold">{item.lower_bound}</span></span>
                    <span>Upper Fence: <span className="font-mono font-bold">{item.upper_bound}</span></span>
                  </div>

                  <div className="text-[11px] text-gray-500">
                    <span>Sample outlier observations: </span>
                    <span className="font-mono font-bold text-red-600">
                      {item.sample_values.join(", ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
