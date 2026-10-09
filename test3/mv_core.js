// =====================================
// mv_core.js
// Version 12 — Developer Mode — lbyl — Multi-Version Core
// Last updated: 2026-10-08
// =====================================

const DEV_MODE = true;
console.log("Loaded mv_core.js — v12 Multi-Version Core");


// =====================================
// TRANSLATIONS (ARRAY JSON: [{ref:"Genesis 1:1", text:"..."}])
// =====================================

const translations = {
    kjv: "https://jonathansworkshop.online/test3/kjv.json",
    asv: "https://jonathansworkshop.online/test3/asv.json",
    bbe: "https://jonathansworkshop.online/test3/bbe.json"
};

let currentTranslation = "kjv";
let bibleData = [];        // ARRAY of {ref, text}
let verseList = [];        // ARRAY of refs

// Verse state
let currentWords = [];
let index = 0;
let mistakes = 0;
let currentRef = "";
let currentVerseIndex = 0;

// =====================================
// DOM ELEMENTS
// =====================================

const translationSelector = document.getElementById("mv_translation");
const refInput = document.getElementById("mv_reference_input");
const referenceDisplay = document.getElementById("mv_reference");
const progressDisplay = document.getElementById("mv_progress");
const statusDisplay = document.getElementById("mv_status");
const wordInput = document.getElementById("mv_input");
const nextBtn = document.getElementById("mv_next_verse");

// =====================================
// TEXT-TO-SPEECH
// =====================================

function speak(text) {
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0;
    u.pitch = 1.0;
    speechSynthesis.speak(u);
}

// =====================================
// BEEP SOUND
// =====================================

function beep() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = 800;
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
}

// =====================================
// LOAD TRANSLATION JSON
// =====================================

function loadTranslation(name) {
    currentTranslation = name;
    if (DEV_MODE) console.log("Fetching translation:", translations[name]);

    fetch(translations[name])
        .then(r => {
            if (DEV_MODE) console.log("Fetch response:", r.status, r.statusText);
            return r.json();
        })
        .then(data => {
            bibleData = data;
            verseList = bibleData.map(v => v.ref);
            statusDisplay.textContent = `${name.toUpperCase()} loaded.`;
            if (DEV_MODE) console.log("Data loaded:", data.length, "verses");
        })
        .catch(err => {
            console.error("Fetch error:", err);
            statusDisplay.textContent = "Error loading translation.";
        });
}

translationSelector.addEventListener("change", () => {
    loadTranslation(translationSelector.value);
});

// Load default translation on startup
loadTranslation(translationSelector.value);

// =====================================
// PARSE REFERENCE (for speaking only)
// =====================================

function parseReference(ref) {
    let [bookChap, verse] = ref.split(":");
    let parts = bookChap.trim().split(" ");

    let chapter = parts.pop();
    let book = parts.join(" ");

    return { book, chapter, verse };
}

// =====================================
// LOAD VERSE (ARRAY lookup)
// =====================================

function loadVerse(ref) {
    if (!ref) return;

    let cleanRef = ref.replace(/\s+/g, " ").trim();
    currentRef = cleanRef;

    let entry = bibleData.find(v => v.ref === cleanRef);
    let text = entry ? entry.text : null;

    if (!text) {
        progressDisplay.textContent = "";
        statusDisplay.textContent = "Verse not found in this translation.";
        currentWords = [];
        index = 0;
        mistakes = 0;
        if (DEV_MODE) console.log("Verse not found:", cleanRef);
        return;
    }

    currentVerseIndex = verseList.indexOf(cleanRef);

    currentWords = text.split(/\s+/);
    index = 0;
    mistakes = 0;

    referenceDisplay.textContent = cleanRef;
    progressDisplay.textContent = "";
    statusDisplay.textContent = "Begin typing the first word.";
    wordInput.value = "";
    wordInput.focus();

    let { book, chapter, verse } = parseReference(cleanRef);

    speak(`${book} chapter ${chapter}, verse ${verse}`);
    speak(text);

    if (DEV_MODE) console.log("Loaded verse:", cleanRef);
}

refInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        loadVerse(refInput.value.trim());
    }
});

// =====================================
// DISPLAY
// =====================================

function updateProgress() {
    progressDisplay.textContent = currentWords.slice(0, index).join(" ");
}

// =====================================
// EVENT HOOKS FOR INPUT MODULE
// =====================================

function onCorrectWord(expected) {
    if (DEV_MODE) console.log("Correct word:", expected);
}

function onIncorrectWord(expected, typed) {
    if (DEV_MODE) console.log("Incorrect:", typed, "Expected:", expected);
    speak("Incorrect. Expected " + expected);
}

function onVerseComplete(mistakesCount) {
    if (mistakesCount === 0) speak("Perfect recitation. No mistakes.");
    else speak("Verse complete. You made " + mistakesCount + " mistakes.");

    if (DEV_MODE) console.log("Verse complete. Mistakes:", mistakesCount);
}

// =====================================
// NEXT VERSE
// =====================================

nextBtn.addEventListener("click", () => {
    if (verseList.length === 0) {
        statusDisplay.textContent = "No verse list loaded.";
        return;
    }

    currentVerseIndex++;
    if (currentVerseIndex >= verseList.length) {
        currentVerseIndex = 0;
    }

    let nextRef = verseList[currentVerseIndex];
    refInput.value = nextRef;
    loadVerse(nextRef);
});

// =====================================
// RESTART
// =====================================

function restartModule() {
    refInput.value = "";
    referenceDisplay.textContent = "";
    progressDisplay.textContent = "";
    statusDisplay.textContent = "";
    wordInput.value = "";
    currentWords = [];
    index = 0;
    mistakes = 0;

    if (DEV_MODE) console.log("Restarted multi-version module");
}

// =====================================
// INTEGRITY CHECK
// =====================================

if (typeof loadVerse !== "function" ||
    typeof updateProgress !== "function") {
    console.error("ERROR: mv_core.js is corrupted or incomplete.");
}

// =====================================
// END OF FILE — NOTHING SHOULD BE BELOW THIS LINE
// =====================================
