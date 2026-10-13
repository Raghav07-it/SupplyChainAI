import networkx as nx

from fastapi import APIRouter, HTTPException

from routing.graph import create_logistics_graph
from routing.scoring import calculate_weighted_score
from schemas import RouteQuery, RouteResponse, WeightedRouteQuery
from pydantic import BaseModel, Field
from routing.autonomous import run_autonomous_routing


router = APIRouter(
    prefix="/routing",
    tags=["Routing"],
)

class AutonomousRouteRequest(BaseModel):
    origin_port_code: str
    destination_port_code: str

    cost_weight: float = 0.30
    time_weight: float = 0.20
    distance_weight: float = 0.20
    risk_weight: float = 0.30

    candidate_count: int = 5

    risk_level: str = "medium"

    affected_port_code: str | None = None

    event_severity: str = "medium"

    disruption_probability: float = 0.0

def _calculate_route_totals(graph, route):
    """
    Calculate total cost, distance, travel time and risk for a route.
    """

    total_cost = 0.0
    total_distance = 0.0
    total_time = 0.0
    total_risk = 0.0

    for current, next_node in zip(route, route[1:]):
        edge = graph[current][next_node]

        total_cost += edge["cost"]
        total_distance += edge["distance_km"]
        total_time += edge["travel_time_hours"]
        total_risk += edge.get("risk_score", 0.0)

    return {
        "total_cost": total_cost,
        "total_distance_km": total_distance,
        "total_time_hours": total_time,
        "total_risk_score": total_risk,
    }


def _find_route(graph, source, destination, weight):
    """
    Generic NetworkX shortest-path function.
    """

    if source not in graph:
        raise ValueError(f"Origin port '{source}' does not exist.")

    if destination not in graph:
        raise ValueError(f"Destination port '{destination}' does not exist.")

    if not nx.has_path(graph, source, destination):
        raise ValueError(
            f"No active route exists from '{source}' to '{destination}'."
        )

    route = nx.shortest_path(
        graph,
        source=source,
        target=destination,
        weight=weight,
    )

    totals = _calculate_route_totals(graph, route)

    return {
        "route": route,
        **totals,
    }


def find_cheapest_route(source, destination):
    """
    Find the route with the lowest total transportation cost.
    """

    graph = create_logistics_graph()

    return _find_route(
        graph,
        source,
        destination,
        weight="cost",
    )


def find_fastest_route(source, destination):
    """
    Find the route with the lowest total travel time.
    """

    graph = create_logistics_graph()

    return _find_route(
        graph,
        source,
        destination,
        weight="travel_time_hours",
    )


def find_shortest_route(source, destination):
    """
    Find the route with the lowest total distance.
    """

    graph = create_logistics_graph()

    return _find_route(
        graph,
        source,
        destination,
        weight="distance_km",
    )


def find_weighted_route(
    source,
    destination,
    cost_weight=0.4,
    time_weight=0.3,
    distance_weight=0.3,
    risk_weight=0.0,
):
    """
    Find a route using multiple objectives.

    Lower weighted score = better route.
    """

    total_weight = (
        cost_weight
        + time_weight
        + distance_weight
        + risk_weight
    )

    if total_weight <= 0:
        raise ValueError(
            "At least one routing weight must be greater than zero."
        )

    graph = create_logistics_graph()

    if source not in graph:
        raise ValueError(f"Origin port '{source}' does not exist.")

    if destination not in graph:
        raise ValueError(f"Destination port '{destination}' does not exist.")

    if not nx.has_path(graph, source, destination):
        raise ValueError(
            f"No active route exists from '{source}' to '{destination}'."
        )
    
    

    # Normalize weights so users do not have to provide values
    # that add up exactly to 1.

    cost_weight /= total_weight
    time_weight /= total_weight
    distance_weight /= total_weight
    risk_weight /= total_weight

    for origin, destination_node, edge_data in graph.edges(data=True):
        edge_data["weighted_score"] = calculate_weighted_score(
            edge_data,
            cost_weight=cost_weight,
            time_weight=time_weight,
            distance_weight=distance_weight,
            risk_weight=risk_weight,
        )

    route = nx.shortest_path(
        graph,
        source=source,
        target=destination,
        weight="weighted_score",
    )

    totals = _calculate_route_totals(graph, route)

    total_weighted_score = 0.0

    for current, next_node in zip(route, route[1:]):
        total_weighted_score += graph[current][next_node]["weighted_score"]

    return {
        "route": route,
        **totals,
        "weighted_score": total_weighted_score,
        "weights": {
            "cost": cost_weight,
            "time": time_weight,
            "distance": distance_weight,
            "risk": risk_weight,
        },
    }


