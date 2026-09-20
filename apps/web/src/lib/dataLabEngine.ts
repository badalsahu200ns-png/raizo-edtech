import {
  ParsedDataset,
  ColumnStats,
  DataQualityAudit,
  CorrelationPair,
  RecommendedChartConfig,
  EvidenceInsight,
  LearningNote,
  QuizQuestion,
  DatasetAnalysis,
  CleaningAction,
  CleaningTransformation,
  CleaningResult,
  SampleDatasetMeta
} from "./types";
import { API_BASE } from "./api";

// ============================================================================
// 1. ROBUST RFC 4180 CLIENT-SIDE CSV PARSER & EXPORTER
// ============================================================================

export function parseCSVString(text: string = ""): { columns: string[]; rows: Record<string, any>[] } {
  if (!text || !text.trim()) {
    return { columns: [], rows: [] };
  }

  // Detect delimiter: comma, semicolon, tab, or pipe
  const firstLines = text.split(/\r?\n/).filter(l => l.trim()).slice(0, 5);
  let delimiter = ",";
  const candidates = [",", ";", "\t", "|"];
  let bestScore = -1;
  for (const cand of candidates) {
    const counts = firstLines.map(line => (line.split(cand).length - 1));
    if (counts.length > 0 && counts[0] > 0 && counts.every(c => c === counts[0])) {
      delimiter = cand;
      break;
    }
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    if (avg > bestScore && counts.every(c => c > 0)) {
      bestScore = avg;
      delimiter = cand;
    }
  }

  const rawRows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentCell += '"';
          i += 2;
          continue;
        } else {
          // Close quotes
          insideQuotes = false;
          i++;
          continue;
        }
      } else {
        currentCell += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
        i++;
        continue;
      } else if (char === delimiter) {
        currentRow.push(currentCell.trim());
        currentCell = "";
        i++;
        continue;
      } else if (char === "\r" && nextChar === "\n") {
        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c.length > 0)) {
          rawRows.push(currentRow);
        }
        currentRow = [];
        currentCell = "";
        i += 2;
        continue;
      } else if (char === "\n" || char === "\r") {
        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c.length > 0)) {
          rawRows.push(currentRow);
        }
        currentRow = [];
        currentCell = "";
        i++;
        continue;
      } else {
        currentCell += char;
        i++;
        continue;
      }
    }
  }

  // Trailing cell/row
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c.length > 0)) {
      rawRows.push(currentRow);
    }
  }

  if (rawRows.length === 0) {
    return { columns: [], rows: [] };
  }

  // Normalize column names
  const rawHeaders = rawRows[0];
  const columns: string[] = [];
  const seenHeaders = new Set<string>();

  rawHeaders.forEach((h, idx) => {
    let clean = (h || "").trim();
    if (!clean) clean = `Column_${idx + 1}`;
    let uniqueName = clean;
    let counter = 1;
    while (seenHeaders.has(uniqueName.toLowerCase())) {
      uniqueName = `${clean}_${counter}`;
      counter++;
    }
    seenHeaders.add(uniqueName.toLowerCase());
    columns.push(uniqueName);
  });

  const rows: Record<string, any>[] = [];
  for (let r = 1; r < rawRows.length; r++) {
    const rowCells = rawRows[r];
    const record: Record<string, any> = {};
    columns.forEach((col, idx) => {
      let val: any = rowCells[idx];
      if (val === undefined || val === null) {
        record[col] = null;
        return;
      }
      val = String(val).trim();
      if (val === "" || val.toLowerCase() === "null" || val.toLowerCase() === "nan" || val === "N/A" || val === "#N/A") {
        record[col] = null;
      } else {
        // Test numeric
        const cleanNum = val.replace(/,/g, "").replace(/^\$/, "").replace(/%$/, "");
        if (cleanNum !== "" && !isNaN(Number(cleanNum)) && !/^[0-9]+-[0-9]+/.test(cleanNum)) {
          record[col] = Number(cleanNum);
        } else if (val.toLowerCase() === "true") {
          record[col] = true;
        } else if (val.toLowerCase() === "false") {
          record[col] = false;
        } else {
          record[col] = val;
        }
      }
    });
    rows.push(record);
  }

  return { columns, rows };
}

export function exportDatasetToCSV(columns: string[], rows: Record<string, any>[]): string {
  if (!columns.length || !rows.length) return "";
  const escapeCell = (val: any) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = columns.map(escapeCell).join(",");
  const rowLines = rows.map(r => columns.map(c => escapeCell(r[c])).join(","));
  return [headerLine, ...rowLines].join("\r\n");
}

// ============================================================================
// 2. DETERMINISTIC STATISTICAL & QUALITY PROFILER (PURE TS)
// ============================================================================

