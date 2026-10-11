// ============================================================
// Step 6 + Step 7 — Speech Recognition Module (with Spoken Recitation)
// ============================================================

import { routeVoiceCommand, executeVoiceCommand } from "./voiceRouter.js";
import { processSpokenText } from "./spokenRecitation.js";

let recognizer = null;
let listening = false;

// ------------------------------------------------------------
// Initialize speech recognition
// ------------------------------------------------------------
export function initSpeechRecognition() {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.error("Speech Recognition not supported in this browser.");
        return;
    }

    recognizer = new SpeechRecognition();
    recognizer.lang = "en-US";
    recognizer.continuous = true;
    recognizer.interimResults = false;

    recognizer.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        console.log("Heard:", transcript);

        // 1. Try routing as a voice command
        const command = routeVoiceCommand(transcript);

        if (command) {
            executeVoiceCommand(command);
        } else {
            // 2. Otherwise treat as spoken verse input
            processSpokenText(transcript);
        }
    };

    recognizer.onerror = (err) => {
        console.error("Speech recognition error:", err);
    };

    console.log("Speech recognition initialized.");
}

// ------------------------------------------------------------
// Start listening
// ------------------------------------------------------------
export function startListening() {
    if (!recognizer) {
        console.warn("Recognizer not initialized.");
        return;
    }

    if (!listening) {
        recognizer.start();
        listening = true;
        console.log("Voice recognition: STARTED");
    }
}

// ------------------------------------------------------------
// Stop listening
// ------------------------------------------------------------
export function stopListening() {
    if (recognizer && listening) {
        recognizer.stop();
        listening = false;
        console.log("Voice recognition: STOPPED");
    }
}
