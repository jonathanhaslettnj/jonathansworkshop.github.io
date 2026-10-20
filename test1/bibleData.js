// bibleData.js — final version for nested JSON Bible structure



function normalizeBookName(name) {
    return name
        .replace(/\s+/g, " ")   // collapse multiple spaces
        .trim()
        .toLowerCase();
}

function loadBible(versionName) {
    if (versionName === "kjv") Bible = kjv;
    if (versionName === "bbe") Bible = bbe;
    if (versionName === "asv") Bible = asv;
}

function getVerse(book, chapter, verse) {
    const key = normalizeBookName(book);

    // Find the actual book key in the JSON (case-insensitive)
    const bookKey = Object.keys(Bible).find(
        b => normalizeBookName(b) === key
    );

    if (!bookKey) return null;

    const chapterObj = Bible[bookKey][chapter];
    if (!chapterObj) return null;

    const verseText = chapterObj[verse];
    if (!verseText) return null;

    return verseText;
}
