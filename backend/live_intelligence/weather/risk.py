from live_intelligence.schemas import (
    WeatherObservation,
    WeatherRiskSignal,
)


def calculate_weather_risk(
    observation: WeatherObservation,
) -> WeatherRiskSignal:
    weather_code = observation.weather_code
    wind_gusts = (
        observation.wind_gusts_kmh or 0.0
    )
    precipitation = (
        observation.precipitation_mm or 0.0
    )

    if (
        wind_gusts >= 70
        or weather_code in {95, 96, 99}
    ):
        risk_level = "high"
        signal = "severe_weather_risk"

        explanation = (
            "Current weather conditions indicate "
            "a potentially significant operational "
            "risk for port and transport activities."
        )

    elif (
        wind_gusts >= 45
        or precipitation >= 10
        or weather_code in {
            65,
            67,
            75,
            82,
        }
    ):
        risk_level = "medium"
        signal = "adverse_weather_risk"

        explanation = (
            "Current weather conditions may affect "
            "port or transport operations and should "
            "be monitored."
        )

    else:
        risk_level = "low"
        signal = "normal_weather"

        explanation = (
            "Current weather conditions do not "
            "indicate a significant weather-related "
            "supply-chain risk."
        )

    return WeatherRiskSignal(
        port_code=observation.port_code,
        weather_code=weather_code,
        risk_level=risk_level,
        signal=signal,
        explanation=explanation,
    )