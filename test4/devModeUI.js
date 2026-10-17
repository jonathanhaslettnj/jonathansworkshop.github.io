// ============================================================
// devModeUI.js — Developer Mode Panel (v12)
// ============================================================

import { runDiagnostics } from "./devModeDiagnostics.js";

// Initialize Developer Mode UI
export function initDeveloperModeUI() {
    const btn = document.getElementById("testVoiceConfigBtn");
    const panel = document.getElementById("devModePanel");

    if (!btn || !panel) {
        console.warn("Developer Mode UI elements missing.");
        return;
    }

    btn.addEventListener("click", async () => {
        const results = await runDiagnostics();
        renderDiagnostics(results);
    });
}

// Render diagnostic results inside Developer Mode panel
function renderDiagnostics(diag) {
    const panel = document.getElementById("devModePanel");
    if (!panel) return;

    const html = `
        <h3>Voice Config Diagnostics</h3>
        <div><strong>Version:</strong> ${diag.version || "N/A"}</div>
        <div><strong>Last Updated:</strong> ${diag.lastUpdated || "N/A"}</div>
        <div><strong>Source:</strong> ${diag.source}</div>
        <div><strong>Error State:</strong> ${diag.errorState}</div>
        <div><strong>JSON Valid:</strong> ${diag.jsonValid}</div>
        <div><strong>Commands:</strong> ${diag.commandCount}</div>
        <div><strong>Total Keywords:</strong> ${diag.keywordCount}</div>
        <div><strong>Voice Input Settings:</strong> ${diag.voiceSettingCount}</div>

        <h4>Router Tests</h4>
        <pre>${JSON.stringify(diag.routerTests, null, 2)}</pre>

        <h4>Voice Input Settings Tests</h4>
        <pre>${JSON.stringify(diag.voiceSettingTests, null, 2)}</pre>
    `;

    panel.innerHTML = html;
}
