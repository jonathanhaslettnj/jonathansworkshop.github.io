console.log("bubble.js is running");

let kjvData = {};
let tooltipColumn = null;

// Load the KJV JSON
fetch("kjv_converted_fixed.json")
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
    console.log("Hovered ID:", anchorId);

    const parts = anchorId.split("_");
    const book = parts[1];
    const chapter = parts[2];
    const verseNum = parts[3];
    const jsonKey = `${book} ${chapter}:${verseNum}`;

    console.log("JSON key:", jsonKey);

    const verse = kjvData[jsonKey];

    if (!verse) {
        console.log("Verse not found in JSON.");
        tooltipColumn.innerHTML = `<strong>${jsonKey}</strong><br><em>Not found in JSON</em>`;
        return;
    }

    console.log("Verse object:", verse);

    if (!verse.text) {
        console.log("Verse object has no 'text' field.");
        tooltipColumn.innerHTML = `<strong>${jsonKey}</strong><br><em>No text field</em>`;
        return;
    }

    console.log("Verse text:", verse.text);

    tooltipColumn.innerHTML =
        `<strong>${jsonKey}</strong><br>${verse.text}`;
}


function clearTooltip() {
    tooltipColumn.innerHTML = "";
}

