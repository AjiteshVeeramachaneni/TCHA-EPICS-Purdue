"""Settings for the TCHA chatbot. Change values here, then rerun the eval harness."""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
CACHE_DIR = ROOT / "cache"

BATTLEFIELD_FILE = DATA_DIR / "Battlefield_Book_2013.txt"
WHIG_FILE = DATA_DIR / "Whig_Rally_Article.txt"

# Retrieval
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
CHUNK_TARGET_CHARS = 600
TOP_K = 4
RELEVANCE_THRESHOLD = 0.35  # placeholder: tune on the eval set's dev split
RRF_K = 60  # reciprocal rank fusion constant for hybrid search
DEFAULT_SEARCH_MODE = "hybrid"  # "bm25" | "embedding" | "hybrid"

# Input filter
MAX_QUESTION_CHARS = 500

# Battlefield Book layout (see CLAUDE.md)
BATTLEFIELD_PRINTED_OFFSET = 4  # printed page = PDF page - 4, for PDF pp. 5-26
BATTLEFIELD_OFFSET_PDF_RANGE = range(5, 27)
BATTLEFIELD_SKIP_PRINTED_PAGES = {"21", "22"}  # Bibliography and Endnotes

# Event tags: printed page -> event numbers from the 10-event list in CLAUDE.md
BATTLEFIELD_EVENT_PAGES = {
    "1": (1,),
    "3": (2, 3),
    "4": (3, 4),
    "5": (4, 6),
    "6": (5,),
    "7": (5,),
    "8": (5,),
    "9": (7,),
    "10": (7,),
    "11": (8,),
}
WHIG_EVENTS = {"I": (9,), "II": (9, 10)}
