let Bible = {};
let BibleArray = [];

function loadBible(versionName) {
    if (versionName === "kjv") BibleArray = kjv;
    if (versionName === "bbe") BibleArray = bbe;
    if (versionName === "asv") BibleArray = asv;

    Bible = buildBibleLookup(BibleArray);
}

function buildBibleLookup(dataArray) {
    const lookup = {};

    dataArray.forEach(entry => {
        const [book, chapterVerse] = entry.ref.split(" ");
        const [chapter, verse] = chapterVerse.split(":").map(Number);

        if (!lookup[book]) lookup[book] = {};
        if (!lookup[book][chapter]) lookup[book][chapter] = {};

        lookup[book][chapter][verse] = entry.text;
    });

    return lookup;
}

function getVerse(book, chapter, verse) {
    if (!Bible[book]) return null;
    if (!Bible[book][chapter]) return null;
    return Bible[book][chapter][verse] || null;
}
