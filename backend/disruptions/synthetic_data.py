import csv
import random
from datetime import datetime, timedelta
from pathlib import Path

from disruptions.constants import (
    DISRUPTION_TYPES,
    PORT_CODES,
    SEVERITIES,
    STATUSES,
)

RANDOM_SEED = 42
RECORDS_PER_PORT = 120

TYPE_DETAILS = {
    "severe_weather": "Synthetic severe weather conditions reduced terminal operations.",
    "port_congestion": "Synthetic vessel backlog created elevated berth waiting times.",
    "labor_strike": "Synthetic labor action reduced terminal handling capacity.",
    "geopolitical_conflict": "Synthetic regional security conditions affected shipping operations.",
    "equipment_failure": "Synthetic terminal equipment outage slowed container handling.",
    "customs_delay": "Synthetic customs processing backlog delayed cargo clearance.",
}

SEVERITY_RANGES = {
    "low": (2, 12, 1_000, 15_000, 2, 15),
    "medium": (12, 48, 15_000, 75_000, 15, 35),
    "high": (48, 144, 75_000, 300_000, 35, 70),
    "critical": (144, 360, 300_000, 1_000_000, 70, 100),
}


def generate_synthetic_disruptions():
    randomizer = random.Random(RANDOM_SEED)
    records = []
    start_date = datetime(2023, 1, 1)

    for port_code in PORT_CODES:
        for sequence in range(1, RECORDS_PER_PORT + 1):
            severity = randomizer.choices(
                SEVERITIES,
                weights=(35, 35, 22, 8),
                k=1,
            )[0]

            disruption_type = randomizer.choice(DISRUPTION_TYPES)
            delay_min, delay_max, cost_min, cost_max, capacity_min, capacity_max = (
                SEVERITY_RANGES[severity]
            )

            started_at = start_date + timedelta(
                days=randomizer.randint(0, 1095),
                hours=randomizer.randint(0, 23),
            )
            delay_hours = round(randomizer.uniform(delay_min, delay_max), 2)

            if severity == "critical":
                status = randomizer.choice(("resolved", "monitoring"))
            else:
                status = randomizer.choice(STATUSES)

            ended_at = (
                started_at + timedelta(hours=delay_hours)
                if status == "resolved"
                else None
            )

            records.append(
                {
                    "event_code": f"SYN-{port_code}-{sequence:03d}",
                    "port_code": port_code,
                    "disruption_type": disruption_type,
                    "severity": severity,
                    "status": status,
                    "started_at": started_at.isoformat(),
                    "ended_at": ended_at.isoformat() if ended_at else "",
                    "estimated_delay_hours": delay_hours,
                    "estimated_cost_impact_usd": round(
                        randomizer.uniform(cost_min, cost_max),
                        2,
                    ),
                    "capacity_impact_percent": round(
                        randomizer.uniform(capacity_min, capacity_max),
                        2,
                    ),
                    "description": TYPE_DETAILS[disruption_type],
                    "source": "synthetic_phase4",
                    "is_synthetic": "true",
                }
            )

    return records


def write_synthetic_csv(output_path: Path):
    records = generate_synthetic_disruptions()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=records[0].keys())
        writer.writeheader()
        writer.writerows(records)

    return len(records)


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parents[2]
    destination = project_root / "data" / "synthetic_disruptions.csv"
    record_count = write_synthetic_csv(destination)
    print(f"Created {record_count} SYNTHETIC disruption records at {destination}")