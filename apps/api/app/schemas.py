from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None  # Google ID token string
    code: Optional[str] = None        # OAuth 2.0 authorization code
    redirect_uri: Optional[str] = None


class CertificateGenerateRequest(BaseModel):
    assessment_id: Optional[str] = None
    target_role: Optional[str] = None


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    current_role: Optional[str] = None
    target_role: Optional[str] = None
    career_goal: Optional[str] = None
    timeline_months: Optional[int] = None
    weekly_hours: Optional[float] = None
    settings: Optional[Dict[str, Any]] = None


class ConfirmProfileRequest(BaseModel):
    name: str
    current_role: Optional[str] = None
    years_experience_total: Optional[float] = None
    education: Optional[List[Dict[str, Any]]] = []
    experiences: Optional[List[Dict[str, Any]]] = []
    skills: Optional[List[Dict[str, Any]]] = []
    target_role: Optional[str] = "data_analyst"


class OnboardingRequest(BaseModel):
    user_id: Optional[str] = None
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
    user_id: Optional[str] = None
    assessment_id: str
    skill_id: str
    node_id: Optional[str] = None
    answers: Dict[str, str]  # question_id -> user answer string


class TutorRequest(BaseModel):
    user_id: Optional[str] = None
    message: str
    mode: str = "socratic"
    current_node_id: Optional[str] = None
    dataset_context: Optional[Dict[str, Any]] = None


class JobAnalysisRequest(BaseModel):
    user_id: Optional[str] = None
    job_title: str
    company: Optional[str] = None
    job_description_text: str


class UniversalATSAnalysisRequest(BaseModel):
    user_id: Optional[str] = None
    resume_text: Optional[str] = None
    job_id: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    company_type: Optional[str] = None  # "product" or "service"
    role_family: Optional[str] = None
    job_description_text: Optional[str] = None


class BulletAnalyzeRequest(BaseModel):
    bullet: str
    target_role: Optional[str] = None


class JobApplicationSaveRequest(BaseModel):
    user_id: Optional[str] = None
    job_id: Optional[str] = None
    company: str
    job_title: str
    fit_score: Optional[int] = 0
    status: Optional[str] = "Saved"
    notes: Optional[str] = ""


class ProjectSubmissionRequest(BaseModel):
    user_id: Optional[str] = None
    project_id: str
    submission_text: str
    code_solution: Optional[str] = None
    dataset_link: Optional[str] = None


class HumanOverrideRequest(BaseModel):
    user_id: Optional[str] = None
    target_type: str
    target_id: str
    override_value: str
    mentor_name: str
    reason: str


class DataLabAnalyzeRequest(BaseModel):
    filename: str
    file_type: str = "csv"
    columns: List[str]
    rows: List[Dict[str, Any]]


class DataLabCleanRequest(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    actions: List[Dict[str, Any]]

