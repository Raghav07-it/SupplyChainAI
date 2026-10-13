from routing.dijkstra import (
    find_cheapest_route,
    find_fastest_route,
    find_shortest_route,
    find_weighted_route,
)


def print_result(title, result):
    print(f"\n--- {title} ---")
    print("Route:", " → ".join(result["route"]))
    print("Distance:", result["total_distance_km"], "km")
    print("Travel Time:", result["total_time_hours"], "hours")
    print("Cost: $", result["total_cost"])
    print("Risk Score:", result["total_risk_score"])


def main():
    origin = "Mumbai"
    destination = "Rotterdam"

    cheapest = find_cheapest_route(
        origin,
        destination,
    )

    fastest = find_fastest_route(
        origin,
        destination,
    )

    shortest = find_shortest_route(
        origin,
        destination,
    )

    weighted = find_weighted_route(
        origin,
        destination,
        cost_weight=0.4,
        time_weight=0.3,
        distance_weight=0.3,
        risk_weight=0.0,
    )

    print_result("CHEAPEST ROUTE", cheapest)
    print_result("FASTEST ROUTE", fastest)
    print_result("SHORTEST ROUTE", shortest)
    print_result("WEIGHTED ROUTE", weighted)

    print("\nPhase 3 routing test completed successfully.")


if __name__ == "__main__":
    main()