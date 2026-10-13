from datetime import datetime, timezone

from live_intelligence.news.client import (
    search_news,
)
from live_intelligence.news.normalizer import (
    normalize_news_response,
)
from live_intelligence.classification import (
    classify_news_article,
)
from live_intelligence.schemas import (
    NewsArticle,
    NewsResponse,
)


DEFAULT_NEWS_QUERY = (
    '"shipping" OR '
    '"port congestion" OR '
    '"port closure" OR '
    '"shipping delay" OR '
    '"Red Sea" OR '
    '"supply chain disruption"'
)


def fetch_live_news(
    query: str | None = None,
    max_results: int = 10,
) -> NewsResponse:
    effective_query = (
        query.strip()
        if query and query.strip()
        else DEFAULT_NEWS_QUERY
    )

    raw_data = search_news(
        effective_query,
        max_results=max_results,
    )

    articles = normalize_news_response(
        raw_data
    )

    classified_articles: list[NewsArticle] = [
        classify_news_article(article)
        for article in articles
    ]

    provider_notice = None

    information = raw_data.get(
        "information"
    )

    if isinstance(information, dict):
        real_time_info = information.get(
            "realTimeArticles"
        )

        if isinstance(real_time_info, dict):
            message = real_time_info.get(
                "message"
            )

            if isinstance(message, str):
                provider_notice = message

    return NewsResponse(
        query=effective_query,
        total_articles=raw_data.get(
            "totalArticles",
            len(classified_articles),
        ),
        articles=classified_articles,
        provider_notice=provider_notice,
        fetched_at=datetime.now(timezone.utc),
    )