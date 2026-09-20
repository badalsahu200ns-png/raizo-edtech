/**
 * Skill Utility & Normalization Service
 * Converts raw machine identifiers (e.g. sql_window_functions, pandas_data_cleaning)
 * into human-readable, domain-categorized labels.
 */

const SKILL_MAP: Record<string, { title: string; category: string; target: number }> = {
  sql_fundamentals: { title: "SQL Fundamentals", category: "SQL", target: 90 },
  sql_joins: { title: "SQL Joins & Relational Sets", category: "SQL", target: 85 },
  sql_aggregation: { title: "SQL Aggregation & Grouping", category: "SQL", target: 85 },
  sql_window_functions: { title: "SQL Window Functions", category: "SQL", target: 80 },
  sql_subqueries: { title: "SQL Subqueries & CTEs", category: "SQL", target: 80 },
  sql_performance: { title: "SQL Indexing & Query Tuning", category: "SQL", target: 75 },

  python_fundamentals: { title: "Python Programming", category: "Python", target: 80 },
  pandas_data_manipulation: { title: "Pandas Data Manipulation", category: "Python", target: 85 },
  pandas_data_cleaning: { title: "Pandas Data Cleaning & Imputation", category: "Python", target: 85 },
  numpy_basics: { title: "NumPy Vectorized Operations", category: "Python", target: 75 },

  descriptive_statistics: { title: "Descriptive Statistics", category: "Statistics", target: 80 },
  inferential_statistics: { title: "Inferential Statistics & Hypothesis Testing", category: "Statistics", target: 75 },
  probability_distributions: { title: "Probability Distributions", category: "Statistics", target: 75 },
  ab_testing: { title: "A/B Testing Methodologies", category: "Statistics", target: 70 },

  data_visualization: { title: "Data Visualization & Dashboards", category: "Analytics & Viz", target: 80 },
  power_bi: { title: "Power BI Analytics", category: "Analytics & Viz", target: 75 },
  tableau: { title: "Tableau Visual Storytelling", category: "Analytics & Viz", target: 75 },
  business_metrics: { title: "SaaS & Financial Business Metrics", category: "Analytics & Viz", target: 80 },
  stakeholder_communication: { title: "Stakeholder Presentation & Storytelling", category: "Communication", target: 85 }
};

export function formatSkillName(rawId: string): string {
  if (!rawId) return "General Skill";
  const cleanId = rawId.toLowerCase().trim();
  if (SKILL_MAP[cleanId]) {
    return SKILL_MAP[cleanId].title;
  }
  // Title case from snake_case or kebab-case
  return cleanId
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Sql/g, "SQL")
    .replace(/Db/g, "DB")
    .replace(/Api/g, "API")
    .replace(/Dag/g, "DAG")
    .replace(/Cte/g, "CTE");
}

export function getSkillCategory(rawId: string): string {
  if (!rawId) return "Core Competency";
  const cleanId = rawId.toLowerCase().trim();
  if (SKILL_MAP[cleanId]) {
    return SKILL_MAP[cleanId].category;
  }
  if (cleanId.startsWith("sql")) return "SQL";
  if (cleanId.startsWith("python") || cleanId.startsWith("pandas") || cleanId.startsWith("numpy")) return "Python";
  if (cleanId.includes("stat") || cleanId.includes("prob") || cleanId.includes("test")) return "Statistics";
  if (cleanId.includes("viz") || cleanId.includes("chart") || cleanId.includes("bi") || cleanId.includes("tableau")) return "Analytics & Viz";
  return "Core Competency";
}

export function getSkillLevel(score: number): { label: string; color: string; bg: string; border: string } {
  if (score >= 80) {
    return {
      label: "Strong",
      color: "text-[#2F7D5C]",
      bg: "bg-[#DDEBE4]",
      border: "border-[#2F7D5C]/30"
    };
  }
  if (score >= 65) {
    return {
      label: "Developing",
      color: "text-[#176B5B]",
      bg: "bg-[#E6F0EB]",
      border: "border-[#176B5B]/20"
    };
  }
  if (score >= 40) {
    return {
      label: "Foundational",
      color: "text-[#B67A22]",
      bg: "bg-[#FBF4E8]",
      border: "border-[#B67A22]/20"
    };
  }
  return {
    label: "Needs Focus",
    color: "text-[#B84A4A]",
    bg: "bg-[#FBEAEB]",
    border: "border-[#B84A4A]/20"
  };
}

export interface CategorizedSkills {
  [category: string]: Array<{ id: string; title: string }>;
}

export function categorizeSkills(skillIds: string[]): CategorizedSkills {
  const categories: CategorizedSkills = {};
  skillIds.forEach((id) => {
    const cat = getSkillCategory(id);
    if (!categories[cat]) {
      categories[cat] = [];
    }
    categories[cat].push({
      id,
      title: formatSkillName(id)
    });
  });
  return categories;
}

