// ============================================================
// mv_core.js — Multi-Version Memorizer Core (v12)
// ============================================================

// Global state
window.currentBook = null;
window.currentChapter = null;
window.currentVerse = null;
window.currentTranslation = "kjv";
window.translationData = null;
window.currentText = "";

// ------------------------------------------------------------
// Load translation JSON (KJV, ASV, BBE)
// ------------------------------------------------------------
window.loadTranslation = async function(name) {
    window.currentTranslation = name;

    const url = `https://jonathansworkshop.online/test3/${name}.json`;
    console.log("Fetching translation:", url);

    const response = await fetch(url);
    console.log("Fetch response:", response.status);

    const data = await response.json();
    window.translationData = data;

    console.log("Data loaded:", data.length, "verses");
};

// ------------------------------------------------------------
// Parse reference (e.g., "John 11:35")
// ------------------------------------------------------------
window.parseReference = function(ref) {
    const m = ref.match(/^([\w\s]+)\s+(\d+):(\d+)$/);
    if (!m) return null;

    return {
        book: m[1].trim(),
        chapter: parseInt(m[2], 10),
        verse: parseInt(m[3], 10)
    };
};

// Load a verse into the memorizer
window.loadVerse = function(book, chapter, verse) {
    if (!window.translationData) return;

    window.currentBook = book;
    window.currentChapter = chapter;
    window.currentVerse = verse;

    const ref = `${book} ${chapter}:${verse}`;

    // FIXED: JSON uses "ref", not "reference"
    const entry = window.translationData.find(v => v.ref === ref);

    if (!entry) {
        document.getElementById("mv_reference").textContent = "Verse not found.";
        return;
    }

    document.getElementById("mv_reference").textContent = ref;
    document.getElementById("mv_progress").textContent = "";
    document.getElementById("mv_next").textContent = "";
    document.getElementById("mv_reveal").textContent = "";
    document.getElementById("mv_status").textContent = "";

    window.currentText = entry.text;
    window.speakVerse(entry.text);

    // ⭐ REQUIRED: notify mv_input.js that the verse is ready
    window.dispatchEvent(new Event("loadVerseLoaded"));
};

// ------------------------------------------------------------
// Navigation Functions (Step 9)
// ------------------------------------------------------------

window.loadNextVerse = function() {
    if (!window.currentBook || !window.currentChapter || !window.currentVerse) return;
    const next = window.currentVerse + 1;
    loadVerse(window.currentBook, window.currentChapter, next);
};

window.loadPreviousVerse = function() {
    if (!window.currentBook || !window.currentChapter || !window.currentVerse) return;
    const prev = window.currentVerse - 1;
    if (prev < 1) return;
    loadVerse(window.currentBook, window.currentChapter, prev);
};

window.restartCurrentVerse = function() {
    if (!window.currentBook || !window.currentChapter || !window.currentVerse) return;
    loadVerse(window.currentBook, window.currentChapter, window.currentVerse);
};

window.startChapter = function() {
    if (!window.currentBook || !window.currentChapter) return;
    loadVerse(window.currentBook, window.currentChapter, 1);
};

window.jumpToVerse = function(targetVerse) {
    if (!window.currentBook || !window.currentChapter) return;
    if (!targetVerse || targetVerse < 1) return;
    loadVerse(window.currentBook, window.currentChapter, targetVerse);
};

// ------------------------------------------------------------
// Initialize default translation
// ------------------------------------------------------------
loadTranslation("kjv");