# ============================================================
# FASTAPI ROUTES
# ============================================================

@router.post("/cheapest", response_model=RouteResponse)
def cheapest_route(query: RouteQuery):
    try:
        return find_cheapest_route(
            query.origin,
            query.destination,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.post("/fastest", response_model=RouteResponse)
def fastest_route(query: RouteQuery):
    try:
        return find_fastest_route(
            query.origin,
            query.destination,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.post("/shortest", response_model=RouteResponse)
def shortest_route(query: RouteQuery):
    try:
        return find_shortest_route(
            query.origin,
            query.destination,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.post("/weighted")
def weighted_route(query: WeightedRouteQuery):
    try:
        return find_weighted_route(
            source=query.origin,
            destination=query.destination,
            cost_weight=query.cost_weight,
            time_weight=query.time_weight,
            distance_weight=query.distance_weight,
            risk_weight=query.risk_weight,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )
    

# ============================================================
# PHASE 9 — AUTONOMOUS REROUTING
# ============================================================


class AutonomousRouteRequest(BaseModel):
    """
    Request model for Phase 9 autonomous routing.
    """

    origin_port_code: str = Field(
        min_length=5,
        max_length=10,
    )

    destination_port_code: str = Field(
        min_length=5,
        max_length=10,
    )

    cost_weight: float = Field(
        default=0.30,
        ge=0.0,
    )

    time_weight: float = Field(
        default=0.20,
        ge=0.0,
    )

    distance_weight: float = Field(
        default=0.20,
        ge=0.0,
    )

    risk_weight: float = Field(
        default=0.30,
        ge=0.0,
    )

    candidate_count: int = Field(
        default=8,
        ge=1,
        le=20,
    )

    risk_level: str = Field(
        default="medium",
        min_length=3,
        max_length=20,
    )


@router.post("/autonomous")
def autonomous_routing(
    request: AutonomousRouteRequest,
):
    """
    Phase 9:

    Autonomous risk-aware route evaluation.

    The system:
        1. Builds the active logistics network.
        2. Generates candidate routes.
        3. Evaluates cost, time and distance.
        4. Calculates disruption-aware risk.
        5. Applies configurable weights.
        6. Compares routes.
        7. Decides KEEP_ROUTE or REROUTE.
        8. Returns the selected route and explanation.
    """

    try:

        result = run_autonomous_routing(
            origin_port_code=(
                request.origin_port_code
            ),
            destination_port_code=(
                request.destination_port_code
            ),
            cost_weight=(
                request.cost_weight
            ),
            time_weight=(
                request.time_weight
            ),
            distance_weight=(
                request.distance_weight
            ),
            risk_weight=(
                request.risk_weight
            ),
            candidate_count=(
                request.candidate_count
            ),
            risk_level=(
                request.risk_level
            ),
        )

        return result

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Autonomous routing failed: "
                f"{str(exc)}"
            ),
        )
@router.post("/autonomous")
def autonomous_route(
    request: AutonomousRouteRequest,
):
    try:
        return run_autonomous_routing(
            origin_port_code=request.origin_port_code,
            destination_port_code=request.destination_port_code,
            cost_weight=request.cost_weight,
            time_weight=request.time_weight,
            distance_weight=request.distance_weight,
            risk_weight=request.risk_weight,
            candidate_count=request.candidate_count,
            risk_level=request.risk_level,
            affected_port_code=request.affected_port_code,
            event_severity=request.event_severity,
            disruption_probability=request.disruption_probability,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Autonomous routing failed: {exc}",
        )

  