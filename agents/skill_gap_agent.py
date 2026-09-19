import json
import os
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from agents.base import BaseAgent


class SubSkillStatus(BaseModel):
    sub_skill_id: str
    title: str
    demonstrated: bool
    evidence_note: str


class SkillGapItem(BaseModel):
    skill_id: str
    title: str
    category: str
    current_score: int  # 0 to 100
    required_score: int  # 0 to 100
    gap_score: int  # required - current (clamped >= 0)
    status: str  # "Proficient", "Partial", "Missing", "Unverified"
    confidence: str  # "Low", "Medium", "High"
    strengths: List[str] = []
    weaknesses: List[str] = []
    sub_skills_breakdown: List[SubSkillStatus] = []
    why_explanation: str
    recommended_next_step: str
    evidence_count: int = 0


class GapMatrix(BaseModel):
    target_role: str
    overall_readiness_score: int  # 0 to 100
    target_threshold: int
    proficient_count: int
    partial_count: int
    missing_count: int
    unverified_count: int
    gap_items: List[SkillGapItem]
    top_priority_gaps: List[str]
    summary: str


class SkillGapAgent(BaseAgent):
    def __init__(self, competency_file_path: Optional[str] = None):
        super().__init__(
            name="Skill Gap Analyzer",
            role_description="Computes delta between verified learner capabilities and target role requirements, generating explainable root causes."
        )
        self.competency_file_path = competency_file_path or os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "knowledge", "competencies", "data_analyst.json"
        )

    def load_role_model(self) -> Dict[str, Any]:
        if os.path.exists(self.competency_file_path):
            with open(self.competency_file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        # Fallback minimal schema
        return {
            "role_id": "data_analyst",
            "title": "Data Analyst",
            "target_readiness_threshold": 75,
            "competencies": []
        }

    def analyze_gaps(
        self,
        verified_skills: Dict[str, Dict[str, Any]],
        target_role: str = "data_analyst"
    ) -> GapMatrix:
        """
        verified_skills format:
        {
            "sql_fundamentals": {"score": 85, "confidence": "Medium", "evidence_count": 2, "verified": True},
            "pandas_data_cleaning": {"score": 42, "confidence": "Medium", "evidence_count": 1, "verified": True},
            ...
        }
        """
        def _execute():
            role_model = self.load_role_model()
            gap_items: List[SkillGapItem] = []
            
            total_weighted_score = 0.0
            total_weight = 0.0

            proficient_count = 0
            partial_count = 0
            missing_count = 0
            unverified_count = 0

            for comp in role_model.get("competencies", []):
                comp_weight = comp.get("weight", 0.2)
                for skill in comp.get("skills", []):
                    s_id = skill["skill_id"]
                    req_score = skill.get("required_score", 75)
                    
                    user_skill = verified_skills.get(s_id, {})
                    is_verified = user_skill.get("verified", False)
                    curr_score = user_skill.get("score", 0)
                    confidence = user_skill.get("confidence", "Low")
                    evidence_count = user_skill.get("evidence_count", 0)

                    # Determine status
                    if not is_verified:
                        if curr_score > 0 or evidence_count > 0:
                            status = "Unverified"
                            unverified_count += 1
                        else:
                            status = "Missing"
                            missing_count += 1
                    elif curr_score >= req_score:
                        status = "Proficient"
                        proficient_count += 1
                    elif curr_score >= 50:
                        status = "Partial"
                        partial_count += 1
                    else:
                        status = "Missing"
                        missing_count += 1

                    gap_score = max(0, req_score - curr_score)
                    total_weighted_score += curr_score * comp_weight
                    total_weight += comp_weight

                    # Formulate detailed sub-skills and "Why?" explanation
                    sub_skills_data = []
                    strengths = []
                    weaknesses = []

                    for sub in skill.get("sub_skills", []):
                        sub_id = sub["sub_skill_id"]
                        # If current score is high or sub-skill is verified in user skill weaknesses
                        has_passed_sub = curr_score >= 70
                        if "weaknesses" in user_skill and sub_id in user_skill["weaknesses"]:
                            has_passed_sub = False
                        
                        if has_passed_sub:
                            strengths.append(sub["title"])
                            sub_skills_data.append(SubSkillStatus(
                                sub_skill_id=sub_id,
                                title=sub["title"],
                                demonstrated=True,
                                evidence_note=f"Verified through assessment benchmark (Score: {curr_score}%)"
                            ))
                        else:
                            weaknesses.append(sub["title"])
                            sub_skills_data.append(SubSkillStatus(
                                sub_skill_id=sub_id,
                                title=sub["title"],
                                demonstrated=False,
                                evidence_note=f"Not yet verified or below required benchmark ({curr_score}% vs {req_score}%)"
                            ))

                    # Build explainable Why string
                    why_parts = []
                    if strengths:
                        why_parts.append(f"Demonstrated: {', '.join(strengths)}.")
                    if weaknesses:
                        why_parts.append(f"Requires development: {', '.join(weaknesses)}.")
                    if not is_verified:
                        why_parts.append("Self-reported claim pending empirical verification.")

                    why_explanation = " ".join(why_parts) if why_parts else f"Score is {curr_score}% against benchmark of {req_score}%."

                    # Recommended next step
                    if status == "Proficient":
                        next_step = f"Maintain competency with applied capstone analytics."
                    elif status == "Partial":
                        next_step = f"Focus on {weaknesses[0] if weaknesses else skill['title']} targeted exercises."
                    else:
                        next_step = f"Complete foundational modules for {skill['title']}."

                    gap_items.append(
                        SkillGapItem(
                            skill_id=s_id,
                            title=skill["title"],
                            category=comp["title"],
                            current_score=curr_score,
                            required_score=req_score,
                            gap_score=gap_score,
                            status=status,
                            confidence=confidence,
                            strengths=strengths,
                            weaknesses=weaknesses,
                            sub_skills_breakdown=sub_skills_data,
                            why_explanation=why_explanation,
                            recommended_next_step=next_step,
                            evidence_count=evidence_count
                        )
                    )

            # Sort gap items by gap_score descending
            gap_items.sort(key=lambda x: x.gap_score, reverse=True)
            top_priority = [item.title for item in gap_items if item.status in ["Missing", "Partial"]][:3]

            overall_readiness = int(total_weighted_score / total_weight) if total_weight > 0 else 0

            return GapMatrix(
                target_role=role_model.get("title", "Data Analyst"),
                overall_readiness_score=overall_readiness,
                target_threshold=role_model.get("target_readiness_threshold", 75),
                proficient_count=proficient_count,
                partial_count=partial_count,
                missing_count=missing_count,
                unverified_count=unverified_count,
                gap_items=gap_items,
                top_priority_gaps=top_priority,
                summary=f"Current readiness is {overall_readiness}% for {target_role}. Priority focus areas: {', '.join(top_priority)}."
            )

        return self.execute_with_audit(
            action_name="calculate_gap_matrix",
            input_summary=f"Role: {target_role}, Verified skills: {len(verified_skills)}",
            func=_execute
        )
