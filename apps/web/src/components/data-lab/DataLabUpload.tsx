"use client";

import React, { useState, useRef } from "react";
import { ParsedDataset, DatasetAnalysis } from "@/lib/types";
import {
  parseCSVString,
  analyzeDatasetLocally,
  SAMPLE_DATASETS,
  loadSampleDataset
} from "@/lib/dataLabEngine";
import { api } from "@/lib/api";

interface DataLabUploadProps {
  onDatasetLoaded: (dataset: ParsedDataset, analysis: DatasetAnalysis) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const DataLabUpload: React.FC<DataLabUploadProps> = ({
  onDatasetLoaded,
  isLoading,
  setIsLoading
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setUploadError(null);
    setIsLoading(true);

    const filename = file.name;
    const lowerName = filename.toLowerCase();

    try {
      if (lowerName.endsWith(".csv") || lowerName.endsWith(".txt")) {
        const text = await file.text();
        const { columns, rows } = parseCSVString(text);
        if (columns.length === 0 || rows.length === 0) {
          throw new Error("The file appears to be empty or contains no readable tabular data.");
        }
        const parsed: ParsedDataset = {
          filename,
          file_type: "csv",
          columns,
          rows,
          row_count: rows.length,
          column_count: columns.length
        };
        const analysis = analyzeDatasetLocally(parsed);
        onDatasetLoaded(parsed, analysis);
      } else if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
        try {
          const res = await api.uploadDataLabFile(file);
          if (res.success && res.parsed && res.analysis) {
            onDatasetLoaded(res.parsed, res.analysis);
          } else {
            throw new Error("Failed to parse Excel spreadsheet.");
          }
        } catch (apiErr: any) {
          throw new Error(
            apiErr.message ||
              "Could not parse Excel file. You can also export your sheet as .CSV for immediate instant loading."
          );
        }
      } else {
        throw new Error("Unsupported file format. Please upload a .CSV, .XLSX, or .XLS file.");
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to process dataset.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadSample = (sampleId: string) => {
    setUploadError(null);
    setIsLoading(true);
    try {
      const parsed = loadSampleDataset(sampleId);
      const analysis = analyzeDatasetLocally(parsed);
      onDatasetLoaded(parsed, analysis);
    } catch (err: any) {
      setUploadError(err.message || "Failed to load sample dataset.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Banner / Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 ${
          dragActive
            ? "border-[#5B8DEF] bg-[#5B8DEF]/10 shadow-xl scale-[1.01]"
            : "border-[#27303B] bg-[#151B23] hover:border-[#5B8DEF]/50 hover:bg-[#1A212B]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={handleFileChange}
          className="hidden"
          id="dataset-file-input"
        />

        <div className="max-w-xl mx-auto flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#5B8DEF]/15 text-[#5B8DEF] flex items-center justify-center">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#F5F7FA]">
              Drop your CSV or Excel dataset here
            </h3>
            <p className="text-sm text-[#B4BDC8] mt-1">
              Supports <span className="font-semibold text-[#5B8DEF]">.csv</span>,{" "}
              <span className="font-semibold text-[#5B8DEF]">.xlsx</span>, and{" "}
              <span className="font-semibold text-[#5B8DEF]">.xls</span> files up to 25MB
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="px-6 py-3 bg-[#5B8DEF] hover:bg-[#719DF5] active:bg-[#4779D8] text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>Processing Dataset...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Choose File from Device</span>
                </>
              )}
            </button>
          </div>

          {/* Privacy & Architecture Callout */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#B4BDC8] pt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11161D] border border-[#27303B] text-[#B4BDC8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B8DEF]" />
              Non-destructive (Original never overwritten)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11161D] border border-[#27303B] text-[#B4BDC8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#36C98F]" />
              Client-first instant audit
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11161D] border border-[#27303B] text-[#B4BDC8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2B84B]" />
              Zero data retained on public servers
            </span>
          </div>
        </div>

        {uploadError && (
          <div className="mt-6 p-4 rounded-xl bg-[#E86A6A]/10 border border-[#E86A6A]/30 text-[#E86A6A] text-sm max-w-lg mx-auto flex items-start gap-3 text-left">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#E86A6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Unable to process dataset</p>
              <p className="text-xs text-[#E86A6A]/80 mt-0.5">{uploadError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Pre-loaded Sample Datasets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-[#F5F7FA] flex items-center gap-2">
              <span>Or explore with curated instructional datasets</span>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#5B8DEF]/15 text-[#5B8DEF] border border-[#5B8DEF]/20 rounded-md">
                1-Click Load
              </span>
            </h4>
            <p className="text-xs text-[#B4BDC8] mt-0.5">
              Specially engineered with real-world messiness (duplicates, null values, inconsistent casing) for hands-on analytical practice.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(SAMPLE_DATASETS).map(([key, sample]) => (
            <div
              key={key}
              onClick={() => !isLoading && handleLoadSample(key)}
              className="group cursor-pointer p-5 rounded-2xl bg-[#151B23] border border-[#27303B] hover:border-[#5B8DEF]/60 hover:bg-[#1A212B] transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-2xl">
                    {key === "ecommerce_sales" ? "🛒" : key === "customer_churn" ? "🔄" : "💼"}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#11161D] border border-[#27303B] text-[#B4BDC8] group-hover:border-[#5B8DEF]/40 transition-colors">
                    {sample.meta.row_count} rows • {sample.meta.columns.length} cols
                  </span>
                </div>

                <h5 className="font-bold text-sm text-[#F5F7FA] group-hover:text-[#5B8DEF] transition-colors">
                  {sample.meta.name}
                </h5>
                <p className="text-xs text-[#B4BDC8] mt-1.5 line-clamp-2 leading-relaxed">
                  {sample.meta.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {sample.meta.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#11161D] border border-[#27303B] text-[#7E8996] font-medium"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#27303B] flex items-center justify-between text-xs font-semibold text-[#5B8DEF]">
                <span>Load & Inspect</span>
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
