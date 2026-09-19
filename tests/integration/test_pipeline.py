import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from apps.api.app.main import app, init_db
from database.seed_data import seed_demo_environment

@pytest.fixture(autouse=True)
def setup_db():
    seed_demo_environment()

def test_full_agentic_pipeline():
    client = TestClient(app)

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    # 2. Get Profile
    res = client.get("/api/profile?user_id=demo_learner_alex")
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["name"] == "Alex Rivera"
    assert len(data["skills"]) >= 8

    # 3. Get Skill Gap Matrix
    res = client.get("/api/gaps?user_id=demo_learner_alex&target_role=data_analyst")
    assert res.status_code == 200
    gaps = res.json()
    assert gaps["target_role"] == "Data Analyst"
    assert len(gaps["gap_items"]) > 0
    assert "why_explanation" in gaps["gap_items"][0]

    # 4. Get Initial Roadmap DAG
    res = client.get("/api/roadmap?user_id=demo_learner_alex")
    assert res.status_code == 200
    dag = res.json()
    initial_nodes = dag["nodes"]
    assert len(initial_nodes) >= 10

    # 5. Take Pandas Data Cleaning Checkpoint and fail it intentionally
    chk_res = client.post("/api/assessment/generate?type=checkpoint&skill_id=pandas_data_cleaning&node_title=Pandas Data Cleaning")
    assert chk_res.status_code == 200
    chk_data = chk_res.json()
    chk_id = chk_data["id"]

    # Submit failing answers
    sub_res = client.post("/api/assessment/submit", json={
        "user_id": "demo_learner_alex",
        "assessment_id": chk_id,
        "skill_id": "pandas_data_cleaning",
        "node_id": "node_pandas_cleaning",
        "answers": {
            "chk_clean_01": "WRONG_ANSWER",
            "chk_clean_02": "incorrect_syntax()",
            "chk_clean_03": "D"
        }
    })
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert sub_data["evaluation"]["passed"] is False
    assert sub_data["adaptation"]["action_taken"] == "INSERT_REMEDIATION"

    # 6. Verify Roadmap now has remediation node
    res_after = client.get("/api/roadmap?user_id=demo_learner_alex")
    dag_after = res_after.json()
    assert len(dag_after["nodes"]) == len(initial_nodes) + 1
    remediations = [n for n in dag_after["nodes"] if n["is_remediation"]]
    assert len(remediations) == 1

    # 7. Check Evidence Ledger
    evi_res = client.get("/api/evidence?user_id=demo_learner_alex")
    assert evi_res.status_code == 200
    evidence_list = evi_res.json()["evidence"]
    assert len(evidence_list) >= 4

    # 8. Weekly Progress Report
    rep_res = client.get("/api/reports/weekly?user_id=demo_learner_alex")
    assert rep_res.status_code == 200
    report = rep_res.json()
    assert "RAIZO WEEKLY" in report["title"]
    assert report["velocity_improvement"] == "+11%"
