import pytest

from routing.autonomous import (
    _calculate_score,
    _normalize_weights,
    run_autonomous_routing,
)


def test_phase9_weight_normalization():

    weights = _normalize_weights(
        0.30,
        0.20,
        0.20,
        0.30,
    )

    total = sum(weights.values())

    assert total == pytest.approx(
        1.0
    )

    assert weights["cost_weight"] == pytest.approx(
        0.30
    )

    assert weights["risk_weight"] == pytest.approx(
        0.30
    )


def test_phase9_rejects_negative_weights():

    with pytest.raises(
        ValueError
    ):

        _normalize_weights(
            -0.1,
            0.2,
            0.2,
            0.7,
        )


def test_phase9_rejects_zero_weights():

    with pytest.raises(
        ValueError
    ):

        _normalize_weights(
            0,
            0,
            0,
            0,
        )


def test_phase9_score_is_numeric():

    weights = _normalize_weights(
        0.30,
        0.20,
        0.20,
        0.30,
    )

    score = _calculate_score(
        cost=17000,
        time=240,
        distance=10000,
        risk=50,
        weights=weights,
    )

    assert isinstance(
        score,
        float,
    )

    assert score > 0


def test_phase9_autonomous_routing():

    result = run_autonomous_routing(
        origin_port_code="INMUM",
        destination_port_code="NLRTM",
        cost_weight=0.30,
        time_weight=0.20,
        distance_weight=0.20,
        risk_weight=0.30,
        candidate_count=5,
        risk_level="high",
        affected_port_code="AEDXB",
        event_severity="high",
        disruption_probability=0.70,
    )

    assert result["status"] == "success"

    assert result[
        "origin_port_code"
    ] == "INMUM"

    assert result[
        "destination_port_code"
    ] == "NLRTM"

    assert result[
        "candidate_count"
    ] >= 1

    assert len(
        result["candidate_routes"]
    ) >= 1

    assert result[
        "decision"
    ] in {
        "KEEP_ROUTE",
        "REROUTE",
    }


def test_phase9_candidate_routes_have_metrics():

    result = run_autonomous_routing(
        origin_port_code="INMUM",
        destination_port_code="NLRTM",
        candidate_count=5,
    )

    for route in result[
        "candidate_routes"
    ]:

        assert "route" in route
        assert "total_cost" in route
        assert "total_distance_km" in route
        assert "total_time_hours" in route
        assert "risk_score" in route
        assert "weighted_score" in route

        assert route[
            "total_cost"
        ] >= 0

        assert route[
            "total_distance_km"
        ] >= 0

        assert route[
            "total_time_hours"
        ] >= 0

        assert 0 <= route[
            "risk_score"
        ] <= 100


def test_phase9_affected_port_is_recorded():

    result = run_autonomous_routing(
        origin_port_code="INMUM",
        destination_port_code="NLRTM",
        affected_port_code="AEDXB",
        event_severity="critical",
        disruption_probability=0.90,
    )

    assert result[
        "affected_port_code"
    ] == "AEDXB"

    found_affected_port = False

    for candidate in result[
        "candidate_routes"
    ]:

        if "AEDXB" in candidate[
            "affected_ports"
        ]:
            found_affected_port = True

    assert found_affected_port


def test_phase9_invalid_same_port():

    with pytest.raises(
        ValueError
    ):

        run_autonomous_routing(
            origin_port_code="INMUM",
            destination_port_code="INMUM",
        )