import networkx as nx

from routing.graph import create_logistics_graph
from routing.scoring import calculate_weighted_score


def _calculate_route_totals(graph, route):
    """
    Calculate total cost, distance and travel time for a route.
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
        raise ValueError("At least one routing weight must be greater than zero.")

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