import {
  UserProfile,
  LearnerSkill,
  EvidenceItem,
  GapMatrix,
  RoadmapDAG,
  Assessment,
  EvaluationResult,
  TutorMessage,
  AuditLogEntry
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {})
      },
      cache: "no-store"
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.detail || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.warn(`API request to ${endpoint} failed:`, err.message);
    throw err;
  }
}

export const api = {
  // Profile & Onboarding
  getProfile: (userId = "demo_learner_alex") =>
    fetchAPI<{ user: UserProfile; latest_resume: any; skills: LearnerSkill[] }>(
      `/profile?user_id=${userId}`
    ),

  updateProfile: (data: Partial<UserProfile>, userId = "demo_learner_alex") =>
    fetchAPI<{ success: boolean; message: string }>(`/profile?user_id=${userId}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  uploadResume: async (file: File, userId = "demo_learner_alex") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);

    const res = await fetch(`${API_BASE}/profile/upload`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to parse resume");
    }
    return res.json();
  },

  completeOnboarding: (data: any) =>
    fetchAPI<{ success: boolean; message: string }>("/onboarding/complete", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // Skills & Gaps
  getSkills: (userId = "demo_learner_alex") =>
    fetchAPI<{ skills: LearnerSkill[] }>(`/skills?user_id=${userId}`),

  getSkillDetail: (skillId: string, userId = "demo_learner_alex") =>
    fetchAPI<{
      skill: LearnerSkill;
      evidence_history: EvidenceItem[];
      submissions: any[];
      recommended_resources: any[];
    }>(`/skills/${skillId}?user_id=${userId}`),

  getGaps: (userId = "demo_learner_alex", targetRole = "data_analyst") =>
    fetchAPI<GapMatrix>(`/gaps?user_id=${userId}&target_role=${targetRole}`),

  // Roadmap DAG
  getRoadmap: (userId = "demo_learner_alex") =>
    fetchAPI<RoadmapDAG>(`/roadmap?user_id=${userId}`),

  generateRoadmap: (userId = "demo_learner_alex", targetRole = "data_analyst") =>
    fetchAPI<RoadmapDAG>(`/roadmap/generate?user_id=${userId}&target_role=${targetRole}`, {
      method: "POST"
    }),

  // Assessments
  generateAssessment: (type = "diagnostic", skillId?: string, nodeTitle?: string) => {
    const params = new URLSearchParams({ type });
    if (skillId) params.append("skill_id", skillId);
    if (nodeTitle) params.append("node_title", nodeTitle);
    return fetchAPI<Assessment>(`/assessment/generate?${params.toString()}`, {
      method: "POST"
    });
  },

  getAssessment: (assessmentId: string) =>
    fetchAPI<Assessment>(`/assessment/${assessmentId}`),

  submitAssessment: (payload: {
    user_id?: string;
    assessment_id: string;
    skill_id: string;
    node_id?: string;
    answers: Record<string, string>;
  }) =>
    fetchAPI<{
      evaluation: EvaluationResult;
      adaptation: any;
    }>("/assessment/submit", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  // Tutor
  sendTutorMessage: (payload: {
    user_id?: string;
    message: string;
    mode: string;
    current_node_id?: string;
  }) =>
    fetchAPI<TutorMessage>("/tutor/message", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  getTutorHistory: (userId = "demo_learner_alex") =>
    fetchAPI<{ messages: any[] }>(`/tutor/history?user_id=${userId}`),

  // Evidence Ledger
  getEvidence: (userId = "demo_learner_alex") =>
    fetchAPI<{ evidence: EvidenceItem[] }>(`/evidence?user_id=${userId}`),

  // Reports
  getWeeklyReport: (userId = "demo_learner_alex") =>
    fetchAPI<any>(`/reports/weekly?user_id=${userId}`),

  // Job Analyzer
  analyzeJob: (payload: {
    user_id?: string;
    job_title: string;
    company?: string;
    job_description_text: string;
  }) =>
    fetchAPI<any>("/job/analyze", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  // Projects
  getProjects: (userId = "demo_learner_alex") =>
    fetchAPI<{ projects: any[] }>(`/projects?user_id=${userId}`),

  submitProject: (payload: {
    user_id?: string;
    project_id: string;
    submission_text: string;
    code_solution?: string;
  }) =>
    fetchAPI<any>("/projects/submit", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  // Audit Logs
  getAuditLogs: (limit = 40) =>
    fetchAPI<{ logs: AuditLogEntry[] }>(`/audit/logs?limit=${limit}`),

  // Demo Reset & Human Override
  resetDemo: () =>
    fetchAPI<{ success: boolean; message: string }>("/demo/reset", {
      method: "POST"
    }),

  submitOverride: (payload: {
    user_id?: string;
    target_type: string;
    target_id: string;
    override_value: string;
    mentor_name: string;
    reason: string;
  }) =>
    fetchAPI<{ success: boolean; message: string }>("/override", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
