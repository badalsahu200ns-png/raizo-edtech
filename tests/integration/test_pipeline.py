import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

os.environ["RAIZO_TEST_MODE"] = "1"

from apps.api.app.main import app, init_db
from database.seed_data import seed_demo_environment


@pytest.fixture(autouse=True)
def setup_db():
    seed_demo_environment()


def test_seamless_direct_access():
    client = TestClient(app)

    # Seamless access to routes without login barrier
    res = client.get("/api/profile")
    assert res.status_code == 200
    assert "user" in res.json()

    res = client.get("/api/skills")
    assert res.status_code == 200

    res = client.get("/api/roadmap")
    assert res.status_code == 200

    res = client.get("/api/certificate/eligibility")
    assert res.status_code == 200


def test_full_agentic_pipeline():
    client = TestClient(app)
    headers = {"Authorization": "Bearer demo_token_alex"}

    # 1. Health check (public)
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    # 2. Get Profile (authenticated)
    res = client.get("/api/profile", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["name"] == "Alex Rivera"
    assert len(data["skills"]) >= 8

    # 3. Get Skill Gap Matrix
    res = client.get("/api/gaps", headers=headers)
    assert res.status_code == 200
    gaps = res.json()
    assert gaps["target_role"] == "Data Analyst"
    assert len(gaps["gap_items"]) > 0
    assert "why_explanation" in gaps["gap_items"][0]

    # 4. Get Initial Roadmap DAG
    res = client.get("/api/roadmap", headers=headers)
    assert res.status_code == 200
    dag = res.json()
    initial_nodes = dag["nodes"]
    assert len(initial_nodes) >= 10

    # 5. Take Pandas Data Cleaning Checkpoint and fail it intentionally
    chk_res = client.post(
        "/api/assessment/generate?type=checkpoint&skill_id=pandas_data_cleaning&node_title=Pandas Data Cleaning",
        headers=headers
    )
    assert chk_res.status_code == 200
    chk_data = chk_res.json()
    chk_id = chk_data["id"]

    # Submit failing answers
    sub_res = client.post("/api/assessment/submit", headers=headers, json={
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
    res_after = client.get("/api/roadmap", headers=headers)
    dag_after = res_after.json()
    assert len(dag_after["nodes"]) == len(initial_nodes) + 1
    remediations = [n for n in dag_after["nodes"] if n["is_remediation"]]
    assert len(remediations) == 1

    # 7. Check Evidence Ledger
    evi_res = client.get("/api/evidence", headers=headers)
    assert evi_res.status_code == 200
    evidence_list = evi_res.json()["evidence"]
    assert len(evidence_list) >= 4

    # 8. Weekly Progress Report
    rep_res = client.get("/api/reports/weekly", headers=headers)
    assert rep_res.status_code == 200
    report = rep_res.json()
    assert "RAIZO WEEKLY" in report["title"]
    assert report["velocity_improvement"] == "+11%"


def test_certificate_lifecycle_and_verification():
    client = TestClient(app)
    headers = {"Authorization": "Bearer demo_token_alex"}

    # 1. Eligibility should initially fail because no passing assessment is recorded yet
    elig_res = client.get("/api/certificate/eligibility", headers=headers)
    assert elig_res.status_code == 200
    elig_data = elig_res.json()
    assert elig_data["is_eligible"] is False

    # Attempting to generate certificate before eligibility must return HTTP 400
    gen_fail = client.post("/api/certificate/generate", headers=headers, json={})
    assert gen_fail.status_code == 400

    # 2. Complete an assessment successfully with score >= 70%
    diag_gen = client.post("/api/assessment/generate?type=diagnostic&target_role=data_analyst", headers=headers)
    assert diag_gen.status_code == 200
    diag_data = diag_gen.json()
    diag_id = diag_data["id"]

    # Submit proficient answers
    answers = {q["id"]: q.get("correct_answer", "A") for q in diag_data["questions"]}
    sub_res = client.post("/api/assessment/submit", headers=headers, json={
        "assessment_id": diag_id,
        "skill_id": "sql_fundamentals",
        "answers": answers
    })
    assert sub_res.status_code == 200

    # 3. Check Eligibility again - now user has assessment score >= 70%
    elig_res2 = client.get("/api/certificate/eligibility", headers=headers)
    assert elig_res2.status_code == 200
    elig_data2 = elig_res2.json()
    assert elig_data2["is_eligible"] is True
    assert elig_data2["score"] >= 70

    # 4. Generate Certificate
    gen_res = client.post("/api/certificate/generate", headers=headers, json={
        "assessment_id": diag_id,
        "target_role": "data_analyst"
    })
    assert gen_res.status_code == 200
    cert = gen_res.json()["certificate"]
    cert_id = cert["certificate_id"]
    assert "RAIZO-2026-DA-" in cert_id
    assert cert["status"] == "valid"
    assert cert["score"] >= 70

    # 5. Check Certificate is available in user profile
    user_certs = client.get("/api/certificate", headers=headers)
    assert user_certs.status_code == 200
    assert len(user_certs.json()["certificates"]) >= 1

    # 6. Check Evidence Ledger has Certificate event
    evi_res = client.get("/api/evidence", headers=headers)
    evidence_items = evi_res.json()["evidence"]
    cert_evi = [e for e in evidence_items if e["evidence_type"] == "Certificate"]
    assert len(cert_evi) >= 1

    # 7. Download PDF
    pdf_res = client.get(f"/api/certificate/{cert_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert pdf_res.content.startswith(b"%PDF-")

    # 8. Download QR code image
    qr_res = client.get(f"/api/certificate/{cert_id}/qr")
    assert qr_res.status_code == 200
    assert qr_res.headers["content-type"] == "image/png"

    # 9. Public Verification endpoint (No headers needed!)
    verify_res = client.get(f"/api/certificate/verify/{cert_id}")
    assert verify_res.status_code == 200
    v_data = verify_res.json()
    assert v_data["valid"] is True
    assert v_data["certificate_id"] == cert_id
    assert v_data["learner_name"] == "Alex Rivera"
    assert v_data["issuer"]["organization"] == "RAIZO"
    assert v_data["issuer"]["creator"] == "Badal Kumar Sahu"
    # Verify no private data leaked
    assert "email" not in v_data
    assert "phone" not in v_data
    assert "resume" not in v_data
