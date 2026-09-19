import uuid
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from agents.base import BaseAgent


class QuestionOption(BaseModel):
    id: str
    text: str


class AssessmentQuestion(BaseModel):
    id: str
    skill_id: str
    sub_skill_id: str
    type: str  # "mcq", "sql_query", "python_code", "short_answer", "scenario"
    difficulty: str  # "Beginner", "Intermediate", "Advanced"
    question_text: str
    code_snippet: Optional[str] = None
    options: Optional[List[QuestionOption]] = None
    correct_answer: str
    explanation: str
    prerequisite_concept: str
    rubric: Optional[Dict[str, int]] = None  # e.g., {"correctness": 40, "structure": 20}
    weight: int = 10


class Assessment(BaseModel):
    id: str
    title: str
    type: str  # "diagnostic", "checkpoint", "remediation", "applied_project"
    target_role: str
    skills_covered: List[str]
    time_limit_minutes: int
    questions: List[AssessmentQuestion]
    total_points: int


class AssessmentAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Assessment Agent",
            role_description="Generates prerequisite-mapped diagnostic and checkpoint assessments across multiple question modalities."
        )

    def generate_diagnostic(self, target_role: str = "data_analyst", learner_level: str = "Intermediate") -> Assessment:
        """Generate comprehensive diagnostic assessment for the target role."""
        def _execute():
            questions = [
                # Q1: SQL Filtering & Select
                AssessmentQuestion(
                    id="diag_q1",
                    skill_id="sql_fundamentals",
                    sub_skill_id="sql_select_where",
                    type="mcq",
                    difficulty="Beginner",
                    question_text="Which SQL statement correctly extracts all customer records located in either 'London' or 'Paris' who have spent more than 500 in total revenue?",
                    options=[
                        QuestionOption(id="A", text="SELECT * FROM customers WHERE city IN ('London', 'Paris') AND total_spend > 500;"),
                        QuestionOption(id="B", text="SELECT * FROM customers WHERE city = 'London' OR city = 'Paris' AND total_spend > 500;"),
                        QuestionOption(id="C", text="SELECT ALL FROM customers WHERE city = 'London' AND city = 'Paris' HAVING total_spend > 500;"),
                        QuestionOption(id="D", text="SELECT * FROM customers WHERE (city = 'London' AND city = 'Paris') OR total_spend > 500;")
                    ],
                    correct_answer="A",
                    explanation="Option A correctly uses IN with parenthesized values combined with AND precedence to enforce both geographical location and spending criteria.",
                    prerequisite_concept="Boolean Predicate Precedence",
                    weight=10
                ),
                # Q2: SQL JOINs
                AssessmentQuestion(
                    id="diag_q2",
                    skill_id="sql_joins",
                    sub_skill_id="sql_inner_left_join",
                    type="mcq",
                    difficulty="Intermediate",
                    question_text="A sales manager needs a list of all products in inventory and any associated customer orders placed in June. If a product was not ordered at all in June, it must still appear in the output with NULL order values. Which query achieves this?",
                    options=[
                        QuestionOption(id="A", text="SELECT p.product_name, o.order_id FROM products p INNER JOIN orders o ON p.id = o.product_id WHERE o.month = 'June';"),
                        QuestionOption(id="B", text="SELECT p.product_name, o.order_id FROM products p LEFT JOIN orders o ON p.id = o.product_id AND o.month = 'June';"),
                        QuestionOption(id="C", text="SELECT p.product_name, o.order_id FROM products p LEFT JOIN orders o ON p.id = o.product_id WHERE o.month = 'June';"),
                        QuestionOption(id="D", text="SELECT p.product_name, o.order_id FROM orders o RIGHT JOIN products p ON p.id = o.product_id WHERE o.order_id IS NOT NULL;")
                    ],
                    correct_answer="B",
                    explanation="Option B places the date condition in the LEFT JOIN's ON clause. Option C places it in the WHERE clause, which filters out NULLs and accidentally turns the LEFT JOIN into an INNER JOIN.",
                    prerequisite_concept="Outer Join Null Preservation",
                    weight=15
                ),
                # Q3: SQL Aggregation
                AssessmentQuestion(
                    id="diag_q3",
                    skill_id="sql_aggregation",
                    sub_skill_id="sql_groupby_having",
                    type="sql_query",
                    difficulty="Intermediate",
                    question_text="Write a query calculating the average transaction amount and total transaction count per region from the 'sales' table, keeping only regions with more than 50 transactions.",
                    code_snippet="-- Schema: sales(region VARCHAR, amount NUMERIC, transaction_id INT)",
                    correct_answer="SELECT region, AVG(amount) AS avg_amount, COUNT(transaction_id) AS total_count FROM sales GROUP BY region HAVING COUNT(transaction_id) > 50;",
                    explanation="Requires GROUP BY region, aggregate functions AVG and COUNT, and a HAVING filter because aggregate conditions cannot be evaluated in WHERE.",
                    prerequisite_concept="GROUP BY & HAVING Clauses",
                    rubric={
                        "correctness": 40,
                        "group_by_logic": 30,
                        "having_syntax": 20,
                        "alias_naming": 10
                    },
                    weight=20
                ),
                # Q4: Python Fundamentals
                AssessmentQuestion(
                    id="diag_q4",
                    skill_id="python_fundamentals",
                    sub_skill_id="python_data_structures",
                    type="mcq",
                    difficulty="Beginner",
                    question_text="Consider the Python list: `data = [12, 45, 23, 67, 89, 34]`. Which list comprehension produces a new list containing only the squared values of odd numbers?",
                    options=[
                        QuestionOption(id="A", text="[x**2 for x in data if x % 2 == 1]"),
                        QuestionOption(id="B", text="[x*2 for x in data where x % 2 != 0]"),
                        QuestionOption(id="C", text="[if x % 2 == 1: x**2 for x in data]"),
                        QuestionOption(id="D", text="[x**2 for x in data if x % 2 == 0]")
                    ],
                    correct_answer="A",
                    explanation="`[x**2 for x in data if x % 2 == 1]` iterates through `data`, evaluates whether `x % 2 == 1` (odd check), and computes the exponent `x**2`.",
                    prerequisite_concept="List Comprehensions & Modulo",
                    weight=10
                ),
                # Q5: Pandas Data Manipulation
                AssessmentQuestion(
                    id="diag_q5",
                    skill_id="pandas_data_manipulation",
                    sub_skill_id="pandas_indexing_filtering",
                    type="mcq",
                    difficulty="Intermediate",
                    question_text="In Pandas, given DataFrame `df` with columns ['department', 'salary', 'experience'], how do you select the 'salary' and 'experience' columns for employees in the 'Engineering' department without causing chained assignment issues?",
                    options=[
                        QuestionOption(id="A", text="df.loc[df['department'] == 'Engineering', ['salary', 'experience']]"),
                        QuestionOption(id="B", text="df[df['department'] == 'Engineering']['salary', 'experience']"),
                        QuestionOption(id="C", text="df.iloc[df['department'] == 'Engineering', [1, 2]]"),
                        QuestionOption(id="D", text="df.select('salary', 'experience').where(department='Engineering')")
                    ],
                    correct_answer="A",
                    explanation="`.loc[condition, [columns]]` uses label-based multi-axis slicing in a single call, preventing SettingWithCopy warnings.",
                    prerequisite_concept="DataFrame .loc Selection",
                    weight=15
                ),
                # Q6: Pandas Data Cleaning (Crucial checkpoint question)
                AssessmentQuestion(
                    id="diag_q6",
                    skill_id="pandas_data_cleaning",
                    sub_skill_id="missing_value_handling",
                    type="python_code",
                    difficulty="Intermediate",
                    question_text="A DataFrame `orders` has a numeric column 'shipping_cost' with 15% missing values (NaN) and heavy right-skewed outliers. Write the code to fill the missing values in 'shipping_cost' with the robust median of the non-missing values.",
                    code_snippet="# df is 'orders'\n# Impute missing values in orders['shipping_cost'] with column median",
                    correct_answer="orders['shipping_cost'] = orders['shipping_cost'].fillna(orders['shipping_cost'].median())",
                    explanation="Median imputation via `.fillna(orders['shipping_cost'].median())` is resistant to outliers in right-skewed data. Using mean would be heavily skewed.",
                    prerequisite_concept="Missing Value Imputation Strategy",
                    rubric={
                        "correctness": 40,
                        "median_selection": 30,
                        "assignment_or_inplace": 20,
                        "syntax_purity": 10
                    },
                    weight=15
                ),
                # Q7: Descriptive Statistics
                AssessmentQuestion(
                    id="diag_q7",
                    skill_id="descriptive_statistics",
                    sub_skill_id="central_tendency_variance",
                    type="scenario",
                    difficulty="Intermediate",
                    question_text="An e-commerce company's average order value is $145, but the median order value is $32. What does this distribution indicate, and which metric should the marketing team use to evaluate typical customer behavior?",
                    options=[
                        QuestionOption(id="A", text="The distribution is right-skewed with high-value outlier purchases; the team should use the median ($32) as the measure of typical behavior."),
                        QuestionOption(id="B", text="The distribution is normally distributed; the team should use the mean ($145) because it contains all transaction data."),
                        QuestionOption(id="C", text="The distribution is left-skewed with a few very small negative returns; the team should report standard deviation."),
                        QuestionOption(id="D", text="There is a calculation error because mean and median must match in business analytics.")
                    ],
                    correct_answer="A",
                    explanation="When the mean ($145) is significantly higher than the median ($32), the distribution is positively (right) skewed by extreme high-value purchases. The median is resistant to outliers and accurately represents the central tendency of typical customers.",
                    prerequisite_concept="Skewness & Central Tendency",
                    weight=15
                )
            ]

            total_pts = sum(q.weight for q in questions)
            return Assessment(
                id=f"diag_da_{uuid.uuid4().hex[:8]}",
                title="Data Analyst Role Diagnostic",
                type="diagnostic",
                target_role=target_role,
                skills_covered=[
                    "sql_fundamentals", "sql_joins", "sql_aggregation",
                    "python_fundamentals", "pandas_data_manipulation",
                    "pandas_data_cleaning", "descriptive_statistics"
                ],
                time_limit_minutes=25,
                questions=questions,
                total_points=total_pts
            )

        return self.execute_with_audit(
            action_name="generate_diagnostic_assessment",
            input_summary=f"Role: {target_role}, Level: {learner_level}",
            func=_execute
        )

    def generate_checkpoint(self, skill_id: str, node_title: str) -> Assessment:
        """Generate targeted checkpoint or remediation assessment for a specific roadmap node."""
        def _execute():
            if skill_id == "missing_value_handling" or "cleaning" in skill_id or "missing" in skill_id:
                questions = [
                    AssessmentQuestion(
                        id="chk_clean_01",
                        skill_id="pandas_data_cleaning",
                        sub_skill_id="missing_value_handling",
                        type="mcq",
                        difficulty="Intermediate",
                        question_text="Which Pandas method evaluates every element in DataFrame `df` and returns a boolean DataFrame highlighting missing cells?",
                        options=[
                            QuestionOption(id="A", text="df.isna() or df.isnull()"),
                            QuestionOption(id="B", text="df.dropna()"),
                            QuestionOption(id="C", text="df.has_missing()"),
                            QuestionOption(id="D", text="df.filter_nulls()")
                        ],
                        correct_answer="A",
                        explanation="Both `.isna()` and `.isnull()` return element-wise boolean masks.",
                        prerequisite_concept="Missing Mask Detection",
                        weight=25
                    ),
                    AssessmentQuestion(
                        id="chk_clean_02",
                        skill_id="pandas_data_cleaning",
                        sub_skill_id="missing_value_handling",
                        type="python_code",
                        difficulty="Intermediate",
                        question_text="Fill all NaN values in DataFrame `df` column 'stock_qty' using forward-fill (propagating the last valid value forward).",
                        code_snippet="df['stock_qty'] = ...",
                        correct_answer="df['stock_qty'] = df['stock_qty'].ffill()",
                        explanation="`df['stock_qty'].ffill()` propagates the previous valid observation.",
                        prerequisite_concept="Forward Fill Imputation",
                        rubric={"correctness": 50, "syntax": 50},
                        weight=35
                    ),
                    AssessmentQuestion(
                        id="chk_clean_03",
                        skill_id="pandas_data_cleaning",
                        sub_skill_id="outlier_type_cleaning",
                        type="mcq",
                        difficulty="Intermediate",
                        question_text="When should `df.dropna(how='all')` be chosen over `df.dropna(how='any')`?",
                        options=[
                            QuestionOption(id="A", text="When you only want to delete rows where every single column is null/empty."),
                            QuestionOption(id="B", text="When you want to drop rows that have at least one missing column value."),
                            QuestionOption(id="C", text="When you are dropping entire columns rather than rows."),
                            QuestionOption(id="D", text="There is no difference in Pandas.")
                        ],
                        correct_answer="A",
                        explanation="`how='all'` drops records only if all attributes are NaN, protecting partially populated records.",
                        prerequisite_concept="Dropna Strategies",
                        weight=40
                    )
                ]
            else:
                # Default targeted questions
                questions = [
                    AssessmentQuestion(
                        id="chk_gen_01",
                        skill_id=skill_id,
                        sub_skill_id=f"{skill_id}_core",
                        type="mcq",
                        difficulty="Intermediate",
                        question_text=f"Which core practice is essential when implementing {node_title}?",
                        options=[
                            QuestionOption(id="A", text=f"Verify inputs, isolate edge cases, and validate performance."),
                            QuestionOption(id="B", text="Bypass validation checks to maximize throughput."),
                            QuestionOption(id="C", text="Hard-code environment variables."),
                            QuestionOption(id="D", text="Disregard data typing.")
                        ],
                        correct_answer="A",
                        explanation=f"Validating inputs and handling boundary conditions is standard for {node_title}.",
                        prerequisite_concept="Data Validation",
                        weight=50
                    ),
                    AssessmentQuestion(
                        id="chk_gen_02",
                        skill_id=skill_id,
                        sub_skill_id=f"{skill_id}_applied",
                        type="mcq",
                        difficulty="Intermediate",
                        question_text=f"What is the primary indicator of successful execution in {node_title}?",
                        options=[
                            QuestionOption(id="A", text="Deterministic outputs that match verified business invariants."),
                            QuestionOption(id="B", text="Zero log outputs."),
                            QuestionOption(id="C", text="Randomized return values."),
                            QuestionOption(id="D", text="Execution without schema definition.")
                        ],
                        correct_answer="A",
                        explanation="Deterministic invariants prove competency.",
                        prerequisite_concept="Determinism & Integrity",
                        weight=50
                    )
                ]

            return Assessment(
                id=f"chk_{skill_id}_{uuid.uuid4().hex[:6]}",
                title=f"Checkpoint: {node_title}",
                type="checkpoint",
                target_role="data_analyst",
                skills_covered=[skill_id],
                time_limit_minutes=15,
                questions=questions,
                total_points=sum(q.weight for q in questions)
            )

        return self.execute_with_audit(
            action_name="generate_checkpoint_assessment",
            input_summary=f"Skill: {skill_id}, Title: {node_title}",
            func=_execute
        )
