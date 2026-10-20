// bibleData.js — final version for nested JSON Bible structure



function normalizeBookName(name) {
    return name.replace(/\s+/g, " ").trim().toLowerCase();
}

function getVerse(book, chapter, verse) {
    const normalized = normalizeBookName(book);

    // Try lowercase match
    for (const key of Object.keys(Bible)) {
        if (key.toLowerCase() === normalized) {
            return Bible[key]?.[chapter]?.[verse] || null;
        }
    }

    return null;
}


function loadBible(versionName) {
    if (versionName === "kjv") Bible = kjv;
    if (versionName === "bbe") Bible = bbe;
    if (versionName === "asv") Bible = asv;
}

