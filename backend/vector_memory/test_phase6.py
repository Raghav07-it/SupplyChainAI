from fastapi.testclient import TestClient
from sqlalchemy import func, select

from database import SessionLocal
from main import app
from models import Disruption

from vector_memory.documents import (
    format_disruption_document,
)
from vector_memory.embeddings import (
    generate_embeddings,
)
from vector_memory.store import (
    get_vector_memory_stats,
    index_historical_disruptions,
    search_disruption_memory,
)


PASS = 0
FAIL = 0


def check(condition, name):
    global PASS, FAIL

    if condition:
        print(f"[PASS] {name}")
        PASS += 1
    else:
        print(f"[FAIL] {name}")
        FAIL += 1


print()
print("=" * 70)
print("PHASE 6 - VECTOR MEMORY COMPREHENSIVE TEST")
print("=" * 70)
print()


# ---------------------------------------------------------
# 1. DATABASE CHECK
# ---------------------------------------------------------

db = SessionLocal()

try:

    database_count = db.scalar(
        select(
            func.count(Disruption.id)
        )
    )

    print(
        f"PostgreSQL disruption records: "
        f"{database_count}"
    )

    check(
        database_count is not None
        and database_count > 0,
        "Historical disruption records exist",
    )


    # -----------------------------------------------------
    # 2. DOCUMENT GENERATION
    # -----------------------------------------------------

    first_record = db.scalar(
        select(Disruption)
        .order_by(Disruption.id)
    )

    document = format_disruption_document(
        first_record,
        "INMUM",
    )

    print()
    print("Sample generated document:")
    print(document[:500])
    print()

    check(
        "Disruption Type:" in document,
        "Document uses current disruption_type field",
    )

    check(
        "Severity:" in document,
        "Document contains severity",
    )

    check(
        "Estimated Delay:" in document,
        "Document contains delay information",
    )


    # -----------------------------------------------------
    # 3. EMBEDDING CHECK
    # -----------------------------------------------------

    embeddings = generate_embeddings(
        [document]
    )

    dimension = len(
        embeddings[0]
    )

    print(
        f"Embedding dimension: {dimension}"
    )

    check(
        dimension == 384,
        "Embedding dimension is 384",
    )


    # -----------------------------------------------------
    # 4. FULL VECTOR INGESTION
    # -----------------------------------------------------

    print()
    print(
        "Indexing historical disruptions..."
    )
    print(
        "The first run may download the embedding model."
    )
    print()

    ingestion_result = (
        index_historical_disruptions(db)
    )

    print()
    print(
        "Ingestion result:",
        ingestion_result,
    )

    check(
        ingestion_result["processed"]
        == database_count,
        "All PostgreSQL disruptions were processed",
    )


    # -----------------------------------------------------
    # 5. VECTOR COUNT
    # -----------------------------------------------------

    stats = get_vector_memory_stats()

    vector_count = stats[
        "vector_count"
    ]

    print(
        f"Chroma vector count: "
        f"{vector_count}"
    )

    check(
        vector_count == database_count,
        "Chroma vector count matches PostgreSQL",
    )


    # -----------------------------------------------------
    # 6. SEMANTIC SEARCH
    # -----------------------------------------------------

    results = search_disruption_memory(
        query_text=(
            "severe port congestion causing "
            "large shipping delays"
        ),
        top_k=5,
    )

    print()
    print(
        f"Semantic search returned "
        f"{len(results)} results."
    )

    if results:
        print()
        print("Top semantic result:")
        print(
            results[0].page_content[:500]
        )
        print()
        print(
            "Top result metadata:"
        )
        print(
            results[0].metadata
        )
        print()

    check(
        len(results) > 0,
        "Semantic search returns results",
    )

    check(
        len(results) <= 5,
        "Top-K limit is respected",
    )


    # -----------------------------------------------------
    # 7. METADATA FILTERING
    # -----------------------------------------------------

    filtered_results = (
        search_disruption_memory(
            query_text=(
                "shipping disruption "
                "causing delays"
            ),
            top_k=5,
            filters={
                "port_code": "INMUM",
                "severity": "high",
            },
        )
    )

    print(
        "Filtered search results:",
        len(filtered_results),
    )

    check(
        len(filtered_results) > 0,
        "Metadata-filtered search returns results",
    )

    if filtered_results:

        all_match = all(
            result.metadata.get(
                "port_code"
            ) == "INMUM"
            and result.metadata.get(
                "severity"
            ) == "high"
            for result in filtered_results
        )

        check(
            all_match,
            "Filtered results match port and severity",
        )


finally:

    db.close()


# ---------------------------------------------------------
# 8. FASTAPI CHECK
# ---------------------------------------------------------

print()
print("Testing FastAPI vector endpoints...")
print()

client = TestClient(app)


stats_response = client.get(
    "/vector-memory/stats"
)

print(
    "GET /vector-memory/stats:",
    stats_response.status_code,
)

check(
    stats_response.status_code == 200,
    "Vector memory stats API works",
)


search_response = client.post(
    "/vector-memory/search",
    json={
        "query": (
            "historical port congestion "
            "and shipping delays"
        ),
        "top_k": 3,
    },
)

print(
    "POST /vector-memory/search:",
    search_response.status_code,
)

check(
    search_response.status_code == 200,
    "Vector memory search API works",
)


if search_response.status_code == 200:

    response_data = (
        search_response.json()
    )

    check(
        response_data.get(
            "returned_results",
            0,
        ) <= 3,
        "API respects requested Top-K",
    )


# ---------------------------------------------------------
# FINAL RESULT
# ---------------------------------------------------------

print()
print("=" * 70)
print(
    f"PHASE 6 TEST RESULT: "
    f"{PASS} PASSED / {FAIL} FAILED"
)
print("=" * 70)

if FAIL == 0:
    print()
    print(
        "🎉 PHASE 6 CORE IMPLEMENTATION PASSED!"
    )
    print()
else:
    print()
    print(
        "⚠️ Phase 6 has failures. "
        "Send me the COMPLETE output."
    )
    print()