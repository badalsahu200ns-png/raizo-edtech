import uuid
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from agents.base import BaseAgent


class RoadmapNode(BaseModel):
    id: str
    title: str
    skill_id: str
    sub_skill_id: Optional[str] = None
    category: str
    description: str
    learning_objective: str  # Actionable Bloom's verb
    difficulty: str  # "Beginner", "Intermediate", "Advanced"
    estimated_duration_minutes: int
    prerequisites: List[str] = []  # IDs of predecessor nodes
    status: str = "locked"  # "locked", "available", "in_progress", "needs_remediation", "passed", "completed"
    score: Optional[int] = None
    confidence: str = "low"  # "low", "medium", "high"
    is_remediation: bool = False
    remediation_for_node_id: Optional[str] = None
    resource_ids: List[str] = []
    assessment_id: Optional[str] = None
    week_assigned: int = 1
    day_assigned: str = "Monday"
    order_index: int = 0


class WeeklyPlanDay(BaseModel):
    day: str  # "Monday", "Tuesday", etc.
    nodes: List[RoadmapNode]
    total_minutes: int


class WeeklyPlan(BaseModel):
    week_number: int
    days: List[WeeklyPlanDay]
    total_hours: float
    focus_skills: List[str]


class RoadmapDAG(BaseModel):
    roadmap_id: str
    target_role: str
    user_id: str
    weekly_hours_available: float
    target_timeline_months: int
    nodes: List[RoadmapNode]
    weekly_plans: List[WeeklyPlan]
    completed_nodes_count: int
    total_nodes_count: int
    completion_percentage: int


class RoadmapAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Roadmap Planner",
            role_description="Constructs and adapts prerequisite-aware Directed Acyclic Graphs (DAG) and weekly study plans."
        )

    def generate_initial_roadmap(
        self,
        user_id: str,
        target_role: str = "data_analyst",
        verified_skills: Optional[Dict[str, Dict[str, Any]]] = None,
        weekly_hours: float = 8.0,
        timeline_months: int = 4
    ) -> RoadmapDAG:
        """Construct the canonical prerequisite-aware DAG for Data Analyst."""
        def _execute():
            v_skills = verified_skills or {}

            # Canonical nodes with Bloom's taxonomy verbs and strict prerequisite chains
            raw_nodes = [
                # SQL Branch
                RoadmapNode(
                    id="node_sql_fund",
                    title="SQL Fundamentals & Filtering",
                    skill_id="sql_fundamentals",
                    category="Relational Data Querying & SQL",
                    description="Master relational schemas, compound WHERE clauses, and boolean filtering logic.",
                    learning_objective="Understand relational database models and write robust multi-condition SELECT queries.",
                    difficulty="Beginner",
                    estimated_duration_minutes=45,
                    prerequisites=[],
                    status="available",
                    resource_ids=["res_sql_filtering"],
                    order_index=1
                ),
                RoadmapNode(
                    id="node_sql_joins",
                    title="Multi-Table Relational JOINs",
                    skill_id="sql_joins",
                    category="Relational Data Querying & SQL",
                    description="Combine disparate entities across normalized database schemas with proper null handling.",
                    learning_objective="Apply INNER, LEFT, and FULL OUTER joins while preventing Cartesian fan-out duplicates.",
                    difficulty="Intermediate",
                    estimated_duration_minutes=60,
                    prerequisites=["node_sql_fund"],
                    status="locked",
                    resource_ids=["res_sql_joins"],
                    order_index=2
                ),
                RoadmapNode(
                    id="node_sql_agg",
                    title="SQL Aggregation & Grouping",
                    skill_id="sql_aggregation",
                    category="Relational Data Querying & SQL",
                    description="Synthesize transactional activity into regional and monthly metrics with HAVING filters.",
                    learning_objective="Apply GROUP BY aggregations and HAVING clauses to calculate business sums and averages.",
                    difficulty="Intermediate",
                    estimated_duration_minutes=60,
                    prerequisites=["node_sql_joins"],
                    status="locked",
                    resource_ids=["res_sql_agg"],
                    order_index=3
                ),
                RoadmapNode(
                    id="node_sql_window",
                    title="SQL Window Functions",
                    skill_id="sql_window_functions",
                    category="Relational Data Querying & SQL",
                    description="Perform advanced analytical partitioning, rankings, and lead/lag calculations.",
                    learning_objective="Analyze partitioned row sequences using ROW_NUMBER, DENSE_RANK, and LAG/LEAD running totals.",
                    difficulty="Advanced",
                    estimated_duration_minutes=75,
                    prerequisites=["node_sql_agg"],
                    status="locked",
                    resource_ids=["res_sql_window"],
                    order_index=4
                ),

                # Python & Pandas Branch
                RoadmapNode(
                    id="node_py_fund",
                    title="Python Core for Analytics",
                    skill_id="python_fundamentals",
                    category="Python Programming & Analytics",
                    description="Fundamental data structures, dictionary lookups, list comprehensions, and defensive programming.",
                    learning_objective="Understand Python collections and write modular functions with defensive error handling.",
                    difficulty="Beginner",
                    estimated_duration_minutes=60,
                    prerequisites=[],
                    status="available",
                    resource_ids=["res_python_core"],
                    order_index=5
                ),
                RoadmapNode(
                    id="node_pandas_manip",
                    title="Pandas DataFrame Manipulation",
                    skill_id="pandas_data_manipulation",
                    category="Python Programming & Analytics",
                    description="Load CSV/JSON data, slice using .loc/.iloc, and reshape datasets using pivot tables.",
                    learning_objective="Apply multi-index indexing, boolean masking, and grouping transformations on tabular data.",
                    difficulty="Intermediate",
                    estimated_duration_minutes=75,
                    prerequisites=["node_py_fund"],
                    status="locked",
                    resource_ids=["res_pandas_intro"],
                    order_index=6
                ),
                RoadmapNode(
                    id="node_pandas_cleaning",
                    title="Applied Data Cleaning & Imputation",
                    skill_id="pandas_data_cleaning",
                    category="Python Programming & Analytics",
                    description="Detect anomalies, handle missing values (MCAR/MAR), and cast inconsistent datatypes.",
                    learning_objective="Analyze data quality issues and apply forward-fill and median imputation pipelines.",
                    difficulty="Intermediate",
                    estimated_duration_minutes=80,
                    prerequisites=["node_pandas_manip"],
                    status="locked",
                    resource_ids=["res_pandas_cleaning"],
                    order_index=7
                ),

                # Statistics & Visualization Branch
                RoadmapNode(
                    id="node_stats_eda",
                    title="Descriptive Statistics & Outlier Detection",
                    skill_id="descriptive_statistics",
                    category="Applied Statistics & EDA",
                    description="Calculate measures of spread, skewness, and isolate anomalous observations via IQR.",
                    learning_objective="Evaluate transaction distributions using IQR and Tukey fences to identify true outliers.",
                    difficulty="Intermediate",
                    estimated_duration_minutes=60,
                    prerequisites=["node_pandas_cleaning"],
                    status="locked",
                    resource_ids=["res_stats_scipy"],
                    order_index=8
                ),
                RoadmapNode(
                    id="node_powerbi_viz",
                    title="Power BI Modeling & KPI Storytelling",
                    skill_id="power_bi_tableau",
                    category="Data Visualization & BI",
                    description="Design dimensional Star Schemas, write DAX measures, and author executive dashboards.",
                    learning_objective="Create an interactive Star Schema dashboard calculating Year-to-Date revenue measures.",
                    difficulty="Advanced",
                    estimated_duration_minutes=90,
                    prerequisites=["node_sql_agg", "node_stats_eda"],
                    status="locked",
                    resource_ids=["res_powerbi_modeling"],
                    order_index=9
                ),

                # Capstone Project
                RoadmapNode(
                    id="node_capstone",
                    title="Analytics Capstone: E-Commerce Revenue Intelligence",
                    skill_id="business_analytics",
                    category="Business Acumen",
                    description="End-to-end integration: clean raw transaction logs, write SQL aggregations, build KPIs, and present executive insights.",
                    learning_objective="Evaluate business growth levers and create a full analytics pipeline with executive summary.",
                    difficulty="Advanced",
                    estimated_duration_minutes=180,
                    prerequisites=["node_sql_window", "node_pandas_cleaning", "node_powerbi_viz"],
                    status="locked",
                    order_index=10
                )
            ]

            # Re-evaluate statuses against verified skills
            for node in raw_nodes:
                skill_meta = v_skills.get(node.skill_id, {})
                curr_score = skill_meta.get("score", 0)
                is_verified = skill_meta.get("verified", False)

                if is_verified and curr_score >= 75:
                    node.status = "passed"
                    node.score = curr_score
                    node.confidence = skill_meta.get("confidence", "high")

            # Apply topological unlocking
            self._update_node_unlocks(raw_nodes)

            # Generate weekly schedule
            weekly_plans = self._generate_weekly_schedule(raw_nodes, weekly_hours)

            completed = sum(1 for n in raw_nodes if n.status in ["passed", "completed"])
            pct = int((completed / len(raw_nodes)) * 100) if raw_nodes else 0

            return RoadmapDAG(
                roadmap_id=f"dag_{uuid.uuid4().hex[:8]}",
                target_role=target_role,
                user_id=user_id,
                weekly_hours_available=weekly_hours,
                target_timeline_months=timeline_months,
                nodes=raw_nodes,
                weekly_plans=weekly_plans,
                completed_nodes_count=completed,
                total_nodes_count=len(raw_nodes),
                completion_percentage=pct
            )

        return self.execute_with_audit(
            action_name="generate_roadmap_dag",
            input_summary=f"User: {user_id}, Role: {target_role}, Hours: {weekly_hours}h/wk",
            func=_execute
        )

    def _update_node_unlocks(self, nodes: List[RoadmapNode]):
        """Unlock nodes whose prerequisites have all achieved 'passed' or 'completed'."""
        node_map = {n.id: n for n in nodes}
        for node in nodes:
            if node.status in ["passed", "completed", "needs_remediation"]:
                continue

            all_prereqs_met = True
            for pid in node.prerequisites:
                prereq = node_map.get(pid)
                if not prereq or prereq.status not in ["passed", "completed"]:
                    all_prereqs_met = False
                    break

            if all_prereqs_met:
                if node.status == "locked":
                    node.status = "available"
            else:
                node.status = "locked"

    def _generate_weekly_schedule(self, nodes: List[RoadmapNode], weekly_hours: float) -> List[WeeklyPlan]:
        """Distribute nodes into sequential weekly blocks based on time constraints."""
        max_minutes_per_week = int(weekly_hours * 60)
        days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        
        weekly_plans: List[WeeklyPlan] = []
        current_week = 1
        current_week_minutes = 0
        current_day_index = 0

        current_days: List[WeeklyPlanDay] = [WeeklyPlanDay(day=d, nodes=[], total_minutes=0) for d in days_of_week]
        focus_skills = set()

        for node in nodes:
            duration = node.estimated_duration_minutes
            if current_week_minutes + duration > max_minutes_per_week and current_week_minutes > 0:
                # Wrap week
                weekly_plans.append(WeeklyPlan(
                    week_number=current_week,
                    days=[d for d in current_days if d.nodes],
                    total_hours=round(current_week_minutes / 60, 1),
                    focus_skills=list(focus_skills)
                ))
                current_week += 1
                current_week_minutes = 0
                current_day_index = 0
                current_days = [WeeklyPlanDay(day=d, nodes=[], total_minutes=0) for d in days_of_week]
                focus_skills = set()

            # Assign to current day
            day_slot = current_days[current_day_index % len(days_of_week)]
            node.week_assigned = current_week
            node.day_assigned = day_slot.day
            day_slot.nodes.append(node)
            day_slot.total_minutes += duration
            current_week_minutes += duration
            current_day_index += 1
            focus_skills.add(node.skill_id)

        if current_week_minutes > 0:
            weekly_plans.append(WeeklyPlan(
                week_number=current_week,
                days=[d for d in current_days if d.nodes],
                total_hours=round(current_week_minutes / 60, 1),
                focus_skills=list(focus_skills)
            ))

        return weekly_plans
