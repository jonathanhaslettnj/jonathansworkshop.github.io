// ===============================
// User Verse Memorizer (v2)
// ===============================

// Load user verses from localStorage
let userVerses = JSON.parse(localStorage.getItem("userVerses") || "[]");

// DOM elements
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

// Drill state
let currentWords = [];
let index = 0;
let mistakes = 0;

// ===============================
// Helpers: Safe punctuation filter (Option C)
// ===============================
function normalizeWord(w) {
  return w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "").toLowerCase();
}

// ===============================
// Load Verse
// ===============================
refInput.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === "Tab") {
    e.preventDefault();
    loadVerse(refInput.value.trim());
  }
});

function loadVerse(reference) {
  if (!reference) return;

  let match = userVerses.find(v => v.ref.toLowerCase() === reference.toLowerCase());

  if (!match) {
    verseDisplay.textContent = "Verse not found in your list.";
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
}

// ===============================
// Reveal
// ===============================
function updateVerseDisplay() {
  verseDisplay.textContent = currentWords.slice(0, index).join(" ");
}

// ===============================
// Word Checking
// ===============================
function checkWord(typed) {
  let expectedRaw = currentWords[index] || "";
  let expectedNorm = normalizeWord(expectedRaw);
  let typedNorm = normalizeWord(typed);

  // Skip punctuation-only words
  if (expectedNorm === "") {
    index++;
    updateVerseDisplay();
    return;
  }

  if (typedNorm === expectedNorm) {
    index++;
    updateVerseDisplay();

    if (index >= currentWords.length) {
      statusDisplay.textContent =
        `✔ Verse complete! Mistakes made: ${mistakes === 0 ? "0 (Perfect!)" : mistakes}`;
    } else {
      statusDisplay.textContent = `Correct. Next word: (${index + 1}/${currentWords.length})`;
    }
  } else {
    mistakes++;
    statusDisplay.textContent = `❌ Expected "${expectedRaw}", but you typed "${typed}".`;
  }
}

// ===============================
// iPhone Input Fix
// ===============================
wordInput.addEventListener("keydown", e => {
  if (e.key === " ") {
    let typedWord = wordInput.value.trim();
    if (!typedWord) return;
    checkWord(typedWord);
    wordInput.value = "";
  }
});

wordInput.addEventListener("focus", () => {
  wordInput.value = "";
});

// ===============================
// Buttons
// ===============================
nextBtn.addEventListener("click", () => {
  index = 0;
  mistakes = 0;
  updateVerseDisplay();
  statusDisplay.textContent = "Next verse loaded. Type the first word.";
  wordInput.value = "";
  wordInput.focus();
});

repeatBtn.addEventListener("click", () => {
  index = 0;
  mistakes = 0;
  updateVerseDisplay();
  statusDisplay.textContent = "Repeat verse. Type the first word.";
  wordInput.value = "";
  wordInput.focus();
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

// ===============================
// Add User Verse
// ===============================
addUserVerseBtn.addEventListener("click", () => {
  let ref = userRefInput.value.trim();
  let text = userTextInput.value.trim();

  if (!ref || !text) return;

  userVerses.push({ ref, text });
  localStorage.setItem("userVerses", JSON.stringify(userVerses));

  userRefInput.value = "";
  userTextInput.value = "";

  renderUserVerses();
});

// ===============================
// Render User Verse List
// ===============================
function renderUserVerses() {
  userVersesDiv.innerHTML = "";

  userVerses.forEach((v, i) => {
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
      userVerses.splice(idx, 1);
      localStorage.setItem("userVerses", JSON.stringify(userVerses));
      renderUserVerses();
    });
  });
}

renderUserVerses();

