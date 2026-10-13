from sqlalchemy import func, select
from sqlalchemy.orm import Session

from models import Disruption, Port


def disruption_summary(db: Session) -> dict:
    total = db.scalar(select(func.count()).select_from(Disruption)) or 0

    by_port = db.execute(
        select(
            Port.port_code,
            func.count(Disruption.id).label("count"),
        )
        .join(Disruption, Disruption.port_id == Port.id)
        .group_by(Port.port_code)
        .order_by(Port.port_code)
    ).all()

    by_type = db.execute(
        select(
            Disruption.disruption_type,
            func.count(Disruption.id).label("count"),
        )
        .group_by(Disruption.disruption_type)
        .order_by(Disruption.disruption_type)
    ).all()

    by_severity = db.execute(
        select(
            Disruption.severity,
            func.count(Disruption.id).label("count"),
        )
        .group_by(Disruption.severity)
        .order_by(Disruption.severity)
    ).all()

    return {
        "data_notice": "All results are derived from synthetic Phase 4 data.",
        "total_disruptions": total,
        "by_port": [{"port_code": row.port_code, "count": row.count} for row in by_port],
        "by_type": [
            {"disruption_type": row.disruption_type, "count": row.count}
            for row in by_type
        ],
        "by_severity": [
            {"severity": row.severity, "count": row.count}
            for row in by_severity
        ],
    }