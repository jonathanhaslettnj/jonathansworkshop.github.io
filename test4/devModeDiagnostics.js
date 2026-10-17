// ============================================================
// devModeDiagnostics.js — Diagnostic Engine (v12)
// ============================================================

import { loadVoiceConfig } from "./voiceConfigLoader.js";

// Main diagnostic function
export async function runDiagnostics() {
    const result = await loadVoiceConfig();
    const { config, source, errorState } = result;

    const diagnostics = {
        version: null,
        lastUpdated: null,
        source,
        errorState,
        jsonValid: false,
        commandCount: 0,
        keywordCount: 0,
        voiceSettingCount: 0,
        routerTests: [],
        voiceSettingTests: []
    };

    if (config) {
        diagnostics.jsonValid = true;
        diagnostics.version = config.version;
        diagnostics.lastUpdated = config.lastUpdated;

        diagnostics.commandCount = Object.keys(config.commands).length;

        diagnostics.keywordCount = Object.values(config.commands)
            .reduce((sum, cmd) => sum + cmd.keywords.length, 0);

        diagnostics.voiceSettingCount = Object.keys(config.voiceInputSettings).length;

        diagnostics.routerTests = runRouterTests(config);
        diagnostics.voiceSettingTests = runVoiceInputSettingTests(config.voiceInputSettings);
    }

    return diagnostics;
}

// Router simulation tests
function runRouterTests(config) {
    const tests = [];
    const samples = [
        "next",
        "go on",
        "say it again",
        "repeat verse please",
        "restart from the beginning"
    ];

    for (const input of samples) {
        const match = findMatchingCommand(input, config.commands);
        tests.push({ input, matchedCommand: match || "NONE" });
    }

    return tests;
}

// Find matching command based on keywords
function findMatchingCommand(input, commands) {
    const lower = input.toLowerCase();

    for (const [commandName, commandData] of Object.entries(commands)) {
        for (const keyword of commandData.keywords) {
            if (lower.includes(keyword.toLowerCase())) {
                return commandName;
            }
        }
    }

    return null;
}

// Voice-input settings tests
function runVoiceInputSettingTests(settings) {
    const tests = [];

    tests.push({
        setting: "confidenceThreshold",
        value: settings.confidenceThreshold,
        status: settings.confidenceThreshold >= 0 && settings.confidenceThreshold <= 1
            ? "OK" : "INVALID"
    });

    tests.push({
        setting: "stripPunctuation",
        value: settings.stripPunctuation,
        status: typeof settings.stripPunctuation === "boolean" ? "OK" : "INVALID"
    });

    tests.push({
        setting: "minWordLength",
        value: settings.minWordLength,
        status: settings.minWordLength > 0 ? "OK" : "INVALID"
    });

    tests.push({
        setting: "allowHomophones",
        value: settings.allowHomophones,
        status: typeof settings.allowHomophones === "boolean" ? "OK" : "INVALID"
    });

    tests.push({
        setting: "allowSynonyms",
        value: settings.allowSynonyms,
        status: typeof settings.allowSynonyms === "boolean" ? "OK" : "INVALID"
    });

    tests.push({
        setting: "allowCloseMatches",
        value: settings.allowCloseMatches,
        status: typeof settings.allowCloseMatches === "boolean" ? "OK" : "INVALID"
    });

    tests.push({
        setting: "requireExactOrder",
        value: settings.requireExactOrder,
        status: typeof settings.requireExactOrder === "boolean" ? "OK" : "INVALID"
    });

    return tests;
}
