// ============================================================
// voiceDashboard.js — Step 8 Dashboard Updater (v12)
// ============================================================

// Update the "Listening" indicator
export function updateListening(isListening) {
    const el = document.getElementById("vd_listening");
    if (el) el.textContent = isListening ? "ON" : "OFF";
}

// Update the last transcript text
export function updateTranscript(text) {
    const el = document.getElementById("vd_transcript");
    if (el) el.textContent = text || "";
}

// Update the last recognized command
export function updateCommand(cmd) {
    const el = document.getElementById("vd_command");
    if (el) el.textContent = cmd || "";
}

// Update the last spoken word (from recitation mode)
export function updateSpokenWord(word) {
    const el = document.getElementById("vd_spoken");
    if (el) el.textContent = word || "";
}

// Update the mistake counter
export function updateMistakes(count) {
    const el = document.getElementById("vd_mistakes");
    if (el) el.textContent = count;
}

// Clear all dashboard fields
export function clearDashboard() {
    updateTranscript("");
    updateCommand("");
    updateSpokenWord("");
    updateMistakes(0);
}
