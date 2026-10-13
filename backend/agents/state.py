from typing import Any, Dict, List, TypedDict


class SupplyChainState(TypedDict, total=False):
    raw_event_text: str

    origin_port_code: str
    destination_port_code: str

    extracted_signal: Dict[str, Any]

    historical_context: Dict[str, Any]

    risk_assessment: Dict[str, Any]

    route_analysis: Dict[str, Any]

    final_recommendation: Dict[str, Any]

    workflow_status: str

    errors: List[str]