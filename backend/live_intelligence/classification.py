from live_intelligence.port_mapping import (
    detect_location,
    detect_port_code,
)
from live_intelligence.schemas import NewsArticle


EVENT_KEYWORDS = {
    "severe_weather": (
        "hurricane",
        "cyclone",
        "typhoon",
        "storm",
        "flood",
        "flooding",
        "extreme weather",
        "severe weather",
    ),
    "port_congestion": (
        "port congestion",
        "port congestion",
        "container backlog",
        "port backlog",
        "shipping delays",
        "shipping delay",
        "vessel delays",
        "vessel delay",
    ),
    "labor_strike": (
        "strike",
        "strikes",
        "labor strike",
        "labour strike",
        "dockworker strike",
        "dockworkers strike",
        "workers strike",
    ),
    "geopolitical_conflict": (
        "war",
        "conflict",
        "missile",
        "attack",
        "airstrike",
        "military attack",
        "geopolitical",
        "red sea",
        "houthi",
    ),
    "customs_delay": (
        "customs delay",
        "customs delays",
        "customs backlog",
        "border delay",
        "border delays",
    ),
    "equipment_failure": (
        "crane failure",
        "equipment failure",
        "terminal equipment",
        "crane breakdown",
    ),
}


HIGH_SEVERITY_TERMS = (
    "closed",
    "closure",
    "shutdown",
    "blocked",
    "major disruption",
    "severe disruption",
    "attack",
    "airstrike",
    "war",
    "hurricane",
    "cyclone",
    "typhoon",
)


MEDIUM_SEVERITY_TERMS = (
    "delay",
    "delays",
    "congestion",
    "strike",
    "storm",
    "flood",
    "warning",
    "disruption",
)


def _combined_text(article: NewsArticle) -> str:
    return " ".join(
        part
        for part in (
            article.title,
            article.summary,
        )
        if part
    ).lower()


def detect_event_type(
    text: str,
) -> str | None:
    normalized_text = text.lower()

    for event_type, keywords in EVENT_KEYWORDS.items():
        if any(
            keyword in normalized_text
            for keyword in keywords
        ):
            return event_type

    return None


def detect_severity(
    text: str,
    event_type: str | None,
) -> str | None:
    normalized_text = text.lower()

    if any(
        term in normalized_text
        for term in HIGH_SEVERITY_TERMS
    ):
        return "high"

    if any(
        term in normalized_text
        for term in MEDIUM_SEVERITY_TERMS
    ):
        return "medium"

    if event_type:
        return "low"

    return None


def classify_news_article(
    article: NewsArticle,
) -> NewsArticle:
    text = _combined_text(article)

    location = detect_location(text)
    affected_port = detect_port_code(text)
    event_type = detect_event_type(text)
    severity = detect_severity(
        text,
        event_type,
    )

    confidence = None

    if affected_port and event_type:
        confidence = 0.85
    elif event_type:
        confidence = 0.70
    elif location:
        confidence = 0.55

    return article.model_copy(
        update={
            "location": location,
            "affected_port": affected_port,
            "event_type": event_type,
            "severity": severity,
            "confidence": confidence,
        }
    )