// ------------------------------------------------------------
// Load KJV JSON
// ------------------------------------------------------------
let kjv = {};
let kjvReady = false;

fetch("kjv.json")
    .then(r => r.json())
    .then(data => {
        kjv = data;
        kjvReady = true;
        console.log("KJV JSON loaded.");
    })
    .catch(err => console.error("JSON load error:", err));

// ------------------------------------------------------------
// Set up after DOM is ready
// ------------------------------------------------------------
window.addEventListener("load", () => {
    const refInput = document.getElementById("mv_reference_input");
    const mvInput = document.getElementById("mv_input");

    refInput.focus();

    refInput.addEventListener("keydown", function (event) {
        if (event.code === "Enter") {
            event.preventDefault();
            loadTypedReference();
            mvInput.focus();
        }
    });

    refInput.addEventListener("keydown", function (event) {
        if (event.code === "Tab") {
            event.preventDefault();
            loadTypedReference();
            mvInput.focus();
        }
    });

    mvInput.addEventListener("keydown", function (event) {
        if (event.code === "Space" || event.key === " ") {
            const raw = mvInput.value.trim();
            if (raw.length === 0) {
                event.preventDefault();
                return;
            }
            event.preventDefault();
            checkWord();
        }
    });
});

// ------------------------------------------------------------
// Normalize words
// ------------------------------------------------------------
function normalize(word) {
    return word.replace(/[.,;:!?]/g, "").toLowerCase();
}

// ------------------------------------------------------------
// Lookup verse text
// ------------------------------------------------------------
function lookupVerse(reference) {
    if (!kjvReady) {
        alert("Bible is still loading. Please wait.");
        return "";
    }
    return kjv[reference] || "";
}

// ------------------------------------------------------------
// Module state
// ------------------------------------------------------------
const mv = {
    words: [],
    index: 0,
    mistakes: 0
};

// ------------------------------------------------------------
// Load typed reference
// ------------------------------------------------------------
function loadTypedReference() {
    const ref = document.getElementById("mv_reference_input").value.trim();

    if (!ref) {
        alert("Please type a verse reference.");
        return;
    }

    const text = lookupVerse(ref);

    if (!text) {
        alert("Verse not found. Check spelling or format.");
        return;
    }

    loadVerse(text, ref);
}

// ------------------------------------------------------------
// Load verse text
// ------------------------------------------------------------
function loadVerse(text, reference = "") {
    mv.words = text.trim().split(/\s+/);
    mv.index = 0;
    mv.mistakes = 0;

    document.getElementById("mv_progress").innerText = "";
    document.getElementById("mv_reveal").innerText = "";
    document.getElementById("mv_status").innerText = "";
    document.getElementById("mv_reference").innerText = reference;

    updateDisplay();
}

// ------------------------------------------------------------
// Update display
// ------------------------------------------------------------
function updateDisplay() {
    const correctWords = mv.words.slice(0, mv.index).join(" ");
    document.getElementById("mv_progress").innerText = correctWords;

    if (mv.index >= mv.words.length) {
        document.getElementById("mv_status").innerText =
            "Verse complete! Mistakes: " + mv.mistakes;
        document.getElementById("mv_next").innerText = "";
        return;
    }

    document.getElementById("mv_next").innerText = "";
}

// ------------------------------------------------------------
// Reveal expected word
// ------------------------------------------------------------
function revealNextWord(expected) {
    document.getElementById("mv_reveal").innerText =
        "Expected: " + expected;
}

// ------------------------------------------------------------
// Check typed word
// ------------------------------------------------------------
function checkWord() {
    const raw = document.getElementById("mv_input").value.trim();
    if (raw.length === 0) return;

    const expected = mv.words[mv.index];

    if (normalize(raw) === normalize(expected)) {
        mv.index++;
        document.getElementById("mv_input").value = "";
        document.getElementById("mv_reveal").innerText = "";
        updateDisplay();
    } else {
        mv.mistakes++;
        revealNextWord(expected);
        document.getElementById("mv_input").value = "";
    }
}

// ------------------------------------------------------------
// Restart module
// ------------------------------------------------------------
function restartModule() {
    mv.words = [];
    mv.index = 0;
    mv.mistakes = 0;

    document.getElementById("mv_reference").innerText = "";
    document.getElementById("mv_progress").innerText = "";
    document.getElementById("mv_next").innerText = "";
    document.getElementById("mv_reveal").innerText = "";
    document.getElementById("mv_status").innerText = "";

    document.getElementById("mv_reference_input").value = "";
    document.getElementById("mv_input").value = "";

    document.getElementById("mv_reference_input").focus();
}





