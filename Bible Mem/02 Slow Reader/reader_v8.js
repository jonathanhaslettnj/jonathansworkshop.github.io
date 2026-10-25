
let isReading = false;
let isPaused = false;

let currentBook = "";
let currentChapter = 0;
let currentVerse = 0;


const display = document.getElementById("currentVerseDisplay");
const input = document.getElementById("referenceInput");

document.getElementById("startBtn").onclick = startReading;
document.getElementById("pauseBtn").onclick = pauseReading;
document.getElementById("stopBtn").onclick = stopReading;
document.getElementById("saveBtn").onclick = saveCurrentVerse;

// ------------------------------------------------------------
// Start Reading
// ------------------------------------------------------------

async function startReading() {

if (isPaused) {
    isPaused = false;
    isReading = true;
    readNextVerse();   // ✔ Resume reading the current verse smoothly
    return;
}


    // Load the selected Bible version FIRST
    const versionName = document.getElementById("versionSelect").value;
    await loadBible(versionName);

    // NOW check if the Bible finished loading
    if (!bibleLoaded) {
        display.textContent = "Bible files are still loading...";
        return;
    }

    // Parse reference
    const ref = parseReference(input.value);
    if (!ref) {
        display.textContent = "Invalid reference.";
        return;
    }

    currentBook = ref.book;
    currentChapter = ref.chapter;
    currentVerse = ref.verse;

    isReading = true;
    readNextVerse();
}


// ------------------------------------------------------------
// Pause / Stop
// ------------------------------------------------------------
function pauseReading() {
    isPaused = true;
    isReading = false;
    speechSynthesis.cancel();
}

function stopReading() {
    isPaused = false;
    isReading = false;
    speechSynthesis.cancel();
}

// ------------------------------------------------------------
// Read next verse
// ------------------------------------------------------------

function readNextVerse() {
    if (!isReading) return;

    const verseText = getVerse(currentBook, currentChapter, currentVerse);

    if (!verseText) {
        display.textContent = "End of chapter or book.";
        isReading = false;
        return;
    }

    // ⭐ Update input box with current reference
    input.value = `${currentBook} ${currentChapter}:${currentVerse}`;

    // Display full verse (no reference here, because Option A puts it in the input box)
    display.textContent = verseText;

    // Speak entire verse smoothly
    speakVerse(verseText, () => {
        if (!isReading) return;
        currentVerse++;
        readNextVerse();
    });
}


function speakVerse(text, callback) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.1;   // Smooth and natural speed
    utter.onend = () => callback();
    speechSynthesis.speak(utter);
}


// ------------------------------------------------------------
// Parse reference (John 3:16)
// ------------------------------------------------------------
function parseReference(text) {
    const match = text.match(/([1-3]?\s?[A-Za-z]+)\s+(\d+):(\d+)/);
    if (!match) return null;

    return {
        book: match[1],
        chapter: parseInt(match[2]),
        verse: parseInt(match[3])
    };
}

// ------------------------------------------------------------
// Save current verse
// ------------------------------------------------------------
function saveCurrentVerse() {
    const verseText = getVerse(currentBook, currentChapter, currentVerse);
    if (!verseText) return;

    const verseRef = `${currentBook} ${currentChapter}:${currentVerse}`;
    const choice = document.getElementById("listSelect").value;

    const verseObj = { ref: verseRef, text: verseText };

    if (choice === "1") saveToList("mem_list_1", verseObj);
    else if (choice === "2") saveToList("mem_list_2", verseObj);
    else if (choice === "3") saveToList("mem_list_3", verseObj);
    else {
        saveToList("mem_list_1", verseObj);
        saveToList("mem_list_2", verseObj);
        saveToList("mem_list_3", verseObj);
    }

    alert(`Saved to list ${choice}: ${verseRef}`);
}

function saveToList(key, verseObj) {
    let list = JSON.parse(localStorage.getItem(key) || "[]");

    if (!list.some(v => v.ref === verseObj.ref)) {
        list.push(verseObj);
        localStorage.setItem(key, JSON.stringify(list));
    }
}
