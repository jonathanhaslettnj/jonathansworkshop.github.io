// =====================================
// THREE MEMORY LISTS
// =====================================

// List A = original non-audio list
let listA = JSON.parse(localStorage.getItem("mv_custom_list") || "[]");

// List B = audio version list (correct key)
let listB = JSON.parse(localStorage.getItem("userVerses") || "[]");

// List C = unified list
let listC = JSON.parse(localStorage.getItem("mv_custom_list_unified") || "[]");

// Default list = List C
let currentList = listC;
let currentListName = "C";

// Verse index for Next Verse
let currentVerseIndex = 0;

// =====================================
// DOM ELEMENTS
// =====================================

const refInput = document.getElementById("refInput");
const verseDisplay = document.getElementById("verseDisplay");
const statusDisplay = document.getElementById("statusDisplay");
const wordInput = document.getElementById("wordInput");

const nextBtn = document.getElementById("nextBtn");
const repeatBtn = document.getElementById("repeatBtn");
const resetBtn = document.getElementById("resetBtn");

const userRefInput = document.getElementById("userRefInput");
const userTextInput = document.getElementById("userTextInput");
const addUserVerseBtn = document.getElementById("addUserVerseBtn");
const userVersesDiv = document.getElementById("user-verses");

const listSelector = document.getElementById("mv_list_selector");
const loadListBtn = document.getElementById("mv_load_list_btn");

let currentWords = [];
let index = 0;
let mistakes = 0;

// =====================================
// TEXT-TO-SPEECH
// =====================================

function speak(text) {
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0;
    u.pitch = 1.0;
    speechSynthesis.speak(u);
}

// =====================================
// EVENT HOOKS
// =====================================

function onLoadVerse(text, reference) {
    let [bookAndChapter, verseStr] = reference.split(":");
    let parts = bookAndChapter.trim().split(" ");

    let verse = verseStr;
    let chapter = parts.pop();
    let book = parts.join(" ");

    speak("Now memorizing " + book + " chapter " + chapter + ", verse " + verse);
    speak(text);
}

function onCorrectWord(expected) {
    speak("Correct");
}

function onIncorrectWord(expected, typed) {
    speak("Incorrect. Expected " + expected);
}

function onVerseComplete(mistakes) {
    if (mistakes === 0) {
        speak("Perfect recitation. No mistakes.");
    } else {
        speak("Verse complete. You made " + mistakes + " mistakes.");
    }
}

// =====================================
// NORMALIZE WORDS
// =====================================

function normalizeWord(w) {
    return w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "").toLowerCase();
}

// =====================================
// LOAD VERSE BY REFERENCE
// =====================================

refInput.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        loadVerse(refInput.value.trim());
    }
});

function loadVerse(reference) {
    if (!reference) return;

    let match = currentList.find(v => v.ref.toLowerCase() === reference.toLowerCase());

    if (!match) {
        verseDisplay.textContent = "Verse not found in selected list.";
        currentWords = [];
        index = 0;
        mistakes = 0;
        return;
    }

    currentWords = match.text.split(/\s+/);
    index = 0;
    mistakes = 0;

    verseDisplay.textContent = "";
    statusDisplay.textContent = "Begin typing the first word.";
    wordInput.value = "";
    wordInput.focus();

    onLoadVerse(match.text, match.ref);
}

// =====================================
// LOAD NEXT VERSE (Option 1: sequential order)
// =====================================

function loadNextVerse() {
    if (currentList.length === 0) {
        statusDisplay.textContent = "No verses in this list.";
        return;
    }

    currentVerseIndex++;

    if (currentVerseIndex >= currentList.length) {
        currentVerseIndex = 0; // wrap around
    }

    let nextRef = currentList[currentVerseIndex].ref;
    refInput.value = nextRef;
    loadVerse(nextRef);
}

nextBtn.addEventListener("click", loadNextVerse);

// =====================================
// DISPLAY
// =====================================

function updateVerseDisplay() {
    verseDisplay.textContent = currentWords.slice(0, index).join(" ");
}

