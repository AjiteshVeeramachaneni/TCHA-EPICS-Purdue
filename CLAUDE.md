@AGENTS.md

# CLAUDE.md — TCHA Digital Museum: RAG Chatbot

Context for Claude Code. Read this before making changes.

## Project

- **Customer:** Tippecanoe County Historical Association (TCHA), tippecanoehistory.org
- **Course:** Purdue EPICS 41201 senior design, Information Management System team, advisor Dr. Jaiswal
- **Owner of this component:** Siddharth Kamble (Computer Engineering) — backend + AI
- **Product:** a public digital museum website (ages 12+) about the Battle of Tippecanoe (Nov 7, 1811) and the Great Whig Rally (1840). It covers 10 events through an interactive map/timeline, event pages, and interactive games.
- **This repo's focus:** a restricted RAG chatbot that answers visitor questions **only** from TCHA's two source documents, with page citations. Later: a personalization system and an optional email summary.
- There is **no kids' kiosk** in scope. Website only.

## Hard requirements (from TCHA's brief)

1. Every fact comes from the two sources. **Never invent** facts, quotes, statistics, or dialogue.
2. Every factual claim in an answer carries a page citation.
3. Questions the sources don't cover get a polite redirect, not a guess.
4. Answers at a 5th grade reading level (target Flesch-Kincaid grade ≤ 6).
5. Tecumseh, Tenskwatawa, and other Native figures treated accurately and respectfully: no stereotypes, no invented speech. Where sources give two accounts of the same moment, present both and say who gave each.
6. Keep uncertainty words from the source ("reportedly", "apparently").
7. Privacy: no accounts, no tracking, no chat logs, no stored personal data. Session state only.
8. Site meets WCAG 2.1 AA. Credit TCHA as the source throughout.

## Source documents (`data/`)

- `Battlefield_Book_2013.txt` — *The Battle of Tippecanoe*, TCHA 4th ed., 2013, Rick Conwell. Hand-transcribed from a scanned PDF (the PDF has no text layer; do not try to re-extract it).
  - Each page starts with `===== PDF page N (printed page M) =====`.
  - **Printed page = PDF page − 4** (for PDF pp. 5–26). **Always cite the printed page.** Front matter has roman numerals (i, ii); covers have no printed number.
  - `[Pull quote:]` blocks repeat body text — **skip them when chunking** to avoid duplicate passages.
  - `[Boxed quote:]` blocks are unique content — keep them.
  - `[Image caption: ...]` lines can be kept as separate small passages or dropped.
  - Endnote markers look like `[xxii]`; strip them from passage text. Bibliography and Endnotes pages (printed 21–22) should not be indexed for answering.
  - The editor's note on printed page 6 says modern scholarship doubts Shabonee's account. Any answer citing Shabonee should note that.
- `Whig_Rally_Article.txt` — "The Battle Ground Story: Tippecanoe and Tyler, Too! The Great Whig Rally of 1840," Parts I and II, Julie Dichtl, TCHA *Weatenotes*, 1991. No page numbers; cite as "Whig Rally article, Part I/II".

## The 10 events (printed page refs)

1. Tenskwatawa's eclipse prophecy, 1806 (p.1)
2. Vincennes showdown, Aug 1810 (p.3)
3. March to the ridge, Oct 29–Nov 6, 1811 (pp.3–4)
4. Attack begins ~4:15 a.m., Nov 7, 1811 (pp.4–5)
5. Shabonee's raid and the wrong horse (pp.6–8)
6. Major Daviess's dragoon charge (p.5)
7. Burying the dead, graves reopened (pp.9–10) — handle with care
8. Tecumseh confronts Tenskwatawa, Jan 1812 (p.11)
9. Great Whig Rally, May 29–30, 1840 (Whig article Part I)
10. Flag presentation to James Brooks (Whig article Part II)

## Architecture

```
React (Vite) static site  ──HTTP/JSON──▶  FastAPI backend  ──▶  Claude API
                                           │
                                           ├─ in-memory search index (BM25 + embeddings)
                                           └─ email service (later)
```

- **Backend:** Python 3.10+, FastAPI. REST, stateless. Holds all API keys; the browser never sees them.
- **Endpoints:**
  - `POST /ask` — question → `{answer, citations[]}`
  - `POST /suggestions` — interactive results → next-step suggestions (later)
  - `POST /email-summary` — results + email, sent once then address deleted (later)
- **Frontend:** React + Vite + TypeScript (not React Native). Accessible components (React Aria or Radix). Built by teammates from Figma.
- **Hosting:** static site + small backend service; final choice from the feasibility study. All accounts owned by TCHA.

## RAG pipeline (`/ask`)

Four layers, in order:

