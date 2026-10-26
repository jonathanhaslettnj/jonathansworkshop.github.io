
let isReading = false;
let isPaused = false;
let currentBook = "";
let currentChapter = 0;
let currentVerse = 0;

const display = document.getElementById("currentVerseDisplay");
const input = document.getElementById("referenceInput");

async function initializeBible() {
    const versionName =
        document.getElementById("versionSelect").value;

    await loadBible(versionName);

    if (bibleLoaded) {
        populateBooks();
    }
}

function populateBooks() {

    const select =
        document.getElementById("bookSelect");

    select.innerHTML = "";

    Object.keys(Bible).forEach(book => {

        const option =
            document.createElement("option");

        option.value = book;
        option.textContent = book;

        select.appendChild(option);

    });
}

function goToSelectedVerse() {

    console.log("GO clicked");

    const book =
        document.getElementById("bookSelect").value;

    const chapter =
        document.getElementById("chapterInput").value;

    const verse =
        document.getElementById("verseInput").value;

    console.log(book, chapter, verse);

    const verseText =
        getVerse(book, chapter, verse);

    console.log("Verse:", verseText);

    if (!verseText) {
        display.textContent = "Verse not found";
        return;
    }

    currentBook = book;
    currentChapter = parseInt(chapter);
    currentVerse = parseInt(verse);

    input.value =
        `${book} ${chapter}:${verse}`;

    display.textContent = verseText;
}

document.getElementById("startBtn").onclick = startReading;
document.getElementById("pauseBtn").onclick = pauseReading;
document.getElementById("stopBtn").onclick = stopReading;
document.getElementById("saveBtn").onclick = saveCurrentVerse;
document.getElementById("goToVerseBtn").onclick =
    goToSelectedVerse;

// ------------------------------------------------------------
// Start Reading
// ------------------------------------------------------------

async function startReading() {

    if (isPaused) {

        isPaused = false;
        isReading = true;

        readNextVerse();

        return;
    }

    const versionName =
        document.getElementById("versionSelect").value;

    await loadBible(versionName);

    if (!bibleLoaded) {

        display.textContent =
            "Bible files are still loading...";

        return;
    }

    const ref =
        parseReference(input.value);

    if (!ref) {

        display.textContent =
            "Invalid reference.";

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

    const verseText =
        getVerse(
            currentBook,
            currentChapter,
            currentVerse
        );

    if (!verseText) {

        display.textContent =
            "End of chapter or book.";

        isReading = false;

        return;
    }

    input.value =
        `${currentBook} ${currentChapter}:${currentVerse}`;

    document.getElementById("bookSelect").value =
        currentBook;

    document.getElementById("chapterInput").value =
        currentChapter;

    document.getElementById("verseInput").value =
        currentVerse;

    display.textContent = verseText;

    speakVerse(verseText, () => {

        if (!isReading) return;

        currentVerse++;

        readNextVerse();

    });
}

// ------------------------------------------------------------
// Speech
// ------------------------------------------------------------

function speakVerse(text, callback) {

    const utter =
        new SpeechSynthesisUtterance(text);

    const version =
        document.getElementById("versionSelect").value;

    if (version === "srv") {
        utter.lang = "es-ES";
    } else {
        utter.lang = "en-US";
    }

    utter.rate = 1.1;

    utter.onend = () => callback();

    speechSynthesis.speak(utter);
}

// ------------------------------------------------------------
// Parse reference
// ------------------------------------------------------------

function parseReference(text) {

    const match =
        text.match(
            /([1-3]?\s?[A-Za-zÀ-ÿ]+)\s+(\d+):(\d+)/
        );

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
        getVerse(
            currentBook,
            currentChapter,
            currentVerse
        );

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

    alert(
        `Saved to list ${choice}: ${verseRef}`
    );
}

function saveToList(key, verseObj) {

    let list =
        JSON.parse(
            localStorage.getItem(key) || "[]"
        );

    if (!list.some(v => v.ref === verseObj.ref)) {

        list.push(verseObj);

        localStorage.setItem(
            key,
            JSON.stringify(list)
        );
    }
}

// ------------------------------------------------------------
// Version changed
// ------------------------------------------------------------

document.getElementById("versionSelect")
    .addEventListener("change", async () => {

        const version =
            document.getElementById("versionSelect").value;

        await loadBible(version);

        if (bibleLoaded) {

            populateBooks();

            document.getElementById("chapterInput").value = 1;
            document.getElementById("verseInput").value = 1;

            display.textContent = "";
        }
    });

// ------------------------------------------------------------
// Startup
// ------------------------------------------------------------

window.addEventListener("load", () => {
    initializeBible();
});
