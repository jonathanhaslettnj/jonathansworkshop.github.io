// ============================================================
// voiceRecognition.js — Speech Recognition Engine (v12)
// ============================================================

import { updateListening, updateTranscript } from "./voiceDashboard.js";
import { routeVoiceCommand, executeVoiceCommand } from "./voiceRouter.js";

let recognition = null;
let listening = false;

// Initialize speech recognition
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
    };

    recognition.onend = () => {
        listening = false;
        updateListening(false);
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
}

// Start listening
export function startListening() {
    if (!recognition) return;
    recognition.start();
}

// Stop listening
export function stopListening() {
    if (!recognition) return;
    recognition.stop();
}