export function profileColumn(name: string, values: any[]): ColumnStats {
  const total = values.length;
  const nonNulls = values.filter(v => v !== null && v !== undefined && v !== "");
  const missingCount = total - nonNulls.length;
  const missingPct = total > 0 ? Number(((missingCount / total) * 100).toFixed(1)) : 0;

  // Type inference
  const numericValues: number[] = [];
  const stringValues: string[] = [];
  let dateCount = 0;

  for (const v of nonNulls) {
    if (typeof v === "number" && !isNaN(v)) {
      numericValues.push(v);
    } else {
      const s = String(v).trim();
      stringValues.push(s);
      if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(s) || /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/.test(s)) {
        dateCount++;
      }
    }
  }

  let inferredType: "numeric" | "categorical" | "datetime" | "boolean" | "text" = "text";
  if (numericValues.length / (nonNulls.length || 1) >= 0.8) {
    inferredType = "numeric";
  } else if (dateCount / (nonNulls.length || 1) >= 0.7) {
    inferredType = "datetime";
  } else {
    const uniqueStrings = new Set(stringValues.map(s => s.toLowerCase()));
    if (uniqueStrings.size <= Math.min(20, Math.max(5, Math.floor(nonNulls.length * 0.4)))) {
      inferredType = "categorical";
    } else {
      inferredType = "text";
    }
  }

  // Unique count
  const uniqueVals = new Set(values.map(v => (v === null || v === undefined ? "__NULL__" : String(v))));
  uniqueVals.delete("__NULL__");
  const uniqueCount = uniqueVals.size;

  const sampleValues = Array.from(new Set(nonNulls.map(v => String(v)))).slice(0, 5);

  // Semantic naming heuristic
  let semanticMeaning = `${inferredType.toUpperCase()} dimension`;
  const lowerName = name.toLowerCase();
  if (lowerName.includes("id") || lowerName.includes("code") || lowerName.includes("key")) {
    semanticMeaning = "Unique Entity Identifier";
  } else if (lowerName.includes("date") || lowerName.includes("time") || lowerName.includes("year")) {
    semanticMeaning = "Temporal Timestamp / Date";
  } else if (lowerName.includes("price") || lowerName.includes("cost") || lowerName.includes("revenue") || lowerName.includes("sales") || lowerName.includes("salary") || lowerName.includes("profit")) {
    semanticMeaning = "Monetary / Financial Metric";
  } else if (lowerName.includes("status") || lowerName.includes("stage") || lowerName.includes("type") || lowerName.includes("category") || lowerName.includes("region") || lowerName.includes("gender")) {
    semanticMeaning = "Categorical Segment";
  } else if (lowerName.includes("score") || lowerName.includes("rating") || lowerName.includes("percent") || lowerName.includes("rate") || lowerName.includes("discount")) {
    semanticMeaning = "Performance / Ratio Indicator";
  } else if (inferredType === "numeric") {
    semanticMeaning = "Continuous Quantitative Metric";
  }

  let numericStats: ColumnStats["numeric_stats"] | undefined = undefined;
  if (inferredType === "numeric" && numericValues.length > 0) {
    const sorted = [...numericValues].sort((a, b) => a - b);
    const n = sorted.length;
    const min = sorted[0];
    const max = sorted[n - 1];
    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = Number((sum / n).toFixed(2));
    const median = n % 2 === 1 ? sorted[Math.floor(n / 2)] : Number(((sorted[n / 2 - 1] + sorted[n / 2]) / 2).toFixed(2));

    const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n > 1 ? n - 1 : 1);
    const std = Number(Math.sqrt(variance).toFixed(2));

    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = Number((q3 - q1).toFixed(2));
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;

    const outliers = sorted.filter(v => v < lowerFence || v > upperFence);
    const skew = mean > median * 1.05 ? "Right-skewed (Positively skewed)" : mean < median * 0.95 ? "Left-skewed (Negatively skewed)" : "Approximately symmetric";

    numericStats = {
      min,
      max,
      mean,
      median,
      std,
      q1,
      q3,
      iqr,
      skewness: skew,
      outliers_count: outliers.length,
      outlier_values: outliers.slice(0, 10)
    };
  }

  // Top categories
  let topCategories: ColumnStats["top_categories"] | undefined = undefined;
  if (inferredType === "categorical" || (uniqueCount <= 12 && nonNulls.length > 0)) {
    const freq: Record<string, number> = {};
    nonNulls.forEach(v => {
      const s = String(v);
      freq[s] = (freq[s] || 0) + 1;
    });
    const sortedCats = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    topCategories = sortedCats.slice(0, 8).map(([value, count]) => ({
      value,
      count,
      percentage: Number(((count / (nonNulls.length || 1)) * 100).toFixed(1))
    }));
  }

  return {
    name,
    inferred_type: inferredType,
    semantic_meaning: semanticMeaning,
    semanticMeaning,
    total_count: total,
    missing_count: missingCount,
    missing_percentage: missingPct,
    unique_count: uniqueCount,
    sample_values: sampleValues,
    numeric_stats: numericStats,
    top_categories: topCategories
  };
}

export function auditDataQuality(columns: string[], rows: Record<string, any>[]): DataQualityAudit {
  const totalRows = rows.length;
  const totalCols = columns.length;

  if (totalRows === 0 || totalCols === 0) {
    return {
      total_rows: 0,
      total_columns: 0,
      duplicate_rows_count: 0,
      duplicate_rows_percentage: 0,
      duplicate_sample_indices: [],
      total_missing_cells: 0,
      missing_cells_percentage: 0,
      columns_with_missing: [],
      casing_inconsistencies: [],
      outliers_detected: [],
      data_health_score: 100,
      health_label: "No Data"
    };
  }

  // 1. Duplicate detection
  const seenSignatures = new Map<string, number>();
  const duplicateIndices: number[] = [];

  rows.forEach((row, idx) => {
    // Row signature
    const sig = columns.map(c => String(row[c] ?? "")).join("||");
    if (seenSignatures.has(sig)) {
      duplicateIndices.push(idx);
    } else {
      seenSignatures.set(sig, idx);
    }
  });

  const duplicateCount = duplicateIndices.length;
  const duplicatePct = Number(((duplicateCount / totalRows) * 100).toFixed(1));

  // 2. Missing cells
  let totalMissingCells = 0;
  const columnsWithMissing: DataQualityAudit["columns_with_missing"] = [];

  columns.forEach(col => {
    let colMissing = 0;
    const sampleIndices: number[] = [];
    rows.forEach((row, idx) => {
      const val = row[col];
      if (val === null || val === undefined || val === "") {
        colMissing++;
        if (sampleIndices.length < 5) sampleIndices.push(idx);
      }
    });
    totalMissingCells += colMissing;
    if (colMissing > 0) {
      columnsWithMissing.push({
        column: col,
        missing_count: colMissing,
        missing_percentage: Number(((colMissing / totalRows) * 100).toFixed(1)),
        sample_row_indices: sampleIndices
      });
    }
  });

  const totalCells = totalRows * totalCols;
  const missingCellsPct = Number(((totalMissingCells / totalCells) * 100).toFixed(1));

  // 3. Casing / spacing inconsistencies
  const casingInconsistencies: DataQualityAudit["casing_inconsistencies"] = [];
  columns.forEach(col => {
    const rawValues = rows.map(r => r[col]).filter(v => typeof v === "string" && v.trim());
    const groups: Record<string, { variants: Set<string>; count: number }> = {};
    rawValues.forEach(val => {
      const s = String(val).trim();
      const norm = s.toLowerCase();
      if (!groups[norm]) {
        groups[norm] = { variants: new Set(), count: 0 };
      }
      groups[norm].variants.add(s);
      groups[norm].count++;
    });

    const conflicts = Object.entries(groups).filter(([_, info]) => info.variants.size > 1);
    if (conflicts.length > 0) {
      casingInconsistencies.push({
        column: col,
        variants: conflicts.map(([norm, info]) => ({
          clean: norm.charAt(0).toUpperCase() + norm.slice(1),
          original_variants: Array.from(info.variants),
          count: info.count
        }))
      });
    }
  });

  // 4. Outliers via IQR
  const outliersDetected: DataQualityAudit["outliers_detected"] = [];
  columns.forEach(col => {
    const nums = rows.map(r => r[col]).filter(v => typeof v === "number" && !isNaN(v)) as number[];
    if (nums.length >= 8) {
      const sorted = [...nums].sort((a, b) => a - b);
      const n = sorted.length;
      const q1 = sorted[Math.floor(n * 0.25)];
      const q3 = sorted[Math.floor(n * 0.75)];
      const iqr = q3 - q1;
      if (iqr > 0) {
        const lowerFence = Number((q1 - 1.5 * iqr).toFixed(2));
        const upperFence = Number((q3 + 1.5 * iqr).toFixed(2));
        const outliers = sorted.filter(v => v < lowerFence || v > upperFence);
        if (outliers.length > 0) {
          outliersDetected.push({
            column: col,
            count: outliers.length,
            lower_bound: lowerFence,
            upper_bound: upperFence,
            sample_values: outliers.slice(0, 5)
          });
        }
      }
    }
  });

  // 5. Health score calculation
  let healthScore = 100;
  healthScore -= duplicatePct * 1.2;
  healthScore -= missingCellsPct * 1.5;
  healthScore -= casingInconsistencies.length * 4;
  healthScore -= Math.min(15, outliersDetected.length * 3);
  healthScore = Math.max(10, Math.min(100, Math.round(healthScore)));

  let healthLabel = "Excellent";
  if (healthScore < 50) healthLabel = "Critical Cleaning Required";
  else if (healthScore < 70) healthLabel = "Needs Attention";
  else if (healthScore < 85) healthLabel = "Moderate Quality";

  return {
    total_rows: totalRows,
    total_columns: totalCols,
    duplicate_rows_count: duplicateCount,
    duplicate_rows_percentage: duplicatePct,
    duplicate_sample_indices: duplicateIndices.slice(0, 10),
    total_missing_cells: totalMissingCells,
    missing_cells_percentage: missingCellsPct,
    columns_with_missing: columnsWithMissing,
    casing_inconsistencies: casingInconsistencies,
    outliers_detected: outliersDetected,
    data_health_score: healthScore,
    health_label: healthLabel
  };
}

