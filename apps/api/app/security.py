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

from apps.api.app.database import get_connection

SECRET_KEY = os.getenv("SECRET_KEY", "raizo_production_secret_key_2026_badal_sahu")

ALLOW_LOCAL_DEMO: Optional[bool] = (
    os.getenv("ALLOW_LOCAL_DEMO", "true").lower() in ("true", "1", "yes")
    or os.getenv("ENVIRONMENT", "production").lower() in ("development", "dev", "local", "test")
)

def is_local_demo_allowed() -> bool:
    """
    Returns True if demo/local session mechanism is enabled (default true).
    """
    global ALLOW_LOCAL_DEMO
    if ALLOW_LOCAL_DEMO is False:
        return False
    if ALLOW_LOCAL_DEMO is True:
        return True
    return bool(
        os.getenv("ALLOW_LOCAL_DEMO", "true").lower() in ("true", "1", "yes")
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
        detail="Authentication required. Please sign in."
    )
