from typing import Optional


PORT_KEYWORDS = {
    "INMUM": (
        "mumbai",
        "jawaharlal nehru port",
        "nhava sheva",
        "jnpt",
    ),
    "AEDXB": (
        "dubai",
        "jebel ali",
        "uae",
        "united arab emirates",
    ),
    "SGSIN": (
        "singapore",
        "port of singapore",
    ),
    "NLRTM": (
        "rotterdam",
        "port of rotterdam",
        "netherlands",
        "dutch port",
    ),
}


def detect_location(text: str) -> Optional[str]:
    normalized_text = text.lower()

    location_terms = {
        "Mumbai": PORT_KEYWORDS["INMUM"],
        "Dubai": PORT_KEYWORDS["AEDXB"],
        "Singapore": PORT_KEYWORDS["SGSIN"],
        "Rotterdam": PORT_KEYWORDS["NLRTM"],
    }

    for location, keywords in location_terms.items():
        if any(
            keyword in normalized_text
            for keyword in keywords
        ):
            return location

    return None


def detect_port_code(text: str) -> Optional[str]:
    normalized_text = text.lower()

    for port_code, keywords in PORT_KEYWORDS.items():
        if any(
            keyword in normalized_text
            for keyword in keywords
        ):
            return port_code

    return None