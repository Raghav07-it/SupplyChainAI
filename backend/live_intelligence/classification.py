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

    operational_impact = article.operational_impact
    if not operational_impact:
        if event_type == "geopolitical_conflict":
            operational_impact = "Heightened security advisory; expect 8-14 day ocean transit diversions and bunker risk surcharges."
        elif event_type == "port_congestion":
            operational_impact = f"Quay dwell times extended at {location or 'berthing hub'}; advise pre-clearing manifests to avoid demurrage."
        elif event_type == "severe_weather":
            operational_impact = "Vessel anchorage holds and crane shutdowns expected; monitor feeder schedules for delay cascade."
        elif event_type == "canal_transit":
            operational_impact = "Canal booking slot constraints in effect; consider rail landbridge or alternative maritime corridors."
        elif severity in ("high", "critical"):
            operational_impact = f"Corridor advisory in {location or 'transit lane'}; potential delays of 24-48 hours on connected sailings."
        else:
            operational_impact = f"Active maritime signal for {location or 'global shipping lanes'}; current schedule variance remains within nominal tolerances."

    return article.model_copy(
        update={
            "location": location,
            "affected_port": affected_port,
            "event_type": event_type,
            "severity": severity,
            "confidence": confidence,
            "operational_impact": operational_impact,
        }
    )