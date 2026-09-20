export interface UserProfile {
  id: string;
  name: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  picture?: string;
  photo_url?: string;
  auth_provider?: string;
  provider_user_id?: string;
  email_verified?: boolean;
  is_google_verified?: boolean;
  onboarding_completed?: boolean;
  google_id?: string;
  current_role: string;
  target_role: string;
  career_goal: string;
  timeline_months: number;
  weekly_hours: number;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
}

export interface GoogleAuthResponse {
  success: boolean;
  token: string;
  expires_at?: string;
  is_new_user?: boolean;
  onboarding_completed?: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    display_name?: string;
    first_name?: string;
    last_name?: string;
    picture?: string;
    photo_url?: string;
    auth_provider?: string;
    provider_user_id?: string;
    email_verified?: boolean;
    is_google_verified: boolean;
    onboarding_completed?: boolean;
    current_role?: string;
    target_role?: string;
  };
}

export interface Certificate {
  id: string;
  certificate_id: string;
  user_id: string;
  recipient_name: string;
  track_title: string;
  skills_covered: string[];
  final_score: number;
  verification_hash: string;
  qr_code_url: string;
  pdf_download_url: string;
  issued_at: string;
  status: "valid" | "revoked";
  issuer_name?: string;
  issuer_title?: string;
  metadata?: Record<string, any>;
}

export interface CertificateEligibilityRequirement {
  key: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface CertificateEligibility {
  eligible: boolean;
  current_readiness_score: number;
  required_score: number;
  milestone_progress_percent: number;
  required_milestone_percent: number;
  has_unresolved_remediation: boolean;
  reasons: string[];
  requirements: CertificateEligibilityRequirement[];
  existing_certificate?: Certificate | null;
}

export interface LearnerSkill {
  skill_id: string;
  title: string;
  category: string;
  claimed_score: number;
  verified_score: number;
  status: "Proficient" | "Developing" | "Needs Remediation" | "Missing" | "Unverified";
  confidence: "low" | "medium" | "high";
  evidence_count: number;
  total_evidence?: number;
  last_evaluated_at?: string;
}

export interface EvidenceItem {
  id: string;
  skill_id: string;
  skill_title?: string;
  skill_category?: string;
  evidence_type: "resume_claim" | "diagnostic" | "checkpoint" | "applied_task" | "project" | "human_override";
  score?: number;
  confidence: "low" | "medium" | "high";
  source_title: string;
  details_json: string;
  created_at: string;
}

export interface SubSkillStatus {
  sub_skill_id: string;
  title: string;
  demonstrated: boolean;
  evidence_note: string;
}

export interface SkillGapItem {
  skill_id: string;
  title: string;
  category: string;
  current_score: number;
  required_score: number;
  gap_score: number;
  status: "Proficient" | "Partial" | "Missing" | "Unverified";
  confidence: "Low" | "Medium" | "High";
  strengths: string[];
  weaknesses: string[];
  sub_skills_breakdown: SubSkillStatus[];
  why_explanation: string;
  recommended_next_step: string;
  evidence_count: number;
}

export interface GapMatrix {
  target_role: string;
  overall_readiness_score: number;
  target_threshold: number;
  proficient_count: number;
  partial_count: number;
  missing_count: number;
  unverified_count: number;
  gap_items: SkillGapItem[];
  top_priority_gaps: string[];
  summary: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  skill_id: string;
  sub_skill_id?: string;
  category: string;
  description: string;
  learning_objective: string;
  learning_objectives?: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimated_duration_minutes: number;
  estimated_hours?: number;
  week?: number;
  prerequisites: string[];
  status: "locked" | "available" | "in_progress" | "needs_remediation" | "passed" | "completed";
  score?: number;
  confidence: "low" | "medium" | "high";
  is_remediation: boolean;
  remediation_for_node_id?: string;
  resource_ids: string[];
  week_assigned?: number;
  day_assigned?: string;
  order_index?: number;
}

export interface WeeklyPlanDay {
  day: string;
  nodes: RoadmapNode[];
  total_minutes: number;
}

export interface WeeklyPlan {
  week_number: number;
  days: WeeklyPlanDay[];
  total_hours: number;
  focus_skills: string[];
}

export interface RoadmapDAG {
  roadmap_id: string;
  target_role: string;
  user_id: string;
  weekly_hours_available: number;
  target_timeline_months: number;
  nodes: RoadmapNode[];
  weekly_plans: WeeklyPlan[];
  completed_nodes_count: number;
  total_nodes_count: number;
  completion_percentage: number;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface AssessmentQuestion {
  id: string;
  skill_id: string;
  sub_skill_id: string;
  type: "mcq" | "sql_query" | "python_code" | "short_answer" | "scenario";
  format?: string;
  prompt?: string;
  difficulty: string;
  question_text: string;
  code_snippet?: string;
  options?: (string | QuestionOption)[];
  correct_answer?: string;
  explanation?: string;
  prerequisite_concept: string;
  weight: number;
}

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  skill_id?: string;
  type: "diagnostic" | "checkpoint" | "remediation" | "applied_project";
  target_role: string;
  skills_covered: string[];
  time_limit_minutes: number;
  questions: AssessmentQuestion[];
  total_points: number;
}

export interface QuestionResult {
  question_id: string;
  skill_id: string;
  sub_skill_id: string;
  type: string;
  earned_score: number;
  max_score: number;
  is_correct: boolean;
  user_answer: string;
  correct_answer: string;
  explanation: string;
  prerequisite_concept: string;
  weakness_identified?: string;
  feedback: string;
}

export interface EvaluationResult {
  submission_id: string;
  assessment_id: string;
  skill_id: string;
  overall_score: number;
  score?: number;
  status: "needs_remediation" | "developing" | "proficient" | "strong";
  confidence: "low" | "medium" | "high";
  passed: boolean;
  identified_weaknesses: string[];
  root_cause_prerequisite?: string;
  strengths: string[];
  rubric_breakdown: Record<string, number>;
  detailed_feedback: string;
  feedback?: string;
  recommended_action: string;
  question_results: QuestionResult[];
}

export interface SourceCitation {
  title: string;
  url: string;
  provider_or_source: string;
  relevant_snippet: string;
}

export interface TutorMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  mode?: string;
  sources_used?: SourceCitation[];
  suggested_follow_ups?: string[];
  created_at?: string;
}

