from langchain_ollama import ChatOllama


DEFAULT_MODEL = "qwen3:1.7b"


def get_agent_llm() -> ChatOllama:
    """
    Create the local LLM used by the LangGraph workflow.

    We intentionally use the smaller qwen3:1.7b model because
    the project is running locally on CPU.
    """

    return ChatOllama(
        model=DEFAULT_MODEL,
        temperature=0,
        num_predict=160,
    )