from sqlalchemy import select
from sqlalchemy.orm import Session
from langchain_core.documents import Document

from models import Disruption, Port

from .client import get_disruptions_collection
from .config import EMBEDDING_BATCH_SIZE
from .documents import format_disruption_document
from .embeddings import generate_embeddings


def _build_metadata(
    disruption: Disruption,
    port_code: str,
) -> dict:
    """
    Convert a database disruption record into
    Chroma-compatible metadata.
    """

    return {
        "event_code": str(disruption.event_code),
        "port_code": str(port_code),
        "port_id": int(disruption.port_id),

        "disruption_type": str(
            disruption.disruption_type
        ),

        "severity": str(
            disruption.severity
        ),

        "status": str(
            disruption.status
        ),

        "started_at": (
            disruption.started_at.isoformat()
            if disruption.started_at
            else ""
        ),

        "ended_at": (
            disruption.ended_at.isoformat()
            if disruption.ended_at
            else ""
        ),

        "delay_hours": float(
            disruption.estimated_delay_hours
        ),

        "cost_impact_usd": float(
            disruption.estimated_cost_impact_usd
        ),

        "capacity_impact_percent": float(
            disruption.capacity_impact_percent
        ),

        "source": str(
            disruption.source
        ),

        "is_synthetic": bool(
            disruption.is_synthetic
        ),
    }


def index_historical_disruptions(
    db: Session,
) -> dict:
    """
    Read all historical disruption records from PostgreSQL,
    convert them into documents, generate embeddings,
    and store them in ChromaDB.

    Uses upsert so the operation is safe to run repeatedly.
    """

    collection = get_disruptions_collection()

    rows = db.execute(
        select(Disruption, Port.port_code)
        .join(
            Port,
            Disruption.port_id == Port.id,
        )
        .order_by(Disruption.id)
    ).all()

    if not rows:
        raise ValueError(
            "No historical disruption records were found in PostgreSQL."
        )

    total_processed = 0

    for start in range(
        0,
        len(rows),
        EMBEDDING_BATCH_SIZE,
    ):
        batch = rows[
            start:start + EMBEDDING_BATCH_SIZE
        ]

        documents = []
        metadatas = []
        ids = []

        for disruption, port_code in batch:

            document = format_disruption_document(
                disruption,
                port_code,
            )

            metadata = _build_metadata(
                disruption,
                port_code,
            )

            documents.append(document)
            metadatas.append(metadata)
            ids.append(
                str(disruption.event_code)
            )

        embeddings = generate_embeddings(
            documents
        )

        collection.upsert(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
        )

        total_processed += len(batch)

        print(
            f"Indexed {total_processed}/{len(rows)} "
            f"historical disruptions..."
        )

    return {
        "processed": total_processed,
        "collection": collection.name,
        "vector_count": collection.count(),
    }


def _build_where_filter(
    filters: dict | None,
) -> dict | None:
    """
    Convert simple metadata filters into
    Chroma's filtering format.
    """

    if not filters:
        return None

    valid_filters = {
        key: value
        for key, value in filters.items()
        if value is not None
    }

    if not valid_filters:
        return None

    conditions = [
        {key: value}
        for key, value in valid_filters.items()
    ]

    if len(conditions) == 1:
        return conditions[0]

    return {
        "$and": conditions
    }


def search_disruption_memory(
    query_text: str,
    top_k: int = 5,
    filters: dict | None = None,
) -> list[Document]:
    """
    Perform semantic similarity search against
    historical disruption memories.
    """

    collection = get_disruptions_collection()

    vector_count = collection.count()

    if vector_count == 0:
        return []

    top_k = min(
        max(1, top_k),
        vector_count,
    )

    query_embedding = generate_embeddings(
        [query_text]
    )[0]

    where_filter = _build_where_filter(
        filters
    )

    query_arguments = {
        "query_embeddings": [query_embedding],
        "n_results": top_k,
        "include": [
            "documents",
            "metadatas",
            "distances",
        ],
    }

    if where_filter:
        query_arguments["where"] = where_filter

    results = collection.query(
        **query_arguments
    )

    documents = results.get(
        "documents",
        [[]],
    )[0]

    metadatas = results.get(
        "metadatas",
        [[]],
    )[0]

    distances = results.get(
        "distances",
        [[]],
    )[0]

    output = []

    for index, page_content in enumerate(
        documents
    ):

        metadata = (
            metadatas[index]
            if index < len(metadatas)
            else {}
        )

        distance = (
            distances[index]
            if index < len(distances)
            else None
        )

        metadata = dict(metadata)

        if distance is not None:
            metadata["vector_distance"] = float(
                distance
            )

        output.append(
            Document(
                page_content=page_content,
                metadata=metadata,
            )
        )

    return output


def query_disruption_memory(
    query_text: str,
    k: int = 5,
):
    """
    Compatibility wrapper used by the existing
    multi-agent system.

    The agent already imports this function,
    so we keep the same function name.
    """

    try:
        return search_disruption_memory(
            query_text=query_text,
            top_k=k,
        )

    except Exception as exc:
        print(
            f"Vector search warning: {exc}"
        )

        return []


def get_vector_memory_stats() -> dict:
    """
    Return useful statistics about the vector database.
    """

    collection = get_disruptions_collection()

    return {
        "collection_name": collection.name,
        "vector_count": collection.count(),
    }