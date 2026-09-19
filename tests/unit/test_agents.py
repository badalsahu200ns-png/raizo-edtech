import pytest
import os
import sys

# Ensure root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from agents.evaluator_agent import EvaluatorAgent
from agents.adaptation_agent import AdaptationAgent
from agents.roadmap_agent import RoadmapAgent, RoadmapDAG, RoadmapNode
from agents.skill_gap_agent import SkillGapAgent
from agents.tutor_agent import TutorAgent
from agents.profile_agent import ProfileAgent


def test_deterministic_scoring_thresholds():
    evaluator = EvaluatorAgent()
    questions = [
        {
            "id": "q1",
            "type": "mcq",
            "weight": 50,
            "correct_answer": "A",
            "explanation": "Test explanation",
            "prerequisite_concept": "Concept A"
        },
        {
            "id": "q2",
            "type": "mcq",
            "weight": 50,
            "correct_answer": "B",
            "explanation": "Test explanation 2",
            "prerequisite_concept": "Concept B"
        }
    ]

    # Test 100% -> Strong
    res_100 = evaluator.evaluate_submission("test_1", "sql_fundamentals", questions, {"q1": "A", "q2": "B"})
    assert res_100.overall_score == 100
    assert res_100.status == "strong"
    assert res_100.passed is True

    # Test 50% -> Developing
    res_50 = evaluator.evaluate_submission("test_2", "sql_fundamentals", questions, {"q1": "A", "q2": "WRONG"})
    assert res_50.overall_score == 50
    assert res_50.status == "developing"
    assert res_50.passed is False

    # Test 0% -> Needs Remediation
    res_0 = evaluator.evaluate_submission("test_3", "sql_fundamentals", questions, {"q1": "WRONG", "q2": "WRONG"})
    assert res_0.overall_score == 0
    assert res_0.status == "needs_remediation"
    assert res_0.passed is False


def test_dag_adaptation_on_failure():
    """Verify that failing an assessment (< 50%) dynamically modifies the DAG roadmap by injecting a remediation node."""
    roadmap_agent = RoadmapAgent()
    adaptation_agent = AdaptationAgent()

    # Generate initial roadmap
    dag = roadmap_agent.generate_initial_roadmap(
        user_id="test_user",
        target_role="data_analyst",
        verified_skills={},
        weekly_hours=8.0
    )

    initial_node_count = len(dag.nodes)
    target_node_id = "node_pandas_cleaning"

    # Simulate failure on Pandas Data Cleaning (Score 42%)
    eval_result = {
        "overall_score": 42,
        "status": "needs_remediation",
        "identified_weaknesses": ["missing_value_handling"],
        "root_cause_prerequisite": "Missing Value Detection & Imputation",
        "confidence": "medium"
    }

    adaptation_result = adaptation_agent.adapt_roadmap_after_evaluation(
        current_dag=dag,
        evaluated_node_id=target_node_id,
        evaluation_result=eval_result
    )

    assert adaptation_result.success is True
    assert adaptation_result.action_taken == "INSERT_REMEDIATION"
    # Verify node count increased
    assert len(adaptation_result.updated_roadmap.nodes) == initial_node_count + 1
    # Verify remediation node exists and is available
    remediation_nodes = [n for n in adaptation_result.updated_roadmap.nodes if n.is_remediation]
    assert len(remediation_nodes) == 1
    assert remediation_nodes[0].status == "available"
    assert "Missing Value" in remediation_nodes[0].title


def test_tutor_socratic_and_sources():
    tutor = TutorAgent()
    reply = tutor.respond(
        user_message="What is a SQL window function?",
        mode="socratic",
        current_node={"title": "SQL Window Functions"},
        learner_profile={"name": "Alex"}
    )
    assert reply.role == "assistant"
    assert len(reply.sources_used) > 0
    assert reply.sources_used[0].url.startswith("http")
    assert "department" in reply.content.lower() or "ranking" in reply.content.lower()


def test_profile_agent_extraction():
    profile_agent = ProfileAgent()
    sample_text = """
    Jane Doe
    jane.doe@example.com | +1 555 123 4567
    Marketing Analyst with 3 years experience.
    Proficient in SQL queries, Excel pivot tables, and Python scripts with Pandas.
    Worked at Global Retail Inc as Data Coordinator.
    """
    parsed = profile_agent._extract_profile_from_text(sample_text, "test_resume.txt")
    assert parsed.name == "Jane Doe"
    assert len(parsed.skills) >= 3
    # Check that skills are marked unverified
    for s in parsed.skills:
        assert s.verification_status == "pending_verification"
        assert s.confidence == "low"
