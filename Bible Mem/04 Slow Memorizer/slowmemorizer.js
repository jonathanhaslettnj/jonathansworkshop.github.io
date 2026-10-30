

console.log("Slow Memorizer Single Verse Mode");

let speechVoices = [];

let currentList = [];
let currentListIndex = 0;

let currentWords = [];
let currentWordIndex = 0;

let isReading = false;

let wordPause = 3000;

let isPaused = false;
let pendingTimeout = null;


const display =
    document.getElementById(
        "currentVerseDisplay"
    );

const verseReferenceDisplay =
    document.getElementById(
        "verseReferenceDisplay"
    );

const fullVerseDisplay =
    document.getElementById(
        "fullVerseDisplay"
    );

const speedSlider =
    document.getElementById(
        "speedSlider"
    );

const speedLabel =
    document.getElementById(
        "speedLabel"
    );

function loadVoices() {
    speechVoices =
        speechSynthesis.getVoices();
}

loadVoices();

speechSynthesis.onvoiceschanged =
    loadVoices;

function detectSpanish(text) {

    return (
        /[áéíóúñü¿¡]/i.test(text) ||
        /\b(dios|jesús|señor|porque|vida|amor|salvación)\b/i.test(text)
    );

}

function findVoice(prefix) {

    return speechVoices.find(
        voice =>
            voice.lang &&
            voice.lang
                .toLowerCase()
                .startsWith(prefix)
    );

}

function getCurrentListKey() {

    return (
        "mem_list_" +
        document.getElementById(
            "listSelect"
        ).value
    );

}

function loadCurrentList() {

    currentList =
        JSON.parse(
            localStorage.getItem(
                getCurrentListKey()
            ) || "[]"
        );

    renderVerseList();

    if (currentList.length > 0) {

        currentListIndex = 0;

        loadSelectedVerse();

    } else {

        display.textContent =
            "No Verses";

        verseReferenceDisplay.textContent =
            "";

        fullVerseDisplay.innerHTML =
            "";

    }

}

function loadSelectedVerse() {

    if (currentList.length === 0) {
        return;
    }

    const verse =
        currentList[currentListIndex];

    if (!verse) {
        return;
    }

    currentWords =
        verse.text.split(/\s+/);

    currentWordIndex = 0;

    verseReferenceDisplay.textContent =
        verse.ref || "";

    display.textContent =
        currentWords[0] || "";

    updateFullVerseDisplay();

}

function updateFullVerseDisplay() {

    fullVerseDisplay.innerHTML =
        currentWords
            .map(
                (word, index) => {

                    if (
                        index ===
                        currentWordIndex
                    ) {

                        return `
                        <span class="currentWord">
                            ${word}
                        </span>
                        `;

                    }

                    return word;

                }
            )
            .join(" ");

}

function renderVerseList() {

    const container =
        document.getElementById(
            "savedVerses"
        );

    container.innerHTML = "";

    currentList.forEach(
        (verse, index) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "verseCard";

            card.innerHTML = `
                <div class="verseRef">
                    ${verse.ref}
                </div>

                <div class="verseText">
                    ${verse.text}
                </div>

<div class="cardButtons">
    <button
        onclick="deleteVerse(${index})">
        Delete
    </button>
</div>
            `;

            container.appendChild(
                card
            );

        }
    );

}

function selectVerse(index) {

    stopReading();

    currentListIndex = index;

    loadSelectedVerse();

}

function deleteVerse(index) {

    currentList.splice(index, 1);

    localStorage.setItem(
        getCurrentListKey(),
        JSON.stringify(
            currentList
        )
    );

    if (
        currentListIndex >=
        currentList.length
    ) {

        currentListIndex =
            Math.max(
                0,
                currentList.length - 1
            );

    }

    renderVerseList();

    if (
        currentList.length > 0
    ) {

        loadSelectedVerse();

    } else {

        display.textContent =
            "No Verses";

        verseReferenceDisplay.textContent =
            "";

        fullVerseDisplay.innerHTML =
            "";

    }

}

