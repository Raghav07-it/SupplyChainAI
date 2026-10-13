from __future__ import annotations

from typing import Any

import networkx as nx
from sqlalchemy import select

from database import SessionLocal
from disruptions.risk import (
    SEVERITY_POINTS,
    calculate_port_risk,
)
from models import Disruption, Port, Route


DEFAULT_COST_WEIGHT = 0.30
DEFAULT_TIME_WEIGHT = 0.20
DEFAULT_DISTANCE_WEIGHT = 0.20
DEFAULT_RISK_WEIGHT = 0.30

VALID_RISK_LEVELS = {
    "low",
    "medium",
    "high",
    "critical",
}

RISK_LEVEL_POINTS = {
    "low": 5.0,
    "medium": 15.0,
    "high": 30.0,
    "critical": 45.0,
}


def _normalize_weights(
    cost_weight: float,
    time_weight: float,
    distance_weight: float,
    risk_weight: float,
) -> dict[str, float]:

    values = [
        float(cost_weight),
        float(time_weight),
        float(distance_weight),
        float(risk_weight),
    ]

    if any(value < 0 for value in values):
        raise ValueError(
            "Route weights cannot be negative."
        )

    total = sum(values)

    if total <= 0:
        raise ValueError(
            "At least one route weight must be greater than zero."
        )

    return {
        "cost_weight": values[0] / total,
        "time_weight": values[1] / total,
        "distance_weight": values[2] / total,
        "risk_weight": values[3] / total,
    }


def _build_graph(db) -> nx.DiGraph:

    graph = nx.DiGraph()

    routes = db.scalars(
        select(Route).where(
            Route.is_active.is_(True)
        )
    ).all()

    ports = db.scalars(
        select(Port)
    ).all()

    ports_by_id = {
        port.id: port
        for port in ports
    }

    for route in routes:

        origin = ports_by_id.get(
            route.origin_port_id
        )

        destination = ports_by_id.get(
            route.destination_port_id
        )

        if not origin or not destination:
            continue

        graph.add_edge(
            origin.port_code,
            destination.port_code,
            route_id=route.id,
            distance_km=float(
                route.distance_km
            ),
            travel_time_hours=float(
                route.travel_time_hours
            ),
            cost=float(route.cost),
        )

    return graph


def _route_metrics(
    graph: nx.DiGraph,
    route_codes: list[str],
) -> dict[str, Any]:

    total_cost = 0.0
    total_distance = 0.0
    total_time = 0.0
    route_ids = []

    for origin, destination in zip(
        route_codes[:-1],
        route_codes[1:],
    ):

        edge = graph[origin][destination]

        total_cost += float(
            edge["cost"]
        )

        total_distance += float(
            edge["distance_km"]
        )

        total_time += float(
            edge["travel_time_hours"]
        )

        route_ids.append(
            edge.get("route_id")
        )

    return {
        "route": route_codes,
        "route_ids": route_ids,
        "total_cost": round(
            total_cost,
            2,
        ),
        "total_distance_km": round(
            total_distance,
            2,
        ),
        "total_time_hours": round(
            total_time,
            2,
        ),
    }


