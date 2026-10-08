// =====================================
// THREE MEMORY LISTS
// =====================================

let listA = JSON.parse(localStorage.getItem("mv_custom_list") || "[]");
let listB = JSON.parse(localStorage.getItem("userVerses") || "[]");
let listC = JSON.parse(localStorage.getItem("mv_custom_list_unified") || "[]");

let currentList = listC;
let currentListName = "C";
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
// BEEP SOUND
// =====================================

function beep() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = 800;
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
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

    speak(book + " chapter " + chapter + ", verse " + verse);
    speak(text);
}

function onCorrectWord(expected) {}

function onIncorrectWord(expected, typed) {
    speak("Incorrect. Expected " + expected);
}

function onVerseComplete(mistakes) {
    if (mistakes === 0) speak("Perfect recitation. No mistakes.");
    else speak("Verse complete. You made " + mistakes + " mistakes.");
}

// =====================================
// NORMALIZE WORDS
// =====================================

function normalizeWord(w) {
    return w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "").toLowerCase();
}

// =====================================
// SMART ACCEPTANCE (4-letter threshold)
// =====================================

function isAccepted(typed, expectedRaw) {
    let t = normalizeWord(typed);
    let e = normalizeWord(expectedRaw);

    if (!e) return false;

    if (e.length < 4) return t.length >= e.length && t === e;

    if (t.length >= 4) return e.startsWith(t.substring(0, 4));

    return false;
}

// =====================================
// LOAD VERSE
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
// NEXT VERSE
// =====================================

function loadNextVerse() {
    if (currentList.length === 0) {
        statusDisplay.textContent = "No verses in this list.";
        return;
    }

    if (!refInput.value.trim()) currentVerseIndex = 0;
    else {
        currentVerseIndex++;
        if (currentVerseIndex >= currentList.length) currentVerseIndex = 0;
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
// INPUT HANDLING (4-letter threshold)
// =====================================

wordInput.addEventListener("input", () => {
    let typed = wordInput.value.trim();
    if (!typed) return;

    let expectedRaw = currentWords[index] || "";
    if (!expectedRaw) return;

    let expectedNorm = normalizeWord(expectedRaw);
    let typedNorm = normalizeWord(typed);

    if (expectedNorm.length < 30) {
        if (typedNorm.length >= expectedNorm.length) {
            if (typedNorm === expectedNorm) {
                beep();
                checkWord(expectedRaw);
            } else checkWord(typed);
            wordInput.value = "";
        }
    } else {
        if (typedNorm.length >= 30) {
            if (expectedNorm.startsWith(typedNorm.substring(0, 30))) {
                beep();
                checkWord(expectedRaw);
            } else checkWord(typed);
            wordInput.value = "";
        }
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

    let reference = refInput.value.trim();
    if (!reference) return;

    let match = currentList.find(v => v.ref.toLowerCase() === reference.toLowerCase());
    if (match) onLoadVerse(match.text, match.ref);
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

    currentList = listC;
    currentListName = "C";
    currentVerseIndex = 0;

    userRefInput.value = "";
    userTextInput.value = "";

    renderUserVerses();
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
// LIST SELECTOR (FIXED)
// =====================================

function loadSelectedList() {
    listA = JSON.parse(localStorage.getItem("mv_custom_list") || "[]");
    listB = JSON.parse(localStorage.getItem("userVerses") || "[]");
    listC = JSON.parse(localStorage.getItem("mv_custom_list_unified") || "[]");

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

    currentVerseIndex = 0;
    renderUserVerses();
}

loadListBtn.addEventListener("click", loadSelectedList);

// Load unified list by default
renderUserVerses();
