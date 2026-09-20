/**
 * Client-side assessment pools and generation utilities for Data Analyst Role Diagnostic.
 * Exactly 25 questions, 25 minutes, 100 points, 80% qualification threshold.
 */

export interface DiagnosticOption {
  id: string;
  text: string;
}

export interface DiagnosticQuestion {
  id: string;
  index: number;
  competency: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  points: number;
  question: string;
  options: DiagnosticOption[];
  correctAnswer?: string;
  explanation?: string;
  prerequisite_concept: string;
}

export interface DiagnosticAttempt {
  id: string;
  title: string;
  description: string;
  target_role: string;
  skills_covered: string[];
  time_limit_minutes: number;
  total_points: number;
  points_per_question: number;
  passing_percentage: number;
  passing_score: number;
  questions_count: number;
  questions: DiagnosticQuestion[];
  assessmentStartedAt: number;
  assessmentExpiresAt: number;
}

export interface DiagnosticEvaluation {
  overall_score: number;
  total_points: number;
  earned_points: number;
  correct_count: number;
  total_questions: number;
  passing_score: number;
  passed: boolean;
  status: "QUALIFIED" | "NOT QUALIFIED";
  competency_breakdown: Record<string, { correct: number; total: number }>;
  weaknesses: string[];
  certificate_id?: string;
  question_results: Array<{
    question_id: string;
    competency: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation: string;
    earned_points: number;
    max_points: number;
  }>;
}

export const DIAGNOSTIC_SKILLS = [
  "SQL Fundamentals",
  "SQL Joins & Relational Sets",
  "SQL Aggregation & Grouping",
  "Python Programming",
  "Pandas Data Manipulation",
  "Pandas Data Cleaning & Imputation",
  "Descriptive Statistics"
];

