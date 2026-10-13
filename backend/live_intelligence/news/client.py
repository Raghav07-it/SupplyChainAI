from typing import Any

import requests

from live_intelligence.config import (
    GNEWS_API_KEY,
    GNEWS_BASE_URL,
    GNEWS_DEFAULT_LANGUAGE,
    GNEWS_DEFAULT_MAX_RESULTS,
    GNEWS_TIMEOUT_SECONDS,
    is_gnews_configured,
)


class GNewsClientError(Exception):
    """Raised when the GNews provider cannot be used successfully."""


def search_news(
    query: str,
    *,
    max_results: int = GNEWS_DEFAULT_MAX_RESULTS,
    language: str = GNEWS_DEFAULT_LANGUAGE,
) -> dict[str, Any]:
    if not is_gnews_configured():
        raise GNewsClientError(
            "GNews API key is not configured. "
            "Add GNEWS_API_KEY to the backend .env file."
        )

    cleaned_query = query.strip()

    if not cleaned_query:
        raise GNewsClientError("News query cannot be empty.")

    if not 1 <= max_results <= 10:
        raise GNewsClientError(
            "max_results must be between 1 and 10."
        )

    params = {
        "apikey": GNEWS_API_KEY,
        "q": cleaned_query,
        "lang": language,
        "max": max_results,
        "sortby": "publishedAt",
        "in": "title,description",
    }

    url = f"{GNEWS_BASE_URL}/search"

    try:
        response = requests.get(
            url,
            params=params,
            timeout=GNEWS_TIMEOUT_SECONDS,
        )
    except requests.RequestException as error:
        raise GNewsClientError(
            f"Unable to connect to GNews: {error}"
        ) from error

    if response.status_code != 200:
        try:
            provider_error = response.json()
        except ValueError:
            provider_error = response.text

        raise GNewsClientError(
            f"GNews request failed with HTTP "
            f"{response.status_code}: {provider_error}"
        )

    try:
        data = response.json()
    except ValueError as error:
        raise GNewsClientError(
            "GNews returned an invalid JSON response."
        ) from error

    if not isinstance(data, dict):
        raise GNewsClientError(
            "GNews returned an unexpected response format."
        )

    return data