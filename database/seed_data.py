import json
import time
import uuid
import sys
import os

# Add root directory to sys.path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from apps.api.app.database import get_connection, init_db
from agents.roadmap_agent import RoadmapAgent
from agents.base import AGENT_EVENT_LOG

DEMO_USER_ID = "demo_learner_alex"

def seed_demo_environment():
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    now = time.strftime("%Y-%m-%d %H:%M:%S")

    # 1. Seed User: Alex Rivera
    cursor.execute("""
    INSERT OR REPLACE INTO users (
        id, email, name, auth_token, is_google_verified, current_role, target_role, career_goal, timeline_months, weekly_hours, settings_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        DEMO_USER_ID,
        "alex.rivera@example.com",
        "Alex Rivera",
        "demo_token_alex",
        "Marketing & Operations Associate",
        "data_analyst",
        "Transition into a High-Growth Data Analyst role within 4 months",
        4,
        8.0,
        json.dumps({"theme": "dark", "difficulty": "adaptive", "notifications": True}),
        now,
        now
    ))

    # 2. Seed Skills & Evidence
    initial_skills = [
        {
            "skill_id": "excel_analytics",
            "title": "Excel Analytics & Modeling",
            "category": "Data Visualization & BI",
            "claimed_score": 90,
            "verified_score": 85,
            "status": "Proficient",
            "confidence": "high",
            "evidence_count": 3
        },
        {
            "skill_id": "sql_fundamentals",
            "title": "SQL Fundamentals & Filtering",
            "category": "Relational Data Querying & SQL",
            "claimed_score": 75,
            "verified_score": 70,
            "status": "Developing",
            "confidence": "medium",
            "evidence_count": 2
        },
        {
            "skill_id": "sql_joins",
            "title": "Multi-Table Relational JOINs",
            "category": "Relational Data Querying & SQL",
            "claimed_score": 60,
            "verified_score": 65,
            "status": "Developing",
            "confidence": "medium",
            "evidence_count": 2
        },
        {
            "skill_id": "python_fundamentals",
            "title": "Python Core & Functional Programming",
            "category": "Python Programming & Analytics",
            "claimed_score": 70,
            "verified_score": 68,
            "status": "Developing",
            "confidence": "medium",
            "evidence_count": 2
        },
        {
            "skill_id": "pandas_data_manipulation",
            "title": "Pandas DataFrame Manipulation",
            "category": "Python Programming & Analytics",
            "claimed_score": 60,
            "verified_score": 48,
            "status": "Needs Remediation",
            "confidence": "medium",
            "evidence_count": 1
        },
        {
            "skill_id": "pandas_data_cleaning",
            "title": "Applied Data Cleaning & Preprocessing",
            "category": "Python Programming & Analytics",
            "claimed_score": 50,
            "verified_score": 42,
            "status": "Needs Remediation",
            "confidence": "medium",
            "evidence_count": 1
        },
        {
            "skill_id": "descriptive_statistics",
            "title": "Descriptive Statistics & Distributions",
            "category": "Applied Statistics & EDA",
            "claimed_score": 40,
            "verified_score": 35,
            "status": "Missing",
            "confidence": "low",
            "evidence_count": 1
        },
        {
            "skill_id": "power_bi_tableau",
            "title": "Power BI & Interactive Dashboards",
            "category": "Data Visualization & BI",
            "claimed_score": 30,
            "verified_score": 20,
            "status": "Missing",
            "confidence": "low",
            "evidence_count": 1
        },
        {
            "skill_id": "business_analytics",
            "title": "Business Problem Solving & Storytelling",
            "category": "Business Acumen",
            "claimed_score": 80,
            "verified_score": 72,
            "status": "Proficient",
            "confidence": "medium",
            "evidence_count": 2
        }
    ]

    for s in initial_skills:
        cursor.execute("""
        INSERT OR REPLACE INTO learner_skills (
            user_id, skill_id, title, category, claimed_score, verified_score, status, confidence, evidence_count, last_evaluated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            DEMO_USER_ID, s["skill_id"], s["title"], s["category"],
            s["claimed_score"], s["verified_score"], s["status"],
            s["confidence"], s["evidence_count"], now
        ))

    # 3. Seed Evidence Ledger items
    evidence_items = [
        # Excel Evidence
        (
            f"evi_excel_01", DEMO_USER_ID, "excel_analytics", "resume_claim", 90, "low",
            "Resume Claim: Nexus Retail Solutions",
            json.dumps({"detail": "Resume claimed advanced pivot tables and spreadsheet modeling for weekly revenue reconciliation."})
        ),
        (
            f"evi_excel_02", DEMO_USER_ID, "excel_analytics", "diagnostic", 85, "medium",
            "Diagnostic Assessment: Spreadsheet Modeling",
            json.dumps({"detail": "Scored 85% on XLOOKUP, nested conditions, and multi-field pivot table evaluations."})
        ),
        (
            f"evi_excel_03", DEMO_USER_ID, "excel_analytics", "applied_task", 85, "high",
            "Applied Task: Retail Ledger Reconciliation",
            json.dumps({"detail": "Successfully validated 50,000 transaction discrepancies with 0 variance errors."})
        ),
        # SQL Evidence
        (
            f"evi_sql_01", DEMO_USER_ID, "sql_fundamentals", "resume_claim", 75, "low",
            "Resume Claim: Introductory SQL",
            json.dumps({"detail": "Queried internal MySQL inventory database for customer order summaries."})
        ),
        (
            f"evi_sql_02", DEMO_USER_ID, "sql_fundamentals", "diagnostic", 70, "medium",
            "Diagnostic Assessment: SQL SELECT & Filtering",
            json.dumps({"detail": "Demonstrated solid grasp of WHERE clauses and compound predicates."})
        ),
        # Python Data Cleaning Evidence (The focal point of adaptation!)
        (
            f"evi_clean_01", DEMO_USER_ID, "pandas_data_cleaning", "resume_claim", 50, "low",
            "Resume Claim: Data Cleaning",
            json.dumps({"detail": "Cleaned customer shipment addresses in Elevate Logistics."})
        ),
        (
            f"evi_clean_02", DEMO_USER_ID, "pandas_data_cleaning", "checkpoint", 42, "medium",
            "Checkpoint: Pandas Data Cleaning",
            json.dumps({
                "detail": "Failed Missing Value Handling (Score: 42%). Root weakness detected in imputation vs deletion selection.",
                "weaknesses": ["missing_value_handling"]
            })
        )
    ]

    for item in evidence_items:
        cursor.execute("""
        INSERT OR REPLACE INTO evidence_ledger (
            id, user_id, skill_id, evidence_type, score, confidence, source_title, details_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7], now))

    # 4. Generate & Seed Roadmap DAG
    verified_map = {s["skill_id"]: {"score": s["verified_score"], "confidence": s["confidence"], "verified": True} for s in initial_skills}
    roadmap_agent = RoadmapAgent()
    dag = roadmap_agent.generate_initial_roadmap(
        user_id=DEMO_USER_ID,
        target_role="data_analyst",
        verified_skills=verified_map,
        weekly_hours=8.0,
        timeline_months=4
    )

    cursor.execute("""
    INSERT OR REPLACE INTO roadmaps (
        id, user_id, target_role, completion_percentage, total_nodes, completed_nodes, data_json, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        dag.roadmap_id, DEMO_USER_ID, dag.target_role,
        dag.completion_percentage, dag.total_nodes_count, dag.completed_nodes_count,
        dag.model_dump_json(), now
    ))

    # 5. Seed Capstone Project
    cursor.execute("""
    INSERT OR REPLACE INTO projects (
        id, user_id, title, description, skills_json, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        "proj_capstone_01",
        DEMO_USER_ID,
        "E-Commerce Revenue Intelligence & Customer Cohort Analysis",
        "Build an end-to-end data analytics pipeline: Ingest 50,000 raw online transaction records, clean missing shipping attributes using robust imputation, query monthly customer cohort retention with SQL window functions, and synthesize executive KPIs into an interactive Star Schema model.",
        json.dumps(["SQL", "Python", "Pandas", "Statistics", "Data Cleaning", "Power BI"]),
        "available",
        now
    ))

    # 6. Seed Sample Initial Audit Logs
    sample_audit = [
        ("Profile Agent", "parse_resume", "sample_resume_alex_rivera.pdf (2.4 MB)", "Extracted profile: 9 skills, 2 jobs", "SUCCESS", 342.5),
        ("Assessment Agent", "generate_diagnostic_assessment", "Role: Data Analyst", "Generated 7 multi-modal questions", "SUCCESS", 215.1),
        ("Skill Gap Analyzer", "calculate_gap_matrix", "Verified: 9 skills vs Data Analyst", "Gap Matrix: 2 Proficient, 3 Developing, 4 Gaps", "SUCCESS", 128.4),
        ("Roadmap Planner", "generate_roadmap_dag", "User: demo_learner_alex, 8h/wk", "Constructed DAG with 10 milestones", "SUCCESS", 184.2),
        ("Evaluator Agent", "evaluate_assessment_submission", "Checkpoint: Pandas Data Cleaning", "Score: 42% (NEEDS REMEDIATION)", "SUCCESS", 156.0),
        ("Adaptation Agent", "adapt_roadmap", "Node: node_pandas_cleaning (Score: 42%)", "Injected Remediation Node: Missing Value Handling", "SUCCESS", 210.8)
    ]

    for a in sample_audit:
        cursor.execute("""
        INSERT INTO audit_logs (timestamp, agent, action, input_ref, output_ref, status, duration_ms, details_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (now, a[0], a[1], a[2], a[3], a[4], a[5], json.dumps({"seeded": True})))

    conn.commit()
    conn.close()
    print("Demo environment successfully seeded for Alex Rivera (Data Analyst).")

if __name__ == "__main__":
    seed_demo_environment()
