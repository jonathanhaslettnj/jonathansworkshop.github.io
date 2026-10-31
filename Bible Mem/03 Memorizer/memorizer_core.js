// =====================================
// memorizer_core.js
// Version 9 — Core Logic with Voice + Universal Lists
// Last updated: 2026-10-19
// =====================================

const DEV_MODE = true;
console.log("Loaded memorizer_core.js — Version 9 (Core Logic + Voice)");

// =====================================
// THREE MEMORY LISTS (UNIVERSAL)
// =====================================

let listA = JSON.parse(localStorage.getItem("mem_list_1") || "[]");
let listB = JSON.parse(localStorage.getItem("mem_list_2") || "[]");
let listC = JSON.parse(localStorage.getItem("mem_list_3") || "[]");

let currentList = listC;
let currentListName = "C";
let currentVerseIndex = 0;

// =====================================
// DOM ELEMENTS
// =====================================
const toggleVerseBtn =
    document.getElementById("toggleVerseBtn");
const refInput = document.getElementById("refInput");
const verseDisplay = document.getElementById("verseDisplay");
const helpVerseDisplay =
    document.getElementById("helpVerseDisplay");
const statusDisplay = document.getElementById("statusDisplay");
const wordInput = document.getElementById("wordInput");

const nextBtn = document.getElementById("nextBtn");
const playBtn = document.getElementById("playBtn");
const resetBtn = document.getElementById("resetBtn");

const userRefInput = document.getElementById("userRefInput");
const userTextInput = document.getElementById("userTextInput");
const addUserVerseBtn = document.getElementById("addUserVerseBtn");
const userVersesDiv = document.getElementById("user-verses");

const listSelector = document.getElementById("mv_list_selector");

const voiceToggleBtn =
    document.getElementById("voiceToggleBtn");

let currentWords = [];
let index = 0;
let mistakes = 0;
let verseVisible = false;
let currentVerseText = "";
let voiceControlEnabled = false;

// =====================================
// TEXT-TO-SPEECH
// =====================================
// =====================================
// TEXT-TO-SPEECH
// =====================================

let speechVoices = [];

function loadVoices() {
    speechVoices = speechSynthesis.getVoices();
}

loadVoices();

if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

function detectSpanish(text) {
    return (
        /[áéíóúñü¿¡]/i.test(text) ||
        /\b(dios|jesús|jesucristo|señor|porque|amor|vida|verdad|cielo|tierra|gracia|fe|pecado|salvación|mundo|padre|hijo)\b/i.test(text)
    );
}

function findVoice(langPrefix) {
    return speechVoices.find(v =>
        v.lang &&
        v.lang.toLowerCase().startsWith(langPrefix.toLowerCase())
    );
}

function speak(text) {
    if (!text) return;

    const u = new SpeechSynthesisUtterance(text);

    u.rate = 1.0;
    u.pitch = 1.0;

    if (detectSpanish(text)) {
        u.lang = "es-ES";

        const spanishVoice =
            findVoice("es") ||
            findVoice("es-es") ||
            findVoice("es-mx");

        if (spanishVoice) {
            u.voice = spanishVoice;
        }

        if (DEV_MODE) {
            console.log("Spanish voice:", spanishVoice ? spanishVoice.name : "none found");
        }
    } else {
        u.lang = "en-US";

        const englishVoice = findVoice("en");

        if (englishVoice) {
            u.voice = englishVoice;
        }

        if (DEV_MODE) {
            console.log("English voice:", englishVoice ? englishVoice.name : "none found");
        }
    }

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

    if (detectSpanish(text)) {

        // Spanish reference announcement
        speak(book + " capítulo " + chapter + ", versículo " + verse);

    } else {

        // English reference announcement
        speak(book + " chapter " + chapter + ", verse " + verse);

    }

    speak(text);

    if (DEV_MODE) {
        console.log("Loaded verse:", reference);
    }
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

    let match = currentList.find(
        v => v.ref.toLowerCase() === reference.toLowerCase()
    );

    if (!match) {
        verseDisplay.textContent =
            "Verse not found in selected list.";
        currentWords = [];
        index = 0;
        mistakes = 0;
        return;
    }

    currentWords = match.text.split(/\s+/);
currentVerseText = match.text;
    index = 0;
    mistakes = 0;

verseDisplay.textContent = "";
verseVisible = false;
toggleVerseBtn.textContent =
    "👁 Show Verse";
helpVerseDisplay.textContent = "";

    statusDisplay.textContent =
        "Listen to the verse, then begin typing.";

    wordInput.value = "";
    wordInput.focus();

    onLoadVerse(match.text, match.ref);
}


toggleVerseBtn.addEventListener("click", () => {

    if (!currentVerseText) return;

    if (!verseVisible) {

        helpVerseDisplay.textContent =
            currentVerseText;

        verseVisible = true;

        toggleVerseBtn.textContent =
            "🙈 Hide Verse";

    } else {

        helpVerseDisplay.textContent = "";

        verseVisible = false;

        toggleVerseBtn.textContent =
            "👁 Show Verse";

    }

});

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

    verseDisplay.textContent =
        currentWords.slice(0, index).join(" ");
}

// =====================================
// BUTTONS
// =====================================

