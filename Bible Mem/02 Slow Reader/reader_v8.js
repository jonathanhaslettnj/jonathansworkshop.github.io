let isReading = false;
let isPaused = false;

let currentBook = "";
let currentChapter = 0;
let currentVerse = 0;

let currentWords = [];
let currentWordIndex = 0;

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
        readNextWord();
        return;
    }

    const versionName = document.getElementById("versionSelect").value;

    await loadBible(versionName);

    if (!bibleLoaded) {
        display.textContent = "Bible files are still loading...";
        return;
    }

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

    display.textContent = "";

    currentWords = [];
    currentWordIndex = 0;
}

// ------------------------------------------------------------
// Load verse and split into words
// ------------------------------------------------------------
function readNextVerse() {

    if (!isReading) return;

    const verseText = getVerse(
        currentBook,
        currentChapter,
        currentVerse
    );

    if (!verseText) {
        display.textContent = "End of chapter or book.";
        isReading = false;
        return;
    }

    input.value = `${currentBook} ${currentChapter}:${currentVerse}`;

    currentWords = verseText.split(/\s+/);

    currentWordIndex = 0;

    readNextWord();
}

// ------------------------------------------------------------
// Display and speak ONE word at a time
// ------------------------------------------------------------
function readNextWord() {

    if (!isReading) return;

    if (currentWordIndex >= currentWords.length) {

        currentVerse++;

        setTimeout(() => {

            if (isReading) {
                readNextVerse();
            }

        }, 1000);

        return;
    }

    const word = currentWords[currentWordIndex];

    display.textContent = word;

    speakWord(word, () => {

        setTimeout(() => {

            if (!isReading) return;

            currentWordIndex++;

            readNextWord();

        }, 750);   // pause between words

    });
}

// ------------------------------------------------------------
// Speak the current word
// ------------------------------------------------------------
function speakWord(text, callback) {

    const utter = new SpeechSynthesisUtterance(text);

    utter.rate = 0.8;
    utter.pitch = 1.0;
    utter.volume = 1.0;

    utter.onend = () => callback();

    speechSynthesis.speak(utter);
}

// ------------------------------------------------------------
// Parse reference
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

    const verseText =
        getVerse(currentBook, currentChapter, currentVerse);

    if (!verseText) return;

    const verseRef =
        `${currentBook} ${currentChapter}:${currentVerse}`;

    const choice =
        document.getElementById("listSelect").value;

    const verseObj = {
        ref: verseRef,
        text: verseText
    };

    if (choice === "1")
        saveToList("mem_list_1", verseObj);

    else if (choice === "2")
        saveToList("mem_list_2", verseObj);

    else if (choice === "3")
        saveToList("mem_list_3", verseObj);

    else {
        saveToList("mem_list_1", verseObj);
        saveToList("mem_list_2", verseObj);
        saveToList("mem_list_3", verseObj);
    }

    alert(`Saved to list ${choice}: ${verseRef}`);
}

function saveToList(key, verseObj) {

    let list =
        JSON.parse(localStorage.getItem(key) || "[]");

    if (!list.some(v => v.ref === verseObj.ref)) {

        list.push(verseObj);

        localStorage.setItem(
            key,
            JSON.stringify(list)
        );
    }
}