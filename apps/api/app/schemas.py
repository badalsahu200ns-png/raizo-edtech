from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    current_role: Optional[str] = None
    target_role: Optional[str] = None
    career_goal: Optional[str] = None
    timeline_months: Optional[int] = None
    weekly_hours: Optional[float] = None
    settings: Optional[Dict[str, Any]] = None


class OnboardingRequest(BaseModel):
    user_id: Optional[str] = "demo_learner_alex"
    name: str
    current_role: str
    years_experience: float
    education: str
    location: str
    industry: str
    target_role: str = "data_analyst"
    career_goal: str
    target_timeline_months: int = 4
    weekly_available_hours: float = 8.0
    self_reported_skills: List[Dict[str, Any]] = []


class AssessmentSubmissionRequest(BaseModel):
    user_id: Optional[str] = "demo_learner_alex"
    assessment_id: str
    skill_id: str
    node_id: Optional[str] = None
    answers: Dict[str, str]  # question_id -> user answer string


class TutorRequest(BaseModel):
    user_id: Optional[str] = "demo_learner_alex"
    message: str
    mode: str = "socratic"  # "socratic", "beginner", "technical", "analogy", "practice", "revision", "interview", "project_mentor"
    current_node_id: Optional[str] = None


class JobAnalysisRequest(BaseModel):
    user_id: Optional[str] = "demo_learner_alex"
    job_title: str
    company: Optional[str] = None
    job_description_text: str


class ProjectSubmissionRequest(BaseModel):
    user_id: Optional[str] = "demo_learner_alex"
    project_id: str
    submission_text: str
    code_solution: Optional[str] = None
    dataset_link: Optional[str] = None


class HumanOverrideRequest(BaseModel):
    user_id: Optional[str] = "demo_learner_alex"
    target_type: str  # "skill_score", "roadmap_node", "assessment_result"
    target_id: str
    override_value: str
    mentor_name: str
    reason: str