// Pool question factory
function createPoolQuestions(pId: string): Omit<DiagnosticQuestion, "index">[] {
  return [
    // 1. SQL Fundamentals
    {
      id: `${pId}_sql_1`,
      competency: "SQL Fundamentals",
      category: "SQL",
      difficulty: "Beginner",
      points: 4,
      question: "Which SQL clause evaluates row-level conditions before any grouping or aggregation takes place?",
      options: [
        { id: "A", text: "WHERE" },
        { id: "B", text: "HAVING" },
        { id: "C", text: "ORDER BY" },
        { id: "D", text: "GROUP BY" }
      ],
      correctAnswer: "A",
      explanation: "WHERE filters raw individual table records before GROUP BY aggregation occurs.",
      prerequisite_concept: "Logical Query Processing"
    },
    {
      id: `${pId}_sql_2`,
      competency: "SQL Fundamentals",
      category: "SQL",
      difficulty: "Beginner",
      points: 4,
      question: "Which operator matches a string pattern containing zero or more wildcard characters in SQL?",
      options: [
        { id: "A", text: "LIKE with %" },
        { id: "B", text: "MATCH with *" },
        { id: "C", text: "IN with []" },
        { id: "D", text: "BETWEEN with _" }
      ],
      correctAnswer: "A",
      explanation: "LIKE with '%' matches any sequence of zero or more characters.",
      prerequisite_concept: "String Pattern Matching"
    },
    {
      id: `${pId}_sql_3`,
      competency: "SQL Fundamentals",
      category: "SQL",
      difficulty: "Intermediate",
      points: 4,
      question: "What is the evaluated result of 'SELECT NULL = NULL;' in standard SQL?",
      options: [
        { id: "A", text: "UNKNOWN (evaluates to falsy in WHERE clauses)" },
        { id: "B", text: "TRUE" },
        { id: "C", text: "FALSE" },
        { id: "D", text: "Syntax Error" }
      ],
      correctAnswer: "A",
      explanation: "In three-valued logic, NULL represents an unknown value; two unknowns cannot be asserted as equal.",
      prerequisite_concept: "Three-Valued Logic & NULLs"
    },
    {
      id: `${pId}_sql_4`,
      competency: "SQL Fundamentals",
      category: "SQL",
      difficulty: "Intermediate",
      points: 4,
      question: "Which statement best describes the difference between UNION and UNION ALL?",
      options: [
        { id: "A", text: "UNION deduplicates records by sorting; UNION ALL directly concatenates without deduplication." },
        { id: "B", text: "UNION preserves duplicates; UNION ALL removes them." },
        { id: "C", text: "UNION works only on identical tables; UNION ALL operates on different schemas." },
        { id: "D", text: "UNION ALL is slower because it requires distinct hashing." }
      ],
      correctAnswer: "A",
      explanation: "UNION performs a distinct sort operation to remove duplicates; UNION ALL directly appends rows without sorting.",
      prerequisite_concept: "Set Operations"
    },

    // 2. SQL Joins & Relational Sets
    {
      id: `${pId}_join_1`,
      competency: "SQL Joins & Relational Sets",
      category: "SQL",
      difficulty: "Beginner",
      points: 4,
      question: "A query executes 'orders LEFT JOIN customers ON orders.customer_id = customers.id'. If an order references a customer not in the customers table, what is returned?",
      options: [
        { id: "A", text: "The order row is retained with NULL customer values." },
        { id: "B", text: "The order row is dropped from the result set." },
        { id: "C", text: "A foreign key constraint exception is thrown." },
        { id: "D", text: "The query defaults to the first customer in the table." }
      ],
      correctAnswer: "A",
      explanation: "LEFT JOIN preserves every record from the left relation. Unmatched right relation attributes populate as NULL.",
      prerequisite_concept: "Outer Join Mechanics"
    },
    {
      id: `${pId}_join_2`,
      competency: "SQL Joins & Relational Sets",
      category: "SQL",
      difficulty: "Intermediate",
      points: 4,
      question: "Which pattern correctly constructs an anti-join to isolate all products that have never been purchased?",
      options: [
        { id: "A", text: "products p LEFT JOIN order_items oi ON p.id = oi.product_id WHERE oi.product_id IS NULL" },
        { id: "B", text: "products p INNER JOIN order_items oi ON p.id = oi.product_id WHERE oi.quantity = 0" },
        { id: "C", text: "products p FULL JOIN order_items oi ON p.id = oi.product_id WHERE p.id IS NOT NULL" },
        { id: "D", text: "products p RIGHT JOIN order_items oi ON p.id = oi.product_id WHERE oi.product_id IS NOT NULL" }
      ],
      correctAnswer: "A",
      explanation: "LEFT JOIN combined with WHERE right_key IS NULL filters out all records that had matching children.",
      prerequisite_concept: "Anti-Join Pattern"
    },
    {
      id: `${pId}_join_3`,
      competency: "SQL Joins & Relational Sets",
      category: "SQL",
      difficulty: "Intermediate",
      points: 4,
      question: "If Table A has 5 rows (all with join_key = 1) and Table B has 4 rows (all with join_key = 1), how many rows result from an INNER JOIN?",
      options: [
        { id: "A", text: "20 rows (Cartesian product of the matching join key)" },
        { id: "B", text: "5 rows" },
        { id: "C", text: "9 rows" },
        { id: "D", text: "4 rows" }
      ],
      correctAnswer: "A",
      explanation: "Each row in Table A matches all 4 rows in Table B, generating 5 × 4 = 20 rows.",
      prerequisite_concept: "Cartesian Fan-Out"
    },
    {
      id: `${pId}_join_4`,
      competency: "SQL Joins & Relational Sets",
      category: "SQL",
      difficulty: "Advanced",
      points: 4,
      question: "In a SELF JOIN comparing an employee to their supervisor (e.manager_id = m.employee_id), who is excluded if an INNER JOIN is used?",
      options: [
        { id: "A", text: "The CEO or top executive whose manager_id is NULL" },
        { id: "B", text: "Individual contributors with no direct reports" },
        { id: "C", text: "Employees who earn less than their manager" },
        { id: "D", text: "Contractors with temporary employee IDs" }
      ],
      correctAnswer: "A",
      explanation: "The CEO has NULL in manager_id; because NULL cannot match any key in an INNER JOIN, the top executive is omitted.",
      prerequisite_concept: "Hierarchical Self Joins"
    },

    // 3. SQL Aggregation & Grouping
    {
      id: `${pId}_agg_1`,
      competency: "SQL Aggregation & Grouping",
      category: "SQL",
      difficulty: "Beginner",
      points: 4,
      question: "Why does 'SELECT department, employee_name, AVG(salary) FROM employees GROUP BY department;' fail in standard SQL?",
      options: [
        { id: "A", text: "employee_name is neither aggregated nor included in the GROUP BY clause." },
        { id: "B", text: "AVG() cannot be calculated on the salary column." },
        { id: "C", text: "GROUP BY must always be followed by HAVING." },
        { id: "D", text: "department cannot be in both SELECT and GROUP BY." }
      ],
      correctAnswer: "A",
      explanation: "Non-aggregated columns in SELECT must be explicitly listed in GROUP BY to ensure deterministic 1-to-1 mapping.",
      prerequisite_concept: "Group By Collation Rules"
    },
    {
      id: `${pId}_agg_2`,
      competency: "SQL Aggregation & Grouping",
      category: "SQL",
      difficulty: "Intermediate",
      points: 4,
      question: "Which ranking function assigns consecutive integer ranks without skipping numbers when values tie?",
      options: [
        { id: "A", text: "DENSE_RANK()" },
        { id: "B", text: "RANK()" },
        { id: "C", text: "ROW_NUMBER()" },
        { id: "D", text: "NTILE()" }
      ],
      correctAnswer: "A",
      explanation: "DENSE_RANK() gives identical numbers to ties (e.g. 1, 1) and assigns the next distinct number immediately after (e.g. 2).",
      prerequisite_concept: "Window Function Ranking"
    },
    {
      id: `${pId}_agg_3`,
      competency: "SQL Aggregation & Grouping",
      category: "SQL",
      difficulty: "Intermediate",
      points: 4,
      question: "To compute a 7-day rolling moving average of revenue ordered chronologically by date, which window frame is correct?",
      options: [
        { id: "A", text: "AVG(revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)" },
        { id: "B", text: "AVG(revenue) OVER (PARTITION BY date ROWS 7)" },
        { id: "C", text: "ROLLING_AVG(revenue, 7) OVER (ORDER BY date)" },
        { id: "D", text: "AVG(revenue) OVER (ORDER BY date ROWS BETWEEN 7 PRECEDING AND 1 FOLLOWING)" }
      ],
      correctAnswer: "A",
      explanation: "6 preceding rows plus the current row equals exactly 7 consecutive chronological observations.",
      prerequisite_concept: "Window Frames & Moving Averages"
    },
    {
      id: `${pId}_agg_4`,
      competency: "SQL Aggregation & Grouping",
      category: "SQL",
      difficulty: "Advanced",
      points: 4,
      question: "What is the primary architectural advantage of Common Table Expressions (CTEs) over deeply nested subqueries?",
      options: [
        { id: "A", text: "Readability, modular linear execution logic, and recursive capability" },
        { id: "B", text: "Automatic physical indexing on disk" },
        { id: "C", text: "Bypassing database permission checks" },
        { id: "D", text: "Guaranteeing parallel multi-server execution" }
      ],
      correctAnswer: "A",
      explanation: "CTEs structure complex multi-stage transformations cleanly from top to bottom, avoiding convoluted nested parentheses.",
      prerequisite_concept: "Modular SQL & CTEs"
    },

    // 4. Python Programming
    {
      id: `${pId}_py_1`,
      competency: "Python Programming",
      category: "Python",
      difficulty: "Beginner",
      points: 4,
      question: "In Python, which built-in data structure is immutable and commonly used for fixed coordinate pairs or dictionary keys?",
      options: [
        { id: "A", text: "Tuple" },
        { id: "B", text: "List" },
        { id: "C", text: "Dictionary" },
        { id: "D", text: "Set" }
      ],
      correctAnswer: "A",
      explanation: "Tuples are immutable sequences in Python; their elements cannot be modified after creation.",
      prerequisite_concept: "Python Data Structures"
    },
    {
      id: `${pId}_py_2`,
      competency: "Python Programming",
      category: "Python",
      difficulty: "Intermediate",
      points: 4,
      question: "What does the list comprehension '[x**2 for x in data if x > 0]' accomplish?",
      options: [
        { id: "A", text: "Filters data for positive numbers and returns their squares in a concise list" },
        { id: "B", text: "Multiplies positive numbers by 2 in-place" },
        { id: "C", text: "Returns a generator object without evaluating items" },
        { id: "D", text: "Raises an error if data contains negative integers" }
      ],
      correctAnswer: "A",
      explanation: "List comprehensions combine functional mapping (`x**2`) and filtering (`if x > 0`) in idiomatic Python.",
      prerequisite_concept: "List Comprehensions & Functional Mapping"
    },

    // 5. Pandas Data Manipulation
    {
      id: `${pId}_pd_1`,
      competency: "Pandas Data Manipulation",
      category: "Pandas",
      difficulty: "Beginner",
      points: 4,
      question: "Which Pandas method isolates rows based on boolean conditional labels rather than integer index positions?",
      options: [
        { id: "A", text: ".loc[]" },
        { id: "B", text: ".iloc[]" },
        { id: "C", text: ".ix[]" },
        { id: "D", text: ".iat[]" }
      ],
      correctAnswer: "A",
      explanation: ".loc[] is label-based and condition-based; .iloc[] is strictly integer position-based.",
      prerequisite_concept: "Pandas Indexing & Slicing"
    },
    {
      id: `${pId}_pd_2`,
      competency: "Pandas Data Manipulation",
      category: "Pandas",
      difficulty: "Intermediate",
      points: 4,
      question: "To combine customer demographic DataFrame with transaction DataFrame preserving all customers, which syntax is correct?",
      options: [
        { id: "A", text: "pd.merge(customers, transactions, on='customer_id', how='left')" },
        { id: "B", text: "pd.concat([customers, transactions], axis=1)" },
        { id: "C", text: "customers.join(transactions, how='inner')" },
        { id: "D", text: "pd.append(customers, transactions)" }
      ],
      correctAnswer: "A",
      explanation: "pd.merge with how='left' performs a relational left join on the specified foreign key.",
      prerequisite_concept: "Pandas Relational Merging"
    },
    {
      id: `${pId}_pd_3`,
      competency: "Pandas Data Manipulation",
      category: "Pandas",
      difficulty: "Advanced",
      points: 4,
      question: "What is the purpose of `.reset_index()` after performing a `.groupby()` aggregation in Pandas?",
      options: [
        { id: "A", text: "It converts grouped hierarchical index keys back into standard tabular columns." },
        { id: "B", text: "It drops all duplicate rows from the resulting DataFrame." },
        { id: "C", text: "It clears cached memory allocated by NumPy." },
        { id: "D", text: "It sorts the DataFrame chronologically." }
      ],
      correctAnswer: "A",
      explanation: "GroupBy sets grouping keys as the index; .reset_index() flattens them back into columns for standard tabular analysis.",
      prerequisite_concept: "Hierarchical MultiIndex Flattening"
    },

    // 6. Pandas Data Cleaning & Imputation
    {
      id: `${pId}_clean_1`,
      competency: "Pandas Data Cleaning & Imputation",
      category: "Pandas",
      difficulty: "Beginner",
      points: 4,
      question: "Which Pandas method is used to count the total missing values across each column in a DataFrame?",
      options: [
        { id: "A", text: "df.isna().sum()" },
        { id: "B", text: "df.count_nulls()" },
        { id: "C", text: "df.missing().total()" },
        { id: "D", text: "df.drop_na().length()" }
      ],
      correctAnswer: "A",
      explanation: "df.isna() generates a boolean mask where True=1; summing across columns counts missing values.",
      prerequisite_concept: "Missing Value Auditing"
    },
    {
      id: `${pId}_clean_2`,
      competency: "Pandas Data Cleaning & Imputation",
      category: "Pandas",
      difficulty: "Intermediate",
      points: 4,
      question: "When imputing missing continuous numerical data containing extreme right-skewed outliers, which imputation strategy avoids skewing distribution center?",
      options: [
        { id: "A", text: "df['val'] = df['val'].fillna(df['val'].median())" },
        { id: "B", text: "df['val'] = df['val'].fillna(df['val'].mean())" },
        { id: "C", text: "df['val'] = df['val'].fillna(0)" },
        { id: "D", text: "df['val'] = df['val'].fillna(df['val'].mode()[0])" }
      ],
      correctAnswer: "A",
      explanation: "Median is robust against extreme outliers; mean would artificially shift imputed values upward.",
      prerequisite_concept: "Robust Imputation Strategy"
    },
    {
      id: `${pId}_clean_3`,
      competency: "Pandas Data Cleaning & Imputation",
      category: "Pandas",
      difficulty: "Intermediate",
      points: 4,
      question: "To deduplicate customer records while retaining the most recently updated entry, which Pandas sequence is correct?",
      options: [
        { id: "A", text: "df.sort_values('updated_at', ascending=False).drop_duplicates(subset=['email'], keep='first')" },
        { id: "B", text: "df.drop_duplicates(subset=['email'], keep='last') without sorting" },
        { id: "C", text: "df.groupby('email').first()" },
        { id: "D", text: "df.dropna(subset=['email'])" }
      ],
      correctAnswer: "A",
      explanation: "Sorting descending by timestamp ensures that the first record encountered for each email key is the most recent.",
      prerequisite_concept: "Deduplication with Ordering Invariants"
    },

    // 7. Descriptive Statistics
    {
      id: `${pId}_stat_1`,
      competency: "Descriptive Statistics",
      category: "Statistics",
      difficulty: "Beginner",
      points: 4,
      question: "In a right-skewed (positively skewed) income distribution, what is the typical mathematical relationship between Mean and Median?",
      options: [
        { id: "A", text: "Mean > Median" },
        { id: "B", text: "Mean < Median" },
        { id: "C", text: "Mean = Median" },
        { id: "D", text: "Mean = 0" }
      ],
      correctAnswer: "A",
      explanation: "Large positive values pull the arithmetic mean to the right, while the median remains anchored at the 50th percentile.",
      prerequisite_concept: "Skewness & Central Tendency"
    },
    {
      id: `${pId}_stat_2`,
      competency: "Descriptive Statistics",
      category: "Statistics",
      difficulty: "Intermediate",
      points: 4,
      question: "According to the Empirical Rule (68-95-99.7), approximately what percentage of values in a normal distribution fall within ±2 standard deviations of the mean?",
      options: [
        { id: "A", text: "95.4%" },
        { id: "B", text: "68.2%" },
        { id: "C", text: "99.7%" },
        { id: "D", text: "50.0%" }
      ],
      correctAnswer: "A",
      explanation: "±1σ contains ~68.2%, ±2σ contains ~95.4%, and ±3σ contains ~99.7% of all observations in a Gaussian distribution.",
      prerequisite_concept: "Empirical Rule (68-95-99.7)"
    },
    {
      id: `${pId}_stat_3`,
      competency: "Descriptive Statistics",
      category: "Statistics",
      difficulty: "Intermediate",
      points: 4,
      question: "How does John Tukey's Box Plot formula define an upper outlier boundary?",
      options: [
        { id: "A", text: "Q3 + 1.5 × IQR (where IQR = Q3 - Q1)" },
        { id: "B", text: "Mean + 2 × Standard Deviation" },
        { id: "C", text: "Median + 1.5 × Variance" },
        { id: "D", text: "Q3 + 3.0 × Mean" }
      ],
      correctAnswer: "A",
      explanation: "Any point beyond Q3 + 1.5 × IQR is visually designated as a potential outlier whisker boundary.",
      prerequisite_concept: "Interquartile Range (IQR) Outlier Formula"
    },
    {
      id: `${pId}_stat_4`,
      competency: "Descriptive Statistics",
      category: "Statistics",
      difficulty: "Advanced",
      points: 4,
      question: "In hypothesis testing, what is a Type I error?",
      options: [
        { id: "A", text: "Rejecting a true null hypothesis (False Positive)" },
        { id: "B", text: "Failing to reject a false null hypothesis (False Negative)" },
        { id: "C", text: "Choosing the wrong sample size" },
        { id: "D", text: "Violating data normality assumptions" }
      ],
      correctAnswer: "A",
      explanation: "A Type I error occurs when researchers reject the null hypothesis even though the null hypothesis is true in reality.",
      prerequisite_concept: "Type I & Type II Errors"
    },
    {
      id: `${pId}_stat_5`,
      competency: "Descriptive Statistics",
      category: "Statistics",
      difficulty: "Advanced",
      points: 4,
      question: "What is the proper interpretation of a p-value = 0.03 in a two-tailed test with alpha = 0.05?",
      options: [
        { id: "A", text: "Assuming the null hypothesis is true, there is a 3% probability of observing results as extreme as these. Reject the null." },
        { id: "B", text: "There is a 97% probability that the research hypothesis is completely false." },
        { id: "C", text: "The effect size is exactly 3% above normal." },
        { id: "D", text: "Accept the null hypothesis because 0.03 is less than 0.05." }
      ],
      correctAnswer: "A",
      explanation: "Because p (0.03) < alpha (0.05), the observed data is statistically unlikely under the null hypothesis, warranting rejection of H0.",
      prerequisite_concept: "p-value Interpretation & Alpha Thresholds"
    }
  ];
}

