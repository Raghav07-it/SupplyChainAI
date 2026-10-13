"""
Automated tests for Phase 5 ML Prediction Pipeline and API Endpoints.
"""

from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from main import app
from disruptions.ml_model import (
    MODEL_FILE,
    load_model_pipeline,
    predict_disruption_severity,
    train_and_evaluate,
)

client = TestClient(app)


def test_train_and_evaluate():
    """Test model training, evaluation metrics generation, and artifact saving."""
    report = train_and_evaluate()
    assert report is not None
    assert "evaluation" in report
    assert "overall_accuracy" in report["evaluation"]
    assert report["evaluation"]["overall_accuracy"] > 0
    assert "baseline_comparison" in report
    assert report["dataset"]["is_synthetic"] is True
    assert MODEL_FILE.exists()


def test_load_model_pipeline():
    """Test loading model pipeline from serialized artifact."""
    pipeline, metrics = load_model_pipeline()
    assert pipeline is not None
    assert hasattr(pipeline, "predict")
    assert isinstance(metrics, dict)


def test_predict_disruption_severity_valid():
    """Test prediction inference helper with valid disruption inputs."""
    res = predict_disruption_severity(
        port_code="INMUM",
        disruption_type="severe_weather",
        capacity_impact_percent=85.0,
        estimated_delay_hours=120.0,
        estimated_cost_impact_usd=250000.0,
    )

    assert "predicted_severity" in res
    assert res["predicted_severity"] in ["low", "medium", "high", "critical"]
    assert "confidence_scores" in res
    assert isinstance(res["confidence_scores"], dict)
    assert res["is_synthetic_demo"] is True
    assert "baseline_comparison" in res
    assert "heuristic_baseline_severity" in res["baseline_comparison"]


def test_predict_disruption_severity_reproducibility():
    """Test that model predictions are deterministic for identical inputs."""
    res1 = predict_disruption_severity(
        port_code="SGSIN",
        disruption_type="port_congestion",
        capacity_impact_percent=30.0,
        estimated_delay_hours=20.0,
        estimated_cost_impact_usd=40000.0,
    )

    res2 = predict_disruption_severity(
        port_code="SGSIN",
        disruption_type="port_congestion",
        capacity_impact_percent=30.0,
        estimated_delay_hours=20.0,
        estimated_cost_impact_usd=40000.0,
    )

    assert res1["predicted_severity"] == res2["predicted_severity"]
    assert res1["confidence_scores"] == res2["confidence_scores"]


def test_ml_predict_api_endpoint():
    """Test FastAPI POST /disruptions/ml-predict endpoint."""
    payload = {
        "port_code": "NLRTM",
        "disruption_type": "labor_strike",
        "capacity_impact_percent": 90.0,
        "estimated_delay_hours": 180.0,
        "estimated_cost_impact_usd": 600000.0,
    }

    response = client.post("/disruptions/ml-predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_severity"] in ["low", "medium", "high", "critical"]
    assert data["is_synthetic_demo"] is True
    assert "confidence_scores" in data


def test_ml_model_info_api_endpoint():
    """Test FastAPI GET /disruptions/ml-model/info endpoint."""
    response = client.get("/disruptions/ml-model/info")
    assert response.status_code == 200
    data = response.json()
    assert "evaluation" in data
    assert "baseline_comparison" in data
    assert "disclaimer" in data