export function computeCorrelations(columns: string[], rows: Record<string, any>[]): DatasetAnalysis["correlation_matrix"] {
  // Find numeric columns
  const numericCols: string[] = [];
  columns.forEach(col => {
    const nums = rows.map(r => r[col]).filter(v => typeof v === "number" && !isNaN(v));
    if (nums.length / (rows.length || 1) >= 0.7 && nums.length >= 5) {
      numericCols.push(col);
    }
  });

  const matrix: Record<string, Record<string, number | null>> = {};
  numericCols.forEach(c1 => {
    matrix[c1] = {};
    numericCols.forEach(c2 => {
      matrix[c1][c2] = null;
    });
  });

  const pairs: CorrelationPair[] = [];

  for (let i = 0; i < numericCols.length; i++) {
    const colA = numericCols[i];
    matrix[colA][colA] = 1.0;

    for (let j = i + 1; j < numericCols.length; j++) {
      const colB = numericCols[j];
      const paired: [number, number][] = [];

      rows.forEach(r => {
        const vA = r[colA];
        const vB = r[colB];
        if (typeof vA === "number" && !isNaN(vA) && typeof vB === "number" && !isNaN(vB)) {
          paired.push([vA, vB]);
        }
      });

      if (paired.length >= 4) {
        const n = paired.length;
        const meanA = paired.reduce((acc, p) => acc + p[0], 0) / n;
        const meanB = paired.reduce((acc, p) => acc + p[1], 0) / n;

        let num = 0;
        let denA = 0;
        let denB = 0;

        paired.forEach(([x, y]) => {
          const diffA = x - meanA;
          const diffB = y - meanB;
          num += diffA * diffB;
          denA += diffA * diffA;
          denB += diffB * diffB;
        });

        const den = Math.sqrt(denA * denB);
        const r = den > 0 ? Number((num / den).toFixed(2)) : 0;

        matrix[colA][colB] = r;
        matrix[colB][colA] = r;

        let strength = "Negligible / None";
        const absR = Math.abs(r);
        if (absR >= 0.7) strength = "Strong";
        else if (absR >= 0.4) strength = "Moderate";
        else if (absR >= 0.2) strength = "Weak";

        const direction = r > 0.05 ? "Positive" : r < -0.05 ? "Negative" : "Neutral";
        const desc = `${strength} ${direction.toLowerCase()} relationship between ${colA} and ${colB} (r = ${r}).`;
        const caveat = `Correlation measures linear association only. An r = ${r} does NOT establish that ${colA} directly causes changes in ${colB}. Confounding variables and external business factors must be evaluated.`;

        pairs.push({
          col1: colA,
          col2: colB,
          r,
          strength,
          direction,
          description: desc,
          caveat
        });
      }
    }
  }

  // Sort top relationships by absolute r descending
  pairs.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

  return {
    columns: numericCols,
    matrix,
    top_relationships: pairs
  };
}

