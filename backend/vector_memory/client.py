from pathlib import Path

import chromadb

from .config import (
    CHROMA_COLLECTION_NAME,
    CHROMA_PERSIST_DIRECTORY,
)


def get_chroma_client():
    """
    Return a persistent ChromaDB client.

    The database is stored locally inside:
    data/chroma
    """

    Path(CHROMA_PERSIST_DIRECTORY).mkdir(
        parents=True,
        exist_ok=True,
    )

    client = chromadb.PersistentClient(
        path=CHROMA_PERSIST_DIRECTORY
    )

    return client


def get_disruptions_collection():
    """
    Return the collection used for historical
    supply-chain disruption memories.
    """

    client = get_chroma_client()

    collection = client.get_or_create_collection(
        name=CHROMA_COLLECTION_NAME,
        metadata={
            "hnsw:space": "cosine"
        },
    )

    return collection