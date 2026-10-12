// ============================================================
// voiceRecognition.js — Speech Recognition Engine (v12)
// ============================================================

import { updateListening, updateTranscript } from "./voiceDashboard.js";
import { routeVoiceCommand, executeVoiceCommand } from "./voiceRouter.js";

let recognition = null;
let listening = false;

// ------------------------------------------------------------
// Speech Synthesis (reading the verse out loud)
// ------------------------------------------------------------
export function speakVerse(text) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    speechSynthesis.speak(utter);
}
window.speakVerse = speakVerse;

// ------------------------------------------------------------
// Initialize speech recognition
// ------------------------------------------------------------
export function initSpeechRecognition() {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.warn("Speech Recognition not supported.");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
        listening = true;
        updateListening(true);
        console.log("Voice: recognition started");
    };

    recognition.onend = () => {
        listening = false;
        updateListening(false);
        console.log("Voice: recognition stopped");
    };

    recognition.onerror = (e) => {
        console.error("Speech recognition error:", e);
    };

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        updateTranscript(transcript);

        const cmd = routeVoiceCommand(transcript);
        executeVoiceCommand(cmd);
    };

    console.log("Voice: recognizer initialized");
}

// ------------------------------------------------------------
// Start listening
// ------------------------------------------------------------
export function startListening() {
    if (!recognition) return;
    console.log("Voice: startListening() called");
    recognition.start();
}
window.startListening = startListening;

// ------------------------------------------------------------
// Stop listening
// ------------------------------------------------------------
export function stopListening() {
    if (!recognition) return;
    console.log("Voice: stopListening() called");
    recognition.stop();
}
window.stopListening = stopListening;

