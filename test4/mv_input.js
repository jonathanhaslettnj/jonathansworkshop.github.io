// ============================================================
// mv_input.js — Multi-Version Input Handler (v12)
// Strict Letter-by-Letter Mode + Reference Loader
// ============================================================

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
window.mv_lockedOnMistake = false;   // user must fix mistaken word

// ------------------------------------------------------------
// Utility: split current verse text into words
// ------------------------------------------------------------
function getWords() {
    if (!window.currentText) return [];
    return window.currentText.split(/\s+/);
}

// ------------------------------------------------------------
// Utility: normalize punctuation for strict mode
// ------------------------------------------------------------
function normalize(word) {
    return word.replace(/[.,;:!?]/g, "");
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
// Speak "Expected ..." then speak next word
// ------------------------------------------------------------
function speakExpectedAndNext(expectedWord, nextWord) {
    const msg1 = new SpeechSynthesisUtterance("Expected: " + expectedWord);
    const msg2 = new SpeechSynthesisUtterance(nextWord);

    speechSynthesis.speak(msg1);
    msg1.onend = () => {
        if (nextWord) speechSynthesis.speak(msg2);
    };
}

// ------------------------------------------------------------
// Reference Input Handler
// ------------------------------------------------------------
refInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const ref = refInput.value.trim();
    const parsed = window.parseReference(ref);

    if (!parsed) {
        document.getElementById("mv_reference").textContent = "Invalid reference.";
        return;
    }

    // Load the verse
    window.loadVerse(parsed.book, parsed.chapter, parsed.verse);

    // Reset memorizer state
    window.mv_wordIndex = 0;
    window.mv_lockedOnMistake = false;
    inputEl.value = "";
    progressEl.textContent = "";
    statusEl.textContent = "";

    // Focus the next-word input
    inputEl.focus();

    // Notify other modules (Developer Mode, Voice Router, etc.)
    window.dispatchEvent(new Event("loadVerseLoaded"));
});

// ------------------------------------------------------------
// Reset input state when verse loads
// ------------------------------------------------------------
window.addEventListener("loadVerseLoaded", () => {
    window.mv_wordIndex = 0;
    window.mv_lockedOnMistake = false;
    inputEl.value = "";
    progressEl.textContent = "";
    statusEl.textContent = "";
});

// ------------------------------------------------------------
// Core: advance to next word when fully correct
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
// Handle typing (strict letter-by-letter, auto-accept)
// ------------------------------------------------------------
inputEl.addEventListener("input", () => {
    const words = getWords();
    if (words.length === 0) return;

    const expected = words[window.mv_wordIndex];
    const typed = inputEl.value.trim();

    const expectedNorm = normalize(expected);
    const typedNorm = normalize(typed);

    // If user is correcting a mistake, they MUST type the mistaken word
    if (window.mv_lockedOnMistake) {
        if (expectedNorm.startsWith(typedNorm)) {
            statusEl.textContent = "Correct so far…";

            // If fully correct, auto-accept
            if (typedNorm === expectedNorm) {
                acceptCurrentWord(expectedNorm, words);
            }
        } else {
            statusEl.textContent = "Mistake — fix the word";
        }
        return;
    }

    // Normal strict letter-by-letter mode
    if (expectedNorm.startsWith(typedNorm)) {
        statusEl.textContent = "Correct so far…";

        // If fully correct, auto-accept
        if (typedNorm === expectedNorm) {
            acceptCurrentWord(expectedNorm, words);
        }
    } else {
        // Immediate mistake detection
        statusEl.textContent = "Mistake — fix the word";

        const nextWord = words[window.mv_wordIndex + 1] || "";
        speakExpectedAndNext(expected, nextWord);

        // Lock user on this word until corrected
        window.mv_lockedOnMistake = true;
    }
});

// ------------------------------------------------------------
// Optional: Enter key still works, but is not required
// ------------------------------------------------------------
inputEl.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const words = getWords();
    if (words.length === 0) return;

    const expected = words[window.mv_wordIndex];
    const typed = inputEl.value.trim();

    const expectedNorm = normalize(expected);
    const typedNorm = normalize(typed);

    // User must fix mistaken word first
    if (window.mv_lockedOnMistake) {
        if (typedNorm === expectedNorm) {
            acceptCurrentWord(expectedNorm, words);
        } else {
            statusEl.textContent = "Incorrect — fix the word";
        }
        return;
    }

    // Normal correct word via Enter (optional)
    if (typedNorm === expectedNorm) {
        acceptCurrentWord(expectedNorm, words);
    } else {
        statusEl.textContent = "Incorrect — fix the word";

        const nextWord = words[window.mv_wordIndex + 1] || "";
        speakExpectedAndNext(expected, nextWord);

        window.mv_lockedOnMistake = true;
    }
});
