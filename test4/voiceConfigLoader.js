// ============================================================
// voiceConfigLoader.js — Load Voice Command Config (v12)
// ============================================================

export async function loadVoiceConfig() {
    try {
        const configModule = await import("./voice-commands.js");
        const config = configModule.default;

        return {
            config,
            source: "voice-commands.js",
            errorState: "NONE"
        };
    } catch (err) {
        console.error("Voice config load error:", err);

        return {
            config: null,
            source: "voice-commands.js",
            errorState: err.message || "UNKNOWN ERROR"
        };
    }
}
