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
    inputEl.value = "";
    progressEl.textContent = "";
    statusEl.textContent = "";
});

// ------------------------------------------------------------
// Handle typing (strict letter-by-letter)
// ------------------------------------------------------------
inputEl.addEventListener("input", () => {
    const words = getWords();
    if (words.length === 0) return;

    const expected = words[window.mv_wordIndex];
    const typed = inputEl.value.trim();

    const expectedNorm = normalize(expected);
    const typedNorm = normalize(typed);

    if (expectedNorm.startsWith(typedNorm)) {
        statusEl.textContent = "Correct so far…";
    } else {
        statusEl.textContent = "Mistake — try again";
    }
});

// ------------------------------------------------------------
// Handle Enter key to submit a word
// ------------------------------------------------------------
inputEl.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const words = getWords();
    if (words.length === 0) return;

    const expected = words[window.mv_wordIndex];
    const typed = inputEl.value.trim();

    const expectedNorm = normalize(expected);
    const typedNorm = normalize(typed);

    if (typedNorm === expectedNorm) {
        // Correct word
        progressEl.textContent += expectedNorm + " ";
        window.mv_wordIndex++;
        inputEl.value = "";
        statusEl.textContent = "";

        if (window.mv_wordIndex >= words.length) {
            statusEl.textContent = "Verse complete!";
        }
    } else {
        statusEl.textContent = "Incorrect — try again";
    }
});

