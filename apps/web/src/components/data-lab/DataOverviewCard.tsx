"use client";

import React, { useState, useMemo } from "react";
import { ParsedDataset, DatasetAnalysis } from "@/lib/types";
import { exportDatasetToCSV } from "@/lib/dataLabEngine";

interface DataOverviewCardProps {
  originalDataset: ParsedDataset;
  workingDataset: ParsedDataset;
  analysis: DatasetAnalysis;
  isCleaned: boolean;
  onResetToOriginal?: () => void;
}

export const DataOverviewCard: React.FC<DataOverviewCardProps> = ({
  originalDataset,
  workingDataset,
  analysis,
  isCleaned,
  onResetToOriginal
}) => {
  const [viewMode, setViewMode] = useState<"working" | "original">("working");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const activeDataset = viewMode === "original" ? originalDataset : workingDataset;

  // Filtering and sorting
  const filteredRows = useMemo(() => {
    let rows = activeDataset.rows;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter(r =>
        activeDataset.columns.some(col => String(r[col] ?? "").toLowerCase().includes(q))
      );
    }

    if (sortColumn) {
      rows = [...rows].sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortDirection === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return rows;
  }, [activeDataset, searchTerm, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortColumn(null);
      }
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  const handleDownloadCSV = () => {
    const csvContent = exportDatasetToCSV(activeDataset.columns, activeDataset.rows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${activeDataset.filename.replace(/\.[^/.]+$/, "")}_${viewMode === "original" ? "raw" : "cleaned"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const numNumeric = analysis.column_profiles.filter(p => p.inferred_type === "numeric").length;
  const numCategorical = analysis.column_profiles.filter(p => p.inferred_type === "categorical").length;
  const numDatetime = analysis.column_profiles.filter(p => p.inferred_type === "datetime").length;

  return (
    <div className="space-y-6">
      {/* 1. Semantic Explanation & Health Overview */}
      <div className="bg-[#151B23] rounded-3xl p-6 md:p-8 border border-[#27303B] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#5B8DEF]/10 text-[#5B8DEF]">
                Dataset Intelligence
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs font-mono text-gray-500">{activeDataset.filename}</span>
            </div>

            <h2 className="text-2xl font-black text-[#F5F7FA] tracking-tight">
              What Does This Dataset Tell Us?
            </h2>

            <p className="text-sm text-gray-700 leading-relaxed max-w-4xl">
              {analysis.dataset_summary.overview}
            </p>

            <div className="p-4 rounded-2xl bg-[#11161D] border border-[#27303B] space-y-1.5">
              <p className="text-xs font-bold text-[#F5F7FA] flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#5B8DEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Practical Decision-Making Context</span>
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                {analysis.dataset_summary.business_context} {analysis.dataset_summary.target_role_relevance}
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 min-w-[280px]">
            <div className="p-4 rounded-2xl bg-[#11161D] border border-[#27303B]/60 flex flex-col justify-center">
              <span className="text-xs text-gray-500 font-medium">Active Observations</span>
              <span className="text-2xl font-black text-[#F5F7FA] mt-1">
                {activeDataset.row_count.toLocaleString()}
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5">
                {isCleaned && viewMode === "working"
                  ? `${originalDataset.row_count - workingDataset.row_count} deduped`
                  : "Raw entries"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#11161D] border border-[#27303B]/60 flex flex-col justify-center">
              <span className="text-xs text-gray-500 font-medium">Dimensions (Cols)</span>
              <span className="text-2xl font-black text-[#F5F7FA] mt-1">
                {activeDataset.column_count}
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5">
                {numNumeric} num • {numCategorical} cat {numDatetime > 0 ? `• ${numDatetime} date` : ""}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#11161D] border border-[#27303B]/60 flex flex-col justify-center">
              <span className="text-xs text-gray-500 font-medium">Data Health</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black text-[#F5F7FA]">
                  {analysis.quality_audit.data_health_score}
                </span>
                <span className="text-xs font-bold text-gray-400">/ 100</span>
              </div>
              <span
                className={`text-[11px] font-semibold mt-0.5 ${
                  analysis.quality_audit.data_health_score >= 80
                    ? "text-emerald-600"
                    : analysis.quality_audit.data_health_score >= 60
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {analysis.quality_audit.health_label}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#11161D] border border-[#27303B]/60 flex flex-col justify-center">
              <span className="text-xs text-gray-500 font-medium">Quality Flags</span>
              <span className="text-2xl font-black text-[#F5F7FA] mt-1">
                {analysis.quality_audit.duplicate_rows_count +
                  analysis.quality_audit.columns_with_missing.length}
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5">
                {analysis.quality_audit.duplicate_rows_count} dups • {analysis.quality_audit.total_missing_cells} nulls
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Spreadsheet Table Card */}
      <div className="bg-[#151B23] rounded-3xl border border-[#27303B] overflow-hidden shadow-sm">
        {/* Table Controls Header */}
        <div className="p-5 border-b border-[#27303B] bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-bold text-[#F5F7FA]">
              Spreadsheet View
            </h3>

            {/* Toggle Raw vs Cleaned Dataset */}
            {isCleaned && (
              <div className="inline-flex rounded-xl p-1 bg-[#DDE1DD]/60 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setViewMode("working")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    viewMode === "working"
                      ? "bg-[#151B23] text-[#5B8DEF] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Working Cleaned ({workingDataset.row_count})
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("original")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    viewMode === "original"
                      ? "bg-[#151B23] text-[#5B8DEF] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Original Raw ({originalDataset.row_count})
                </button>
              </div>
            )}

            {isCleaned && onResetToOriginal && (
              <button
                type="button"
                onClick={onResetToOriginal}
                className="text-xs text-red-600 hover:text-red-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors"
                title="Discard cleaning transforms and revert to raw upload"
              >
                Reset to Original
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search values..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#176B5B]/30 focus:border-[#5B8DEF] bg-[#151B23] w-48"
              />
              <svg
                className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-gray-300 bg-[#151B23] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#176B5B]"
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
            </select>

            {/* Download CSV */}
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="px-3 py-1.5 bg-[#151B23] border border-[#27303B] hover:border-[#5B8DEF] text-gray-700 hover:text-[#5B8DEF] text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Scrollable Table Area */}
        <div className="overflow-x-auto max-h-[460px] border-b border-[#27303B]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#11161D] sticky top-0 z-10 text-gray-600 font-semibold border-b border-[#27303B]">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center text-gray-400 font-mono text-[10px] border-r border-[#27303B]/50">
                  #
                </th>
                {activeDataset.columns.map(col => {
                  const colStat = analysis.column_profiles.find(p => p.name === col);
                  const isSorted = sortColumn === col;

                  return (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className="py-2.5 px-3.5 cursor-pointer hover:bg-gray-200/50 transition-colors select-none border-r border-[#27303B]/50 whitespace-nowrap"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#F5F7FA]">{col}</span>
                        <div className="flex items-center gap-1">
                          {colStat && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                                colStat.inferred_type === "numeric"
                                  ? "bg-blue-50 text-blue-700"
                                  : colStat.inferred_type === "datetime"
                                  ? "bg-purple-50 text-purple-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {colStat.inferred_type.slice(0, 3)}
                            </span>
                          )}
                          <span className="text-gray-400 text-[10px]">
                            {isSorted ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
                          </span>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 font-sans">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeDataset.columns.length + 1}
                    className="py-8 text-center text-gray-400 text-xs italic"
                  >
                    No matching records found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, rowIdx) => {
                  const actualIndex = (currentPage - 1) * pageSize + rowIdx + 1;
                  return (
                    <tr
                      key={rowIdx}
                      className="hover:bg-gray-50/80 transition-colors even:bg-gray-50/20"
                    >
                      <td className="py-2 px-3 text-center text-gray-400 font-mono text-[10px] bg-gray-50/40 border-r border-[#27303B]/50">
                        {actualIndex}
                      </td>
                      {activeDataset.columns.map(col => {
                        const val = row[col];
                        const isNull = val === null || val === undefined || val === "";

                        return (
                          <td
                            key={col}
                            className={`py-2 px-3.5 border-r border-[#27303B]/40 whitespace-nowrap ${
                              isNull ? "bg-amber-50/60" : ""
                            }`}
                          >
                            {isNull ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-100 text-amber-800">
                                null
                              </span>
                            ) : typeof val === "number" ? (
                              <span className="font-mono text-gray-800">
                                {Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2)}
                              </span>
                            ) : typeof val === "boolean" ? (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  val ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {val ? "TRUE" : "FALSE"}
                              </span>
                            ) : (
                              <span className="text-gray-700 truncate max-w-[200px] inline-block align-bottom">
                                {String(val)}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 bg-[#11161D]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600">
          <div>
            Showing{" "}
            <span className="font-semibold text-[#F5F7FA]">
              {filteredRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-[#F5F7FA]">
              {Math.min(currentPage * pageSize, filteredRows.length)}
            </span>{" "}
            of <span className="font-semibold text-[#F5F7FA]">{filteredRows.length}</span> entries
            {searchTerm && ` (filtered from ${activeDataset.row_count} total)`}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-2.5 py-1 rounded-lg border border-gray-300 bg-[#151B23] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-xs font-semibold transition-colors"
            >
              Previous
            </button>
            <span className="px-2 font-mono text-xs">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-2.5 py-1 rounded-lg border border-gray-300 bg-[#151B23] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-xs font-semibold transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