def _get_route_disruption_data(
    db,
    route_codes: list[str],
    affected_port_code: str | None = None,
    event_severity: str = "medium",
    disruption_probability: float = 0.0,
) -> dict[str, Any]:

    ports = db.scalars(
        select(Port).where(
            Port.port_code.in_(route_codes)
        )
    ).all()

    ports_by_code = {
        port.port_code: port
        for port in ports
    }

    route_risks = []
    affected_ports = []

    total_delay = 0.0
    total_cost_impact = 0.0
    max_capacity_impact = 0.0
    total_disruption_count = 0

    port_details = []

    for port_code in route_codes:

        port = ports_by_code.get(
            port_code
        )

        if not port:
            continue

        baseline = calculate_port_risk(
            port_code,
            db,
        )

        disruptions = db.scalars(
            select(Disruption).where(
                Disruption.port_id == port.id,
                Disruption.status.in_(
                    [
                        "active",
                        "monitoring",
                    ]
                ),
            )
        ).all()

        total_disruption_count += len(
            disruptions
        )

        # ----------------------------------------------------
        # IMPORTANT:
        # Do NOT sum every disruption record.
        #
        # Multiple records can describe the same port/event
        # conditions. We use the strongest current operational
        # impact per port.
        # ----------------------------------------------------

        if disruptions:

            max_delay = max(
                float(
                    item.estimated_delay_hours
                    or 0
                )
                for item in disruptions
            )

            max_cost = max(
                float(
                    item.estimated_cost_impact_usd
                    or 0
                )
                for item in disruptions
            )

            max_capacity = max(
                float(
                    item.capacity_impact_percent
                    or 0
                )
                for item in disruptions
            )

            max_severity = max(
                disruptions,
                key=lambda item:
                    SEVERITY_POINTS.get(
                        item.severity,
                        0,
                    ),
            )

            severity_points = float(
                SEVERITY_POINTS.get(
                    max_severity.severity,
                    0,
                )
            )

        else:

            max_delay = 0.0
            max_cost = 0.0
            max_capacity = 0.0
            severity_points = 0.0
            max_severity = None

        total_delay += max_delay
        total_cost_impact += max_cost
        max_capacity_impact = max(
            max_capacity_impact,
            max_capacity,
        )

        # ----------------------------------------------------
        # Current operational risk
        # ----------------------------------------------------

        operational_risk = min(
            100.0,
            (
                severity_points * 1.5
                + max_capacity * 0.5
                + min(max_delay, 72.0)
                / 72.0
                * 20.0
            ),
        )

        baseline_risk = float(
            baseline.get(
                "risk_score",
                0,
            )
        )

        # Historical baseline contributes, but current
        # operational conditions receive greater influence.
        port_risk = (
            baseline_risk * 0.30
            + operational_risk * 0.70
        )

        # ----------------------------------------------------
        # Phase 8 event impact
        # ----------------------------------------------------

        event_penalty = 0.0

        if (
            affected_port_code
            and affected_port_code
            == port_code
        ):

            severity_points_event = float(
                SEVERITY_POINTS.get(
                    event_severity,
                    12,
                )
            )

            event_penalty = (
                severity_points_event
                * max(
                    0.0,
                    min(
                        float(
                            disruption_probability
                        ),
                        1.0,
                    ),
                )
            )

            port_risk += event_penalty

            affected_ports.append(
                port_code
            )

        port_risk = min(
            100.0,
            round(
                port_risk,
                2,
            ),
        )

        route_risks.append(
            port_risk
        )

        port_details.append(
            {
                "port_code": port_code,
                "baseline_risk": round(
                    baseline_risk,
                    2,
                ),
                "operational_risk": round(
                    operational_risk,
                    2,
                ),
                "event_penalty": round(
                    event_penalty,
                    2,
                ),
                "route_risk": port_risk,
                "active_disruption_count": len(
                    disruptions
                ),
                "max_delay_hours": round(
                    max_delay,
                    2,
                ),
                "max_cost_impact_usd": round(
                    max_cost,
                    2,
                ),
                "max_capacity_impact_percent": round(
                    max_capacity,
                    2,
                ),
                "max_severity": (
                    max_severity.severity
                    if max_severity
                    else None
                ),
            }
        )

    route_risk = (
        max(route_risks)
        if route_risks
        else 0.0
    )

    return {
        "risk_score": round(
            route_risk,
            2,
        ),
        "estimated_delay_hours": round(
            total_delay,
            2,
        ),
        "estimated_cost_impact_usd": round(
            total_cost_impact,
            2,
        ),
        "capacity_impact_percent": round(
            max_capacity_impact,
            2,
        ),
        "disruption_count": total_disruption_count,
        "affected_ports": affected_ports,
        "port_details": port_details,
    }


def _calculate_score(
    cost: float,
    time: float,
    distance: float,
    risk: float,
    weights: dict[str, float],
) -> float:

    normalized_cost = cost / 20000.0
    normalized_time = time / 300.0
    normalized_distance = distance / 12000.0
    normalized_risk = risk / 100.0

    return round(
        (
            weights["cost_weight"]
            * normalized_cost
            + weights["time_weight"]
            * normalized_time
            + weights["distance_weight"]
            * normalized_distance
            + weights["risk_weight"]
            * normalized_risk
        ),
        6,
    )


def _generate_candidates(
    graph: nx.DiGraph,
    origin: str,
    destination: str,
    candidate_count: int,
) -> list[list[str]]:

    if origin not in graph:
        raise ValueError(
            f"Origin port '{origin}' is not available."
        )

    if destination not in graph:
        raise ValueError(
            f"Destination port '{destination}' is not available."
        )

    if not nx.has_path(
        graph,
        origin,
        destination,
    ):
        raise ValueError(
            f"No active route exists from "
            f"{origin} to {destination}."
        )

    candidate_paths = []

    # Generate candidates using several operational
    # dimensions so alternatives are not based on one
    # arbitrary metric.

    for weight in [
        "cost",
        "travel_time_hours",
        "distance_km",
    ]:

        try:

            paths = nx.shortest_simple_paths(
                graph,
                origin,
                destination,
                weight=weight,
            )

            for path in paths:

                if path not in candidate_paths:
                    candidate_paths.append(path)

                if len(candidate_paths) >= candidate_count:
                    break

        except nx.NetworkXNoPath:
            continue

        if len(candidate_paths) >= candidate_count:
            break

    return candidate_paths[:candidate_count]


