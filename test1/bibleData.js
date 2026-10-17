let Bible = {};

function loadBible(versionName) {
    if (versionName === "kjv") Bible = kjv;
    if (versionName === "bbe") Bible = bbe;
    if (versionName === "asv") Bible = asv;
}

function getVerse(book, chapter, verse) {
    const ref = `${book} ${chapter}:${verse}`;
    const entry = Bible.find(v => v.ref === ref);
    return entry ? entry.text : null;
}
