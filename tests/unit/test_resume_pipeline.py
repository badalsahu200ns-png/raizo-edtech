import io
import uuid
import os
import sys
import pytest
import pypdf
from fastapi.testclient import TestClient

# Ensure root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
os.environ["RAIZO_TEST_MODE"] = "1"

from apps.api.app.main import app
from apps.api.app.database import get_connection

client = TestClient(app)


def create_test_user(name: str = "Jordan Lee", email: str = None):
    user_id = f"user_{uuid.uuid4().hex[:10]}"
    token = f"test_token_{uuid.uuid4().hex[:12]}"
    test_email = email or f"tester_{uuid.uuid4().hex[:8]}@example.com"
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (id, email, name, auth_token, is_google_verified, target_role, created_at, updated_at)
        VALUES (?, ?, ?, ?, 1, 'data_analyst', '2026-09-19 12:00:00', '2026-09-19 12:00:00')
    """, (user_id, test_email, name, token))
    conn.commit()
    conn.close()
    return user_id, token


def test_auth_and_user_isolation():
    user_a_id, user_a_token = create_test_user(name="User A")
    user_b_id, user_b_token = create_test_user(name="User B")

    # User A profile
    res_a = client.get("/api/auth/me", headers={"Authorization": f"Bearer {user_a_token}"})
    assert res_a.status_code == 200
    assert res_a.json()["user"]["name"] == "User A"
    assert res_a.json()["user"]["id"] == user_a_id

    # User B profile
    res_b = client.get("/api/auth/me", headers={"Authorization": f"Bearer {user_b_token}"})
    assert res_b.status_code == 200
    assert res_b.json()["user"]["name"] == "User B"
    assert res_b.json()["user"]["id"] == user_b_id

    # Direct access without token defaults to active learner
    res_direct = client.get("/api/auth/me")
    assert res_direct.status_code == 200
    assert res_direct.json()["user"]["name"] == "Alex Rivera"

    # User A cannot manipulate User B's profile
    res_update = client.put(
        "/api/profile",
        headers={"Authorization": f"Bearer {user_a_token}"},
        json={"name": "User A Updated"}
    )
    assert res_update.status_code == 200

    # Verify User B's name is untouched
    res_b_verify = client.get("/api/auth/me", headers={"Authorization": f"Bearer {user_b_token}"})
    assert res_b_verify.json()["user"]["name"] == "User B"


def test_resume_upload_and_sha256():
    user_id, token = create_test_user(name="Morgan Vance")
    headers = {"Authorization": f"Bearer {token}"}

    sample_content = (
        "Morgan Vance\n"
        "morgan.vance@example.com | (415) 555-0199\n"
        "San Francisco, CA | linkedin.com/in/morgan-vance\n\n"
        "Summary:\n"
        "Data Analyst with 4 years of experience querying large relational databases with SQL,\n"
        "cleaning messy tabular records using Python and Pandas, and building executive dashboards in Tableau.\n\n"
        "Experience:\n"
        "Data Analyst at Vertex Analytics (2022 - Present)\n"
        "- Authored complex SQL JOINs, CTEs, and window functions over customer purchase history.\n"
        "- Developed automated Python ETL pipelines to impute missing values and clean survey metrics.\n"
        "- Built Power BI dashboards tracking monthly active users and revenue churn.\n\n"
        "Education:\n"
        "Bachelor of Science in Mathematics and Statistics, State University (2018 - 2022)\n"
    ).encode("utf-8")

    files = {"file": ("morgan_vance_resume.txt", io.BytesIO(sample_content), "text/plain")}
    res = client.post("/api/profile/upload-resume", files=files, headers=headers)
    assert res.status_code == 200, res.text
    data = res.json()
    assert "document_id" in data
    assert data["status"] == "ready_for_review"
    assert len(data["sha256"]) == 64  # SHA-256 is 64 hex characters
    assert data["filename"] == "morgan_vance_resume.txt"
    assert "extracted_profile" in data

    extracted = data["extracted_profile"]
    assert extracted["name"] == "Morgan Vance"
    assert len(extracted["skills"]) > 0

    document_id = data["document_id"]

    # Test get active resume
    get_res = client.get("/api/profile/resume", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["has_resume"] is True
    assert get_res.json()["document"]["id"] == document_id

    # Test Confirm Profile: claims must be strictly UNVERIFIED with low confidence
    confirm_res = client.post(
        f"/api/profile/resume/{document_id}/confirm",
        json={
            "name": "Morgan Vance",
            "current_role": "Data Analyst",
            "target_role": "data_analyst",
            "skills": extracted["skills"]
        },
        headers=headers
    )
    assert confirm_res.status_code == 200
    assert "Profile confirmed" in confirm_res.json()["message"]

    # Verify skills in database are unverified for this user
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT status, confidence, verified_score FROM learner_skills WHERE user_id = ? AND skill_id = 'sql_fundamentals'",
        (user_id,)
    )
    row = cursor.fetchone()
    conn.close()
    assert row is not None
    assert row["status"] == "Unverified"
    assert row["confidence"] == "low"
    assert row["verified_score"] == 0

    # Test reprocess
    reprocess_res = client.post(f"/api/profile/resume/{document_id}/reprocess", headers=headers)
    assert reprocess_res.status_code == 200
    assert reprocess_res.json()["success"] is True

    # Test delete
    del_res = client.delete(f"/api/profile/resume/{document_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True


def test_scanned_pdf_rejection():
    """An image-based or blank PDF with insufficient text must be honestly rejected."""
    _, token = create_test_user(name="Scanner User")
    headers = {"Authorization": f"Bearer {token}"}

    # Create a valid PDF that contains only a blank page (0 extractable text)
    writer = pypdf.PdfWriter()
    writer.add_blank_page(width=612, height=792)
    pdf_bytes = io.BytesIO()
    writer.write(pdf_bytes)
    pdf_bytes.seek(0)

    files = {"file": ("scanned_blank_document.pdf", pdf_bytes, "application/pdf")}
    res = client.post("/api/profile/upload-resume", files=files, headers=headers)
    assert res.status_code == 422
    error_msg = res.json()["detail"]
    assert "scanned" in error_msg.lower() or "not extract enough text" in error_msg.lower()
