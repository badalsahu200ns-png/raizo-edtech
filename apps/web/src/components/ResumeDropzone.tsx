"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Eye, X, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

interface ResumeDropzoneProps {
  onProfileExtracted?: (profile: any) => void;
  className?: string;
}

export default function ResumeDropzone({ onProfileExtracted, className = "" }: ResumeDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState<string>("");
  const [extractedData, setExtractedData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = async (selectedFile: File) => {
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "doc", "txt"].includes(ext || "")) {
      setErrorMessage("Please select a PDF, DOCX, or TXT document.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds 10 MB limit.");
      return;
    }

    setErrorMessage(null);
    setFile(selectedFile);
    await processResume(selectedFile);
  };

  const processResume = async (uploadFile: File) => {
    setIsProcessing(true);
    try {
      setProgressStage("Uploading document...");
      await new Promise((r) => setTimeout(r, 200));

      setProgressStage("Profile Agent: Extracting text & structure...");
      await new Promise((r) => setTimeout(r, 200));

      setProgressStage("Profile Agent: Mapping capabilities & unverified claims...");
      const res = await api.uploadResume(uploadFile);

      setExtractedData(res.profile);
      if (onProfileExtracted) {
        onProfileExtracted(res.profile);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to process resume. Please verify the document text.");
    } finally {
      setIsProcessing(false);
      setProgressStage("");
    }
  };

  const handleRemove = () => {
    setFile(null);
    setExtractedData(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {!file && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? "border-indigo-400 bg-indigo-950/30 shadow-lg shadow-indigo-950/50"
              : "border-white/15 bg-[#0b101d]/60 hover:border-indigo-500/50 hover:bg-[#0f172a]/80"
          }`}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-cyan-500/20 text-cyan-400 border border-indigo-500/30 mb-4">
            <Upload className="h-7 w-7 text-indigo-400" />
          </div>

          <h3 className="text-base font-semibold text-white">Upload Your Resume</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Drag & drop PDF, DOCX, or TXT here, or click to browse files
          </p>

          <div className="mt-4 flex items-center justify-center space-x-2 text-[11px] text-slate-500">
            <span>PDF, DOCX, TXT</span>
            <span>•</span>
            <span>Max 10 MB</span>
            <span>•</span>
            <span className="text-indigo-400">Strict Claim vs Verification Logic</span>
          </div>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="rounded-2xl border border-indigo-500/30 bg-[#0e1628] p-6 text-center shadow-xl">
          <div className="flex items-center justify-center space-x-3 text-indigo-400 mb-3">
            <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
            <span className="text-sm font-semibold text-white">{progressStage}</span>
          </div>
          <p className="text-xs text-slate-400">
            Raizo does not generate fake placeholders. Real text is being extracted and normalized.
          </p>
        </div>
      )}

      {/* Uploaded & Parsed State */}
      {file && !isProcessing && extractedData && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-white">{file.name}</h4>
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-300 mt-1">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded & Parsed
                  </span>
                  <span>•</span>
                  <span>{extractedData.skills.length} skills identified</span>
                  <span>•</span>
                  <span className="text-amber-300">Status: Unverified Claims</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center space-x-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>View Extracted Profile</span>
              </button>
              <button
                onClick={handleRemove}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                title="Replace file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMessage && (
        <div className="mt-3 flex items-center space-x-2 rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Extracted Profile Modal */}
      {showModal && extractedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/15 bg-[#0b101e] p-6 text-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Extracted Candidate Profile</h3>
                <p className="text-xs text-slate-400">Source: {extractedData.document_name}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Candidate Header */}
            <div className="flex items-center justify-between rounded-xl bg-white/5 p-4 border border-white/5">
              <div>
                <h4 className="text-base font-bold text-white">{extractedData.name}</h4>
                <p className="text-xs text-cyan-400">{extractedData.current_role}</p>
                <p className="text-xs text-slate-400 mt-1">{extractedData.email} • {extractedData.phone}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Estimated Exp:</span>
                <p className="text-sm font-bold text-white">{extractedData.years_experience_total} Years</p>
              </div>
            </div>

            {/* Skills & Claims */}
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Extracted Skills (Marked Pending Verification)
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {extractedData.skills.map((s: any, idx: number) => (
                  <div key={idx} className="rounded-lg border border-white/5 bg-[#101728] p-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{s.name}</span>
                      <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-500/30">
                        {s.claimed_level} Claim
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400 line-clamp-1 italic">
                      {s.source_context}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Experiences */}
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Identified Work History
              </h5>
              <div className="space-y-2">
                {extractedData.experiences.map((exp: any, idx: number) => (
                  <div key={idx} className="rounded-lg border border-white/5 bg-[#101728] p-3 text-xs">
                    <div className="flex justify-between font-semibold text-white">
                      <span>{exp.role} @ {exp.company}</span>
                      <span className="text-slate-400">{exp.start_date} – {exp.end_date}</span>
                    </div>
                    <ul className="mt-1.5 list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                      {exp.responsibilities.map((r: string, rIdx: number) => (
                        <li key={rIdx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Close & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
