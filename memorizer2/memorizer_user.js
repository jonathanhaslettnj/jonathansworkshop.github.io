// --- State ---
let currentRef = "";
let currentText = "";
let currentWords = [];
let currentIndex = 0;

// user list: [{ ref, text }]
let customList = JSON.parse(localStorage.getItem("mv_custom_list") || "[]");
let customIndex = 0;

// --- DOM ---
const refInput        = document.getElementById("refInput");
const verseDisplay    = document.getElementById("verseDisplay");
const statusDisplay   = document.getElementById("statusDisplay");
const wordInput       = document.getElementById("wordInput");
const nextBtn         = document.getElementById("nextBtn");
const repeatBtn       = document.getElementById("repeatBtn");
const resetBtn        = document.getElementById("resetBtn");
const userRefInput    = document.getElementById("userRefInput");
const userTextInput   = document.getElementById("userTextInput");
const addUserVerseBtn = document.getElementById("addUserVerseBtn");
const userVersesDiv   = document.getElementById("user-verses");

// --- Helpers ---
function clearMemorizer() {
  currentRef = "";
  currentText = "";
  currentWords = [];
  currentIndex = 0;
  refInput.value = "";
  wordInput.value = "";
  verseDisplay.textContent = "";
  statusDisplay.textContent = "";
}

function renderUserList() {
  if (!customList.length) {
    userVersesDiv.textContent = "No verses in your list yet.";
    return;
  }
  userVersesDiv.textContent = customList
    .map(v => `${v.ref} — ${v.text}`)
    .join("\n");
}

function findUserVerse(ref) {
  return customList.find(v => v.ref.trim().toLowerCase() === ref.trim().toLowerCase()) || null;
}

function loadVerseFromRef(ref) {
  if (!ref.trim()) {
    statusDisplay.textContent = "Please type a reference.";
    return;
  }

  const v = findUserVerse(ref);
  if (!v) {
    statusDisplay.textContent = "Verse not found in your list.";
    return;
  }

  currentRef = ref;
  currentText = v.text;
  currentWords = currentText.split(/\s+/);
  currentIndex = 0;

  verseDisplay.textContent = currentText;
  statusDisplay.textContent = "Start typing the verse, word by word.";
  wordInput.value = "";
  wordInput.focus();
}

function loadNextVerse() {
  if (!customList.length) {
    statusDisplay.textContent = "Your list is empty.";
    return;
  }
  customIndex = (customIndex + 1) % customList.length;
  const v = customList[customIndex];

  currentRef = v.ref;
  currentText = v.text;
  currentWords = currentText.split(/\s+/);
  currentIndex = 0;

  refInput.value = currentRef;
  verseDisplay.textContent = currentText;
  statusDisplay.textContent = "Next verse from your list.";
  wordInput.value = "";
  wordInput.focus();
}

function repeatCurrentVerse() {
  if (!currentText) {
    statusDisplay.textContent = "No verse loaded.";
    return;
  }
  currentWords = currentText.split(/\s+/);
  currentIndex = 0;
  verseDisplay.textContent = currentText;
  statusDisplay.textContent = "Repeating current verse.";
  wordInput.value = "";
  wordInput.focus();
}

// --- Events ---
refInput.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.keyCode === 13) {
    e.preventDefault();
    loadVerseFromRef(refInput.value);
  }
});

wordInput.addEventListener("keydown", e => {
  if (e.key === " ") {
    e.preventDefault();
    const typed = wordInput.value.trim();
    const expected = currentWords[currentIndex] || "";
    if (!typed) return;

    if (typed.toLowerCase() === expected.toLowerCase()) {
      currentIndex++;
      statusDisplay.textContent = `Correct: "${typed}"`;
      if (currentIndex >= currentWords.length) {
        statusDisplay.textContent = "Verse complete!";
      }
    } else {
      statusDisplay.textContent = `Expected "${expected}", but you typed "${typed}".`;
    }
    wordInput.value = "";
  }
});

nextBtn.addEventListener("click", loadNextVerse);
repeatBtn.addEventListener("click", repeatCurrentVerse);
resetBtn.addEventListener("click", clearMemorizer);

addUserVerseBtn.addEventListener("click", () => {
  const ref = userRefInput.value.trim();
  const text = userTextInput.value.trim();
  if (!ref || !text) {
    statusDisplay.textContent = "Please enter both reference and verse text.";
    return;
  }
  customList.push({ ref, text });
  localStorage.setItem("mv_custom_list", JSON.stringify(customList));
  userRefInput.value = "";
  userTextInput.value = "";
  renderUserList();
  statusDisplay.textContent = "Verse added to your list.";
});

// --- Init ---
renderUserList();
clearMemorizer();
