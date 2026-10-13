from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class NewsArticle(BaseModel):
    title: str
    source: Optional[str] = None
    published_at: Optional[datetime] = None
    url: Optional[str] = None
    summary: Optional[str] = None

    location: Optional[str] = None
    affected_port: Optional[str] = None
    event_type: Optional[str] = None
    severity: Optional[str] = None
    confidence: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
    )


class NewsResponse(BaseModel):
    query: str
    total_articles: int
    articles: list[NewsArticle]
    provider_notice: Optional[str] = None
    fetched_at: datetime


class WeatherObservation(BaseModel):
    port_code: str
    port_name: str

    latitude: float
    longitude: float

    observed_at: Optional[datetime] = None

    temperature_c: Optional[float] = None
    relative_humidity_percent: Optional[float] = None
    apparent_temperature_c: Optional[float] = None

    precipitation_mm: Optional[float] = None
    rain_mm: Optional[float] = None

    weather_code: Optional[int] = None

    wind_speed_kmh: Optional[float] = None
    wind_gusts_kmh: Optional[float] = None


class WeatherRiskSignal(BaseModel):
    port_code: str
    weather_code: Optional[int] = None

    risk_level: str
    signal: str
    explanation: str


class WeatherResponse(BaseModel):
    observation: WeatherObservation
    risk_signal: WeatherRiskSignal
    fetched_at: datetime


class LiveAlert(BaseModel):
    alert_type: str
    severity: str

    port_code: Optional[str] = None

    title: str
    message: str

    source: Optional[str] = None
    url: Optional[str] = None

    created_at: datetime


class LiveAlertsResponse(BaseModel):
    alerts: list[LiveAlert]
    generated_at: datetime


class WeatherRefreshResult(BaseModel):
    port_code: str
    status: str
    risk_level: Optional[str] = None
    error: Optional[str] = None


class RefreshResponse(BaseModel):
    news_status: str
    news_articles: int

    weather_results: list[WeatherRefreshResult]

    refreshed_at: datetime