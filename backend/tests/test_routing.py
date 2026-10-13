import pytest

from routing.dijkstra import (
    find_cheapest_route,
    find_fastest_route,
    find_shortest_route,
    find_weighted_route,
)


def test_cheapest_route():
    result = find_cheapest_route(
        "Mumbai",
        "Rotterdam",
    )

    assert result["route"] == [
        "Mumbai",
        "Dubai",
        "Rotterdam",
    ]

    assert result["total_cost"] == 17000.0


def test_fastest_route():
    result = find_fastest_route(
        "Mumbai",
        "Rotterdam",
    )

    assert result["route"] == [
        "Mumbai",
        "Dubai",
        "Rotterdam",
    ]

    assert result["total_time_hours"] == 240.0


def test_shortest_route():
    result = find_shortest_route(
        "Mumbai",
        "Rotterdam",
    )

    assert result["route"] == [
        "Mumbai",
        "Dubai",
        "Rotterdam",
    ]

    assert result["total_distance_km"] == 10000.0


def test_weighted_route():
    result = find_weighted_route(
        "Mumbai",
        "Rotterdam",
        cost_weight=0.4,
        time_weight=0.3,
        distance_weight=0.3,
    )

    assert result["route"] == [
        "Mumbai",
        "Dubai",
        "Rotterdam",
    ]


def test_invalid_origin():
    with pytest.raises(ValueError):
        find_cheapest_route(
            "Delhi",
            "Rotterdam",
        )


def test_invalid_destination():
    with pytest.raises(ValueError):
        find_cheapest_route(
            "Mumbai",
            "Amsterdam",
        )


def test_invalid_weights():
    with pytest.raises(ValueError):
        find_weighted_route(
            "Mumbai",
            "Rotterdam",
            cost_weight=0,
            time_weight=0,
            distance_weight=0,
            risk_weight=0,
        )