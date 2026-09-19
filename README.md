# RAIZO — Adaptive AI Learning & Skill Intelligence Agent

> **Learn what you need. Prove what you know. Adapt as you grow.**  
> *By Badal Kumar Sahu*  
> *Built for the Agentic AI Hackathon 2026 (EduPath: Personalized Learning & Skill Gap Agent)*

---

## 🌟 What is RAIZO?

RAIZO is an evidence-based competency intelligence web application. Unlike static course recommendation systems or generic chatbots, RAIZO is built on a central principle:

> **"What you claim to know is not what you can actually demonstrate."**

RAIZO analyzes your existing capabilities through genuine resume parsing, benchmarks your skills with empirical assessments, detects exact competency gaps against target roles (demonstration role: **Data Analyst**), synthesizes a prerequisite-aware Directed Acyclic Graph (DAG) roadmap, and **dynamically adapts your learning journey when you fail or struggle**.

---

## 🔄 The Central Adaptive Loop

```
PROFILE → VERIFY → DIAGNOSE → PLAN → LEARN → PRACTICE → EVALUATE → ADAPT → REASSESS → PROGRESS
```

1. **PROFILE**: Upload real resumes (PDF, DOCX, TXT) or enter your background. Initial capabilities are recorded strictly as *Unverified Claims*.
2. **VERIFY**: Take diagnostic and applied benchmarks to prove competency.
3. **DIAGNOSE**: Compare verified capabilities against standardized role models (ESCO / O*NET) with explainable *"Why?"* root-cause breakdowns.
4. **PLAN**: Construct a prerequisite-aware Directed Acyclic Graph (DAG) and generate personalized weekly schedules tailored to your available hours (e.g. 8 hrs/week).
5. **LEARN**: Engage with the **Raizo Tutor** in Socratic, Beginner, Technical, or Analogy modes, grounded with clickable, verified curriculum citations.
6. **PRACTICE**: Solve hands-on applied SQL queries, Python data cleaning tasks, and case studies in the interactive sandbox.
7. **EVALUATE**: Automatic deterministic scoring across rubrics (0-49% Remediation, 50-69% Developing, 70-84% Proficient, 85-100% Strong).
8. **ADAPT (The Breakthrough)**: When an assessment fails (e.g. 42% on Pandas Data Cleaning), the **Adaptation Agent** isolates the root conceptual weakness (*Missing Value Handling*) and dynamically rewrites the DAG roadmap to inject targeted remediation.
9. **REASSESS**: Retake remediation checkpoints to prove mastery.
10. **PROGRESS**: Unlock dependent milestones in the topological graph, update the permanent Evidence Ledger, and generate periodic progress reports.

---

## 🤖 7-Agent Specialized Ecosystem

RAIZO avoids monolithic prompts by orchestrating 7 dedicated agents with strict Pydantic schemas:

- **1. Profile Agent**: Multi-format document parser (PDF via `pypdf`, DOCX via `python-docx`, TXT) extracting career entities, responsibilities, and unverified skill claims.
- **2. Assessment Agent**: Generates prerequisite-mapped diagnostic and checkpoint assessments across MCQs, SQL queries, Python code, and scenarios.
- **3. Skill Gap Analyzer**: Computes deltas between verified capabilities and target role requirements with transparent root explanations.
- **4. Roadmap Planner**: Builds topological DAGs and assigns weekly study allocations based on real user constraints.
- **5. Adaptive Tutor**: Socratic pedagogical assistant with 8 modes, persistent learner memory, and grounded educational citations.
- **6. Evaluator Agent**: Deterministic rubric evaluation mapping mistakes to prerequisite sub-skills.
- **7. Adaptation Agent**: Injects remediation nodes into active DAGs and unlocks dependent successors upon verified milestone completion.
- **+ Struggle Detector**: Monitors multi-attempt friction patterns and flags persistent roadblocks.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Python 3.10+** (Tested on Python 3.14)
- **Node.js 18+** (Tested on Node.js v24.19.0)
- **npm 9+**

### 1. Backend (FastAPI API)
```bash
# Navigate to workspace root
cd raizo

# Activate virtual environment
# Windows:
.\.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies (if not already installed)
pip install -r apps/api/requirements.txt

# Seed the demo environment
python database/seed_data.py

# Launch FastAPI server (Runs on port 8000)
uvicorn apps.api.app.main:app --host 127.0.0.1 --port 8000 --reload
```

FastAPI OpenAPI Swagger documentation is available at:  
👉 **http://127.0.0.1:8000/docs**

### 2. Frontend (Next.js Application)
```bash
# In a separate terminal, navigate to apps/web
cd apps/web

# Install dependencies
npm install

# Launch Next.js development server (Runs on port 3000)
npm run dev
```

Open your browser to:  
👉 **http://localhost:3000**

---

## 🧪 Automated Testing

RAIZO includes a complete suite of automated unit and integration tests:

```bash
# Run all unit tests (Deterministic thresholds, DAG adaptation, Tutor, Profile parser)
.\.venv\Scripts\pytest tests/unit/test_agents.py -v

# Run full pipeline integration test (Health -> Profile -> Gaps -> Checkpoint -> Failure -> DAG Adaptation -> Re-routing -> Evidence -> Reports)
.\.venv\Scripts\pytest tests/integration/test_pipeline.py -v
```

---

## 🎬 3-Minute Live Hackathon Demo Guide

1. **The Problem (0:00–0:20)**: Open `http://localhost:3000`. Show how standard chatbots lack evidence tracking.
2. **Resume Upload (0:20–0:40)**: Go to **Onboarding** and drag `database/sample_resumes/alex_rivera_resume.docx`. Notice that extracted capabilities are labeled **Self-Reported / Unverified**.
3. **Skill Gap Matrix (0:40–1:00)**: Open **Skill Gaps**. Notice current vs required benchmarks with granular *"Why?"* root-cause breakdowns.
4. **DAG Learning Path (1:00–1:40)**: Open **Learning Path**. Notice that advanced nodes (SQL Window Functions, Power BI Star Schema) are strictly locked by prerequisites.
5. **Socratic Tutor (1:40–2:00)**: Open **Raizo Tutor**. Ask *"What is a SQL window function?"* and view verified PostgreSQL documentation citations.
6. **Checkpoint Failure & Dynamic DAG Adaptation (2:00–2:40)**: Open **Assessments** and launch *Pandas Data Cleaning Checkpoint*. Submit failing answers. The **Evaluator Agent** scores 42% and the **Adaptation Agent** dynamically injects a targeted remediation node into the DAG!
7. **Passing Remediation (2:40–2:55)**: Pass the remediation checkpoint, verify the next milestone unlocks, and view the updated **Evidence Ledger**.
8. **Live Agent Activity (2:55–3:00)**: Open the **Agent Activity** drawer from the top bar to show judges the real-time operational audit log!

---

## 🛡️ Trust, Privacy & AI Safety

- **Zero Hallucinated Resources**: Every educational link points to official, verified documentation (Python, PostgreSQL, Pandas, Microsoft Learn).
- **Deterministic Evaluation**: Pass/fail thresholds and node unlocking are governed by application logic, never by arbitrary LLM prompts.
- **Evidence Ledger**: Competency scores are backed by timestamped records of actual learner performance.
- **Mentorship Controls**: Certified human mentors can apply manual overrides with distinct audit trails.

---

## 📄 License & Credits

Created by **Badal Kumar Sahu** for the **Agentic AI Hackathon 2026**.  
*Tagline: Learn what you need. Prove what you know. Adapt as you grow.*
