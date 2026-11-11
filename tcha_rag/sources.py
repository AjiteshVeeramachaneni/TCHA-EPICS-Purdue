"""Load TCHA's two source documents and split them into citable passages.

Every passage carries the citation label shown to visitors (``source``), so page
numbers always come from this metadata and never from model output.
"""

from __future__ import annotations

import re
import warnings
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Tuple

from . import config

BATTLEFIELD_TITLE = "The Battle of Tippecanoe (Rick Conwell, TCHA, 4th ed., 2013)"
WHIG_TITLE = (
    "The Battle Ground Story: Tippecanoe and Tyler, Too! The Great Whig Rally of 1840, "
    "Part {part} (Julie Dichtl, TCHA Weatenotes, 1991)"
)


@dataclass(frozen=True)
class Passage:
    id: str
    document: str  # "battlefield" | "whig"
    source: str  # citation label, e.g. "Battlefield Book, p. 6"
    title: str
    text: str
    kind: str = "body"  # "body" | "boxed_quote" | "caption"
    events: Tuple[int, ...] = ()
    topics: Tuple[str, ...] = ()  # filled in once topic tags are agreed with the games team


# --------------------------------------------------------------------------- sentences

_ABBREVIATIONS = {
    "mr", "mrs", "ms", "dr", "st", "gen", "col", "capt", "maj", "lt", "sgt", "gov",
    "rev", "jr", "sr", "vol", "no", "pp", "p", "pt", "ed", "vs", "etc", "mt", "ft",
}
_SENTENCE_END = re.compile(r"[.!?]+[\"”’')\]]*(?=\s)")


def _is_abbreviation(word: str) -> bool:
    w = word.strip("“\"‘'(").rstrip(".").lower()
    return w in _ABBREVIATIONS or re.fullmatch(r"(?:[a-z]\.)*[a-z]", w) is not None


def split_sentences(text: str) -> List[str]:
    """Split text into sentences, keeping abbreviations and initials intact."""
    text = re.sub(r"\s+", " ", text).strip()
    sentences: List[str] = []
    start = 0
    for match in _SENTENCE_END.finditer(text):
        end = match.end()
        words = text[start : match.start()].split()
        last_word = words[-1] if words else ""
        next_char = text[end:].lstrip()[:1]
        if text[match.start()] == "." and _is_abbreviation(last_word):
            continue
        if next_char.islower():
            continue
        sentences.append(text[start:end].strip())
        start = end
    tail = text[start:].strip()
    if tail:
        sentences.append(tail)
    return sentences


def pack_sentences(sentences: List[str], target: int = config.CHUNK_TARGET_CHARS) -> List[str]:
    """Greedily group whole sentences into chunks of at most ``target`` characters.

    A single sentence longer than ``target`` becomes its own chunk; sentences are never cut.
    """
    chunks: List[str] = []
    current = ""
    for sentence in sentences:
        if current and len(current) + 1 + len(sentence) > target:
            chunks.append(current)
            current = sentence
        else:
            current = f"{current} {sentence}" if current else sentence
    if current:
        chunks.append(current)
    return chunks


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


# ---------------------------------------------------------------------- Battlefield Book

_PAGE_MARKER = re.compile(r"^=====\s*PDF page (\d+)\s*(?:\((.*?)\))?\s*=====[ \t]*$", re.M)
_BLOCK_START = re.compile(r"\[(Pull quote|Boxed quote|Image caption):", re.I)
_ENDNOTE_MARKER = re.compile(r"\[(?:[ivxlcdm]+|\d+)\]")


def _printed_label(marker_note: Optional[str]) -> Optional[str]:
    if not marker_note:
        return None
    match = re.search(r"printed page\s+([0-9]+|[ivxlcdm]+)\b", marker_note, re.I)
    return match.group(1).lower() if match else None


def _extract_blocks(text: str) -> Tuple[str, List[Tuple[str, str]]]:
    """Pull ``[Pull quote: ...]``-style blocks out of page text (brackets may nest)."""
    remaining: List[str] = []
    blocks: List[Tuple[str, str]] = []
    pos = 0
    while True:
        match = _BLOCK_START.search(text, pos)
        if not match:
            remaining.append(text[pos:])
            break
        remaining.append(text[pos : match.start()])
        depth, i = 1, match.end()
        while i < len(text) and depth:
            if text[i] == "[":
                depth += 1
            elif text[i] == "]":
                depth -= 1
            i += 1
        if depth:
            raise ValueError(f"Unclosed [{match.group(1)}: block near: {text[match.start():match.start() + 60]!r}")
        blocks.append((match.group(1).lower(), text[match.end() : i - 1]))
        pos = i
    return "".join(remaining), blocks


