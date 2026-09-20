"""
Internal Question Pools for the Data Analyst Role Diagnostic.
Contains 5 separate pools (pool_01 to pool_05), each with >= 25 questions balanced across:
- SQL Fundamentals (~4)
- SQL Joins & Relational Sets (~4)
- SQL Aggregation & Grouping (~4)
- Python Programming (~2)
- Pandas Data Manipulation (~3)
- Pandas Data Cleaning & Imputation (~3)
- Descriptive Statistics (~5)
Total: 25 questions per diagnostic attempt.
Points per question: 4 points. Total points: 100.
Passing score: 80% (20/25 correct).
"""

import random
import uuid
import time
from typing import Dict, Any, List, Optional

SKILLS = [
    "SQL Fundamentals",
    "SQL Joins & Relational Sets",
    "SQL Aggregation & Grouping",
    "Python Programming",
    "Pandas Data Manipulation",
    "Pandas Data Cleaning & Imputation",
    "Descriptive Statistics"
]

def _make_pools() -> Dict[str, List[Dict[str, Any]]]:
    pools: Dict[str, List[Dict[str, Any]]] = {}

    def generate_pool_questions(p_id: str) -> List[Dict[str, Any]]:
        questions = [
            # --- SQL FUNDAMENTALS (4 Qs) ---
            {
                "id": f"{p_id}_sql_1",
                "competency": "SQL Fundamentals",
                "category": "SQL",
                "difficulty": "Beginner",
                "points": 4,
                "question": "Which SQL clause evaluates row conditions before any grouping or aggregation takes place?",
                "options": [
                    {"id": "A", "text": "WHERE"},
                    {"id": "B", "text": "HAVING"},
                    {"id": "C", "text": "ORDER BY"},
                    {"id": "D", "text": "GROUP BY"}
                ],
                "correctAnswer": "A",
                "explanation": "WHERE filters raw individual table records before GROUP BY aggregation occurs.",
                "prerequisite_concept": "Logical Query Processing"
            },
            {
                "id": f"{p_id}_sql_2",
                "competency": "SQL Fundamentals",
                "category": "SQL",
                "difficulty": "Beginner",
                "points": 4,
                "question": "Which operator matches a string pattern containing zero or more wildcard characters in SQL?",
                "options": [
                    {"id": "A", "text": "LIKE with %"},
                    {"id": "B", "text": "MATCH with *"},
                    {"id": "C", "text": "IN with []"},
                    {"id": "D", "text": "BETWEEN with _"}
                ],
                "correctAnswer": "A",
                "explanation": "LIKE with '%' matches any sequence of zero or more characters.",
                "prerequisite_concept": "String Pattern Matching"
            },
            {
                "id": f"{p_id}_sql_3",
                "competency": "SQL Fundamentals",
                "category": "SQL",
                "difficulty": "Intermediate",
                "points": 4,
                "question": "What is the result of evaluating 'SELECT NULL = NULL;' in standard SQL?",
                "options": [
                    {"id": "A", "text": "UNKNOWN (treated as falsy in WHERE clauses)"},
                    {"id": "B", "text": "TRUE"},
                    {"id": "C", "text": "FALSE"},
                    {"id": "D", "text": "Syntax Error"}
                ],
                "correctAnswer": "A",
                "explanation": "In three-valued logic, NULL represents an unknown value; two unknowns cannot be asserted as equal.",
                "prerequisite_concept": "Three-Valued Logic & NULLs"
            },
            {
                "id": f"{p_id}_sql_4",
                "competency": "SQL Fundamentals",
                "category": "SQL",
                "difficulty": "Intermediate",
                "points": 4,
                "question": "Which statement best describes the difference between UNION and UNION ALL?",
                "options": [
                    {"id": "A", "text": "UNION deduplicates records by sorting; UNION ALL concatenates results without deduplicating."},
                    {"id": "B", "text": "UNION preserves duplicates; UNION ALL removes them."},
                    {"id": "C", "text": "UNION operates only on identical tables; UNION ALL operates on different schemas."},
                    {"id": "D", "text": "UNION ALL is slower because it requires indexing."}
                ],
                "correctAnswer": "A",
                "explanation": "UNION performs an expensive distinct sort operation to remove duplicates; UNION ALL directly appends rows.",
                "prerequisite_concept": "Set Operations"
            },

            # --- SQL JOINS & RELATIONAL SETS (4 Qs) ---
            {
                "id": f"{p_id}_join_1",
                "competency": "SQL Joins & Relational Sets",
                "category": "SQL",
                "difficulty": "Beginner",
                "points": 4,
                "question": "A query performs 'orders LEFT JOIN customers ON orders.customer_id = customers.id'. If an order has a customer_id not present in customers, what happens?",
                "options": [
                    {"id": "A", "text": "The order row is retained with NULL customer values."},
                    {"id": "B", "text": "The order row is dropped from the result set."},
                    {"id": "C", "text": "A foreign key violation exception is thrown."},
                    {"id": "D", "text": "The query defaults to the first customer in the table."}
                ],
                "correctAnswer": "A",
                "explanation": "LEFT JOIN guarantees preservation of every row from the left table (orders). Unmatched right table attributes populate as NULL.",
                "prerequisite_concept": "Outer Join Mechanics"
            },
            {
                "id": f"{p_id}_join_2",
                "competency": "SQL Joins & Relational Sets",
                "category": "SQL",
                "difficulty": "Intermediate",
                "points": 4,
                "question": "How do you construct an anti-join to find all products that have never been ordered?",
                "options": [
                    {"id": "A", "text": "products LEFT JOIN order_items ON p.id = oi.product_id WHERE oi.product_id IS NULL"},
                    {"id": "B", "text": "products INNER JOIN order_items ON p.id = oi.product_id WHERE oi.quantity = 0"},
                    {"id": "C", "text": "products FULL JOIN order_items ON p.id = oi.product_id WHERE p.id IS NOT NULL"},
                    {"id": "D", "text": "products RIGHT JOIN order_items ON p.id = oi.product_id WHERE oi.product_id IS NOT NULL"}
                ],
                "correctAnswer": "A",
                "explanation": "LEFT JOIN combined with WHERE right_key IS NULL filters out all records that had matching children.",
                "prerequisite_concept": "Anti-Join Pattern"
            },
            {
                "id": f"{p_id}_join_3",
                "competency": "SQL Joins & Relational Sets",
                "category": "SQL",
                "difficulty": "Intermediate",
                "points": 4,
                "question": "When table A has 5 rows (all with key=1) and table B has 4 rows (all with key=1), how many rows does 'A INNER JOIN B ON A.key = B.key' produce?",
                "options": [
                    {"id": "A", "text": "20 rows (Cartesian product of the join key)"},
                    {"id": "B", "text": "5 rows"},
                    {"id": "C", "text": "9 rows"},
                    {"id": "D", "text": "4 rows"}
                ],
                "correctAnswer": "A",
                "explanation": "Every row in A matches every row in B, producing 5 × 4 = 20 records (Cartesian fan-out).",
                "prerequisite_concept": "Cartesian Fan-Out"
            },
            {
                "id": f"{p_id}_join_4",
                "competency": "SQL Joins & Relational Sets",
                "category": "SQL",
                "difficulty": "Advanced",
                "points": 4,
                "question": "In a SELF JOIN comparing an employee to their direct manager (e.manager_id = m.employee_id), which employee will be omitted if an INNER JOIN is used?",
                "options": [
                    {"id": "A", "text": "The Chief Executive Officer (CEO) whose manager_id is NULL"},
                    {"id": "B", "text": "Entry-level employees with no direct reports"},
                    {"id": "C", "text": "Employees who earn less than their manager"},
                    {"id": "D", "text": "Contractors with temporary employee IDs"}
                ],
                "correctAnswer": "A",
                "explanation": "The CEO has NULL in manager_id; because NULL cannot match any employee_id in an INNER JOIN, the top executive is omitted unless a LEFT JOIN is used.",
                "prerequisite_concept": "Hierarchical Self Joins"
            },

            # --- SQL AGGREGATION & GROUPING (4 Qs) ---
            {
                "id": f"{p_id}_agg_1",
                "competency": "SQL Aggregation & Grouping",
                "category": "SQL",
                "difficulty": "Beginner",
                "points": 4,
                "question": "Why does the query 'SELECT department, employee_name, AVG(salary) FROM employees GROUP BY department;' fail in standard SQL?",
                "options": [
                    {"id": "A", "text": "employee_name is neither aggregated nor listed in the GROUP BY clause."},
                    {"id": "B", "text": "AVG() cannot be calculated on salary."},
                    {"id": "C", "text": "GROUP BY must always be followed by HAVING."},
                    {"id": "D", "text": "department cannot be both in SELECT and GROUP BY."}
                ],
                "correctAnswer": "A",
                "explanation": "Any column in the SELECT list that is not an aggregate function must be explicitly specified in the GROUP BY clause.",
                "prerequisite_concept": "Group By Collation Rules"
            },
            {
                "id": f"{p_id}_agg_2",
                "competency": "SQL Aggregation & Grouping",
                "category": "SQL",
                "difficulty": "Intermediate",
                "points": 4,
                "question": "Which ranking function assigns consecutive integer ranks without leaving gaps when values tie?",
                "options": [
                    {"id": "A", "text": "DENSE_RANK()"},
                    {"id": "B", "text": "RANK()"},
                    {"id": "C", "text": "ROW_NUMBER()"},
                    {"id": "D", "text": "NTILE()"}
                ],
                "correctAnswer": "A",
                "explanation": "DENSE_RANK() gives identical numbers to ties (e.g. 1, 1) and assigns the next distinct number immediately after (e.g. 2).",
                "prerequisite_concept": "Window Function Ranking"
            },
            {
                "id": f"{p_id}_agg_3",
                "competency": "SQL Aggregation & Grouping",
                "category": "SQL",
                "difficulty": "Intermediate",
                "points": 4,
                "question": "To calculate a 7-day rolling moving average of revenue ordered by date, which window frame specification is correct?",
                "options": [
                    {"id": "A", "text": "AVG(revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)"},
                    {"id": "B", "text": "AVG(revenue) OVER (PARTITION BY date ROWS 7)"},
                    {"id": "C", "text": "ROLLING_AVG(revenue, 7) OVER (ORDER BY date)"},
                    {"id": "D", "text": "AVG(revenue) OVER (ORDER BY date ROWS BETWEEN 7 PRECEDING AND 1 FOLLOWING)"}
                ],
                "correctAnswer": "A",
                "explanation": "6 preceding rows plus the current row equals exactly 7 consecutive chronological observations.",
                "prerequisite_concept": "Window Frames & Moving Averages"
            },
            {
                "id": f"{p_id}_agg_4",
                "competency": "SQL Aggregation & Grouping",
                "category": "SQL",
                "difficulty": "Advanced",
                "points": 4,
                "question": "What is the primary architectural advantage of Common Table Expressions (CTEs) over deeply nested subqueries?",
                "options": [
                    {"id": "A", "text": "Readability, modular top-down execution logic, and recursive capability"},
                    {"id": "B", "text": "Automatic physical indexing on disk"},
                    {"id": "C", "text": "Bypassing database permission checks"},
                    {"id": "D", "text": "Guaranteeing parallel multi-server execution"}
                ],
                "correctAnswer": "A",
                "explanation": "CTEs structure complex multi-stage transformations linearly from top to bottom, avoiding convoluted nested parentheses.",
                "prerequisite_concept": "Modular SQL & CTEs"
            },

            # --- PYTHON PROGRAMMING (2 Qs) ---
            {
                "id": f"{p_id}_py_1",
                "competency": "Python Programming",
                "category": "Python",
                "difficulty": "Beginner",
                "points": 4,
                "question": "In Python, which built-in data structure is immutable and commonly used for fixed coordinate pairs or dictionary keys?",
                "options": [
                    {"id": "A", "text": "Tuple"},
                    {"id": "B", "text": "List"},
                    {"id": "C", "text": "Dictionary"},
                    {"id": "D", "text": "Set"}
                ],
                "correctAnswer": "A",
                "explanation": "Tuples are immutable sequences in Python; their elements cannot be modified after creation.",
                "prerequisite_concept": "Python Data Structures"
            },
            {
                "id": f"{p_id}_py_2",
                "competency": "Python Programming",
                "category": "Python",
                "difficulty": "Intermediate",
                "points": 4,
                "question": "What does a list comprehension '[x**2 for x in data if x > 0]' accomplish?",
                "options": [
                    {"id": "A", "text": "Filters data for positive numbers and computes their squares in a concise list"},
                    {"id": "B", "text": "Multiplies positive numbers by 2 in-place"},
                    {"id": "C", "text": "Returns a generator object without evaluating items"},
                    {"id": "D", "text": "Raises an error if data contains negative integers"}
                ],
                "correctAnswer": "A",
                "explanation": "List comprehensions combine functional mapping (`x**2`) and filtering (`if x > 0`) in idiomatic Python.",
                "prerequisite_concept": "List Comprehensions & Functional Mapping"
            },

            # --- PANDAS DATA MANIPULATION (3 Qs) ---
            {
                "id": f"{p_id}_pd_1",
                "competency": "Pandas Data Manipulation",
                "category": "Pandas",
                "difficulty": "Beginner",
                "points": 4,
                "question": "Which Pandas method isolates rows based on boolean conditional labels rather than integer index positions?",
                "options": [
                    {"id": "A", "text": ".loc[]"},
                    {"id": "B", "text": ".iloc[]"},
                    {"id": "C", "text": ".ix[]"},
                    {"id": "D", "text": ".iat[]"}
                ],
                "correctAnswer": "A",
                "explanation": ".loc[] is label-based and condition-based; .iloc[] is strictly integer position-based.",
                "prerequisite_concept": "Pandas Indexing & Slicing"
            },
            {
                "id": f"{p_id}_pd_2",
                "competency": "Pandas Data Manipulation",
                "category": "Pandas",
                "difficulty": "Intermediate",
                "points": 4,
                "question": "To combine customer demographic DataFrame with transaction DataFrame preserving all customers, which syntax is correct?",
                "options": [
                    {"id": "A", "text": "pd.merge(customers, transactions, on='customer_id', how='left')"},
                    {"id": "B", "text": "pd.concat([customers, transactions], axis=1)"},
                    {"id": "C", "text": "customers.join(transactions, how='inner')"},
                    {"id": "D", "text": "pd.append(customers, transactions)"}
                ],
                "correctAnswer": "A",
                "explanation": "pd.merge with how='left' performs a relational left join on the specified foreign key.",
                "prerequisite_concept": "Pandas Relational Merging"
            },
            {
                "id": f"{p_id}_pd_3",
                "competency": "Pandas Data Manipulation",
                "category": "Pandas",
                "difficulty": "Advanced",
                "points": 4,
                "question": "What is the purpose of `.reset_index()` after performing a `.groupby()` aggregation in Pandas?",
                "options": [
                    {"id": "A", "text": "It converts grouped hierarchical index keys back into standard tabular columns."},
                    {"id": "B", "text": "It drops all duplicate rows from the resulting DataFrame."},
                    {"id": "C", "text": "It clears cached memory allocated by NumPy."},
                    {"id": "D", "text": "It sorts the DataFrame chronologically."}
                ],
                "correctAnswer": "A",
                "explanation": "GroupBy sets grouping keys as the index; .reset_index() flattens them back into columns for standard tabular analysis.",
                "prerequisite_concept": "Hierarchical MultiIndex Flattening"
            },

            # --- PANDAS DATA CLEANING & IMPUTATION (3 Qs) ---
            {
                "id": f"{p_id}_clean_1",
                "competency": "Pandas Data Cleaning & Imputation",
                "category": "Pandas",
                "difficulty": "Beginner",
                "points": 4,
                "question": "Which Pandas method is used to count the total missing values across each column in a DataFrame?",
                "options": [
                    {"id": "A", "text": "df.isna().sum()"},
                    {"id": "B", "text": "df.count_nulls()"},
                    {"id": "C", "text": "df.missing().total()"},
                    {"id": "D", "text": "df.drop_na().length()"}
                ],
                "correctAnswer": "A",
                "explanation": "df.isna() generates a boolean mask where True=1; summing across columns counts missing values.",
                "prerequisite_concept": "Missing Value Auditing"
            },
            {
                "id": f"{p_id}_clean_2",
                "competency": "Pandas Data Cleaning & Imputation",
                "category": "Pandas",
                "difficulty": "Intermediate",
                "points": 4,
                "question": "When imputing missing continuous numerical data containing extreme right-skewed outliers, which imputation strategy avoids skewing distribution center?",
                "options": [
                    {"id": "A", "text": "df['val'] = df['val'].fillna(df['val'].median())"},
                    {"id": "B", "text": "df['val'] = df['val'].fillna(df['val'].mean())"},
                    {"id": "C", "text": "df['val'] = df['val'].fillna(0)"},
                    {"id": "D", "text": "df['val'] = df['val'].fillna(df['val'].mode()[0])"}
                ],
                "correctAnswer": "A",
                "explanation": "Median is robust against extreme outliers; mean would artificially shift imputed values upward.",
                "prerequisite_concept": "Robust Imputation Strategy"
            },
            {
                "id": f"{p_id}_clean_3",
                "competency": "Pandas Data Cleaning & Imputation",
                "category": "Pandas",
                "difficulty": "Intermediate",
                "points": 4,
                "question": "To deduplicate customer records while retaining the most recently updated entry, which Pandas sequence is correct?",
                "options": [
                    {"id": "A", "text": "df.sort_values('updated_at', ascending=False).drop_duplicates(subset=['email'], keep='first')"},
                    {"id": "B", "text": "df.drop_duplicates(subset=['email'], keep='last') without sorting"},
                    {"id": "C", "text": "df.groupby('email').first()"},
                    {"id": "D", "text": "df.dropna(subset=['email'])"}
                ],
                "correctAnswer": "A",
                "explanation": "Sorting descending by timestamp ensures that the first record encountered for each email key is the most recent.",
                "prerequisite_concept": "Deduplication with Ordering Invariants"
            },

            # --- DESCRIPTIVE STATISTICS (5 Qs) ---
            {
                "id": f"{p_id}_stat_1",
                "competency": "Descriptive Statistics",
                "category": "Statistics",
                "difficulty": "Beginner",
                "points": 4,
                "question": "In a right-skewed (positively skewed) income distribution, what is the typical mathematical relationship between Mean and Median?",
                "options": [
                    {"id": "A", "text": "Mean > Median"},
                    {"id": "B", "text": "Mean < Median"},
                    {"id": "C", "text": "Mean = Median"},
                    {"id": "D", "text": "Mean = 0"}
                ],
                "correctAnswer": "A",
                "explanation": "Large positive values pull the arithmetic mean to the right, while the median remains anchored at the 50th percentile.",
                "prerequisite_concept": "Skewness & Central Tendency"
            },
            {
                "id": f"{p_id}_stat_2",
                "competency": "Descriptive Statistics",
                "category": "Statistics",
                "difficulty": "Intermediate",
                "points": 4,
                "question": "According to the Empirical Rule (68-95-99.7), approximately what percentage of values in a normal distribution fall within ±2 standard deviations of the mean?",
                "options": [
                    {"id": "A", "text": "95.4%"},
                    {"id": "B", "text": "68.2%"},
                    {"id": "C", "text": "99.7%"},
                    {"id": "D", "text": "50.0%"}
                ],
                "correctAnswer": "A",
                "explanation": "±1σ contains ~68.2%, ±2σ contains ~95.4%, and ±3σ contains ~99.7% of all observations in a Gaussian distribution.",
                "prerequisite_concept": "Empirical Rule (68-95-99.7)"
            },
            {
                "id": f"{p_id}_stat_3",
                "competency": "Descriptive Statistics",
                "category": "Statistics",
                "difficulty": "Intermediate",
                "points": 4,
                "question": "How does John Tukey's Box Plot formula define an upper outlier boundary?",
                "options": [
                    {"id": "A", "text": "Q3 + 1.5 × IQR (where IQR = Q3 - Q1)"},
                    {"id": "B", "text": "Mean + 2 × Standard Deviation"},
                    {"id": "C", "text": "Median + 1.5 × Variance"},
                    {"id": "D", "text": "Q3 + 3.0 × Mean"}
                ],
                "correctAnswer": "A",
                "explanation": "Any point beyond Q3 + 1.5 × IQR is visually designated as a potential outlier whisker boundary.",
                "prerequisite_concept": "Interquartile Range (IQR) Outlier Formula"
            },
            {
                "id": f"{p_id}_stat_4",
                "competency": "Descriptive Statistics",
                "category": "Statistics",
                "difficulty": "Advanced",
                "points": 4,
                "question": "In hypothesis testing, what is a Type I error?",
                "options": [
                    {"id": "A", "text": "Rejecting a true null hypothesis (False Positive)"},
                    {"id": "B", "text": "Failing to reject a false null hypothesis (False Negative)"},
                    {"id": "C", "text": "Choosing the wrong sample size"},
                    {"id": "D", "text": "Violating data normality assumptions"}
                ],
                "correctAnswer": "A",
                "explanation": "A Type I error occurs when researchers reject the null hypothesis even though the null hypothesis is true in reality.",
                "prerequisite_concept": "Type I & Type II Errors"
            },
            {
                "id": f"{p_id}_stat_5",
                "competency": "Descriptive Statistics",
                "category": "Statistics",
                "difficulty": "Advanced",
                "points": 4,
                "question": "What is the proper interpretation of a p-value = 0.03 in a two-tailed test with alpha = 0.05?",
                "options": [
                    {"id": "A", "text": "Assuming the null hypothesis is true, there is a 3% probability of observing results as extreme as these. Reject the null."},
                    {"id": "B", "text": "There is a 97% probability that the research hypothesis is completely false."},
                    {"id": "C", "text": "The effect size is exactly 3% above normal."},
                    {"id": "D", "text": "Accept the null hypothesis because 0.03 is less than 0.05."}
                ],
                "correctAnswer": "A",
                "explanation": "Because p (0.03) < alpha (0.05), the observed data is statistically unlikely under the null hypothesis, warranting rejection of H0.",
                "prerequisite_concept": "p-value Interpretation & Alpha Thresholds"
            }
        ]
        return questions

    pools["pool_01"] = generate_pool_questions("p1")
    pools["pool_02"] = generate_pool_questions("p2")
    pools["pool_03"] = generate_pool_questions("p3")
    pools["pool_04"] = generate_pool_questions("p4")
    pools["pool_05"] = generate_pool_questions("p5")
    return pools


