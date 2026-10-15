document.addEventListener("keydown", (e) => {
    console.log("GLOBAL KEYDOWN:", e.key);
});

window.mvInputLoaded = "mv_input.js finished loading";

// ============================================================
// mv_input.js — Multi-Version Input Handler (v12)
// Strict Letter-by-Letter Mode + Reference Loader
// ============================================================

// ------------------------------------------------------------
// Elements
// ------------------------------------------------------------
const refInput = document.getElementById("mv_reference_input");
const inputEl = document.getElementById("mv_input");

// Now it is safe to call focus()
refInput.focus();


// ------------------------------------------------------------
// Elements
// ------------------------------------------------------------
const refInput = document.getElementById("mv_reference_input");
const inputEl = document.getElementById("mv_input");

const progressEl = document.getElementById("mv_progress");
const statusEl = document.getElementById("mv_status");

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
    speechSynthesis.speak(msg);
}

// ------------------------------------------------------------
// Accept current word
// ------------------------------------------------------------
function acceptCurrentWord(expectedNorm, words) {
    beep();
    progressEl.textContent += expectedNorm + " ";
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

    // If correcting a mistake
    if (window.mv_lockedOnMistake) {
        if (expectedNorm.startsWith(typedNorm)) {
            statusEl.textContent = "Correct so far…";

            if (typedNorm === expectedNorm) {
                acceptCurrentWord(expectedNorm, words);
            }
        } else {
            statusEl.textContent = "Mistake — fix the word";
        }
        return;
    }

    // Normal strict mode
    if (expectedNorm.startsWith(typedNorm)) {
        statusEl.textContent = "Correct so far…";

        if (typedNorm === expectedNorm) {
            acceptCurrentWord(expectedNorm, words);
        }
    } else {
        statusEl.textContent = "Mistake — fix the word";

        speakExpected(expected);

        window.mv_lockedOnMistake = true;
    }
});
