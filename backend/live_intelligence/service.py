from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from live_intelligence.news.service import (
    fetch_live_news,
)
from live_intelligence.schemas import (
    LiveAlert,
    LiveAlertsResponse,
    NewsResponse,
    RefreshResponse,
    WeatherRefreshResult,
    WeatherResponse,
)
from live_intelligence.weather.service import (
    fetch_weather_for_port,
)
from disruptions.constants import PORT_CODES


_cached_news: NewsResponse | None = None

_cached_weather: dict[
    str,
    WeatherResponse,
] = {}


def get_news(
    query: str | None = None,
    max_results: int = 10,
) -> NewsResponse:
    global _cached_news

    response = fetch_live_news(
        query=query,
        max_results=max_results,
    )

    _cached_news = response

    return response


def get_weather(
    port_code: str,
    db: Session,
) -> WeatherResponse:
    normalized_port_code = (
        port_code.strip().upper()
    )

    response = fetch_weather_for_port(
        normalized_port_code,
        db,
    )

    _cached_weather[
        normalized_port_code
    ] = response

    return response


def get_live_alerts() -> LiveAlertsResponse:
    alerts: list[LiveAlert] = []

    if _cached_news:
        for article in _cached_news.articles:
            if article.severity not in {
                "high",
                "critical",
            }:
                continue

            alerts.append(
                LiveAlert(
                    alert_type="news",
                    severity=article.severity,
                    port_code=article.affected_port,
                    title=article.title,
                    message=(
                        article.summary
                        or "Potential supply-chain "
                        "disruption reported in news."
                    ),
                    source=article.source,
                    url=article.url,
                    created_at=(
                        article.published_at
                        or _cached_news.fetched_at
                    ),
                )
            )

    for weather in _cached_weather.values():
        risk = weather.risk_signal

        if risk.risk_level not in {
            "medium",
            "high",
        }:
            continue

        alerts.append(
            LiveAlert(
                alert_type="weather",
                severity=risk.risk_level,
                port_code=(
                    weather.observation.port_code
                ),
                title=(
                    f"Weather risk at "
                    f"{weather.observation.port_name}"
                ),
                message=risk.explanation,
                source="Open-Meteo",
                url=None,
                created_at=weather.fetched_at,
            )
        )

    severity_order = {
        "critical": 0,
        "high": 1,
        "medium": 2,
        "low": 3,
    }

    alerts.sort(
        key=lambda alert: (
            severity_order.get(
                alert.severity,
                99,
            ),
            -alert.created_at.timestamp(),
        )
    )

    return LiveAlertsResponse(
        alerts=alerts,
        generated_at=datetime.now(
            timezone.utc
        ),
    )


def refresh_live_intelligence(
    db: Session,
) -> RefreshResponse:
    global _cached_news

    refreshed_at = datetime.now(
        timezone.utc
    )

    news_status = "success"
    news_articles = 0

    try:
        news_response = fetch_live_news()

        _cached_news = news_response

        news_articles = len(
            news_response.articles
        )

    except Exception:
        news_status = "failed"

    weather_results: list[
        WeatherRefreshResult
    ] = []

    for port_code in PORT_CODES:
        try:
            weather_response = (
                fetch_weather_for_port(
                    port_code,
                    db,
                )
            )

            _cached_weather[
                port_code
            ] = weather_response

            weather_results.append(
                WeatherRefreshResult(
                    port_code=port_code,
                    status="success",
                    risk_level=(
                        weather_response
                        .risk_signal
                        .risk_level
                    ),
                )
            )

        except Exception as error:
            weather_results.append(
                WeatherRefreshResult(
                    port_code=port_code,
                    status="failed",
                    error=str(error),
                )
            )

    return RefreshResponse(
        news_status=news_status,
        news_articles=news_articles,
        weather_results=weather_results,
        refreshed_at=refreshed_at,
    )