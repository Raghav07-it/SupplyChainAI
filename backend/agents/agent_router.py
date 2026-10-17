from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field


router = APIRouter(
    prefix="/agents",
    tags=["Multi-Agent Engine"],
)


class AgentRequest(BaseModel):
    event_text: str = Field(
        min_length=5,
        max_length=10000,
    )

    origin_port_code: str = Field(
        default="INMUM",
        min_length=5,
        max_length=10,
    )

    destination_port_code: str = Field(
        default="NLRTM",
        min_length=5,
        max_length=10,
    )

    cost_weight: float = 0.30
    time_weight: float = 0.20
    distance_weight: float = 0.20
    risk_weight: float = 0.30

    candidate_count: int = Field(
        default=5,
        ge=2,
        le=10,
    )


class AgentWorkflowResponse(BaseModel):
    status: str
    workflow_status: str

    extracted_signal: Dict[str, Any]
    historical_context: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    route_analysis: Dict[str, Any]
    final_recommendation: Dict[str, Any]

    autonomous_routing: Dict[str, Any]

    errors: list[str] = []


@router.post(
    "/run-workflow",
    response_model=AgentWorkflowResponse,
)
def run_workflow(
    request: AgentRequest,
):

    event_text = request.event_text.strip()

    if not event_text:
        raise HTTPException(
            status_code=400,
            detail="Event text cannot be empty.",
        )

    origin = (
        request.origin_port_code
        .strip()
        .upper()
    )

    destination = (
        request.destination_port_code
        .strip()
        .upper()
    )

    initial_state = {
        "raw_event_text": event_text,
        "origin_port_code": origin,
        "destination_port_code": destination,
        "workflow_status": "started",
        "errors": [],
    }

    try:

        # ====================================================
        # PHASE 8
        # ====================================================
        from agents.agents import multi_agent_engine

        result = multi_agent_engine.invoke(
            initial_state
        )

        extracted_signal = result.get(
            "extracted_signal",
            {},
        )

        historical_context = result.get(
            "historical_context",
            {},
        )

        risk_assessment = result.get(
            "risk_assessment",
            {},
        )

        route_analysis = result.get(
            "route_analysis",
            {},
        )

        final_recommendation = result.get(
            "final_recommendation",
            {},
        )

        # ====================================================
        # PHASE 9
        # ====================================================

        affected_port = extracted_signal.get(
            "port_code"
        )

        if affected_port == "unknown":
            affected_port = None

        event_severity = extracted_signal.get(
            "severity",
            "medium",
        )

        disruption_probability = float(
            risk_assessment.get(
                "disruption_probability",
                0.45,
            )
        )
        from routing.autonomous import run_autonomous_routing
        autonomous_routing = (
            run_autonomous_routing(
                origin_port_code=origin,
                destination_port_code=destination,
                cost_weight=request.cost_weight,
                time_weight=request.time_weight,
                distance_weight=request.distance_weight,
                risk_weight=request.risk_weight,
                candidate_count=request.candidate_count,
                risk_level=risk_assessment.get(
                    "risk_level",
                    "medium",
                ),
                affected_port_code=affected_port,
                event_severity=event_severity,
                disruption_probability=disruption_probability,
            )
        )

        return {
            "status": "success",
            "workflow_status": "completed",
            "extracted_signal": extracted_signal,
            "historical_context": historical_context,
            "risk_assessment": risk_assessment,
            "route_analysis": route_analysis,
            "final_recommendation": final_recommendation,
            "autonomous_routing": autonomous_routing,
            "errors": [],
        }

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Workflow failed: {exc}",
        )