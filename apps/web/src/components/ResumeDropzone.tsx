"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  Lock
} from "lucide-react";
import { api } from "@/lib/api";

interface ResumeDropzoneProps {
  onProfileExtracted?: (profile: any, documentId: string) => void;
  className?: string;
}

type DropzoneState = "idle" | "dragging" | "uploading" | "processing" | "success" | "error";

export default function ResumeDropzone({
  onProfileExtracted,
  className = ""
}: ResumeDropzoneProps) {
  const [state, setState] = useState<DropzoneState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingSteps, setProcessingSteps] = useState({
    validated: false,
    textExtracted: false,
    experienceDetected: false,
    skillsDetected: false,
    educationDetected: false,
    certificationsDetected: false
  });
  const [extractedData, setExtractedData] = useState<any>(null);
  const [documentId, setDocumentId] = useState<string>("");
  const [sha256, setSha256] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (state === "idle" || state === "dragging") {
      setState("dragging");
    }
  };

  const handleDragLeave = () => {
    if (state === "dragging") {
      setState("idle");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcess(e.target.files[0]);
    }
  };

  const validateAndProcess = async (selectedFile: File) => {
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "doc", "txt"].includes(ext || "")) {
      setState("error");
      setErrorMessage("Please select a valid PDF, DOCX, or TXT document.");
      return;
    }

    if (selectedFile.size === 0) {
      setState("error");
      setErrorMessage("The uploaded file is empty (0 bytes). Please select a valid document.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setState("error");
      setErrorMessage("File exceeds the maximum 10 MB limit.");
      return;
    }

    setFile(selectedFile);
    setErrorMessage(null);

    // State 1: Uploading
    setState("uploading");
    setUploadProgress(15);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 25;
      });
    }, 120);

    try {
      // Execute genuine backend upload
      const res = await api.uploadResumeFile(selectedFile);
      clearInterval(progressInterval);
      setUploadProgress(100);

      // State 2: Processing with step transitions
      setState("processing");
      setDocumentId(res.document_id);
      setSha256(res.sha256);

      setProcessingSteps({ ...processingSteps, validated: true });
      await new Promise((r) => setTimeout(r, 180));

      setProcessingSteps((prev) => ({ ...prev, textExtracted: true }));
      await new Promise((r) => setTimeout(r, 180));

      setProcessingSteps((prev) => ({ ...prev, experienceDetected: true }));
      await new Promise((r) => setTimeout(r, 180));

      setProcessingSteps((prev) => ({ ...prev, skillsDetected: true }));
      await new Promise((r) => setTimeout(r, 180));

      setProcessingSteps((prev) => ({
        ...prev,
        educationDetected: true,
        certificationsDetected: true
      }));
      await new Promise((r) => setTimeout(r, 150));

      // State 3: Success
      setState("success");
      setExtractedData(res.extracted_profile);
      if (onProfileExtracted) {
        onProfileExtracted(res.extracted_profile, res.document_id);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setState("error");
      setErrorMessage(
        err.message ||
          "We could not extract enough text from this PDF. This may be a scanned/image-based resume. Please upload a text-based PDF or DOCX."
      );
    }
  };

  const handleReset = () => {
    setState("idle");
    setFile(null);
    setUploadProgress(0);
    setExtractedData(null);
    setErrorMessage(null);
    setProcessingSteps({
      validated: false,
      textExtracted: false,
      experienceDetected: false,
      skillsDetected: false,
      educationDetected: false,
      certificationsDetected: false
    });
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

      {/* 1. IDLE & DRAGGING STATES */}
      {(state === "idle" || state === "dragging") && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
            state === "dragging"
              ? "border-[#5B8DEF] bg-[#5B8DEF]/10 shadow-[0_0_24px_rgba(91,141,239,0.15)] scale-[1.01]"
              : "border-[#27303B] bg-[#151B23] hover:border-[#5B8DEF]/50 hover:bg-[#1A212B]"
          }`}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5B8DEF]/10 border border-[#5B8DEF]/20 text-[#5B8DEF] group-hover:scale-105 group-hover:bg-[#5B8DEF]/15 transition-all duration-300">
            <Upload className="h-8 w-8" />
          </div>

          <h3 className="mt-4 text-base sm:text-lg font-semibold text-[#F5F7FA]">
            {state === "dragging" ? "Drop your resume here" : "Upload your resume"}
          </h3>

          <p className="mt-1 text-xs sm:text-sm text-[#B4BDC8] max-w-sm">
            {state === "dragging" ? (
              <span className="text-[#5B8DEF] font-medium">Release to start secure extraction</span>
            ) : (
              <>
                Drop your resume here or{" "}
                <span className="text-[#5B8DEF] underline underline-offset-4 font-medium group-hover:text-[#719DF5]">
                  Browse Files
                </span>
              </>
            )}
          </p>

          <div className="mt-4 flex items-center space-x-2 text-[11px] text-[#7E8996] font-mono">
            <span className="rounded bg-[#11161D] px-2 py-0.5 border border-[#27303B]">PDF</span>
            <span className="rounded bg-[#11161D] px-2 py-0.5 border border-[#27303B]">DOCX</span>
            <span className="rounded bg-[#11161D] px-2 py-0.5 border border-[#27303B]">TXT</span>
            <span>• Maximum 10 MB</span>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-xl text-left border-t border-[#27303B] pt-4 text-[11px] text-[#B4BDC8]">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#36C98F] shrink-0" />
              <span>Your file remains private</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#5B8DEF] shrink-0" />
              <span>Claims stored unverified</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#7C6CF2] shrink-0" />
              <span>Editable before analysis</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. UPLOADING STATE */}
      {state === "uploading" && (
        <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-8 text-center shadow-xl">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-xl bg-[#5B8DEF]/15 text-[#5B8DEF] flex items-center justify-center animate-pulse">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <h4 className="text-sm font-semibold text-[#F5F7FA] mt-3">Uploading resume...</h4>
          <p className="text-xs text-[#B4BDC8] mt-1">{file?.name}</p>

          <div className="w-full max-w-md mx-auto mt-5">
            <div className="flex justify-between text-xs text-[#B4BDC8] mb-1.5 font-mono">
              <span>Encrypted transmission</span>
              <span className="text-[#5B8DEF] font-semibold">{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#0B0F14] overflow-hidden">
              <div
                className="h-full bg-[#5B8DEF] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. PROCESSING STATE */}
      {state === "processing" && (
        <div className="rounded-2xl border border-[#27303B] bg-[#151B23] p-6 sm:p-8 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-[#27303B] pb-4 mb-4">
            <div className="h-10 w-10 rounded-xl bg-[#5B8DEF]/15 text-[#5B8DEF] flex items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#F5F7FA]">Resume uploaded</h4>
              <p className="text-xs text-[#7E8996]">
                SHA-256: <span className="font-mono text-[#5B8DEF]">{sha256.slice(0, 16)}...</span>
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-[#B4BDC8]">
            <div className="flex items-center space-x-2">
              <CheckCircle2
                className={`h-4 w-4 ${
                  processingSteps.validated ? "text-[#36C98F]" : "text-[#27303B]"
                }`}
              />
              <span>Document validated</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2
                className={`h-4 w-4 ${
                  processingSteps.textExtracted ? "text-[#36C98F]" : "text-[#27303B]"
                }`}
              />
              <span>Text extracted</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2
                className={`h-4 w-4 ${
                  processingSteps.experienceDetected ? "text-[#36C98F]" : "text-[#27303B]"
                }`}
              />
              <span>Experience detected</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2
                className={`h-4 w-4 ${
                  processingSteps.skillsDetected ? "text-[#36C98F]" : "text-[#27303B]"
                }`}
              />
              <span>Skills detected</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2
                className={`h-4 w-4 ${
                  processingSteps.educationDetected ? "text-[#36C98F]" : "text-[#27303B]"
                }`}
              />
              <span>Education detected</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2
                className={`h-4 w-4 ${
                  processingSteps.certificationsDetected ? "text-[#36C98F]" : "text-[#27303B]"
                }`}
              />
              <span>Certifications detected</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUCCESS STATE */}
      {state === "success" && (
        <div className="rounded-2xl border border-[#36C98F]/30 bg-[#151B23] p-6 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-[#36C98F]/15 text-[#36C98F] flex items-center justify-center">
                <FileCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#F5F7FA]">Resume analysis complete</h4>
                <p className="text-xs text-[#B4BDC8]">
                  {file?.name} •{" "}
                  <span className="font-mono text-[#36C98F]">
                    {extractedData?.skills?.length || 0} skills detected
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="text-xs text-[#7E8996] hover:text-[#F5F7FA] transition-colors cursor-pointer"
            >
              Replace
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-[#27303B] flex items-center justify-between text-xs">
            <div className="text-[#B4BDC8] flex items-center space-x-1.5">
              <Lock className="h-3 w-3 text-[#5B8DEF]" />
              <span>Stored securely in private user storage</span>
            </div>
            <span className="font-mono text-[10px] text-[#7E8996]">
              ID: {documentId}
            </span>
          </div>
        </div>
      )}

      {/* 5. ERROR STATE */}
      {state === "error" && (
        <div className="rounded-2xl border border-[#E86A6A]/40 bg-[#151B23] p-6 shadow-xl">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-[#E86A6A] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-[#E86A6A]">Document Processing Error</h4>
              <p className="text-xs text-[#B4BDC8] mt-1 leading-relaxed">{errorMessage}</p>

              <div className="mt-4 flex items-center space-x-3">
                <button
                  onClick={handleReset}
                  className="rounded-xl bg-[#E86A6A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#E86A6A]/90 transition-colors cursor-pointer"
                >
                  Try Another File
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-[#27303B] bg-[#11161D] px-4 py-2 text-xs font-medium text-[#F5F7FA] hover:bg-[#1A212B] transition-colors cursor-pointer"
                >
                  Browse Files
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
