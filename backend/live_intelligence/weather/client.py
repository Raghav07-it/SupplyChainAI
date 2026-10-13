from typing import Any

import requests

from live_intelligence.config import (
    OPEN_METEO_BASE_URL,
    OPEN_METEO_TIMEOUT_SECONDS,
    PORT_WEATHER_LOCATIONS,
)


class WeatherClientError(Exception):
    """Raised when the Open-Meteo provider cannot be used successfully."""


def get_current_weather(port_code: str) -> dict[str, Any]:
    """
    Retrieve current weather for one of the project's four ports.
    """

    normalized_port_code = port_code.strip().upper()

    location = PORT_WEATHER_LOCATIONS.get(normalized_port_code)

    if location is None:
        supported_ports = ", ".join(PORT_WEATHER_LOCATIONS.keys())

        raise WeatherClientError(
            f"Unsupported port code '{port_code}'. "
            f"Supported ports: {supported_ports}"
        )

    params = {
        "latitude": location["latitude"],
        "longitude": location["longitude"],
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "apparent_temperature,"
            "precipitation,"
            "rain,"
            "weather_code,"
            "wind_speed_10m,"
            "wind_gusts_10m"
        ),
        "timezone": "UTC",
    }

    try:
        response = requests.get(
            OPEN_METEO_BASE_URL,
            params=params,
            timeout=OPEN_METEO_TIMEOUT_SECONDS,
        )
    except requests.RequestException as error:
        raise WeatherClientError(
            f"Unable to connect to Open-Meteo: {error}"
        ) from error

    if response.status_code != 200:
        try:
            provider_error = response.json()
        except ValueError:
            provider_error = response.text

        raise WeatherClientError(
            f"Open-Meteo request failed with HTTP "
            f"{response.status_code}: {provider_error}"
        )

    try:
        data = response.json()
    except ValueError as error:
        raise WeatherClientError(
            "Open-Meteo returned an invalid JSON response."
        ) from error

    if not isinstance(data, dict):
        raise WeatherClientError(
            "Open-Meteo returned an unexpected response format."
        )

    return data