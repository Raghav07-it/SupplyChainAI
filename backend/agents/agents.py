import json
import re
from typing import Any, Dict

from langgraph.graph import END, StateGraph
from sqlalchemy import select

from agents.llm import get_agent_llm
from agents.state import SupplyChainState
from database import SessionLocal
from models import Port
from vector_memory.store import query_disruption_memory


# ============================================================
# PROJECT CONSTANTS
# ============================================================

VALID_PORTS = {
    "INMUM",
    "AEDXB",
    "SGSIN",
    "NLRTM",
}

VALID_EVENT_TYPES = {
    "severe_weather",
    "port_congestion",
    "labor_strike",
    "geopolitical_conflict",
    "equipment_failure",
    "customs_delay",
    "other",
    "unknown",
}

VALID_SEVERITIES = {
    "low",
    "medium",
    "high",
    "critical",
}


# ============================================================
# PORT ALIASES
# ============================================================

PORT_ALIASES = {
    "INMUM": [
        "inmum",
        "mumbai",
        "mumbai port",
        "port of mumbai",
        "nhava sheva",
        "jawaharlal nehru port",
        "jnpt",
    ],
    "AEDXB": [
        "aedxb",
        "dubai",
        "dubai port",
        "port of dubai",
        "jebel ali",
        "jebel ali port",
    ],
    "SGSIN": [
        "sgsin",
        "singapore",
        "singapore port",
        "port of singapore",
    ],
    "NLRTM": [
        "nlrtm",
        "rotterdam",
        "rotterdam port",
        "port of rotterdam",
    ],
}


# ============================================================
# HELPERS
# ============================================================

def clean_text(value: Any) -> str:
    if value is None:
        return ""

    return str(value).strip()


def infer_port_from_text(text: str) -> str:
    """
    Deterministically identify known project ports from event text.

    This prevents the workflow from depending completely on the
    LLM returning an exact UN/LOCODE.
    """

    text_lower = clean_text(text).lower()

    # Prefer longer aliases first.
    aliases = []

    for port_code, values in PORT_ALIASES.items():
        for alias in values:
            aliases.append((alias, port_code))

    aliases.sort(key=lambda item: len(item[0]), reverse=True)

    for alias, port_code in aliases:
        if alias in text_lower:
            return port_code

    return "unknown"


def normalize_port(value: Any, event_text: str = "") -> str:
    value = clean_text(value).upper()

    if value in VALID_PORTS:
        return value

    # Try textual aliases if the LLM did not return a valid code.
    inferred = infer_port_from_text(event_text)

    if inferred in VALID_PORTS:
        return inferred

    return "unknown"


def normalize_event_type(value: Any) -> str:
    value = clean_text(value).lower()

    if value in VALID_EVENT_TYPES:
        return value

    return "unknown"


def infer_event_type_from_text(text: str) -> str:
    """
    Deterministic fallback for common disruption language.
    """

    text_lower = clean_text(text).lower()

    if any(
        keyword in text_lower
        for keyword in [
            "weather",
            "storm",
            "cyclone",
            "hurricane",
            "typhoon",
            "flood",
        ]
    ):
        return "severe_weather"

    if any(
        keyword in text_lower
        for keyword in [
            "congestion",
            "congested",
            "port congestion",
            "container backlog",
            "backlog",
            "terminal congestion",
        ]
    ):
        return "port_congestion"

    if any(
        keyword in text_lower
        for keyword in [
            "strike",
            "labor strike",
            "labour strike",
            "labor disruption",
            "labour disruption",
            "workers strike",
            "worker strike",
        ]
    ):
        return "labor_strike"

    if any(
        keyword in text_lower
        for keyword in [
            "war",
            "conflict",
            "military",
            "geopolitical",
        ]
    ):
        return "geopolitical_conflict"

    if any(
        keyword in text_lower
        for keyword in [
            "equipment failure",
            "crane failure",
            "machinery failure",
        ]
    ):
        return "equipment_failure"

    if any(
        keyword in text_lower
        for keyword in [
            "customs",
            "customs delay",
            "border delay",
        ]
    ):
        return "customs_delay"

    return "unknown"


def normalize_severity(value: Any) -> str:
    value = clean_text(value).lower()

    if value in VALID_SEVERITIES:
        return value

    return "medium"


def extract_json(text: str) -> Dict[str, Any]:
    """
    Extract the first JSON object from an LLM response.
    """

    if not text:
        return {}

    text = text.strip()

    text = re.sub(
        r"```json\s*",
        "",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"```\s*",
        "",
        text,
    )

    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1 or end <= start:
        return {}

    json_text = text[start:end + 1]

    try:
        result = json.loads(json_text)

        if isinstance(result, dict):
            return result

    except json.JSONDecodeError:
        return {}

    return {}


def severity_probability(severity: str) -> float:
    probabilities = {
        "low": 0.25,
        "medium": 0.45,
        "high": 0.70,
        "critical": 0.90,
    }

    return probabilities.get(severity, 0.45)