// Five internal question pools
export const INTERNAL_POOLS: Record<string, Omit<DiagnosticQuestion, "index">[]> = {
  pool_01: createPoolQuestions("p1"),
  pool_02: createPoolQuestions("p2"),
  pool_03: createPoolQuestions("p3"),
  pool_04: createPoolQuestions("p4"),
  pool_05: createPoolQuestions("p5")
};

// All master questions mapped for evaluation
export const ALL_QUESTIONS_MAP: Record<string, Omit<DiagnosticQuestion, "index">> = {};
Object.values(INTERNAL_POOLS).forEach((pool) => {
  pool.forEach((q) => {
    ALL_QUESTIONS_MAP[q.id] = q;
  });
});

/**
 * Generates an attempt of exactly 25 questions, randomized order and options.
 * Does NOT expose internal pool name.
 */
export function generateClientDiagnosticAttempt(): DiagnosticAttempt {
  const poolKeys = Object.keys(INTERNAL_POOLS);
  const selectedPoolKey = poolKeys[Math.floor(Math.random() * poolKeys.length)];
  const rawQuestions = [...INTERNAL_POOLS[selectedPoolKey]];

  // Shuffle questions
  for (let i = rawQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rawQuestions[i], rawQuestions[j]] = [rawQuestions[j], rawQuestions[i]];
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 25 * 60; // 25 minutes
  const attemptId = `DA-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const questions: DiagnosticQuestion[] = rawQuestions.map((q, idx) => {
    const shuffledOptions = [...q.options];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }

    return {
      id: q.id,
      index: idx + 1,
      competency: q.competency,
      category: q.category,
      difficulty: q.difficulty,
      points: 4,
      question: q.question,
      options: shuffledOptions,
      prerequisite_concept: q.prerequisite_concept
    };
  });

  return {
    id: attemptId,
    title: "Data Analyst Role Diagnostic",
    description: "Timed technical assessment covering SQL, Python, Pandas, and Descriptive Statistics.",
    target_role: "Data Analyst",
    skills_covered: DIAGNOSTIC_SKILLS,
    time_limit_minutes: 25,
    total_points: 100,
    points_per_question: 4,
    passing_percentage: 80,
    passing_score: 80,
    questions_count: 25,
    questions,
    assessmentStartedAt: now,
    assessmentExpiresAt: expiresAt
  };
}

export function evaluateClientDiagnosticSubmission(
  answers: Record<string, string>,
  attempt?: DiagnosticAttempt
): DiagnosticEvaluation {
  const dummyAttempt: DiagnosticAttempt = attempt || {
    id: "diag_attempt",
    title: "Data Analyst Role Diagnostic",
    description: "Assessment",
    target_role: "Data Analyst",
    skills_covered: DIAGNOSTIC_SKILLS,
    time_limit_minutes: 25,
    total_points: 100,
    points_per_question: 4,
    passing_percentage: 80,
    passing_score: 80,
    questions_count: 25,
    questions: Object.values(ALL_QUESTIONS_MAP).slice(0, 25).map((q, idx) => ({
      id: q.id,
      index: idx + 1,
      competency: q.competency,
      category: "Data Analytics",
      difficulty: q.difficulty,
      points: 4,
      question: q.question,
      options: q.options,
      prerequisite_concept: q.prerequisite_concept
    })),
    assessmentStartedAt: Date.now(),
    assessmentExpiresAt: Date.now() + 25 * 60 * 1000
  };

  const ansKeys = Object.keys(answers);
  if (ansKeys.length > 0 && (!attempt || attempt.questions.length === 0)) {
    dummyAttempt.questions = ansKeys.map((qid, idx) => {
      const master = ALL_QUESTIONS_MAP[qid];
      return {
        id: qid,
        index: idx + 1,
        competency: master?.competency || "SQL Fundamentals",
        category: "Data Analytics",
        difficulty: master?.difficulty || "Intermediate",
        points: 4,
        question: master?.question || "Question",
        options: master?.options || [],
        prerequisite_concept: master?.prerequisite_concept || "Fundamentals"
      };
    });
  }

  return evaluateClientDiagnostic(attempt || dummyAttempt, answers);
}

/**
 * Authoritative score evaluation (80% qualification threshold = 20/25 correct).
 */
export function evaluateClientDiagnostic(
  attempt: DiagnosticAttempt,
  answers: Record<string, string>
): DiagnosticEvaluation {
  const totalQuestions = 25;
  const pointsPerQuestion = 4;
  const totalPoints = 100;
  let correctCount = 0;

  const competencyBreakdown: Record<string, { correct: number; total: number }> = {};
  DIAGNOSTIC_SKILLS.forEach((s) => {
    competencyBreakdown[s] = { correct: 0, total: 0 };
  });

  const questionResults = attempt.questions.map((q) => {
    const master = ALL_QUESTIONS_MAP[q.id];
    const userAns = (answers[q.id] || "").trim().toUpperCase();
    const correctAns = (master?.correctAnswer || "A").trim().toUpperCase();
    const isCorrect = userAns === correctAns;

    if (!competencyBreakdown[q.competency]) {
      competencyBreakdown[q.competency] = { correct: 0, total: 0 };
    }
    competencyBreakdown[q.competency].total += 1;

    if (isCorrect) {
      correctCount += 1;
      competencyBreakdown[q.competency].correct += 1;
    }

    return {
      question_id: q.id,
      competency: q.competency,
      user_answer: answers[q.id] || "Unanswered",
      correct_answer: correctAns,
      is_correct: isCorrect,
      explanation: master?.explanation || "Standard analytical requirement.",
      earned_points: isCorrect ? pointsPerQuestion : 0,
      max_points: pointsPerQuestion
    };
  });

  const overallScore = Math.round((correctCount / totalQuestions) * 100);
  const isQualified = overallScore >= 80;

  const weaknesses: string[] = [];
  Object.entries(competencyBreakdown).forEach(([comp, stat]) => {
    if (stat.total > 0) {
      const pct = (stat.correct / stat.total) * 100;
      if (pct < 80) {
        weaknesses.push(comp);
      }
    }
  });

  const certId = isQualified
    ? `DA-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    : undefined;

  return {
    overall_score: overallScore,
    total_points: totalPoints,
    earned_points: correctCount * pointsPerQuestion,
    correct_count: correctCount,
    total_questions: totalQuestions,
    passing_score: 80,
    passed: isQualified,
    status: isQualified ? "QUALIFIED" : "NOT QUALIFIED",
    competency_breakdown: competencyBreakdown,
    weaknesses,
    certificate_id: certId,
    question_results: questionResults
  };
}
