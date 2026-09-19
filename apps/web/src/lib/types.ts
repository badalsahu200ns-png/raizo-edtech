export interface UserProfile {
  id: string;
  name: string;
  email: string;
  current_role: string;
  target_role: string;
  career_goal: string;
  timeline_months: number;
  weekly_hours: number;
  created_at?: string;
  updated_at?: string;
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
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimated_duration_minutes: number;
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
  difficulty: string;
  question_text: string;
  code_snippet?: string;
  options?: QuestionOption[];
  correct_answer?: string;
  explanation?: string;
  prerequisite_concept: string;
  weight: number;
}

export interface Assessment {
  id: string;
  title: string;
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
  status: "needs_remediation" | "developing" | "proficient" | "strong";
  confidence: "low" | "medium" | "high";
  passed: boolean;
  identified_weaknesses: string[];
  root_cause_prerequisite?: string;
  strengths: string[];
  rubric_breakdown: Record<string, number>;
  detailed_feedback: string;
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