export function generateChartRecommendations(profiles: ColumnStats[]): RecommendedChartConfig[] {
  const recommendations: RecommendedChartConfig[] = [];
  const numCols = profiles.filter(p => p.inferred_type === "numeric");
  const catCols = profiles.filter(p => p.inferred_type === "categorical");
  const dateCols = profiles.filter(p => p.inferred_type === "datetime");

  // 1. Bar / Column: High value categorical against numeric
  if (catCols.length > 0 && numCols.length > 0) {
    recommendations.push({
      chart_type: "bar",
      title: `${numCols[0].name} by ${catCols[0].name}`,
      rationale: `Compare aggregate ${numCols[0].name} across distinct categories in ${catCols[0].name}.`,
      x_axis: catCols[0].name,
      y_axis: numCols[0].name
    });
  }

  // 2. Line: Time Series or sequential
  if (dateCols.length > 0 && numCols.length > 0) {
    recommendations.push({
      chart_type: "line",
      title: `${numCols[0].name} Trend Over ${dateCols[0].name}`,
      rationale: `Track the chronological trend and identify seasonal peaks or troughs over time.`,
      x_axis: dateCols[0].name,
      y_axis: numCols[0].name
    });
  } else if (numCols.length >= 2) {
    recommendations.push({
      chart_type: "line",
      title: `${numCols[0].name} Trajectory`,
      rationale: `Analyze continuous movement and cumulative patterns across observation indexes.`,
      x_axis: profiles[0].name,
      y_axis: numCols[0].name
    });
  }

  // 3. Histogram: Distribution of primary continuous metric
  if (numCols.length > 0) {
    recommendations.push({
      chart_type: "histogram",
      title: `Distribution of ${numCols[0].name}`,
      rationale: `Inspect the shape, central tendency, modality, and skewness of ${numCols[0].name}.`,
      x_axis: numCols[0].name
    });
  }

  // 4. Box Plot: Outlier Bounds
  if (numCols.length > 0) {
    recommendations.push({
      chart_type: "box_plot",
      title: `Box & Whisker Dispersion for ${numCols[0].name}`,
      rationale: `Highlight median, interquartile range (IQR), and empirical Tukey fences for outlier detection.`,
      x_axis: catCols[0]?.name || numCols[0].name,
      y_axis: numCols[0].name
    });
  }

  // 5. Scatter Plot: Bivariate Relationship
  if (numCols.length >= 2) {
    recommendations.push({
      chart_type: "scatter",
      title: `${numCols[0].name} vs. ${numCols[1].name} Bivariate Scatter`,
      rationale: `Explore co-variation, clusters, and linear vs. non-linear patterns between two continuous variables.`,
      x_axis: numCols[0].name,
      y_axis: numCols[1].name
    });
  }

  // 6. Pareto Chart: 80/20 Rule on Primary Category
  if (catCols.length > 0 && numCols.length > 0) {
    recommendations.push({
      chart_type: "pareto",
      title: `Pareto Concentration: ${numCols[0].name} by ${catCols[0].name}`,
      rationale: `Apply the 80/20 rule to verify if a minority of categories contributes the vast majority of volume.`,
      x_axis: catCols[0].name,
      y_axis: numCols[0].name
    });
  }

  // 7. Correlation Heatmap
  if (numCols.length >= 2) {
    recommendations.push({
      chart_type: "heatmap",
      title: `Multi-variable Pearson Correlation Matrix`,
      rationale: `Display pairwise linear coefficients across all numeric features simultaneously to spot collinearity.`,
      x_axis: "Features",
      y_axis: "Features"
    });
  }

  return recommendations.slice(0, 7);
}

export function generateEvidenceInsights(
  profiles: ColumnStats[],
  quality: DataQualityAudit,
  correlations: DatasetAnalysis["correlation_matrix"]
): EvidenceInsight[] {
  const insights: EvidenceInsight[] = [];

  // Quality insight
  if (quality.duplicate_rows_count > 0 || quality.total_missing_cells > 0) {
    insights.push({
      category: "quality",
      title: `Data Hygiene: ${quality.duplicate_rows_count} Duplicates & ${quality.total_missing_cells} Missing Values Identified`,
      description: `Analysis revealed ${quality.duplicate_rows_count} duplicate row(s) (${quality.duplicate_rows_percentage}%) and ${quality.total_missing_cells} missing cell(s) across ${quality.columns_with_missing.length} columns.`,
      evidence: `Columns affected by missing data include: ${quality.columns_with_missing.map(c => `${c.column} (${c.missing_count})`).join(", ") || "None"}.`,
      actionable_tip: `Use the Data Cleaning Suite below to impute missing numbers with column medians (robust to outliers) and deduplicate records before modeling.`
    });
  }

  // Correlation insight
  if (correlations.top_relationships.length > 0) {
    const top = correlations.top_relationships[0];
    insights.push({
      category: "trend",
      title: `Lead Co-variation: ${top.col1} & ${top.col2} (r = ${top.r})`,
      description: top.description,
      evidence: `Pearson r = ${top.r} based on common paired observations. Direction: ${top.direction}. Strength: ${top.strength}.`,
      actionable_tip: `Remember: Correlation indicates shared variance, but is NOT proof of causality. Always check for external business catalysts.`
    });
  }

  // Numeric distribution insight
  const numWithOutliers = profiles.find(p => p.numeric_stats && p.numeric_stats.outliers_count > 0);
  if (numWithOutliers && numWithOutliers.numeric_stats) {
    const st = numWithOutliers.numeric_stats;
    insights.push({
      category: "anomaly",
      title: `Distribution Skew in ${numWithOutliers.name} (${st.outliers_count} Outliers)`,
      description: `The metric ${numWithOutliers.name} exhibits a ${st.skewness.toLowerCase()} distribution with mean (${st.mean}) versus median (${st.median}).`,
      evidence: `Upper fence is ${st.q3 + 1.5 * st.iqr}. Values reaching up to ${st.max} fall outside typical dispersion.`,
      actionable_tip: `When communicating central tendency to business stakeholders, report the median (${st.median}) instead of the mean to prevent outlier distortion.`
    });
  }

  // Categorical concentration insight
  const cat = profiles.find(p => p.top_categories && p.top_categories.length > 0);
  if (cat && cat.top_categories) {
    const topCat = cat.top_categories[0];
    insights.push({
      category: "business",
      title: `Domain Concentration: ${topCat.value} leads ${cat.name}`,
      description: `The single category '${topCat.value}' accounts for ${topCat.percentage}% of all observed entries in ${cat.name}.`,
      evidence: `Frequency: ${topCat.count} of ${cat.total_count - cat.missing_count} categorized rows.`,
      actionable_tip: `Segment your downstream reports specifically for '${topCat.value}' versus remaining segments to verify whether behavioral drivers differ.`
    });
  }

  return insights;
}

export function generateLearningNotes(filename: string, profiles: ColumnStats[], quality: DataQualityAudit): LearningNote[] {
  return [
    {
      topic: "Mean vs. Median: The Executive Presentation Rule",
      takeaway: "The arithmetic mean is pulled heavily by extreme outliers. The median is resistant and represents the true 50th percentile experience.",
      real_world_application: "In salary, revenue, and churn analysis, executive leadership prefers median figures when distributions are right-skewed."
    },
    {
      topic: "Non-Destructive Data Cleaning Architecture",
      takeaway: "Never overwrite raw source data. Clean transformations must always branch into a working copy with complete auditability.",
      real_world_application: "In production data engineering pipelines (e.g. dbt or Pandas), raw tables remain strictly read-only while silver/gold layers store transformations."
    },
    {
      topic: "Interquartile Range (IQR) & The 1.5x Tukey Rule",
      takeaway: "An observation is classified as an outlier if it falls below Q1 - 1.5*IQR or above Q3 + 1.5*IQR.",
      real_world_application: "Used universally in financial fraud audits, customer usage monitoring, and anomaly detection dashboards."
    },
    {
      topic: "Non-Causal Analytical Phrasing",
      takeaway: "Strong correlation does not prove causation. Never write 'X increased Y' unless confirmed by a randomized controlled A/B experiment.",
      real_world_application: "Avoid misleading product managers into expensive feature builds based on incidental statistical correlation."
    }
  ];
}

