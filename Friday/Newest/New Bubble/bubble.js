console.log("bubble.js is running");

let kjvData = {};
let bubble = null;

// Load the KJV JSON
fetch("kjv_converted.json")
    .then(response => response.json())
    .then(data => {
        kjvData = data;
        console.log("KJV bubble data loaded.");
    });

// Create bubble tooltip div
document.addEventListener("DOMContentLoaded", () => {
    bubble = document.createElement("div");
    bubble.id = "bubble-tooltip";
    document.body.appendChild(bubble);

    // Attach hover listeners to scripture references
    document.querySelectorAll(".scripture-ref").forEach(ref => {
        ref.addEventListener("mouseenter", showBubble);
        ref.addEventListener("mousemove", moveBubble);
        ref.addEventListener("mouseleave", hideBubble);
    });
});

function showBubble(event) {
    const anchorId = event.target.id;

    // Convert ref_John_6_29 → "John 6:29"
    const parts = anchorId.split("_");
    const book = parts[1];
    const chapter = parts[2];
    const verseNum = parts[3];
    const jsonKey = `${book} ${chapter}:${verseNum}`;

    if (!kjvData[jsonKey]) {
        bubble.style.display = "none";
        return;
    }

    const verse = kjvData[jsonKey];
    bubble.innerHTML = `<strong>${verse.book} ${verse.chapter}:${verse.verse}</strong><br>${verse.text}`;
    bubble.style.display = "block";
}

function moveBubble(event) {
    bubble.style.left = (event.pageX + 15) + "px";
    bubble.style.top = (event.pageY + 15) + "px";
}

function hideBubble() {
    bubble.style.display = "none";
}
