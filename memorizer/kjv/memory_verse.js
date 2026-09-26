// ============================================================
// LOAD MERGED MULTI-TRANSLATION JSON (KJV, ASV, BBE, etc.)
// ============================================================

let allVerses = [];
let versesReady = false;
let currentVersion = "KJV";   // default translation
let currentRef = "";          // currently loaded reference

fetch("memorizer_multi.json")
    .then(r => r.json())
    .then(data => {
        allVerses = data;
        versesReady = true;
        console.log("Multi-translation JSON loaded.");
    })
    .catch(err => console.error("JSON load error:", err));


// ============================================================
// SET UP AFTER DOM IS READY
// ============================================================

window.addEventListener("load", () => {
    const refInput = document.getElementById("mv_reference_input");
    const mvInput = document.getElementById("mv_input");

    refInput.focus();

    // Load typed reference (Enter or Tab)
    refInput.addEventListener("keydown", function (event) {
        if (event.code === "Enter" || event.code === "Tab") {
            event.preventDefault();
            loadTypedReference();
            mvInput.focus();
        }
    });

    // Next Verse button
    document.getElementById("mv_next_verse").addEventListener("click", () => {
        const ref = document.getElementById("mv_reference").innerText.trim();
        if (!ref) return;

        const nextRef = getNextReference(ref);
        const text = lookupVerse(nextRef);

        if (text) {
            loadVerse(text, nextRef);

            // Put the new reference into the input box
            document.getElementById("mv_reference_input").value = nextRef;

            document.getElementById("mv_input").focus();
        }
    });

    // Spacebar checks next word
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

    // TRANSLATION SELECTOR
    document.getElementById("translationSelector").addEventListener("change", () => {
        currentVersion = document.getElementById("translationSelector").value;

        // If a verse is already loaded, refresh it in the new translation
        if (currentRef) {
            const text = lookupVerse(currentRef);
            if (text) {
                loadVerse(text, currentRef);
            }
        }
    });
});


// ============================================================
// NORMALIZE WORDS
// ============================================================

function normalize(word) {
    return word.replace(/[.,;:!?]/g, "").toLowerCase();
}


// ============================================================
// LOOKUP VERSE TEXT (multi-translation)
// ============================================================

function lookupVerse(reference) {
    if (!versesReady) {
        alert("Bible is still loading. Please wait.");
        return "";
    }

    const verseObj = allVerses.find(v => v.ref === reference);
    if (!verseObj) return "";

    // Use selected translation, fallback to KJV
    return verseObj[currentVersion] || verseObj["KJV"] || "";
}


// ============================================================
// MODULE STATE
// ============================================================

const mv = {
    words: [],
    index: 0,
    mistakes: 0
};


// ============================================================
// LOAD TYPED REFERENCE
// ============================================================

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


// ============================================================
// LOAD VERSE TEXT
// ============================================================

function loadVerse(text, reference = "") {
    currentRef = reference;

    mv.words = text.trim().split(/\s+/);
    mv.index = 0;
    mv.mistakes = 0;

    document.getElementById("mv_progress").innerText = "";
    document.getElementById("mv_reveal").innerText = "";
    document.getElementById("mv_status").innerText = "";
    document.getElementById("mv_reference").innerText = reference;

    updateDisplay();
}


// ============================================================
// UPDATE DISPLAY
// ============================================================

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


// ============================================================
// REVEAL EXPECTED WORD
// ============================================================

function revealNextWord(expected) {
    document.getElementById("mv_reveal").innerText =
        "Expected: " + expected;
}


// ============================================================
// CHECK TYPED WORD
// ============================================================

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


// ============================================================
// RESTART MODULE
// ============================================================

function restartModule() {
    mv.words = [];
    mv.index = 0;
    mv.mistakes = 0;

    currentRef = "";

    document.getElementById("mv_reference").innerText = "";
    document.getElementById("mv_progress").innerText = "";
    document.getElementById("mv_next").innerText = "";
    document.getElementById("mv_reveal").innerText = "";
    document.getElementById("mv_status").innerText = "";

    document.getElementById("mv_reference_input").value = "";
    document.getElementById("mv_input").value = "";

    document.getElementById("mv_reference_input").focus();
}


// ============================================================
// GET NEXT REFERENCE (uses KJV order)
// ============================================================

function getNextReference(ref) {
    // ref like "John 3:16"
    let [bookAndChapter, verseStr] = ref.split(":");
    let verse = parseInt(verseStr, 10);

    let parts = bookAndChapter.split(" ");
    let book = parts.slice(0, -1).join(" ");
    let chapter = parseInt(parts[parts.length - 1], 10);

    // Use KJV order for navigation
    const kjvOnly = {};
    allVerses.forEach(v => {
        if (v.KJV) kjvOnly[v.ref] = v.KJV;
    });

    // Next verse exists?
    if (kjvOnly[`${book} ${chapter}:${verse + 1}`]) {
        return `${book} ${chapter}:${verse + 1}`;
    }

    // Next chapter exists?
    if (kjvOnly[`${book} ${chapter + 1}:1`]) {
        return `${book} ${chapter + 1}:1`;
    }

    // Next book
    let allRefs = Object.keys(kjvOnly);
    let books = [...new Set(allRefs.map(r => r.split(" ").slice(0, -1).join(" ")))];
    let idx = books.indexOf(book);

    if (idx >= 0 && idx < books.length - 1) {
        let nextBook = books[idx + 1];
        return `${nextBook} 1:1`;
    }

    // End of Bible → wrap
    return "Genesis 1:1";
}