def severity_rank(severity: str) -> int:
    return {
        "low": 1,
        "medium": 2,
        "high": 3,
        "critical": 4,
    }.get(severity, 2)


# ============================================================
# AGENT 1 — SIGNAL INGESTION
# ============================================================

def agent_ingest_signal(state: SupplyChainState) -> Dict[str, Any]:
    event_text = clean_text(
        state.get("raw_event_text")
    )

    if not event_text:
        raise ValueError("Event text cannot be empty.")

    llm = get_agent_llm()

    prompt = f"""
Extract supply-chain disruption information from this event.

EVENT:
{event_text}

Return ONLY valid JSON.

Required fields:

{{
  "port_code": "INMUM|AEDXB|SGSIN|NLRTM|unknown",
  "event_type": "severe_weather|port_congestion|labor_strike|geopolitical_conflict|equipment_failure|customs_delay|other|unknown",
  "severity": "low|medium|high|critical",
  "explanation": "short explanation"
}}

Known port mappings:

Mumbai / Mumbai Port / JNPT / Nhava Sheva -> INMUM
Dubai / Jebel Ali -> AEDXB
Singapore / Singapore Port -> SGSIN
Rotterdam / Rotterdam Port -> NLRTM

Rules:
- Do not invent a port.
- Use a known port code when the event clearly names one of the known ports.
- Use "unknown" only when the port cannot be identified.
- Keep explanation below 25 words.
- Return JSON only.
"""

    response = llm.invoke(prompt)

    raw_response = getattr(
        response,
        "content",
        "",
    )

    extracted = extract_json(raw_response)

    port_code = normalize_port(
        extracted.get("port_code"),
        event_text,
    )

    event_type = normalize_event_type(
        extracted.get("event_type")
    )

    if event_type == "unknown":
        event_type = infer_event_type_from_text(
            event_text
        )

    severity = normalize_severity(
        extracted.get("severity")
    )

    signal = {
        "port_code": port_code,
        "event_type": event_type,
        "severity": severity,
        "explanation": clean_text(
            extracted.get("explanation")
        )[:300],
    }

    if not signal["explanation"]:
        signal["explanation"] = (
            "Supply-chain disruption signal extracted from the event."
        )

    return {
        "extracted_signal": signal
    }


# ============================================================
# AGENT 2 — HISTORICAL MEMORY
# ============================================================

def agent_retrieve_history(
    state: SupplyChainState,
) -> Dict[str, Any]:

    signal = state.get(
        "extracted_signal",
        {},
    )

    port_code = signal.get(
        "port_code",
        "unknown",
    )

    event_type = signal.get(
        "event_type",
        "unknown",
    )

    severity = signal.get(
        "severity",
        "medium",
    )

    query_parts = []

    if event_type != "unknown":
        query_parts.append(event_type)

    if severity:
        query_parts.append(
            f"severity {severity}"
        )

    if port_code != "unknown":
        query_parts.append(
            f"port {port_code}"
        )

    query = " ".join(
        query_parts
    ).strip()

    if not query:
        query = "supply chain disruption"

    try:
        # IMPORTANT:
        # vector_memory.store.query_disruption_memory()
        # accepts k, not n_results.
        matches = query_disruption_memory(
            query,
            k=5,
        )

    except Exception as exc:
        return {
            "historical_context": {
                "query": query,
                "match_count": 0,
                "historical_patterns": [],
                "memory_error": str(exc),
            }
        }

    historical_patterns = []

    for match in matches or []:

        if isinstance(match, dict):

            historical_patterns.append(
                {
                    "content": match.get(
                        "content",
                        "",
                    ),
                    "metadata": match.get(
                        "metadata",
                        {},
                    ),
                }
            )

        else:

            historical_patterns.append(
                {
                    "content": str(match),
                    "metadata": {},
                }
            )

    return {
        "historical_context": {
            "query": query,
            "match_count": len(
                historical_patterns
            ),
            "historical_patterns": historical_patterns,
        }
    }


# ============================================================
# AGENT 3 — RISK ASSESSMENT
# ============================================================

def agent_assess_risk(
    state: SupplyChainState,
) -> Dict[str, Any]:

    signal = state.get(
        "extracted_signal",
        {},
    )

    history = state.get(
        "historical_context",
        {},
    )

    severity = signal.get(
        "severity",
        "medium",
    )

    probability = severity_probability(
        severity
    )

    match_count = history.get(
        "match_count",
        0,
    )

    if (
        match_count >= 5
        and severity_rank(severity) >= 3
    ):
        probability = min(
            0.90,
            probability + 0.05,
        )

    if severity == "critical":
        risk_level = "critical"

    elif probability >= 0.70:
        risk_level = "high"

    elif probability >= 0.45:
        risk_level = "medium"

    else:
        risk_level = "low"

    reasoning = (
        f"Current event severity is {severity}. "
        f"Historical semantic memory returned "
        f"{match_count} similar events. "
        f"Deterministic baseline probability is "
        f"{probability:.2f}."
    )

    return {
        "risk_assessment": {
            "risk_level": risk_level,
            "disruption_probability": probability,
            "reasoning": reasoning,
            "baseline_probability": severity_probability(
                severity
            ),
            "historical_match_count": match_count,
        }
    }


