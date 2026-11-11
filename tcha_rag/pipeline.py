"""The /ask pipeline. Layers 1-2 run today; layer 3 (Claude) is added once there is an API key.

The eval harness and the API both call ``Pipeline.retrieve`` so they share one code path.
Nothing here logs or stores questions.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional

from . import config
from .input_filter import check_question
from .search import Hit, SearchIndex
from .sources import load_passages

REDIRECT_MESSAGE = (
    "I couldn't find that in the Tippecanoe County Historical Association's books, so I can't answer it. "
    "Try asking about the Battle of Tippecanoe in 1811 or the Great Whig Rally of 1840! "
    "You can also learn more at tippecanoehistory.org."
)


@dataclass
class Retrieval:
    status: str  # "blocked" (layer 1) | "redirect" (layer 2 gate) | "ok"
    message: Optional[str] = None  # what to show the visitor when not "ok"
    hits: List[Hit] = field(default_factory=list)
    best_cosine: Optional[float] = None
    filter_reason: Optional[str] = None


class Pipeline:
    def __init__(self, index: Optional[SearchIndex] = None) -> None:
        self.index = index or SearchIndex(load_passages())

    def retrieve(
        self,
        question: str,
        mode: str = config.DEFAULT_SEARCH_MODE,
        top_k: int = config.TOP_K,
        threshold: float = config.RELEVANCE_THRESHOLD,
    ) -> Retrieval:
        verdict = check_question(question)
        if not verdict.allowed:
            return Retrieval(status="blocked", message=verdict.message, filter_reason=verdict.reason)

        result = self.index.search(question, mode=mode, top_k=top_k)
        if result.best_cosine < threshold:
            return Retrieval(status="redirect", message=REDIRECT_MESSAGE, best_cosine=result.best_cosine)
        return Retrieval(status="ok", hits=result.hits, best_cosine=result.best_cosine)