export function generateDatasetQuizzes(filename: string, profiles: ColumnStats[], quality: DataQualityAudit): QuizQuestion[] {
  const numCol = profiles.find(p => p.numeric_stats);
  const questions: QuizQuestion[] = [];

  if (numCol && numCol.numeric_stats) {
    const st = numCol.numeric_stats;
    const isRightSkewed = st.mean > st.median;
    questions.push({
      id: "q_mean_vs_median",
      question: `In this dataset, for the column '${numCol.name}', the mean is ${st.mean} while the median is ${st.median}. Which statement is analytically correct?`,
      options: [
        `The distribution is right-skewed because high-value outliers are pulling the mean above the median.`,
        `The mean is always more trustworthy than the median regardless of skew.`,
        `The median is calculated by dividing total sum by row count.`,
        `We should delete the median because it ignores 50% of the observations.`
      ],
      correct_index: isRightSkewed ? 0 : 0,
      explanation: `Correct! When the arithmetic mean (${st.mean}) exceeds the median (${st.median}), positive outliers pull the average upwards, creating a right-skewed distribution.`
    });
  }

  questions.push({
    id: "q_deduplication_principle",
    question: `Why does RAIZO Data Lab recommend removing identical duplicate records before running correlation or machine learning models?`,
    options: [
      `Duplicates create artificial weight and bias statistical metrics like variance and mean.`,
      `Duplicate rows cause computer monitors to render charts with low resolution.`,
      `Duplicates automatically make correlation drop to 0.0.`,
      `Databases cannot store more than 10 rows with identical text.`
    ],
    correct_index: 0,
    explanation: `Precisely. Duplicate entries artificially inflate statistical significance and skew linear regression estimates.`
  });

  questions.push({
    id: "q_correlation_causation",
    question: `Suppose two metrics in your dataset show a strong positive correlation of r = +0.82. What should you conclude in your report?`,
    options: [
      `A strong linear association exists, but further experimental testing is needed before claiming causation.`,
      `Variable A definitively causes Variable B to increase.`,
      `Variable B was caused by user error and should be deleted immediately.`,
      `Correlation of 0.82 means 82% of the dataset rows are identical.`
    ],
    correct_index: 0,
    explanation: `Spot on! Even a near-perfect correlation (r ~ 1.0) can be produced by lurking third-party confounding variables.`
  });

  return questions;
}

export function analyzeDatasetLocally(dataset: ParsedDataset): DatasetAnalysis {
  const { filename, columns, rows, row_count, column_count } = dataset;
  const profiles = columns.map(c => profileColumn(c, rows.map(r => r[c])));
  const quality = auditDataQuality(columns, rows);
  const correlations = computeCorrelations(columns, rows);
  const recommendedCharts = generateChartRecommendations(profiles);
  const evidenceInsights = generateEvidenceInsights(profiles, quality, correlations);
  const learningNotes = generateLearningNotes(filename, profiles, quality);
  const quizQuestions = generateDatasetQuizzes(filename, profiles, quality);

  const numCols = profiles.filter(p => p.inferred_type === "numeric").length;
  const catCols = profiles.filter(p => p.inferred_type === "categorical").length;

  const overview = `The dataset '${filename}' contains ${row_count.toLocaleString()} rows and ${column_count} columns (${numCols} numeric metrics, ${catCols} categorical dimensions). Overall data hygiene health score is ${quality.data_health_score}/100 (${quality.health_label}).`;

  return {
    dataset_summary: {
      filename,
      row_count,
      column_count,
      overview,
      business_context: `Typical analytical workflow: Explore categorical distributions, audit IQR dispersion fences, impute missing entries, and extract key bivariate patterns.`,
      target_role_relevance: `Essential for junior and intermediate Data Analysts practicing exploratory data analysis (EDA), data cleaning hygiene, and statistical reasoning.`
    },
    column_profiles: profiles,
    quality_audit: quality,
    correlation_matrix: correlations,
    recommended_charts: recommendedCharts,
    evidence_insights: evidenceInsights,
    learning_notes: learningNotes,
    quiz_questions: quizQuestions
  };
}

// ============================================================================
// 3. NON-DESTRUCTIVE CLEANING ENGINE (CLIENT-SIDE EXECUTION)
// ============================================================================