# ============================================================
# AGENT 4 — ROUTE ANALYSIS
# ============================================================

def agent_analyze_route(
    state: SupplyChainState,
) -> Dict[str, Any]:

    origin_code = clean_text(
        state.get(
            "origin_port_code",
            "INMUM",
        )
    ).upper()

    destination_code = clean_text(
        state.get(
            "destination_port_code",
            "NLRTM",
        )
    ).upper()

    signal = state.get(
        "extracted_signal",
        {},
    )

    affected_port = signal.get(
        "port_code",
        "unknown",
    )

    db = SessionLocal()

    try:

        ports = db.execute(
            select(Port).where(
                Port.port_code.in_(
                    [
                        origin_code,
                        destination_code,
                    ]
                )
            )
        ).scalars().all()

        valid_codes = {
            port.port_code
            for port in ports
        }

    finally:
        db.close()

    origin_valid = (
        origin_code in valid_codes
    )

    destination_valid = (
        destination_code in valid_codes
    )

    direct_impact = (
        affected_port
        in {
            origin_code,
            destination_code,
        }
    )

    if (
        not origin_valid
        or not destination_valid
    ):
        route_status = "invalid"

    elif direct_impact:
        route_status = "directly_affected"

    elif affected_port == "unknown":
        route_status = "unknown_impact"

    else:
        route_status = "not_directly_affected"

    return {
        "route_analysis": {
            "origin_port_code": origin_code,
            "destination_port_code": destination_code,
            "origin_valid": origin_valid,
            "destination_valid": destination_valid,
            "affected_port_code": affected_port,
            "route_status": route_status,
            "rerouting_performed": False,
            "phase_9_note": (
                "Autonomous route modification is "
                "reserved for Phase 9."
            ),
        }
    }


# ============================================================
# AGENT 5 — DECISION
# ============================================================

def agent_generate_recommendation(
    state: SupplyChainState,
) -> Dict[str, Any]:

    signal = state.get(
        "extracted_signal",
        {},
    )

    risk = state.get(
        "risk_assessment",
        {},
    )

    route = state.get(
        "route_analysis",
        {},
    )

    risk_level = risk.get(
        "risk_level",
        "medium",
    )

    probability = float(
        risk.get(
            "disruption_probability",
            0.45,
        )
    )

    severity = signal.get(
        "severity",
        "medium",
    )

    route_status = route.get(
        "route_status",
        "unknown_impact",
    )

    if route_status == "directly_affected":

        if risk_level in {
            "critical",
            "high",
        }:

            decision = "prepare_alternative"
            priority = "high"

            recommendation = (
                f"Prepare alternative routing for "
                f"{route.get('origin_port_code')} to "
                f"{route.get('destination_port_code')} "
                f"while monitoring the affected port."
            )

        else:

            decision = "prepare_alternative"
            priority = "medium"

            recommendation = (
                "Prepare an alternative route and "
                "continue monitoring the disruption."
            )

    elif risk_level == "critical":

        decision = "escalate"
        priority = "high"

        recommendation = (
            "Escalate the disruption for operational "
            "review and closely monitor route conditions."
        )

    elif risk_level == "high":

        decision = "prepare_alternative"
        priority = "medium"

        recommendation = (
            "Prepare alternative routing options and "
            "monitor the disruption closely."
        )

    else:

        decision = "monitor"
        priority = "low"

        recommendation = (
            "Continue monitoring the disruption and "
            "maintain normal operational planning."
        )

    rationale = (
        f"The event has {severity} severity with an "
        f"estimated disruption probability of "
        f"{probability:.2f}. Route status is "
        f"{route_status}."
    )

    return {
        "final_recommendation": {
            "decision": decision,
            "priority": priority,
            "recommendation": recommendation,
            "rationale": rationale,
            "risk_level": risk_level,
            "probability": probability,
            "route_status": route_status,
        }
    }


# ============================================================
# LANGGRAPH WORKFLOW
# ============================================================

def build_workflow():

    workflow = StateGraph(
        SupplyChainState
    )

    workflow.add_node(
        "signal_ingestion",
        agent_ingest_signal,
    )

    workflow.add_node(
        "historical_memory",
        agent_retrieve_history,
    )

    workflow.add_node(
        "risk_assessment",
        agent_assess_risk,
    )

    workflow.add_node(
        "route_analysis",
        agent_analyze_route,
    )

    workflow.add_node(
        "decision",
        agent_generate_recommendation,
    )

    workflow.set_entry_point(
        "signal_ingestion"
    )

    workflow.add_edge(
        "signal_ingestion",
        "historical_memory",
    )

    workflow.add_edge(
        "historical_memory",
        "risk_assessment",
    )

    workflow.add_edge(
        "risk_assessment",
        "route_analysis",
    )

    workflow.add_edge(
        "route_analysis",
        "decision",
    )

    workflow.add_edge(
        "decision",
        END,
    )

    return workflow.compile()


multi_agent_engine = build_workflow()