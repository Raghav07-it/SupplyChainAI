import csv
from datetime import datetime
from decimal import Decimal
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from database import SessionLocal
from disruptions.constants import (
    DISRUPTION_TYPES,
    PORT_CODES,
    SEVERITIES,
    STATUSES,
)
from models import Disruption, Port


REQUIRED_COLUMNS = {
    "event_code",
    "port_code",
    "disruption_type",
    "severity",
    "status",
    "started_at",
    "ended_at",
    "estimated_delay_hours",
    "estimated_cost_impact_usd",
    "capacity_impact_percent",
    "description",
    "source",
    "is_synthetic",
}


def parse_row(row: dict) -> dict:
    missing = REQUIRED_COLUMNS - set(row)
    if missing:
        raise ValueError(f"CSV is missing required columns: {sorted(missing)}")

    if row["port_code"] not in PORT_CODES:
        raise ValueError(f"Invalid port_code: {row['port_code']}")
    if row["disruption_type"] not in DISRUPTION_TYPES:
        raise ValueError(f"Invalid disruption_type: {row['disruption_type']}")
    if row["severity"] not in SEVERITIES:
        raise ValueError(f"Invalid severity: {row['severity']}")
    if row["status"] not in STATUSES:
        raise ValueError(f"Invalid status: {row['status']}")
    if row["is_synthetic"].lower() != "true":
        raise ValueError("Phase 4 ingestion accepts synthetic records only.")
    if row["source"] != "synthetic_phase4":
        raise ValueError("CSV source must be synthetic_phase4.")

    started_at = datetime.fromisoformat(row["started_at"])
    ended_at = datetime.fromisoformat(row["ended_at"]) if row["ended_at"] else None
    delay = float(row["estimated_delay_hours"])
    cost = Decimal(row["estimated_cost_impact_usd"])
    capacity = float(row["capacity_impact_percent"])

    if delay < 0 or cost < 0 or not 0 <= capacity <= 100:
        raise ValueError(f"Invalid impact values for {row['event_code']}")

    if ended_at and ended_at < started_at:
        raise ValueError(f"ended_at precedes started_at for {row['event_code']}")

    return {
        "event_code": row["event_code"],
        "port_code": row["port_code"],
        "disruption_type": row["disruption_type"],
        "severity": row["severity"],
        "status": row["status"],
        "started_at": started_at,
        "ended_at": ended_at,
        "estimated_delay_hours": delay,
        "estimated_cost_impact_usd": cost,
        "capacity_impact_percent": capacity,
        "description": row["description"],
        "source": row["source"],
        "is_synthetic": True,
    }


def ingest_csv(csv_path: Path, db: Session) -> tuple[int, int]:
    inserted = 0
    skipped = 0

    with csv_path.open(newline="", encoding="utf-8") as csv_file:
        for raw_row in csv.DictReader(csv_file):
            row = parse_row(raw_row)

            existing = db.scalar(
                select(Disruption).where(
                    Disruption.event_code == row["event_code"]
                )
            )
            if existing:
                skipped += 1
                continue

            port = db.scalar(
                select(Port).where(Port.port_code == row["port_code"])
            )
            if not port:
                raise ValueError(
                    f"Port {row['port_code']} does not exist. Run seed_data.py first."
                )

            db.add(
                Disruption(
                    event_code=row["event_code"],
                    port_id=port.id,
                    disruption_type=row["disruption_type"],
                    severity=row["severity"],
                    status=row["status"],
                    started_at=row["started_at"],
                    ended_at=row["ended_at"],
                    estimated_delay_hours=row["estimated_delay_hours"],
                    estimated_cost_impact_usd=row["estimated_cost_impact_usd"],
                    capacity_impact_percent=row["capacity_impact_percent"],
                    description=row["description"],
                    source=row["source"],
                    is_synthetic=row["is_synthetic"],
                )
            )
            inserted += 1

    db.commit()
    return inserted, skipped


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parents[2]
    csv_path = project_root / "data" / "synthetic_disruptions.csv"

    db = SessionLocal()
    try:
        inserted, skipped = ingest_csv(csv_path, db)
        print(f"Import complete. Inserted: {inserted}; skipped: {skipped}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()