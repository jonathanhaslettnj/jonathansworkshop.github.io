// reader.js — Reader v2 Clean + Pause + Save Verse

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

function startReading() {
    if (isPaused) {
        // Resume reading the same verse
        isPaused = false;
        isReading = true;
        speak(display.textContent.split(" — ")[1], () => {
            if (!isReading) return;
            currentVerse++;
            readNext();
        });
        return;
    }

    const versionName = document.getElementById("versionSelect").value;
    loadBible(versionName);

    const ref = parseReference(input.value);
    if (!ref) {
        display.textContent = "Invalid reference.";
        return;
    }

    currentBook = ref.book;
    currentChapter = ref.chapter;
    currentVerse = ref.verse;

    isReading = true;
    readNext();
}

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

function readNext() {
    if (!isReading) return;

    const verseText = getVerse(currentBook, currentChapter, currentVerse);

    if (!verseText) {
        display.textContent = "End of chapter or book.";
        isReading = false;
        return;
    }

    display.textContent = `${currentBook} ${currentChapter}:${currentVerse} — ${verseText}`;

    speak(verseText, () => {
        if (!isReading) return;
        currentVerse++;
        readNext();
    });
}

function parseReference(text) {
    const match = text.match(/([1-3]?\s?[A-Za-z]+)\s+(\d+):(\d+)/);
    if (!match) return null;

    return {
        book: match[1],
        chapter: parseInt(match[2]),
        verse: parseInt(match[3])
    };
}

function speak(text, callback) {
    speechSynthesis.cancel();

    setTimeout(() => {
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.0;

        utter.onend = () => {
            callback();
        };

        speechSynthesis.speak(utter);
    }, 250);
}

// ------------------------------------------------------------
// Save current verse to memorizer lists
// ------------------------------------------------------------

function saveCurrentVerse() {
    if (!display.textContent.includes("—")) return;

    const [refPart] = display.textContent.split(" — ");
    const verseRef = refPart.trim(); // e.g., "John 3:16"

    const choice = document.getElementById("listSelect").value;

    if (choice === "1") saveToList("mem_list_1", verseRef);
    else if (choice === "2") saveToList("mem_list_2", verseRef);
    else if (choice === "3") saveToList("mem_list_3", verseRef);
    else if (choice === "all") {
        saveToList("mem_list_1", verseRef);
        saveToList("mem_list_2", verseRef);
        saveToList("mem_list_3", verseRef);
    }

    alert(`Saved to list ${choice}: ${verseRef}`);
}

function saveToList(key, verseRef) {
    let list = JSON.parse(localStorage.getItem(key) || "[]");

    if (!list.includes(verseRef)) {
        list.push(verseRef);
        localStorage.setItem(key, JSON.stringify(list));
    }
}

