// =====================================
// memorizer_core.js
// Version 8 — Core Logic (Safe Developer Mode)
// Last updated: 2026-10-08
// =====================================

const DEV_MODE = true;
console.log("Loaded memorizer_core.js — Version 8 (Core Logic)");

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

    if (DEV_MODE) console.log("Loaded verse:", reference);
}

function onCorrectWord(expected) {
    if (DEV_MODE) console.log("Correct word:", expected);
}

function onIncorrectWord(expected, typed) {
    if (DEV_MODE) console.log("Incorrect:", typed, "Expected:", expected);
    speak("Incorrect. Expected " + expected);
}

function onVerseComplete(mistakes) {
    if (mistakes === 0) speak("Perfect recitation. No mistakes.");
    else speak("Verse complete. You made " + mistakes + " mistakes.");

    if (DEV_MODE) console.log("Verse complete. Mistakes:", mistakes);
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

    if (DEV_MODE) console.log("Reset memorizer");
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

    if (DEV_MODE) console.log("Added verse:", ref);
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

            if (DEV_MODE) console.log("Deleted verse at index:", idx);
        });
    });
}

// =====================================
// LIST SELECTOR
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

    if (DEV_MODE) console.log("Loaded list:", currentListName);
}

loadListBtn.addEventListener("click", loadSelectedList);

// Load unified list by default
renderUserVerses();

// =====================================
// INTEGRITY CHECK
// =====================================

if (typeof loadVerse !== "function" ||
    typeof updateVerseDisplay !== "function" ||
    typeof renderUserVerses !== "function") {
    console.error("ERROR: memorizer_core.js is corrupted or incomplete.");
}

// =====================================
// END OF FILE — NOTHING SHOULD BE BELOW THIS LINE
// =====================================
