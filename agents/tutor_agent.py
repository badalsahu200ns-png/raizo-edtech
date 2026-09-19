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


class TutorAgent(BaseAgent):
    def __init__(self, knowledge_file_path: Optional[str] = None):
        super().__init__(
            name="Adaptive Tutor",
            role_description="Context-aware adaptive tutor supporting Socratic dialogues, RAG-grounded explanations, and verified source citations."
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

    def retrieve_relevant_documents(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        """Hybrid keyword and token match retrieval over curated curriculum documents."""
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
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> TutorMessage:
        """
        Generate grounded response based on mode, learner context, and retrieved RAG materials.
        """
        def _execute():
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

            # Context synthesis
            weakness_str = ", ".join(current_weaknesses) if current_weaknesses else "none currently flagged"
            node_title = current_node.get("title", "Data Analysis") if current_node else "General Analytics"
            learner_name = learner_profile.get("name", "Learner") if learner_profile else "Learner"

            # Check if user has Gemini API configured
            if self.api_key:
                try:
                    return self._generate_gemini_response(
                        user_message, mode, node_title, weakness_str, docs, sources
                    )
                except Exception:
                    pass  # Fall back seamlessly to deterministic engine

            # Deterministic, high-fidelity pedagogical response engine
            return self._generate_deterministic_response(
                user_message, mode, node_title, weakness_str, learner_name, docs, sources
            )

        return self.execute_with_audit(
            action_name="generate_tutor_response",
            input_summary=f"Mode: {mode}, Query: '{user_message[:50]}...'",
            func=_execute
        )

    def _generate_deterministic_response(
        self,
        query: str,
        mode: str,
        node_title: str,
        weaknesses: str,
        name: str,
        docs: List[Dict[str, Any]],
        sources: List[SourceCitation]
    ) -> TutorMessage:
        q_lower = query.lower()
        content = ""
        follow_ups = []

        # Check for Socratic dialogue on common analytics concepts
        if mode == "socratic":
            if "window" in q_lower or "partition" in q_lower:
                content = (
                    f"Before diving into the detailed SQL mechanics, let's explore how you structure data mentally, {name}.\n\n"
                    "Imagine you have a sales table containing records for 10 departments. "
                    "If you wanted to calculate the ranking of each employee's salary *strictly within their own department*, "
                    "which standard grouping concept would come to mind first—and why would a simple `GROUP BY` collapse other columns you might still want to see?"
                )
                follow_ups = [
                    "A GROUP BY would collapse rows into 1 per department",
                    "I would use PARTITION BY department_id",
                    "Show me the difference between RANK and DENSE_RANK"
                ]
            elif "missing" in q_lower or "fillna" in q_lower or "clean" in q_lower:
                content = (
                    f"Great question on data quality, {name}. Notice your profile currently has a checkpoint on missing value handling.\n\n"
                    "Before choosing between `dropna()` and `fillna()`, consider this scenario: if customer transaction amounts have a heavy right skew with multi-million dollar outliers, "
                    "what happens to the imputed distribution if you replace missing values with the arithmetic `mean()` instead of the `median()`?"
                )
                follow_ups = [
                    "The mean would artificially inflate missing values due to outliers",
                    "Median is robust against extreme values",
                    "How do I use df.ffill() for time series?"
                ]
            elif "join" in q_lower:
                content = (
                    "Let's test the relational logic first. If you need all 500 customers from the customer table, "
                    "including those who have never placed an order, which JOIN preserves every customer row—and what value will appear in the order columns for inactive customers?"
                )
                follow_ups = [
                    "A LEFT JOIN preserves all left table rows",
                    "The order columns will contain NULL",
                    "What causes Cartesian fan-out?"
                ]
            else:
                doc_context = docs[0]["content"] if docs else "structured business analytics"
                content = (
                    f"Let's unpack '{query}'. In your current milestone ({node_title}), our goal is to verify your problem-solving process.\n\n"
                    f"Consider this foundation: {doc_context[:220]}...\n\n"
                    "How would you apply this principle if you were presenting your finding to a business stakeholder?"
                )
                follow_ups = [
                    "Explain with a concrete code example",
                    "Give me a practice problem to test myself",
                    "How does this relate to my upcoming assessment?"
                ]

        elif mode == "technical":
            doc_body = docs[0]["content"] if docs else "Refer to official documentation standards."
            content = (
                f"### Technical Breakdown: {node_title}\n\n"
                f"{doc_body}\n\n"
                "**Key Implementation Invariants:**\n"
                "- Avoid chained assignments in Pandas by using `.loc[condition, columns]`.\n"
                "- Always define deterministic tie-breaking in SQL window orderings.\n"
                "- Ensure missing values are categorized (MCAR vs MAR) prior to destructive imputation."
            )
            follow_ups = [
                "Show edge cases for this approach",
                "What is the time complexity in large datasets?",
                "Provide an applied SQL query"
            ]

        elif mode == "analogy":
            if "window" in q_lower:
                content = (
                    "Think of a SQL Window Function like looking through a sliding glass window at a crowd in a department store. "
                    "Instead of squishing everyone into a single summary box (like `GROUP BY`), each person stays in their exact spot on the floor. "
                    "The window simply moves from person to person, whispering their position in line relative to everyone else in their specific aisle (`PARTITION BY`)."
                )
            elif "missing" in q_lower or "clean" in q_lower:
                content = (
                    "Handling missing values is like repairing a missing page in an ancient ledger. "
                    "If you just tear out every page with a water smudge (`dropna()`), you might throw away half the historical story! "
                    "Using `median()` imputation is like filling the blank with the most typical price paid on that market day, so you don't distort the rest of the book."
                )
            else:
                content = (
                    f"Think of {node_title} like building an inspection checkpoint on an assembly line. "
                    "Rather than waiting until the car is completely finished to see if the bolts are loose, we test each component at its station before moving to the next."
                )
            follow_ups = [
                "Can you show the technical code for this?",
                "Give me a real-world business example",
                "Let's test this in Socratic mode"
            ]

        elif mode == "beginner":
            content = (
                f"Welcome! Let's take {node_title} step by step without jargon.\n\n"
                "Here is the simple 3-step mental model:\n"
                "1. **Look at what you have**: Inspect your table or dataset.\n"
                "2. **State what you want**: Do you want to filter, group, or fill in gaps?\n"
                "3. **Pick the right tool**: SQL for database retrieval, Pandas for in-memory manipulation, or Excel/Power BI for dashboards."
            )
            follow_ups = [
                "What should I learn first today?",
                "Walk me through an example slowly",
                "Why is this required for a Data Analyst role?"
            ]

        else:  # Practice, Revision, Interview, Project Mentor
            content = (
                f"**[{mode.upper()} MODE] — {node_title}**\n\n"
                f"Based on your profile and target role (Data Analyst), here is your focus challenge:\n\n"
                "> A stakeholder asks: 'Why did our North America revenue dip 14% last Tuesday?'\n\n"
                "Which 3 exploratory queries would you run first in SQL or Pandas to isolate whether this was a reporting glitch, a payment gateway outage, or a true demand decrease?"
            )
            follow_ups = [
                "Check for missing transaction timestamps",
                "Check volume vs average order value",
                "Inspect error codes in payment logs"
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

    def _generate_gemini_response(
        self, query: str, mode: str, node: str, weaknesses: str, docs: List[Dict], sources: List[SourceCitation]
    ) -> TutorMessage:
        from google import genai
        client = genai.Client(api_key=self.api_key)
        
        system_prompt = (
            f"You are Raizo Tutor, an evidence-based adaptive learning agent for aspiring Data Analysts. "
            f"Current Roadmap Node: {node}. Learner Weaknesses: {weaknesses}. Tutor Mode: {mode}. "
            f"Ground your answer in these verified educational sources:\n"
            + "\n".join([f"- {d['title']}: {d['content']}" for d in docs])
            + "\n\nIf the sources do not cover the topic, state that the explanation is based on general data analytics principles. Do not fabricate citations."
        )
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"{system_prompt}\n\nLearner asks: {query}"
        )
        text = response.text or "I am here to assist your learning journey."
        return TutorMessage(
            role="assistant",
            content=text,
            mode=mode,
            sources_used=sources,
            suggested_follow_ups=["Can you give an applied example?", "Test my understanding with a question"],
            learner_context_used={"mode": mode, "node": node}
        )
