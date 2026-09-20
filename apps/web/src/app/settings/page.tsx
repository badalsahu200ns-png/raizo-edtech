"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  FileText,
  Shield,
  Trash2,
  RefreshCw,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink
} from "lucide-react";
import ResumeDropzone from "@/components/ResumeDropzone";
import ExtractedProfileReview from "@/components/ExtractedProfileReview";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [activeResume, setActiveResume] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [reviewData, setReviewData] = useState<{ profile: any; docId: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    setIsLoading(true);
    try {
      const res = await api.getActiveResume();
      if (res.has_resume && res.document) {
        setActiveResume(res.document);
      } else {
        setActiveResume(null);
      }
    } catch (err: any) {
      console.warn("Could not load active resume:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!activeResume) return;
    if (!confirm("Are you sure you want to securely remove your resume document? Historical verified evidence will be preserved.")) return;

    try {
      await api.deleteResume(activeResume.id);
      setActiveResume(null);
      setStatusMessage("Resume document securely removed from storage.");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to remove resume.");
    }
  };

  const handleReprocessResume = async () => {
    if (!activeResume) return;
    try {
      setStatusMessage("Reprocessing document with Profile Agent...");
      const res = await api.reprocessResume(activeResume.id);
      setStatusMessage("Resume reprocessed successfully!");
      setReviewData({ profile: res.extracted_profile, docId: activeResume.id });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reprocess resume.");
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeResume || {}, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "raizo_learner_profile_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-[#27303B] pb-4">
        <div className="flex items-center space-x-2 text-[#5B8DEF] text-xs font-bold uppercase tracking-wider">
          <Settings className="h-4 w-4" />
          <span>Account & Document Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] mt-1">
          Settings & Document Vault
        </h1>
        <p className="text-xs text-[#B4BDC8] mt-1">
          Manage your private document storage, active resume claims, and data privacy options.
        </p>
      </div>

      {statusMessage && (
        <div className="rounded-xl border border-[#2F7D5C]/30 bg-[#F4FAF6] p-3.5 text-xs text-[#36C98F] flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-[#B84A4A]/30 bg-[#FBEAEB] p-3.5 text-xs text-[#E86A6A] flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Review Modal / Drawer if Reprocessing */}
      {reviewData && (
        <div className="rounded-2xl border border-[#5B8DEF]/30 bg-[#151B23] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#27303B] pb-3">
            <h3 className="font-bold text-[#F5F7FA] text-sm">
              Review Reprocessed Profile Claims
            </h3>
            <button
              onClick={() => setReviewData(null)}
              className="text-xs text-[#B4BDC8] hover:text-[#F5F7FA]"
            >
              Close
            </button>
          </div>
          <ExtractedProfileReview
            documentId={reviewData.docId}
            initialProfile={reviewData.profile}
            onConfirmed={() => {
              setReviewData(null);
              loadResume();
              setStatusMessage("Profile claims updated successfully!");
            }}
            onCancel={() => setReviewData(null)}
          />
        </div>
      )}

      {/* Active Resume Document */}
      <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#27303B] pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-[#5B8DEF]/10 text-[#5B8DEF] flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F5F7FA]">Current Active Resume</h2>
              <p className="text-xs text-[#B4BDC8]">
                Primary source for unverified baseline capability extraction
              </p>
            </div>
          </div>
          {activeResume && (
            <span className="rounded-md bg-[#5B8DEF]/10 border border-[#5B8DEF]/20 px-3 py-1 text-[11px] font-bold text-[#5B8DEF]">
              {activeResume.processing_status === "confirmed" ? "Processed & Confirmed" : "Uploaded"}
            </span>
          )}
        </div>

        {activeResume ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#27303B] bg-[#11161D] p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-bold text-[#F5F7FA] text-sm">
                  {activeResume.original_filename}
                </div>
                <div className="text-xs text-[#B4BDC8]">
                  Uploaded: <span className="font-semibold text-[#F5F7FA]">{activeResume.uploaded_at}</span>
                </div>
              </div>

              <div className="text-xs font-mono text-[#B4BDC8] break-all bg-[#151B23] p-2.5 rounded-lg border border-[#27303B]">
                <span className="text-[#5B8DEF] font-bold">SHA-256: </span>
                {activeResume.sha256}
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-[#B4BDC8]">
                <Lock className="h-3 w-3 text-[#5B8DEF]" />
                <span>Encrypted private storage • Format: {activeResume.extension.toUpperCase()} • Size: {(activeResume.file_size / 1024).toFixed(1)} KB</span>
              </div>
            </div>

            {/* Resume Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setShowUploader(!showUploader)}
                className="rounded-xl bg-[#5B8DEF] px-4 py-2 text-xs font-bold text-white hover:bg-[#4779D8] transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{showUploader ? "Hide Uploader" : "Replace Resume"}</span>
              </button>

              <button
                onClick={handleReprocessResume}
                className="rounded-xl border border-[#27303B] bg-[#151B23] px-4 py-2 text-xs font-semibold text-[#F5F7FA] hover:bg-[#1A212B] transition-colors flex items-center space-x-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reprocess Resume</span>
              </button>

              <button
                onClick={handleDeleteResume}
                className="rounded-xl border border-[#B84A4A]/30 bg-[#FBEAEB] px-4 py-2 text-xs font-bold text-[#E86A6A] hover:bg-[#FBEAEB]/80 transition-colors flex items-center space-x-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove Resume</span>
              </button>
            </div>

            {showUploader && (
              <div className="mt-4 pt-4 border-t border-[#27303B]">
                <h4 className="text-xs font-bold text-[#F5F7FA] mb-2">Upload Replacement Resume</h4>
                <ResumeDropzone
                  onProfileExtracted={(profile, docId) => {
                    setShowUploader(false);
                    setReviewData({ profile, docId });
                    loadResume();
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-[#B4BDC8]">
              No active resume document detected. Upload a resume to automatically extract baseline competencies.
            </p>
            <ResumeDropzone
              onProfileExtracted={(profile, docId) => {
                setReviewData({ profile, docId });
                loadResume();
              }}
            />
          </div>
        )}
      </div>

      {/* Data Export & Privacy Section */}
      <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-[#F5F7FA]">
          Data Export & Privacy Rights
        </h3>
        <p className="text-xs text-[#B4BDC8]">
          Export your complete learning telemetry, verified assessment checkpoints, and extracted profile metadata in standard JSON format.
        </p>

        <button
          onClick={handleExportData}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-[#27303B] bg-[#151B23] text-xs font-semibold text-[#F5F7FA] hover:bg-[#1A212B] transition-colors"
        >
          <Download className="h-4 w-4 text-[#5B8DEF]" />
          <span>Export Learner Telemetry JSON</span>
        </button>
      </div>
    </div>
  );
}