export interface AuditLogEntry {
  id?: number;
  timestamp: string;
  agent: string;
  action: string;
  input_ref: string;
  output_ref: string;
  status: string;
  duration_ms: number;
  details_json?: string;
  error?: string;
}

export interface JobCompany {
  name: string;
  industry: string;
  company_type: string;
  logo_url?: string;
}

export interface JobRole {
  title: string;
  family: string;
  level: string;
}

export interface JobLocation {
  city: string;
  country: string;
  workplace_type: string;
}

export interface JobRequirements {
  must_have: string[];
  strongly_preferred: string[];
  preferred: string[];
  nice_to_have?: string[];
}

export interface JobListing {
  id: string;
  company: JobCompany;
  role: JobRole;
  location: JobLocation;
  employment_type: string;
  description: string;
  requirements: JobRequirements;
  knowledge_breakdown?: Record<string, string[]>;
  recommended_project?: string;
  source?: string;
  source_type?: string;
  last_updated?: string;
}

export interface FitMatrixItem {
  requirement: string;
  importance: "Must Have" | "Preferred" | "Nice to Have" | string;
  resume_match: "Strong" | "Partial" | "Missing" | string;
  evidence: "High" | "Medium" | "None" | string;
  gap: "None" | "Low" | "Medium" | "High" | string;
}

export interface BulletAnalysis {
  original: string;
  action_verb: boolean;
  quantified_metric: boolean;
  business_impact: boolean;
  tool_named: boolean;
  quality_score: number;
  feedback: string;
  suggested_rewrite?: string | null;
}

export interface RoadmapWeek {
  week: string;
  focus: string;
  deliverable: string;
  status: "Completed" | "In Progress" | "Next Up" | "Planned" | string;
}

export interface InterviewPreparation {
  technical: string[];
  business: string[];
  behavioral: string[];
}

export interface ATSAnalysisResult {
  resume_id?: string;
  target_job_title: string;
  target_company: string;
  overall_match: number;
  ats_compatibility: number;
  required_skills_match: number;
  preferred_skills_match: number;
  technical_knowledge_match: number;
  experience_alignment: number;
  keyword_coverage: number;
  evidence_strength: number;
  education_match?: number;
  match_explanation: string;
  matched_skills: Array<{ skill: string; importance: string; status: string; evidence: string }>;
  partial_skills: Array<{ skill: string; importance: string; status: string; evidence: string }>;
  missing_skills: Array<{ skill: string; importance: string; status: string; evidence: string }>;
  knowledge_gaps: Array<{ concept: string; category: string; importance: string; raizo_module: string; recommended_action: string }>;
  experience_gaps: Array<{ area: string; deficiency: string; recommended_project: string }>;
  keyword_gaps: string[];
  bullet_reviews: BulletAnalysis[];
  resume_improvement_suggestions: Record<string, string[]>;
  fit_matrix: FitMatrixItem[];
  gap_closing_roadmap: RoadmapWeek[];
  interview_preparation: InterviewPreparation;
  anti_fabrication_warning: string;
}

