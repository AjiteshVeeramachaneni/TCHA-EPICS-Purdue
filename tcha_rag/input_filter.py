"""Layer 1: catch requests the chatbot should not send to search or the model.

Off-topic questions are mostly handled by the relevance gate (layer 2). This layer
catches what the gate can't: role-play, invented dialogue, prompt injection, and
inappropriate language. Messages are written for ages 12+.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional

from . import config

_FIGURES = r"(?:tecumseh|tenskwatawa|the prophet|shabonee|harrison|daviess|a (?:native|shawnee|soldier|warrior))"

_ROLEPLAY = re.compile(
    r"\b(?:pretend|role[- ]?play|act (?:as|like)|you are now|imagine you(?:'| a)re|speak (?:as|like)|"
    rf"talk (?:as|like)|in the voice of|be {_FIGURES}|as if you were)\b",
    re.I,
)
_INVENTED_SPEECH = re.compile(
    rf"\b(?:what (?:would|might) {_FIGURES} (?:say|think|feel)|write (?:a )?(?:speech|letter|diary|dialogue|conversation)|"
    r"make up (?:a )?(?:quote|speech|story))\b",
    re.I,
)
_INJECTION = re.compile(
    r"\b(?:ignore (?:all |any |your |the )?(?:previous|prior|above) (?:instructions|rules)|system prompt|"
    r"developer mode|jailbreak|disregard (?:your|the) (?:rules|instructions))\b",
    re.I,
)
# Starter list only; replace with a maintained word list before launch.
_INAPPROPRIATE = re.compile(r"\b(?:fuck\w*|shit\w*|bitch\w*|asshole\w*|bastard\w*|dick|cunt\w*|porn\w*|sex\w*)\b", re.I)

MESSAGES = {
    "empty": "Type a question about the Battle of Tippecanoe or the Great Whig Rally of 1840.",
    "too_long": "That question is a bit long. Can you ask it in fewer words?",
    "roleplay": (
        "I can't pretend to be a real person from history. I can tell you what the Tippecanoe County "
        "Historical Association's books say about them. Try asking \"Who was Tecumseh?\""
    ),
    "invented_speech": (
        "I can't make up words that people from history never said. I can share what the sources "
        "actually record. Try asking what happened at a certain event."
    ),
    "injection": "I can only answer questions about the Battle of Tippecanoe and the Great Whig Rally of 1840.",
    "inappropriate": "Let's keep it friendly! Ask me something about the Battle of Tippecanoe or the Great Whig Rally.",
}


@dataclass
class FilterResult:
    allowed: bool
    reason: Optional[str] = None
    message: Optional[str] = None


def check_question(question: str) -> FilterResult:
    text = question.strip()
    checks = (
        ("empty", not text),
        ("too_long", len(text) > config.MAX_QUESTION_CHARS),
        ("inappropriate", bool(_INAPPROPRIATE.search(text))),
        ("injection", bool(_INJECTION.search(text))),
        ("roleplay", bool(_ROLEPLAY.search(text))),
        ("invented_speech", bool(_INVENTED_SPEECH.search(text))),
    )
    for reason, failed in checks:
        if failed:
            return FilterResult(allowed=False, reason=reason, message=MESSAGES[reason])
    return FilterResult(allowed=True)
