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
        current_role TEXT,
        target_role TEXT DEFAULT 'data_analyst',
        career_goal TEXT,
        timeline_months INTEGER DEFAULT 4,
        weekly_hours REAL DEFAULT 8.0,
        settings_json TEXT DEFAULT '{}',
        created_at TEXT,
        updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
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
        output_ref TEXT,
        status TEXT NOT NULL,
        duration_ms REAL,
        details_json TEXT DEFAULT '{}'
    );
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_FILE)
