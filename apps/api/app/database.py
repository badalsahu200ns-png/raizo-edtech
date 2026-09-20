import sqlite3
import json
import os
import time
from typing import Dict, Any, List, Optional

DB_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
    "raizo_learning.db"
)

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_FILE, timeout=30.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT,
        auth_token TEXT,
        current_role TEXT,
        target_role TEXT DEFAULT 'data_analyst',
        career_goal TEXT,
        timeline_months INTEGER DEFAULT 4,
        weekly_hours REAL DEFAULT 8.0,
        settings_json TEXT DEFAULT '{}',
        created_at TEXT,
        updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        doc_type TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        stored_filename TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        extension TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        sha256 TEXT NOT NULL,
        storage_path TEXT NOT NULL,
        uploaded_at TEXT NOT NULL,
        processing_status TEXT NOT NULL,
        processing_error TEXT,
        extracted_json TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        document_id TEXT,
        filename TEXT NOT NULL,
        file_size INTEGER,
        file_type TEXT,
        raw_text TEXT,
        parsed_json TEXT,
        uploaded_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learner_skills (
        user_id TEXT NOT NULL,
        skill_id TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT,
        claimed_score INTEGER DEFAULT 0,
        verified_score INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Unverified',
        confidence TEXT DEFAULT 'low',
        evidence_count INTEGER DEFAULT 0,
        last_evaluated_at TEXT,
        PRIMARY KEY (user_id, skill_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS evidence_ledger (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        skill_id TEXT NOT NULL,
        evidence_type TEXT NOT NULL,
        score INTEGER,
        confidence TEXT NOT NULL,
        source_title TEXT NOT NULL,
        details_json TEXT DEFAULT '{}',
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS roadmaps (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        target_role TEXT NOT NULL,
        completion_percentage INTEGER DEFAULT 0,
        total_nodes INTEGER DEFAULT 0,
        completed_nodes INTEGER DEFAULT 0,
        data_json TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessments (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        target_role TEXT NOT NULL,
        data_json TEXT NOT NULL,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assessment_submissions (
        id TEXT PRIMARY KEY,
        assessment_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        skill_id TEXT NOT NULL,
        overall_score INTEGER NOT NULL,
        status TEXT NOT NULL,
        passed INTEGER NOT NULL,
        evaluation_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tutor_messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        mode TEXT NOT NULL,
        content TEXT NOT NULL,
        sources_json TEXT DEFAULT '[]',
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS job_analyses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        job_title TEXT NOT NULL,
        company TEXT,
        raw_text TEXT NOT NULL,
        match_score INTEGER NOT NULL,
        analysis_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS job_applications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        job_id TEXT,
        company TEXT NOT NULL,
        job_title TEXT NOT NULL,
        fit_score INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Saved',
        notes TEXT DEFAULT '',
        updated_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        skills_json TEXT DEFAULT '[]',
        status TEXT DEFAULT 'available',
        submission_text TEXT,
        score INTEGER,
        rubric_eval_json TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS human_overrides (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id TEXT NOT NULL,
        original_value TEXT,
        override_value TEXT NOT NULL,
        mentor_name TEXT NOT NULL,
        reason TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        agent TEXT NOT NULL,
        action TEXT NOT NULL,
        input_ref TEXT,
        output_ref TEXT
    );

    CREATE TABLE IF NOT EXISTS certificates (
        id TEXT PRIMARY KEY,
        certificate_id TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL,
        assessment_id TEXT,
        learning_path_id TEXT NOT NULL,
        learner_name TEXT NOT NULL,
        target_role TEXT NOT NULL,
        achievement_title TEXT NOT NULL,
        score INTEGER NOT NULL,
        completion_date TEXT NOT NULL,
        issued_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'valid',
        verification_hash TEXT NOT NULL,
        verification_url TEXT NOT NULL,
        pdf_path TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
    CREATE INDEX IF NOT EXISTS idx_certificates_cert_id ON certificates(certificate_id);
    """)

    conn.commit()

    # Safe migrations for existing SQLite databases
    user_columns = [r["name"] for r in cursor.execute("PRAGMA table_info(users)").fetchall()]
    if "password_hash" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT;")
    if "auth_token" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN auth_token TEXT;")
    if "google_id" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN google_id TEXT;")
    if "provider_user_id" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN provider_user_id TEXT;")
    if "picture" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN picture TEXT;")
    if "photo_url" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN photo_url TEXT;")
    if "display_name" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN display_name TEXT;")
    if "first_name" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN first_name TEXT;")
    if "last_name" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN last_name TEXT;")
    if "auth_provider" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'google';")
    if "is_google_verified" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN is_google_verified INTEGER DEFAULT 1;")
    if "email_verified" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 1;")
    if "onboarding_completed" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN onboarding_completed INTEGER DEFAULT 0;")
    if "token_expires_at" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN token_expires_at TEXT;")
    if "last_login_at" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN last_login_at TEXT;")

    # Sync provider_user_id with google_id for existing rows
    cursor.execute("UPDATE users SET provider_user_id = google_id WHERE provider_user_id IS NULL AND google_id IS NOT NULL;")
    # Sync display_name with name
    cursor.execute("UPDATE users SET display_name = name WHERE display_name IS NULL AND name IS NOT NULL;")
    # Sync photo_url with picture
    cursor.execute("UPDATE users SET photo_url = picture WHERE photo_url IS NULL AND picture IS NOT NULL;")

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_provider_user_id ON users(provider_user_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_auth_token ON users(auth_token);")

    resume_columns = [r["name"] for r in cursor.execute("PRAGMA table_info(resumes)").fetchall()]
    if "document_id" not in resume_columns:
        cursor.execute("ALTER TABLE resumes ADD COLUMN document_id TEXT;")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_FILE)
