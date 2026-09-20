"use client";

import React, { useState } from "react";
import {
  ParsedDataset,
  DatasetAnalysis,
  QuizQuestion,
  TutorMessage
} from "@/lib/types";
import { exportDatasetToCSV } from "@/lib/dataLabEngine";
import { api } from "@/lib/api";

interface InsightsAndLearningProps {
  dataset: ParsedDataset;
  originalDataset: ParsedDataset;
  analysis: DatasetAnalysis;
}

export const InsightsAndLearning: React.FC<InsightsAndLearningProps> = ({
  dataset,
  originalDataset,
  analysis
}) => {
  const { evidence_insights, learning_notes, quiz_questions } = analysis;

  // Micro-quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});

  // Socratic Tutor dialog state
  const [tutorQuery, setTutorQuery] = useState("");
  const [tutorChat, setTutorChat] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const [tutorError, setTutorError] = useState<string | null>(null);

  const handleSelectOption = (questionId: string, optIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optIndex }));
    setShowExplanations(prev => ({ ...prev, [questionId]: true }));
  };

  const handleAskTutor = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || isTutorLoading) return;

    setTutorError(null);
    setTutorChat(prev => [...prev, { role: "user", content: q }]);
    setTutorQuery("");
    setIsTutorLoading(true);

    try {
      // Build rich dataset context for Socratic reasoning
      const numericProfiles = analysis.column_profiles.filter(p => p.inferred_type === "numeric");
      const categoricalProfiles = analysis.column_profiles.filter(p => p.inferred_type === "categorical");

      const datasetContext = {
        filename: dataset.filename,
        row_count: dataset.row_count,
        column_count: dataset.column_count,
        columns: dataset.columns,
        numeric_columns: numericProfiles.map(p => p.name),
        categorical_columns: categoricalProfiles.map(p => p.name),
        duplicate_count: analysis.quality_audit.duplicate_rows_count,
        missing_count: analysis.quality_audit.total_missing_cells,
        data_health_score: analysis.quality_audit.data_health_score,
        top_relationships: analysis.correlation_matrix.top_relationships.slice(0, 3)
      };

      const res: TutorMessage = await api.sendTutorMessage({
        message: q,
        mode: "socratic",
        current_node_id: "Data Analysis Lab",
        dataset_context: datasetContext
      });

      setTutorChat(prev => [...prev, { role: "assistant", content: res.content }]);
    } catch (err: any) {
      console.warn("Tutor request error:", err);
      setTutorError(err.message || "Failed to connect to RAIZO Tutor.");
      // Graceful fallback response
      setTutorChat(prev => [
        ...prev,
        {
          role: "assistant",
          content: `In **${dataset.filename}**, keeping raw data intact while exploring statistical properties is the hallmark of professional analysis. What specific column or metric would you like to investigate further?`
        }
      ]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  const handleDownloadAnalysisReport = () => {
    const reportText = `# RAIZO Data Analysis Lab — Executive Summary Report
Dataset: ${dataset.filename}
Generated: ${new Date().toLocaleString()}

## 1. Overview & Data Health
- Active Observations: ${dataset.row_count} rows
- Dimensions: ${dataset.column_count} columns
- Data Hygiene Health Score: ${analysis.quality_audit.data_health_score}/100 (${analysis.quality_audit.health_label})
- Duplicates Found: ${analysis.quality_audit.duplicate_rows_count}
- Missing Cells: ${analysis.quality_audit.total_missing_cells}

## 2. Statistical Findings & Evidence
${evidence_insights.map(i => `### ${i.title}\n- Finding: ${i.description}\n- Evidence: ${i.evidence}\n- Actionable Tip: ${i.actionable_tip}\n`).join("\n")}

## 3. Pearson Correlation Matrix (Top Relationships)
${analysis.correlation_matrix.top_relationships
  .map(r => `- ${r.col1} ↔ ${r.col2}: r = ${r.r} (${r.strength} ${r.direction})\n  Caveat: ${r.caveat}`)
  .join("\n")}

## 4. Educational Learning Notes
${learning_notes.map(n => `### ${n.topic}\n- Core Takeaway: ${n.takeaway}\n- Industry Practice: ${n.real_world_application}\n`).join("\n")}
`;

    const blob = new Blob([reportText], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${dataset.filename.replace(/\.[^/.]+$/, "")}_raizo_analysis_report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCleanedCSV = () => {
    const csvContent = exportDatasetToCSV(dataset.columns, dataset.rows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${dataset.filename.replace(/\.[^/.]+$/, "")}_cleaned.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* 1. Automated Evidence-Based Insights */}
      <div className="bg-[#151B23] rounded-3xl p-6 md:p-8 border border-[#27303B] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#5B8DEF]/10 text-[#5B8DEF]">
                Step 8
              </span>
              <h3 className="text-xl font-bold text-[#F5F7FA]">
                Evidence-Based Analytical Findings
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Automated data insights grounded strictly in observation counts, distributions, and empirical variance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadAnalysisReport}
              className="px-3.5 py-2 rounded-xl bg-[#151B23] border border-[#27303B] hover:border-[#5B8DEF] text-gray-700 hover:text-[#5B8DEF] text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Analysis Report</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadCleanedCSV}
              className="px-3.5 py-2 rounded-xl bg-[#5B8DEF] hover:bg-[#135447] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Cleaned CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidence_insights.map((ins, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#11161D] border border-[#27303B] space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      ins.category === "trend"
                        ? "bg-blue-100 text-blue-800"
                        : ins.category === "anomaly"
                        ? "bg-rose-100 text-rose-800"
                        : ins.category === "quality"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {ins.category}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#F5F7FA]">{ins.title}</h4>
                <p className="text-xs text-gray-700 leading-relaxed">{ins.description}</p>

                <div className="p-2.5 rounded-xl bg-[#151B23] border border-[#27303B]/60 text-[11px] text-gray-600 space-y-1">
                  <span className="font-bold text-gray-900">Observed Evidence:</span>
                  <p className="font-mono text-gray-700">{ins.evidence}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#27303B]/60 flex items-start gap-1.5 text-xs text-[#5B8DEF] font-medium">
                <span>💡</span>
                <span>{ins.actionable_tip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. RAIZO Learning Notes Card */}
      <div className="bg-[#151B23] rounded-3xl p-6 md:p-8 border border-[#27303B] shadow-sm space-y-6">
        <div>
          <h3 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
            <span>RAIZO Learning Notes & Analytical Principles</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Core analytical mental models demonstrated by this dataset's characteristics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learning_notes.map((note, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-[#151B23] border border-[#27303B] space-y-2">
              <h4 className="font-bold text-sm text-[#F5F7FA] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5B8DEF]" />
                <span>{note.topic}</span>
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                <strong>Key Takeaway:</strong> {note.takeaway}
              </p>
              <div className="p-3 rounded-xl bg-[#11161D] border border-[#27303B]/60 text-[11px] text-gray-600">
                <span className="font-bold text-gray-800">Real-World Industry Practice: </span>
                <span>{note.real_world_application}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. "Try It Yourself" Micro-Quiz */}
      {quiz_questions.length > 0 && (
        <div className="bg-[#151B23] rounded-3xl p-6 md:p-8 border border-[#27303B] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#F5F7FA] flex items-center gap-2">
                <span>Try It Yourself — Concept Mastery Check</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#5B8DEF]/10 text-[#5B8DEF]">
                  Interactive
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Test your interpretation of this dataset's statistical metrics and cleaning rules.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {quiz_questions.map((q, qIdx) => {
              const userSelection = selectedAnswers[q.id];
              const isAnswered = userSelection !== undefined;
              const isCorrect = userSelection === q.correct_index;

              return (
                <div key={q.id} className="p-5 rounded-2xl bg-[#11161D] border border-[#27303B] space-y-4">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#5B8DEF] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {qIdx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-[#F5F7FA] leading-snug">{q.question}</h4>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pl-8">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userSelection === optIdx;
                      let btnStyle = "bg-[#151B23] hover:bg-gray-100 text-gray-700 border-gray-200";

                      if (isAnswered) {
                        if (optIdx === q.correct_index) {
                          btnStyle = "bg-emerald-100 border-emerald-400 text-emerald-900 font-semibold";
                        } else if (isSelected && !isCorrect) {
                          btnStyle = "bg-rose-100 border-rose-400 text-rose-900 line-through";
                        } else {
                          btnStyle = "bg-[#151B23] text-gray-400 border-gray-200 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          disabled={isAnswered}
                          className={`p-3 rounded-xl border text-xs text-left transition-all flex items-start gap-2.5 ${btnStyle}`}
                        >
                          <span className="font-mono font-bold text-[11px] text-gray-400">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {showExplanations[q.id] && (
                    <div
                      className={`ml-8 p-3 rounded-xl border text-xs ${
                        isCorrect
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : "bg-amber-50 border-amber-200 text-amber-900"
                      }`}
                    >
                      <p className="font-bold flex items-center gap-1.5">
                        {isCorrect ? "✓ Well Done!" : "ℹ️ Pedagogical Explanation:"}
                      </p>
                      <p className="mt-1 leading-relaxed text-[11px]">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. "Ask RAIZO Tutor About This Dataset" (Live Socratic Chat) */}
      <div className="bg-[#151B23] rounded-3xl p-6 md:p-8 border border-[#27303B] shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#5B8DEF]/10 text-[#5B8DEF]">
              Socratic Dialogue
            </span>
            <h3 className="text-xl font-bold text-[#F5F7FA]">
              Ask RAIZO Tutor About This Dataset
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Directly converse with RAIZO Tutor with your live dataset context, column metrics, and outlier bounds seamlessly injected into the dialogue.
          </p>
        </div>

        {/* Quick Query Chips */}
        <div className="flex flex-wrap gap-2">
          {[
            "Why did you remove these duplicates?",
            "What does this correlation mean?",
            "Why is a histogram useful here?",
            "Can you explain this graph like I'm a beginner?",
            "What should a data analyst recommend next?"
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAskTutor(prompt)}
              disabled={isTutorLoading}
              className="px-3 py-1.5 rounded-full text-xs bg-[#11161D] hover:bg-[#5B8DEF]/10 text-gray-700 hover:text-[#5B8DEF] border border-[#27303B] transition-all font-medium"
            >
              💭 {prompt}
            </button>
          ))}
        </div>

        {/* Dialogue Stream */}
        {tutorChat.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto p-4 rounded-2xl bg-gray-50 border border-gray-200">
            {tutorChat.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#5B8DEF] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                    R
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-lg leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#5B8DEF] text-white rounded-tr-xs"
                      : "bg-[#151B23] text-gray-800 border border-gray-200 rounded-tl-xs shadow-2xs"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
            {isTutorLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-500 italic">
                <span className="animate-spin w-3.5 h-3.5 border-2 border-[#5B8DEF] border-t-transparent rounded-full" />
                <span>RAIZO Tutor is inspecting dataset variables...</span>
              </div>
            )}
          </div>
        )}

        {/* Input Box */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Ask anything about ${dataset.filename}...`}
            value={tutorQuery}
            onChange={e => setTutorQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAskTutor(tutorQuery)}
            disabled={isTutorLoading}
            className="flex-1 p-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#176B5B]/30 focus:border-[#5B8DEF]"
          />
          <button
            type="button"
            onClick={() => handleAskTutor(tutorQuery)}
            disabled={!tutorQuery.trim() || isTutorLoading}
            className="px-5 py-3 bg-[#5B8DEF] hover:bg-[#135447] disabled:bg-gray-300 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            Ask Tutor
          </button>
        </div>
      </div>
    </div>
  );
};
