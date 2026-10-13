def calculate_weighted_score(
    edge_data,
    cost_weight=0.4,
    time_weight=0.3,
    distance_weight=0.3,
    risk_weight=0.0,
):
    """
    Calculate a normalized weighted score for one route edge.

    Lower score = better route.

    The values are normalized against practical reference values
    so that cost, time, distance and risk can be combined.
    """

    cost = edge_data["cost"]
    travel_time = edge_data["travel_time_hours"]
    distance = edge_data["distance_km"]
    risk = edge_data.get("risk_score", 0.0)

    # Reference values used for Phase 3.
    # These can later be replaced with dataset-driven normalization.
    normalized_cost = cost / 20000
    normalized_time = travel_time / 300
    normalized_distance = distance / 12000
    normalized_risk = risk

    score = (
        cost_weight * normalized_cost
        + time_weight * normalized_time
        + distance_weight * normalized_distance
        + risk_weight * normalized_risk
    )

    return score