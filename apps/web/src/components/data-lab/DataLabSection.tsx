"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ParsedDataset,
  DatasetAnalysis,
  CleaningAction,
  CleaningTransformation
} from "@/lib/types";
import {
  executeCleaningActionsLocally
} from "@/lib/dataLabEngine";
import { DataLabUpload } from "@/components/data-lab/DataLabUpload";
import { DataOverviewCard } from "@/components/data-lab/DataOverviewCard";
import { ColumnInspectionTable } from "@/components/data-lab/ColumnInspectionTable";
import { DataQualityInspector } from "@/components/data-lab/DataQualityInspector";
import { DataCleaningSuite } from "@/components/data-lab/DataCleaningSuite";
import { RelationshipExplorer } from "@/components/data-lab/RelationshipExplorer";
import { VisualizationEngine } from "@/components/data-lab/VisualizationEngine";
import { InsightsAndLearning } from "@/components/data-lab/InsightsAndLearning";

interface DataLabSectionProps {
  showReturnLink?: boolean;
}

export const DataLabSection: React.FC<DataLabSectionProps> = ({ showReturnLink = false }) => {
  const [originalDataset, setOriginalDataset] = useState<ParsedDataset | null>(null);
  const [workingDataset, setWorkingDataset] = useState<ParsedDataset | null>(null);
  const [analysis, setAnalysis] = useState<DatasetAnalysis | null>(null);
  const [transformations, setTransformations] = useState<CleaningTransformation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingClean, setIsProcessingClean] = useState(false);

  // When new file or sample is loaded
  const handleDatasetLoaded = (parsed: ParsedDataset, initialAnalysis: DatasetAnalysis) => {
    setOriginalDataset(parsed);
    setWorkingDataset(parsed);
    setAnalysis(initialAnalysis);
    setTransformations([]);
  };

  // Cleaning action execution
  const handleApplyAction = (action: CleaningAction) => {
    if (!workingDataset) return;
    setIsProcessingClean(true);
    try {
      const res = executeCleaningActionsLocally(
        workingDataset.rows,
        workingDataset.columns,
        [action]
      );
      if (res.success) {
        setWorkingDataset({
          ...workingDataset,
          rows: res.cleaned_rows || res.cleanedRows || [],
          row_count: res.row_count
        });
        setTransformations(prev => [...prev, ...res.transformations]);
        setAnalysis(res.analysis);
      }
    } catch (err) {
      console.error("Failed to apply cleaning action:", err);
    } finally {
      setIsProcessingClean(false);
    }
  };

  // Reset to original upload
  const handleResetToOriginal = () => {
    if (!originalDataset) return;
    setIsProcessingClean(true);
    try {
      const res = executeCleaningActionsLocally(
        originalDataset.rows,
        originalDataset.columns,
        []
      );
      setWorkingDataset(originalDataset);
      setTransformations([]);
      setAnalysis(res.analysis);
    } catch (err) {
      console.error("Reset failed:", err);
    } finally {
      setIsProcessingClean(false);
    }
  };

  const isCleaned = transformations.length > 0;

  return (
    <div className="space-y-8">
      {/* Sub-Header / Status Banner */}
      <div className="rounded-2xl bg-[#151B23] border border-[#27303B] p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#5B8DEF]/15 text-[#5B8DEF] border border-[#5B8DEF]/20 uppercase tracking-wider">
                RAIZO LAB ENGINE
              </span>
              {showReturnLink && (
                <>
                  <span className="text-[#7E8996]">•</span>
                  <Link
                    href="/learn"
                    className="text-xs font-semibold text-[#B4BDC8] hover:text-[#5B8DEF] transition-colors"
                  >
                    ← Return to Curriculum
                  </Link>
                </>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-[#F5F7FA]">
              Interactive CSV & Excel Data Analysis Lab
            </h2>
            <p className="text-xs font-medium text-[#B4BDC8]">
              Professional analytical workbench for exploratory data analysis, quality auditing, cleaning transformations, and correlation discovery.
            </p>
          </div>

          {workingDataset && (
            <button
              type="button"
              onClick={() => {
                setOriginalDataset(null);
                setWorkingDataset(null);
                setAnalysis(null);
                setTransformations([]);
              }}
              className="raizo-btn-secondary self-start md:self-auto"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Upload Another Dataset</span>
            </button>
          )}
        </div>

        {/* 7-Step Analytical Pipeline Stepper (Prompt #13) */}
        <div className="pt-3 border-t border-[#27303B] flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {[
            { step: "Upload", active: true },
            { step: "Understand", active: !!workingDataset },
            { step: "Clean", active: !!workingDataset && transformations.length > 0 },
            { step: "Relationships", active: !!workingDataset },
            { step: "Visualize", active: !!workingDataset },
            { step: "Insights", active: !!workingDataset },
            { step: "Learn", active: !!workingDataset }
          ].map((item, idx) => (
            <React.Fragment key={item.step}>
              <span
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  item.active
                    ? "bg-[#5B8DEF]/15 text-[#5B8DEF] border border-[#5B8DEF]/30"
                    : "bg-[#11161D] text-[#7E8996] border border-[#27303B]"
                }`}
              >
                {item.step}
              </span>
              {idx < 6 && <span className="text-[#5B8DEF] font-bold">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* When NO dataset is loaded: Show Full Upload View */}
      {!workingDataset || !analysis || !originalDataset ? (
        <div className="space-y-6">
          <DataLabUpload
            onDatasetLoaded={handleDatasetLoaded}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
      ) : (
        /* When dataset IS loaded: Render Full 8-Step Pipeline */
        <div className="space-y-10">
          {/* Step 2: Overview & Table */}
          <DataOverviewCard
            originalDataset={originalDataset}
            workingDataset={workingDataset}
            analysis={analysis}
            isCleaned={isCleaned}
            onResetToOriginal={handleResetToOriginal}
          />

          {/* Step 3: Column-by-Column Schema Inspection */}
          <ColumnInspectionTable profiles={analysis.column_profiles} />

          {/* Step 4: Quality & Hygiene Checks */}
          <DataQualityInspector
            quality={analysis.quality_audit}
            onQuickCleanAction={actionType => {
              if (actionType === "remove_duplicates") {
                handleApplyAction({ action: "remove_duplicates" });
              } else if (actionType === "trim_whitespace") {
                handleApplyAction({ action: "trim_whitespace" });
              }
            }}
          />

          {/* Step 5: Guided Data Cleaning Suite */}
          <DataCleaningSuite
            workingDataset={workingDataset}
            originalDataset={originalDataset}
            analysis={analysis}
            transformations={transformations}
            onApplyAction={handleApplyAction}
            onResetToOriginal={handleResetToOriginal}
            isProcessing={isProcessingClean}
          />

          {/* Step 6: Relationship Explanation & Correlation Explorer */}
          <RelationshipExplorer analysis={analysis} />

          {/* Step 7: Interactive Visualization Engine */}
          <VisualizationEngine dataset={workingDataset} analysis={analysis} />

          {/* Step 8: Evidence-Based Insights, Micro-Quiz & Live Tutor Sync */}
          <InsightsAndLearning
            dataset={workingDataset}
            originalDataset={originalDataset}
            analysis={analysis}
          />
        </div>
      )}
    </div>
  );
};
