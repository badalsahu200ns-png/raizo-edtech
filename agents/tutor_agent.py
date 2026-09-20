import os
import json
import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from agents.base import BaseAgent


class SourceCitation(BaseModel):
    title: str
    url: str
    provider_or_source: str
    relevant_snippet: str


class TutorMessage(BaseModel):
    role: str  # "user", "assistant", "system"
    content: str
    mode: str = "socratic"
    sources_used: List[SourceCitation] = []
    suggested_follow_ups: List[str] = []
    learner_context_used: Optional[Dict[str, Any]] = None


DATA_ANALYTICS_KEYWORDS = {
    # SQL
    "sql", "select", "from", "where", "group by", "having", "order by", "join",
    "inner join", "left join", "right join", "outer join", "self join", "cross join",
    "partition by", "window", "dense_rank", "rank", "row_number", "lag", "lead",
    "over", "cte", "with", "subquery", "case when", "coalesce", "nullif", "aggregate",
    "count", "sum", "avg", "min", "max", "distinct", "union", "database", "query",
    # Excel
    "excel", "spreadsheet", "vlookup", "xlookup", "index", "match", "index/match",
    "pivot table", "pivot", "slicer", "calculated field", "sumifs", "countifs",
    "text to columns", "conditional formatting", "dynamic arrays", "power query",
    # Python & Pandas
    "python", "pandas", "dataframe", "series", "numpy", "matplotlib", "seaborn",
    "read_csv", "fillna", "dropna", "isna", "isnull", "interpolate", "imputation",
    "groupby", "merge", "concat", "loc", "iloc", "apply", "lambda", "eda",
    # Statistics
    "statistics", "stats", "mean", "median", "mode", "variance", "standard deviation",
    "std", "iqr", "interquartile", "quartile", "outlier", "skew", "skewness", "kurtosis",
    "normal distribution", "gaussian", "empirical rule", "68-95-99.7", "bell curve",
    "p-value", "hypothesis", "null hypothesis", "alternative hypothesis", "alpha",
    "type i error", "type ii error", "confidence interval", "z-score", "t-test",
    # BI & Visualization
    "power bi", "tableau", "bi", "business intelligence", "dashboard", "kpi",
    "metric", "star schema", "snowflake schema", "cardinality", "cac", "ltv",
    "churn", "retention", "conversion", "sales funnel", "cohort", "cohort analysis",
    "bar chart", "line chart", "histogram", "box plot", "scatter plot", "heatmap", "pareto",
    # General analytics & interview
    "analytics", "analyst", "data analysis", "data cleaning", "interview",
    "case study", "business understanding", "funnel", "revenue", "segmentation", "alex"
}

OUT_OF_DOMAIN_RESPONSE = (
    "I'm RAIZO Tutor, focused on Data Analytics. I can help you with SQL, Excel, Python, "
    "Pandas, Statistics, BI, visualization, and analytics interview preparation."
)


