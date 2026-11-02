// =====================================
// mv_input.js
// Version 12 — Developer Mode — lbyl — Multi-Version Input
// Last updated: 2026-10-08
// =====================================

console.log("Loaded mv_input.js — v12 Multi-Version Input (Option C Strict)");

// =====================================
// NORMALIZE WORDS
// =====================================

function normalizeWord(w) {
    return w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "").toLowerCase();
}

// =====================================
// CHECK WORD (Option C strict)
// =====================================

function checkWord(typed) {
    let expectedRaw = currentWords[index] || "";
    let expectedNorm = normalizeWord(expectedRaw);
    let typedNorm = normalizeWord(typed);

    if (DEV_MODE) {
        console.log("checkWord(): typed =", typedNorm, "expected =", expectedNorm);
    }

    if (typedNorm === expectedNorm) {
        index++;
        updateProgress();
        onCorrectWord(expectedRaw);

        if (index >= currentWords.length) {
            statusDisplay.textContent =
                `✔ Verse complete! Mistakes made: ${mistakes === 0 ? "0 (Perfect!)" : mistakes}`;
            onVerseComplete(mistakes);
        } else {
            statusDisplay.textContent =
                `Correct. Next word: (${index + 1}/${currentWords.length})`;
        }
    } else {
        mistakes++;
        statusDisplay.textContent =
            `❌ Expected "${expectedRaw}", but you typed "${typed}".`;
        onIncorrectWord(expectedRaw, typed);
    }
}

// =====================================
// INPUT HANDLING — OPTION C STRICT LETTER-BY-LETTER
// =====================================

wordInput.addEventListener("input", () => {
    let typed = wordInput.value;
    if (!typed) return;

    let expectedRaw = currentWords[index] || "";
    let expectedNorm = normalizeWord(expectedRaw);
    let typedNorm = normalizeWord(typed);

    if (DEV_MODE) {
        console.log("input(): typed =", typedNorm, "expected =", expectedNorm);
    }

    // Too many letters → mistake
    if (typedNorm.length > expectedNorm.length) {
        mistakes++;
        statusDisplay.textContent =
            `❌ Incorrect letter. Expected "${expectedRaw}".`;
        onIncorrectWord(expectedRaw, typed);
        wordInput.value = "";
        return;
    }

    // Compare each typed letter
    for (let i = 0; i < typedNorm.length; i++) {
        if (typedNorm[i] !== expectedNorm[i]) {
            mistakes++;
            statusDisplay.textContent =
                `❌ Incorrect letter. Expected "${expectedRaw}".`;
            onIncorrectWord(expectedRaw, typed);
            wordInput.value = "";
            return;
        }
    }

    // Full word typed correctly
    if (typedNorm.length === expectedNorm.length) {
        beep();
        checkWord(expectedRaw);
        wordInput.value = "";
    }
});

// =====================================
// CLEAR INPUT ON FOCUS
// =====================================

wordInput.addEventListener("focus", () => {
    wordInput.value = "";
});

// =====================================
// INTEGRITY CHECK
// =====================================

if (typeof normalizeWord !== "function" ||
    typeof checkWord !== "function") {
    console.error("ERROR: mv_input.js is corrupted or incomplete.");
}

// =====================================
// END OF FILE — NOTHING SHOULD BE BELOW THIS LINE
// =====================================
