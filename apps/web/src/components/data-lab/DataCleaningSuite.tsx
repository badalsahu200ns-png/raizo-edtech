"use client";

import React, { useState } from "react";
import {
  ParsedDataset,
  DatasetAnalysis,
  CleaningAction,
  CleaningTransformation
} from "@/lib/types";

interface DataCleaningSuiteProps {
  workingDataset: ParsedDataset;
  originalDataset: ParsedDataset;
  analysis: DatasetAnalysis;
  transformations: CleaningTransformation[];
  onApplyAction: (action: CleaningAction) => void;
  onResetToOriginal: () => void;
  isProcessing: boolean;
}

export const DataCleaningSuite: React.FC<DataCleaningSuiteProps> = ({
  workingDataset,
  originalDataset,
  analysis,
  transformations,
  onApplyAction,
  onResetToOriginal,
  isProcessing
}) => {
  // Imputation form state
  const [imputeCol, setImputeCol] = useState<string>(
    analysis.quality_audit.columns_with_missing[0]?.column || workingDataset.columns[0] || ""
  );
  const [imputeMethod, setImputeMethod] = useState<"median" | "mean" | "mode" | "drop_row">("median");

  // Casing form state
  const [casingCol, setCasingCol] = useState<string>(
    analysis.quality_audit.casing_inconsistencies[0]?.column ||
      analysis.column_profiles.find(p => p.inferred_type === "categorical")?.name ||
      workingDataset.columns[0] ||
      ""
  );
  const [casingType, setCasingType] = useState<"title" | "lower" | "upper">("title");

  // Outlier form state
  const [outlierCol, setOutlierCol] = useState<string>(
    analysis.quality_audit.outliers_detected[0]?.column ||
      analysis.column_profiles.find(p => p.inferred_type === "numeric")?.name ||
      ""
  );

  const hasDuplicates = analysis.quality_audit.duplicate_rows_count > 0;
  const hasMissing = analysis.quality_audit.total_missing_cells > 0;
  const hasCasing = analysis.quality_audit.casing_inconsistencies.length > 0;
  const hasOutliers = analysis.quality_audit.outliers_detected.length > 0;

  const handleApplyImpute = () => {
    if (!imputeCol) return;
    onApplyAction({
      action: "impute_missing",
      column: imputeCol,
      method: imputeMethod
    });
  };

  const handleApplyCasing = () => {
    if (!casingCol) return;
    onApplyAction({
      action: "standardize_casing",
      column: casingCol,
      casing: casingType
    });
  };

  const handleApplyOutlier = () => {
    if (!outlierCol) return;
    onApplyAction({
      action: "cap_outliers",
      column: outlierCol,
      outlier_treatment: "winsorize"
    });
  };

  return (
    <div className="bg-[#151B23] rounded-3xl p-6 md:p-8 border border-[#27303B] shadow-sm space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#5B8DEF]/10 text-[#5B8DEF]">
              Step 5
            </span>
            <h3 className="text-xl font-bold text-[#F5F7FA]">
              Guided Data Cleaning Suite
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Execute professional data sanitization with full audit transparency and 100% reversible rollbacks.
          </p>
        </div>

        {transformations.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              ✓ {transformations.length} Transform(s) Applied
            </span>
            <button
              type="button"
              onClick={onResetToOriginal}
              disabled={isProcessing}
              className="px-4 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors shadow-2xs"
            >
              Reset to Original
            </button>
          </div>
        )}
      </div>

      {/* Cleaning Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Action 1: Deduplication */}
        <div className="p-5 rounded-2xl bg-[#11161D] border border-[#27303B] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                1. Deduplication
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  hasDuplicates ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {hasDuplicates ? `${analysis.quality_audit.duplicate_rows_count} Duplicates` : "Clean"}
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#F5F7FA] mt-1">
              Remove Identical Rows
            </h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Scans all column signatures and purges redundant row submissions while preserving first occurrence.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onApplyAction({ action: "remove_duplicates" })}
            disabled={!hasDuplicates || isProcessing}
            className="w-full py-2.5 px-4 bg-[#5B8DEF] hover:bg-[#135447] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>{hasDuplicates ? `Purge ${analysis.quality_audit.duplicate_rows_count} Duplicates` : "No Duplicates Found"}</span>
          </button>
        </div>

        {/* Action 2: Whitespace Trimming */}
        <div className="p-5 rounded-2xl bg-[#11161D] border border-[#27303B] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                2. Whitespace Trimming
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                Universal Text Clean
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#F5F7FA] mt-1">
              Trim Leading & Trailing Spaces
            </h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Removes invisible padding spaces from all string columns to resolve broken SQL joins and Excel lookup mismatches.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onApplyAction({ action: "trim_whitespace" })}
            disabled={isProcessing}
            className="w-full py-2.5 px-4 bg-[#5B8DEF] hover:bg-[#135447] disabled:bg-gray-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Trim All Whitespace</span>
          </button>
        </div>

        {/* Action 3: Missing Value Imputation */}
        <div className="p-5 rounded-2xl bg-[#11161D] border border-[#27303B] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                3. Imputation Strategy
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  hasMissing ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {hasMissing ? `${analysis.quality_audit.total_missing_cells} Missing Cells` : "Clean"}
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#F5F7FA] mt-1">
              Handle Missing Values
            </h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Impute null cells with central tendency metrics or drop affected rows based on analytical strategy.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">Target Column</label>
                <select
                  value={imputeCol}
                  onChange={e => setImputeCol(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-gray-300 bg-[#151B23] font-medium"
                >
                  {workingDataset.columns.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">Method</label>
                <select
                  value={imputeMethod}
                  onChange={e => setImputeMethod(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-xl border border-gray-300 bg-[#151B23] font-medium"
                >
                  <option value="median">Median (Safe for Outliers)</option>
                  <option value="mean">Mean (Arithmetic Average)</option>
                  <option value="mode">Mode (Most Frequent)</option>
                  <option value="drop_row">Drop Rows With Missing</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyImpute}
            disabled={!hasMissing || isProcessing}
            className="w-full py-2.5 px-4 bg-[#5B8DEF] hover:bg-[#135447] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            Apply Imputation to {imputeCol}
          </button>
        </div>

        {/* Action 4: Casing Standardization */}
        <div className="p-5 rounded-2xl bg-[#11161D] border border-[#27303B] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                4. Casing Normalization
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  hasCasing ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {hasCasing ? `${analysis.quality_audit.casing_inconsistencies.length} Inconsistent` : "Clean"}
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#F5F7FA] mt-1">
              Standardize Text Capitalization
            </h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Consolidates fragmented category groupings by transforming text values into uniform title or lower casing.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">Text Column</label>
                <select
                  value={casingCol}
                  onChange={e => setCasingCol(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-gray-300 bg-[#151B23] font-medium"
                >
                  {workingDataset.columns.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1">Target Format</label>
                <select
                  value={casingType}
                  onChange={e => setCasingType(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-xl border border-gray-300 bg-[#151B23] font-medium"
                >
                  <option value="title">Title Case (e.g. Technology)</option>
                  <option value="lower">lowercase (e.g. technology)</option>
                  <option value="upper">UPPERCASE (e.g. TECHNOLOGY)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyCasing}
            disabled={isProcessing}
            className="w-full py-2.5 px-4 bg-[#5B8DEF] hover:bg-[#135447] disabled:bg-gray-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            Apply Casing to {casingCol}
          </button>
        </div>
      </div>

      {/* Transformations Audit Trail */}
      {transformations.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Transformation Audit Trail ("What Changed?" & "Why Recommended?")
          </h4>
          <div className="divide-y divide-gray-100 border border-[#27303B] rounded-2xl overflow-hidden">
            {transformations.map((trans, idx) => (
              <div key={idx} className="p-4 bg-[#151B23] flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-xs text-[#F5F7FA]">{trans.title}</span>
                    <span className="text-[10px] text-gray-400 font-mono">({trans.timestamp})</span>
                  </div>
                  <p className="text-xs text-gray-700 font-medium">{trans.what_changed}</p>
                  <p className="text-[11px] text-[#5B8DEF] font-semibold bg-[#5B8DEF]/5 p-2 rounded-lg border border-[#5B8DEF]/10">
                    💡 <span className="underline">Why Recommended:</span> {trans.why_recommended}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-gray-100 text-gray-700 self-start">
                  {trans.affected_count} affected
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
