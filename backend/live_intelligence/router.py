from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db

from live_intelligence.news.client import (
    GNewsClientError,
)
from live_intelligence.schemas import (
    LiveAlertsResponse,
    NewsResponse,
    RefreshResponse,
    WeatherResponse,
)
from live_intelligence.service import (
    get_live_alerts,
    get_news,
    get_weather,
    refresh_live_intelligence,
)
from live_intelligence.weather.client import (
    WeatherClientError,
)


router = APIRouter(
    prefix="/live",
    tags=["Live Intelligence"],
)


@router.get(
    "/news",
    response_model=NewsResponse,
)
def live_news(
    query: str | None = Query(
        default=None,
        min_length=3,
        max_length=200,
    ),
    max_results: int = Query(
        default=10,
        ge=1,
        le=10,
    ),
):
    try:
        return get_news(
            query=query,
            max_results=max_results,
        )

    except GNewsClientError as error:
        raise HTTPException(
            status_code=502,
            detail=str(error),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Live news processing failed: {error}",
        ) from error


@router.get(
    "/weather/{port_code}",
    response_model=WeatherResponse,
)
def live_weather(
    port_code: str,
    db: Session = Depends(get_db),
):
    try:
        return get_weather(
            port_code,
            db,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error

    except WeatherClientError as error:
        raise HTTPException(
            status_code=502,
            detail=str(error),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Live weather processing failed: "
                f"{error}"
            ),
        ) from error


@router.get(
    "/alerts",
    response_model=LiveAlertsResponse,
)
def live_alerts():
    return get_live_alerts()


@router.post(
    "/refresh",
    response_model=RefreshResponse,
)
def refresh_live(
    db: Session = Depends(get_db),
):
    return refresh_live_intelligence(db)