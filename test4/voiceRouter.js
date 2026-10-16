// ============================================================
// voiceRouter.js — Unified Voice Command Router (Steps 6–9)
// ============================================================

import commands from "./voice-commands.js";

// ------------------------------------------------------------
// Helper: check if phrase contains any keyword for a command
// ------------------------------------------------------------
function match(phrase, commandName) {
    const cmd = commands.commands[commandName];
    if (!cmd || !cmd.keywords) return false;

    return cmd.keywords.some(keyword => phrase.includes(keyword));
}

// ------------------------------------------------------------
// Helper: extract a number for "jump to verse X"
// ------------------------------------------------------------
function extractNumber(text) {
    const m = text.match(/\b(\d+)\b/);
    return m ? parseInt(m[1], 10) : null;
}

// ------------------------------------------------------------
// Main Router
// ------------------------------------------------------------
export function routeVoiceCommand(phrase) {
    if (!phrase) return null;
    phrase = phrase.toLowerCase();

    // Step 6 / Step 7 commands
    if (match(phrase, "nextVerse")) return { action: "nextVerse" };

    if (match(phrase, "startOver")) return { action: "startOver" };

    if (phrase.includes("repeat verse")) return { action: "repeatVerse" };
   
    if (match(phrase, "repeatVerse")) return { action: "repeatVerse" };
   

    // Step 9 navigation commands
    if (match(phrase, "previousVerse")) return { action: "previousVerse" };
    if (match(phrase, "startChapter")) return { action: "startChapter" };

    // Jump to verse X — ONLY when actual keywords match
    if (match(phrase, "jumpToVerse")) {
        const num = extractNumber(phrase);
        if (num) return { action: "jumpToVerse", value: num };
    }

    return null;
}

// ------------------------------------------------------------
// Execute command (called by voiceRecognition.js)
// ------------------------------------------------------------
export function executeVoiceCommand(cmd) {
    if (!cmd) return;

    // Update dashboard
    document.getElementById("vd_command").textContent = cmd.action;

switch (cmd.action) {

    case "nextVerse":
        window.loadNextVerse();
        break;

    case "previousVerse":
        window.loadPreviousVerse();
        break;

   case "startOver":
         window.location.reload();
         break;

   case "repeatVerse":
        // Speak the verse again WITHOUT restarting
        window.speakVerse(window.currentText);
        break;


    case "startChapter":
        window.startChapter();
        break;

    case "jumpToVerse":
        window.jumpToVerse(cmd.value);
        break;

    default:
        console.warn("Unknown voice command:", cmd.action);
    }
}
