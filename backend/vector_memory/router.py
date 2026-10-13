from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db

from .embeddings import get_embedding_dimension
from .store import (
    get_vector_memory_stats,
    index_historical_disruptions,
    search_disruption_memory,
)


router = APIRouter(
    prefix="/vector-memory",
    tags=["Vector Memory"],
)


class VectorSearchRequest(BaseModel):
    query: str = Field(
        min_length=3,
        description="Natural-language disruption query",
    )

    top_k: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of similar historical events to retrieve",
    )

    port_code: str | None = Field(
        default=None,
        description="Optional port filter",
    )

    severity: Literal[
        "low",
        "medium",
        "high",
        "critical",
    ] | None = Field(
        default=None,
        description="Optional severity filter",
    )

    disruption_type: str | None = Field(
        default=None,
        description="Optional disruption type filter",
    )

    status: str | None = Field(
        default=None,
        description="Optional status filter",
    )


@router.get("/stats")
def vector_memory_stats():
    """
    Return ChromaDB statistics.
    """

    try:
        stats = get_vector_memory_stats()

        stats["embedding_model"] = (
            "sentence-transformers/all-MiniLM-L6-v2"
        )

        stats["embedding_dimension"] = (
            get_embedding_dimension()
        )

        return stats

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Vector memory error: {exc}",
        )


@router.post("/ingest")
def ingest_vector_memory(
    db: Session = Depends(get_db),
):
    """
    Index all historical disruptions from PostgreSQL
    into ChromaDB.
    """

    try:
        result = index_historical_disruptions(
            db
        )

        return {
            "status": "success",
            **result,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Vector ingestion error: {exc}",
        )


@router.post("/search")
def search_vector_memory(
    payload: VectorSearchRequest,
):
    """
    Perform semantic search against historical
    disruption memories.
    """

    try:

        filters = {
            "port_code": payload.port_code,
            "severity": payload.severity,
            "disruption_type": payload.disruption_type,
            "status": payload.status,
        }

        results = search_disruption_memory(
            query_text=payload.query,
            top_k=payload.top_k,
            filters=filters,
        )

        formatted_results = []

        for rank, document in enumerate(
            results,
            start=1,
        ):

            formatted_results.append(
                {
                    "rank": rank,
                    "document": document.page_content,
                    "metadata": document.metadata,
                }
            )

        return {
            "status": "success",
            "query": payload.query,
            "requested_top_k": payload.top_k,
            "returned_results": len(
                formatted_results
            ),
            "filters": filters,
            "results": formatted_results,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Vector search error: {exc}",
        )