console.log("bubble.js is running");

let kjvData = {};
let tooltipColumn = null;

// Load the KJV JSON
fetch("kjv_converted.json")
    .then(response => response.json())
    .then(data => {
        kjvData = data;
        console.log("KJV bubble data loaded.");
    });

// Setup tooltip column and listeners
document.addEventListener("DOMContentLoaded", () => {
    tooltipColumn = document.getElementById("tooltip-column");

    document.querySelectorAll(".scripture-ref").forEach(ref => {
        ref.addEventListener("mouseenter", showTooltip);
        ref.addEventListener("mouseleave", clearTooltip);
    });
});

function showTooltip(event) {
    const anchorId = event.target.id;

    // Convert ref_John_6_29 → "John 6:29"
    const parts = anchorId.split("_");
    const book = parts[1];
    const chapter = parts[2];
    const verseNum = parts[3];
    const jsonKey = `${book} ${chapter}:${verseNum}`;

    const verse = kjvData[jsonKey];
    if (!verse) {
        tooltipColumn.innerHTML = "";
        return;
    }

    tooltipColumn.innerHTML =
        `<strong>${verse.book} ${verse.chapter}:${verse.verse}</strong><br>${verse.text}`;
}

function clearTooltip() {
    tooltipColumn.innerHTML = "";
}
