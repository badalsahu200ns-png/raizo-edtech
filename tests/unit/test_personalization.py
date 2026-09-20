import pytest
from starlette.testclient import TestClient
from apps.api.app.main import app
from apps.api.app.database import get_connection, init_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_db():
    init_db()
    yield
    # Teardown: restore default demo learner row
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET name = 'Alex Rivera', display_name = 'Alex Rivera', first_name = 'Alex', last_name = 'Rivera' WHERE id = 'demo_learner_alex'")
    conn.commit()
    conn.close()

def test_profile_personalization_and_onboarding():
    # 1. Establish session via demo login
    login_res = client.post("/api/auth/demo")
    assert login_res.status_code == 200
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Update profile with user's full name (Badal Kumar Sahu)
    update_payload = {
        "name": "Badal Kumar Sahu",
        "display_name": "Badal Kumar Sahu",
        "onboarding_completed": True
    }
    put_res = client.put("/api/profile", json=update_payload, headers=headers)
    assert put_res.status_code == 200
    assert put_res.json()["success"] is True

    # 3. Verify /api/auth/me returns the exact personalized full name
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    data = me_res.json()
    assert data["authenticated"] is True
    assert data["user"]["name"] == "Badal Kumar Sahu"
    assert data["user"]["display_name"] == "Badal Kumar Sahu"
    assert data["user"]["first_name"] == "Badal"
    assert data["user"]["last_name"] == "Kumar Sahu"
    assert data["user"]["onboarding_completed"] is True

def test_certificate_eligibility_and_name_propagation():
    login_res = client.post("/api/auth/demo")
    assert login_res.status_code == 200
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Ensure profile name is set
    client.put("/api/profile", json={"name": "Badal Kumar Sahu", "onboarding_completed": True}, headers=headers)

    # Check eligibility endpoint returns structured progress metrics
    elig_res = client.get("/api/certificate/eligibility", headers=headers)
    assert elig_res.status_code == 200
    elig_data = elig_res.json()
    assert "is_eligible" in elig_data
    assert "score" in elig_data
    assert "score_threshold" in elig_data
    assert elig_data["score_threshold"] == 70
