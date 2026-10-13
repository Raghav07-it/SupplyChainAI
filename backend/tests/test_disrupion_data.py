import pytest

from disruptions.ingest import parse_row


def test_rejects_non_synthetic_row():
    row = {
        "event_code": "TEST-001",
        "port_code": "INMUM",
        "disruption_type": "severe_weather",
        "severity": "high",
        "status": "resolved",
        "started_at": "2025-01-01T10:00:00",
        "ended_at": "2025-01-03T10:00:00",
        "estimated_delay_hours": "48",
        "estimated_cost_impact_usd": "100000",
        "capacity_impact_percent": "50",
        "description": "Test record",
        "source": "real_source",
        "is_synthetic": "false",
    }

    with pytest.raises(ValueError, match="synthetic"):
        parse_row(row)


def test_rejects_invalid_port():
    row = {
        "event_code": "TEST-002",
        "port_code": "INVALID",
        "disruption_type": "severe_weather",
        "severity": "high",
        "status": "resolved",
        "started_at": "2025-01-01T10:00:00",
        "ended_at": "",
        "estimated_delay_hours": "48",
        "estimated_cost_impact_usd": "100000",
        "capacity_impact_percent": "50",
        "description": "Test record",
        "source": "synthetic_phase4",
        "is_synthetic": "true",
    }

    with pytest.raises(ValueError, match="port_code"):
        parse_row(row)