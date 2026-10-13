from datetime import datetime
from typing import Any

from live_intelligence.schemas import NewsArticle


def _parse_published_at(value: Any) -> datetime | None:
    if not isinstance(value, str) or not value.strip():
        return None

    try:
        return datetime.fromisoformat(
            value.replace("Z", "+00:00")
        )
    except ValueError:
        return None


def normalize_news_article(
    raw_article: dict[str, Any],
) -> NewsArticle:
    if not isinstance(raw_article, dict):
        raise ValueError(
            "News article must be a dictionary."
        )

    title = raw_article.get("title")

    if not isinstance(title, str) or not title.strip():
        raise ValueError(
            "News article is missing a valid title."
        )

    source_name = None

    source_data = raw_article.get("source")

    if isinstance(source_data, dict):
        raw_source_name = source_data.get("name")

        if (
            isinstance(raw_source_name, str)
            and raw_source_name.strip()
        ):
            source_name = raw_source_name.strip()

    description = raw_article.get("description")

    if not isinstance(description, str):
        description = None

    url = raw_article.get("url")

    if not isinstance(url, str) or not url.strip():
        url = None

    return NewsArticle(
        title=title.strip(),
        source=source_name,
        published_at=_parse_published_at(
            raw_article.get("publishedAt")
        ),
        url=url,
        summary=(
            description.strip()
            if description
            else None
        ),
    )


def normalize_news_response(
    raw_data: dict[str, Any],
) -> list[NewsArticle]:
    if not isinstance(raw_data, dict):
        raise ValueError(
            "News response must be a dictionary."
        )

    raw_articles = raw_data.get("articles", [])

    if not isinstance(raw_articles, list):
        raise ValueError(
            "News response contains an invalid articles field."
        )

    articles: list[NewsArticle] = []

    for raw_article in raw_articles:
        if not isinstance(raw_article, dict):
            continue

        try:
            article = normalize_news_article(
                raw_article
            )
        except ValueError:
            continue

        articles.append(article)

    return articles