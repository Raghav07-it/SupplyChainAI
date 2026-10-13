from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from live_intelligence.schemas import (
    WeatherResponse,
)
from live_intelligence.weather.client import (
    get_current_weather,
)
from live_intelligence.weather.normalizer import (
    normalize_weather,
)
from live_intelligence.weather.risk import (
    calculate_weather_risk,
)
from models import Port


def fetch_weather_for_port(
    port_code: str,
    db: Session,
) -> WeatherResponse:
    normalized_port_code = (
        port_code.strip().upper()
    )

    port = db.scalar(
        select(Port).where(
            Port.port_code
            == normalized_port_code
        )
    )

    if not port:
        raise ValueError(
            f"Port '{normalized_port_code}' "
            "was not found in the database."
        )

    raw_data = get_current_weather(
        normalized_port_code
    )

    observation = normalize_weather(
        normalized_port_code,
        raw_data,
    )

    risk_signal = calculate_weather_risk(
        observation
    )

    return WeatherResponse(
        observation=observation,
        risk_signal=risk_signal,
        fetched_at=datetime.now(
            timezone.utc
        ),
    )