function startCurrentVerse() {

    if (
        currentList.length === 0
    ) {
        return;
    }

    speechSynthesis.cancel();

    if (!isPaused) {
        currentWordIndex = 0;
    }

    isPaused = false;
    isReading = true;

    updateFullVerseDisplay();

    readNextWord();
}

function readNextWord() {

    console.log(
        "Verse:",
        currentListIndex,
        "Word:",
        currentWordIndex,
        "of",
        currentWords.length
    );

    if (!isReading) {
        return;
    }

if (
    currentWordIndex >=
    currentWords.length
) {

    currentListIndex++;

    if (
        currentListIndex >=
        currentList.length
    ) {
        currentListIndex = 0;
    }

    loadSelectedVerse();

pendingTimeout =
    setTimeout(
        () => {

            pendingTimeout =
                null;

            if (isReading) {
                readNextWord();
            }

        },
        wordPause
    );

    return;
}

    const word =
        currentWords[
            currentWordIndex
        ];

    display.textContent =
        word;

    updateFullVerseDisplay();

    const fullText =
        currentWords.join(" ");

    const utter =
        new SpeechSynthesisUtterance(
            word
        );

    utter.rate = 0.7;

    if (
        detectSpanish(
            fullText
        )
    ) {

        utter.lang =
            "es-ES";

        const voice =
            findVoice("es");

        if (voice) {
            utter.voice =
                voice;
        }

    } else {

        utter.lang =
            "en-US";

        const voice =
            findVoice("en");

        if (voice) {
            utter.voice =
                voice;
        }

    }

  utter.onend = () => {

    pendingTimeout =
        setTimeout(
            () => {

                pendingTimeout =
                    null;

                if (!isReading) {
                    return;
                }

                currentWordIndex++;

                readNextWord();

            },
            wordPause
        );

};

speechSynthesis.speak(
    utter
);
}

function pauseReading() {

    isPaused = true;
    isReading = false;

    speechSynthesis.cancel();

    if (pendingTimeout) {
        clearTimeout(
            pendingTimeout
        );
        pendingTimeout = null;
    }
}
function stopReading() {

    isReading = false;
    isPaused = false;

    speechSynthesis.cancel();

    if (pendingTimeout) {
        clearTimeout(
            pendingTimeout
        );
        pendingTimeout = null;
    }

    currentWordIndex = 0;

    display.textContent =
        currentWords[0] || "";

    updateFullVerseDisplay();
}

function previousVerse() {

    if (
        currentList.length === 0
    ) {
        return;
    }

    currentListIndex--;

    if (
        currentListIndex < 0
    ) {
        currentListIndex =
            currentList.length - 1;
    }

    stopReading();
    loadSelectedVerse();
}

function nextVerse() {

    if (
        currentList.length === 0
    ) {
        return;
    }

    currentListIndex++;

   if (
        currentListIndex >=
        currentList.length
    ) {
        currentListIndex = 0;
    }

    stopReading();
    loadSelectedVerse();
}

speedSlider.addEventListener(
    "input",
    () => {

        wordPause =
            parseInt(
                speedSlider.value
            );

        speedLabel.textContent =
            wordPause;

    }
);

document
    .getElementById(
        "playBtn"
    )
    .addEventListener(
        "click",
        startCurrentVerse
    );

document
    .getElementById(
        "pauseBtn"
    )
    .addEventListener(
        "click",
        pauseReading
    );

document
    .getElementById(
        "stopBtn"
    )
    .addEventListener(
        "click",
        stopReading
    );

document
    .getElementById(
        "prevBtn"
    )
    .addEventListener(
        "click",
        previousVerse
    );

document
    .getElementById(
        "nextBtn"
    )
    .addEventListener(
        "click",
        nextVerse
    );

document
    .getElementById(
        "listSelect"
    )
    .addEventListener(
        "change",
        loadCurrentList
    );

loadCurrentList();