1. **Input filter** — reject/redirect off-topic, inappropriate, or "pretend to be Tecumseh" requests before any model call.
2. **Retrieve + relevance gate** — hybrid search (BM25 via `rank_bm25` + embeddings via `sentence-transformers`). If the best match is below `RELEVANCE_THRESHOLD`, return the redirect message and **do not call Claude**.
3. **Grounded answer** — send question + top-k passages to Claude as `search_result` content blocks with `citations: {"enabled": true}` (all-or-nothing per request). System prompt enforces the hard requirements above. Read citations from the response; don't trust model-typed page numbers.
4. **Citation check** — split the answer into claims and verify each against its cited passage (NLI model like `cross-encoder/nli-deberta-v3-base`, or a second model as judge). Remove unsupported claims or regenerate. (Planned for Spring.)

### Defaults / settings

- Model: `claude-haiku-5-5` at low effort (compare others in experiments). Use exact model IDs from Anthropic's model list.
- Embeddings: start with `all-MiniLM-L6-v2`; compare `multi-qa-MiniLM-L6-cos-v1` and `BAAI/bge-small-en-v1.5`.
- Chunks: ~600 characters, sentence-aligned, never crossing a page marker. Each passage carries `source` (e.g. `"Battlefield Book, p. 6"`), `title`, `text`, event and topic tags.
- `TOP_K = 4`, `RELEVANCE_THRESHOLD = 0.35` (placeholder — tune on the test set).
- Passage vectors computed once and saved (`passage_vectors.npy`); recompute when content, chunking, or embedding model changes.
- Secrets in `.env` (`ANTHROPIC_API_KEY=...`), `.env` in `.gitignore`. Commit only `.env.example`.

### Code layout

- `tcha_rag/config.py` — all tunable settings (model, chunk size, top-k, threshold, page/event maps).
- `tcha_rag/sources.py` — loads `data/*.txt` into `Passage`s (page markers, pull-quote skipping, endnote stripping).
- `tcha_rag/search.py` — BM25 + embeddings, hybrid via reciprocal rank fusion; vectors cached in `cache/`.
- `tcha_rag/input_filter.py` — layer 1. `tcha_rag/pipeline.py` — layers 1–2 (`Pipeline.retrieve`); layer 3 not yet built.
- `rag.py` — CLI to see what retrieval returns for a question.
- `eval/eval_retrieval.py` + `eval/retrieval_questions.jsonl` — keyword vs. embedding vs. hybrid; runs saved to `eval/runs/`.
- `tests/` — `pytest`. The venv is Python 3.9, so keep code 3.9-compatible (`from __future__ import annotations`, `Optional`/`List`).
- The relevance gate can't catch near-topic questions (e.g. Gettysburg scores like an in-scope question); layer 3 must refuse those.

## Evaluation harness

- Runs the full test set through the **same** pipeline the API uses, no UI.
- Test set (~75 questions in Fall, ~150 in Spring) in four groups: answerable, out of scope, two-accounts, adversarial (leading, stereotype, invented dialogue, false premise — e.g. "How did Tecumseh die at Tippecanoe?" — he wasn't there).
- Hold out part of the set; never tune on it.
- Each run logs: prompt version, model, embedding model, chunk size, top-k, threshold.
- Metrics and targets:
  - Retrieval: recall@k, MRR (tracked)
  - Answer accuracy on in-scope: ≥ 90%
  - Citation support: every claim
  - Correct refusals on out-of-scope + adversarial: ≥ 95%
  - Reading level: FK grade ≤ 6
  - Two accounts presented and attributed when they exist
- If a model grades answers, check it against human grades (Cohen's kappa).
- Rule: a change ships only if it improves results across the whole set.

## Later features (Spring)

- **Personalization:** games report per-question results (correct, hints, time); questions share topic tags with passages; Bayesian Knowledge Tracing learner model (rules-based fallback); suggests reviews for missed topics and "learn more" for correct ones. Session-only.
- **Celebration screen** after each interactive (frontend).
- **Email summary:** opt-in with consent; scores from game data, AI writes short cited explanations; citation check before sending, template fallback; address deleted after send; no tracking. COPPA: confirm with TCHA/Purdue whether to limit to 13+ before launch.
- Cost controls: per-visitor rate limits, daily spend cap, cached answers for common questions.

## Timeline

- **Fall 2026:** learn methods; design doc (done Nov 1); proof of concept on a few pages + keyword vs. embedding vs. hybrid on ~20 questions; first 75 test questions; website draft with a first chatbot panel by the December design review.
- **Jan–Feb 2027:** content database, harness, all four layers, threshold tuning, personalization, email; first full implementation by end of Feb.
- **Mar 2027:** TCHA staff review + visitor testing; fix and rerun harness.
- **Apr 2027:** final accuracy results, handoff document, delivery.

## Conventions for Claude Code

- Plain Python, no LangChain/LlamaIndex — keep it small and handoff-friendly.
- Prefer measured decisions: when changing retrieval or prompts, add/run harness evaluation rather than eyeballing one answer.
- Don't add logging of user questions or any personal data.
- Don't hardcode page numbers in prompts; derive citations from passage metadata.
- When unsure whether content is in the sources, search `data/` — don't rely on general knowledge of the battle.
