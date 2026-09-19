import time
import os
import json
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

# Global in-memory audit log list for rapid agent transparency retrieval
AGENT_EVENT_LOG: List[Dict[str, Any]] = []

class AgentAuditEntry(BaseModel):
    timestamp: str
    agent: str
    action: str
    input_ref: str
    output_ref: str
    status: str
    duration_ms: float
    details: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class BaseAgent:
    def __init__(self, name: str, role_description: str):
        self.name = name
        self.role_description = role_description
        self.api_key = os.environ.get("GEMINI_API_KEY")

    def log_event(
        self,
        action: str,
        input_ref: str,
        output_ref: str,
        status: str,
        duration_ms: float,
        details: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None
    ) -> AgentAuditEntry:
        entry = AgentAuditEntry(
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
            agent=self.name,
            action=action,
            input_ref=input_ref,
            output_ref=output_ref,
            status=status,
            duration_ms=round(duration_ms, 2),
            details=details or {},
            error=error
        )
        AGENT_EVENT_LOG.insert(0, entry.model_dump())
        # Keep last 200 events
        if len(AGENT_EVENT_LOG) > 200:
            AGENT_EVENT_LOG.pop()
        return entry

    def execute_with_audit(self, action_name: str, input_summary: str, func, *args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            duration_ms = (time.time() - start_time) * 1000
            output_summary = f"Generated {type(result).__name__}"
            if isinstance(result, dict) and "status" in result:
                output_summary += f" [status={result['status']}]"
            self.log_event(
                action=action_name,
                input_ref=input_summary,
                output_ref=output_summary,
                status="SUCCESS",
                duration_ms=duration_ms,
                details={"action": action_name, "input_summary": input_summary}
            )
            return result
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            self.log_event(
                action=action_name,
                input_ref=input_summary,
                output_ref="Error",
                status="FAILED",
                duration_ms=duration_ms,
                error=str(e)
            )
            raise e
