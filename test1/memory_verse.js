
// ------------------------------------------------------------
// Load multiple translations
// ------------------------------------------------------------
let translations = {
    kjv: { data: {}, ready: false, file: "kjv.json" },
    asv: { data: {}, ready: false, file: "asv.json" },
    web: { data: {}, ready: false, file: "web.json" }
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

    refInput.addEventListener("keydown", function (event) {
        if (event.code === "Enter" || event.code === "Tab") {
            event.preventDefault();
            loadTypedReference();
            mvInput.focus();
        }
    });

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

    return translations[t].data[reference] || "";
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
    mv.words =