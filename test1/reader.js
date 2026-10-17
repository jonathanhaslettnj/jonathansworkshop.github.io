let isReading = false;
let currentBook = "";
let currentChapter = 0;
let currentVerse = 0;

const display = document.getElementById("currentVerseDisplay");
const input = document.getElementById("referenceInput");

document.getElementById("startBtn").onclick = startReading;
document.getElementById("stopBtn").onclick = stopReading;

function startReading() {
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

function stopReading() {
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

    const words = verseText.split(" ");
    displayWords(words);

    speakWordByWord(words, 0, () => {
        if (!isReading) return;
        currentVerse++;
        readNext();
    });
}

function displayWords(words) {
    display.innerHTML = words
        .map((w, i) => `<span class="word" id="w${i}">${w}</span>`)
        .join(" ");
}

function speakWordByWord(words, index, doneCallback) {
    if (index >= words.length) {
        doneCallback();
        return;
    }

    const prev = document.querySelector(".highlight");
    if (prev) prev.classList.remove("highlight");

    const current = document.getElementById(`w${index}`);
    current.classList.add("highlight");

    speak(words[index], () => {
        if (!isReading) return;
        speakWordByWord(words, index + 1, doneCallback);
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
        utter.onend = callback;
        speechSynthesis.speak(utter);
    }, 250);
}
