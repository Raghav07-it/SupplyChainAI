from .config import EMBEDDING_MODEL_NAME

_model = None

def get_embedding_model():
    """
    Load the SentenceTransformer model only when needed.
    """
    global _model

    if _model is None:
        from sentence_transformers import SentenceTransformer

        print(f"Loading embedding model: {EMBEDDING_MODEL_NAME}")

        _model = SentenceTransformer(EMBEDDING_MODEL_NAME)

        print("Embedding model loaded successfully.")

    return _model

def generate_embeddings(
    texts: list[str],
) -> list[list[float]]:
    """
    Convert text documents into numerical vectors.
    """

    if not texts:
        return []

    model = get_embedding_model()

    embeddings = model.encode(
        texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
    )

    return embeddings.tolist()


def get_embedding_dimension() -> int:
    """
    Return the dimensionality of the embedding model.
    """

    model = get_embedding_model()

    return model.get_sentence_embedding_dimension()