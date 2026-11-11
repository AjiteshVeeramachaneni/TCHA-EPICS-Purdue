"""Compare keyword vs. embedding vs. hybrid retrieval on the eval questions.

Runs every question through the same Pipeline.retrieve the API uses.

    python -m eval.eval_retrieval                 # dev split, all three modes
    python -m eval.eval_retrieval --split all --top-k 4 --threshold 0.35

Each run is saved to eval/runs/ with its settings so results can be compared later.
"""

from __future__ import annotations

import argparse
import json
import re
import time
from pathlib import Path
from typing import Dict, List, Optional

from tcha_rag import config
from tcha_rag.pipeline import Pipeline
from tcha_rag.search import SEARCH_MODES

EVAL_DIR = Path(__file__).resolve().parent
QUESTIONS_FILE = EVAL_DIR / "retrieval_questions.jsonl"
RUNS_DIR = EVAL_DIR / "runs"


def normalize(text: str) -> str:
    text = text.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"\s+", " ", text).casefold()


def first_relevant_rank(texts: List[str], expect: List[str]) -> Optional[int]:
    wanted = [normalize(e) for e in expect]
    for rank, text in enumerate(texts, start=1):
        if any(w in normalize(text) for w in wanted):
            return rank
    return None


def load_questions(split: str) -> List[Dict]:
    rows = [json.loads(line) for line in QUESTIONS_FILE.read_text(encoding="utf-8").splitlines() if line.strip()]
    return rows if split == "all" else [r for r in rows if r["split"] == split]


def run(split: str, top_k: int, threshold: float) -> Dict:
    questions = load_questions(split)
    pipeline = Pipeline()
    answerable = [q for q in questions if q["group"] == "answerable"]
    out_of_scope = [q for q in questions if q["group"] == "out_of_scope"]

    report: Dict = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "settings": {
            "split": split,
            "embedding_model": config.EMBEDDING_MODEL,
            "chunk_target_chars": config.CHUNK_TARGET_CHARS,
            "top_k": top_k,
            "threshold": threshold,
            "rrf_k": config.RRF_K,
            "passages": len(pipeline.index.passages),
            "documents": sorted({p.document for p in pipeline.index.passages}),
        },
        "modes": {},
    }

    for mode in SEARCH_MODES:
        per_question = []
        for q in questions:
            r = pipeline.retrieve(q["question"], mode=mode, top_k=top_k, threshold=threshold)
            # Score ranking on the hits even when the gate would redirect, so retrieval and gating are measured separately.
            hits = r.hits or pipeline.index.search(q["question"], mode=mode, top_k=top_k).hits
            rank = first_relevant_rank([h.passage.text for h in hits], q["expect"]) if q["expect"] else None
            per_question.append(
                {
                    "id": q["id"],
                    "group": q["group"],
                    "status": r.status,
                    "best_cosine": None if r.best_cosine is None else round(r.best_cosine, 4),
                    "rank": rank,
                    "top_sources": [h.passage.id for h in hits],
                }
            )
        ans = [p for p in per_question if p["group"] == "answerable"]
        oos = [p for p in per_question if p["group"] == "out_of_scope"]
        report["modes"][mode] = {
            "recall_at_k": _ratio(sum(p["rank"] is not None for p in ans), len(ans)),
            "mrr": _ratio(sum(1 / p["rank"] for p in ans if p["rank"]), len(ans)),
            "answerable_passed_gate": _ratio(sum(p["status"] == "ok" for p in ans), len(ans)),
            "out_of_scope_redirected": _ratio(sum(p["status"] != "ok" for p in oos), len(oos)),
            "questions": per_question,
        }

    cos = {p["id"]: p["best_cosine"] for p in report["modes"]["hybrid"]["questions"]}
    report["gate"] = {
        "lowest_answerable_cosine": min((cos[q["id"]] for q in answerable if cos[q["id"]] is not None), default=None),
        "highest_out_of_scope_cosine": max((cos[q["id"]] for q in out_of_scope if cos[q["id"]] is not None), default=None),
    }
    return report


def _ratio(numerator: float, denominator: int) -> Optional[float]:
    return round(numerator / denominator, 3) if denominator else None


def print_report(report: Dict) -> None:
    s = report["settings"]
    print(f"\nPassages: {s['passages']} from {', '.join(s['documents'])} | top_k={s['top_k']} threshold={s['threshold']}")
    print(f"{'mode':<10} {'recall@k':>9} {'MRR':>6} {'ans. pass gate':>15} {'OOS redirected':>15}")
    for mode, m in report["modes"].items():
        print(
            f"{mode:<10} {m['recall_at_k']:>9} {m['mrr']:>6} {m['answerable_passed_gate']:>15} {m['out_of_scope_redirected']:>15}"
        )
    g = report["gate"]
    print(
        f"\nGate: lowest answerable cosine = {g['lowest_answerable_cosine']}, "
        f"highest out-of-scope cosine = {g['highest_out_of_scope_cosine']}"
    )
    misses = [q for q in report["modes"]["hybrid"]["questions"] if q["group"] == "answerable" and q["rank"] is None]
    if misses:
        print("Hybrid misses:", ", ".join(q["id"] for q in misses))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--split", default="dev", choices=["dev", "test", "all"])
    parser.add_argument("--top-k", type=int, default=config.TOP_K)
    parser.add_argument("--threshold", type=float, default=config.RELEVANCE_THRESHOLD)
    parser.add_argument("--no-save", action="store_true", help="don't write a run file to eval/runs/")
    args = parser.parse_args()

    report = run(args.split, args.top_k, args.threshold)
    print_report(report)
    if not args.no_save:
        RUNS_DIR.mkdir(exist_ok=True)
        path = RUNS_DIR / f"{time.strftime('%Y%m%d-%H%M%S')}-retrieval.json"
        path.write_text(json.dumps(report, indent=2))
        print(f"\nSaved {path.relative_to(EVAL_DIR.parent)}")


if __name__ == "__main__":
    main()
