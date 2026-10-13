from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from disruptions.analytics import disruption_summary
from disruptions.ml_model import load_model_pipeline, predict_disruption_severity
from disruptions.risk import calculate_port_risk
from database import get_db
from models import Disruption, Port
from schemas import (
    BaselineRiskResponse,
    DisruptionListResponse,
    DisruptionResponse,
    MLModelInfoResponse,
    MLPredictionRequest,
    MLPredictionResponse,
)

router = APIRouter(prefix="/disruptions", tags=["Disruptions"])


@router.get("", response_model=DisruptionListResponse)
def list_disruptions(
    port_code: str | None = Query(default=None),
    severity: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    statement = select(Disruption).order_by(Disruption.started_at.desc())

    if port_code:
        statement = statement.join(Port).where(Port.port_code == port_code)
    if severity:
        statement = statement.where(Disruption.severity == severity)

    total = db.scalar(
        select(func.count()).select_from(statement.subquery())
    ) or 0

    items = db.scalars(statement.offset(offset).limit(limit)).all()
    return {"total": total, "items": items}


@router.get("/analytics/summary")
def get_disruption_summary(db: Session = Depends(get_db)):
    return disruption_summary(db)


@router.get("/risk/{port_code}", response_model=BaselineRiskResponse)
def get_port_risk(port_code: str, db: Session = Depends(get_db)):
    try:
        return calculate_port_risk(port_code, db)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post("/ml-predict", response_model=MLPredictionResponse)
def predict_ml_severity(payload: MLPredictionRequest):
    """
    Phase 5 ML Disruption Severity Prediction Endpoint.
    Uses trained RandomForest classifier on synthetic disruption dataset.
    """
    try:
        return predict_disruption_severity(
            port_code=payload.port_code,
            disruption_type=payload.disruption_type,
            capacity_impact_percent=payload.capacity_impact_percent,
            estimated_delay_hours=payload.estimated_delay_hours,
            estimated_cost_impact_usd=payload.estimated_cost_impact_usd,
        )
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.get("/ml-model/info", response_model=MLModelInfoResponse)
def get_ml_model_info():
    """
    Returns evaluation metrics, hyperparameters, dataset info, and baseline comparison
    for the Phase 5 ML prediction pipeline.
    """
    try:
        _, metrics = load_model_pipeline()
        return metrics
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))