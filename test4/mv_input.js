document.addEventListener("keydown", (e) => {
    console.log("GLOBAL KEYDOWN:", e.key);
});

window.mvInputLoaded = "mv_input.js finished loading";

// ============================================================
// mv_input.js — Multi-Version Input Handler (v13)
// Strict Letter-by-Letter Mode + Reference Loader
// ============================================================

// ------------------------------------------------------------
// Elements
// ------------------------------------------------------------
const refInput = document.getElementById("mv_reference_input");
const inputEl = document.getElementById("mv_input");
const progressEl = document.getElementById("mv_progress");
const statusEl = document.getElementById("mv_status");

// Keep reference box focused initially
refInput.focus();

// ------------------------------------------------------------
// Reference Enter Handler
// ------------------------------------------------------------
refInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const ref = refInput.value.trim();
    const parsed = window.parseReference(ref);

    if (!parsed) {
        statusEl.textContent = "Invalid reference.";
        return;
    }

    window.loadVerse(parsed.book, parsed.chapter, parsed.verse);

    window.mv_wordIndex = 0;
    window.mv_lockedOnMistake = false;

    inputEl.value = "";
    progressEl.textContent = "";
    statusEl.textContent = "";

    inputEl.focus();
});

// ------------------------------------------------------------
// Prevent mv_input from stealing focus BEFORE a verse loads
// ------------------------------------------------------------
inputEl.addEventListener("focus", () => {
    if (!window.currentText) {
        refInput.focus();
    }
});

// ------------------------------------------------------------
// State
// ------------------------------------------------------------
window.mv_wordIndex = 0;
window.mv_lockedOnMistake = false;

// ------------------------------------------------------------
// Utility: split current verse text into words
// ------------------------------------------------------------
function getWords() {
    if (!window.currentText) return [];
    return window.currentText.split(/\s+/);
}

// ------------------------------------------------------------
// Utility: normalize punctuation + lowercase
// ------------------------------------------------------------
function normalize(word) {
    return word.replace(/[.,;:!?]/g, "").toLowerCase();
}

// ------------------------------------------------------------
// Beep on correct word
// ------------------------------------------------------------
function beep() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = 800;
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
}

// ------------------------------------------------------------
// Speak only the mistaken word
// ------------------------------------------------------------
function speakExpected(expectedWord) {
    const msg = new SpeechSynthesisUtterance("Expected: " + expectedWord);
    msg.rate = 0.9;
    msg.pitch = 1.0;
    msg.volume = 1.0;
    speechSynthesis.cancel();
    speechSynthesis.speak(msg);
}

// ------------------------------------------------------------
// Accept current word (preserve capitalization + punctuation)
// ------------------------------------------------------------
function acceptCurrentWord(expectedWord, words) {
    beep();
    progressEl.textContent += expectedWord + " ";
    window.mv_wordIndex++;
    window.mv_lockedOnMistake = false;
    inputEl.value = "";
    statusEl.textContent = "";

    if (window.mv_wordIndex >= words.length) {
        statusEl.textContent = "Verse complete!";
    }
}

// ------------------------------------------------------------
// Handle typing (auto-accept, strict letter-by-letter)
// ------------------------------------------------------------
inputEl.addEventListener("input", () => {
    const words = getWords();
    if (words.length === 0) return;

    const expected = words[window.mv_wordIndex];
    const typed = inputEl.value.trim();

    const expectedNorm = normalize(expected);
    const typedNorm = normalize(typed);

    if (window.mv_lockedOnMistake) {
        if (expectedNorm.startsWith(typedNorm)) {
            statusEl.textContent = "Correct so far…";

            if (typedNorm === expectedNorm) {
                acceptCurrentWord(expected, words);
            }
        } else {
            statusEl.textContent = "Mistake — fix the word";
        }
        return;
    }

    if (expectedNorm.startsWith(typedNorm)) {
        statusEl.textContent = "Correct so far…";

        if (typedNorm === expectedNorm) {
            acceptCurrentWord(expected, words);
        }
    } else {
        statusEl.textContent = "Mistake — fix the word";
        speakExpected(expected);
        window.mv_lockedOnMistake = true;
    }
});
