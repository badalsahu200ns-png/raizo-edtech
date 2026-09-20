/**
 * RAIZO Certificate Eligibility Engine
 * Single source of truth calculation for certification eligibility, progress,
 * and requirements fulfillment.
 */

export interface CertificateRequirementItem {
  key: "modules" | "practice" | "assessment" | "score" | "projects";
  label: string;
  completed: boolean;
  statusText: string;
  detail: string;
}

export interface UserProgressInput {
  roadmap?: {
    nodes?: Array<{ id: string; status: string; is_remediation?: boolean }>;
    completed_nodes?: number;
    completion_percentage?: number;
  } | null;
  practiceSolved?: Record<string | number, boolean> | null;
  assessmentScore?: number | null;
  assessmentCompleted?: boolean | null;
  evidenceList?: Array<{
    id: string;
    evidence_type: string;
    score?: number;
  }> | null;
  backendEligibility?: {
    is_eligible?: boolean;
    score?: number;
    score_threshold?: number;
    assessment_completed?: boolean;
    score_passed?: boolean;
    remediation_completed?: boolean;
    milestones_completed?: number;
    milestones_passed?: boolean;
    existing_certificate?: any;
    certificate?: any;
  } | null;
  existingCertificate?: any | null;
}

export interface CertificateEligibilityResult {
  eligible: boolean;
  completionPercentage: number;
  missingRequirements: string[];
  assessmentScore: number;
  requiredScore: number;
  requirements: CertificateRequirementItem[];
  overallStatus: "CERTIFICATE ELIGIBLE" | "IN PROGRESS" | "NOT ELIGIBLE";
  existingCertificate?: any | null;
}

/**
 * Centrally calculates certificate eligibility according to RAIZO's
 * four core criteria: Learning Modules, Practice, Final Assessment (with required score),
 * and Projects / Evidence.
 */
