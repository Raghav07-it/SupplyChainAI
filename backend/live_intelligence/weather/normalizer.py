from datetime import datetime
from typing import Any

from live_intelligence.config import PORT_WEATHER_LOCATIONS
from live_intelligence.schemas import WeatherObservation


def normalize_weather(
    port_code: str,
    raw_data: dict[str, Any],
) -> WeatherObservation:
    normalized_port_code = port_code.strip().upper()

    location = PORT_WEATHER_LOCATIONS.get(normalized_port_code)

    if location is None:
        raise ValueError(f"Unsupported port code: {port_code}")

    current = raw_data.get("current")

    if not isinstance(current, dict):
        raise ValueError("Weather response does not contain valid current data.")

    observed_at = None

    raw_time = current.get("time")

    if raw_time:
        try:
            observed_at = datetime.fromisoformat(raw_time)
        except (TypeError, ValueError):
            observed_at = None

    return WeatherObservation(
        port_code=normalized_port_code,
        port_name=location["name"],
        latitude=float(raw_data.get("latitude", location["latitude"])),
        longitude=float(raw_data.get("longitude", location["longitude"])),
        observed_at=observed_at,
        temperature_c=current.get("temperature_2m"),
        relative_humidity_percent=current.get("relative_humidity_2m"),
        apparent_temperature_c=current.get("apparent_temperature"),
        precipitation_mm=current.get("precipitation"),
        rain_mm=current.get("rain"),
        weather_code=current.get("weather_code"),
        wind_speed_kmh=current.get("wind_speed_10m"),
        wind_gusts_kmh=current.get("wind_gusts_10m"),
    )