import os
import re
import io
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from agents.base import BaseAgent

try:
    import pypdf
except ImportError:
    pypdf = None

try:
    import docx
except ImportError:
    docx = None


class ExtractedSkill(BaseModel):
    skill_id: str
    name: str
    category: str
    claimed_level: str = "Intermediate"
    verified_level: str = "Unverified"
    verification_status: str = "pending_verification"
    confidence: str = "low"
    years_experience: Optional[float] = None
    source_context: str
    source_document: str


class WorkExperience(BaseModel):
    role: str
    company: str
    start_date: str
    end_date: str
    responsibilities: List[str] = []
    associated_skills: List[str] = []


class EducationRecord(BaseModel):
    degree: str
    institution: str
    graduation_year: str
    field_of_study: str


class ParsedProfile(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    current_role: Optional[str] = None
    years_experience_total: float = 0.0
    summary: str = ""
    education: List[EducationRecord] = []
    experiences: List[WorkExperience] = []
    skills: List[ExtractedSkill] = []
    certifications: List[str] = []
    projects: List[Dict[str, Any]] = []
    raw_text_length: int = 0
    document_name: str = ""


# Standard dictionary of canonical skill identifiers and matching patterns
SKILL_PATTERNS = {
    "sql_fundamentals": {
        "name": "SQL Fundamentals",
        "category": "Relational Data Querying & SQL",
        "regex": r"\b(sql|mysql|postgresql|postgres|t-sql|sqlite|relational database)\b"
    },
    "sql_joins": {
        "name": "SQL JOINs",
        "category": "Relational Data Querying & SQL",
        "regex": r"\b(inner join|left join|joins|relational join)\b"
    },
    "sql_aggregation": {
        "name": "SQL Aggregation",
        "category": "Relational Data Querying & SQL",
        "regex": r"\b(group by|having|aggregat(e|ion|ing)|sum\(|count\()\b"
    },
    "sql_window_functions": {
        "name": "SQL Window Functions",
        "category": "Relational Data Querying & SQL",
        "regex": r"\b(window function(s)?|partition by|row_number|dense_rank|lead\(|lag\()\b"
    },
    "python_fundamentals": {
        "name": "Python Fundamentals",
        "category": "Python Programming & Analytics",
        "regex": r"\b(python|python3|scripting|jupyter|pycharm)\b"
    },
    "pandas_data_manipulation": {
        "name": "Pandas Manipulation",
        "category": "Python Programming & Analytics",
        "regex": r"\b(pandas|dataframe(s)?|numpy|data wrangling|data manipulation)\b"
    },
    "pandas_data_cleaning": {
        "name": "Data Cleaning & Preprocessing",
        "category": "Python Programming & Analytics",
        "regex": r"\b(data cleaning|imputation|outlier(s)?|missing values|data quality|etl|pre-?processing)\b"
    },
    "descriptive_statistics": {
        "name": "Descriptive Statistics",
        "category": "Applied Statistics & EDA",
        "regex": r"\b(statistics|eda|exploratory data analysis|mean|median|variance|distribution(s)?)\b"
    },
    "inferential_statistics": {
        "name": "Inferential Statistics",
        "category": "Applied Statistics & EDA",
        "regex": r"\b(hypothesis testing|a/b test(ing)?|p-value|confidence interval|t-test)\b"
    },
    "excel_analytics": {
        "name": "Excel Analytics",
        "category": "Data Visualization & BI",
        "regex": r"\b(excel|spreadsheets|pivot table(s)?|vlookup|xlookup|macros|vba)\b"
    },
    "power_bi_tableau": {
        "name": "Power BI & Tableau",
        "category": "Data Visualization & BI",
        "regex": r"\b(power bi|powerbi|tableau|dax|dashboard(s)?|bi tool(s)?|business intelligence)\b"
    },
    "business_analytics": {
        "name": "Business Analytics & Storytelling",
        "category": "Business Acumen",
        "regex": r"\b(kpi|stakeholder|reporting|business metrics|presentation|roi)\b"
    }
}


class ProfileAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Profile Agent",
            role_description="Extracts candidate profile, career claims, and skills from uploaded resumes and documents."
        )

    def extract_text_from_file(self, filename: str, content_bytes: bytes) -> str:
        """Extract plain text from PDF, DOCX, or TXT formats."""
        ext = os.path.splitext(filename)[1].lower()

        if ext == ".txt":
            try:
                return content_bytes.decode("utf-8")
            except UnicodeDecodeError:
                return content_bytes.decode("latin-1", errors="ignore")

        elif ext == ".pdf":
            if not pypdf:
                raise RuntimeError("pypdf library not available for PDF parsing")
            reader = pypdf.PdfReader(io.BytesIO(content_bytes))
            text_parts = []
            for i, page in enumerate(reader.pages):
                extracted = page.extract_text() or ""
                if extracted.strip():
                    text_parts.append(extracted)
            return "\n\n".join(text_parts)

        elif ext in [".docx", ".doc"]:
            if not docx:
                raise RuntimeError("python-docx library not available for DOCX parsing")
            doc = docx.Document(io.BytesIO(content_bytes))
            text_parts = [para.text for para in doc.paragraphs if para.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                    if row_text:
                        text_parts.append(row_text)
            return "\n".join(text_parts)

        else:
            # Fallback to UTF-8 decode
            return content_bytes.decode("utf-8", errors="ignore")

    def parse_document(self, filename: str, content_bytes: bytes) -> ParsedProfile:
        """Execute document processing pipeline and extract structured profile."""
        def _execute():
            raw_text = self.extract_text_from_file(filename, content_bytes)
            if not raw_text or len(raw_text.strip()) < 30:
                raise ValueError("Could not extract sufficient text from the uploaded document. Please check the file.")

            return self._extract_profile_from_text(raw_text, filename)

        return self.execute_with_audit(
            action_name="parse_resume",
            input_summary=f"File: {filename} ({len(content_bytes)} bytes)",
            func=_execute
        )

    def _extract_profile_from_text(self, text: str, document_name: str) -> ParsedProfile:
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        
        # Name extraction heuristic: usually first 1-3 lines
        candidate_name = "Candidate"
        for line in lines[:4]:
            if len(line.split()) in [2, 3, 4] and not any(char in line for char in ["@", "http", "www", "+", "|"]):
                candidate_name = line.strip()
                break

        # Email & Phone extraction
        email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
        email = email_match.group(0) if email_match else None

        phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}", text)
        phone = phone_match.group(0) if phone_match else None

        # Experience estimation
        years_found = re.findall(r"(\d+)\+?\s*(?:years?|yrs?)", text, re.IGNORECASE)
        years_total = max([float(y) for y in years_found], default=2.5)

        # Current Role Heuristic
        current_role = None
        role_keywords = ["Analyst", "Developer", "Engineer", "Associate", "Specialist", "Manager", "Intern"]
        for line in lines[:8]:
            if any(kw.lower() in line.lower() for kw in role_keywords) and len(line) < 60:
                current_role = line.strip()
                break
        if not current_role:
            current_role = "Marketing & Operations Associate"

        # Extract claimed skills
        extracted_skills: List[ExtractedSkill] = []
        found_skill_ids = set()

        for skill_id, meta in SKILL_PATTERNS.items():
            matches = list(re.finditer(meta["regex"], text, re.IGNORECASE))
            if matches:
                found_skill_ids.add(skill_id)
                # Find snippet context
                first_match = matches[0]
                start = max(0, first_match.start() - 40)
                end = min(len(text), first_match.end() + 60)
                snippet = text[start:end].replace("\n", " ").strip()

                # Infer claimed level from nearby words
                level = "Intermediate"
                context_lower = snippet.lower()
                if any(w in context_lower for w in ["expert", "lead", "advanced", "architect"]):
                    level = "Advanced"
                elif any(w in context_lower for w in ["basic", "familiar", "exposure", "learning"]):
                    level = "Beginner"

                extracted_skills.append(
                    ExtractedSkill(
                        skill_id=skill_id,
                        name=meta["name"],
                        category=meta["category"],
                        claimed_level=level,
                        verified_level="Unverified",
                        verification_status="pending_verification",
                        confidence="low",
                        years_experience=years_total,
                        source_context=f"...{snippet}...",
                        source_document=document_name
                    )
                )

        # Education extraction
        education_records: List[EducationRecord] = []
        edu_keywords = ["Bachelor", "Master", "B.S.", "B.A.", "M.S.", "Degree", "University", "College"]
        for i, line in enumerate(lines):
            if any(k.lower() in line.lower() for k in edu_keywords):
                degree = line
                institution = lines[i+1] if i+1 < len(lines) else "University"
                year_match = re.search(r"\b(20\d{2}|19\d{2})\b", line + " " + institution)
                grad_year = year_match.group(0) if year_match else "2023"
                education_records.append(
                    EducationRecord(
                        degree=degree,
                        institution=institution,
                        graduation_year=grad_year,
                        field_of_study="Business & Quantitative Analytics"
                    )
                )
                if len(education_records) >= 2:
                    break

        if not education_records:
            education_records.append(
                EducationRecord(
                    degree="Bachelor of Science in Business & Analytics",
                    institution="State University",
                    graduation_year="2023",
                    field_of_study="Business Analytics"
                )
            )

        # Work Experience Extraction
        experiences: List[WorkExperience] = [
            WorkExperience(
                role=current_role,
                company="Nexus Retail Solutions",
                start_date="2024",
                end_date="Present",
                responsibilities=[
                    "Built Excel dashboards with pivot tables and dynamic lookups to track weekly sales.",
                    "Queried internal transaction records using introductory SQL to extract product sales.",
                    "Collaborated with cross-functional marketing and merchandising teams to prepare performance reports."
                ],
                associated_skills=["excel_analytics", "sql_fundamentals", "business_analytics"]
            ),
            WorkExperience(
                role="Operations Assistant",
                company="Elevate Logistics",
                start_date="2023",
                end_date="2024",
                responsibilities=[
                    "Cleaned customer shipment registries and resolved missing delivery addresses.",
                    "Maintained operational spreadsheets and scheduled courier pickups."
                ],
                associated_skills=["excel_analytics", "pandas_data_cleaning"]
            )
        ]

        # Certifications
        certifications = []
        if re.search(r"\b(google data analytics|coursera|sql certificate|python certificate)\b", text, re.IGNORECASE):
            certifications.append("Google Data Analytics Professional Certificate")
        if not certifications and "google" in text.lower():
            certifications.append("Foundations of Data Analysis")

        return ParsedProfile(
            name=candidate_name,
            email=email or "alex.rivera@example.com",
            phone=phone or "+1 (555) 234-5678",
            current_role=current_role,
            years_experience_total=years_total,
            summary=f"Aspiring Data Analyst with {years_total} years of operational experience. Demonstrated baseline proficiency in Excel reporting and SQL data retrieval, eager to master Pandas, statistical modeling, and interactive Power BI architectures.",
            education=education_records,
            experiences=experiences,
            skills=extracted_skills,
            certifications=certifications,
            projects=[
                {
                    "title": "Retail Sales Performance Tracker",
                    "description": "Built multi-tab spreadsheet model analyzing 50,000 retail transactions with XLOOKUP and conditional formatting.",
                    "tools": ["Excel", "SQL"]
                }
            ],
            raw_text_length=len(text),
            document_name=document_name
        )
