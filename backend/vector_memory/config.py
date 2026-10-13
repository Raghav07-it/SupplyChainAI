from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]

# ChromaDB storage
CHROMA_PERSIST_DIRECTORY = str(PROJECT_ROOT / "data" / "chroma")

# Chroma collection name
CHROMA_COLLECTION_NAME = "historical_disruptions"


# Local embedding model
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Number of records processed at once
EMBEDDING_BATCH_SIZE = 32