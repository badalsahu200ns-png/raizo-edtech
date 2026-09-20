import os
import sys
import time
import secrets
import hashlib
import json
import base64
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from fastapi import Header, HTTPException, Depends, Request
import httpx

try:
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    HAS_GOOGLE_AUTH = True
except ImportError:
    HAS_GOOGLE_AUTH = False

from apps.api.app.database import get_connection

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
SECRET_KEY = os.getenv("SECRET_KEY", "raizo_production_secret_key_2026_badal_sahu")

ALLOW_LOCAL_DEMO: Optional[bool] = (
    os.getenv("ALLOW_LOCAL_DEMO", "false").lower() in ("true", "1", "yes")
    or os.getenv("ENVIRONMENT", "production").lower() in ("development", "dev", "local", "test")
)

def is_local_demo_allowed() -> bool:
    """
    Returns True only if local demo environment is enabled.
    In production environments, this returns False to ensure strict security.
    """
    global ALLOW_LOCAL_DEMO
    if ALLOW_LOCAL_DEMO is False:
        return False
    if ALLOW_LOCAL_DEMO is True:
        return True
    return bool(
        os.getenv("ALLOW_LOCAL_DEMO", "false").lower() in ("true", "1", "yes")
        or os.getenv("ENVIRONMENT", "production").lower() in ("development", "dev", "local", "test")
    )

DEFAULT_USER_ID = "demo_learner_alex"

# Sliding-window in-memory rate limiter for anti-bot & brute force mitigation
_RATE_LIMIT_CACHE: Dict[str, List[float]] = {}


def check_rate_limit(client_id: str, limit: int = 20, window_seconds: int = 60) -> bool:
    """
    Sliding window in-memory rate limiter.
    Ensures auth and token exchange endpoints cannot be spammed by bots or automated tools.
    """
    now = time.time()
    history = _RATE_LIMIT_CACHE.get(client_id, [])
    # Evict timestamps outside the active window
    recent = [t for t in history if now - t < window_seconds]
    
    if len(recent) >= limit:
        _RATE_LIMIT_CACHE[client_id] = recent
        retry_seconds = max(int(window_seconds - (now - recent[0])), 1)
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Please wait {retry_seconds}s before attempting again.",
            headers={"Retry-After": str(retry_seconds)}
        )
        
    recent.append(now)
    _RATE_LIMIT_CACHE[client_id] = recent
    return True


def generate_auth_token() -> str:
    """Generates a cryptographically strong 48-byte URL-safe session token."""
    return secrets.token_urlsafe(48)


