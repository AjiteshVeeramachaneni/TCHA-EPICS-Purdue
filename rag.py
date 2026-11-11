"""Try the chatbot's retrieval from the command line (layers 1-2; no API key needed).

    python rag.py "What food was served at the Whig rally?"
    python rag.py "Who was given the flag?" --mode bm25 --top-k 3
"""

from __future__ import annotations

import argparse

from tcha_rag import config
from tcha_rag.pipeline import Pipeline
from tcha_rag.search import SEARCH_MODES


def main() -> None:
    parser = argparse.ArgumentParser(description="Show what the chatbot would retrieve for a question.")
    parser.add_argument("question")
    parser.add_argument("--mode", choices=SEARCH_MODES, default=config.DEFAULT_SEARCH_MODE)
    parser.add_argument("--top-k", type=int, default=config.TOP_K)
    parser.add_argument("--threshold", type=float, default=config.RELEVANCE_THRESHOLD)
    args = parser.parse_args()

    result = Pipeline().retrieve(args.question, mode=args.mode, top_k=args.top_k, threshold=args.threshold)

    if result.status == "blocked":
        print(f"[blocked by input filter: {result.filter_reason}]\n{result.message}")
        return
    print(f"Best relevance (cosine): {result.best_cosine:.3f}  threshold: {args.threshold}")
    if result.status == "redirect":
        print(f"[below threshold, Claude would not be called]\n{result.message}")
        return
    for rank, hit in enumerate(result.hits, start=1):
        print(f"\n{rank}. {hit.passage.source}  ({args.mode} score {hit.score:.3f}, cosine {hit.cosine:.3f})")
        print(f"   {hit.passage.text}")


if __name__ == "__main__":
    main()
