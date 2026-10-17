// ============================================================
// Step 7 — Spoken Verse Input (Hands-Free Recitation)
// ============================================================

import { normalizeWord } from "./mv_input.js";
import { onCorrectWord, onIncorrectWord, onVerseComplete } from "./mv_core.js";

let spokenBuffer = "";       // rolling transcript
let lastProcessed = "";      // last processed chunk

// ------------------------------------------------------------
// Process spoken text into memorizer flow
// ------------------------------------------------------------
export function processSpokenText(transcript) {
    if (!transcript) return;

    spokenBuffer += " " + transcript.toLowerCase().trim();

    // Only process NEW spoken content
    const newChunk = spokenBuffer.replace(lastProcessed, "").trim();
    if (!newChunk) return;

    lastProcessed = spokenBuffer;

    const words = newChunk.split(/\s+/);

    for (let w of words) {
        handleSpokenWord(w);
    }
}

// ------------------------------------------------------------
// Compare spoken word to expected memorizer word
// ------------------------------------------------------------
function handleSpokenWord(spoken) {
    if (!window.currentWords || window.index >= window.currentWords.length) return;

    const expectedRaw = window.currentWords[window.index];
    const expectedNorm = normalizeWord(expectedRaw);
    const spokenNorm = normalizeWord(spoken);

    console.log("Spoken:", spokenNorm, "Expected:", expectedNorm);

    if (spokenNorm === expectedNorm) {
        window.index++;
        window.updateProgress();
        onCorrectWord(expectedRaw);

        if (window.index >= window.currentWords.length) {
            onVerseComplete(window.mistakes);
        }
    } else {
        window.mistakes++;
        onIncorrectWord(expectedRaw, spoken);
    }
}