export interface JobApplication {
  id: string;
  user_id: string;
  job_id?: string;
  company: string;
  job_title: string;
  fit_score: number;
  status: "Saved" | "Applied" | "Interviewing" | "Offer" | "Rejected";
  notes: string;
  updated_at: string;
  created_at: string;
}

// ==========================================
// RAIZO DATA ANALYSIS LAB TYPES
// ==========================================

export interface ParsedDataset {
  filename: string;
  file_type: string;
  columns: string[];
  rows: Record<string, any>[];
  row_count: number;
  column_count: number;
}

export interface ColumnStats {
  name: string;
  inferred_type: "numeric" | "categorical" | "datetime" | "boolean" | "text";
  semantic_meaning: string;
  semanticMeaning?: string;
  total_count: number;
  missing_count: number;
  missing_percentage: number;
  unique_count: number;
  sample_values: any[];
  numeric_stats?: {
    min: number;
    max: number;
    mean: number;
    median: number;
    std: number;
    q1: number;
    q3: number;
    iqr: number;
    skewness: string;
    outliers_count: number;
    outlier_values: number[];
  };
  top_categories?: Array<{ value: string; count: number; percentage: number }>;
}

export interface DataQualityAudit {
  total_rows: number;
  total_columns: number;
  duplicate_rows_count: number;
  duplicate_rows_percentage: number;
  duplicate_sample_indices: number[];
  total_missing_cells: number;
  missing_cells_percentage: number;
  columns_with_missing: Array<{
    column: string;
    missing_count: number;
    missing_percentage: number;
    sample_row_indices: number[];
  }>;
  casing_inconsistencies: Array<{
    column: string;
    variants: Array<{
      clean: string;
      original_variants: string[];
      count: number;
    }>;
  }>;
  outliers_detected: Array<{
    column: string;
    count: number;
    lower_bound: number;
    upper_bound: number;
    sample_values: number[];
  }>;
  data_health_score: number;
  health_label: string;
}

export interface CorrelationPair {
  col1: string;
  col2: string;
  r: number;
  strength: string;
  direction: string;
  description: string;
  caveat: string;
}

export interface RecommendedChartConfig {
  chart_type: "bar" | "line" | "histogram" | "box_plot" | "scatter" | "heatmap" | "pareto";
  title: string;
  rationale: string;
  x_axis: string;
  y_axis?: string;
  group_by?: string;
}

export interface EvidenceInsight {
  category: "trend" | "anomaly" | "quality" | "business";
  title: string;
  description: string;
  evidence: string;
  actionable_tip: string;
}

export interface LearningNote {
  topic: string;
  takeaway: string;
  real_world_application: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface DatasetAnalysis {
  dataset_summary: {
    filename: string;
    row_count: number;
    column_count: number;
    overview: string;
    business_context: string;
    target_role_relevance: string;
  };
  column_profiles: ColumnStats[];
  quality_audit: DataQualityAudit;
  correlation_matrix: {
    columns: string[];
    matrix: Record<string, Record<string, number | null>>;
    top_relationships: CorrelationPair[];
  };
  recommended_charts: RecommendedChartConfig[];
  evidence_insights: EvidenceInsight[];
  learning_notes: LearningNote[];
  quiz_questions: QuizQuestion[];
}

export interface CleaningAction {
  action: "remove_duplicates" | "impute_missing" | "trim_whitespace" | "standardize_casing" | "cap_outliers";
  column?: string;
  method?: "mean" | "median" | "mode" | "drop_row" | "forward_fill" | "custom";
  custom_value?: any;
  casing?: "title" | "lower" | "upper";
  outlier_treatment?: "winsorize" | "drop";
}

export interface CleaningTransformation {
  id: string;
  title: string;
  what_changed: string;
  why_recommended: string;
  affected_count: number;
  timestamp: string;
}

export interface CleaningResult {
  success: boolean;
  cleaned_rows: Record<string, any>[];
  cleanedRows?: Record<string, any>[];
  row_count: number;
  transformations: CleaningTransformation[];
  analysis: DatasetAnalysis;
}

export interface SampleDatasetMeta {
  id: string;
  name: string;
  filename: string;
  description: string;
  row_count: number;
  columns: string[];
  features: string[];
}

