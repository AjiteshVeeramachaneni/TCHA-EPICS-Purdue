import re

import pytest

from tcha_rag import config
from tcha_rag.sources import pack_sentences, parse_battlefield, parse_whig, split_sentences

# Synthetic placeholder text in the Battlefield Book transcription format (not real content).
FIXTURE = """\
===== PDF page 1 (no printed page) =====
Cover words here.
===== PDF page 5 (printed page 1) =====
Alpha sentence one. Alpha sentence two.[iv]
[Pull quote: Alpha sentence one.]
[Boxed quote: A boxed line with a marker [v] inside.]
[Image caption: A drawing of a field.]
===== PDF page 6 (printed page 2) =====
Beta sentence.
===== PDF page 25 (printed page 21) =====
Bibliography entry.
"""


@pytest.fixture
def battlefield():
    return parse_battlefield(FIXTURE)


def test_cites_printed_page_and_cover(battlefield):
    sources = {p.source for p in battlefield}
    assert sources == {"Battlefield Book, cover", "Battlefield Book, p. 1", "Battlefield Book, p. 2"}


def test_pull_quotes_dropped_boxed_quotes_and_captions_kept(battlefield):
    texts = [p.text for p in battlefield]
    assert sum(t.count("Alpha sentence one.") for t in texts) == 1
    assert not any("Pull quote" in t for t in texts)
    boxed = [p for p in battlefield if p.kind == "boxed_quote"]
    assert [p.text for p in boxed] == ["A boxed line with a marker inside."]
    assert [p.text for p in battlefield if p.kind == "caption"] == ["A drawing of a field."]


def test_endnote_markers_stripped(battlefield):
    assert not any(re.search(r"\[[ivxlcdm\d]+\]", p.text) for p in battlefield)


def test_bibliography_pages_not_indexed(battlefield):
    assert not any("Bibliography" in p.text for p in battlefield)


def test_chunks_never_cross_pages(battlefield):
    assert not any("Alpha" in p.text and "Beta" in p.text for p in battlefield)


def test_event_tags_follow_printed_page(battlefield):
    page1 = [p for p in battlefield if p.source == "Battlefield Book, p. 1"]
    assert all(p.events == config.BATTLEFIELD_EVENT_PAGES["1"] for p in page1)


def test_warns_when_page_offset_is_wrong():
    with pytest.warns(UserWarning, match="expected 3"):
        parse_battlefield("===== PDF page 7 (printed page 9) =====\nText.\n")


def test_sentence_split_keeps_abbreviations_and_initials():
    text = "Gen. Harrison met Col. Daviess. Lafayette resident R.H. Eldridge wrote. Done!"
    assert split_sentences(text) == [
        "Gen. Harrison met Col. Daviess.",
        "Lafayette resident R.H. Eldridge wrote.",
        "Done!",
    ]


def test_pack_respects_target_and_never_cuts_sentences():
    sentences = ["a" * 300 + ".", "b" * 250 + ".", "c" * 700 + "."]
    chunks = pack_sentences(sentences, target=600)
    assert chunks == [sentences[0] + " " + sentences[1], sentences[2]]


# ---------------------------------------------------------------- real Whig article


@pytest.fixture(scope="module")
def whig():
    if not config.WHIG_FILE.is_file():
        pytest.skip("data/Whig_Rally_Article.txt not present")
    return parse_whig(config.WHIG_FILE.read_text(encoding="utf-8"))


def test_whig_has_both_parts(whig):
    assert {p.source for p in whig} == {"Whig Rally article, Part I", "Whig Rally article, Part II"}


@pytest.mark.parametrize(
    "unwanted", ["Footnotes", "Seager", "Ibid", "Whig Rally, pt.", "To be continued", "Editor’s note", "Weatenotes"]
)
def test_whig_drops_headers_and_footnotes(whig, unwanted):
    assert not any(unwanted in p.text for p in whig)


def test_whig_footnote_markers_removed_but_years_kept(whig):
    joined = " ".join(p.text for p in whig)
    assert not re.search(r"”\s?\d", joined)
    assert "1839 and ’40" in joined


@pytest.mark.parametrize("phrase", ["pictures as large as life", "heroes of Tippecanoe who", "orator of the day to hold up"])
def test_whig_rejoins_paragraphs_split_by_page_breaks(whig, phrase):
    assert any(phrase in p.text for p in whig)