def verify_google_token(credential_str: str) -> Dict[str, Any]:
    """
    Verifies a Google credential.
    In production:
      - Strictly requires a verified Google account.
      - Blocks arbitrary, simulated, or mock accounts.
      - Validates token against official Google endpoints.
      - Confirms email_verified is True.
    In localhost development/testing (when ALLOW_LOCAL_DEMO=True):
      - Permits test credentials for automated tests and developer sandboxing.
    """
    token = credential_str.strip()
    if not token:
        raise ValueError("Google credential token cannot be empty.")

    # 1. Development / Testing Mock Google Credential Check
    if token.startswith("test_google:") or token.startswith("mock_google:"):
        if not is_local_demo_allowed():
            raise ValueError(
                "Simulated and mock credentials are strictly disabled in production. "
                "A verified Google account is required."
            )
        parts = token.split(":")
        email = parts[1].strip().lower() if len(parts) > 1 and parts[1].strip() else "new.learner@example.com"
        name = parts[2].strip() if len(parts) > 2 and parts[2].strip() else email.split("@")[0].replace(".", " ").title()
        google_id = parts[3].strip() if len(parts) > 3 and parts[3].strip() else f"gid_{hashlib.sha256(email.encode()).hexdigest()[:16]}"
        picture = parts[4].strip() if len(parts) > 4 else ""
        return {
            "sub": google_id,
            "email": email,
            "email_verified": True,
            "name": name,
            "picture": picture
        }

    # 2. Official google.oauth2.id_token verification
    if HAS_GOOGLE_AUTH:
        try:
            req = google_requests.Request()
            audience = GOOGLE_CLIENT_ID if GOOGLE_CLIENT_ID else None
            payload = id_token.verify_oauth2_token(token, req, audience=audience)
            if payload.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
                raise ValueError("Token has invalid Google issuer.")
            if not payload.get("email_verified", True):
                raise ValueError("Google account email is not verified.")
            return {
                "sub": payload["sub"],
                "email": payload["email"].lower(),
                "email_verified": True,
                "name": payload.get("name") or payload["email"].split("@")[0].capitalize(),
                "picture": payload.get("picture", "")
            }
        except Exception:
            pass

    # 3. Resilient fallback to Google tokeninfo endpoint
    try:
        resp = httpx.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={token}",
            timeout=10.0
        )
        if resp.status_code == 200:
            payload = resp.json()
            if payload.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
                raise ValueError("Token has invalid Google issuer.")
            if GOOGLE_CLIENT_ID and payload.get("aud") != GOOGLE_CLIENT_ID:
                raise ValueError("Audience mismatch against configured GOOGLE_CLIENT_ID.")
            email_verified = payload.get("email_verified") in [True, "true"]
            if not email_verified:
                raise ValueError("Google account email is not verified.")
            return {
                "sub": payload["sub"],
                "email": payload["email"].lower(),
                "email_verified": True,
                "name": payload.get("name") or payload["email"].split("@")[0].capitalize(),
                "picture": payload.get("picture", "")
            }
    except Exception:
        pass

    # 4. Fallback for JWT parsing in local development if token contains valid claims
    if ALLOW_LOCAL_DEMO and "." in token:
        try:
            segments = token.split(".")
            if len(segments) >= 2:
                padding = "=" * (4 - len(segments[1]) % 4)
                decoded_bytes = base64.urlsafe_b64decode(segments[1] + padding)
                payload = json.loads(decoded_bytes.decode("utf-8"))
                if "email" in payload:
                    return {
                        "sub": payload.get("sub", f"gid_{hashlib.sha256(payload['email'].encode()).hexdigest()[:16]}"),
                        "email": payload["email"].lower(),
                        "email_verified": True,
                        "name": payload.get("name") or payload["email"].split("@")[0].capitalize(),
                        "picture": payload.get("picture", "")
                    }
        except Exception:
            pass

    raise ValueError("Failed to verify identity with Google authentication servers.")


def create_user_session(user_id: str, days: int = 7) -> Dict[str, Any]:
    """
    Creates a secure application session in the database with an expiration date.
    """
    session_token = generate_auth_token()
    now_dt = datetime.now(timezone.utc)
    expires_dt = now_dt + timedelta(days=days)
    expires_at = expires_dt.isoformat()
    now_str = now_dt.strftime("%Y-%m-%d %H:%M:%S")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE users 
        SET auth_token = ?, token_expires_at = ?, last_login_at = ?
        WHERE id = ?
    """, (session_token, expires_at, now_str, user_id))
    conn.commit()
    conn.close()

    return {
        "token": session_token,
        "expires_at": expires_at
    }


def invalidate_user_session(session_token: str) -> bool:
    """Invalidates the active session token in the database."""
    if not session_token:
        return False
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE users 
        SET auth_token = NULL, token_expires_at = NULL 
        WHERE auth_token = ?
    """, (session_token,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


def get_authenticated_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    Strict lookup of the active session. Returns user ID if token is valid, else None.
    In production:
      - Rejects hardcoded demo tokens.
      - Enforces database session match and expiration date.
    In localhost development:
      - Allows demo token alex if ALLOW_LOCAL_DEMO is True.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.split("Bearer ", 1)[1].strip()
    if not token:
        return None

    # Handle developer demo token
    if token in ["demo_token_alex", "default_token"]:
        if is_local_demo_allowed():
            return DEFAULT_USER_ID
        return None

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, token_expires_at 
        FROM users 
        WHERE auth_token = ?
    """, (token,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    # Check expiration if set
    if row["token_expires_at"]:
        try:
            expires = datetime.fromisoformat(row["token_expires_at"])
            if expires.tzinfo is None:
                expires = expires.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) > expires:
                return None
        except Exception:
            pass

    return row["id"]


def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Server-Side Authorization Dependency.
    In production:
      - Validates Bearer token strictly.
      - If missing or invalid, raises HTTP 401 Unauthorized immediately.
      - Never falls back to demo account.
    In localhost development/testing (ALLOW_LOCAL_DEMO=True):
      - Falls back to DEFAULT_USER_ID for convenience during developer testing.
    """
    user_id = get_authenticated_user_id(authorization)
    if user_id:
        return user_id

    if is_local_demo_allowed():
        return DEFAULT_USER_ID

    raise HTTPException(
        status_code=401,
        detail="Authentication required. Please sign in with a verified Google account."
    )
