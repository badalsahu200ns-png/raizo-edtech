"use client";

import React, { useState, useMemo } from "react";
import { ParsedDataset, DatasetAnalysis, RecommendedChartConfig } from "@/lib/types";

interface VisualizationEngineProps {
  dataset: ParsedDataset;
  analysis: DatasetAnalysis;
}

export const VisualizationEngine: React.FC<VisualizationEngineProps> = ({ dataset, analysis }) => {
  const { column_profiles, recommended_charts } = analysis;

  const numericCols = useMemo(
    () => column_profiles.filter(p => p.inferred_type === "numeric").map(p => p.name),
    [column_profiles]
  );
  const categoricalCols = useMemo(
    () => column_profiles.filter(p => p.inferred_type === "categorical" || p.inferred_type === "text").map(p => p.name),
    [column_profiles]
  );
  const dateCols = useMemo(
    () => column_profiles.filter(p => p.inferred_type === "datetime").map(p => p.name),
    [column_profiles]
  );

  // Active chart configuration
  const defaultRec = recommended_charts[0] || {
    chart_type: "bar",
    title: "Category Distribution",
    rationale: "Default visualization",
    x_axis: categoricalCols[0] || dataset.columns[0],
    y_axis: numericCols[0]
  };

  const [chartType, setChartType] = useState<
    "bar" | "line" | "histogram" | "box_plot" | "scatter" | "heatmap" | "pareto"
  >(defaultRec.chart_type);
  const [xAxis, setXAxis] = useState<string>(defaultRec.x_axis || dataset.columns[0]);
  const [yAxis, setYAxis] = useState<string>(defaultRec.y_axis || numericCols[0] || dataset.columns[1] || dataset.columns[0]);
  const [aggregation, setAggregation] = useState<"sum" | "avg" | "count">("sum");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; text: string } | null>(null);

  // Synchronize when recommendation clicked
  const handleSelectRecommendation = (rec: RecommendedChartConfig) => {
    setChartType(rec.chart_type);
    setXAxis(rec.x_axis);
    if (rec.y_axis) setYAxis(rec.y_axis);
  };

  // SVG dimensions
  const svgWidth = 720;
  const svgHeight = 360;
  const padding = { top: 40, right: 40, bottom: 60, left: 70 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // 1. Data transformation for Bar & Pareto
  const aggregatedBarData = useMemo(() => {
    if (!xAxis) return [];
    const groups: Record<string, { sum: number; count: number }> = {};
    dataset.rows.forEach(r => {
      const key = String(r[xAxis] ?? "Missing");
      const num = typeof r[yAxis] === "number" ? r[yAxis] : 1;
      if (!groups[key]) groups[key] = { sum: 0, count: 0 };
      groups[key].sum += num;
      groups[key].count += 1;
    });

    let list: Array<{ label: string; value: number; count: number; cumPct?: number }> = Object.entries(groups).map(([label, info]) => {
      const value = aggregation === "sum" ? info.sum : aggregation === "avg" ? info.sum / info.count : info.count;
      return { label, value: Number(value.toFixed(2)), count: info.count };
    });

    if (chartType === "pareto") {
      list.sort((a, b) => b.value - a.value);
      const total = list.reduce((acc, item) => acc + item.value, 0);
      let running = 0;
      return list.map(item => {
        running += item.value;
        const cumPct = total > 0 ? Number(((running / total) * 100).toFixed(1)) : 0;
        return { ...item, cumPct };
      });
    }

    return list.slice(0, 15);
  }, [dataset, xAxis, yAxis, aggregation, chartType]);

  // 2. Data transformation for Line
  const lineData = useMemo(() => {
    if (!yAxis) return [];
    const valid = dataset.rows
      .map((r, i) => ({
        xLabel: String(r[xAxis] ?? `Row ${i + 1}`),
        val: typeof r[yAxis] === "number" ? r[yAxis] : null
      }))
      .filter(d => d.val !== null) as Array<{ xLabel: string; val: number }>;
    return valid.slice(0, 30);
  }, [dataset, xAxis, yAxis]);

  // 3. Data transformation for Histogram
  const histogramData = useMemo(() => {
    const colName = xAxis || numericCols[0];
    const vals = dataset.rows
      .map(r => r[colName])
      .filter(v => typeof v === "number" && !isNaN(v)) as number[];
    if (vals.length === 0) return { bins: [], min: 0, max: 0, mean: 0, median: 0 };

    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const numBins = Math.min(10, Math.max(5, Math.ceil(Math.sqrt(vals.length))));
    const binWidth = (max - min) / (numBins || 1);

    const bins: Array<{ binStart: number; binEnd: number; count: number; label: string }> = [];
    for (let b = 0; b < numBins; b++) {
      const start = min + b * binWidth;
      const end = b === numBins - 1 ? max : start + binWidth;
      const count = vals.filter(v => (b === numBins - 1 ? v >= start && v <= end : v >= start && v < end)).length;
      bins.push({
        binStart: Number(start.toFixed(1)),
        binEnd: Number(end.toFixed(1)),
        count,
        label: `${start.toFixed(1)}-${end.toFixed(1)}`
      });
    }

    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const sorted = [...vals].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    return { bins, min, max, mean, median };
  }, [dataset, xAxis, numericCols]);

  // 4. Data transformation for Box Plot
  const boxPlotData = useMemo(() => {
    const colName = yAxis || numericCols[0];
    const vals = dataset.rows
      .map(r => r[colName])
      .filter(v => typeof v === "number" && !isNaN(v)) as number[];
    if (vals.length < 4) return null;

    const sorted = [...vals].sort((a, b) => a - b);
    const n = sorted.length;
    const min = sorted[0];
    const max = sorted[n - 1];
    const q1 = sorted[Math.floor(n * 0.25)];
    const median = sorted[Math.floor(n * 0.5)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;
    const lowerFence = Math.max(min, q1 - 1.5 * iqr);
    const upperFence = Math.min(max, q3 + 1.5 * iqr);
    const outliers = sorted.filter(v => v < lowerFence || v > upperFence);

    return { min, max, q1, median, q3, iqr, lowerFence, upperFence, outliers, colName };
  }, [dataset, yAxis, numericCols]);

  // 5. Data transformation for Scatter Plot
  const scatterData = useMemo(() => {
    const valid: Array<{ x: number; y: number; label: string }> = [];
    dataset.rows.forEach(r => {
      const vX = r[xAxis];
      const vY = r[yAxis];
      if (typeof vX === "number" && !isNaN(vX) && typeof vY === "number" && !isNaN(vY)) {
        valid.push({ x: vX, y: vY, label: `${xAxis}: ${vX}, ${yAxis}: ${vY}` });
      }
    });
    return valid;
  }, [dataset, xAxis, yAxis]);

  // 6. Educational explanations
  const getEducationalContext = () => {
    switch (chartType) {
      case "bar":
        return {
          title: "Bar / Column Chart: Categorical Comparison",
          reading: `The horizontal X-axis shows categories of '${xAxis}', while the vertical Y-axis shows the aggregated '${yAxis}' (${aggregation}).`,
          takeaway: "Bar charts are optimal for discrete categories. The human eye easily judges differences in bar heights.",
          misuse: "Avoid using 3D bars or truncating the Y-axis baseline above zero, which artificially exaggerates minor differences."
        };
      case "line":
        return {
          title: "Line Chart: Continuous Trajectory & Trend",
          reading: `The X-axis follows sequence or time ('${xAxis}'), and the Y-axis tracks fluctuations in '${yAxis}'.`,
          takeaway: "Reveals trends, cycles, and momentum shifts over intervals.",
          misuse: "Do not use a line chart for categorical dimensions that have no natural logical ordering (e.g. Regions or Colors)."
        };
      case "histogram":
        return {
          title: "Histogram: Shape of the Distribution",
          reading: `The X-axis divides '${xAxis}' into contiguous bins, and the height reflects the frequency count of observations.`,
          takeaway: "Inspects whether your data is normally distributed (bell-shaped), right-skewed, or bimodal.",
          misuse: "Do not confuse histograms with bar charts. In histograms, the width represents a quantitative interval, not discrete labels."
        };
      case "box_plot":
        return {
          title: "Box Plot: Five-Number Summary & Outlier Bounds",
          reading: `Displays Min, Q1, Median (line in the box), Q3, Whiskers (1.5x IQR), and individual dots representing extreme outliers.`,
          takeaway: "The width of the box (IQR) shows where the central 50% of your data lives. Outliers stand out beyond the whiskers.",
          misuse: "A box plot obscures underlying distribution shapes like bimodal dips. Always complement with a histogram."
        };
      case "scatter":
        return {
          title: "Scatter Plot: Bivariate Co-variation",
          reading: `Each point maps a single observation's '${xAxis}' coordinate against its '${yAxis}' coordinate.`,
          takeaway: "Reveals clustering, linear correlations, heteroscedasticity, or non-linear curves between two continuous variables.",
          misuse: "Never conclude that variable X causes variable Y solely based on a linear scatter pattern without controlled experiments."
        };
      case "pareto":
        return {
          title: "Pareto Chart: The 80/20 Rule",
          reading: `Bars show categories in descending magnitude (left Y-axis), while the line shows cumulative percentage (right Y-axis, 0-100%).`,
          takeaway: "Quickly pinpoints the 'vital few' categories responsible for the vast majority of volume or cost.",
          misuse: "Only valid for ratio or count metrics where cumulative sums make analytical sense."
        };
      case "heatmap":
        return {
          title: "Correlation Heatmap: Multidimensional Matrix",
          reading: `Color intensity reveals linear Pearson correlation coefficients between numeric variables simultaneously.`,
          takeaway: "Enables rapid multi-variable collinearity screening across the entire feature set.",
          misuse: "Pearson correlation only detects linear relationships. U-shaped or curvilinear relationships will show r ≈ 0."
        };
    }
  };

  const edu = getEducationalContext();

  return (
    <div className="bg-[#151B23] rounded-3xl p-6 md:p-8 border border-[#27303B] shadow-sm space-y-8">
      {/* Header & Recommendations */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#5B8DEF]/15 text-[#5B8DEF] border border-[#5B8DEF]/20">
              Step 7
            </span>
            <h3 className="text-xl font-bold text-[#F5F7FA]">
              Interactive Visualization Engine
            </h3>
          </div>
          <p className="text-xs text-[#B4BDC8] mt-1">
            Pure responsive SVG analytics rendering with dynamic axes, aggregation controls, and grounded educational explanations.
          </p>
        </div>

        {/* Recommended Chart Badges */}
        <div className="flex flex-wrap items-center gap-1.5 self-start">
          <span className="text-[11px] font-bold text-[#7E8996] mr-1">Recommended:</span>
          {recommended_charts.slice(0, 3).map((rec, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectRecommendation(rec)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                chartType === rec.chart_type
                  ? "bg-[#5B8DEF] text-white border-[#5B8DEF] shadow-xs"
                  : "bg-[#11161D] hover:bg-[#1A212B] border-[#27303B] text-[#B4BDC8]"
              }`}
            >
              {rec.chart_type.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Selector & Axis Controls Bar */}
      <div className="p-4 rounded-2xl bg-[#11161D] border border-[#27303B] flex flex-wrap items-center justify-between gap-4">
        {/* Chart Type Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "bar", label: "Bar / Column" },
            { id: "line", label: "Line Chart" },
            { id: "histogram", label: "Histogram" },
            { id: "box_plot", label: "Box Plot" },
            { id: "scatter", label: "Scatter Plot" },
            { id: "pareto", label: "Pareto (80/20)" }
          ].map(ct => (
            <button
              key={ct.id}
              type="button"
              onClick={() => setChartType(ct.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                chartType === ct.id
                  ? "bg-[#5B8DEF] text-white shadow-xs"
                  : "bg-[#151B23] text-[#B4BDC8] hover:text-[#F5F7FA] hover:bg-[#1A212B] border border-[#27303B]"
              }`}
            >
              {ct.label}
            </button>
          ))}
        </div>

        {/* Dynamic Axis Pickers */}
        <div className="flex flex-wrap items-center gap-3">
          {/* X Axis */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-[#B4BDC8]">X-Axis:</span>
            <select
              value={xAxis}
              onChange={e => setXAxis(e.target.value)}
              className="text-xs py-1 px-2 rounded-lg border border-[#27303B] bg-[#151B23] text-[#F5F7FA] font-medium cursor-pointer"
            >
              {dataset.columns.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Y Axis (if applicable) */}
          {chartType !== "histogram" && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[#B4BDC8]">Y-Axis:</span>
              <select
                value={yAxis}
                onChange={e => setYAxis(e.target.value)}
                className="text-xs py-1 px-2 rounded-lg border border-[#27303B] bg-[#151B23] text-[#F5F7FA] font-medium cursor-pointer"
              >
                {numericCols.map(c => (
                  <option key={c} value={c}>
                    {c} (num)
                  </option>
                ))}
                {dataset.columns
                  .filter(c => !numericCols.includes(c))
                  .map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Aggregation (for bar/pareto) */}
          {(chartType === "bar" || chartType === "pareto") && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[#B4BDC8]">Aggregate:</span>
              <select
                value={aggregation}
                onChange={e => setAggregation(e.target.value as any)}
                className="text-xs py-1 px-2 rounded-lg border border-[#27303B] bg-[#151B23] text-[#F5F7FA] font-medium cursor-pointer"
              >
                <option value="sum">Sum</option>
                <option value="avg">Average (Mean)</option>
                <option value="count">Count of Rows</option>
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-[#27303B] bg-[#151B23] hover:bg-[#1A212B] text-[#B4BDC8] hover:text-[#F5F7FA] transition-colors cursor-pointer"
            title="Toggle fullscreen modal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* SVG Canvas Rendering Area */}
      <div className="relative border border-[#27303B] rounded-2xl p-4 bg-[#0B0F14] flex items-center justify-center overflow-x-auto min-h-[380px]">
        {/* Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none px-3 py-1.5 rounded-xl bg-[#151B23] border border-[#27303B] text-[#F5F7FA] text-xs shadow-xl font-mono"
            style={{
              left: `${hoveredPoint.x}px`,
              top: `${hoveredPoint.y - 40}px`,
              transform: "translateX(-50%)"
            }}
          >
            {hoveredPoint.text}
          </div>
        )}

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-3xl h-auto select-none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const y = padding.top + chartHeight * (1 - ratio);
            return (
              <line
                key={ratio}
                x1={padding.left}
                y1={y}
                x2={svgWidth - padding.right}
                y2={y}
                stroke="#27303B"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* 1. RENDER BAR CHART */}
          {chartType === "bar" &&
            aggregatedBarData.length > 0 &&
            (() => {
              const maxVal = Math.max(...aggregatedBarData.map(d => d.value), 1);
              const barWidth = Math.max(12, Math.min(45, chartWidth / aggregatedBarData.length - 10));

              return (
                <g>
                  {/* Y-Axis tick labels */}
                  {[0, 0.5, 1].map(r => (
                    <text
                      key={r}
                      x={padding.left - 10}
                      y={padding.top + chartHeight * (1 - r) + 4}
                      textAnchor="end"
                      className="text-[10px] fill-[#7E8996] font-mono"
                    >
                      {(maxVal * r).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </text>
                  ))}

                  {aggregatedBarData.map((d, idx) => {
                    const x = padding.left + (idx + 0.5) * (chartWidth / aggregatedBarData.length) - barWidth / 2;
                    const h = (d.value / maxVal) * chartHeight;
                    const y = padding.top + chartHeight - h;

                    return (
                      <g
                        key={idx}
                        className="cursor-pointer group"
                        onMouseEnter={e => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredPoint({
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            text: `${d.label}: ${d.value.toLocaleString()} (${aggregation})`
                          });
                        }}
                      >
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={Math.max(2, h)}
                          rx={4}
                          className="fill-[#5B8DEF] hover:fill-[#719DF5] transition-all"
                        />
                        {/* X-axis label */}
                        <text
                          x={x + barWidth / 2}
                          y={svgHeight - padding.bottom + 18}
                          textAnchor="middle"
                          className="text-[10px] fill-[#7E8996] truncate font-medium"
                          style={{ maxWidth: `${barWidth + 10}px` }}
                        >
                          {d.label.length > 10 ? `${d.label.slice(0, 9)}…` : d.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })()}

          {/* 2. RENDER LINE CHART */}
          {chartType === "line" &&
            lineData.length > 1 &&
            (() => {
              const maxVal = Math.max(...lineData.map(d => d.val));
              const minVal = Math.min(...lineData.map(d => d.val));
              const range = maxVal - minVal || 1;

              const points = lineData.map((d, idx) => {
                const x = padding.left + idx * (chartWidth / (lineData.length - 1));
                const y = padding.top + chartHeight - ((d.val - minVal) / range) * chartHeight;
                return { x, y, ...d };
              });

              const pathD = points.reduce((acc, p, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");

              return (
                <g>
                  {/* Y Axis Ticks */}
                  <text x={padding.left - 10} y={padding.top + 4} textAnchor="end" className="text-[10px] fill-[#7E8996] font-mono">
                    {maxVal.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </text>
                  <text x={padding.left - 10} y={padding.top + chartHeight + 4} textAnchor="end" className="text-[10px] fill-[#7E8996] font-mono">
                    {minVal.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </text>

                  {/* Line Path */}
                  <path d={pathD} fill="none" stroke="#5B8DEF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

                  {/* Area fill underneath */}
                  <path
                    d={`${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`}
                    fill="url(#blueGradient)"
                    opacity={0.15}
                  />

                  {/* Data Point Circles */}
                  {points.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={4}
                      className="fill-[#0B0F14] stroke-[#5B8DEF] stroke-2 hover:r-6 cursor-pointer transition-all"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          x: p.x,
                          y: p.y,
                          text: `${p.xLabel}: ${p.val.toLocaleString()}`
                        })
                      }
                    />
                  ))}
                </g>
              );
            })()}

          {/* 3. RENDER HISTOGRAM */}
          {chartType === "histogram" &&
            histogramData.bins.length > 0 &&
            (() => {
              const maxCount = Math.max(...histogramData.bins.map(b => b.count), 1);
              const binWidth = chartWidth / histogramData.bins.length - 4;

              // Mean and median line coordinates
              const meanX =
                histogramData.max > histogramData.min
                  ? padding.left + ((histogramData.mean - histogramData.min) / (histogramData.max - histogramData.min)) * chartWidth
                  : padding.left;
              const medianX =
                histogramData.max > histogramData.min
                  ? padding.left + ((histogramData.median - histogramData.min) / (histogramData.max - histogramData.min)) * chartWidth
                  : padding.left;

              return (
                <g>
                  {/* Frequency Bars */}
                  {histogramData.bins.map((b, idx) => {
                    const x = padding.left + idx * (chartWidth / histogramData.bins.length) + 2;
                    const h = (b.count / maxCount) * chartHeight;
                    const y = padding.top + chartHeight - h;

                    return (
                      <g
                        key={idx}
                        className="cursor-pointer group"
                        onMouseEnter={() =>
                          setHoveredPoint({
                            x: x + binWidth / 2,
                            y,
                            text: `Interval [${b.label}]: ${b.count} observations`
                          })
                        }
                      >
                        <rect x={x} y={y} width={binWidth} height={Math.max(2, h)} rx={2} className="fill-[#36C98F] hover:fill-[#4ADE80] transition-colors" />
                        <text x={x + binWidth / 2} y={svgHeight - padding.bottom + 16} textAnchor="middle" className="text-[9px] fill-[#7E8996] font-mono">
                          {b.binStart}
                        </text>
                      </g>
                    );
                  })}

                  {/* Mean Line (Blue dashed) */}
                  <line x1={meanX} y1={padding.top} x2={meanX} y2={padding.top + chartHeight} stroke="#5B8DEF" strokeWidth={2} strokeDasharray="4 2" />
                  <text x={meanX} y={padding.top - 8} textAnchor="middle" className="text-[10px] font-bold fill-[#5B8DEF]">
                    Mean ({histogramData.mean.toFixed(1)})
                  </text>

                  {/* Median Line (Amber solid) */}
                  <line x1={medianX} y1={padding.top} x2={medianX} y2={padding.top + chartHeight} stroke="#F2B84B" strokeWidth={2} />
                  <text x={medianX} y={padding.top - 20} textAnchor="middle" className="text-[10px] font-bold fill-[#F2B84B]">
                    Median ({histogramData.median.toFixed(1)})
                  </text>
                </g>
              );
            })()}

          {/* 4. RENDER BOX PLOT */}
          {chartType === "box_plot" &&
            boxPlotData &&
            (() => {
              const { min, max, q1, median, q3, lowerFence, upperFence, outliers } = boxPlotData;
              const range = max - min || 1;
              const scaleY = (v: number) => padding.top + chartHeight - ((v - min) / range) * chartHeight;

              const boxWidth = 140;
              const boxX = svgWidth / 2 - boxWidth / 2;

              const yQ3 = scaleY(q3);
              const yQ1 = scaleY(q1);
              const yMed = scaleY(median);
              const yLowFence = scaleY(lowerFence);
              const yUpFence = scaleY(upperFence);

              return (
                <g>
                  {/* Axis values */}
                  <text x={padding.left - 10} y={scaleY(max) + 4} textAnchor="end" className="text-[10px] fill-[#7E8996] font-mono">
                    Max: {max}
                  </text>
                  <text x={padding.left - 10} y={scaleY(min) + 4} textAnchor="end" className="text-[10px] fill-[#7E8996] font-mono">
                    Min: {min}
                  </text>

                  {/* Whisker stem */}
                  <line x1={svgWidth / 2} y1={yUpFence} x2={svgWidth / 2} y2={yQ3} stroke="#7E8996" strokeWidth={2} strokeDasharray="3 3" />
                  <line x1={svgWidth / 2} y1={yLowFence} x2={svgWidth / 2} y2={yQ1} stroke="#7E8996" strokeWidth={2} strokeDasharray="3 3" />

                  {/* Upper and Lower Fence Caps */}
                  <line x1={svgWidth / 2 - 25} y1={yUpFence} x2={svgWidth / 2 + 25} y2={yUpFence} stroke="#7E8996" strokeWidth={2} />
                  <line x1={svgWidth / 2 - 25} y1={yLowFence} x2={svgWidth / 2 + 25} y2={yLowFence} stroke="#7E8996" strokeWidth={2} />

                  {/* Interquartile Range (IQR) Box */}
                  <rect
                    x={boxX}
                    y={yQ3}
                    width={boxWidth}
                    height={yQ1 - yQ3}
                    rx={6}
                    className="fill-[#5B8DEF]/20 stroke-[#5B8DEF] stroke-2"
                  />

                  {/* Median Line */}
                  <line x1={boxX} y1={yMed} x2={boxX + boxWidth} y2={yMed} stroke="#F2B84B" strokeWidth={3} />
                  <text x={boxX + boxWidth + 8} y={yMed + 4} className="text-[11px] font-bold fill-[#F2B84B]">
                    Median: {median}
                  </text>

                  {/* Q1 & Q3 Labels */}
                  <text x={boxX + boxWidth + 8} y={yQ3 + 4} className="text-[10px] fill-[#7E8996] font-mono">
                    Q3 (75%): {q3}
                  </text>
                  <text x={boxX + boxWidth + 8} y={yQ1 + 4} className="text-[10px] fill-[#7E8996] font-mono">
                    Q1 (25%): {q1}
                  </text>

                  {/* Outlier Dots */}
                  {outliers.map((oVal, idx) => (
                    <circle
                      key={idx}
                      cx={svgWidth / 2}
                      cy={scaleY(oVal)}
                      r={5}
                      className="fill-[#E86A6A] stroke-[#0B0F14] stroke-2 cursor-pointer hover:r-7 transition-all"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          x: svgWidth / 2,
                          y: scaleY(oVal),
                          text: `Outlier Point: ${oVal}`
                        })
                      }
                    />
                  ))}
                </g>
              );
            })()}

          {/* 5. RENDER SCATTER PLOT */}
          {chartType === "scatter" &&
            scatterData.length > 0 &&
            (() => {
              const xVals = scatterData.map(d => d.x);
              const yVals = scatterData.map(d => d.y);
              const minX = Math.min(...xVals);
              const maxX = Math.max(...xVals);
              const minY = Math.min(...yVals);
              const maxY = Math.max(...yVals);

              const rangeX = maxX - minX || 1;
              const rangeY = maxY - minY || 1;

              return (
                <g>
                  {/* Axis bounds */}
                  <text x={padding.left - 8} y={padding.top + 4} textAnchor="end" className="text-[10px] fill-[#7E8996] font-mono">
                    {maxY.toFixed(1)}
                  </text>
                  <text x={padding.left - 8} y={padding.top + chartHeight + 4} textAnchor="end" className="text-[10px] fill-[#7E8996] font-mono">
                    {minY.toFixed(1)}
                  </text>
                  <text x={padding.left} y={svgHeight - padding.bottom + 16} textAnchor="start" className="text-[10px] fill-[#7E8996] font-mono">
                    {minX.toFixed(1)}
                  </text>
                  <text x={svgWidth - padding.right} y={svgHeight - padding.bottom + 16} textAnchor="end" className="text-[10px] fill-[#7E8996] font-mono">
                    {maxX.toFixed(1)}
                  </text>

                  {scatterData.map((d, idx) => {
                    const cx = padding.left + ((d.x - minX) / rangeX) * chartWidth;
                    const cy = padding.top + chartHeight - ((d.y - minY) / rangeY) * chartHeight;

                    return (
                      <circle
                        key={idx}
                        cx={cx}
                        cy={cy}
                        r={4}
                        className="fill-[#5B8DEF] hover:fill-[#F2B84B] opacity-80 hover:opacity-100 cursor-pointer transition-all hover:r-6"
                        onMouseEnter={() =>
                          setHoveredPoint({
                            x: cx,
                            y: cy,
                            text: d.label
                          })
                        }
                      />
                    );
                  })}
                </g>
              );
            })()}

          {/* 6. RENDER PARETO CHART */}
          {chartType === "pareto" &&
            aggregatedBarData.length > 0 &&
            (() => {
              const maxVal = Math.max(...aggregatedBarData.map(d => d.value), 1);
              const barWidth = Math.max(12, Math.min(36, chartWidth / aggregatedBarData.length - 8));

              const cumPoints = aggregatedBarData.map((d, idx) => {
                const x = padding.left + (idx + 0.5) * (chartWidth / aggregatedBarData.length);
                const y = padding.top + chartHeight - ((d.cumPct || 0) / 100) * chartHeight;
                return { x, y, cumPct: d.cumPct, label: d.label };
              });

              const pathCum = cumPoints.reduce((acc, p, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");

              // 80% reference line
              const y80 = padding.top + chartHeight * 0.2;

              return (
                <g>
                  {/* 80% Threshold Line */}
                  <line x1={padding.left} y1={y80} x2={svgWidth - padding.right} y2={y80} stroke="#E86A6A" strokeWidth={1.5} strokeDasharray="4 2" />
                  <text x={svgWidth - padding.right + 6} y={y80 + 4} className="text-[10px] font-bold fill-[#E86A6A]">
                    80% Cutoff
                  </text>

                  {/* Bars */}
                  {aggregatedBarData.map((d, idx) => {
                    const x = padding.left + (idx + 0.5) * (chartWidth / aggregatedBarData.length) - barWidth / 2;
                    const h = (d.value / maxVal) * chartHeight;
                    const y = padding.top + chartHeight - h;

                    return (
                      <g key={idx}>
                        <rect x={x} y={y} width={barWidth} height={Math.max(2, h)} rx={2} className="fill-[#5B8DEF]/80 hover:fill-[#5B8DEF]" />
                        <text x={x + barWidth / 2} y={svgHeight - padding.bottom + 14} textAnchor="middle" className="text-[9px] fill-[#7E8996] font-medium truncate">
                          {d.label.slice(0, 7)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Cumulative percentage line */}
                  <path d={pathCum} fill="none" stroke="#7C6CF2" strokeWidth={2.5} />
                  {cumPoints.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={3.5}
                      className="fill-[#7C6CF2] stroke-[#0B0F14] stroke-2 cursor-pointer hover:r-5"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          x: p.x,
                          y: p.y,
                          text: `${p.label}: Cumulative ${p.cumPct}%`
                        })
                      }
                    />
                  ))}
                </g>
              );
            })()}

          {/* Gradients */}
          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5B8DEF" />
              <stop offset="100%" stopColor="#0B0F14" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* "What Am I Looking At?" Pedagogical Card */}
      <div className="p-6 rounded-2xl bg-[#11161D] border border-[#27303B] space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5B8DEF]" />
          <h4 className="text-sm font-bold text-[#F5F7FA]">
            What Am I Looking At? — {edu.title}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#151B23] border border-[#27303B] space-y-1">
            <span className="font-bold text-[#F5F7FA]">Reading The Axes:</span>
            <p className="text-[#B4BDC8] leading-relaxed text-[11px]">{edu.reading}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#151B23] border border-[#27303B] space-y-1">
            <span className="font-bold text-[#36C98F]">Key Analytical Takeaway:</span>
            <p className="text-[#B4BDC8] leading-relaxed text-[11px]">{edu.takeaway}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#151B23] border border-[#27303B] space-y-1">
            <span className="font-bold text-[#F2B84B]">Common Misinterpretation:</span>
            <p className="text-[#B4BDC8] leading-relaxed text-[11px]">{edu.misuse}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
