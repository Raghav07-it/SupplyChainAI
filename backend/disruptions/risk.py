from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from models import Disruption, Port

SEVERITY_POINTS = {
    "low": 5,
    "medium": 12,
    "high": 22,
    "critical": 35,
}


def calculate_port_risk(port_code: str, db: Session) -> dict:
    port = db.scalar(select(Port).where(Port.port_code == port_code))
    if not port:
        raise ValueError(f"Port '{port_code}' does not exist.")

    cutoff = datetime.now() - timedelta(days=365)

    disruptions = db.scalars(
        select(Disruption).where(
            Disruption.port_id == port.id,
            Disruption.started_at >= cutoff,
        )
    ).all()

    severity_score = sum(SEVERITY_POINTS[item.severity] for item in disruptions)
    average_capacity = (
        sum(item.capacity_impact_percent for item in disruptions) / len(disruptions)
        if disruptions
        else 0
    )
    active_count = sum(item.status in ("active", "monitoring") for item in disruptions)

    score = min(
        100,
        round(
            severity_score * 0.6
            + min(30, average_capacity * 0.3)
            + min(20, active_count * 5),
            2,
        ),
    )

    if score < 30:
        level = "low"
    elif score < 60:
        level = "medium"
    elif score < 80:
        level = "high"
    else:
        level = "critical"

    return {
        "port_code": port_code,
        "risk_score": score,
        "risk_level": level,
        "disruption_count": len(disruptions),
        "explanation": [
            "Baseline heuristic only; it is not a machine-learning prediction.",
            f"{len(disruptions)} synthetic disruptions were considered from the last 365 days.",
            f"Average synthetic capacity impact was {average_capacity:.2f}%.",
            f"{active_count} synthetic disruptions are active or under monitoring.",
        ],
    }