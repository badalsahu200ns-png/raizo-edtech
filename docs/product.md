# RAIZO Product Specification & Hackathon Presentation Guide

**Product Identity**: RAIZO — Adaptive AI Learning & Skill Intelligence Agent  
**Creator**: Badal Kumar Sahu  
**Problem Statement**: EduPath: Personalized Learning & Skill Gap Agent (Agentic AI Hackathon 2026)  
**Tagline**: *Learn what you need. Prove what you know. Adapt as you grow.*  

---

## 1. Primary Persona: The Career Switcher

**Persona Name**: Alex Rivera  
**Current Role**: Marketing & Operations Associate (Nexus Retail Solutions)  
**Target Role**: Data Analyst  
**Available Time**: 8 Hours / Week  
**Timeline**: 4 Months  

Alex has basic familiarity with spreadsheets and introductory SQL queries from building retail reports, but lacks verified competency in Pandas data manipulation, statistical dispersion analysis, advanced SQL window functions, and interactive Power BI star schemas.

---

## 2. Standardized Competency Model & Bloom's Taxonomy

RAIZO maps curricula to standardized labor-market ontologies (ESCO / O*NET) using actionable Bloom's Taxonomy verbs:

| Bloom's Level | Competency Sub-Skill | Actionable Learning Objective |
|---|---|---|
| **Understand** | `sql_select_where` | Understand relational database schemas and write structured SELECT statements with compound WHERE filtering logic. |
| **Apply** | `sql_inner_left_join` | Apply INNER and LEFT JOIN operations across normalized entity tables to combine customer and order records without data loss. |
| **Analyze** | `sql_window_functions` | Analyze partition orderings using ROW_NUMBER and DENSE_RANK to extract top revenue products per segment. |
| **Apply** | `pandas_indexing_filtering` | Apply vectorized boolean indexing with `.loc` and `.iloc` to subset complex multi-index DataFrames. |
| **Analyze** | `missing_value_handling` | Analyze missingness mechanisms (MCAR, MAR, MNAR) and apply sound forward-fill, median, or deletion strategies. |
| **Evaluate** | `descriptive_statistics` | Evaluate transaction distributions using IQR and Tukey fences to isolate anomalous purchase amounts. |
| **Create** | `powerbi_data_modeling` | Create a robust Star Schema data model connecting fact tables with conformable dimension tables. |

---

## 3. The 3-Minute Live Hackathon Demo Path

Judges and evaluators can experience the complete agentic pipeline in 3 minutes:

1. **0:00 – 0:20: The Problem**
   Show the Landing Page. Explain why static course recommendations and generic chatbots fail learners by accepting unverified claims.
2. **0:20 – 0:40: Upload Resume & Extract Profile**
   Click **Upload My Resume** (or drag `database/sample_resumes/alex_rivera_resume.docx`).
   The **Profile Agent** extracts skills, work history, and sets all initial capabilities to *Unverified Claim (Low Confidence)*.
3. **0:40 – 1:00: Diagnostic Benchmark & Skill Gap Matrix**
   Navigate to **Skill Gaps**. The **Skill Gap Analyzer** displays current score vs required benchmark with granular *"Why?"* root-cause explanations.
4. **1:00 – 1:40: Personalized DAG Roadmap**
   Open **Learning Path**. Show the interactive prerequisite Directed Acyclic Graph (DAG) with locked advanced milestones (e.g. Window Functions and Star Schemas are locked).
5. **1:40 – 2:00: Raizo Socratic Tutor**
   Open **Raizo Tutor** in Socratic mode. Ask *"What is a SQL window function?"*. Inspect verified documentation citations from official PostgreSQL docs.
6. **2:00 – 2:30: Checkpoint Failure & Dynamic DAG Adaptation**
   Navigate to **Assessments** and launch the *Pandas Data Cleaning Checkpoint*. Submit failing answers.
   The **Evaluator Agent** scores 42% (Needs Remediation), detects root weakness *Missing Value Handling*, and the **Adaptation Agent** dynamically rewrites the DAG, injecting a targeted remediation node!
7. **2:30 – 2:50: Reattempt Remediation & Unlock Milestone**
   Take the remediation checkpoint, pass it with 100%, and verify that the next milestone unlocks and evidence is recorded with High confidence.
8. **2:50 – 3:00: Evidence Ledger & Weekly Report**
   Show the **Evidence Ledger** and **Reports** page showing the +11% velocity gain and full operational audit trail in the **Agent Activity Drawer**.
