import re
import uuid
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from agents.base import BaseAgent


class QuestionResult(BaseModel):
    question_id: str
    skill_id: str
    sub_skill_id: str
    type: str
    earned_score: int
    max_score: int
    is_correct: bool
    user_answer: str
    correct_answer: str
    explanation: str
    prerequisite_concept: str
    weakness_identified: Optional[str] = None
    feedback: str


class EvaluationResult(BaseModel):
    submission_id: str
    assessment_id: str
    skill_id: str
    overall_score: int  # 0 - 100
    status: str  # "needs_remediation", "developing", "proficient", "strong"
    confidence: str  # "low", "medium", "high"
    passed: bool  # threshold >= 70
    identified_weaknesses: List[str]
    root_cause_prerequisite: Optional[str] = None
    strengths: List[str]
    rubric_breakdown: Dict[str, int] = {}
    detailed_feedback: str
    recommended_action: str
    question_results: List[QuestionResult]


class EvaluatorAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Evaluator Agent",
            role_description="Executes deterministic rubric-based evaluation of assessment submissions, mapping mistakes to prerequisite concepts."
        )

    def evaluate_submission(
        self,
        assessment_id: str,
        skill_id: str,
        questions: List[Dict[str, Any]],
        answers: Dict[str, str],
        previous_attempts_count: int = 1
    ) -> EvaluationResult:
        """
        Evaluate objective and applied tasks using deterministic rubrics and thresholds:
        0–49: needs_remediation
        50–69: developing
        70–84: proficient
        85–100: strong
        """
        def _execute():
            question_results: List[QuestionResult] = []
            total_earned = 0
            total_possible = 0

            identified_weaknesses = []
            strengths = []
            root_cause = None

            for q in questions:
                q_id = q["id"]
                q_type = q.get("type", "mcq")
                weight = q.get("weight", 10)
                correct_ans = q.get("correct_answer", "").strip()
                user_ans = str(answers.get(q_id, "")).strip()
                prereq = q.get("prerequisite_concept", "Core Concept")
                sub_skill = q.get("sub_skill_id", skill_id)

                total_possible += weight

                earned = 0
                is_correct = False
                feedback = ""
                weakness = None

                if q_type == "mcq" or q_type == "scenario":
                    if user_ans.upper() == correct_ans.upper():
                        earned = weight
                        is_correct = True
                        feedback = f"Correct. {q.get('explanation', '')}"
                        strengths.append(prereq)
                    else:
                        earned = 0
                        is_correct = False
                        weakness = sub_skill
                        feedback = f"Incorrect. Your answer '{user_ans}' did not match expected '{correct_ans}'. {q.get('explanation', '')}"
                        identified_weaknesses.append(sub_skill)
                        if not root_cause:
                            root_cause = prereq

                elif q_type in ["sql_query", "python_code"]:
                    # Applied evaluation with deterministic rubric criteria
                    earned, feedback, is_correct = self._evaluate_applied_code(
                        q_type, user_ans, correct_ans, weight, q.get("rubric")
                    )
                    if is_correct:
                        strengths.append(prereq)
                    else:
                        identified_weaknesses.append(sub_skill)
                        if not root_cause:
                            root_cause = prereq
                else:
                    # Short answer similarity heuristic
                    if len(user_ans) > 10 and any(w in user_ans.lower() for w in correct_ans.lower().split()[:3]):
                        earned = int(weight * 0.8)
                        is_correct = True
                        feedback = "Acceptable explanation demonstrating conceptual comprehension."
                        strengths.append(prereq)
                    else:
                        earned = int(weight * 0.3)
                        is_correct = False
                        identified_weaknesses.append(sub_skill)
                        feedback = f"Partial or insufficient detail. Expected coverage: {correct_ans}."
                        if not root_cause:
                            root_cause = prereq

                total_earned += earned
                question_results.append(
                    QuestionResult(
                        question_id=q_id,
                        skill_id=q.get("skill_id", skill_id),
                        sub_skill_id=sub_skill,
                        type=q_type,
                        earned_score=earned,
                        max_score=weight,
                        is_correct=is_correct,
                        user_answer=user_ans,
                        correct_answer=correct_ans,
                        explanation=q.get("explanation", ""),
                        prerequisite_concept=prereq,
                        weakness_identified=weakness,
                        feedback=feedback
                    )
                )

            # Compute percentage score (0-100)
            overall_pct = int((total_earned / total_possible) * 100) if total_possible > 0 else 0

            # Deterministic Thresholds
            if overall_pct >= 85:
                status = "strong"
                passed = True
            elif overall_pct >= 70:
                status = "proficient"
                passed = True
            elif overall_pct >= 50:
                status = "developing"
                passed = False
            else:
                status = "needs_remediation"
                passed = False

            # Confidence based on attempts and evidence count
            if previous_attempts_count >= 3:
                confidence = "high"
            elif previous_attempts_count >= 2:
                confidence = "medium"
            else:
                confidence = "medium" if passed else "high"

            # Recommendations
            if status == "needs_remediation":
                action = f"Insert prerequisite remediation micro-module for '{root_cause or skill_id}' before reattempting."
            elif status == "developing":
                action = f"Complete targeted practice questions on {', '.join(set(identified_weaknesses)) or 'weak sub-skills'}."
            else:
                action = "Milestone achieved. Unlock dependent roadmap nodes."

            return EvaluationResult(
                submission_id=f"sub_{uuid.uuid4().hex[:8]}",
                assessment_id=assessment_id,
                skill_id=skill_id,
                overall_score=overall_pct,
                status=status,
                confidence=confidence,
                passed=passed,
                identified_weaknesses=list(set(identified_weaknesses)),
                root_cause_prerequisite=root_cause,
                strengths=list(set(strengths)),
                rubric_breakdown={"objective_pts": total_earned, "max_pts": total_possible},
                detailed_feedback=f"Achieved {overall_pct}% ({status.upper()}). {len(strengths)} competencies verified, {len(identified_weaknesses)} areas require attention.",
                recommended_action=action,
                question_results=question_results
            )

        return self.execute_with_audit(
            action_name="evaluate_assessment_submission",
            input_summary=f"Assessment: {assessment_id}, Skill: {skill_id}",
            func=_execute
        )

    def _evaluate_applied_code(
        self,
        q_type: str,
        user_code: str,
        expected_code: str,
        max_weight: int,
        rubric: Optional[Dict[str, int]]
    ) -> tuple[int, str, bool]:
        """Deterministic rubric evaluation for SQL and Python code tasks."""
        if not user_code or len(user_code.strip()) < 5:
            return 0, "No response or empty submission provided.", False

        cleaned_user = re.sub(r"\s+", " ", user_code.strip().lower())
        cleaned_expected = re.sub(r"\s+", " ", expected_code.strip().lower())

        score = 0
        feedback_notes = []

        if q_type == "sql_query":
            # Check for essential SQL syntax elements
            has_select = "select" in cleaned_user
            has_from = "from" in cleaned_user
            has_group_by = "group by" in cleaned_user
            has_having = "having" in cleaned_user
            has_agg = any(func in cleaned_user for func in ["avg(", "sum(", "count(", "max(", "min("])

            if has_select and has_from:
                score += int(max_weight * 0.3)
                feedback_notes.append("Valid query baseline (SELECT/FROM).")
            if has_group_by:
                score += int(max_weight * 0.3)
                feedback_notes.append("Correct GROUP BY partition structure.")
            if has_having:
                score += int(max_weight * 0.2)
                feedback_notes.append("Appropriate aggregate filter via HAVING.")
            if has_agg:
                score += int(max_weight * 0.2)
                feedback_notes.append("Correct aggregate function syntax.")

        elif q_type == "python_code":
            # Check for Pandas idiomatic operations
            has_fillna = "fillna(" in cleaned_user or "ffill()" in cleaned_user
            has_median = "median()" in cleaned_user or "mean()" in cleaned_user
            has_assignment = "=" in cleaned_user or "inplace=true" in cleaned_user

            if has_fillna:
                score += int(max_weight * 0.4)
                feedback_notes.append("Correct imputation method detected.")
            if has_median:
                score += int(max_weight * 0.4)
                feedback_notes.append("Applied robust central tendency statistic.")
            if has_assignment:
                score += int(max_weight * 0.2)
                feedback_notes.append("Proper column assignment.")

        is_passed = score >= int(max_weight * 0.7)
        summary = " ".join(feedback_notes) if feedback_notes else "Evaluation completed against rubric."
        return score, summary, is_passed
