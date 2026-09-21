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

// ===============================
// Load Verse from Reference
// ===============================
refInput.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === "Tab") {
    e.preventDefault();
    loadVerse(refInput.value.trim());
  }
});

function loadVerse(reference) {
  if (!reference) return;

  // Look for verse in user list first
  let match = userVerses.find(v => v.ref.toLowerCase() === reference.toLowerCase());

  if (!match) {
    verseDisplay.textContent = "Verse not found in your list.";
    currentWords = [];
    index = 0;
    return;
  }

  verseDisplay.textContent = match.text;
  currentWords = match.text.split(/\s+/);
  index = 0;

  statusDisplay.textContent = "Begin typing the first word.";
  wordInput.value = "";
  wordInput.focus();
}

// ===============================
// Word Checking Logic
// ===============================
function checkWord(typed) {
  let expected = currentWords[index] || "";

  if (typed.toLowerCase() === expected.toLowerCase()) {
    index++;

    if (index >= currentWords.length) {
      statusDisplay.textContent = "✔ Verse complete!";
    } else {
      statusDisplay.textContent = `Correct. Next word: (${index + 1}/${currentWords.length})`;
    }
  } else {
    statusDisplay.textContent = `❌ Expected "${expected}", but you typed "${typed}".`;
  }
}

// ===============================
// iPhone-Safe Input Handling
// ===============================

// Prevent Safari phantom submissions
wordInput.addEventListener("keydown", e => {
  if (e.key === " ") {
    let typedWord = wordInput.value.trim();

    // Prevent empty-word submissions (Safari quirk)
    if (!typedWord) return;

    checkWord(typedWord);
    wordInput.value = "";
  }
});

// Prevent Safari from submitting an empty word when tapping the box
wordInput.addEventListener("focus", () => {
  wordInput.value = "";
});

// ===============================
// Buttons
// ===============================
nextBtn.addEventListener("click", () => {
  index = 0;
  statusDisplay.textContent = "Next verse loaded. Type the first word.";
  wordInput.value = "";
  wordInput.focus();
});

repeatBtn.addEventListener("click", () => {
  index = 0;
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

  // Attach delete handlers
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      let idx = btn.getAttribute("data-index");
      userVerses.splice(idx, 1);
      localStorage.setItem("userVerses", JSON.stringify(userVerses));
      renderUserVerses();
    });
  });
}

// Initial render
renderUserVerses();
