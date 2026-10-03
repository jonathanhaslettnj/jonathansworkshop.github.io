// =====================================
// MULTI-TRANSLATION TALKING MEMORIZER
// =====================================

// Translation files (ARRAY JSON: [{ref:"Genesis 1:1", text:"..."}])
const translations = {
    kjv: "https://jonathansworkshop.online/memorizer/kjv/kjv.json",
    asv: "https://jonathansworkshop.online/memorizer/asv/asv.json",
    bbe: "https://jonathansworkshop.online/memorizer/bbe/bbe.json"
};

// Active translation
let currentTranslation = "kjv";
let bibleData = []; // ARRAY of {ref, text}

// Verse state
let currentWords = [];
let index = 0;
let mistakes = 0;
let currentRef = "";
let verseList = [];
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
// NORMALIZE WORDS
// =====================================

function normalizeWord(w) {
    return w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "").toLowerCase();
}

// =====================================
// SMART ACCEPTANCE (3 letters)
// =====================================

function isAccepted(typed, expectedRaw) {
    let t = normalizeWord(typed);
    let e = normalizeWord(expectedRaw);

    if (!e) return false;

    if (e.length < 3) {
        return t.length >= e.length && t === e;
    }

    if (t.length >= 3) {
        return e.startsWith(t.substring(0, 3));
    }

    return false;
}

// =====================================
// LOAD TRANSLATION JSON
// =====================================

function loadTranslation(name) {
    currentTranslation = name;

    fetch(translations[name])
        .then(r => r.json())
        .then(data => {
            bibleData = data; // ARRAY of {ref, text}

            // Build verse list from JSON
            verseList = bibleData.map(v => v.ref);

            statusDisplay.textContent = `${name.toUpperCase()} loaded.`;
        });
}

translationSelector.addEventListener("change", () => {
    loadTranslation(translationSelector.value);
});

// Load default translation
//loadTranslation("kjv");

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

    // JSON is an ARRAY, not a dictionary
    let entry = bibleData.find(v => v.ref === cleanRef);
    let text = entry ? entry.text : null;

    if (!text) {
        progressDisplay.textContent = "";
        statusDisplay.textContent = "Verse not found in this translation.";
        currentWords = [];
        index = 0;
        mistakes = 0;
        return;
    }

    // FIX: Set currentVerseIndex based on verseList
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
// CHECK WORD
// =====================================

function checkWord(typed) {
    let expectedRaw = currentWords[index] || "";
    let expectedNorm = normalizeWord(expectedRaw);
    let typedNorm = normalizeWord(typed);

    if (typedNorm === expectedNorm || isAccepted(typed, expectedRaw)) {
        index++;
        updateProgress();

        if (index >= currentWords.length) {
            statusDisplay.textContent =
                `✔ Verse complete! Mistakes: ${mistakes === 0 ? "0 (Perfect!)" : mistakes}`;

            if (mistakes === 0) speak("Perfect recitation. No mistakes.");
            else speak(`Verse complete. You made ${mistakes} mistakes.`);
        } else {
            statusDisplay.textContent = `Correct. Next word: (${index + 1}/${currentWords.length})`;
        }
    } else {
        mistakes++;
        statusDisplay.textContent = `❌ Expected "${expectedRaw}", but you typed "${typed}".`;
        speak("Incorrect. Expected " + expectedRaw);
    }
}

// =====================================
// INPUT HANDLING — SPACE / ENTER FIX
// =====================================

wordInput.addEventListener("keydown", e => {
    if (e.key === " " || e.key === "Enter") {
        e.preventDefault();

        let typed = wordInput.value.trim();
        if (!typed) return;

        let expectedRaw = currentWords[index] || "";
        if (!expectedRaw) return;

        if (normalizeWord(typed) === normalizeWord(expectedRaw) || isAccepted(typed, expectedRaw)) {
            beep();
            checkWord(expectedRaw);
        } else {
            checkWord(typed);
        }

        wordInput.value = "";
    }
});

wordInput.addEventListener("focus", () => {
    wordInput.value = "";
});

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
}
