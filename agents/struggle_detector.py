from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from agents.base import BaseAgent


class StrugglePattern(BaseModel):
    skill_id: str
    concept: str
    attempt_count: int
    average_score: int
    recurring_error: str
    severity: str  # "mild", "moderate", "severe"
    intervention_recommended: str


class StruggleDetector(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Struggle Detector",
            role_description="Monitors multi-attempt assessment patterns and flags persistent conceptual roadblocks for targeted pedagogical interventions."
        )

    def analyze_history(
        self,
        skill_id: str,
        attempt_history: List[Dict[str, Any]]
    ) -> Optional[StrugglePattern]:
        """
        Detects if learner is experiencing repeated friction or conceptual difficulty:
        - 2+ failed attempts (< 70%) on the same skill
        - recurring weakness identified across attempts
        """
        def _execute():
            if len(attempt_history) < 2:
                return None

            scores = [a.get("score", 0) for a in attempt_history]
            avg_score = int(sum(scores) / len(scores))
            failed_attempts = [a for a in attempt_history if a.get("score", 0) < 70]

            if len(failed_attempts) >= 2:
                # Find recurring weaknesses
                weakness_counts: Dict[str, int] = {}
                for a in failed_attempts:
                    for w in a.get("weaknesses", []):
                        weakness_counts[w] = weakness_counts.get(w, 0) + 1

                recurring = max(weakness_counts.items(), key=lambda x: x[1], default=("Fundamental Prerequisite", 1))

                severity = "severe" if len(failed_attempts) >= 3 else "moderate"
                intervention = (
                    f"Raizo detected that you have struggled with '{recurring[0]}' across {len(failed_attempts)} attempts. "
                    f"We recommend switching to guided Socratic practice or scheduling mentor office hours."
                )

                return StrugglePattern(
                    skill_id=skill_id,
                    concept=recurring[0],
                    attempt_count=len(attempt_history),
                    average_score=avg_score,
                    recurring_error=recurring[0],
                    severity=severity,
                    intervention_recommended=intervention
                )

            return None

        return self.execute_with_audit(
            action_name="detect_struggle_patterns",
            input_summary=f"Skill: {skill_id}, Attempts: {len(attempt_history)}",
            func=_execute
        )
