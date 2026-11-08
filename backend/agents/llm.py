import os
from typing import Any


DEFAULT_MODEL = "qwen3:1.7b"


def get_agent_llm():
    """
    Get the LLM client:
    1. Try OpenAI if OPENAI_API_KEY is configured and valid.
    2. Try local ChatOllama if available.
    3. Return None if neither is available so the caller can fall back to
       deterministic rule-based extractors without crashing.
    """
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if api_key and not api_key.startswith("your_"):
        try:
            from langchain_openai import ChatOpenAI

            return ChatOpenAI(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                temperature=0,
                api_key=api_key,
                request_timeout=15.0,
            )
        except Exception as e:
            print(f"[AI Agent Engine] OpenAI initialization notice: {e}")

    try:
        from langchain_ollama import ChatOllama

        return ChatOllama(
            model=os.getenv("OLLAMA_MODEL", DEFAULT_MODEL),
            temperature=0,
            num_predict=160,
            timeout=5.0,
        )
    except Exception as e:
        print(f"[AI Agent Engine] Ollama initialization notice: {e}")

    return None
