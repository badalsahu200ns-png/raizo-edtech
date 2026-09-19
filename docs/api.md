# RAIZO Backend REST API Reference

The backend exposes fully typed REST endpoints served by FastAPI at `http://127.0.0.1:8000`.

---

## Endpoints

### 1. Health & Status
- `GET /api/health` — Verifies engine health, database connection, and agent readiness.

### 2. Profile & Resume Ingestion
- `POST /api/profile/upload` — Multipart form upload (`file`, `user_id`). Validates PDF, DOCX, TXT formats up to 10 MB, calls `ProfileAgent.parse_document`, stores resume in database, extracts work history and skills with `unverified` status.
- `GET /api/profile?user_id={id}` — Returns profile metadata, work experiences, education records, and latest resume extraction.
- `PUT /api/profile?user_id={id}` — Updates learner career goals, weekly hours, or target role.
- `POST /api/onboarding/complete` — Complete multi-step onboarding wizard submission.

### 3. Competencies & Gap Intelligence
- `GET /api/skills?user_id={id}` — Returns all learner skills, claimed scores, verified scores, statuses, and evidence counts.
- `GET /api/skills/{skill_id}?user_id={id}` — Returns deep dive for specific skill including historical evidence entries and recommended resources.
- `GET /api/gaps?user_id={id}&target_role={role}` — Calls `SkillGapAgent.analyze_gaps` returning overall readiness score, gap matrix, and "Why?" root explanations.

### 4. Roadmap (DAG)
- `GET /api/roadmap?user_id={id}` — Returns current prerequisite-aware Directed Acyclic Graph (DAG) and weekly study plan.
- `POST /api/roadmap/generate?user_id={id}&target_role={role}` — Recomputes topological DAG order and calendar allocation.

### 5. Assessments, Evaluation & Adaptation
- `POST /api/assessment/generate?type={diagnostic|checkpoint}&skill_id={id}&node_title={title}` — Generates multi-modal assessment questions.
- `GET /api/assessment/{id}` — Retrieves assessment payload.
- `POST /api/assessment/submit` — Evaluates answers deterministically using `EvaluatorAgent`. If score < 70%, triggers `AdaptationAgent.adapt_roadmap_after_evaluation` to insert remediation nodes and re-route the DAG! If >= 70%, marks milestone passed and unlocks dependent successors.

### 6. Adaptive Tutor & Knowledge (RAG)
- `POST /api/tutor/message` — Context-aware conversation with Raizo Tutor. Retrieves verified RAG citations from `curriculum_knowledge.json`.
- `GET /api/tutor/history?user_id={id}` — Returns conversation thread.

### 7. Evidence Ledger & Reports
- `GET /api/evidence?user_id={id}` — Returns chronological audit trail of all empirical claims, diagnostics, checkpoints, and tasks.
- `GET /api/reports/weekly?user_id={id}` — Returns weekly progress report (+% velocity, acquired skills, remaining gaps).

### 8. Job Analyzer & Capstone Projects
- `POST /api/job/analyze` — Compares pasted target Job Description against verified profile, outputting match %, missing skills, and readiness.
- `GET /api/projects?user_id={id}` — Retrieves capstone challenges.
- `POST /api/projects/submit` — Evaluates capstone submission against multi-point rubrics.

### 9. Auditing & Mentorship
- `GET /api/audit/logs?limit={n}` — Returns real-time agent execution events for transparency.
- `POST /api/override` — Certified human mentor override for skill scores or milestones.
- `POST /api/demo/reset` — Resets database to canonical Alex Rivera Data Analyst seed state.
