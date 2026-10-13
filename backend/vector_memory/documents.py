def format_disruption_document(
    disruption,
    port_code: str | None = None,
) -> str:
    """
    Convert a structured Disruption database record
    into meaningful natural-language text for embedding.
    """

    started_at = (
        disruption.started_at.isoformat()
        if disruption.started_at
        else "unknown"
    )

    ended_at = (
        disruption.ended_at.isoformat()
        if disruption.ended_at
        else "ongoing"
    )

    duration_text = "unknown"

    if disruption.started_at and disruption.ended_at:
        duration_hours = (
            disruption.ended_at - disruption.started_at
        ).total_seconds() / 3600

        duration_text = f"{duration_hours:.2f} hours"

    location = port_code if port_code else str(disruption.port_id)

    document = (
        f"Historical supply chain disruption event "
        f"{disruption.event_code}. "

        f"Port: {location}. "

        f"Disruption Type: {disruption.disruption_type}. "

        f"Severity: {disruption.severity}. "

        f"Status: {disruption.status}. "

        f"Started At: {started_at}. "

        f"Ended At: {ended_at}. "

        f"Observed Duration: {duration_text}. "

        f"Estimated Delay: "
        f"{float(disruption.estimated_delay_hours):.2f} hours. "

        f"Estimated Cost Impact: "
        f"${float(disruption.estimated_cost_impact_usd):,.2f}. "

        f"Capacity Impact: "
        f"{float(disruption.capacity_impact_percent):.2f}%. "

        f"Description: {disruption.description}. "

        f"Source: {disruption.source}."
    )

    return document