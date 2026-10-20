

// Normalize book names (trim, lowercase, remove weird spaces)
function normalizeBookName(name) {
    return name
        .replace(/\s+/g, " ")       // collapse multiple spaces
        .trim()
        .toLowerCase();
}

function loadBible(versionName) {
    if (versionName === "kjv") BibleArray = kjv;
    if (versionName === "bbe") BibleArray = bbe;
    if (versionName === "asv") BibleArray = asv;

    Bible = buildBibleLookup(BibleArray);
}

function buildBibleLookup(dataArray) {
    const lookup = {};

    dataArray.forEach(entry => {
        // Split ref into book name + chapter:verse
        const lastSpace = entry.ref.lastIndexOf(" ");
        const rawBook = entry.ref.substring(0, lastSpace);
        const chapterVerse = entry.ref.substring(lastSpace + 1);

        const book = normalizeBookName(rawBook);
        const [chapter, verse] = chapterVerse.split(":").map(Number);

        if (!lookup[book]) lookup[book] = {};
        if (!lookup[book][chapter]) lookup[book][chapter] = {};

        lookup[book][chapter][verse] = entry.text;
    });

    return lookup;
}

function getVerse(book, chapter, verse) {
    const key = normalizeBookName(book);

    if (!Bible[key]) return null;
    if (!Bible[key][chapter]) return null;

    return Bible[key][chapter][verse] || null;
}
function saveCurrentVerse() {
    const verseText = getVerse(currentBook, currentChapter, currentVerse);
    if (!verseText) return;

    const verseRef = `${currentBook} ${currentChapter}:${currentVerse}`;
    const choice = document.getElementById("listSelect").value;

    const verseObj = { ref: verseRef, text: verseText };

    if (choice === "1") saveToList("mem_list_1", verseObj);
    else if (choice === "2") saveToList("mem_list_2", verseObj);
    else if (choice === "3") saveToList("mem_list_3", verseObj);
    else {
        saveToList("mem_list_1", verseObj);
        saveToList("mem_list_2", verseObj);
        saveToList("mem_list_3", verseObj);
    }

    alert(`Saved to list ${choice}: ${verseRef}`);
}

function saveToList(key, verseObj) {
    let list = JSON.parse(localStorage.getItem(key) || "[]");

    // Avoid duplicates
    if (!list.some(v => v.ref === verseObj.ref)) {
        list.push(verseObj);
        localStorage.setItem(key, JSON.stringify(list));
    }
}

