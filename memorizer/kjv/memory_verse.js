// ------------------------------------------------------------
// USER-CREATED VERSE LIST SYSTEM
// ------------------------------------------------------------

let currentList = null;
let currentIndex = 0;

// Load list from localStorage or create empty
let customList = JSON.parse(localStorage.getItem("mv_custom_list") || "[]");

// Add a verse to the user's list
function addCustomVerse() {
    const ref = document.getElementById("mv_custom_verse").value.trim();
    if (!ref) return;

    customList.push(ref);
    localStorage.setItem("mv_custom_list", JSON.stringify(customList));

    document.getElementById("mv_custom_verse").value = "";
    updateCustomListDisplay();
}

// Show the user's list on the page
function updateCustomListDisplay() {
    if (customList.length === 0) {
        document.getElementById("mv_custom_list_display").innerText = "(No verses added yet)";
        return;
    }

    document.getElementById("mv_custom_list_display").innerText =
        "Your verses: " + customList.join(", ");
}

// Switch memorizer to use the user's list
function useCustomList() {
    if (customList.length === 0) {
        alert("Your list is empty.");
        return;
    }

    currentList = customList.slice(); // copy
    currentIndex = 0;

    loadReference(currentList[currentIndex]);
}

// Call this once on page load
updateCustomListDisplay();


// ------------------------------------------------------------
// Load KJV JSON
// ------------------------------------------------------------
let kjv = {};
let kjvReady = false;

fetch("kjv.json")
    .then(r => {
        console.log("Fetch status:", r.status);
        return r.json();
    })
    .then(data => {
        kjv = data;
        kjvReady = true;
        console.log("KJV JSON loaded. kjvReady =", kjvReady);
    })
    .catch(err => {
        console.error("JSON load error:", err);
        alert("Error loading Bible file: " + err);
    });


// ------------------------------------------------------------
// Set up after DOM is ready
// ------------------------------------------------------------
window.addEventListener("load", () => {
    const refInput = document.getElementById("mv_reference_input");
    const mvInput = document.getElementById("mv_input");

    refInput.focus();

    // ENTER loads typed reference (FIXED)
    refInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.keyCode === 13) {
            event.preventDefault();
            loadTypedReference();
            mvInput.focus();
        }
    });

    // TAB loads typed reference
    refInput.addEventListener("keydown", function (event) {
        if (event.code === "Tab") {
            event.preventDefault();
            loadTypedReference();
            mvInput.focus();
        }
    });

    // NEXT VERSE BUTTON
    document.getElementById("mv_next_verse").addEventListener("click", () => {

        // If using custom list
        if (currentList) {
            currentIndex++;
            if (currentIndex >= currentList.length) {
                alert("End of your list!");
                return;
            }
            loadReference(currentList[currentIndex]);
            document.getElementById("mv_reference_input").value = currentList[currentIndex];
            document.getElementById("mv_input").focus();
            return;
        }

        // Otherwise use normal KJV sequence
        const currentRef = document.getElementById("mv_reference").innerText.trim();
        if (!currentRef) return;

        const nextRef = getNextReference(currentRef);
        const text = lookupVerse(nextRef);

        if (text) {
            loadVerse(text, nextRef);
            document.getElementById("mv_reference_input").value = nextRef;
            document.getElementById("mv_input").focus();
        }
    });

    // REPEAT VERSE BUTTON
    document.getElementById("mv_repeat_verse").addEventListener("click", () => {
        const currentRef = document.getElementById("mv_reference").innerText.trim();
        if (!currentRef) return;

        const text = lookupVerse(currentRef);
        if (text) {
            loadVerse(text, currentRef);
            document.getElementById("mv_input").focus();
        }
    });

    // SPACEBAR checks word
    mvInput.addEventListener("keydown", function (event) {
        if (event.code === "Space" || event.key === " ") {
            const raw = mvInput.value.trim();
            if (raw.length === 0) {
                event.preventDefault();
                return;
            }
            event.preventDefault();
            checkWord();
        }
    });
});


// ------------------------------------------------------------
// Normalize words
// ------------------------------------------------------------
function normalize(word) {
    return word.replace(/[.,;:!?]/g, "").toLowerCase();
}


// ------------------------------------------------------------
// Lookup verse text
// ------------------------------------------------------------
function lookupVerse(reference) {
    if (!kjvReady) {
        alert("Bible is still loading. Please wait.");
        return "";
    }
    return kjv[reference] || "";
}


// ------------------------------------------------------------
// Module state
// ------------------------------------------------------------
const mv = {
    words: [],
    index: 0,
    mistakes: 0
};


// ------------------------------------------------------------
// Load typed reference
// ------------------------------------------------------------
function loadTypedReference() {

    console.log("loadTypedReference called. kjvReady =", kjvReady);

    if (!kjvReady) {
        alert("Bible is still loading. Please wait.");
        return;
    }

    const ref = document.getElementById("mv_reference_input").value.trim();

    if (!ref) {
        alert("Please type a verse reference.");
        return;
    }

    const text = lookupVerse(ref);

    if (!text) {
        alert("Verse not found. Check spelling or format.");
        return;
    }

    loadVerse(text, ref);
}


// ------------------------------------------------------------
// Load reference (used by custom list)
// ------------------------------------------------------------
function loadReference(ref) {
    const text = lookupVerse(ref);
    if (!text) {
        alert("Verse not found. Check spelling or format.");
        return;
    }
    loadVerse(text, ref);
}


// ------------------------------------------------------------
// Load verse text
// ------------------------------------------------------------
function loadVerse(text, reference = "") {
    mv.words = text.trim().split(/\s+/);
    mv.index = 0;
    mv.mistakes = 0;

    document.getElementById("mv_progress").innerText = "";
    document.getElementById("mv_reveal").innerText = "";
    document.getElementById("mv_status").innerText = "";
    document.getElementById("mv_reference").innerText = reference;

    updateDisplay();
}


// ------------------------------------------------------------
// Update display
// ------------------------------------------------------------
function updateDisplay() {
    const correctWords = mv.words.slice(0, mv.index).join(" ");
    document.getElementById("mv_progress").innerText = correctWords;

    if (mv.index >= mv.words