// =====================================
// CHECK WORD
// =====================================

function checkWord(typed) {
    let expectedRaw = currentWords[index] || "";
    let expectedNorm = normalizeWord(expectedRaw);
    let typedNorm = normalizeWord(typed);

    if (expectedNorm === "") {
        index++;
        updateVerseDisplay();
        return;
    }

    if (typedNorm === expectedNorm) {
        index++;
        updateVerseDisplay();
        onCorrectWord(expectedRaw);

        if (index >= currentWords.length) {
            statusDisplay.textContent =
                `✔ Verse complete! Mistakes made: ${mistakes === 0 ? "0 (Perfect!)" : mistakes}`;
            onVerseComplete(mistakes);
        } else {
            statusDisplay.textContent = `Correct. Next word: (${index + 1}/${currentWords.length})`;
        }
    } else {
        mistakes++;
        statusDisplay.textContent = `❌ Expected "${expectedRaw}", but you typed "${typed}".`;
        onIncorrectWord(expectedRaw, typed);
    }
}

// =====================================
// iPhone Input Fix
// =====================================

wordInput.addEventListener("keydown", e => {
    if (e.key === " ") {
        let typedWord = wordInput.value.trim();
        if (!typedWord) return;
        checkWord(typedWord);
        wordInput.value = "";
    }
});

wordInput.addEventListener("focus", () => {
    wordInput.value = "";
});

// =====================================
// BUTTONS
// =====================================

repeatBtn.addEventListener("click", () => {
    index = 0;
    mistakes = 0;
    updateVerseDisplay();
    statusDisplay.textContent = "Repeat verse. Type the first word.";
    wordInput.value = "";
    wordInput.focus();
});

resetBtn.addEventListener("click", () => {
    refInput.value = "";
    verseDisplay.textContent = "";
    statusDisplay.textContent = "";
    wordInput.value = "";
    currentWords = [];
    index = 0;
    mistakes = 0;
});

// =====================================
// ADD VERSE (ONLY TO LIST C)
// =====================================

addUserVerseBtn.addEventListener("click", () => {
    let ref = userRefInput.value.trim();
    let text = userTextInput.value.trim();

    if (!ref || !text) return;

    listC.push({ ref, text });
    localStorage.setItem("mv_custom_list_unified", JSON.stringify(listC));

    userRefInput.value = "";
    userTextInput.value = "";

    if (currentListName === "C") renderUserVerses();
});

// =====================================
// RENDER LIST
// =====================================

function renderUserVerses() {
    userVersesDiv.innerHTML = "";

    currentList.forEach((v, i) => {
        let div = document.createElement("div");
        div.className = "verse-item";

        div.innerHTML = `
            <strong>${v.ref}</strong><br>
            ${v.text}<br>
            <button class="delete-btn" data-index="${i}">Delete</button>
        `;

        userVersesDiv.appendChild(div);
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            let idx = btn.getAttribute("data-index");

            if (currentListName === "A") {
                listA.splice(idx, 1);
                localStorage.setItem("mv_custom_list", JSON.stringify(listA));
            } else if (currentListName === "B") {
                listB.splice(idx, 1);
                localStorage.setItem("userVerses", JSON.stringify(listB));
            } else {
                listC.splice(idx, 1);
                localStorage.setItem("mv_custom_list_unified", JSON.stringify(listC));
            }

            loadSelectedList();
        });
    });
}

// =====================================
// LIST SELECTOR
// =====================================

function loadSelectedList() {
    const sel = listSelector.value;

    if (sel === "A") {
        currentList = listA;
        currentListName = "A";
    } else if (sel === "B") {
        currentList = listB;
        currentListName = "B";
    } else {
        currentList = listC;
        currentListName = "C";
    }

    currentVerseIndex = 0; // reset verse index when switching lists
    renderUserVerses();
}

loadListBtn.addEventListener("click", loadSelectedList);

// Load unified list by default
renderUserVerses();