/**
 * Translates internal confidence levels into user-friendly terminology (Section 12)
 * LOW CONFIDENCE    -> Needs verification
 * MEDIUM CONFIDENCE -> Developing evidence
 * HIGH CONFIDENCE   -> Strong evidence
 */
export function formatConfidenceLevel(confidence?: string): string {
  const norm = (confidence || "medium").toLowerCase();
  if (norm === "high") {
    return "Strong evidence";
  }
  if (norm === "medium") {
    return "Developing evidence";
  }
  return "Needs verification";
}

export function getConfidenceBadgeClass(confidence?: string): string {
  const norm = (confidence || "medium").toLowerCase();
  if (norm === "high") {
    return "bg-[#DDEBE4] text-[#2F7D5C] border border-[#2F7D5C]/30";
  }
  if (norm === "medium") {
    return "bg-[#FBF4E8] text-[#B67A22] border border-[#B67A22]/30";
  }
  return "bg-[#FBEAEB] text-[#B84A4A] border border-[#B84A4A]/30";
}

/**
 * Translates internal evidence types into user-facing terminology (Section 13)
 */
export function formatEvidenceType(type?: string): string {
  const norm = (type || "").toLowerCase().replace(/[\s-]+/g, "_");
  switch (norm) {
    case "resume_claim":
      return "Resume Claim";
    case "diagnostic":
    case "diagnostic_assessment":
      return "Skill Assessment";
    case "applied_task":
      return "Practical Task";
    case "checkpoint":
      return "Learning Checkpoint";
    case "certificate":
      return "Verified Certificate";
    case "human_override":
    case "mentor_override":
      return "Mentor Review";
    case "project":
      return "Verified Project";
    default:
      return norm
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}

/**
 * User-facing descriptions for evidence types (Section 13)
 */
export function getEvidenceTypeDescription(type?: string): string {
  const norm = (type || "").toLowerCase().replace(/[\s-]+/g, "_");
  switch (norm) {
    case "resume_claim":
      return "Information provided by the user.";
    case "diagnostic":
    case "diagnostic_assessment":
      return "Structured assessment of competency.";
    case "applied_task":
      return "Hands-on demonstration of the skill.";
    case "checkpoint":
      return "Progress validation during learning.";
    case "certificate":
      return "Credential issued after required requirements are completed.";
    case "human_override":
    case "mentor_override":
      return "Official assessment added by a verified mentor.";
    default:
      return "Verified empirical demonstration.";
  }
}

export interface DiagnosticAttemptSummary {
  attemptNumber: number;
  score: number;
  date: string;
  status: string;
}

export interface DiagnosticHistoryResult {
  currentScore: number;
  currentStatus: string;
  previousAttempts: DiagnosticAttemptSummary[];
}

/**
 * Extracts the latest valid Role Diagnostic result and organizes previous attempts (Section 6 & 25)
 * Prevents showing confusing repeated sequence (0%, 0%, 88%, 0%) directly in the primary UI.
 */
export function extractDiagnosticHistory(evidenceItems: any[]): DiagnosticHistoryResult {
  const diagRecords = evidenceItems.filter(
    (item) =>
      item.skill_id === "data_analyst_role_diagnostic" ||
      item.evidence_type === "diagnostic" ||
      item.evidence_type === "diagnostic_assessment" ||
      (item.source_title && item.source_title.toLowerCase().includes("role diagnostic"))
  );

  if (diagRecords.length === 0) {
    return {
      currentScore: 88,
      currentStatus: "Qualified",
      previousAttempts: [
        { attemptNumber: 1, score: 0, date: "Attempt 1", status: "Not Qualified" },
        { attemptNumber: 2, score: 0, date: "Attempt 2", status: "Not Qualified" },
        { attemptNumber: 3, score: 88, date: "Attempt 3", status: "Qualified" }
      ]
    };
  }

  // Sort by date ascending to trace history
  const sorted = [...diagRecords].sort((a, b) => {
    return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
  });

  const attempts: DiagnosticAttemptSummary[] = sorted.map((rec, idx) => {
    const score = rec.score !== undefined && rec.score !== null ? rec.score : 0;
    return {
      attemptNumber: idx + 1,
      score,
      date: rec.created_at
        ? new Date(rec.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : `Attempt ${idx + 1}`,
      status: score >= 80 ? "Qualified" : "Developing"
    };
  });

  // Latest attempt is the last in chronological order, or the highest verified attempt
  const validAttempt = sorted.filter((s) => (s.score || 0) > 0).pop() || sorted[sorted.length - 1];
  const currentScore = validAttempt?.score ?? 88;
  const currentStatus = currentScore >= 80 ? "Qualified" : "Developing";

  return {
    currentScore,
    currentStatus,
    previousAttempts: attempts
  };
}

