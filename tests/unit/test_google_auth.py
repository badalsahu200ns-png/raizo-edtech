import os
os.environ["ALLOW_LOCAL_DEMO"] = "true"
os.environ["ENVIRONMENT"] = "test"

import pytest
import sys

# Ensure root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from fastapi.testclient import TestClient
import apps.api.app.security as sec
sec.ALLOW_LOCAL_DEMO = True
from apps.api.app.main import app

client = TestClient(app)

def test_google_auth_endpoint_is_removed():
    """Verify that /api/auth/google route has been completely removed."""
    response = client.post(
        "/api/auth/google",
        json={"credential": "test_token"}
    )
    assert response.status_code == 404

def test_demo_auth_login_and_session():
    """Test login via demo session endpoint and verify session token."""
    response = client.post("/api/auth/demo")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "token" in data
    assert data["user"]["email"] == "alex.rivera@example.com"
    token = data["token"]

    # Check /api/auth/me with session token
    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["authenticated"] is True
    assert me_data["user"]["email"] == "alex.rivera@example.com"

    # Sign out
    logout_res = client.post(
        "/api/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert logout_res.status_code == 200
    assert logout_res.json()["success"] is True

    # Check /api/auth/me after sign out
    after_me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert after_me_res.status_code == 200
    after_me_data = after_me_res.json()
    assert after_me_data["authenticated"] is False

def test_rate_limiting_mitigation():
    """Verify that repeated automated requests trigger HTTP 429 rate limiting."""
    from apps.api.app.security import check_rate_limit
    test_key = "test_bot_ip_127_99_99_1"
    
    for _ in range(5):
        check_rate_limit(test_key, limit=5, window_seconds=60)
        
    with pytest.raises(Exception) as exc_info:
        check_rate_limit(test_key, limit=5, window_seconds=60)
    assert "429" in str(exc_info.value) or "Rate limit exceeded" in str(exc_info.value)
