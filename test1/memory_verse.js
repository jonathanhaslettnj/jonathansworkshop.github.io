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

function normalize(word) {
    return word.replace(/[.,;:!?]/g, "").toLowerCase();
}

function lookupVerse(reference) {
    if (!kjvReady) {
        alert("Bible is still loading. Please wait.");
        return "";
    }
    return kjv[reference] || "";
}

const mv = {
    words: [],
    index: 0,
    mistakes: 0
};

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

function revealNextWord(expected) {
    document.getElementById("mv_reveal").innerText =
        "Expected: " + expected;
}

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

function getNextReference(ref) {
    let [bookAndChapter, verseStr] = ref.split(":");
    let verse = parseInt(verseStr, 10);

    let parts = bookAndChapter.split(" ");
    let book = parts.slice(0, -1).join(" ");
    let chapter = parseInt(parts[parts.length - 1], 10);

    if (kjv[`${book} ${chapter}:${verse + 1}`]) {
        return `${book} ${chapter}:${verse + 1}`;
    }

    if (kjv[`${book} ${chapter + 1}:1`]) {
        return `${book} ${chapter + 1}:1`;
    }

    let allRefs = Object.keys(kjv);
    let books = [...new Set(allRefs.map(r => r.split(" ").slice(0, -1).join(" ")))];
    let idx = books.indexOf(book);

    if (idx >= 0 && idx < books.length - 1) {
        let nextBook = books[idx + 1];
        return `${nextBook} 1:1`;
    }

    return "Genesis 1:1";
}
