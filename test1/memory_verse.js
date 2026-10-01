// ------------------------------------------------------------
// Load multiple translations
// ------------------------------------------------------------
let translations = {
    kjv: {
        data: [],
        ready: false,
        file: "https://jonathansworkshop.online/test1/kjv.json"
    },
    asv: {
        data: [],
        ready: false,
        file: "https://jonathansworkshop.online/test1/asv.json"
    },
    bbe: {
        data: [],
        ready: false,
        file: "https://jonathansworkshop.online/test1/bbe.json"
    }
};  // <-- THIS WAS MISSING





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

    // data is an array: [{ref, text}, ...]
    const verses = translations[t].data;

    const found = verses.find(v => v.ref === reference);
    return found ? found.text : "";
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
    mv.words = text.split(/\s+/).map(w => normalize(w));
    mv.index = 0;
    mv.mistakes = 0;

    // Display reference
    document.getElementById("mv_reference").innerText = reference;

    // Clear UI
    document.getElementById("mv_progress").innerText = "";
    document.getElementById("mv_next").innerText = "";
    document.getElementById("mv_reveal").innerText = "";
    document.getElementById("mv_status").innerText = "";

    // Show first expected word
    if (mv.words.length > 0) {
        document.getElementById("mv_next").innerText =
            "Next word: " + mv.words[0];
    }

    // Clear input
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

        document.getElementById("mv_progress").innerText += typed + " ";

        if (mv.index >= mv.words.length) {
            // Verse complete
            document.getElementById("mv_status").innerText =
                "✔ Verse complete!";
            document.getElementById("mv_next").innerText = "";
            document.getElementById("mv_reveal").innerText = "";
        } else {
            // Show next expected word
            document.getElementById("mv_next").innerText =
                "Next word: " + mv.words[mv.index];
        }
    } else {
        // Mistake
        mv.mistakes++;
        document.getElementById("mv_status").innerText =
            "❌ Incorrect (" + mv.mistakes + " mistake" +
            (mv.mistakes === 1 ? "" : "s") + ")";

        // Reveal correct word
        document.getElementById("mv_reveal").innerText =
            "Correct word: " + expected;
    }

    // Clear input for next word
    mvInput.value = "";
}

// ------------------------------------------------------------
// Next verse helper (simple increment)
// ------------------------------------------------------------
function getNextReference(ref) {
    // Example: "John 3:16" → book="John", chapter=3, verse=16
    const match = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (!match) return ref;

    const book = match[1];
    let chapter = parseInt(match[2], 10);
    let verse = parseInt(match[3], 10);

    verse++;

    const nextRef = `${book} ${chapter}:${verse}`;
    return nextRef;
}

// ------------------------------------------------------------
// Restart module
// ------------------------------------------------------------
function restartModule() {
    mv.words = [];
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
