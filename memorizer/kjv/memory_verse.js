// ------------------------------------------------------------
// Load multiple translations
// ------------------------------------------------------------
let translations = {
    kjv: {
        data: [],
        ready: false,
        file: "https://jonathansworkshop.online/memorizer/kjv/kjv.json"
    },
    asv: {
        data: [],
        ready: false,
        file: "https://jonathansworkshop.online/memorizer/kjv/asv.json"
    },
    bbe: {
        data: [],
        ready: false,
        file: "https://jonathansworkshop.online/memorizer/kjv/bbe.json"
    }
};

// Load all translation files
Object.keys(translations).forEach(key => {
    fetch(translations[key].file)
        .then(r => r.json())
        .then(data => {
            translations[key].data = data;
            translations[key].ready = true;
            console.log(key.toUpperCase() + " JSON loaded.");
        })
        .catch(err => console.error(key + " JSON load error:", err));
});

// ------------------------------------------------------------
// Setup after DOM is ready
// ------------------------------------------------------------
window.addEventListener("load", () => {
    const refInput = document.getElementById("mv_reference_input");
    const mvInput = document.getElementById("mv_input");

    refInput.focus();

    // Load verse when pressing Enter or Tab
    refInput.addEventListener("keydown", function (event) {
        if (event.code === "Enter" || event.code === "Tab") {
            event.preventDefault();
            loadTypedReference();
            mvInput.focus();
        }
    });

    // Next Verse button
    document.getElementById("mv_next_verse").addEventListener("click", () => {
        const currentRef = document.getElementById("mv_reference").innerText.trim();
        if (!currentRef) return;

        const nextRef = getNextReference(currentRef);
        const text = lookupVerse(nextRef);

        if (text) {
            loadVerse(text, nextRef);
            document.getElementById("mv_reference_input").value = nextRef;
            document.getElementById("mv_input").focus();
        }
    });

    // Spacebar checks typed word
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
// Lookup verse text based on selected translation
// ------------------------------------------------------------
function lookupVerse(reference) {
    const t = document.getElementById("mv_translation").value;

    if (!translations[t].ready) {
        alert("Bible translation is still loading. Please wait.");
        return "";
    }

    const verses = translations[t].data;
    const found = verses.find(v => v.ref === reference);
    return found ? found.text : "";
}

// ------------------------------------------------------------
// Module state
// ------------------------------------------------------------
const mv = {
    words: [],          // normalized words for checking
    originalWords: [],  // original words for display
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
    mv.words = text.split(/\s+/).map(w => normalize(w));   // normalized for checking
    mv.originalWords = text.split(/\s+/);                  // original for display
    mv.index = 0;
    mv.mistakes = 0;

    document.getElementById("mv_reference").innerText = reference;

    // Clear UI
    document.getElementById("mv_progress").innerText = "";
    document.getElementById("mv_next").innerText = "";
    document.getElementById("mv_reveal").innerText = "";
    document.getElementById("mv_status").innerText = "";

    document.getElementById("mv_input").value = "";
}

// ------------------------------------------------------------
// Check typed word
// ------------------------------------------------------------
function checkWord() {
    const mvInput = document.getElementById("mv_input");
    const typed = normalize(mvInput.value.trim());

    if (!typed) return;

    const expected = mv.words[mv.index];

    if (typed === expected) {
        // Correct word
        mv.index++;

        // Display ORIGINAL word (with punctuation + capitalization)
        document.getElementById("mv_progress").innerText +=
            mv.originalWords[mv.index - 1] + " ";

        // Completed verse
        if (mv.index >= mv.words.length) {
            document.getElementById("mv_status").innerText = "✔ Verse complete!";
            document.getElementById("mv_next").innerText = "";
            document.getElementById("mv_reveal").innerText = "";
        }
    } else {
        // Mistake
        mv.mistakes++;
        document.getElementById("mv_status").innerText =
            "❌ Incorrect (" + mv.mistakes + " mistake" +
            (mv.mistakes === 1 ? "" : "s") + ")";

        // Reveal correct word (normalized)
        document.getElementById("mv_reveal").innerText =
            "Correct word: " + expected;

        // Show hint ONLY on mistake
        document.getElementById("mv_next").innerText =
            "Next word: " + expected;
    }

    mvInput.value = "";
}

// ------------------------------------------------------------
// Next verse helper
// ------------------------------------------------------------
function getNextReference(ref) {
    const match = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (!match) return ref;

    const book = match[1];
    let chapter = parseInt(match[2], 10);
    let verse = parseInt(match[3], 10);

    verse++;

    return `${book} ${chapter}:${verse}`;
}

// ------------------------------------------------------------
// Restart module
// ------------------------------------------------------------
function restartModule() {
    mv.words = [];
    mv.originalWords = [];
    mv.index = 0;
    mv.mistakes = 0;

    document.getElementById("mv_reference_input").value = "";
    document.getElementById("mv_reference").innerText = "";
    document.getElementById("mv_progress").innerText = "";
    document.getElementById("mv_next").innerText = "";
    document.getElementById("mv_reveal").innerText = "";
    document.getElementById("mv_status").innerText = "";
    document.getElementById("mv_input").value = "";

    document.getElementById("mv_reference_input").focus();
}