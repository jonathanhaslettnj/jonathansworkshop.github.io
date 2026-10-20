// bibleData.js — unified Bible lookup system

let Bible = {};   // Active version (kjv, bbe, asv)

// Normalize book names (collapse spaces, lowercase)
function normalizeBookName(name) {
    return name.replace(/\s+/g, " ").trim().toLowerCase();
}

// Flexible verse lookup that matches ANY book key format
function getVerse(book, chapter, verse) {
    const normalized = normalizeBookName(book);

    // Match JSON keys regardless of case or spacing
    for (const key of Object.keys(Bible)) {
        if (key.toLowerCase() === normalized) {
            return Bible[key]?.[chapter]?.[verse] || null;
        }
    }

    return null;
}

// Load selected Bible version
function loadBible(versionName) {
    versionName = versionName.toLowerCase();

    if (versionName === "kjv") Bible = kjv;
    if (versionName === "bbe") Bible = bbe;
    if (versionName === "asv") Bible = asv;
}

