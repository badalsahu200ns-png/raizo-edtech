import uuid
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from agents.base import BaseAgent
from agents.roadmap_agent import RoadmapNode, RoadmapDAG


class AdaptationAction(BaseModel):
    action_type: str  # "INSERT_REMEDIATION", "UNLOCK_NEXT_MILESTONE", "ASSIGN_PRACTICE", "TRIGGER_MENTOR_REVIEW"
    target_node_id: str
    target_skill_id: str
    root_cause: str
    inserted_node: Optional[RoadmapNode] = None
    affected_nodes: List[str] = []
    explanation: str


class AdaptationResult(BaseModel):
    success: bool
    adaptation_id: str
    action_taken: str
    message: str
    updated_roadmap: RoadmapDAG
    adaptation_action: AdaptationAction


class AdaptationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Adaptation Agent",
            role_description="Dynamically re-routes the learner's DAG roadmap by injecting prerequisite remediation nodes and unlocking verified milestones."
        )

    def adapt_roadmap_after_evaluation(
        self,
        current_dag: RoadmapDAG,
        evaluated_node_id: str,
        evaluation_result: Dict[str, Any],
        failure_count: int = 1
    ) -> AdaptationResult:
        """
        Dynamically adapts the roadmap based on evaluation:
        - If score < 50: Injects prerequisite remediation node immediately before the failing node
        - If score between 50 and 69: Keeps node in 'needs_remediation' / 'in_progress', generates targeted practice
        - If score >= 70: Marks node 'passed', unlocks subsequent dependent nodes in the DAG
        """
        def _execute():
            nodes = current_dag.nodes
            node_map = {n.id: n for n in nodes}
            target_node = node_map.get(evaluated_node_id)

            if not target_node:
                raise ValueError(f"Node {evaluated_node_id} not found in roadmap DAG")

            score = evaluation_result.get("overall_score", 0)
            status = evaluation_result.get("status", "needs_remediation")
            weaknesses = evaluation_result.get("identified_weaknesses", [])
            root_cause = evaluation_result.get("root_cause_prerequisite") or (weaknesses[0] if weaknesses else "Foundational Concept")

            adaptation_id = f"adapt_{uuid.uuid4().hex[:8]}"

            if score >= 70:
                # Milestone Passed -> Unlock successors
                target_node.status = "passed"
                target_node.score = score
                target_node.confidence = evaluation_result.get("confidence", "high")

                unlocked_ids = []
                for n in nodes:
                    if target_node.id in n.prerequisites and n.status == "locked":
                        # Check if all other prerequisites are also passed
                        all_prereqs_good = True
                        for pid in n.prerequisites:
                            p_node = node_map.get(pid)
                            if not p_node or p_node.status not in ["passed", "completed"]:
                                all_prereqs_good = False
                                break
                        if all_prereqs_good:
                            n.status = "available"
                            unlocked_ids.append(n.id)

                action = AdaptationAction(
                    action_type="UNLOCK_NEXT_MILESTONE",
                    target_node_id=target_node.id,
                    target_skill_id=target_node.skill_id,
                    root_cause="Prerequisites satisfied with verified competency",
                    affected_nodes=unlocked_ids,
                    explanation=f"Passed '{target_node.title}' with {score}%. Successfully unlocked dependent milestone(s): {', '.join(unlocked_ids) or 'None'}."
                )
                msg = f"Milestone passed ({score}%). Roadmap updated to unlock next learning objectives."

            elif score < 50:
                # Failed Checkpoint -> Insert Prerequisite Remediation Node
                target_node.status = "needs_remediation"
                target_node.score = score

                # Check if remediation node already exists
                remediation_node_id = f"rem_{target_node.id}_{uuid.uuid4().hex[:4]}"
                existing_remediation = any(n.remediation_for_node_id == target_node.id for n in nodes)

                inserted_node = None
                affected_ids = [target_node.id]

                if not existing_remediation:
                    inserted_node = RoadmapNode(
                        id=remediation_node_id,
                        title=f"Remediation: {root_cause.replace('_', ' ').title()}",
                        skill_id=target_node.skill_id,
                        sub_skill_id=weaknesses[0] if weaknesses else target_node.sub_skill_id,
                        category=target_node.category,
                        description=f"Targeted remediation to resolve diagnosed conceptual weakness in {root_cause}.",
                        learning_objective=f"Analyze and correct common misconceptions in {root_cause} with guided practice.",
                        difficulty="Intermediate",
                        estimated_duration_minutes=30,
                        prerequisites=list(target_node.prerequisites),  # inherit same prerequisites
                        status="available",  # immediately available to study!
                        is_remediation=True,
                        remediation_for_node_id=target_node.id,
                        resource_ids=["res_pandas_missing_rem"] if "missing" in root_cause.lower() else target_node.resource_ids,
                        week_assigned=target_node.week_assigned,
                        day_assigned="Remediation Slot",
                        order_index=target_node.order_index
                    )

                    # Update target node to require the remediation node
                    target_node.prerequisites.append(remediation_node_id)
                    target_node.status = "locked"  # Lock target node until remediation passes!

                    # Insert immediately before target node in order
                    target_idx = nodes.index(target_node)
                    nodes.insert(target_idx, inserted_node)

                # Re-lock any dependent downstream nodes
                for n in nodes:
                    if target_node.id in n.prerequisites and n.status == "available":
                        n.status = "locked"
                        affected_ids.append(n.id)

                action = AdaptationAction(
                    action_type="INSERT_REMEDIATION",
                    target_node_id=target_node.id,
                    target_skill_id=target_node.skill_id,
                    root_cause=root_cause,
                    inserted_node=inserted_node,
                    affected_nodes=affected_ids,
                    explanation=f"Evaluator identified root weakness '{root_cause}' (Score: {score}%). Automatically inserted targeted remediation node into your DAG roadmap."
                )
                msg = f"Remediation inserted. We have adjusted your path to master '{root_cause}' before continuing."

            else:
                # Developing (50-69%) -> Assign targeted practice
                target_node.status = "in_progress"
                target_node.score = score

                action = AdaptationAction(
                    action_type="ASSIGN_PRACTICE",
                    target_node_id=target_node.id,
                    target_skill_id=target_node.skill_id,
                    root_cause=root_cause,
                    affected_nodes=[target_node.id],
                    explanation=f"Scored {score}% (Developing). Assigned 3 targeted practice exercises to strengthen {', '.join(weaknesses) or root_cause}."
                )
                msg = f"Progressing well ({score}%). Complete targeted practice to reach the 70% proficiency threshold."

            # Update completion counts
            completed = sum(1 for n in nodes if n.status in ["passed", "completed"])
            current_dag.completed_nodes_count = completed
            current_dag.total_nodes_count = len(nodes)
            current_dag.completion_percentage = int((completed / len(nodes)) * 100) if nodes else 0

            return AdaptationResult(
                success=True,
                adaptation_id=adaptation_id,
                action_taken=action.action_type,
                message=msg,
                updated_roadmap=current_dag,
                adaptation_action=action
            )

        return self.execute_with_audit(
            action_name="adapt_roadmap",
            input_summary=f"Node: {evaluated_node_id}, Score: {evaluation_result.get('overall_score')}%",
            func=_execute
        )
