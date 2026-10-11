// ============================================================
// Voice Configuration Loader (Step 2)
// ============================================================

const VOICE_CONFIG_URL = "/test3/voice-commands.json";
const CACHE_KEY = "voiceConfigCache";

export async function loadVoiceConfig() {
    let cached = null;
    let fileConfig = null;
    let source = "unknown";
    let errorState = null;

    // ------------------------------------------------------------
    // 1. Load cached version if available
    // ------------------------------------------------------------
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
            cached = JSON.parse(raw);
        }
    } catch (err) {
        console.error("Cache read error:", err);
    }

    // ------------------------------------------------------------
    // 2. Try loading the JSON file
    // ------------------------------------------------------------
    try {
        const response = await fetch(VOICE_CONFIG_URL, { cache: "no-store" });

        if (!response.ok) {
            throw new Error("File fetch failed: " + response.status);
        }

        const text = await response.text();

        // JSON validity check
        try {
            fileConfig = JSON.parse(text);
        } catch (jsonErr) {
            console.error("JSON syntax error:", jsonErr);
            errorState = "JSON_INVALID";
        }

    } catch (err) {
        console.error("File load error:", err);
        errorState = "FILE_LOAD_FAILED";
    }

    // ------------------------------------------------------------
    // 3. Decide which config to use
    // ------------------------------------------------------------
    if (fileConfig && !errorState) {
        // Compare versions
        if (!cached || cached.version !== fileConfig.version) {
            console.log(`Fetched updated voice config from file (v${fileConfig.version})`);
            localStorage.setItem(CACHE_KEY, JSON.stringify(fileConfig));
            source = "file";
            return { config: fileConfig, source, errorState };
        } else {
            console.log(`Loaded voice config from cache (v${cached.version})`);
            source = "localStorage";
            return { config: cached, source, errorState };
        }
    }

    // ------------------------------------------------------------
    // 4. File failed — fallback to cache
    // ------------------------------------------------------------
    if (cached) {
        console.warn(`Voice config load error — using cached version (v${cached.version})`);
        source = "localStorage";
        return { config: cached, source, errorState };
    }

    // ------------------------------------------------------------
    // 5. No config available at all
    // ------------------------------------------------------------
    console.error("Voice config load error — no configuration available");
    return { config: null, source: "none", errorState: "NO_CONFIG_AVAILABLE" };
}
