// ============================================================
// mv_input.js — Multi-Version Input Handler (v12)
// Option C — Strict Letter-by-Letter
// ============================================================

// Input element
const inputEl = document.getElementById("mv_input");

// Progress display
const progressEl = document.getElementById("mv_progress");
const statusEl = document.getElementById("mv_status");

// Current word index
window.mv_wordIndex = 0;

// Split current verse text into words
function getWords() {
    if (!window.currentText) return [];
    return window.currentText.split(/\s+/);
}

// Reset input state when verse loads
window.addEventListener("loadVerseLoaded", () => {
    window.mv_wordIndex = 0;
    inputEl.value = "";
    progressEl.textContent = "";
    statusEl.textContent = "";
});

// Handle typing
inputEl.addEventListener("input", () => {
    const words = getWords();
    if (words.length === 0) return;

    const expected = words[window.mv_wordIndex];
    const typed = inputEl.value.trim();

    // Strict letter-by-letter checking
    if (expected.startsWith(typed)) {
        statusEl.textContent = "Correct so far…";
    } else {
        statusEl.textContent = "Mistake — try again";
    }
});

// Handle Enter key to submit word
inputEl.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const words = getWords();
    if (words.length === 0) return;

    const expected = words[window.mv_wordIndex];
    const typed = inputEl.value.trim();

    if (typed === expected) {
        // Correct word
        progressEl.textContent += expected + " ";
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
