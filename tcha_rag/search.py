"""Hybrid search over passages: BM25 keywords + sentence-transformer embeddings.

Hybrid ranking uses reciprocal rank fusion (RRF), which needs no score scaling.
The relevance gate always uses the best embedding cosine similarity, because BM25
scores are only meaningful relative to each other.
"""

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Sequence

import numpy as np
from rank_bm25 import BM25Okapi

from . import config
from .sources import Passage

SEARCH_MODES = ("bm25", "embedding", "hybrid")

_STOPWORDS = set(
    """a an and are as at be but by did do does for from had has have he her his how i in
    is it its me of on or she so that the their them then there they this to was were what
    when where which who whom why will with you your""".split()
)


def tokenize(text: str) -> List[str]:
    text = text.lower().replace("’", "'").replace("‘", "'")
    tokens = re.findall(r"[a-z0-9]+(?:'[a-z]+)?", text)
    tokens = [t[:-2] if t.endswith("'s") else t for t in tokens]
    return [t for t in tokens if t not in _STOPWORDS]


@dataclass
class Hit:
    passage: Passage
    score: float  # ranking score for the chosen mode
    cosine: float  # embedding similarity to the query


@dataclass
class SearchResult:
    hits: List[Hit]
    best_cosine: float  # used by the relevance gate


class SearchIndex:
    def __init__(
        self,
        passages: Sequence[Passage],
        model_name: str = config.EMBEDDING_MODEL,
        cache_dir: Path = config.CACHE_DIR,
    ) -> None:
        from sentence_transformers import SentenceTransformer  # slow import, keep it lazy

        self.passages = list(passages)
        self.model_name = model_name
        self._bm25 = BM25Okapi([tokenize(p.text) for p in self.passages])
        self._model = SentenceTransformer(model_name)
        self._vectors = self._load_or_compute_vectors(cache_dir)

    # Vectors are recomputed whenever the passages or the embedding model change.
    def _load_or_compute_vectors(self, cache_dir: Path) -> np.ndarray:
        digest = hashlib.sha256(self.model_name.encode())
        for p in self.passages:
            digest.update(f"\0{p.id}\0{p.text}".encode())
        fingerprint = digest.hexdigest()

        vectors_path = cache_dir / "passage_vectors.npy"
        meta_path = cache_dir / "passage_vectors.json"
        if vectors_path.is_file() and meta_path.is_file():
            meta = json.loads(meta_path.read_text())
            if meta.get("fingerprint") == fingerprint:
                return np.load(vectors_path)

        vectors = self._model.encode(
            [p.text for p in self.passages], normalize_embeddings=True, convert_to_numpy=True
        )
        cache_dir.mkdir(parents=True, exist_ok=True)
        np.save(vectors_path, vectors)
        meta_path.write_text(
            json.dumps({"model": self.model_name, "fingerprint": fingerprint, "count": len(self.passages)})
        )
        return vectors

    def search(self, query: str, mode: str = config.DEFAULT_SEARCH_MODE, top_k: int = config.TOP_K) -> SearchResult:
        if mode not in SEARCH_MODES:
            raise ValueError(f"mode must be one of {SEARCH_MODES}, got {mode!r}")

        query_vector = self._model.encode([query], normalize_embeddings=True, convert_to_numpy=True)[0]
        cosine = self._vectors @ query_vector
        bm25 = np.asarray(self._bm25.get_scores(tokenize(query)))

        if mode == "bm25":
            scores = bm25
        elif mode == "embedding":
            scores = cosine
        else:
            scores = _rrf([bm25, cosine])

        order = np.argsort(-scores, kind="stable")[:top_k]
        hits = [Hit(self.passages[i], float(scores[i]), float(cosine[i])) for i in order]
        return SearchResult(hits=hits, best_cosine=float(cosine.max()))


def _rrf(score_lists: List[np.ndarray], k: int = config.RRF_K) -> np.ndarray:
    fused = np.zeros_like(score_lists[0], dtype=float)
    for scores in score_lists:
        ranks: Dict[int, int] = {int(i): r for r, i in enumerate(np.argsort(-scores, kind="stable"), start=1)}
        fused += np.array([1.0 / (k + ranks[i]) for i in range(len(scores))])
    return fused
