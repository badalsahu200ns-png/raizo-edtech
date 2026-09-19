# RAIZO Architecture & Engineering Specification

**Adaptive AI Learning & Skill Intelligence Agent**  
*By Badal Kumar Sahu*  
*Hackathon: Agentic AI Hackathon 2026 (EduPath Problem Statement)*

---

## 1. Executive Summary

RAIZO is an evidence-based, adaptive learning agent that replaces static course recommendation systems and isolated chatbots with an autonomous competency intelligence engine. The central workflow is:

```
PROFILE → VERIFY → DIAGNOSE → PLAN → LEARN → PRACTICE → EVALUATE → ADAPT → REASSESS → PROGRESS
```

Instead of treating self-reported claims or LLM inferences as truth, RAIZO tracks an immutable **Evidence Ledger** with strict confidence scoring. When a learner struggles or fails an applied milestone (e.g. 42% on Pandas Data Cleaning), the **Evaluator Agent** isolates the root conceptual prerequisite weakness (e.g. Missing Value Handling), and the **Adaptation Agent** dynamically modifies the Directed Acyclic Graph (DAG) roadmap to inject targeted remediation.

---

## 2. System Architecture Diagram

```
                                  ┌─────────────────────────────────────────┐
                                  │      RAIZO Next.js Web Application      │
                                  │       (Dark-First, Tailwind, Lucide)    │
                                  └────────────────────┬────────────────────┘
                                                       │ HTTP REST / JSON
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │        RAIZO FastAPI Backend API        │
                                  │    (Auth, State, Document Pipeline)     │
                                  └────────────────────┬────────────────────┘
                                                       │
         ┌─────────────────────────────────────────────┴─────────────────────────────────────────────┐
         ▼                                             ▼                                             ▼
┌──────────────────┐                         ┌───────────────────┐                         ┌───────────────────┐
│   Agent Hub      │                         │  Knowledge & RAG  │                         │ Database & State  │
│                  │                         │                   │                         │                   │
│ 1. Profile Agent │                         │ • ESCO / O*NET    │                         │ • Users & Auth    │
│ 2. Assess Agent  │                         │   Competency      │                         │ • Resumes/Docs    │
│ 3. Gap Analyzer  │                         │ • Trusted Doc     │                         │ • Evidence Ledger │
│ 4. Roadmap (DAG) │                         │   Sources (Pandas,│                         │ • Skill Matrix    │
│ 5. Socratic Tutor│                         │   Python, SQL)    │                         │ • Roadmap Nodes   │
│ 6. Evaluator     │                         │ • Hybrid Vector & │                         │ • Submissions     │
│ 7. Adaptation    │                         │   BM25 Retrieval  │                         │ • Audit Event Log │
└──────────────────┘                         └───────────────────┘                         └───────────────────┘
```

---

## 3. Specialized Agent Contracts

| Agent | Responsibility | Input Contract | Output Contract |
|---|---|---|---|
| **Profile Agent** | Document parsing (PDF, DOCX, TXT), entity extraction, claims ledger. | `filename: str, bytes: bytes` | `ParsedProfile` (Pydantic) |
| **Assessment Agent** | Diagnostic & checkpoint generation mapped to sub-skills. | `skill_id: str, role: str` | `Assessment` (Pydantic) |
| **Skill Gap Analyzer** | Delta computation against standardized role models with "Why?" reasons. | `verified_skills: Dict` | `GapMatrix` (Pydantic) |
| **Roadmap Planner** | Prerequisite-aware DAG construction and weekly calendar allocation. | `verified_skills, hours` | `RoadmapDAG` (Pydantic) |
| **Adaptive Tutor** | Socratic dialogue, multi-mode instruction, verified RAG citations. | `message, mode, context` | `TutorMessage` (Pydantic) |
| **Evaluator Agent** | Deterministic rubric scoring (0-49, 50-69, 70-84, 85-100). | `answers, questions` | `EvaluationResult` (Pydantic) |
| **Adaptation Agent** | Root-cause analysis and dynamic DAG restructuring upon failure. | `current_dag, eval_res` | `AdaptationResult` (Pydantic) |
| **Struggle Detector** | Multi-attempt pattern monitoring & pedagogical intervention trigger. | `attempt_history` | `StrugglePattern` (Pydantic) |

---

## 4. Deterministic Scoring & Threshold Invariants

Score ranges are strictly enforced by application logic rather than arbitrary model hallucinations:

- **0–49% (Needs Remediation)**: Checkpoint failed. Injects prerequisite remediation node immediately into the DAG. Downstream successor milestones remain locked.
- **50–69% (Developing)**: Partial proficiency. Retains node in active state and assigns targeted practice tasks.
- **70–84% (Proficient)**: Benchmark satisfied. Node marked as `passed`. Successor nodes whose prerequisites are satisfied are unlocked.
- **85–100% (Strong)**: High-competency benchmark. Unlocks advanced challenges and capstone tasks.

---

## 5. Directed Acyclic Graph (DAG) Algorithm

The learning path is structured as a DAG $G = (V, E)$ where vertices $V$ represent competency milestones and directed edges $(u, v) \in E$ indicate that milestone $u$ is a strict prerequisite for milestone $v$.

1. **Topological Order**: Nodes are visited in topological ordering $u_1, u_2, \dots, u_n$.
2. **Locking Rule**: A node $v$ transitions from `locked` to `available` if and only if $\forall u \in \text{Prerequisites}(v), \text{Status}(u) \in \{\text{passed}, \text{completed}\}$.
3. **Dynamic Remediation Injection**:
   When node $v$ fails:
   - Root prerequisite $w$ is isolated.
   - Remediation node $r_w$ is inserted into $V$.
   - Edge $(r_w, v)$ is added to $E$, making $v$ depend on $r_w$.
   - Node $v$ transitions to `locked` until $r_w$ achieves $\text{Status}(r_w) = \text{passed}$.