ALL_INTERNAL_POOLS = _make_pools()


def generate_role_diagnostic_attempt(user_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Selects an internal pool, randomizes order & options, strips answer key,
    and sets 25-minute expiration timestamps.
    """
    pool_keys = list(ALL_INTERNAL_POOLS.keys())
    chosen_pool_key = random.choice(pool_keys)
    base_questions = ALL_INTERNAL_POOLS[chosen_pool_key]

    # Shuffle question order
    selected = list(base_questions)
    random.shuffle(selected)

    now = int(time.time())
    expires_at = now + (25 * 60)  # exactly 25 minutes
    attempt_id = f"diag_{uuid.uuid4().hex[:10]}"

    # Strip answers for exam security
    safe_questions = []
    for idx, q in enumerate(selected):
        opts = list(q["options"])
        random.shuffle(opts)
        safe_questions.append({
            "id": q["id"],
            "index": idx + 1,
            "competency": q["competency"],
            "category": q["category"],
            "difficulty": q["difficulty"],
            "points": q["points"],
            "question": q["question"],
            "options": opts,
            "prerequisite_concept": q["prerequisite_concept"]
        })

    return {
        "id": attempt_id,
        "title": "Data Analyst Role Diagnostic",
        "description": "Timed technical assessment covering SQL, Python, Pandas, and Descriptive Statistics.",
        "target_role": "Data Analyst",
        "skills_covered": SKILLS,
        "time_limit_minutes": 25,
        "total_points": 100,
        "points_per_question": 4,
        "passing_percentage": 80,
        "passing_score": 80,
        "questions_count": 25,
        "questions": safe_questions,
        "assessmentStartedAt": now,
        "assessmentExpiresAt": expires_at
    }


def evaluate_diagnostic_submission(answers: Dict[str, str]) -> Dict[str, Any]:
    """
    Authoritative evaluation against master pool key.
    Calculates 80% threshold: >= 20 correct -> QUALIFIED.
    """
    all_q_map = {}
    for pool in ALL_INTERNAL_POOLS.values():
        for q in pool:
            all_q_map[q["id"]] = q

    total_questions = 25
    points_per_question = 4
    total_points = 100
    correct_count = 0
    question_results = []
    competency_breakdown: Dict[str, Dict[str, int]] = {s: {"correct": 0, "total": 0} for s in SKILLS}

    for q_id, user_ans in answers.items():
        q = all_q_map.get(q_id)
        if not q:
            continue
        comp = q["competency"]
        if comp not in competency_breakdown:
            competency_breakdown[comp] = {"correct": 0, "total": 0}
        competency_breakdown[comp]["total"] += 1

        is_corr = (user_ans or "").strip().upper() == q["correctAnswer"].strip().upper()
        if is_corr:
            correct_count += 1
            competency_breakdown[comp]["correct"] += 1

        question_results.append({
            "question_id": q_id,
            "competency": comp,
            "user_answer": user_ans,
            "correct_answer": q["correctAnswer"],
            "is_correct": is_corr,
            "explanation": q["explanation"],
            "earned_points": points_per_question if is_corr else 0,
            "max_points": points_per_question
        })

    overall_score = round((correct_count / total_questions) * 100)
    is_qualified = overall_score >= 80

    weaknesses = []
    for comp, stats in competency_breakdown.items():
        if stats["total"] > 0:
            pct = (stats["correct"] / stats["total"]) * 100
            if pct < 80:
                weaknesses.append(comp)

    return {
        "overall_score": overall_score,
        "total_points": total_points,
        "earned_points": correct_count * points_per_question,
        "correct_count": correct_count,
        "total_questions": total_questions,
        "passing_score": 80,
        "passed": is_qualified,
        "status": "QUALIFIED" if is_qualified else "NOT QUALIFIED",
        "competency_breakdown": competency_breakdown,
        "weaknesses": weaknesses,
        "question_results": question_results
    }
