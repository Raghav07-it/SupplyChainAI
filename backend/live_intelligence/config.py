import os

from dotenv import load_dotenv


load_dotenv()


# ---------------------------------------------------------------------------
# News provider
# ---------------------------------------------------------------------------

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")

GNEWS_BASE_URL = "https://gnews.io/api/v4"

GNEWS_DEFAULT_LANGUAGE = "en"
GNEWS_DEFAULT_COUNTRY = "us"
GNEWS_DEFAULT_MAX_RESULTS = 10
GNEWS_TIMEOUT_SECONDS = 15


# ---------------------------------------------------------------------------
# Weather provider
# ---------------------------------------------------------------------------

OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast"

OPEN_METEO_TIMEOUT_SECONDS = 15


# ---------------------------------------------------------------------------
# Project ports
#
# Coordinates are used only for weather API requests.
# The port codes themselves remain the source of truth in PostgreSQL.
# ---------------------------------------------------------------------------

PORT_WEATHER_LOCATIONS = {
    "INMUM": {
        "name": "Mumbai",
        "latitude": 18.9388,
        "longitude": 72.8354,
    },
    "AEDXB": {
        "name": "Dubai",
        "latitude": 25.2697,
        "longitude": 55.3095,
    },
    "SGSIN": {
        "name": "Singapore",
        "latitude": 1.2644,
        "longitude": 103.8223,
    },
    "NLRTM": {
        "name": "Rotterdam",
        "latitude": 51.9244,
        "longitude": 4.4777,
    },
}


def is_gnews_configured() -> bool:
    """Return True when a GNews API key is available."""
    return bool(GNEWS_API_KEY)