export function executeCleaningActionsLocally(
  originalRows: Record<string, any>[],
  columns: string[],
  actions: CleaningAction[]
): CleaningResult {
  let cleanedRows = originalRows.map(r => ({ ...r }));
  const transformations: CleaningTransformation[] = [];

  for (const act of actions) {
    if (act.action === "remove_duplicates") {
      const initialCount = cleanedRows.length;
      const seen = new Set<string>();
      const deduped: Record<string, any>[] = [];

      cleanedRows.forEach(row => {
        const sig = columns.map(c => String(row[c] ?? "")).join("||");
        if (!seen.has(sig)) {
          seen.add(sig);
          deduped.push(row);
        }
      });

      const removed = initialCount - deduped.length;
      cleanedRows = deduped;
      transformations.push({
        id: `trans_${Date.now()}_dedup`,
        title: "Deduplicated Row Records",
        what_changed: `Removed ${removed} redundant identical row(s). Dataset row count changed from ${initialCount} to ${cleanedRows.length}.`,
        why_recommended: `Eliminates artificial statistical weighting and prevents inflated mean / sum aggregations in downstream charts.`,
        affected_count: removed,
        timestamp: new Date().toLocaleTimeString()
      });
    } else if (act.action === "trim_whitespace") {
      let count = 0;
      cleanedRows.forEach(row => {
        columns.forEach(col => {
          if (typeof row[col] === "string") {
            const trimmed = row[col].trim();
            if (trimmed !== row[col]) {
              row[col] = trimmed;
              count++;
            }
          }
        });
      });
      transformations.push({
        id: `trans_${Date.now()}_trim`,
        title: "Trimmed Leading/Trailing Whitespace",
        what_changed: `Stripped accidental spaces from ${count} text cell(s) across all columns.`,
        why_recommended: `Invisible trailing spaces prevent exact string matches during SQL joins, VLOOKUPs, and GROUP BY aggregations.`,
        affected_count: count,
        timestamp: new Date().toLocaleTimeString()
      });
    } else if (act.action === "standardize_casing" && act.column) {
      const col = act.column;
      const casing = act.casing || "title";
      let count = 0;

      cleanedRows.forEach(row => {
        const val = row[col];
        if (typeof val === "string" && val.trim()) {
          let updated = val.trim();
          if (casing === "title") {
            updated = updated.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
          } else if (casing === "lower") {
            updated = updated.toLowerCase();
          } else if (casing === "upper") {
            updated = updated.toUpperCase();
          }
          if (updated !== val) {
            row[col] = updated;
            count++;
          }
        }
      });

      transformations.push({
        id: `trans_${Date.now()}_casing`,
        title: `Standardized Casing in '${col}' (${casing})`,
        what_changed: `Unified ${count} text value(s) in column '${col}' to consistent ${casing} casing.`,
        why_recommended: `Categorical splits (e.g. 'Retail' vs 'retail') fragment charts and pivot tables into false sub-categories.`,
        affected_count: count,
        timestamp: new Date().toLocaleTimeString()
      });
    } else if (act.action === "impute_missing" && act.column) {
      const col = act.column;
      const method = act.method || "median";
      let count = 0;

      if (method === "drop_row") {
        const before = cleanedRows.length;
        cleanedRows = cleanedRows.filter(r => r[col] !== null && r[col] !== undefined && r[col] !== "");
        count = before - cleanedRows.length;
        transformations.push({
          id: `trans_${Date.now()}_impute_drop`,
          title: `Dropped Rows with Missing '${col}'`,
          what_changed: `Deleted ${count} row(s) missing mandatory value in column '${col}'.`,
          why_recommended: `Rows lacking primary keys or critical metrics can invalidate downstream calculations.`,
          affected_count: count,
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        // Compute replacement value
        const nonNulls = cleanedRows.map(r => r[col]).filter(v => v !== null && v !== undefined && v !== "");
        let fillValue: any = null;

        if (method === "median" || method === "mean") {
          const nums = nonNulls.filter(v => typeof v === "number") as number[];
          if (nums.length > 0) {
            if (method === "median") {
              const sorted = [...nums].sort((a, b) => a - b);
              fillValue = sorted[Math.floor(sorted.length / 2)];
            } else {
              fillValue = Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2));
            }
          }
        } else if (method === "mode") {
          const freq: Record<string, number> = {};
          nonNulls.forEach(v => {
            const s = String(v);
            freq[s] = (freq[s] || 0) + 1;
          });
          const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
          if (sorted.length > 0) fillValue = sorted[0][0];
        } else if (method === "custom") {
          fillValue = act.custom_value;
        }

        if (fillValue !== null && fillValue !== undefined) {
          cleanedRows.forEach(r => {
            if (r[col] === null || r[col] === undefined || r[col] === "") {
              r[col] = fillValue;
              count++;
            }
          });

          transformations.push({
            id: `trans_${Date.now()}_impute_${col}`,
            title: `Imputed Missing Values in '${col}' with ${method.toUpperCase()} (${fillValue})`,
            what_changed: `Replaced ${count} null or empty cell(s) with ${method} value: ${fillValue}.`,
            why_recommended: `${method === "median" ? "Median imputation is resilient to extreme outliers." : "Preserves sample size without discarding entire rows."}`,
            affected_count: count,
            timestamp: new Date().toLocaleTimeString()
          });
        }
      }
    } else if (act.action === "cap_outliers" && act.column) {
      const col = act.column;
      const nums = cleanedRows.map(r => r[col]).filter(v => typeof v === "number") as number[];
      if (nums.length >= 6) {
        const sorted = [...nums].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const lowerFence = q1 - 1.5 * iqr;
        const upperFence = q3 + 1.5 * iqr;
        let count = 0;

        cleanedRows.forEach(r => {
          if (typeof r[col] === "number") {
            if (r[col] > upperFence) {
              r[col] = upperFence;
              count++;
            } else if (r[col] < lowerFence) {
              r[col] = lowerFence;
              count++;
            }
          }
        });

        transformations.push({
          id: `trans_${Date.now()}_outlier_${col}`,
          title: `Capped Outliers in '${col}' (Winsorization)`,
          what_changed: `Winsorized ${count} extreme outlier(s) to Tukey fences [${lowerFence}, ${upperFence}].`,
          why_recommended: `Restrains severe leverage points from skewing regression coefficients and statistical models.`,
          affected_count: count,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    }
  }

  const analysis = analyzeDatasetLocally({
    filename: "cleaned_dataset.csv",
    file_type: "csv",
    columns,
    rows: cleanedRows,
    row_count: cleanedRows.length,
    column_count: columns.length
  });

  return {
    success: true,
    cleaned_rows: cleanedRows,
    cleanedRows,
    row_count: cleanedRows.length,
    transformations,
    analysis
  };
}

// ============================================================================
// 4. RICH PRE-LOADED CURATED SAMPLE DATASETS
// ============================================================================

export const SAMPLE_DATASETS: Record<string, { meta: SampleDatasetMeta; csv: string }> = {
  ecommerce_sales: {
    meta: {
      id: "ecommerce_sales",
      name: "E-Commerce Customer Orders & Profit",
      filename: "ecommerce_customer_orders.csv",
      description: "Retail order records featuring regional sales, product categories, calculated discount ratios, and profit margins. Contains intentional duplicates and missing entries for cleaning practice.",
      row_count: 50,
      columns: ["Order_ID", "Order_Date", "Customer_Name", "Region", "Category", "Sales", "Discount", "Profit", "Quantity"],
      features: ["Time-series dates", "Category hierarchies", "Calculated profit margins", "3 Duplicates & 4 Missing values"]
    },
    csv: `Order_ID,Order_Date,Customer_Name,Region,Category,Sales,Discount,Profit,Quantity
CA-2023-1001,2023-01-15,Marcus Vance,West,Technology,980.50,0.10,245.12,3
CA-2023-1002,2023-01-16,Elena Rostova,East,Office Supplies,45.20,0.00,12.80,2
CA-2023-1003,2023-01-18,Devon Scott,Central,Furniture,650.00,0.20,-45.50,4
CA-2023-1004,2023-01-20,Priya Patel,South,Technology,1420.00,0.05,420.00,5
CA-2023-1005,2023-01-22,Liam Thorne,West,Office Supplies,18.90,0.00,5.20,1
CA-2023-1006,2023-01-25,Sarah Jenkins,East,Furniture,480.00,0.15,35.00,2
CA-2023-1007,2023-01-28,Carlos Gomez,Central,Technology,1850.00,0.10,510.00,4
CA-2023-1008,2023-02-01,Marcus Vance,West,Furniture,320.00,0.00,75.00,2
CA-2023-1009,2023-02-03,Amina Diallo,South,Office Supplies,,0.00,18.40,3
CA-2023-1010,2023-02-05,David Kim,East,Technology,2100.00,0.25,280.00,6
CA-2023-1011,2023-02-08,Rachel Adams,West,Furniture,550.00,0.10,40.00,3
CA-2023-1012,2023-02-12,James Wilson,Central,Office Supplies,62.00,0.00,22.10,2
CA-2023-1013,2023-02-15,Elena Rostova,East,Technology,890.00,0.05,260.00,2
CA-2023-1014,2023-02-18,Omar Farooq,South,Furniture,720.00,0.30,-80.00,4
CA-2023-1015,2023-02-21,Priya Patel,South,Office Supplies,32.50,0.00,9.10,1
CA-2023-1016,2023-02-25,Liam Thorne,West,Technology,1650.00,0.15,380.00,4
CA-2023-1017,2023-03-01,Carlos Gomez,Central,Furniture,,0.20,15.00,3
CA-2023-1018,2023-03-04,Sarah Jenkins,East,Office Supplies,85.00,0.00,28.00,3
CA-2023-1019,2023-03-07,Marcus Vance,West,Technology,1120.00,0.10,310.00,3
CA-2023-1020,2023-03-10,Devon Scott,Central,Office Supplies,24.00,0.00,6.50,2
CA-2023-1021,2023-03-14,Amina Diallo,South,Technology,1340.00,0.10,390.00,4
CA-2023-1022,2023-03-17,David Kim,East,Furniture,820.00,0.15,65.00,3
CA-2023-1023,2023-03-20,James Wilson,Central,Technology,1950.00,0.20,410.00,5
CA-2023-1024,2023-03-24,Rachel Adams,West,Office Supplies,42.00,0.00,14.50,2
CA-2023-1025,2023-03-27,Omar Farooq,South,Technology,2300.00,0.30,190.00,6
CA-2023-1026,2023-03-30,Elena Rostova,East,Furniture,610.00,0.10,55.00,3
CA-2023-1027,2023-04-02,Priya Patel,South,Furniture,890.00,0.25,-15.00,4
CA-2023-1028,2023-04-05,Liam Thorne,West,Office Supplies,55.00,0.00,16.80,2
CA-2023-1029,2023-04-08,Carlos Gomez,Central,Office Supplies,,0.00,8.20,1
CA-2023-1030,2023-04-12,David Kim,East,Office Supplies,95.00,0.00,32.00,4
CA-2023-1031,2023-04-15,Sarah Jenkins,East,Technology,1780.00,0.10,480.00,4
CA-2023-1032,2023-04-18,Marcus Vance,West,Office Supplies,38.00,0.00,11.20,2
CA-2023-1033,2023-04-22,Amina Diallo,South,Furniture,690.00,0.20,30.00,3
CA-2023-1034,2023-04-26,James Wilson,Central,Furniture,540.00,0.15,42.00,2
CA-2023-1035,2023-04-29,Rachel Adams,West,Technology,2450.00,0.15,620.00,5
CA-2023-1036,2023-05-02,Devon Scott,Central,Technology,1600.00,0.10,420.00,4
CA-2023-1037,2023-05-06,Elena Rostova,East,Office Supplies,75.00,0.00,24.50,3
CA-2023-1038,2023-05-10,Omar Farooq,South,Office Supplies,48.00,0.00,15.20,2
CA-2023-1039,2023-05-14,Liam Thorne,West,Furniture,780.00,0.10,88.00,3
CA-2023-1040,2023-05-18,Priya Patel,South,Technology,1890.00,0.20,390.00,5
CA-2023-1041,2023-05-22,Carlos Gomez,Central,Technology,,0.15,360.00,4
CA-2023-1042,2023-05-25,David Kim,East,Technology,2650.00,0.20,680.00,6
CA-2023-1043,2023-05-29,Sarah Jenkins,East,Furniture,640.00,0.10,60.00,3
CA-2023-1044,2023-06-02,Marcus Vance,West,Furniture,810.00,0.15,92.00,3
CA-2023-1045,2023-06-06,Amina Diallo,South,Office Supplies,65.00,0.00,21.00,2
CA-2023-1046,2023-06-10,James Wilson,Central,Office Supplies,52.00,0.00,17.40,2
CA-2023-1047,2023-06-14,Devon Scott,Central,Furniture,710.00,0.20,25.00,3
CA-2023-1001,2023-01-15,Marcus Vance,West,Technology,980.50,0.10,245.12,3
CA-2023-1002,2023-01-16,Elena Rostova,East,Office Supplies,45.20,0.00,12.80,2
CA-2023-1004,2023-01-20,Priya Patel,South,Technology,1420.00,0.05,420.00,5`
  },

  customer_churn: {
    meta: {
      id: "customer_churn",
      name: "SaaS Subscription Churn & Support Engagement",
      filename: "saas_customer_churn.csv",
      description: "Customer subscription records tracking contract duration, monthly spend, support escalation count, satisfaction ratings, and churn status with inconsistent casing.",
      row_count: 45,
      columns: ["Customer_ID", "Tenure_Months", "Contract_Type", "Monthly_Charges", "Support_Tickets", "Satisfaction_Score", "Churn_Status"],
      features: ["Bivariate correlation", "Outlier detection in charges", "Inconsistent category casing"]
    },
    csv: `Customer_ID,Tenure_Months,Contract_Type,Monthly_Charges,Support_Tickets,Satisfaction_Score,Churn_Status
CUST-001,4,Month-to-month,65.50,5,2,Yes
CUST-002,36,Two year,88.20,1,5,No
CUST-003,12,One year,54.00,2,4,No
CUST-004,2,month-to-month,72.00,6,1,Yes
CUST-005,48,Two year,105.00,0,5,No
CUST-006,8,Month-to-Month,62.10,4,3,Yes
CUST-007,24,One year,78.50,1,4,No
CUST-008,1,month-to-month,85.00,7,1,Yes
CUST-009,60,Two year,115.00,1,5,No
CUST-010,18,One Year,69.00,2,3,No
CUST-011,3,Month-to-month,70.50,5,2,Yes
CUST-012,42,Two year,92.00,0,5,No
CUST-013,15,One year,58.00,3,3,No
CUST-014,6,month-to-month,79.00,4,2,Yes
CUST-015,54,Two year,110.00,1,5,No
CUST-016,9,Month-to-Month,64.00,3,3,No
CUST-017,30,One year,82.50,2,4,No
CUST-018,2,month-to-month,90.00,8,1,Yes
CUST-019,65,Two year,120.00,0,5,No
CUST-020,20,One Year,74.00,1,4,No
CUST-021,5,Month-to-month,68.00,4,2,Yes
CUST-022,38,Two year,95.00,1,5,No
CUST-023,14,One year,61.00,2,3,No
CUST-024,1,month-to-month,88.50,6,1,Yes
CUST-025,50,Two year,108.00,0,5,No
CUST-026,11,Month-to-Month,66.00,3,3,No
CUST-027,28,One year,80.00,1,4,No
CUST-028,3,month-to-month,94.00,7,2,Yes
CUST-029,72,Two year,125.00,0,5,No
CUST-030,22,One Year,76.50,2,4,No
CUST-031,7,Month-to-month,71.00,4,3,Yes
CUST-032,45,Two year,98.00,1,5,No
CUST-033,16,One year,63.50,2,4,No
CUST-034,4,month-to-month,82.00,5,2,Yes
CUST-035,58,Two year,118.00,0,5,No
CUST-036,10,Month-to-Month,67.50,3,3,No
CUST-037,32,One year,84.00,1,4,No
CUST-038,2,month-to-month,96.00,9,1,Yes
CUST-039,68,Two year,122.00,0,5,No
CUST-040,25,One Year,79.00,2,4,No
CUST-041,1,month-to-month,250.00,8,1,Yes
CUST-042,2,month-to-month,85.00,7,1,Yes
CUST-043,36,Two year,88.20,1,5,No
CUST-044,12,One year,54.00,2,4,No
CUST-045,4,Month-to-month,65.50,5,2,Yes`
  },

  workforce_compensation: {
    meta: {
      id: "workforce_compensation",
      name: "Workforce Compensation & Performance",
      filename: "workforce_compensation.csv",
      description: "Human resources dataset detailing employee roles, base compensation, annual performance evaluation ratings, and overtime hours worked.",
      row_count: 40,
      columns: ["Employee_ID", "Department", "Job_Role", "Salary", "Experience_Years", "Performance_Rating", "Overtime_Hours"],
      features: ["Salary distribution & skew", "Departmental aggregations", "Box plot outlier bounds"]
    },
    csv: `Employee_ID,Department,Job_Role,Salary,Experience_Years,Performance_Rating,Overtime_Hours
EMP-101,Engineering,Software Engineer,88000,3,4,12
EMP-102,Sales,Account Executive,72000,4,3,18
EMP-103,Data,Data Analyst,76000,2,5,8
EMP-104,Engineering,Senior Engineer,124000,8,4,15
EMP-105,Marketing,Marketing Manager,91000,6,3,10
EMP-106,Engineering,QA Engineer,68000,2,3,6
EMP-107,Sales,Sales Director,145000,12,4,22
EMP-108,Data,Senior Data Analyst,98000,6,5,10
EMP-109,Finance,Financial Analyst,74000,3,4,14
EMP-110,Engineering,Software Engineer,85000,3,3,11
EMP-111,Data,Data Scientist,112000,5,5,9
EMP-112,Marketing,Growth Specialist,65000,2,4,8
EMP-113,Finance,Senior Accountant,86000,7,3,16
EMP-114,Engineering,Lead Architect,162000,14,5,18
EMP-115,Sales,Account Executive,75000,5,3,20
EMP-116,Data,Data Analyst,79000,3,4,7
EMP-117,Engineering,Software Engineer,92000,4,4,14
EMP-118,Marketing,Content Strategist,62000,2,3,5
EMP-119,Finance,Finance Director,155000,15,4,24
EMP-120,Sales,Sales Representative,58000,1,3,12
EMP-121,Data,BI Engineer,94000,5,4,9
EMP-122,Engineering,DevOps Engineer,108000,6,4,16
EMP-123,Marketing,Brand Director,135000,11,4,15
EMP-124,Sales,Account Executive,78000,5,4,19
EMP-125,Data,Junior Analyst,56000,1,3,6
EMP-126,Engineering,Software Engineer,89000,3,4,13
EMP-127,Finance,Financial Analyst,76000,4,4,12
EMP-128,Engineering,Staff Engineer,148000,11,5,17
EMP-129,Sales,Sales Representative,60000,2,3,15
EMP-130,Data,Data Scientist,118000,7,4,11
EMP-131,Marketing,SEO Analyst,59000,2,3,7
EMP-132,Engineering,QA Lead,96000,7,4,10
EMP-133,Finance,Payroll Specialist,64000,3,3,8
EMP-134,Data,Data Analyst,81000,4,5,9
EMP-135,Sales,Regional VP,195000,16,5,25
EMP-136,Engineering,Software Engineer,87000,3,3,12
EMP-137,Executive,Chief Technology Officer,285000,20,5,30
EMP-138,Engineering,Software Engineer,88000,3,4,12
EMP-139,Sales,Account Executive,72000,4,3,18
EMP-140,Data,Data Analyst,76000,2,5,8`
  }
};

// Helper to load sample dataset
export function loadSampleDataset(sampleId: string): ParsedDataset {
  const sample = SAMPLE_DATASETS[sampleId] || SAMPLE_DATASETS.ecommerce_sales;
  const { columns, rows } = parseCSVString(sample.csv);
  return {
    filename: sample.meta.filename,
    file_type: "csv",
    columns,
    rows,
    row_count: rows.length,
    column_count: columns.length
  };
}

// ============================================================================
// 5. DATA LAB API WRAPPERS (HYBRID BACKEND + LOCAL FALLBACK)
// ============================================================================

export async function uploadDatasetFileToBackend(file: File): Promise<{
  success: boolean;
  parsed: ParsedDataset;
  analysis: DatasetAnalysis;
}> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/data-lab/upload`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Upload failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.warn("Backend upload failed, attempting local CSV parsing:", err.message);
    // If it's a CSV file, parse locally seamlessly!
    if (file.name.endsWith(".csv")) {
      const text = await file.text();
      const { columns, rows } = parseCSVString(text);
      const parsed: ParsedDataset = {
        filename: file.name,
        file_type: "csv",
        columns,
        rows,
        row_count: rows.length,
        column_count: columns.length
      };
      const analysis = analyzeDatasetLocally(parsed);
      return { success: true, parsed, analysis };
    }
    throw err;
  }
}
