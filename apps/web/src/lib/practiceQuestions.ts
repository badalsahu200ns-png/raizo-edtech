export interface PracticeQuestion {
  id: number;
  module: string;
  type: "sql" | "python" | "case_study";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  title: string;
  skills: string[];
  scenario: string;
  objective: string;
  tables: Array<{ name: string; columns: string[] }>;
  sampleData: Record<string, Array<Record<string, any>>>;
  expectedOutput: Array<Record<string, any>>;
  starterCode: string;
  hints: [string, string, string]; // [Concept, Function, Structure]
  solution: string;
  explanation: string;
  commonMistakes: string[];
  interviewFollowUps: Array<{ question: string; answer: string }>;
}

export const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  // ==========================================
  // MODULE 1 — SQL FUNDAMENTALS
  // ==========================================
  {
    id: 1,
    module: "Module 1 — SQL Fundamentals",
    type: "sql",
    difficulty: "Beginner",
    title: "SQL Filtering: High Salary Compensation",
    skills: ["SQL Fundamentals", "SELECT", "WHERE", "Comparison Operators"],
    scenario: "Human Resources is conducting an executive compensation review and needs to identify all employees whose annual base salary strictly exceeds $80,000.",
    objective: "Select the employee_id, first_name, last_name, department_id, and salary from the employees table where salary > 80000, sorted descending by salary.",
    tables: [{ name: "employees", columns: ["employee_id INT", "first_name VARCHAR", "last_name VARCHAR", "department_id INT", "salary NUMERIC"] }],
    sampleData: {
      employees: [
        { employee_id: 101, first_name: "Sarah", last_name: "Chen", department_id: 1, salary: 95000 },
        { employee_id: 102, first_name: "Michael", last_name: "Ross", department_id: 2, salary: 75000 },
        { employee_id: 103, first_name: "Elena", last_name: "Rostova", department_id: 1, salary: 110000 },
        { employee_id: 104, first_name: "David", last_name: "Kim", department_id: 3, salary: 68000 }
      ]
    },
    expectedOutput: [
      { employee_id: 103, first_name: "Elena", last_name: "Rostova", department_id: 1, salary: 110000 },
      { employee_id: 101, first_name: "Sarah", last_name: "Chen", department_id: 1, salary: 95000 }
    ],
    starterCode: "-- Select employees with salary > 80000 ordered by salary DESC\nSELECT employee_id, first_name, last_name, department_id, salary\nFROM employees\nWHERE ...;",
    hints: [
      "Think about which SQL clause filters individual rows before any grouping occurs.",
      "Use the > operator inside your WHERE clause to compare the salary column.",
      "Syntax: SELECT ... FROM employees WHERE salary > 80000 ORDER BY salary DESC;"
    ],
    solution: "SELECT employee_id, first_name, last_name, department_id, salary\nFROM employees\nWHERE salary > 80000\nORDER BY salary DESC;",
    explanation: "The WHERE clause acts as a row-level filter evaluating each record before projection. Sorting by salary DESC ensures the highest earners appear first.",
    commonMistakes: [
      "Using HAVING instead of WHERE (HAVING is only for aggregated groups).",
      "Using >= instead of strict > when the requirement specifies 'exceeds'."
    ],
    interviewFollowUps: [
      {
        question: "When should you use WHERE vs HAVING in SQL?",
        answer: "WHERE filters raw individual records before aggregation. HAVING filters grouped rows after GROUP BY has aggregated values."
      }
    ]
  },
  {
    id: 2,
    module: "Module 1 — SQL Fundamentals",
    type: "sql",
    difficulty: "Beginner",
    title: "SQL Aggregation: Department Payroll Summary",
    skills: ["SQL Aggregation", "GROUP BY", "SUM()", "AVG()", "ROUND()"],
    scenario: "Finance requires department-level total payroll expenditure and average employee salary to allocate quarterly departmental budgets.",
    objective: "Group by department_id and return department_id, the total salary sum as 'total_payroll', and the rounded average salary as 'avg_salary'.",
    tables: [{ name: "employees", columns: ["employee_id INT", "department_id INT", "salary NUMERIC"] }],
    sampleData: {
      employees: [
        { employee_id: 1, department_id: 10, salary: 60000 },
        { employee_id: 2, department_id: 10, salary: 80000 },
        { employee_id: 3, department_id: 20, salary: 90000 },
        { employee_id: 4, department_id: 20, salary: 110000 }
      ]
    },
    expectedOutput: [
      { department_id: 10, total_payroll: 140000, avg_salary: 70000 },
      { department_id: 20, total_payroll: 200000, avg_salary: 100000 }
    ],
    starterCode: "SELECT department_id, \n       SUM(...) AS total_payroll,\n       AVG(...) AS avg_salary\nFROM employees\nGROUP BY ...;",
    hints: [
      "Aggregation collapses rows having identical department_id values into a single summary row.",
      "Use SUM(salary) to compute total spend and AVG(salary) for the mean.",
      "Syntax: SELECT department_id, SUM(salary) AS total_payroll, AVG(salary) AS avg_salary FROM employees GROUP BY department_id;"
    ],
    solution: "SELECT department_id, SUM(salary) AS total_payroll, AVG(salary) AS avg_salary\nFROM employees\nGROUP BY department_id\nORDER BY department_id;",
    explanation: "GROUP BY partitions data into discrete sets per department_id, allowing aggregate functions SUM() and AVG() to run over each group.",
    commonMistakes: [
      "Selecting unaggregated non-grouping columns in the SELECT clause (violates SQL standard).",
      "Forgetting to alias aggregated expressions."
    ],
    interviewFollowUps: [
      {
        question: "Does AVG() in SQL include or ignore NULL values?",
        answer: "AVG() ignores NULL values in standard SQL. If 3 rows have salaries [100, 200, NULL], AVG() returns 150 (300/2), not 100."
      }
    ]
  },
  {
    id: 3,
    module: "Module 1 — SQL Fundamentals",
    type: "sql",
    difficulty: "Intermediate",
    title: "Partitioned Salary Ranking",
    skills: ["Window Functions", "DENSE_RANK", "PARTITION BY", "ORDER BY"],
    scenario: "Leadership wants to view internal salary benchmarks by ranking each employee relative to their peers inside the exact same department without collapsing records.",
    objective: "Write a SQL query that calculates the salary rank of every employee within their respective department using DENSE_RANK(). Return employee_id, department_id, salary, and the rank column as 'dept_salary_rank'.",
    tables: [{ name: "employees", columns: ["employee_id INT", "department_id INT", "salary NUMERIC"] }],
    sampleData: {
      employees: [
        { employee_id: 101, department_id: 1, salary: 100000 },
        { employee_id: 102, department_id: 1, salary: 100000 },
        { employee_id: 103, department_id: 1, salary: 90000 },
        { employee_id: 104, department_id: 2, salary: 120000 },
        { employee_id: 105, department_id: 2, salary: 85000 }
      ]
    },
    expectedOutput: [
      { employee_id: 101, department_id: 1, salary: 100000, dept_salary_rank: 1 },
      { employee_id: 102, department_id: 1, salary: 100000, dept_salary_rank: 1 },
      { employee_id: 103, department_id: 1, salary: 90000, dept_salary_rank: 2 },
      { employee_id: 104, department_id: 2, salary: 120000, dept_salary_rank: 1 },
      { employee_id: 105, department_id: 2, salary: 85000, dept_salary_rank: 2 }
    ],
    starterCode: "SELECT employee_id, department_id, salary,\n       DENSE_RANK() OVER (...) as dept_salary_rank\nFROM employees;",
    hints: [
      "Think about how ranking can be performed separately for each department.",
      "Compare RANK(), DENSE_RANK(), and ROW_NUMBER(). You need consecutive ranks without gaps.",
      "You will need a window function: DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC)."
    ],
    solution: "SELECT employee_id, department_id, salary,\n       DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as dept_salary_rank\nFROM employees\nORDER BY department_id, dept_salary_rank;",
    explanation: "DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) assigns sequential ranks per department while preserving non-grouped employee rows without skipping ranks on ties.",
    commonMistakes: [
      "Using RANK() instead of DENSE_RANK() which causes ranks to skip numbers after ties.",
      "Omitting PARTITION BY which ranks everyone globally across the company instead of within department."
    ],
    interviewFollowUps: [
      {
        question: "What is the difference between RANK(), DENSE_RANK(), and ROW_NUMBER()?",
        answer: "ROW_NUMBER assigns distinct consecutive integers (1,2,3). RANK gives ties identical numbers but skips subsequent ranks (1,1,3). DENSE_RANK gives ties identical numbers without skipping (1,1,2)."
      }
    ]
  },
  {
    id: 4,
    module: "Module 1 — SQL Fundamentals",
    type: "sql",
    difficulty: "Intermediate",
    title: "Highest Paid Employee Per Department",
    skills: ["CTEs", "Window Functions", "DENSE_RANK", "Filtering"],
    scenario: "Management wants to recognize top performers by identifying the highest-earning employee in every department. In case of ties, all top earners should be shown.",
    objective: "Return department_id, employee_id, and salary for employees who hold rank 1 in their department.",
    tables: [{ name: "employees", columns: ["employee_id INT", "department_id INT", "salary NUMERIC"] }],
    sampleData: {
      employees: [
        { employee_id: 1, department_id: 1, salary: 80000 },
        { employee_id: 2, department_id: 1, salary: 95000 },
        { employee_id: 3, department_id: 2, salary: 110000 },
        { employee_id: 4, department_id: 2, salary: 105000 }
      ]
    },
    expectedOutput: [
      { department_id: 1, employee_id: 2, salary: 95000 },
      { department_id: 2, employee_id: 3, salary: 110000 }
    ],
    starterCode: "WITH Ranked AS (\n  SELECT employee_id, department_id, salary,\n         DENSE_RANK() OVER (...) as rnk\n  FROM employees\n)\nSELECT department_id, employee_id, salary\nFROM Ranked\nWHERE ...;",
    hints: [
      "Window functions cannot be evaluated directly in the WHERE clause.",
      "Wrap the ranked query in a CTE (WITH clause) or subquery.",
      "Filter the outer query where rnk = 1."
    ],
    solution: "WITH Ranked AS (\n  SELECT employee_id, department_id, salary,\n         DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk\n  FROM employees\n)\nSELECT department_id, employee_id, salary\nFROM Ranked\nWHERE rnk = 1\nORDER BY department_id;",
    explanation: "The CTE calculates internal ranking across each partition. The outer query isolates top earners by filtering where rnk = 1.",
    commonMistakes: [
      "Attempting `WHERE DENSE_RANK() OVER(...) = 1` in the same query (window functions execute after WHERE).",
      "Using `SELECT MAX(salary) ... GROUP BY` which loses the corresponding employee_id."
    ],
    interviewFollowUps: [
      {
        question: "Why can't window functions appear directly in a WHERE clause?",
        answer: "SQL logical query processing evaluates WHERE before window functions. By the time WHERE runs, window calculations have not yet occurred."
      }
    ]
  },
  {
    id: 5,
    module: "Module 1 — SQL Fundamentals",
    type: "sql",
    difficulty: "Intermediate",
    title: "Second Highest Salary Per Department",
    skills: ["CTEs", "Window Functions", "DENSE_RANK", "Subqueries"],
    scenario: "Compensation committee needs to audit salary equity by reviewing the exact second-highest salary tier within every department.",
    objective: "Using a CTE and DENSE_RANK(), find the employee_id, department_id, and salary for all employees who earn the second-highest salary in their department.",
    tables: [{ name: "employees", columns: ["employee_id INT", "department_id INT", "salary NUMERIC"] }],
    sampleData: {
      employees: [
        { employee_id: 1, department_id: 10, salary: 100000 },
        { employee_id: 2, department_id: 10, salary: 100000 },
        { employee_id: 3, department_id: 10, salary: 85000 },
        { employee_id: 4, department_id: 20, salary: 90000 },
        { employee_id: 5, department_id: 20, salary: 75000 }
      ]
    },
    expectedOutput: [
      { employee_id: 3, department_id: 10, salary: 85000 },
      { employee_id: 5, department_id: 20, salary: 75000 }
    ],
    starterCode: "WITH RankedSalaries AS (\n  SELECT employee_id, department_id, salary,\n         DENSE_RANK() OVER (...) as rnk\n  FROM employees\n)\nSELECT employee_id, department_id, salary\nFROM RankedSalaries\nWHERE ...;",
    hints: [
      "Use DENSE_RANK() so that if multiple employees tie for 1st, the next distinct salary is correctly ranked 2.",
      "Partition by department_id and order by salary DESC.",
      "Filter the outer query where rnk = 2."
    ],
    solution: "WITH RankedSalaries AS (\n  SELECT employee_id, department_id, salary,\n         DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as rnk\n  FROM employees\n)\nSELECT employee_id, department_id, salary\nFROM RankedSalaries\nWHERE rnk = 2\nORDER BY department_id;",
    explanation: "DENSE_RANK() guarantees that the second distinct salary level receives rank 2 regardless of how many employees tie for top compensation.",
    commonMistakes: [
      "Using RANK() which skips rank 2 if two people tie for rank 1.",
      "Using LIMIT 1 OFFSET 1 which only works globally for a single department, not across multiple groups."
    ],
    interviewFollowUps: [
      {
        question: "What happens if a department only has 1 employee? Will they appear?",
        answer: "No, because their rank is 1. If an interview question requires handling missing 2nd salaries, a LEFT JOIN or COALESCE with NULL is expected."
      }
    ]
  },

  // ==========================================
  // MODULE 2 — ANALYTICAL SQL
  // ==========================================
  {
    id: 6,
    module: "Module 2 — Analytical SQL",
    type: "sql",
    difficulty: "Intermediate",
    title: "Salary vs Department Average",
    skills: ["Window Functions", "AVG() OVER", "PARTITION BY", "Variance Analysis"],
    scenario: "Leadership wants an equity audit comparing each individual's salary to the arithmetic mean salary of their specific department.",
    objective: "Select employee_id, department_id, salary, and the department average salary as 'dept_avg_salary' alongside each row.",
    tables: [{ name: "employees", columns: ["employee_id INT", "department_id INT", "salary NUMERIC"] }],
    sampleData: {
      employees: [
        { employee_id: 1, department_id: 1, salary: 60000 },
        { employee_id: 2, department_id: 1, salary: 80000 },
        { employee_id: 3, department_id: 2, salary: 90000 }
      ]
    },
    expectedOutput: [
      { employee_id: 1, department_id: 1, salary: 60000, dept_avg_salary: 70000 },
      { employee_id: 2, department_id: 1, salary: 80000, dept_avg_salary: 70000 },
      { employee_id: 3, department_id: 2, salary: 90000, dept_avg_salary: 90000 }
    ],
    starterCode: "SELECT employee_id, department_id, salary,\n       AVG(salary) OVER (...) AS dept_avg_salary\nFROM employees;",
    hints: [
      "Use aggregate function AVG as a window function by appending the OVER() clause.",
      "Partition by department_id without an ORDER BY clause inside OVER so the entire department average is evaluated.",
      "Syntax: AVG(salary) OVER (PARTITION BY department_id) AS dept_avg_salary."
    ],
    solution: "SELECT employee_id, department_id, salary,\n       AVG(salary) OVER (PARTITION BY department_id) AS dept_avg_salary\nFROM employees\nORDER BY department_id, employee_id;",
    explanation: "AVG() OVER(PARTITION BY department_id) evaluates the departmental mean and projects it onto each row without collapsing records.",
    commonMistakes: [
      "Adding ORDER BY inside OVER (which turns the calculation into a running cumulative average instead of the full group average).",
      "Using a subquery join when a simple window function is far more performant."
    ],
    interviewFollowUps: [
      {
        question: "How would you calculate the dollar difference between salary and department average?",
        answer: "Subtract the window expression: salary - AVG(salary) OVER(PARTITION BY department_id) AS diff_from_avg."
      }
    ]
  },
  {
    id: 7,
    module: "Module 2 — Analytical SQL",
    type: "sql",
    difficulty: "Intermediate",
    title: "Running Revenue Over Time",
    skills: ["Window Functions", "SUM() OVER", "Running Totals", "Time Series"],
    scenario: "Finance needs a chronological revenue report displaying day-by-day revenue alongside cumulative year-to-date running totals.",
    objective: "Return transaction_date, daily_amount, and running total revenue as 'running_revenue' ordered by date.",
    tables: [{ name: "daily_sales", columns: ["transaction_date DATE", "daily_amount NUMERIC"] }],
    sampleData: {
      daily_sales: [
        { transaction_date: "2026-01-01", daily_amount: 1000 },
        { transaction_date: "2026-01-02", daily_amount: 1500 },
        { transaction_date: "2026-01-03", daily_amount: 800 }
      ]
    },
    expectedOutput: [
      { transaction_date: "2026-01-01", daily_amount: 1000, running_revenue: 1000 },
      { transaction_date: "2026-01-02", daily_amount: 1500, running_revenue: 2500 },
      { transaction_date: "2026-01-03", daily_amount: 800, running_revenue: 3300 }
    ],
    starterCode: "SELECT transaction_date, daily_amount,\n       SUM(daily_amount) OVER (...) AS running_revenue\nFROM daily_sales\nORDER BY transaction_date;",
    hints: [
      "A running total requires ordering records chronologically within the OVER() clause.",
      "Use SUM(daily_amount) OVER (ORDER BY transaction_date).",
      "When ORDER BY is present in OVER, SQL defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW."
    ],
    solution: "SELECT transaction_date, daily_amount,\n       SUM(daily_amount) OVER (ORDER BY transaction_date) AS running_revenue\nFROM daily_sales\nORDER BY transaction_date;",
    explanation: "The ORDER BY inside OVER() creates an expanding cumulative frame summing all values from the start of time up to the current row.",
    commonMistakes: [
      "Forgetting ORDER BY inside OVER (which computes the global sum rather than a running cumulative sum).",
      "Duplicate dates producing identical ties if not disambiguated."
    ],
    interviewFollowUps: [
      {
        question: "What is the difference between ROWS BETWEEN and RANGE BETWEEN in SQL window frames?",
        answer: "ROWS treats duplicate ordering values as distinct physical rows. RANGE groups identical order values together into the same frame calculation."
      }
    ]
  },
  {
    id: 8,
    module: "Module 2 — Analytical SQL",
    type: "sql",
    difficulty: "Advanced",
    title: "Month-over-Month Growth with LAG()",
    skills: ["Window Functions", "LAG()", "MoM Growth", "Percentage Calculations"],
    scenario: "Executive leadership is assessing seasonal demand swings and requires monthly revenue alongside prior-month revenue to compute growth.",
    objective: "Select sale_month, revenue, the prior month revenue as 'prev_month_revenue', and the dollar difference as 'mom_change'.",
    tables: [{ name: "monthly_revenue", columns: ["sale_month VARCHAR", "revenue NUMERIC"] }],
    sampleData: {
      monthly_revenue: [
        { sale_month: "2026-01", revenue: 50000 },
        { sale_month: "2026-02", revenue: 65000 },
        { sale_month: "2026-03", revenue: 60000 }
      ]
    },
    expectedOutput: [
      { sale_month: "2026-01", revenue: 50000, prev_month_revenue: null, mom_change: null },
      { sale_month: "2026-02", revenue: 65000, prev_month_revenue: 50000, mom_change: 15000 },
      { sale_month: "2026-03", revenue: 60000, prev_month_revenue: 65000, mom_change: -5000 }
    ],
    starterCode: "SELECT sale_month, revenue,\n       LAG(revenue) OVER (...) AS prev_month_revenue,\n       revenue - LAG(revenue) OVER (...) AS mom_change\nFROM monthly_revenue\nORDER BY sale_month;",
    hints: [
      "LAG(column, 1) accesses values from the immediately preceding row.",
      "Ensure OVER() orders chronologically by sale_month.",
      "Syntax: LAG(revenue) OVER (ORDER BY sale_month)."
    ],
    solution: "SELECT sale_month, revenue,\n       LAG(revenue) OVER (ORDER BY sale_month) AS prev_month_revenue,\n       revenue - LAG(revenue) OVER (ORDER BY sale_month) AS mom_change\nFROM monthly_revenue\nORDER BY sale_month;",
    explanation: "LAG() retrieves the value from an offset row before the current row. Subtracting LAG() from the current revenue gives absolute Month-over-Month change.",
    commonMistakes: [
      "Using LEAD() instead of LAG() (LEAD looks into the future, LAG looks to the past).",
      "Dividing by zero when computing percentage growth."
    ],
    interviewFollowUps: [
      {
        question: "How would you handle the first row returning NULL in LAG()?",
        answer: "Provide a default value: LAG(revenue, 1, 0) OVER (ORDER BY sale_month) replaces NULL with 0."
      }
    ]
  },
  {
    id: 9,
    module: "Module 2 — Analytical SQL",
    type: "sql",
    difficulty: "Intermediate",
    title: "First Customer Purchase",
    skills: ["Window Functions", "ROW_NUMBER", "PARTITION BY", "Customer Cohorts"],
    scenario: "Marketing is building an onboarding cohort model and needs the first order date and order ID for every customer.",
    objective: "Find customer_id, order_id, and order_date for each customer's initial order.",
    tables: [{ name: "orders", columns: ["order_id INT", "customer_id INT", "order_date DATE", "amount NUMERIC"] }],
    sampleData: {
      orders: [
        { order_id: 101, customer_id: 1, order_date: "2026-01-15", amount: 45 },
        { order_id: 102, customer_id: 1, order_date: "2026-02-10", amount: 75 },
        { order_id: 103, customer_id: 2, order_date: "2026-01-20", amount: 120 }
      ]
    },
    expectedOutput: [
      { customer_id: 1, order_id: 101, order_date: "2026-01-15" },
      { customer_id: 2, order_id: 103, order_date: "2026-01-20" }
    ],
    starterCode: "WITH NumberedOrders AS (\n  SELECT customer_id, order_id, order_date,\n         ROW_NUMBER() OVER (...) as rn\n  FROM orders\n)\nSELECT customer_id, order_id, order_date\nFROM NumberedOrders\nWHERE ...;",
    hints: [
      "Use ROW_NUMBER() partitioned by customer_id and ordered by order_date ASC.",
      "Wrap in a CTE and filter for rn = 1.",
      "ROW_NUMBER ensures exactly one record is marked first even if dates tie."
    ],
    solution: "WITH NumberedOrders AS (\n  SELECT customer_id, order_id, order_date,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date ASC, order_id ASC) as rn\n  FROM orders\n)\nSELECT customer_id, order_id, order_date\nFROM NumberedOrders\nWHERE rn = 1\nORDER BY customer_id;",
    explanation: "Partitioning by customer_id resets the counter for each individual customer. ORDER BY order_date ASC assigns 1 to their earliest transaction.",
    commonMistakes: [
      "Ordering DESC instead of ASC (which finds the most recent order instead of the first).",
      "Using MIN(order_date) with GROUP BY, which makes selecting the corresponding order_id difficult."
    ],
    interviewFollowUps: [
      {
        question: "Why is ROW_NUMBER preferred over MIN(order_date) for finding full record attributes?",
        answer: "MIN(order_date) with GROUP BY requires an extra self-join to retrieve the order_id, whereas ROW_NUMBER retains all row attributes directly in one pass."
      }
    ]
  },
  {
    id: 10,
    module: "Module 2 — Analytical SQL",
    type: "sql",
    difficulty: "Intermediate",
    title: "Latest Customer Transaction",
    skills: ["Window Functions", "ROW_NUMBER", "PARTITION BY", "Recency Analysis"],
    scenario: "CRM retention team wants to audit active customer churn by pulling the most recent transaction details for each account.",
    objective: "Find customer_id, order_id, and order_date for each customer's most recent order.",
    tables: [{ name: "orders", columns: ["order_id INT", "customer_id INT", "order_date DATE", "amount NUMERIC"] }],
    sampleData: {
      orders: [
        { order_id: 101, customer_id: 1, order_date: "2026-01-15", amount: 45 },
        { order_id: 102, customer_id: 1, order_date: "2026-03-12", amount: 75 },
        { order_id: 103, customer_id: 2, order_date: "2026-02-01", amount: 120 }
      ]
    },
    expectedOutput: [
      { customer_id: 1, order_id: 102, order_date: "2026-03-12" },
      { customer_id: 2, order_id: 103, order_date: "2026-02-01" }
    ],
    starterCode: "WITH RecentOrders AS (\n  SELECT customer_id, order_id, order_date,\n         ROW_NUMBER() OVER (...) as rn\n  FROM orders\n)\nSELECT customer_id, order_id, order_date\nFROM RecentOrders\nWHERE ...;",
    hints: [
      "Similar to earliest purchase, but sort order_date in descending order.",
      "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC).",
      "Filter where rn = 1."
    ],
    solution: "WITH RecentOrders AS (\n  SELECT customer_id, order_id, order_date,\n         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC) as rn\n  FROM orders\n)\nSELECT customer_id, order_id, order_date\nFROM RecentOrders\nWHERE rn = 1\nORDER BY customer_id;",
    explanation: "Sorting order_date DESC inside each customer's partition assigns rn = 1 to the freshest transaction.",
    commonMistakes: [
      "Forgetting a tie-breaker in ORDER BY when two orders occur on the same date.",
      "Using MAX(order_date) with an unnecessary subquery join."
    ],
    interviewFollowUps: [
      {
        question: "How does this logic apply to RFM (Recency, Frequency, Monetary) segmentation?",
        answer: "The latest order_date directly computes the 'Recency' score (CURRENT_DATE - latest_order_date)."
      }
    ]
  },

  // ==========================================
  // MODULE 3 — GROUPING & BUSINESS ANALYTICS
  // ==========================================
  {
    id: 11,
    module: "Module 3 — Grouping & Business Analytics",
    type: "sql",
    difficulty: "Beginner",
    title: "Departments with More Than 5 Employees",
    skills: ["SQL Aggregation", "GROUP BY", "HAVING", "COUNT"],
    scenario: "Operations is consolidating smaller offices and needs a list of departments that have more than five active employees.",
    objective: "Select department_id and the count of employees as 'headcount' for departments where employee count strictly exceeds 5.",
    tables: [{ name: "employees", columns: ["employee_id INT", "department_id INT"] }],
    sampleData: {
      employees: [
        { employee_id: 1, department_id: 10 },
        { employee_id: 2, department_id: 10 },
        { employee_id: 3, department_id: 10 },
        { employee_id: 4, department_id: 10 },
        { employee_id: 5, department_id: 10 },
        { employee_id: 6, department_id: 10 },
        { employee_id: 7, department_id: 20 },
        { employee_id: 8, department_id: 20 }
      ]
    },
    expectedOutput: [
      { department_id: 10, headcount: 6 }
    ],
    starterCode: "SELECT department_id, COUNT(*) AS headcount\nFROM employees\nGROUP BY department_id\nHAVING ...;",
    hints: [
      "WHERE filters rows before grouping; HAVING filters aggregated groups.",
      "Use COUNT(*) > 5 in the HAVING clause.",
      "Syntax: SELECT department_id, COUNT(*) AS headcount FROM employees GROUP BY department_id HAVING COUNT(*) > 5;"
    ],
    solution: "SELECT department_id, COUNT(*) AS headcount\nFROM employees\nGROUP BY department_id\nHAVING COUNT(*) > 5\nORDER BY headcount DESC;",
    explanation: "Because headcount is computed via aggregation, the threshold check must be placed in the HAVING clause.",
    commonMistakes: [
      "Writing `WHERE COUNT(*) > 5` (aggregate functions are invalid in WHERE).",
      "Using alias `HAVING headcount > 5` on databases that evaluate HAVING prior to SELECT aliasing."
    ],
    interviewFollowUps: [
      {
        question: "Can HAVING be used without a GROUP BY clause?",
        answer: "Yes, in standard SQL, HAVING without GROUP BY evaluates the entire table as a single aggregated group."
      }
    ]
  },
  {
    id: 12,
    module: "Module 3 — Grouping & Business Analytics",
    type: "sql",
    difficulty: "Intermediate",
    title: "Products with Sales Greater Than ₹100,000",
    skills: ["SQL Aggregation", "SUM()", "GROUP BY", "HAVING", "Currency Analysis"],
    scenario: "Product merchandising requires identifying star products generating substantial total sales volume exceeding ₹100,000.",
    objective: "Group by product_id, calculate total sales as 'total_revenue', and filter for products where total revenue exceeds 100000.",
    tables: [{ name: "order_items", columns: ["item_id INT", "product_id INT", "sale_amount NUMERIC"] }],
    sampleData: {
      order_items: [
        { item_id: 1, product_id: 101, sale_amount: 60000 },
        { item_id: 2, product_id: 101, sale_amount: 55000 },
        { item_id: 3, product_id: 102, sale_amount: 40000 }
      ]
    },
    expectedOutput: [
      { product_id: 101, total_revenue: 115000 }
    ],
    starterCode: "SELECT product_id, SUM(sale_amount) AS total_revenue\nFROM order_items\nGROUP BY product_id\nHAVING ...;",
    hints: [
      "Aggregate with SUM(sale_amount).",
      "Filter the aggregated sum using HAVING SUM(sale_amount) > 100000.",
      "Order descending by total_revenue."
    ],
    solution: "SELECT product_id, SUM(sale_amount) AS total_revenue\nFROM order_items\nGROUP BY product_id\nHAVING SUM(sale_amount) > 100000\nORDER BY total_revenue DESC;",
    explanation: "Calculates cumulative revenue per product_id and applies the financial hurdle in the HAVING clause.",
    commonMistakes: [
      "Filtering in WHERE (which checks if an individual line item exceeded 100,000 rather than total product sales).",
      "Confusing product count with sum of sales."
    ],
    interviewFollowUps: [
      {
        question: "What is the order of execution in this query?",
        answer: "FROM -> GROUP BY -> HAVING -> SELECT -> ORDER BY."
      }
    ]
  },

  // ==========================================
  // MODULE 4 — SQL JOINS
  // ==========================================
  {
    id: 13,
    module: "Module 4 — SQL Joins",
    type: "sql",
    difficulty: "Beginner",
    title: "INNER JOIN: Customers and Orders",
    skills: ["SQL Joins", "INNER JOIN", "Relational Sets"],
    scenario: "Customer support needs to generate receipts pairing verified customer names with their active order transactions.",
    objective: "Join customers and orders on customer_id, returning customer_name, order_id, order_date, and amount.",
    tables: [
      { name: "customers", columns: ["customer_id INT", "customer_name VARCHAR"] },
      { name: "orders", columns: ["order_id INT", "customer_id INT", "order_date DATE", "amount NUMERIC"] }
    ],
    sampleData: {
      customers: [
        { customer_id: 1, customer_name: "Alice" },
        { customer_id: 2, customer_name: "Bob" },
        { customer_id: 3, customer_name: "Charlie" }
      ],
      orders: [
        { order_id: 501, customer_id: 1, order_date: "2026-01-10", amount: 150 },
        { order_id: 502, customer_id: 2, order_date: "2026-01-12", amount: 200 }
      ]
    },
    expectedOutput: [
      { customer_name: "Alice", order_id: 501, order_date: "2026-01-10", amount: 150 },
      { customer_name: "Bob", order_id: 502, order_date: "2026-01-12", amount: 200 }
    ],
    starterCode: "SELECT c.customer_name, o.order_id, o.order_date, o.amount\nFROM customers c\nINNER JOIN orders o ON ...\nORDER BY o.order_id;",
    hints: [
      "INNER JOIN preserves only matching rows present in both tables.",
      "Join predicate is c.customer_id = o.customer_id.",
      "Charlie placed no orders, so Charlie will not appear."
    ],
    solution: "SELECT c.customer_name, o.order_id, o.order_date, o.amount\nFROM customers c\nINNER JOIN orders o ON c.customer_id = o.customer_id\nORDER BY o.order_id;",
    explanation: "An INNER JOIN matches records where keys are equal in both relations, filtering out non-purchasing customers.",
    commonMistakes: [
      "Using a Cartesian comma join without an ON condition.",
      "Not qualifying ambiguous columns."
    ],
    interviewFollowUps: [
      {
        question: "What happens if customer_id is NULL in either table during an INNER JOIN?",
        answer: "NULL = NULL evaluates to UNKNOWN in SQL, so records with NULL keys are never matched in an INNER JOIN."
      }
    ]
  },
  {
    id: 14,
    module: "Module 4 — SQL Joins",
    type: "sql",
    difficulty: "Intermediate",
    title: "Customers Who Never Ordered",
    skills: ["SQL Joins", "LEFT JOIN", "Anti-Join", "IS NULL"],
    scenario: "Marketing is launching a re-engagement campaign for users who registered an account but never made a single purchase.",
    objective: "Select customer_id and customer_name for customers who have zero recorded transactions in the orders table.",
    tables: [
      { name: "customers", columns: ["customer_id INT", "customer_name VARCHAR"] },
      { name: "orders", columns: ["order_id INT", "customer_id INT"] }
    ],
    sampleData: {
      customers: [
        { customer_id: 1, customer_name: "Alice" },
        { customer_id: 2, customer_name: "Bob" },
        { customer_id: 3, customer_name: "Charlie" }
      ],
      orders: [
        { order_id: 101, customer_id: 1 }
      ]
    },
    expectedOutput: [
      { customer_id: 2, customer_name: "Bob" },
      { customer_id: 3, customer_name: "Charlie" }
    ],
    starterCode: "SELECT c.customer_id, c.customer_name\nFROM customers c\nLEFT JOIN orders o ON ...\nWHERE ...;",
    hints: [
      "A LEFT JOIN preserves every row from customers.",
      "For customers with no orders, all columns from orders will be NULL.",
      "Filter with WHERE o.order_id IS NULL."
    ],
    solution: "SELECT c.customer_id, c.customer_name\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.order_id IS NULL\nORDER BY c.customer_id;",
    explanation: "This pattern is known as an anti-join. The LEFT JOIN preserves all customers, and WHERE o.order_id IS NULL isolates those with no order records.",
    commonMistakes: [
      "Writing `WHERE o.order_id = NULL` (must use `IS NULL`).",
      "Using `NOT IN (SELECT customer_id FROM orders)` when customer_id in orders could contain NULLs (which causes NOT IN to return zero rows)."
    ],
    interviewFollowUps: [
      {
        question: "Why is LEFT JOIN ... WHERE IS NULL safer than NOT IN?",
        answer: "If the subquery in NOT IN contains a single NULL value, NOT IN evaluates to UNKNOWN for all rows, returning empty results."
      }
    ]
  },
  {
    id: 15,
    module: "Module 4 — SQL Joins",
    type: "sql",
    difficulty: "Advanced",
    title: "Unmatched Records Reconciliation",
    skills: ["SQL Joins", "FULL OUTER JOIN", "Data Reconciliation", "COALESCE"],
    scenario: "Accounting is reconciling payment gateway logs against internal database orders to detect unpaid orders or orphan charges.",
    objective: "Using a FULL OUTER JOIN, return order_id from internal orders, transaction_id from gateway, and a status column ('Internal Only', 'Gateway Only', 'Matched').",
    tables: [
      { name: "internal_orders", columns: ["order_id INT", "amount NUMERIC"] },
      { name: "gateway_charges", columns: ["transaction_id INT", "order_id INT", "amount NUMERIC"] }
    ],
    sampleData: {
      internal_orders: [
        { order_id: 1, amount: 100 },
        { order_id: 2, amount: 200 }
      ],
      gateway_charges: [
        { transaction_id: 901, order_id: 2, amount: 200 },
        { transaction_id: 902, order_id: 3, amount: 300 }
      ]
    },
    expectedOutput: [
      { order_id: 1, transaction_id: null, reconciliation_status: "Internal Only" },
      { order_id: 2, transaction_id: 901, reconciliation_status: "Matched" },
      { order_id: null, transaction_id: 902, reconciliation_status: "Gateway Only" }
    ],
    starterCode: "SELECT i.order_id, g.transaction_id,\n       CASE \n         WHEN i.order_id IS NOT NULL AND g.order_id IS NOT NULL THEN 'Matched'\n         WHEN i.order_id IS NOT NULL THEN 'Internal Only'\n         ELSE 'Gateway Only'\n       END AS reconciliation_status\nFROM internal_orders i\nFULL OUTER JOIN gateway_charges g ON i.order_id = g.order_id;",
    hints: [
      "FULL OUTER JOIN retains rows from both tables even when there is no matching key.",
      "Use CASE WHEN with IS NOT NULL checks to classify reconciliation status.",
      "Syntax: FROM internal_orders i FULL OUTER JOIN gateway_charges g ON i.order_id = g.order_id."
    ],
    solution: "SELECT i.order_id, g.transaction_id,\n       CASE \n         WHEN i.order_id IS NOT NULL AND g.order_id IS NOT NULL THEN 'Matched'\n         WHEN i.order_id IS NOT NULL THEN 'Internal Only'\n         ELSE 'Gateway Only'\n       END AS reconciliation_status\nFROM internal_orders i\nFULL OUTER JOIN gateway_charges g ON i.order_id = g.order_id\nORDER BY COALESCE(i.order_id, g.order_id);",
    explanation: "A FULL OUTER JOIN is the canonical data reconciliation tool in SQL. CASE statements classify whether both or only one side populated.",
    commonMistakes: [
      "Assuming INNER JOIN is sufficient for reconciliation audits.",
      "Forgetting to order by a COALESCE of keys from both tables."
    ],
    interviewFollowUps: [
      {
        question: "How would you simulate FULL OUTER JOIN on MySQL (which lacks native FULL OUTER JOIN)?",
        answer: "Perform a LEFT JOIN, then a RIGHT JOIN, and combine them with UNION."
      }
    ]
  },
  {
    id: 16,
    module: "Module 4 — SQL Joins",
    type: "sql",
    difficulty: "Intermediate",
    title: "Employees Earning More Than Managers",
    skills: ["SQL Joins", "SELF JOIN", "Hierarchical Data"],
    scenario: "People Analytics is investigating team pay inversions where an individual contributor makes more base salary than their direct supervisor.",
    objective: "Perform a SELF JOIN on employees e and m (where e.manager_id = m.employee_id) to return employee_name, salary, manager_name, and manager_salary where employee salary > manager salary.",
    tables: [{ name: "employees", columns: ["employee_id INT", "name VARCHAR", "salary NUMERIC", "manager_id INT"] }],
    sampleData: {
      employees: [
        { employee_id: 1, name: "Alice", salary: 120000, manager_id: 3 },
        { employee_id: 2, name: "Bob", salary: 80000, manager_id: 3 },
        { employee_id: 3, name: "Charles", salary: 100000, manager_id: null }
      ]
    },
    expectedOutput: [
      { employee_name: "Alice", employee_salary: 120000, manager_name: "Charles", manager_salary: 100000 }
    ],
    starterCode: "SELECT e.name AS employee_name, e.salary AS employee_salary,\n       m.name AS manager_name, m.salary AS manager_salary\nFROM employees e\nJOIN employees m ON e.manager_id = m.employee_id\nWHERE ...;",
    hints: [
      "Join the employees table to itself using two distinct aliases (e for employee, m for manager).",
      "Join condition: e.manager_id = m.employee_id.",
      "Filter condition: e.salary > m.salary."
    ],
    solution: "SELECT e.name AS employee_name, e.salary AS employee_salary,\n       m.name AS manager_name, m.salary AS manager_salary\nFROM employees e\nJOIN employees m ON e.manager_id = m.employee_id\nWHERE e.salary > m.salary;",
    explanation: "A SELF JOIN pairs rows from the same table using parent-child relational foreign keys.",
    commonMistakes: [
      "Inverting the join condition (e.g., e.employee_id = m.manager_id).",
      "Using LEFT JOIN without realizing top executives with manager_id IS NULL will be excluded anyway by the salary comparison."
    ],
    interviewFollowUps: [
      {
        question: "How would you traverse multi-level management hierarchies (e.g. director -> VP -> CEO)?",
        answer: "Use Recursive CTEs (WITH RECURSIVE) to traverse arbitrary tree depths."
      }
    ]
  },
  {
    id: 17,
    module: "Module 4 — SQL Joins",
    type: "sql",
    difficulty: "Advanced",
    title: "Multi-Table Revenue by Customer & Category",
    skills: ["SQL Joins", "Multi-Table Joins", "GROUP BY", "SUM"],
    scenario: "Commercial strategy needs a breakdown of total revenue generated by customer segment across different merchandise categories.",
    objective: "Join customers, orders, order_items, and products to compute total expenditure grouped by customer_name and product_category.",
    tables: [
      { name: "customers", columns: ["customer_id INT", "customer_name VARCHAR"] },
      { name: "orders", columns: ["order_id INT", "customer_id INT"] },
      { name: "order_items", columns: ["item_id INT", "order_id INT", "product_id INT", "quantity INT", "unit_price NUMERIC"] },
      { name: "products", columns: ["product_id INT", "category VARCHAR"] }
    ],
    sampleData: {
      customers: [{ customer_id: 1, customer_name: "Maya" }],
      orders: [{ order_id: 10, customer_id: 1 }],
      order_items: [{ item_id: 1, order_id: 10, product_id: 99, quantity: 2, unit_price: 50 }],
      products: [{ product_id: 99, category: "Hardware" }]
    },
    expectedOutput: [
      { customer_name: "Maya", category: "Hardware", total_spend: 100 }
    ],
    starterCode: "SELECT c.customer_name, p.category,\n       SUM(oi.quantity * oi.unit_price) AS total_spend\nFROM customers c\nJOIN orders o ON ...\nJOIN order_items oi ON ...\nJOIN products p ON ...\nGROUP BY ...;",
    hints: [
      "Connect the entities in sequence: customers -> orders -> order_items -> products.",
      "Calculate spend per line item as quantity * unit_price.",
      "Group by customer_name and category."
    ],
    solution: "SELECT c.customer_name, p.category,\n       SUM(oi.quantity * oi.unit_price) AS total_spend\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nJOIN products p ON oi.product_id = p.product_id\nGROUP BY c.customer_name, p.category\nORDER BY total_spend DESC;",
    explanation: "Multi-table relational joins traverse normalized snowflake entities to aggregate metrics across star dimensions.",
    commonMistakes: [
      "Joining order_items directly to customers without the bridging orders table.",
      "Forgetting to multiply quantity by unit_price."
    ],
    interviewFollowUps: [
      {
        question: "How do you avoid Cartesian fan-out when joining 1-to-many tables?",
        answer: "Aggregate at the child level in a CTE before joining to parent tables, or verify unique join keys."
      }
    ]
  },

  // ==========================================
  // MODULE 5 — BUSINESS LOGIC
  // ==========================================
  {
    id: 18,
    module: "Module 5 — Business Logic",
    type: "sql",
    difficulty: "Beginner",
    title: "Customer Segmentation with CASE WHEN",
    skills: ["Business Logic", "CASE WHEN", "Segmentation"],
    scenario: "Growth marketing wants to tag customers into tiers based on cumulative lifetime spend: 'High Value' (spend >= 5000), 'Medium Value' (1000 to 4999), and 'Low Value' (< 1000).",
    objective: "Select customer_id, total_spend, and a computed column 'customer_tier' using CASE WHEN logic.",
    tables: [{ name: "customer_spend", columns: ["customer_id INT", "total_spend NUMERIC"] }],
    sampleData: {
      customer_spend: [
        { customer_id: 1, total_spend: 6200 },
        { customer_id: 2, total_spend: 2500 },
        { customer_id: 3, total_spend: 400 }
      ]
    },
    expectedOutput: [
      { customer_id: 1, total_spend: 6200, customer_tier: "High Value" },
      { customer_id: 2, total_spend: 2500, customer_tier: "Medium Value" },
      { customer_id: 3, total_spend: 400, customer_tier: "Low Value" }
    ],
    starterCode: "SELECT customer_id, total_spend,\n       CASE\n         WHEN total_spend >= 5000 THEN 'High Value'\n         WHEN total_spend >= 1000 THEN 'Medium Value'\n         ELSE 'Low Value'\n       END AS customer_tier\nFROM customer_spend;",
    hints: [
      "CASE statements evaluate top-to-bottom and stop at the first matching WHEN.",
      "Check total_spend >= 5000 first, then >= 1000, and use ELSE for the remainder.",
      "Always end with END AS column_alias."
    ],
    solution: "SELECT customer_id, total_spend,\n       CASE\n         WHEN total_spend >= 5000 THEN 'High Value'\n         WHEN total_spend >= 1000 THEN 'Medium Value'\n         ELSE 'Low Value'\n       END AS customer_tier\nFROM customer_spend\nORDER BY total_spend DESC;",
    explanation: "CASE WHEN provides deterministic conditional branching in SQL statements. It returns the value for the first true condition.",
    commonMistakes: [
      "Ordering conditions backwards (e.g. WHEN total_spend >= 1000 before 5000 catches everything >= 1000 as Medium Value).",
      "Forgetting the END keyword."
    ],
    interviewFollowUps: [
      {
        question: "Can CASE WHEN be used inside an aggregate function like SUM(CASE WHEN ...)?",
        answer: "Yes! Conditional aggregation `SUM(CASE WHEN condition THEN 1 ELSE 0 END)` is a fundamental SQL pattern for pivoting."
      }
    ]
  },
  {
    id: 19,
    module: "Module 5 — Business Logic",
    type: "sql",
    difficulty: "Beginner",
    title: "NULL Handling with COALESCE",
    skills: ["Data Cleaning", "COALESCE", "NULL Handling"],
    scenario: "Customer records contain sparse contact information. The communications system needs a primary contact method with fallback defaults.",
    objective: "Select customer_id and a single column 'contact_info' that picks mobile_phone first, work_phone second, and if both are NULL, displays 'No Phone on File'.",
    tables: [{ name: "customer_contacts", columns: ["customer_id INT", "mobile_phone VARCHAR", "work_phone VARCHAR"] }],
    sampleData: {
      customer_contacts: [
        { customer_id: 1, mobile_phone: "555-0101", work_phone: null },
        { customer_id: 2, mobile_phone: null, work_phone: "555-0202" },
        { customer_id: 3, mobile_phone: null, work_phone: null }
      ]
    },
    expectedOutput: [
      { customer_id: 1, contact_info: "555-0101" },
      { customer_id: 2, contact_info: "555-0202" },
      { customer_id: 3, contact_info: "No Phone on File" }
    ],
    starterCode: "SELECT customer_id,\n       COALESCE(...) AS contact_info\nFROM customer_contacts;",
    hints: [
      "COALESCE returns the first non-NULL value in its argument list.",
      "Pass mobile_phone, work_phone, and 'No Phone on File'.",
      "Syntax: COALESCE(mobile_phone, work_phone, 'No Phone on File')."
    ],
    solution: "SELECT customer_id,\n       COALESCE(mobile_phone, work_phone, 'No Phone on File') AS contact_info\nFROM customer_contacts\nORDER BY customer_id;",
    explanation: "COALESCE evaluates arguments sequentially from left to right, returning the first non-null expression encountered.",
    commonMistakes: [
      "Using IFNULL or NVL which only accept two parameters instead of standard SQL COALESCE.",
      "Attempting string concatenation with NULL (which results in NULL in standard SQL)."
    ],
    interviewFollowUps: [
      {
        question: "What does NULLIF(a, b) do?",
        answer: "NULLIF returns NULL if both arguments are equal (a == b), otherwise returns a. Commonly used to prevent division by zero: revenue / NULLIF(units, 0)."
      }
    ]
  },
  {
    id: 20,
    module: "Module 5 — Business Logic",
    type: "sql",
    difficulty: "Intermediate",
    title: "Employees Joined Within Previous 12 Months",
    skills: ["Date Manipulation", "Time Invariants", "Filtering"],
    scenario: "Talent acquisition needs to report on new hire retention by pulling all staff hired in the preceding 12 months relative to a benchmark date ('2026-01-01').",
    objective: "Select employee_id, first_name, and hire_date for employees where hire_date is between '2025-01-01' and '2026-01-01'.",
    tables: [{ name: "employees", columns: ["employee_id INT", "first_name VARCHAR", "hire_date DATE"] }],
    sampleData: {
      employees: [
        { employee_id: 1, first_name: "Liam", hire_date: "2025-06-15" },
        { employee_id: 2, first_name: "Noah", hire_date: "2023-04-10" },
        { employee_id: 3, first_name: "Emma", hire_date: "2025-11-20" }
      ]
    },
    expectedOutput: [
      { employee_id: 1, first_name: "Liam", hire_date: "2025-06-15" },
      { employee_id: 3, first_name: "Emma", hire_date: "2025-11-20" }
    ],
    starterCode: "SELECT employee_id, first_name, hire_date\nFROM employees\nWHERE hire_date >= '2025-01-01' AND hire_date <= '2026-01-01'\nORDER BY hire_date DESC;",
    hints: [
      "Filter dates using >= '2025-01-01' and <= '2026-01-01' or BETWEEN.",
      "ISO 8601 strings ('YYYY-MM-DD') compare lexicographically and chronologically in standard SQL.",
      "Sort by hire_date descending."
    ],
    solution: "SELECT employee_id, first_name, hire_date\nFROM employees\nWHERE hire_date >= '2025-01-01' AND hire_date <= '2026-01-01'\nORDER BY hire_date DESC;",
    explanation: "Date range comparisons using ISO 8601 formatting enable clean, indexable boundary filtering.",
    commonMistakes: [
      "Using non-standard date formats (e.g. MM/DD/YYYY) that fail string ordering.",
      "Assuming BETWEEN is exclusive (BETWEEN in SQL is inclusive of both endpoints)."
    ],
    interviewFollowUps: [
      {
        question: "How do you calculate date differences in PostgreSQL vs MySQL?",
        answer: "Postgres supports direct subtraction `date1 - date2` or `AGE()`. MySQL uses `DATEDIFF(date1, date2)`."
      }
    ]
  },
  {
    id: 21,
    module: "Module 5 — Business Logic",
    type: "sql",
    difficulty: "Intermediate",
    title: "Average Order-Processing Time",
    skills: ["Date Functions", "AVG", "Business Metrics", "Fulfillment SLA"],
    scenario: "Logistics wants to measure fulfillment efficiency by computing the average turnaround days between order placement and customer delivery.",
    objective: "Calculate the average fulfillment days as 'avg_fulfillment_days' across delivered orders from fulfillment_records.",
    tables: [{ name: "fulfillment_records", columns: ["order_id INT", "days_to_deliver INT"] }],
    sampleData: {
      fulfillment_records: [
        { order_id: 101, days_to_deliver: 3 },
        { order_id: 102, days_to_deliver: 5 },
        { order_id: 103, days_to_deliver: 4 }
      ]
    },
    expectedOutput: [
      { avg_fulfillment_days: 4.0 }
    ],
    starterCode: "SELECT AVG(days_to_deliver) AS avg_fulfillment_days\nFROM fulfillment_records;",
    hints: [
      "Use AVG(days_to_deliver) to calculate the mean duration.",
      "Make sure to cast or format if decimal precision is needed.",
      "Syntax: SELECT AVG(days_to_deliver) AS avg_fulfillment_days FROM fulfillment_records;"
    ],
    solution: "SELECT AVG(days_to_deliver) AS avg_fulfillment_days\nFROM fulfillment_records;",
    explanation: "Calculates the central tendency for fulfillment latency across orders.",
    commonMistakes: [
      "Including cancelled or undelivered orders (which skew delivery averages).",
      "Integer division truncating decimals in older database dialects."
    ],
    interviewFollowUps: [
      {
        question: "Why might median fulfillment time be a better SLA metric than average?",
        answer: "Average is heavily skewed by a few extreme delayed shipments (e.g. orders stuck in customs for 45 days). Median reflects the typical customer experience."
      }
    ]
  },
  {
    id: 22,
    module: "Module 5 — Business Logic",
    type: "sql",
    difficulty: "Intermediate",
    title: "Employees Above Company-Wide Average Salary",
    skills: ["Subqueries", "Scalar Subquery", "WHERE Filter"],
    scenario: "The leadership team wants to benchmark compensation by listing all staff earning strictly more than the overall company mean salary.",
    objective: "Select employee_id, first_name, and salary for employees earning > company average salary using a subquery.",
    tables: [{ name: "employees", columns: ["employee_id INT", "first_name VARCHAR", "salary NUMERIC"] }],
    sampleData: {
      employees: [
        { employee_id: 1, first_name: "Alice", salary: 100000 },
        { employee_id: 2, first_name: "Bob", salary: 60000 },
        { employee_id: 3, first_name: "Charlie", salary: 50000 }
      ]
    },
    expectedOutput: [
      { employee_id: 1, first_name: "Alice", salary: 100000 }
    ],
    starterCode: "SELECT employee_id, first_name, salary\nFROM employees\nWHERE salary > (...);\n",
    hints: [
      "Calculate the company-wide average in a scalar subquery: (SELECT AVG(salary) FROM employees).",
      "Compare each employee's salary against that subquery in the WHERE clause.",
      "Syntax: WHERE salary > (SELECT AVG(salary) FROM employees)."
    ],
    solution: "SELECT employee_id, first_name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees)\nORDER BY salary DESC;",
    explanation: "The inner subquery evaluates once to a single scalar value ($70,000). The outer query filters employees earning more than that threshold.",
    commonMistakes: [
      "Attempting `WHERE salary > AVG(salary)` directly (aggregate functions cannot appear directly in WHERE without a subquery).",
      "Using correlated subquery when an uncorrelated scalar subquery is much faster."
    ],
    interviewFollowUps: [
      {
        question: "What is the computational difference between correlated and uncorrelated subqueries?",
        answer: "Uncorrelated subqueries execute once for the entire query. Correlated subqueries execute once per each row evaluated by the outer query."
      }
    ]
  },

  // ==========================================
  // MODULE 6 — ADVANCED SQL
  // ==========================================
  {
    id: 23,
    module: "Module 6 — Advanced SQL",
    type: "sql",
    difficulty: "Advanced",
    title: "CTE-Based Department Performance Analysis",
    skills: ["CTEs", "Modular SQL", "Aggregation", "Ranking"],
    scenario: "Executive management wants a modular query that computes total departmental revenue and then assigns each department a performance tier.",
    objective: "Use a CTE named DeptRevenue to compute department_id and total_revenue, then in the main query output department_id, total_revenue, and rank ordered by revenue DESC.",
    tables: [{ name: "sales_records", columns: ["department_id INT", "revenue NUMERIC"] }],
    sampleData: {
      sales_records: [
        { department_id: 1, revenue: 50000 },
        { department_id: 1, revenue: 70000 },
        { department_id: 2, revenue: 80000 }
      ]
    },
    expectedOutput: [
      { department_id: 1, total_revenue: 120000, dept_rank: 1 },
      { department_id: 2, total_revenue: 80000, dept_rank: 2 }
    ],
    starterCode: "WITH DeptRevenue AS (\n  SELECT department_id, SUM(revenue) AS total_revenue\n  FROM sales_records\n  GROUP BY department_id\n)\nSELECT department_id, total_revenue,\n       RANK() OVER (ORDER BY total_revenue DESC) AS dept_rank\nFROM DeptRevenue;",
    hints: [
      "Define the CTE with `WITH DeptRevenue AS (...)`.",
      "Aggregate inside the CTE by department_id.",
      "Query from DeptRevenue and rank using RANK() OVER (ORDER BY total_revenue DESC)."
    ],
    solution: "WITH DeptRevenue AS (\n  SELECT department_id, SUM(revenue) AS total_revenue\n  FROM sales_records\n  GROUP BY department_id\n)\nSELECT department_id, total_revenue,\n       RANK() OVER (ORDER BY total_revenue DESC) AS dept_rank\nFROM DeptRevenue\nORDER BY dept_rank;",
    explanation: "Common Table Expressions (CTEs) improve readability by breaking complex multi-stage aggregations into clean, reusable temporary result sets.",
    commonMistakes: [
      "Placing a comma after the CTE closing parenthesis when only one CTE is defined.",
      "Forgetting to alias the aggregated expression inside the CTE."
    ],
    interviewFollowUps: [
      {
        question: "How do CTEs compare to temporary tables or views?",
        answer: "CTEs exist only for the scope of a single query. Views persist their definition permanently. Temp tables physically store intermediate data during a database session."
      }
    ]
  },
  {
    id: 24,
    module: "Module 6 — Advanced SQL",
    type: "sql",
    difficulty: "Intermediate",
    title: "Duplicate Customer Detection",
    skills: ["Data Quality", "Deduplication", "GROUP BY", "HAVING"],
    scenario: "Database hygiene audit requires identifying duplicate account creations sharing identical lowercase email addresses.",
    objective: "Find all email addresses that appear more than once in the users table, returning the email and duplicate count as 'email_count'.",
    tables: [{ name: "users", columns: ["user_id INT", "email VARCHAR"] }],
    sampleData: {
      users: [
        { user_id: 1, email: "alex@example.com" },
        { user_id: 2, email: "alex@example.com" },
        { user_id: 3, email: "maria@example.com" }
      ]
    },
    expectedOutput: [
      { email: "alex@example.com", email_count: 2 }
    ],
    starterCode: "SELECT email, COUNT(*) AS email_count\nFROM users\nGROUP BY email\nHAVING ...;",
    hints: [
      "Group by the candidate unique key (email).",
      "Use COUNT(*) in the HAVING clause to identify groups with more than 1 entry.",
      "Syntax: HAVING COUNT(*) > 1."
    ],
    solution: "SELECT email, COUNT(*) AS email_count\nFROM users\nGROUP BY email\nHAVING COUNT(*) > 1\nORDER BY email_count DESC;",
    explanation: "Grouping by the attribute and asserting HAVING COUNT(*) > 1 isolates non-unique records violating database uniqueness constraints.",
    commonMistakes: [
      "Filtering in WHERE (WHERE cannot count occurrences across rows).",
      "Not standardizing case (e.g. `LOWER(email)` in production data)."
    ],
    interviewFollowUps: [
      {
        question: "How would you find the full user rows associated with duplicate emails?",
        answer: "Use `COUNT(*) OVER (PARTITION BY email)` or join the duplicate list back to the users table."
      }
    ]
  },
  {
    id: 25,
    module: "Module 6 — Advanced SQL",
    type: "sql",
    difficulty: "Advanced",
    title: "Deduplicate While Retaining Latest Record",
    skills: ["Deduplication", "ROW_NUMBER", "PARTITION BY", "Data Pipeline"],
    scenario: "During an ELT pipeline migration, a staging table contains duplicate customer records. You must deduplicate them by keeping only the most recently updated record for each email.",
    objective: "Select customer_id, email, and updated_at for only the newest record per email using ROW_NUMBER().",
    tables: [{ name: "customer_staging", columns: ["customer_id INT", "email VARCHAR", "updated_at TIMESTAMP"] }],
    sampleData: {
      customer_staging: [
        { customer_id: 1, email: "test@site.com", updated_at: "2026-01-01 10:00:00" },
        { customer_id: 2, email: "test@site.com", updated_at: "2026-01-02 12:00:00" },
        { customer_id: 3, email: "user@site.com", updated_at: "2026-01-01 09:00:00" }
      ]
    },
    expectedOutput: [
      { customer_id: 2, email: "test@site.com", updated_at: "2026-01-02 12:00:00" },
      { customer_id: 3, email: "user@site.com", updated_at: "2026-01-01 09:00:00" }
    ],
    starterCode: "WITH Deduplicated AS (\n  SELECT customer_id, email, updated_at,\n         ROW_NUMBER() OVER (...) as rn\n  FROM customer_staging\n)\nSELECT customer_id, email, updated_at\nFROM Deduplicated\nWHERE ...;",
    hints: [
      "Partition by email so each email has its own independent numbering.",
      "Order by updated_at DESC so the latest timestamp receives rank 1.",
      "Filter the CTE where rn = 1."
    ],
    solution: "WITH Deduplicated AS (\n  SELECT customer_id, email, updated_at,\n         ROW_NUMBER() OVER (PARTITION BY email ORDER BY updated_at DESC) as rn\n  FROM customer_staging\n)\nSELECT customer_id, email, updated_at\nFROM Deduplicated\nWHERE rn = 1\nORDER BY customer_id;",
    explanation: "ROW_NUMBER() OVER (PARTITION BY email ORDER BY updated_at DESC) guarantees that exactly one record per email receives rn = 1, achieving clean deduplication.",
    commonMistakes: [
      "Using RANK() instead of ROW_NUMBER() (if two duplicates share the exact same updated_at, RANK would keep both).",
      "Sorting ASC which keeps the oldest stale record instead of the freshest."
    ],
    interviewFollowUps: [
      {
        question: "How would you write a DELETE statement using this logic to remove duplicates from a table?",
        answer: "DELETE FROM customer_staging WHERE customer_id IN (SELECT customer_id FROM Deduplicated WHERE rn > 1)."
      }
    ]
  },

  // ==========================================
  // MODULE 7 — PYTHON / PANDAS
  // ==========================================
  {
    id: 26,
    module: "Module 7 — Python / Pandas",
    type: "python",
    difficulty: "Intermediate",
    title: "Missing-Value Detection & Median Imputation",
    skills: ["Python", "Pandas", "Data Cleaning", "Imputation"],
    scenario: "Data quality analysis detected NULL values in customer transaction amounts. Business rules require imputing missing values with the median transaction amount to prevent outlier distortion.",
    objective: "Given DataFrame df with column 'purchase_amount', impute missing values using the median of 'purchase_amount'.",
    tables: [{ name: "df", columns: ["customer_id", "purchase_amount"] }],
    sampleData: {
      df: [
        { customer_id: 1, purchase_amount: 100 },
        { customer_id: 2, purchase_amount: null },
        { customer_id: 3, purchase_amount: 200 },
        { customer_id: 4, purchase_amount: 300 }
      ]
    },
    expectedOutput: [
      { customer_id: 1, purchase_amount: 100 },
      { customer_id: 2, purchase_amount: 200 },
      { customer_id: 3, purchase_amount: 200 },
      { customer_id: 4, purchase_amount: 300 }
    ],
    starterCode: "# Impute missing purchase_amount using median\nimport pandas as pd\n\ndf['purchase_amount'] = df['purchase_amount'].fillna(...) ",
    hints: [
      "Calculate the median with df['purchase_amount'].median().",
      "Fill missing entries using .fillna().",
      "Syntax: df['purchase_amount'] = df['purchase_amount'].fillna(df['purchase_amount'].median())"
    ],
    solution: "df['purchase_amount'] = df['purchase_amount'].fillna(df['purchase_amount'].median())",
    explanation: "Median imputation preserves numerical robust center without being skewed by extreme values, filling NaNs cleanly.",
    commonMistakes: [
      "Forgetting to reassign back to df['purchase_amount'] without inplace=True.",
      "Using mean() on skewed transaction data."
    ],
    interviewFollowUps: [
      {
        question: "When is mean imputation preferable over median?",
        answer: "Only when data is strictly normally distributed without significant outliers."
      }
    ]
  },
  {
    id: 27,
    module: "Module 7 — Python / Pandas",
    type: "python",
    difficulty: "Beginner",
    title: "Pandas GroupBy Revenue by Category",
    skills: ["Python", "Pandas", "Aggregation", "GroupBy"],
    scenario: "You are preparing a revenue summary report. Group transaction line items by product category to calculate total sales.",
    objective: "Write a Pandas expression to group df by 'category' and calculate the sum of 'revenue', returning a DataFrame with category and total revenue.",
    tables: [{ name: "df", columns: ["category", "revenue"] }],
    sampleData: {
      df: [
        { category: "Books", revenue: 40 },
        { category: "Books", revenue: 60 },
        { category: "Electronics", revenue: 150 }
      ]
    },
    expectedOutput: [
      { category: "Books", revenue: 100 },
      { category: "Electronics", revenue: 150 }
    ],
    starterCode: "summary = df.groupby('category')['revenue'].sum().reset_index()",
    hints: [
      "Use df.groupby('category')['revenue'].sum().",
      "Append .reset_index() to convert the grouped index back into a column.",
      "Syntax: df.groupby('category')['revenue'].sum().reset_index()"
    ],
    solution: "summary = df.groupby('category')['revenue'].sum().reset_index()",
    explanation: "groupby('category')['revenue'].sum() calculates group aggregates and reset_index() restores standard DataFrame tabular columns.",
    commonMistakes: [
      "Forgetting .reset_index() resulting in a Series with MultiIndex.",
      "Applying sum() to non-numeric columns."
    ],
    interviewFollowUps: [
      {
        question: "How do you calculate multiple aggregates at once (e.g. sum AND mean)?",
        answer: "Use `.agg(['sum', 'mean'])` or `.agg({'revenue': 'sum', 'units': 'mean'})`."
      }
    ]
  },
  {
    id: 28,
    module: "Module 7 — Python / Pandas",
    type: "python",
    difficulty: "Intermediate",
    title: "Pandas Merge Customer & Transaction Data",
    skills: ["Python", "Pandas", "Merge", "Relational Joins"],
    scenario: "Customer demographic records and e-commerce order logs are stored in separate CSVs. Merge them to prepare a consolidated dataset for analysis.",
    objective: "Perform a left merge of customers_df with orders_df on 'customer_id' so all customers are retained.",
    tables: [
      { name: "customers_df", columns: ["customer_id", "name"] },
      { name: "orders_df", columns: ["order_id", "customer_id", "amount"] }
    ],
    sampleData: {
      customers_df: [
        { customer_id: 1, name: "Zara" },
        { customer_id: 2, name: "Ken" }
      ],
      orders_df: [
        { order_id: 10, customer_id: 1, amount: 250 }
      ]
    },
    expectedOutput: [
      { customer_id: 1, name: "Zara", order_id: 10, amount: 250 },
      { customer_id: 2, name: "Ken", order_id: null, amount: null }
    ],
    starterCode: "merged_df = pd.merge(customers_df, orders_df, on='customer_id', how='left')",
    hints: [
      "Use pd.merge(left_df, right_df, on='key', how='left').",
      "Setting how='left' guarantees all customers appear even if they placed no orders.",
      "Syntax: pd.merge(customers_df, orders_df, on='customer_id', how='left')"
    ],
    solution: "merged_df = pd.merge(customers_df, orders_df, on='customer_id', how='left')",
    explanation: "pd.merge executes relational set algebra in Pandas. The left merge preserves all customer keys, populating un-ordered fields with NaN.",
    commonMistakes: [
      "Using pd.concat() instead of pd.merge() for relational key joins.",
      "Defaulting to inner join (how='inner') and silently dropping non-purchasing customers."
    ],
    interviewFollowUps: [
      {
        question: "What parameter handles mismatched column join names in pd.merge?",
        answer: "Use `left_on='user_id'` and `right_on='customer_id'`."
      }
    ]
  },

  // ==========================================
  // MODULE 8 — STATISTICS
  // ==========================================
  {
    id: 29,
    module: "Module 8 — Statistics",
    type: "sql",
    difficulty: "Intermediate",
    title: "Descriptive Statistics: Central Tendency & Outlier Inspection",
    skills: ["Statistics", "IQR", "Standard Deviation", "Skewness"],
    scenario: "Risk management is analyzing transaction distributions to establish fraud detection thresholds. Right-skewed transaction amounts must be benchmarked.",
    objective: "Compute count, average, minimum, maximum, and standard deviation of transaction amount from the transactions table.",
    tables: [{ name: "transactions", columns: ["txn_id INT", "amount NUMERIC"] }],
    sampleData: {
      transactions: [
        { txn_id: 1, amount: 20 },
        { txn_id: 2, amount: 30 },
        { txn_id: 3, amount: 40 },
        { txn_id: 4, amount: 1500 }
      ]
    },
    expectedOutput: [
      { total_txns: 4, avg_amount: 397.5, min_amount: 20, max_amount: 1500 }
    ],
    starterCode: "SELECT COUNT(*) AS total_txns,\n       AVG(amount) AS avg_amount,\n       MIN(amount) AS min_amount,\n       MAX(amount) AS max_amount\nFROM transactions;",
    hints: [
      "Aggregate metrics across the entire table using COUNT, AVG, MIN, MAX.",
      "Notice how the single outlier ($1500) inflates the average from ~$30 to ~$397.",
      "Syntax: SELECT COUNT(*) AS total_txns, AVG(amount) AS avg_amount, MIN(amount) AS min_amount, MAX(amount) AS max_amount FROM transactions;"
    ],
    solution: "SELECT COUNT(*) AS total_txns,\n       AVG(amount) AS avg_amount,\n       MIN(amount) AS min_amount,\n       MAX(amount) AS max_amount\nFROM transactions;",
    explanation: "Summarizes five-point distribution properties. In the presence of high positive skew, average ($397.5) does not represent the typical customer ($30).",
    commonMistakes: [
      "Relying solely on average without checking min/max or standard deviation.",
      "Assuming outliers are always data entry errors rather than genuine high-value events."
    ],
    interviewFollowUps: [
      {
        question: "How does a Box Plot define outlier boundaries mathematically?",
        answer: "Lower Bound = Q1 - 1.5 × IQR. Upper Bound = Q3 + 1.5 × IQR, where IQR = Q3 - Q1."
      }
    ]
  },

  // ==========================================
  // MODULE 9 — FINAL CASE STUDY
  // ==========================================
  {
    id: 30,
    module: "Module 9 — Final Case Study",
    type: "case_study",
    difficulty: "Advanced",
    title: "End-to-End Commercial Analytics Case Study",
    skills: ["Full SQL Stack", "CTEs", "Window Functions", "LAG", "Business Interpretation"],
    scenario: "Executive leadership at an omnichannel enterprise is conducting their annual strategic business review. Management wants to understand sales performance, customer behavior, product performance, and month-over-month growth. Analyze the available data across orders, order_items, and products to extract revenue, order counts, and MoM trend.",
    objective: "Write a multi-step analytical CTE that aggregates monthly gross revenue and computes Month-over-Month growth percentage and cumulative annual revenue.",
    tables: [
      { name: "orders", columns: ["order_id INT", "customer_id INT", "order_date DATE"] },
      { name: "order_items", columns: ["item_id INT", "order_id INT", "product_id INT", "quantity INT", "unit_price NUMERIC"] },
      { name: "products", columns: ["product_id INT", "category VARCHAR"] }
    ],
    sampleData: {
      orders: [
        { order_id: 1, customer_id: 101, order_date: "2026-01-10" },
        { order_id: 2, customer_id: 102, order_date: "2026-01-25" },
        { order_id: 3, customer_id: 103, order_date: "2026-02-15" }
      ],
      order_items: [
        { item_id: 1, order_id: 1, product_id: 10, quantity: 2, unit_price: 50 },
        { item_id: 2, order_id: 2, product_id: 20, quantity: 1, unit_price: 100 },
        { item_id: 3, order_id: 3, product_id: 10, quantity: 3, unit_price: 50 }
      ],
      products: [
        { product_id: 10, category: "Apparel" },
        { product_id: 20, category: "Accessories" }
      ]
    },
    expectedOutput: [
      { sale_month: "2026-01", monthly_revenue: 200, cumulative_revenue: 200, mom_growth: null },
      { sale_month: "2026-02", monthly_revenue: 150, cumulative_revenue: 350, mom_growth: -25.0 }
    ],
    starterCode: "WITH MonthlySales AS (\n  SELECT SUBSTR(o.order_date, 1, 7) AS sale_month,\n         SUM(oi.quantity * oi.unit_price) AS monthly_revenue\n  FROM orders o\n  JOIN order_items oi ON o.order_id = oi.order_id\n  GROUP BY SUBSTR(o.order_date, 1, 7)\n)\nSELECT sale_month, monthly_revenue,\n       SUM(monthly_revenue) OVER (ORDER BY sale_month) AS cumulative_revenue,\n       ROUND(((monthly_revenue - LAG(monthly_revenue) OVER (ORDER BY sale_month)) * 100.0) / LAG(monthly_revenue) OVER (ORDER BY sale_month), 1) AS mom_growth\nFROM MonthlySales\nORDER BY sale_month;",
    hints: [
      "First aggregate revenue at the monthly level using a CTE.",
      "In the outer query, use SUM() OVER (ORDER BY sale_month) for cumulative revenue.",
      "Use LAG(monthly_revenue) OVER (ORDER BY sale_month) to calculate MoM growth: (current - prev) * 100.0 / prev."
    ],
    solution: "WITH MonthlySales AS (\n  SELECT SUBSTR(o.order_date, 1, 7) AS sale_month,\n         SUM(oi.quantity * oi.unit_price) AS monthly_revenue\n  FROM orders o\n  JOIN order_items oi ON o.order_id = oi.order_id\n  GROUP BY SUBSTR(o.order_date, 1, 7)\n)\nSELECT sale_month, monthly_revenue,\n       SUM(monthly_revenue) OVER (ORDER BY sale_month) AS cumulative_revenue,\n       ROUND(((monthly_revenue - LAG(monthly_revenue) OVER (ORDER BY sale_month)) * 100.0) / LAG(monthly_revenue) OVER (ORDER BY sale_month), 1) AS mom_growth\nFROM MonthlySales\nORDER BY sale_month;",
    explanation: "Demonstrates enterprise analytics mastery by combining relational multi-table joins, aggregation, CTEs, cumulative window frames, and lag-based growth rate metrics in a single production query.",
    commonMistakes: [
      "Calculating cumulative sums before grouping months (causes inflated double-counting).",
      "Failing to multiply by 100.0 in SQL causing integer truncation on percentage calculation."
    ],
    interviewFollowUps: [
      {
        question: "How would you explain a negative MoM growth (-25%) to non-technical business stakeholders?",
        answer: "Frame findings around drivers: 'While cumulative year-to-date revenue reached $350, February saw a 25% dip compared to January due to post-holiday seasonality. Customer re-engagement campaigns should focus on high-margin Apparel products.'"
      }
    ]
  }
];
