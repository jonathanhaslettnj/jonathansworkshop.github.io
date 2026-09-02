let mv = {
    words: [],
    index: 0,
    mistakes: 0
};

function loadVerse(text) {
    mv.words = text.trim().split(/\s+/);
    mv.index = 0;
    mv.mistakes = 0;
    document.getElementById("mv_reveal").innerText = "";
    document.getElementById("mv_status").innerText = "";
    updateDisplay();
}

function checkWord() {
    const raw = document.getElementById("mv_input").value.trim();
    const input = raw.split(/\s+/).pop();   // last word typed
    const expected = mv.words[mv.index];

    if (!expected) {
        document.getElementById("mv_status").innerText = "Verse complete!";
        return;
    }

    if (input.toLowerCase() === expected.toLowerCase()) {
        mv.index++;
        updateDisplay();
    } else {
        mv.mistakes++;
        revealNextWord(expected);
    }
}

function revealNextWord(word) {
    document.getElementById("mv_reveal").innerText = "Next word: " + word;
}

function updateDisplay() {
    const progress = mv.words.slice(0, mv.index).join(" ");
    document.getElementById("mv_progress").innerText = progress;
}
function handleKey(event) {
    if (event.key === "Enter") {
        const raw = document.getElementById("mv_input").value.trim();
        if (raw.length === 0) return;   // prevent empty submissions
        checkWord();
    }
}