def run_autonomous_routing(
    origin_port_code: str,
    destination_port_code: str,
    cost_weight: float = DEFAULT_COST_WEIGHT,
    time_weight: float = DEFAULT_TIME_WEIGHT,
    distance_weight: float = DEFAULT_DISTANCE_WEIGHT,
    risk_weight: float = DEFAULT_RISK_WEIGHT,
    candidate_count: int = 5,
    risk_level: str = "medium",
    affected_port_code: str | None = None,
    event_severity: str = "medium",
    disruption_probability: float = 0.0,
) -> dict[str, Any]:

    origin = origin_port_code.strip().upper()
    destination = (
        destination_port_code.strip().upper()
    )

    if origin == destination:
        raise ValueError(
            "Origin and destination must be different."
        )

    candidate_count = max(
        2,
        min(int(candidate_count), 10),
    )

    risk_level = (
        risk_level.strip().lower()
    )

    if risk_level not in VALID_RISK_LEVELS:
        risk_level = "medium"

    event_severity = (
        event_severity.strip().lower()
    )

    if event_severity not in SEVERITY_POINTS:
        event_severity = "medium"

    weights = _normalize_weights(
        cost_weight,
        time_weight,
        distance_weight,
        risk_weight,
    )

    db = SessionLocal()

    try:

        graph = _build_graph(db)

        candidate_paths = _generate_candidates(
            graph,
            origin,
            destination,
            candidate_count,
        )

        candidates = []

        for path in candidate_paths:

            metrics = _route_metrics(
                graph,
                path,
            )

            disruption_data = (
                _get_route_disruption_data(
                    db,
                    path,
                    affected_port_code,
                    event_severity,
                    disruption_probability,
                )
            )

            score = _calculate_score(
                metrics["total_cost"],
                metrics["total_time_hours"],
                metrics["total_distance_km"],
                disruption_data["risk_score"],
                weights,
            )

            candidates.append(
                {
                    **metrics,
                    **disruption_data,
                    "weighted_score": score,
                }
            )

        if not candidates:
            raise ValueError(
                "No candidate routes were generated."
            )

        # ----------------------------------------------------
        # Baseline route
        #
        # This represents the route choice without risk.
        # ----------------------------------------------------

        baseline_weights = _normalize_weights(
            cost_weight,
            time_weight,
            distance_weight,
            0.0,
        )

        baseline_candidates = []

        for candidate in candidates:

            baseline_score = _calculate_score(
                candidate["total_cost"],
                candidate["total_time_hours"],
                candidate["total_distance_km"],
                0.0,
                baseline_weights,
            )

            baseline_candidates.append(
                (
                    baseline_score,
                    candidate,
                )
            )

        baseline_candidates.sort(
            key=lambda item: item[0]
        )

        original_route = (
            baseline_candidates[0][1]
        )

        # ----------------------------------------------------
        # Risk-aware selected route
        # ----------------------------------------------------

        candidates.sort(
            key=lambda item:
                item["weighted_score"]
        )

        selected_route = candidates[0]

        same_route = (
            selected_route["route"]
            == original_route["route"]
        )

        if same_route:
            decision = "KEEP_ROUTE"

            explanation = (
                "The current route remains the "
                "lowest-scoring option after considering "
                "cost, time, distance and disruption risk."
            )

        else:
            decision = "REROUTE"

            explanation = (
                "An alternative route has a lower "
                "risk-aware weighted score than the "
                "current route."
            )

        return {
            "status": "success",
            "origin_port_code": origin,
            "destination_port_code": destination,
            "risk_level": risk_level,
            "affected_port_code": affected_port_code,
            "event_severity": event_severity,
            "disruption_probability": round(
                float(disruption_probability),
                4,
            ),
            "weights": weights,
            "candidate_count": len(
                candidates
            ),
            "original_route": original_route,
            "candidate_routes": candidates,
            "selected_route": selected_route,
            "decision": decision,
            "explanation": explanation,
        }

    finally:
        db.close()