class TutorAgent(BaseAgent):
    def __init__(self, knowledge_file_path: Optional[str] = None):
        super().__init__(
            name="RAIZO Tutor",
            role_description="Expert Data Analytics educator delivering Socratic dialogues, technical definitions, practical business analogies, and interview coaching."
        )
        self.knowledge_file_path = knowledge_file_path or os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "knowledge", "rag_documents", "curriculum_knowledge.json"
        )
        self.knowledge_docs = self._load_knowledge()

    def _load_knowledge(self) -> List[Dict[str, Any]]:
        if os.path.exists(self.knowledge_file_path):
            try:
                with open(self.knowledge_file_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return []

    def is_in_domain(self, query: str) -> bool:
        q_lower = query.lower().strip()
        if len(q_lower) < 4:
            return True  # Short greetings / affirmatives
        # Check if any analytics keyword is present
        for kw in DATA_ANALYTICS_KEYWORDS:
            if kw in q_lower:
                return True
        # Check greetings / meta
        greetings = ["hello", "hi", "hey", "help", "start", "guide", "explain", "why", "how", "what"]
        words = re.findall(r"\w+", q_lower)
        if len(words) <= 2 and any(w in greetings for w in words):
            return True
        return False

    def retrieve_relevant_documents(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        """Hybrid keyword match over curated curriculum documents."""
        if not self.knowledge_docs:
            return []

        tokens = re.findall(r"\w+", query.lower())
        scored = []
        for doc in self.knowledge_docs:
            score = 0
            doc_text = (doc.get("title", "") + " " + doc.get("content", "") + " " + " ".join(doc.get("keywords", []))).lower()
            for token in tokens:
                if len(token) > 2:
                    if token in doc_text:
                        score += 1
                        if token in [k.lower() for k in doc.get("keywords", [])]:
                            score += 2
            if score > 0:
                scored.append((score, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:top_k]]

    def respond(
        self,
        user_message: str,
        mode: str = "socratic",
        current_node: Optional[Dict[str, Any]] = None,
        learner_profile: Optional[Dict[str, Any]] = None,
        current_weaknesses: Optional[List[str]] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        dataset_context: Optional[Dict[str, Any]] = None
    ) -> TutorMessage:
        """
        Generate grounded response based on mode, learner context, and retrieved RAG materials.
        Enforces Data Analytics domain guardrail and Gemini API integration with robust fallback.
        """
        def _execute():
            # Domain Guardrail Check
            if not self.is_in_domain(user_message):
                return TutorMessage(
                    role="assistant",
                    content=OUT_OF_DOMAIN_RESPONSE,
                    mode=mode,
                    sources_used=[],
                    suggested_follow_ups=[
                        "Explain the difference between PARTITION BY and GROUP BY",
                        "When should I use median instead of mean?",
                        "How do I choose between VLOOKUP and XLOOKUP in Excel?",
                        "Walk me through a Cohort Retention analysis in SQL"
                    ]
                )

            docs = self.retrieve_relevant_documents(user_message)
            sources: List[SourceCitation] = []
            for d in docs:
                sources.append(
                    SourceCitation(
                        title=d.get("title", "Curriculum Reference"),
                        url=d.get("source_url", "https://docs.python.org"),
                        provider_or_source=d.get("source_name", "Educational Authority"),
                        relevant_snippet=d.get("content", "")[:180] + "..."
                    )
                )

            weakness_str = ", ".join(current_weaknesses) if current_weaknesses else "Prerequisite review"
            node_title = current_node.get("title", "Data Analysis") if current_node else "Data Analytics"
            learner_name = learner_profile.get("name", "Learner") if learner_profile else "Learner"

            # Check if Gemini API is configured via GEMINI_API_KEY
            if self.api_key:
                try:
                    return self._generate_gemini_response(
                        user_message, mode, node_title, weakness_str, learner_name, docs, sources
                    )
                except Exception as e:
                    # Seamless fallback to deterministic engine
                    pass

            # Deterministic, high-fidelity pedagogical response engine
            return self._generate_deterministic_response(
                user_message, mode, node_title, weakness_str, learner_name, docs, sources, dataset_context
            )

        return self.execute_with_audit(
            action_name="generate_tutor_response",
            input_summary=f"Mode: {mode}, Query: '{user_message[:50]}...'",
            func=_execute
        )

    def _generate_gemini_response(
        self,
        query: str,
        mode: str,
        node: str,
        weaknesses: str,
        name: str,
        docs: List[Dict],
        sources: List[SourceCitation]
    ) -> TutorMessage:
        from google import genai

        client = genai.Client(api_key=self.api_key)

        system_instruction = (
            "You are RAIZO Tutor, an expert Data Analytics educator.\n"
            "Your purpose is to help beginners and intermediate learners develop practical Data Analytics skills.\n"
            "You specialize in:\n"
            "Excel, SQL, Python, Pandas, Statistics, Data Cleaning, EDA, Data Visualization, Power BI, Tableau, "
            "Business Intelligence, and Data Analytics interviews.\n\n"
            "Pedagogical Guidelines:\n"
            "1. Teach using simple language first and technical terminology second. Never introduce technical jargon without explaining it.\n"
            "2. When teaching a concept: explain plain language meaning, give a simple analogy, give formal technical definition, "
            "show a practical business example, explain common mistakes, give a small practice question, and ask the learner to solve it.\n"
            "3. When the user asks a SQL question, explain both the SQL mechanics and the analytical reasoning.\n"
            "4. When the user asks a statistics question, explain the intuition before formulas.\n"
            "5. When the user asks about visualization, explain: chart choice, axes, relationships, interpretation, and misuse cases.\n"
            "6. Do not simply give answers; use guided reasoning and progressive hints where appropriate.\n"
            f"7. If the user asks something unrelated to Data Analytics, respond: '{OUT_OF_DOMAIN_RESPONSE}'\n"
            f"Learner Name: {name}. Focus Milestone: {node}. Diagnosed Weaknesses: {weaknesses}."
        )

        doc_context = "\n".join([f"- {d['title']}: {d['content']}" for d in docs]) if docs else ""
        prompt = f"{system_instruction}\n\nVerified Curriculum Material:\n{doc_context}\n\nLearner asks: {query}"

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        text = response.text or "I am here to guide your Data Analytics learning journey."

        follow_ups = [
            "Explain this with a concrete practical code example",
            "What is the most common interview question on this topic?",
            "Give me a quick practice problem to test my mental model"
        ]

        return TutorMessage(
            role="assistant",
            content=text,
            mode=mode,
            sources_used=sources,
            suggested_follow_ups=follow_ups,
            learner_context_used={"mode": mode, "node": node}
        )

    def _generate_deterministic_response(
        self,
        query: str,
        mode: str,
        node_title: str,
        weaknesses: str,
        name: str,
        docs: List[Dict[str, Any]],
        sources: List[SourceCitation],
        dataset_context: Optional[Dict[str, Any]] = None
    ) -> TutorMessage:
        q_lower = query.lower()
        content = ""
        follow_ups = []

        # 0. Contextual Dataset Queries (RAIZO Data Analysis Lab)
        if dataset_context:
            filename = dataset_context.get("filename", "your uploaded dataset")
            num_cols = dataset_context.get("numeric_columns", [])
            cat_cols = dataset_context.get("categorical_columns", [])
            rows_cnt = dataset_context.get("row_count", 0)
            dup_cnt = dataset_context.get("duplicate_count", 0)
            missing_cnt = dataset_context.get("missing_count", 0)

            if "duplicate" in q_lower:
                content = (
                    f"### Why We Audit & Remove Duplicate Records\n\n"
                    f"In **{filename}**, {dup_cnt} duplicate record(s) were identified out of {rows_cnt:,} total rows.\n\n"
                    f"**1. The Statistical Danger:**\n"
                    f"Duplicate rows create artificial bias. If a customer purchase or survey entry is duplicated, statistical metrics like the **mean revenue** and standard deviation become mathematically skewed. Furthermore, training machine learning models on duplicated data causes overfitting.\n\n"
                    f"**2. When NOT to Remove Duplicates:**\n"
                    f"If the dataset represents anonymous transaction events that coincidentally share identical attributes (e.g. two independent customers buying a $10 item at 2:00 PM), records are only true duplicates if a unique identifier or transaction ID confirms they are accidental re-submissions.\n\n"
                    f"**3. Learning Check:**\n"
                    f"RAIZO always keeps your **Original Dataset** intact and creates a clean working copy so every cleaning step is 100% reversible!"
                )
                follow_ups = [
                    "How should I handle missing values in this dataset?",
                    "What does this correlation mean?",
                    "Which chart should I generate first for this data?"
                ]
                return TutorMessage(role="assistant", content=content, mode=mode, sources_used=sources, suggested_follow_ups=follow_ups, learner_context_used={"dataset": filename})

            elif "correlation" in q_lower:
                content = (
                    f"### Understanding Correlation in {filename}\n\n"
                    f"**1. Core Rule (Correlation ≠ Causation):**\n"
                    f"A correlation coefficient ($r$) ranges from **-1.0 to +1.0**:\n"
                    f"- **$r \\approx +1.0$**: Strong positive relationship (as variable A increases, variable B tends to increase).\n"
                    f"- **$r \\approx 0.0$**: No linear relationship.\n"
                    f"- **$r \\approx -1.0$**: Strong negative relationship (as variable A increases, variable B tends to decrease).\n\n"
                    f"**2. Critical Analytical Caveat:**\n"
                    f"Even if two numeric variables like `{', '.join(num_cols[:2]) if len(num_cols) >= 2 else 'Price & Volume'}` show high correlation, never write *'X causes Y'* in an executive briefing unless controlled experimentation (A/B testing) has isolated confounding variables."
                )
                follow_ups = [
                    "Why did you remove these duplicates?",
                    "Why is a histogram useful here?",
                    "Can you explain this graph like I'm a beginner?"
                ]
                return TutorMessage(role="assistant", content=content, mode=mode, sources_used=sources, suggested_follow_ups=follow_ups, learner_context_used={"dataset": filename})

            elif "histogram" in q_lower:
                content = (
                    f"### Why a Histogram is Essential for Numerical Variables\n\n"
                    f"In **{filename}**, numeric variables like `{', '.join(num_cols[:3]) if num_cols else 'metrics'}` require frequency analysis.\n\n"
                    f"**1. What It Shows:**\n"
                    f"A histogram bins continuous numbers into ranges (e.g. $0-$10, $10-$20) and plots how many records fall into each bucket.\n\n"
                    f"**2. Why It Matters Before Modeling:**\n"
                    f"A simple summary average hides whether data is normally distributed (bell-shaped) or heavily right-skewed by extreme outliers. Looking at the histogram tells you immediately whether you should report the **Mean** or the **Median**!"
                )
                follow_ups = [
                    "When should I use a box plot instead of a histogram?",
                    "What does an outlier mean?",
                    "Which chart should I use for categorical data?"
                ]
                return TutorMessage(role="assistant", content=content, mode=mode, sources_used=sources, suggested_follow_ups=follow_ups, learner_context_used={"dataset": filename})

            elif "outlier" in q_lower:
                content = (
                    f"### Understanding Outliers in {filename}\n\n"
                    f"**1. The Heuristic Rule:**\n"
                    f"*An outlier is an extreme observation, but an outlier is NOT necessarily an error!*\n\n"
                    f"**2. How RAIZO Detects Outliers ($1.5 \\times \\text{{IQR}}$):**\n"
                    f"We calculate the Interquartile Range (IQR = Q3 - Q1). Points outside `[Q1 - 1.5*IQR, Q3 + 1.5*IQR]` are flagged as potential outliers.\n\n"
                    f"**3. How a Senior Analyst Handles Outliers:**\n"
                    f"- If it's a data entry error (e.g. `Age = 999`): clean or remove it.\n"
                    f"- If it's a legitimate high-value enterprise transaction (e.g. a $250,000 corporate purchase): keep it, but report median alongside mean to prevent false executive conclusions."
                )
                follow_ups = [
                    "What chart shows outliers best?",
                    "Why did you remove these duplicates?",
                    "Explain this dataset like I'm a beginner"
                ]
                return TutorMessage(role="assistant", content=content, mode=mode, sources_used=sources, suggested_follow_ups=follow_ups, learner_context_used={"dataset": filename})

            elif "beginner" in q_lower or "explain this" in q_lower or "what does this" in q_lower:
                content = (
                    f"### Beginner's Guided Tour of {filename}\n\n"
                    f"Welcome to the dataset! Here is how a professional analyst thinks about this file:\n\n"
                    f"1. **Dimensions**: You have **{rows_cnt:,} rows** and **{len(num_cols) + len(cat_cols)} columns**.\n"
                    f"2. **Numeric Columns** ({len(num_cols)}): These measure quantities you can calculate averages on (`{', '.join(num_cols[:3]) if num_cols else 'None'}`).\n"
                    f"3. **Categorical Columns** ({len(cat_cols)}): These group records into buckets (`{', '.join(cat_cols[:3]) if cat_cols else 'None'}`).\n"
                    f"4. **Data Health**: Look at the Data Quality tab. We detected {missing_cnt} missing cell(s) and {dup_cnt} duplicate(s). Always clean before calculating statistics!"
                )
                follow_ups = [
                    "Why did you remove these duplicates?",
                    "What does this correlation mean?",
                    "Which chart should I generate first?"
                ]
                return TutorMessage(role="assistant", content=content, mode=mode, sources_used=sources, suggested_follow_ups=follow_ups, learner_context_used={"dataset": filename})


        # 1. SQL: PARTITION BY vs GROUP BY
        if ("partition" in q_lower and "group by" in q_lower) or ("difference between partition by and group by" in q_lower):
            content = (
                f"### The Core Difference: `PARTITION BY` vs `GROUP BY`\n\n"
                f"**1. Plain Language Meaning:**\n"
                f"- `GROUP BY` **collapses** multiple individual records into a single summary row per group. You lose individual row granularity.\n"
                f"- `PARTITION BY` divides records into calculation groups **without collapsing them**. Every original row is preserved, and the calculation appears alongside each record.\n\n"
                f"**2. Real-World Analogy:**\n"
                f"Imagine a school classroom. A `GROUP BY gender` is like taking attendance and reporting: *'15 girls, 14 boys'* (only 2 rows). "
                f"A `PARTITION BY gender` is like having every student remain at their desk while the teacher whispers to each student their personal height rank among students of their same gender (all 29 desks stay intact!).\n\n"
                f"**3. Practical SQL Example:**\n"
                f"```sql\n"
                f"-- GROUP BY collapses into 1 row per department\n"
                f"SELECT department_id, AVG(salary) AS avg_sal\n"
                f"FROM employees\n"
                f"GROUP BY department_id;\n\n"
                f"-- PARTITION BY keeps every employee and shows their department average beside them\n"
                f"SELECT employee_id, department_id, salary,\n"
                f"       AVG(salary) OVER(PARTITION BY department_id) AS dept_avg_salary\n"
                f"FROM employees;\n"
                f"```\n\n"
                f"**4. Common Mistake:**\n"
                f"Trying to use `WHERE` to filter window functions. Window functions run *after* `WHERE` and `GROUP BY`, so you must wrap window queries inside a **CTE** or **Subquery** if you want to filter on their results."
            )
            follow_ups = [
                "Give me a dense ranking example with salary data",
                "Why does DENSE_RANK not skip numbers on ties?",
                "Test me with an applied query question",
                "How does LAG() compare with PARTITION BY?"
            ]

        # 2. SQL: Dense Ranking vs Rank vs Row_Number
        elif "dense" in q_lower or "rank" in q_lower or "tie" in q_lower:
            content = (
                f"### `ROW_NUMBER()` vs `RANK()` vs `DENSE_RANK()`\n\n"
                f"**1. Plain Language Intuition:**\n"
                f"When values tie (e.g., two employees both earn $100,000):\n"
                f"- `ROW_NUMBER()`: Assigns arbitrary unique integers: `1, 2, 3, 4`. No ties allowed.\n"
                f"- `RANK()`: Ties get the same rank, but **skips** the next ranks: `1, 1, 3, 4` (like Olympic medals; two golds means bronze is 3rd).\n"
                f"- `DENSE_RANK()`: Ties get the same rank and **does not skip** numbers: `1, 1, 2, 3`.\n\n"
                f"**2. Concrete Salary Table Comparison:**\n"
                f"| Salary | `RANK()` | `DENSE_RANK()` | `ROW_NUMBER()` |\n"
                f"|---|---|---|---|\n"
                f"| $100,000 | 1 | 1 | 1 |\n"
                f"| $100,000 | 1 | 1 | 2 |\n"
                f"| $90,000  | 3 (skipped 2!) | 2 (no gap) | 3 |\n"
                f"| $80,000  | 4 | 3 | 4 |\n\n"
                f"**3. Interview Follow-Up Question:**\n"
                f"*'How do you find the 2nd highest salary in each department?'*\n"
                f"Use `DENSE_RANK()`! If you used `RANK()`, a two-way tie for 1st place means rank 2 does not even exist, causing your query to return zero rows!"
            )
            follow_ups = [
                "Write a query to get the second highest salary per department",
                "Explain the difference between PARTITION BY and GROUP BY",
                "Show me Month-over-Month growth using LAG()",
                "Test me with an applied query question"
            ]

        # 3. Statistics: Mean vs Median and Skewness
        elif "mean" in q_lower and "median" in q_lower or "skew" in q_lower:
            content = (
                f"### Mean vs Median in Skewed Data\n\n"
                f"**1. Plain Language Intuition:**\n"
                f"- **Mean**: The mathematical balance point. It is highly sensitive to extreme outliers because every value contributes to the total sum.\n"
                f"- **Median**: The middle physical observation when sorted. Exactly 50% of data is below it and 50% is above it.\n\n"
                f"**2. Real-World Business Example:**\n"
                f"Imagine a small company with 9 employees earning $50,000 and 1 CEO earning $2,000,000.\n"
                f"- Mean Salary: `(9 × 50,000 + 2,000,000) / 10 = $245,000`\n"
                f"- Median Salary: `$50,000`\n\n"
                f"If a recruiter claims the average employee earns $245,000, that is technically true by mean, but completely deceptive! "
                f"In right-skewed distributions (income, house prices, customer spend), the **Median** is the superior measure of central tendency."
            )
            follow_ups = [
                "What is the Empirical Rule (68-95-99.7)?",
                "How do Box Plots detect outliers using 1.5 × IQR?",
                "Explain Type I vs Type II errors",
                "Test me with an applied query question"
            ]

        # 4. Statistics: Normal Distribution & Empirical Rule
        elif "normal" in q_lower or "empirical" in q_lower or "68" in q_lower:
            content = (
                f"### The Normal Distribution & The Empirical Rule (68–95–99.7%)\n\n"
                f"**1. Core Properties:**\n"
                f"- Symmetric, bell-shaped distribution.\n"
                f"- **Mean ≈ Median ≈ Mode** located exactly at the center.\n\n"
                f"**2. The Empirical Rule Invariants:**\n"
                f"- **68.2%** of all observations fall within **±1 Standard Deviation (μ ± 1σ)**.\n"
                f"- **95.4%** of observations fall within **±2 Standard Deviations (μ ± 2σ)**.\n"
                f"- **99.7%** of observations fall within **±3 Standard Deviations (μ ± 3σ)**.\n\n"
                f"**3. Outlier Rule of Thumb:**\n"
                f"In a normally distributed metric, any observation beyond 3 standard deviations (z-score > 3 or < -3) represents less than 0.3% probability and qualifies as a statistical outlier requiring business investigation."
            )
            follow_ups = [
                "How does a Box Plot calculate IQR?",
                "What is a p-value in hypothesis testing?",
                "Explain the difference between PARTITION BY and GROUP BY"
            ]

        # 5. Excel: XLOOKUP vs VLOOKUP vs INDEX/MATCH
        elif "excel" in q_lower or "vlookup" in q_lower or "xlookup" in q_lower or "index/match" in q_lower:
            content = (
                f"### Modern Excel Analytics: XLOOKUP vs VLOOKUP vs INDEX/MATCH\n\n"
                f"**1. Why VLOOKUP is fragile:**\n"
                f"- Lookups can only move from left to right (return column must be to the right of lookup column).\n"
                f"- Inserting a new column between columns breaks hardcoded column index numbers.\n"
                f"- Defaults to approximate match (`TRUE`), leading to silent incorrect matches if forgotten.\n\n"
                f"**2. Why XLOOKUP is standard in modern Excel:**\n"
                f"```excel\n"
                f"=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode])\n"
                f"```\n"
                f"- Can look in any direction (left, right, up, down).\n"
                f"- Resilient to column insertions.\n"
                f"- Defaults to exact match (`0`).\n"
                f"- Built-in `if_not_found` avoids nested `=IFERROR()` wrappers.\n\n"
                f"**3. When INDEX/MATCH is still preferred:**\n"
                f"Backward compatibility with legacy Excel workbooks (.xls, Excel 2016 and older) and complex two-dimensional matrix lookups."
            )
            follow_ups = [
                "Show me how to build a dynamic Pivot Table with Slicers",
                "Explain SUMIFS and COUNTIFS with multiple criteria",
                "Explain the difference between PARTITION BY and GROUP BY"
            ]

        # 6. Data Visualization: Chart Selection
        elif "chart" in q_lower or "visualization" in q_lower or "plot" in q_lower or "graph" in q_lower:
            content = (
                f"### Data Visualization & Chart Selection Framework\n\n"
                f"| Chart Type | Primary Analytical Purpose | Misuse Case to Avoid |\n"
                f"|---|---|---|\n"
                f"| **Bar Chart** | Categorical comparison | Using truncated Y-axis that exaggerates small differences |\n"
                f"| **Line Chart** | Continuous time-series trends | Categorical data with no natural chronological order |\n"
                f"| **Histogram** | Numerical frequency distribution | Confusing bars with discrete categories (bins are continuous) |\n"
                f"| **Box Plot** | Five-number summary, median & outliers | Bimodal data (hides multi-peak distributions) |\n"
                f"| **Scatter Plot** | Correlation between two continuous variables | Overplotting thousands of points without opacity/alpha |\n"
                f"| **Heatmap** | Multi-dimensional density or matrix correlation | Rainbow palettes that lack perceptual uniformity |\n"
                f"| **Pareto Chart** | 80/20 cumulative impact analysis | Inverting order (must be sorted descending) |"
            )
            follow_ups = [
                "Explain Box Plot whiskers and 1.5 × IQR",
                "When should I use median instead of mean?",
                "Explain the difference between PARTITION BY and GROUP BY"
            ]

        # 7. Default Socratic Guidance
        else:
            doc_context = docs[0]["content"] if docs else "structured business analytics"
            content = (
                f"Let's explore '{query}'. In our Data Analytics curriculum ({node_title}), the core goal is "
                f"understanding both the technical computation and the underlying business reasoning.\n\n"
                f"**Curriculum Foundation:**\n"
                f"{doc_context[:240]}...\n\n"
                f"To test your intuition: if a business stakeholder asked you to verify this metric across "
                f"multiple customer segments, what analytical step or query structure would you check first?"
            )
            follow_ups = [
                "Explain the difference between PARTITION BY and GROUP BY",
                "Give me a dense ranking example with salary data",
                "Why does DENSE_RANK not skip numbers on ties?",
                "Test me with an applied query question"
            ]

        return TutorMessage(
            role="assistant",
            content=content,
            mode=mode,
            sources_used=sources,
            suggested_follow_ups=follow_ups,
            learner_context_used={
                "target_node": node_title,
                "diagnosed_weaknesses": weaknesses,
                "sources_retrieved_count": len(sources)
            }
        )