playBtn.addEventListener("click", () => {
    index = 0;
    mistakes = 0;
    updateVerseDisplay();
    statusDisplay.textContent = "Play verse. Type the first word.";
    wordInput.value = "";
    wordInput.focus();

let reference = refInput.value.trim();

if (!reference) {

    if (currentList.length === 0) {
        statusDisplay.textContent =
            "No verses in this list.";
        return;
    }

    currentVerseIndex = 0;

    reference = currentList[0].ref;

    refInput.value = reference;
}

    let match = currentList.find(v => v.ref.toLowerCase() === reference.toLowerCase());
console.log("MATCH OBJECT =", match);
console.log("MATCH TEXT =", match.text);
    if (match) onLoadVerse(match.text, match.ref);
});

resetBtn.addEventListener("click", () => {

    if (currentList.length === 0) {
        statusDisplay.textContent =
            "No verses in this list.";
        return;
    }

    currentVerseIndex = 0;

    const firstVerse =
        currentList[0].ref;

    refInput.value = firstVerse;

    loadVerse(firstVerse);

    statusDisplay.textContent =
        "Restarted at beginning of list.";

    if (DEV_MODE) {
        console.log("Restarted list.");
    }
});
// =====================================
// ADD VERSE (TO CURRENT LIST)
// =====================================

addUserVerseBtn.addEventListener("click", () => {
    let ref = userRefInput.value.trim();
    let text = userTextInput.value.trim();

    if (!ref || !text) return;

    if (currentListName === "A") {
        listA.push({ ref, text });
        localStorage.setItem("mem_list_1", JSON.stringify(listA));
        currentList = listA;
    } else if (currentListName === "B") {
        listB.push({ ref, text });
        localStorage.setItem("mem_list_2", JSON.stringify(listB));
        currentList = listB;
    } else {
        listC.push({ ref, text });
        localStorage.setItem("mem_list_3", JSON.stringify(listC));
        currentList = listC;
    }

    currentVerseIndex = 0;

    userRefInput.value = "";
    userTextInput.value = "";

    renderUserVerses();

    if (DEV_MODE) console.log("Added verse:", ref, "to list", currentListName);
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
                localStorage.setItem("mem_list_1", JSON.stringify(listA));
                currentList = listA;
            } else if (currentListName === "B") {
                listB.splice(idx, 1);
                localStorage.setItem("mem_list_2", JSON.stringify(listB));
                currentList = listB;
            } else {
                listC.splice(idx, 1);
                localStorage.setItem("mem_list_3", JSON.stringify(listC));
                currentList = listC;
            }

            loadSelectedList();

            if (DEV_MODE) console.log("Deleted verse at index:", idx, "from list", currentListName);

if (currentList.length > 0) {
    refInput.value = currentList[0].ref;
}

        });
    });
}

// =====================================
// LIST SELECTOR
// =====================================

function loadSelectedList() {
    listA = JSON.parse(localStorage.getItem("mem_list_1") || "[]");
    listB = JSON.parse(localStorage.getItem("mem_list_2") || "[]");
    listC = JSON.parse(localStorage.getItem("mem_list_3") || "[]");

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

listSelector.addEventListener(
    "change",
    loadSelectedList
);

// Load list C by default
loadSelectedList();
updateVoiceButton();

// =====================================
// VOICE COMMANDS
// =====================================

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognizer = null;

if (window.SpeechRecognition) {
    recognizer = new SpeechRecognition();
    recognizer.continuous = true;
    recognizer.interimResults = false;
    recognizer.lang = "en-US";

    recognizer.onresult = (event) => {
        let transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();

        if (DEV_MODE) console.log("Voice command:", transcript);

        if (transcript.includes("next")) loadNextVerse();
else if (transcript.includes("repeat")) playBtn.click();
else if (transcript.includes("play")) playBtn.click();
        else if (transcript.includes("start over")) resetBtn.click();
        else if (transcript.includes("load list a")) {
            listSelector.value = "A";
            loadSelectedList();
        }
        else if (transcript.includes("load list b")) {
            listSelector.value = "B";
            loadSelectedList();
        }
        else if (transcript.includes("load list c")) {
            listSelector.value = "C";
            loadSelectedList();
        }
        else if (transcript.includes("read verse")) {
            loadVerse(refInput.value.trim());
        }
        else if (transcript.includes("stop")) {
            speechSynthesis.cancel();
        }
    };


    recognizer.onerror = (event) => {
        if (DEV_MODE) console.log("Voice error:", event.error);
    };
} else {
    console.warn("SpeechRecognition not supported in this browser.");
}

function updateVoiceButton() {

    if (!voiceToggleBtn) return;

    if (voiceControlEnabled) {

        voiceToggleBtn.textContent =
            "🟢 Voice Control ON";

    } else {

        voiceToggleBtn.textContent =
            "🔴 Voice Control OFF";
    }
}




function startVoiceControl() {
    if (!recognizer) {
        statusDisplay.textContent = "Voice control not supported in this browser.";
        return;
    }
    recognizer.start();
   
statusDisplay.textContent =
"Voice control ON.";



    if (DEV_MODE) console.log("Voice control started.");
}

function stopVoiceControl() {
    if (!recognizer) return;
    recognizer.stop();


statusDisplay.textContent =
"Voice control OFF.";



    if (DEV_MODE) console.log("Voice control stopped.");
}


voiceToggleBtn.addEventListener(
    "click",
    () => {

        if (!voiceControlEnabled) {

            startVoiceControl();
            voiceControlEnabled = true;

        } else {

            stopVoiceControl();
            voiceControlEnabled = false;
        }

        updateVoiceButton();
    }
);




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