export function getCertificateEligibility(progress: UserProgressInput): CertificateEligibilityResult {
  const existingCert = progress.existingCertificate || progress.backendEligibility?.existing_certificate || progress.backendEligibility?.certificate;

  const requiredScore = progress.backendEligibility?.score_threshold ?? 70;
  let assessmentScore = 0;
  if (typeof progress.assessmentScore === "number") {
    assessmentScore = progress.assessmentScore;
  } else if (typeof progress.backendEligibility?.score === "number") {
    assessmentScore = progress.backendEligibility.score;
  }

  // 1. Learning Modules
  const completedNodesCount = progress.roadmap?.completed_nodes ?? 0;
  const hasCompletedNodes = Boolean(
    completedNodesCount > 0 ||
    (progress.roadmap?.nodes && progress.roadmap.nodes.some(n => ["completed", "passed", "verified"].includes(n.status))) ||
    (progress.backendEligibility?.milestones_completed && progress.backendEligibility.milestones_completed > 0) ||
    progress.backendEligibility?.milestones_passed
  );

  // 2. Practice Exercises
  const solvedCount = progress.practiceSolved ? Object.values(progress.practiceSolved).filter(Boolean).length : 0;
  const hasPractice = Boolean(
    solvedCount > 0 ||
    (progress.evidenceList && progress.evidenceList.some(e => e.evidence_type === "applied_task" || e.evidence_type === "checkpoint"))
  );

  // 3. Final Assessment
  const assessmentTaken = Boolean(
    progress.assessmentCompleted ||
    progress.backendEligibility?.assessment_completed ||
    assessmentScore > 0
  );

  // 4. Assessment Score Threshold
  const scorePassed = Boolean(
    assessmentScore >= requiredScore ||
    progress.backendEligibility?.score_passed
  );

  const assessmentRequirementMet = Boolean(assessmentTaken && scorePassed);

  // 5. Projects & Empirical Evidence
  const evidenceCount = progress.evidenceList ? progress.evidenceList.length : 0;
  const hasEvidenceOrProject = Boolean(
    evidenceCount > 0 ||
    (progress.evidenceList && progress.evidenceList.some(e => e.evidence_type === "project" || e.evidence_type === "diagnostic"))
  );

  // Build Itemized Requirements List
  const requirements: CertificateRequirementItem[] = [
    {
      key: "modules",
      label: "Learning Modules",
      completed: hasCompletedNodes,
      statusText: hasCompletedNodes ? "Completed" : "Incomplete",
      detail: hasCompletedNodes
        ? "Prerequisite roadmap learning modules completed"
        : "Complete required learning modules in your roadmap"
    },
    {
      key: "practice",
      label: "Practice",
      completed: hasPractice,
      statusText: hasPractice ? "Completed" : "Incomplete",
      detail: hasPractice
        ? `${Math.max(solvedCount, 1)} practical exercise(s) completed`
        : "Complete required practice exercises in SQL & Analytics lab"
    },
    {
      key: "assessment",
      label: "Final Assessment",
      completed: assessmentRequirementMet,
      statusText: assessmentRequirementMet ? "Passed" : (assessmentTaken ? "Score Insufficient" : "Pending"),
      detail: assessmentRequirementMet
        ? "Official diagnostic benchmark passed"
        : "Complete the final assessment and pass"
    },
    {
      key: "score",
      label: "Required Score",
      completed: scorePassed,
      statusText: `${assessmentScore}% / ${requiredScore}%`,
      detail: scorePassed
        ? `Met required score benchmark (${assessmentScore}% >= ${requiredScore}%)`
        : `Assessment score must be at least ${requiredScore}% (Current: ${assessmentScore}%)`
    },
    {
      key: "projects",
      label: "Projects / Evidence",
      completed: hasEvidenceOrProject,
      statusText: hasEvidenceOrProject ? "Completed" : "Incomplete",
      detail: hasEvidenceOrProject
        ? `${Math.max(evidenceCount, 1)} verified evidence asset(s) on ledger`
        : "Complete required capstone project or evidence submission"
    }
  ];

  // Missing requirements list for learners
  const missingRequirements: string[] = [];
  if (!hasCompletedNodes) missingRequirements.push("Complete required learning modules");
  if (!hasPractice) missingRequirements.push("Complete required practice");
  if (!assessmentTaken) {
    missingRequirements.push("Complete the final assessment");
  } else if (!scorePassed) {
    missingRequirements.push(`Meet the required assessment score (${assessmentScore}% / ${requiredScore}%)`);
  }
  if (!hasEvidenceOrProject) missingRequirements.push("Complete required projects/evidence");

  // Core requirement categories (4 categories):
  // 1. Modules, 2. Practice, 3. Assessment & Score, 4. Projects / Evidence
  const coreChecks = [
    hasCompletedNodes,
    hasPractice,
    assessmentRequirementMet,
    hasEvidenceOrProject
  ];

  const completedCoreCount = coreChecks.filter(Boolean).length;
  let completionPercentage = Math.round((completedCoreCount / coreChecks.length) * 100);

  // Determine overall eligibility:
  // If user already has a valid issued certificate, they are eligible
  let eligible = false;
  if (existingCert && (existingCert.status === "valid" || existingCert.certificate_id)) {
    eligible = true;
    completionPercentage = 100;
  } else if (progress.backendEligibility?.is_eligible) {
    // If backend reports is_eligible = true
    eligible = true;
    completionPercentage = 100;
  } else {
    eligible = Boolean(completedCoreCount === coreChecks.length);
  }

  const overallStatus = eligible
    ? "CERTIFICATE ELIGIBLE"
    : completionPercentage > 0
    ? "IN PROGRESS"
    : "NOT ELIGIBLE";

  return {
    eligible,
    completionPercentage,
    missingRequirements,
    assessmentScore,
    requiredScore,
    requirements,
    overallStatus,
    existingCertificate: existingCert
  };
}
