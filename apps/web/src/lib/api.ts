import {
  UserProfile,
  LearnerSkill,
  EvidenceItem,
  GapMatrix,
  RoadmapDAG,
  Assessment,
  EvaluationResult,
  TutorMessage,
  AuditLogEntry,
  AuthResponse,
  Certificate,
  CertificateEligibility,
  JobListing,
  ATSAnalysisResult,
  BulletAnalysis,
  JobApplication
} from "./types";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

function getAuthHeader(): Record<string, string> {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("raizo_token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
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
  // Session Authentication
  demoLogin: () =>
    fetchAPI<AuthResponse>("/auth/demo", {
      method: "POST"
    }),

  logout: () =>
    fetchAPI<{ success: boolean; message: string }>("/auth/logout", {
      method: "POST"
    }),

  getMe: () =>
    fetchAPI<{ authenticated?: boolean; user: UserProfile | null; is_demo?: boolean }>("/auth/me"),

  // Profile & Resume Lifecycle
  uploadResumeFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/profile/upload-resume`, {
      method: "POST",
      headers: {
        ...getAuthHeader()
      },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to parse resume");
    }
    return res.json();
  },

  getActiveResume: () =>
    fetchAPI<{ has_resume: boolean; document: any }>("/profile/resume"),

  deleteResume: (documentId: string) =>
    fetchAPI<{ success: boolean; message: string }>(`/profile/resume/${documentId}`, {
      method: "DELETE"
    }),

  reprocessResume: (documentId: string) =>
    fetchAPI<{ success: boolean; message: string; extracted_profile: any }>(
      `/profile/resume/${documentId}/reprocess`,
      { method: "POST" }
    ),

  confirmResumeProfile: (documentId: string, payload: any) =>
    fetchAPI<{ success: boolean; message: string; skills_registered: number }>(
      `/profile/resume/${documentId}/confirm`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    ),

  getProfile: (userId?: string) => {
    const query = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    return fetchAPI<{ user: UserProfile; latest_resume: any; skills: LearnerSkill[] }>(
      `/profile${query}`
    );
  },

  updateProfile: (data: Partial<UserProfile>, userId?: string) => {
    const query = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    return fetchAPI<{ success: boolean; message: string }>(`/profile${query}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  uploadResume: async (file: File, userId?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (userId) {
      formData.append("user_id", userId);
    }

    const res = await fetch(`${API_BASE}/profile/upload`, {
      method: "POST",
      headers: {
        ...getAuthHeader()
      },
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
  getSkills: (userId?: string) => {
    const query = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    return fetchAPI<{ skills: LearnerSkill[] }>(`/skills${query}`);
  },

  getSkillDetail: (skillId: string, userId?: string) => {
    const query = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    return fetchAPI<{
      skill: LearnerSkill;
      evidence_history: EvidenceItem[];
      submissions: any[];
      recommended_resources: any[];
    }>(`/skills/${skillId}${query}`);
  },

  getGaps: (userId?: string, targetRole = "data_analyst") => {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId);
    if (targetRole) params.append("target_role", targetRole);
    const query = params.toString() ? `?${params.toString()}` : "";
    return fetchAPI<GapMatrix>(`/gaps${query}`);
  },

  // Roadmap DAG
  getRoadmap: (userId?: string) => {
    const query = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    return fetchAPI<RoadmapDAG>(`/roadmap${query}`);
  },

  generateRoadmap: (userId?: string, targetRole = "data_analyst") => {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId);
    if (targetRole) params.append("target_role", targetRole);
    const query = params.toString() ? `?${params.toString()}` : "";
    return fetchAPI<RoadmapDAG>(`/roadmap/generate${query}`, {
      method: "POST"
    });
  },

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
      certificate?: any;
      diagnostic?: any;
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
    dataset_context?: Record<string, any>;
  }) =>
    fetchAPI<TutorMessage>("/tutor/message", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  getTutorHistory: (userId?: string) => {
    const query = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    return fetchAPI<{ messages: any[] }>(`/tutor/history${query}`);
  },

  // Evidence Ledger
  getEvidence: (userId?: string) => {
    const query = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    return fetchAPI<{ evidence: EvidenceItem[] }>(`/evidence${query}`);
  },

  // Reports
  getWeeklyReport: (userId?: string) => {
    const query = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    return fetchAPI<any>(`/reports/weekly${query}`);
  },

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
  getProjects: (userId?: string) => {
    const query = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    return fetchAPI<{ projects: any[] }>(`/projects${query}`);
  },

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
    }),

  // RAIZO Learning Completion Certificate Endpoints
  checkCertificateEligibility: () =>
    fetchAPI<CertificateEligibility>("/certificate/eligibility"),

  generateCertificate: (data?: { recipient_name?: string; track_title?: string }) =>
    fetchAPI<{ success: boolean; certificate: Certificate; message: string }>("/certificate/generate", {
      method: "POST",
      body: JSON.stringify(data || {})
    }),

  getCertificates: () =>
    fetchAPI<{ certificates: Certificate[] }>("/certificate"),

  getCertificate: (id: string) =>
    fetchAPI<{ certificate: Certificate }>(`/certificate/${id}`),

  verifyCertificate: (certificateId: string) =>
    fetchAPI<{ valid: boolean; certificate: Certificate | null; error?: string }>(
      `/certificate/verify/${certificateId}`
    ),

  getCertificatePdfUrl: (certificateId: string) =>
    `${API_BASE}/certificate/${certificateId}/pdf`,

  getCertificateQrUrl: (certificateId: string) =>
    `${API_BASE}/certificate/${certificateId}/qr`,

  // Career Intelligence & Universal ATS Gap Analyzer
  getCareerTaxonomy: () =>
    fetchAPI<{ roles: Record<string, any> }>("/career-intelligence/taxonomy"),

  getCareerJobs: (params?: { q?: string; company_type?: string; family?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.append("q", params.q);
    if (params?.company_type) searchParams.append("company_type", params.company_type);
    if (params?.family) searchParams.append("family", params.family);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    const query = searchParams.toString();
    return fetchAPI<{ jobs: JobListing[]; total: number }>(`/career-intelligence/jobs${query ? `?${query}` : ""}`);
  },

  getCareerJobById: (jobId: string) =>
    fetchAPI<JobListing>(`/career-intelligence/jobs/${jobId}`),

  analyzeCareerFit: (data: {
    resume_text?: string;
    job_id?: string;
    job_title?: string;
    company?: string;
    company_type?: string;
    role_family?: string;
    job_description_text?: string;
  }) =>
    fetchAPI<{ analysis_id: string; job_info: JobListing; result: ATSAnalysisResult }>(
      "/career-intelligence/analyze",
      {
        method: "POST",
        body: JSON.stringify(data)
      }
    ),

  analyzeBullet: (bullet: string, target_role?: string) =>
    fetchAPI<BulletAnalysis>("/career-intelligence/bullet-analyzer", {
      method: "POST",
      body: JSON.stringify({ bullet, target_role })
    }),

  getJobApplications: () =>
    fetchAPI<{ applications: JobApplication[] }>("/career-intelligence/applications"),

  saveJobApplication: (data: Partial<JobApplication>) =>
    fetchAPI<{ success: boolean; id: string; status: string }>("/career-intelligence/applications", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  getCareerAnalysisHistory: () =>
    fetchAPI<{ history: any[] }>("/career-intelligence/history"),

  // Data Analysis Lab
  uploadDataLabFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/data-lab/upload`, {
      method: "POST",
      headers: {
        ...getAuthHeader()
      },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Upload failed with status ${res.status}`);
    }
    return res.json();
  },

  analyzeDataLabDataset: (data: {
    filename: string;
    file_type?: string;
    columns: string[];
    rows: Record<string, any>[];
  }) =>
    fetchAPI<{ success: boolean; analysis: any }>("/data-lab/analyze", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  cleanDataLabDataset: (data: {
    columns: string[];
    rows: Record<string, any>[];
    actions: any[];
  }) =>
    fetchAPI<{
      success: boolean;
      cleaned_rows: Record<string, any>[];
      row_count: number;
      transformations: any[];
      analysis: any;
    }>("/data-lab/clean", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  getDataLabSamples: () =>
    fetchAPI<{ samples: any[] }>("/data-lab/samples")
};
