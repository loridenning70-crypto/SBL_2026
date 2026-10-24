"""Scan BHSA passages for ketiv/qere words."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from tf.app import use

A = use("ETCBC/bhsa", hoist=globals())


@dataclass(frozen=True)
class PassageRef:
    book: str
    chapter: int
    verse: int


# Modify this list as needed.
PASSAGES: list[PassageRef] = [
    PassageRef("1 Samuel", 18, 1), PassageRef("1 Samuel", 18, 1), PassageRef("1 Samuel", 18, 14), PassageRef("1 Samuel", 18, 22), PassageRef("1 Samuel", 18, 6), PassageRef("1 Samuel", 18, 6), PassageRef("1 Samuel", 18, 7), PassageRef("1 Samuel", 18, 7), PassageRef("1 Samuel", 18, 9), 
    PassageRef("1 Samuel", 19, 18), PassageRef("1 Samuel", 19, 18), PassageRef("1 Samuel", 19, 19), PassageRef("1 Samuel", 19, 19), PassageRef("1 Samuel", 19, 22), PassageRef("1 Samuel", 19, 22), PassageRef("1 Samuel", 19, 23), PassageRef("1 Samuel", 19, 23), 
    PassageRef("1 Samuel", 25, 18), PassageRef("1 Samuel", 25, 18), PassageRef("1 Samuel", 25, 3), PassageRef("1 Samuel", 25, 34), PassageRef("1 Samuel", 25, 34), 
    PassageRef("1 Samuel", 28, 8), 
    PassageRef("1 Samuel", 2, 10), PassageRef("1 Samuel", 2, 10),
    PassageRef("1 Samuel", 2, 16),
    PassageRef("1 Samuel", 2, 3), PassageRef("1 Samuel", 2, 3),
    PassageRef("1 Samuel", 2, 9),
    PassageRef("2 Samuel", 11, 24),
    PassageRef("2 Samuel", 11, 24),
    PassageRef("2 Samuel", 11, 24),
    PassageRef("2 Samuel", 11, 24),
    PassageRef("2 Samuel", 12, 20),
    PassageRef("2 Samuel", 12, 22),
    PassageRef("2 Samuel", 12, 22),
    PassageRef("2 Samuel", 12, 24),
    PassageRef("2 Samuel", 12, 24),
    PassageRef("2 Samuel", 12, 31),
    PassageRef("2 Samuel", 12, 31),
    PassageRef("2 Samuel", 12, 9),
    PassageRef("2 Samuel", 12, 9),
    PassageRef("2 Samuel", 13, 34),
    PassageRef("2 Samuel", 13, 37),
    PassageRef("2 Samuel", 13, 8),
    PassageRef("2 Samuel", 13, 8),
    PassageRef("2 Samuel", 1, 11),
    PassageRef("2 Samuel", 1, 11),
    PassageRef("2 Samuel", 1, 16),
    PassageRef("2 Samuel", 1, 8),
    PassageRef("2 Samuel", 1, 8),
    PassageRef("Exodus", 4, 2),
    PassageRef("Exodus", 4, 2),
    PassageRef("Genesis", 24, 33),
    PassageRef("Genesis", 24, 33),
    PassageRef("Genesis", 25, 23),
    PassageRef("Genesis", 27, 29),
    PassageRef("Genesis", 27, 29),
    PassageRef("Genesis", 27, 3),
    PassageRef("Genesis", 30, 11),
    PassageRef("Genesis", 30, 11),
    PassageRef("Genesis", 33, 4),
    PassageRef("Genesis", 35, 21),
    PassageRef("Judges", 11, 37),
    PassageRef("Judges", 11, 37),
    PassageRef("Judges", 13, 17),
    PassageRef("Judges", 16, 18),
    PassageRef("Judges", 16, 21),
    PassageRef("Judges", 16, 21),
    PassageRef("Judges", 16, 25),
    PassageRef("Judges", 16, 25),
    PassageRef("Judges", 16, 25),
    PassageRef("Judges", 16, 25),
    PassageRef("Judges", 16, 26),
    PassageRef("Judges", 16, 26),
    PassageRef("Judges", 19, 13),
    PassageRef("Judges", 19, 21),
    PassageRef("Judges", 19, 21),
    PassageRef("Judges", 19, 25),
    PassageRef("Judges", 19, 25),
    PassageRef("Judges", 19, 3),
    PassageRef("Judges", 19, 3),
    PassageRef("Judges", 20, 13),
    PassageRef("Judges", 20, 13),
    PassageRef("Judges", 21, 20),
    PassageRef("Judges", 21, 20),
    PassageRef("Judges", 21, 22),
    PassageRef("Judges", 21, 22),
    PassageRef("Judges", 4, 11),
    PassageRef("Judges", 4, 11),
    PassageRef("Judges", 6, 5),
    PassageRef("Judges", 6, 5),
    PassageRef("Judges", 7, 13),
    PassageRef("Judges", 7, 21),
    PassageRef("Judges", 7, 21),
    PassageRef("Judges", 9, 12),
    PassageRef("Judges", 9, 8),
    PassageRef("Numbers", 12, 3),
    PassageRef("Numbers", 23, 13),
]

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "passages.json"


def _feature_value(word: int, *feature_names: str) -> str | None:
    """Return the first available feature value for a word from candidate names."""
    for name in feature_names:
        try:
            feature = getattr(F, name)
        except AttributeError:
            continue

        value = feature.v(word)
        if value not in (None, ""):
            return value
    return None


def _normalize_book(book: str) -> str:
    return " ".join(book.replace("_", " ").split()).lower()


def _ref_key(book: str, chapter: int, verse: int) -> str:
    return f"{_normalize_book(book)}:{chapter}:{verse}"


def _verse_node_from_ref(passage: PassageRef) -> int | None:
    """Resolve a verse node with either spaced or underscored book names."""
    book_variants = (
        passage.book,
        passage.book.replace(" ", "_"),
        passage.book.replace("_", " "),
    )
    seen: set[str] = set()
    for book in book_variants:
        if book in seen:
            continue
        seen.add(book)
        verse_node = T.nodeFromSection((book, passage.chapter, passage.verse))
        if verse_node is not None:
            return verse_node
    return None


def _load_passages_text(path: Path) -> dict[str, str]:
    with path.open(encoding="utf-8") as fh:
        data = json.load(fh)

    verse_text_by_ref: dict[str, str] = {}
    for group_entries in data.values():
        for entry in group_entries:
            ref = entry.get("f")
            verse_text = entry.get("h")
            if not ref or not verse_text:
                continue

            try:
                book, chapter, verse = ref.rsplit(":", 2)
                key = _ref_key(book, int(chapter), int(verse))
            except (ValueError, TypeError):
                continue
            verse_text_by_ref[key] = verse_text

    return verse_text_by_ref


def _classify_verse_reading(passage: PassageRef, verse_text: str) -> str | None:
    verse_node = _verse_node_from_ref(passage)
    if verse_node is None:
        print(f"[WARN] Missing BHSA verse node: {passage.book} {passage.chapter}:{passage.verse}")
        return None

    saw_kq_word = False
    saw_qere_match = False
    saw_ketiv_match = False

    for word in L.d(verse_node, "word"):
        qere = _feature_value(word, "qere_utf8", "qere_utf", "qere")
        if not qere:
            continue

        saw_kq_word = True
        ketiv = _feature_value(word, "g_word_utf8", "g_word_utf", "g_word") or T.text(word)
        if qere in verse_text:
            saw_qere_match = True
        if ketiv in verse_text:
            saw_ketiv_match = True

    if not saw_kq_word:
        return None
    if saw_qere_match and not saw_ketiv_match:
        return "qere"
    if saw_ketiv_match and not saw_qere_match:
        return "ketiv"
    if saw_qere_match:
        return "qere"
    if saw_ketiv_match:
        return "ketiv"
    return None


def report_passage_readings(passages: list[PassageRef], data_path: Path = DATA_PATH) -> None:
    verse_text_by_ref = _load_passages_text(data_path)

    for passage in passages:
        reference = f"{passage.book} {passage.chapter}:{passage.verse}"
        key = _ref_key(passage.book, passage.chapter, passage.verse)
        verse_text = verse_text_by_ref.get(key)
        if verse_text is None:
            print(f"[WARN] Missing verse in passages.json: {reference}")
            continue

        reading = _classify_verse_reading(passage, verse_text)
        if reading == "qere":
            print(f"🟢 {reference}")
        elif reading == "ketiv":
            print(f"🟡 {reference}")
        else:
            print(f"[WARN] Could not classify: {reference}")


if __name__ == "__main__":
    report_passage_readings(PASSAGES)