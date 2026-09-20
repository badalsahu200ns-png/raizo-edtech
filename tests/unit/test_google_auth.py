import pytest
import os
import sys

# Ensure root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from fastapi.testclient import TestClient
from apps.api.app.main import app
from apps.api.app.database import get_connection

client = TestClient(app)

def test_google_auth_existing_user():
    """Test login of existing user via Google credential."""
    response = client.post(
        "/api/auth/google",
        json={"credential": "test_google:alex.rivera@example.com:Alex Rivera:demo_learner_alex:"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "token" in data
    assert data["user"]["email"] == "alex.rivera@example.com"
    assert data["is_new_user"] is False

def test_google_auth_new_user_signup_and_signout():
    """Test sign up of a brand new learner via Google credential, then sign out."""
    new_email = "new.google.student.2026@example.com"
    new_name = "Taylor Swift Learner"
    
    # Clean up if exists from previous run
    conn = get_connection()
    conn.execute("DELETE FROM users WHERE email = ?", (new_email,))
    conn.commit()
    conn.close()

    # 1. Sign up new user
    signup_res = client.post(
        "/api/auth/google",
        json={"credential": f"test_google:{new_email}:{new_name}::"}
    )
    assert signup_res.status_code == 200
    signup_data = signup_res.json()
    assert signup_data["success"] is True
    assert signup_data["is_new_user"] is True
    assert signup_data["user"]["email"] == new_email
    assert signup_data["user"]["name"] == new_name
    token = signup_data["token"]
    assert token is not None

    # 2. Check /api/auth/me with new user's session token
    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["authenticated"] is True
    assert me_data["user"]["email"] == new_email

    # 3. Sign out (logout)
    logout_res = client.post(
        "/api/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert logout_res.status_code == 200
    assert logout_res.json()["success"] is True

    # 4. Check /api/auth/me after sign out - should now report unauthenticated
    after_me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert after_me_res.status_code == 200
    after_me_data = after_me_res.json()
    assert after_me_data["authenticated"] is False
    assert after_me_data["user"] is None
