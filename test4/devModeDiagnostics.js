// ============================================================
// Developer Mode v12 — Diagnostic Panel (Step 3)
// ============================================================

import { loadVoiceConfig } from "./voiceConfigLoader.js";

// ------------------------------------------------------------
// Main diagnostic function
// ------------------------------------------------------------
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

    // ------------------------------------------------------------
    // JSON validity check
    // ------------------------------------------------------------
    if (config) {
        diagnostics.jsonValid = true;
        diagnostics.version = config.version;
        diagnostics.lastUpdated = config.lastUpdated;

        // Count commands
        diagnostics.commandCount = Object.keys(config.commands).length;

        // Count keywords
        diagnostics.keywordCount = Object.values(config.commands)
            .reduce((sum, cmd) => sum + cmd.keywords.length, 0);

        // Count voice-input settings
        diagnostics.voiceSettingCount = Object.keys(config.voiceInputSettings).length;

        // Run router tests
        diagnostics.routerTests = runRouterTests(config);

        // Run voice-input settings tests
        diagnostics.voiceSettingTests = runVoiceInputSettingTests(config.voiceInputSettings);
    }

    // ------------------------------------------------------------
    // Print diagnostic summary to console
    // ------------------------------------------------------------
    printDiagnosticsToConsole(diagnostics);

    return diagnostics;
}

// ------------------------------------------------------------
// Router simulation tests
// ------------------------------------------------------------
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

        tests.push({
            input,
            matchedCommand: match || "NONE"
        });
    }

    return tests;
}

// ------------------------------------------------------------
// Find matching command based on keywords
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// Voice-input settings tests
// ------------------------------------------------------------
function runVoiceInputSettingTests(settings) {
    const tests = [];

    tests.push({
        setting: "confidenceThreshold",
        value: settings.confidenceThreshold,
        status: settings.confidenceThreshold >= 0 && settings.confidenceThreshold <= 1
            ? "OK"
            : "INVALID"
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

// ------------------------------------------------------------
// Console output
// ------------------------------------------------------------
function printDiagnosticsToConsole(diag) {
    console.log("==============================================");
    console.log("Voice Config Diagnostic");
    console.log("==============================================");

    console.log("Version:", diag.version);
    console.log("Last Updated:", diag.lastUpdated);
    console.log("Source:", diag.source);
    console.log("Error State:", diag.errorState);
    console.log("JSON Valid:", diag.jsonValid);

    console.log("Commands:", diag.commandCount);
    console.log("Total Keywords:", diag.keywordCount);
    console.log("Voice Input Settings:", diag.voiceSettingCount);

    console.log("----------------------------------------------");
    console.log("Router Tests:");
    diag.routerTests.forEach(t => {
        console.log(`Input: "${t.input}" → ${t.matchedCommand}`);
    });

    console.log("----------------------------------------------");
    console.log("Voice Input Settings Tests:");
    diag.voiceSettingTests.forEach(t => {
        console.log(`${t.setting}: ${t.value} → ${t.status}`);
    });

    console.log("==============================================");
}