def parse_battlefield(raw: str) -> List[Passage]:
    markers = list(_PAGE_MARKER.finditer(raw))
    if not markers:
        raise ValueError("Battlefield Book text has no '===== PDF page N (...) =====' markers")

    passages: List[Passage] = []
    for idx, marker in enumerate(markers):
        pdf_page = int(marker.group(1))
        printed = _printed_label(marker.group(2))
        body_end = markers[idx + 1].start() if idx + 1 < len(markers) else len(raw)
        body = raw[marker.end() : body_end]

        if (
            printed is not None
            and printed.isdigit()
            and pdf_page in config.BATTLEFIELD_OFFSET_PDF_RANGE
            and int(printed) != pdf_page - config.BATTLEFIELD_PRINTED_OFFSET
        ):
            warnings.warn(
                f"PDF page {pdf_page} is labelled printed page {printed}; "
                f"expected {pdf_page - config.BATTLEFIELD_PRINTED_OFFSET}"
            )
        if printed in config.BATTLEFIELD_SKIP_PRINTED_PAGES:
            continue

        source = f"Battlefield Book, p. {printed}" if printed else "Battlefield Book, cover"
        events = config.BATTLEFIELD_EVENT_PAGES.get(printed or "", ())
        body, blocks = _extract_blocks(body)

        pieces: List[Tuple[str, str]] = [("body", c) for c in pack_sentences(split_sentences(_ENDNOTE_MARKER.sub("", body)))]
        for block_kind, content in blocks:
            if block_kind == "pull quote":
                continue  # repeats body text
            kind = "boxed_quote" if block_kind == "boxed quote" else "caption"
            content = _clean(_ENDNOTE_MARKER.sub("", content))
            pieces.extend((kind, c) for c in pack_sentences(split_sentences(content)))

        for n, (kind, text) in enumerate(pieces):
            passages.append(
                Passage(
                    id=f"bf-pdf{pdf_page}-{n}",
                    document="battlefield",
                    source=source,
                    title=BATTLEFIELD_TITLE,
                    text=text,
                    kind=kind,
                    events=events,
                )
            )
    return passages


# ------------------------------------------------------------------- Whig Rally article

_WHIG_PART = re.compile(r"^\s*Part (II|I)\s*$", re.M)
_WHIG_FOOTNOTES = re.compile(r"^\s*Footnotes:?\s*$", re.M)
_WHIG_DROP_LINE = re.compile(
    r"^\s*(?:By(?:\s+Julie Dichtl)?|Julie Dichtl|Weatenotes\b.*|Editor[’']s note:.*"
    r"|To be continued|Whig Rally, pt\..*)\s*$"
)
# Footnote numbers right after a sentence end or closing double quote, e.g. 'glory.” 1' or
# '40,000.”5'. Not after ’, which also starts elided years like "1839 and ’40".
_WHIG_FOOTNOTE_MARKER = re.compile(r"(?<=[.!?”\"])\s?\d{1,2}(?=\s|$)")
_TERMINAL = (".", "!", "?", "”", '"', "’", ":", "…")


def parse_whig(raw: str) -> List[Passage]:
    pieces = _WHIG_PART.split(raw)
    parts = dict(zip(pieces[1::2], pieces[2::2]))
    if set(parts) != {"I", "II"}:
        raise ValueError(f"Expected Part I and Part II in Whig article, found {sorted(parts)}")

    passages: List[Passage] = []
    for part in ("I", "II"):
        text = _WHIG_FOOTNOTES.split(parts[part], maxsplit=1)[0]
        lines = [line for line in text.splitlines() if not _WHIG_DROP_LINE.match(line)]

        paragraphs: List[str] = []
        current: List[str] = []
        for line in lines + [""]:
            if line.strip():
                current.append(line.strip())
            elif current:
                paragraphs.append(" ".join(current))
                current = []

        # Re-join paragraphs split by a page break (previous one ends mid-sentence).
        joined: List[str] = []
        for para in paragraphs:
            if joined and not joined[-1].rstrip().endswith(_TERMINAL):
                joined[-1] = f"{joined[-1].rstrip()} {para}"
            else:
                joined.append(para)

        body = _WHIG_FOOTNOTE_MARKER.sub("", " ".join(joined))
        for n, chunk in enumerate(pack_sentences(split_sentences(body))):
            passages.append(
                Passage(
                    id=f"whig-{part}-{n}",
                    document="whig",
                    source=f"Whig Rally article, Part {part}",
                    title=WHIG_TITLE.format(part=part),
                    text=chunk,
                    events=config.WHIG_EVENTS[part],
                )
            )
    return passages


# ------------------------------------------------------------------------------ loading


def load_passages(
    battlefield_path: Path = config.BATTLEFIELD_FILE,
    whig_path: Path = config.WHIG_FILE,
) -> List[Passage]:
    """Load both sources. A missing file is skipped with a warning so work can continue."""
    passages: List[Passage] = []
    for path, parser in ((battlefield_path, parse_battlefield), (whig_path, parse_whig)):
        if not path.is_file():
            warnings.warn(f"Source file missing, skipping: {path}")
            continue
        passages.extend(parser(path.read_text(encoding="utf-8")))
    if not passages:
        raise FileNotFoundError("No source documents found in data/")
    return passages
