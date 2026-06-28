const modernPopupStyle = document.createElement('style');
modernPopupStyle.textContent = `
  :root {
    --as-ink: #221f1a;
    --as-muted: #72624f;
    --as-soft: #9c8c77;
    --as-accent: #c7772e;
    --as-accent-deep: #9b5416;
    --as-teal: #0d6b67;
    --as-danger: #c84a35;
    --as-success: #1f7a5c;
    --as-panel: rgba(255, 252, 247, 0.92);
    --as-line: rgba(138, 113, 76, 0.18);
    --as-shadow: 0 22px 56px rgba(72, 49, 26, 0.14);
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    width: 1040px;
    min-height: 720px;
    background:
      radial-gradient(circle at top left, rgba(199, 119, 46, 0.18), transparent 34%),
      radial-gradient(circle at bottom right, rgba(13, 107, 103, 0.15), transparent 28%),
      linear-gradient(135deg, #f9f6f0 0%, #f2eee7 48%, #ede4d5 100%);
    color: var(--as-ink);
    font-family: "Aptos", "Segoe UI", sans-serif;
  }

  button, input, select, textarea { font: inherit; }

  .container {
    margin: 0;
    padding: 18px;
    background: transparent;
    height: auto;
    min-height: 100vh;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18px;
    margin-bottom: 14px;
    padding: 18px 22px;
    border: 1px solid rgba(77, 53, 29, 0.08);
    border-radius: 24px;
    background: linear-gradient(135deg, rgba(255, 250, 244, 0.96), rgba(255, 247, 238, 0.88));
    box-shadow: var(--as-shadow);
  }

  .brand-wrap {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .brand-mark {
    display: grid;
    place-items: center;
    width: 54px;
    height: 54px;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--as-accent), #edb36d);
    color: white;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 0.06em;
  }

  .brand-copy small {
    display: block;
    margin-bottom: 4px;
    color: var(--as-soft);
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .header h1 {
    margin: 0;
    color: var(--as-ink);
    font-size: 28px;
    letter-spacing: -0.04em;
  }

  .hero-buttons {
    display: flex;
    gap: 10px;
  }

  .hero-btn, .version {
    border: 0;
    border-radius: 999px;
    padding: 11px 16px;
    font-size: 12px;
    font-weight: 700;
  }

  .hero-btn {
    background: rgba(255,255,255,0.78);
    color: var(--as-accent-deep);
    cursor: pointer;
  }

  .version {
    background: rgba(13, 107, 103, 0.1);
    color: var(--as-teal);
  }

  .workspace-banner {
    display: grid;
    grid-template-columns: 1.7fr 1fr;
    gap: 14px;
    margin-bottom: 14px;
  }

  .workspace-card {
    border: 1px solid var(--as-line);
    border-radius: 24px;
    background: var(--as-panel);
    box-shadow: var(--as-shadow);
    padding: 18px;
  }

  .workspace-label {
    display: block;
    margin-bottom: 8px;
    color: var(--as-soft);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .workspace-title-row, .workspace-meta-row, .workspace-controls, .workspace-subcontrols, .status, .panel-head, .api-meta {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .workspace-title-row { margin-bottom: 10px; }

  .workspace-title {
    flex: 1;
    padding: 14px 16px;
    border: 1px solid rgba(145, 118, 84, 0.15);
    border-radius: 14px;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.03em;
    background: rgba(255,255,255,0.82);
  }

  .workspace-meta {
    padding: 11px 13px;
    border: 1px solid rgba(145, 118, 84, 0.15);
    border-radius: 14px;
    background: rgba(255,255,255,0.82);
  }

  .workspace-meta.project { flex: 1; }
  .workspace-meta.wait { max-width: 130px; }
  .workspace-meta.mode { max-width: 180px; }
  .workspace-meta.url.hidden { display: none; }
  .launch-hint {
    margin-top: 10px;
    color: var(--as-muted);
    font-size: 12px;
    line-height: 1.45;
  }

  .counter-badge, .status-count, .status-text {
    display: inline-flex;
    align-items: center;
    padding: 9px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }

  .counter-badge {
    background: rgba(199, 119, 46, 0.12);
    color: var(--as-accent-deep);
  }

  .workspace-controls { margin-bottom: 10px; }

  .btn {
    border: 0;
    border-radius: 16px;
    padding: 12px 14px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  }

  .btn:hover:not(:disabled) { transform: translateY(-1px); }

  .btn-primary { background: linear-gradient(135deg, #149271, #2eb98a); box-shadow: 0 14px 24px rgba(20, 146, 113, 0.22); color: white; }
  .btn-warning { background: linear-gradient(135deg, #d68f26, #edb552); box-shadow: 0 14px 24px rgba(214, 143, 38, 0.22); color: white; }
  .btn-danger { background: linear-gradient(135deg, #ba4a31, #de6b4d); box-shadow: 0 14px 24px rgba(186, 74, 49, 0.22); color: white; }
  .btn-secondary { background: rgba(255,255,255,0.78); color: var(--as-accent-deep); border: 1px solid rgba(199, 119, 46, 0.12); }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

  .workspace-subcontrols { justify-content: space-between; }

  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
    padding: 6px;
    border-radius: 999px;
    background: rgba(255, 252, 247, 0.78);
    border: 1px solid rgba(145, 118, 84, 0.1);
    overflow-x: auto;
  }

  .tab-btn {
    padding: 10px 16px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--as-muted);
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
  }

  .tab-btn.active {
    background: linear-gradient(135deg, rgba(199, 119, 46, 0.16), rgba(199, 119, 46, 0.08));
    color: var(--as-accent-deep);
  }

  .tab-content {
    display: none;
    padding: 0;
    overflow: visible;
  }

  .tab-content.active { display: block; }

  .recorder-grid, .settings-grid, .assertions-grid {
    display: grid;
    gap: 14px;
  }

  .recorder-grid { grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.9fr); }
  .assertions-grid { grid-template-columns: 1fr 1.15fr; }
  .settings-grid { grid-template-columns: 0.9fr 1.1fr; }

  .panel-shell {
    border: 1px solid var(--as-line);
    border-radius: 24px;
    background: var(--as-panel);
    box-shadow: var(--as-shadow);
    padding: 18px;
  }

  .panel-head {
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
  }

  .panel-head h2, .panel-head h3 {
    margin: 0;
    font-size: 18px;
    letter-spacing: -0.03em;
  }

  .panel-head p, .callout li {
    margin: 6px 0 0;
    color: var(--as-muted);
    font-size: 13px;
    line-height: 1.45;
  }

  .callout {
    border-radius: 18px;
    padding: 16px 18px;
    background: linear-gradient(135deg, rgba(13, 107, 103, 0.1), rgba(199, 119, 46, 0.08));
  }

  .callout strong {
    display: block;
    margin-bottom: 8px;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--as-teal);
  }

  .callout ol { margin: 0; padding-left: 18px; }

  .recording-options, .export-options, .settings-group, .recorded-steps-list, .assertions-list, .network-list, .playback-results, .saved-tests {
    border: 1px solid var(--as-line);
    border-radius: 18px;
    background: rgba(255,255,255,0.72);
    box-shadow: none;
  }

  .recording-options, .export-options, .settings-group {
    padding: 14px;
  }

  .recording-options.hidden, .assertion-controls, #networkFilter, .legacy-hidden {
    display: none !important;
  }

  .recorded-steps-list, .assertions-list, .network-list, .playback-results, .saved-tests {
    max-height: 478px;
    overflow: auto;
  }

  .recorded-step-item, .playback-item, .saved-test-item, .assertion-item, .network-item {
    padding: 14px 16px;
    border-bottom: 1px solid rgba(145, 118, 84, 0.08);
    background: rgba(255,255,255,0.5);
  }

  .recorded-step-item:last-child, .playback-item:last-child, .saved-test-item:last-child, .assertion-item:last-child, .network-item:last-child { border-bottom: 0; }
  .recorded-step-item { border-left: 4px solid var(--as-accent); }
  .network-item { border-left: 4px solid var(--as-teal); }

  .step-body { display: flex; gap: 10px; align-items: flex-start; }
  .step-copy { flex: 1; min-width: 0; }
  .step-summary { font-size: 13px; font-weight: 700; line-height: 1.4; }
  .step-meta { margin-top: 6px; color: var(--as-muted); font-size: 12px; line-height: 1.45; word-break: break-word; }
  .step-preview-image, .api-preview-thumb { width: 76px; height: 52px; border-radius: 12px; border: 1px solid rgba(145, 118, 84, 0.12); object-fit: cover; background: rgba(255,255,255,0.88); }

  .locator-chip-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .locator-chip {
    display: inline-flex;
    align-items: center;
    max-width: 132px;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(199, 119, 46, 0.12);
    color: var(--as-accent-deep);
    font-size: 10px;
    font-weight: 800;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-badge {
    display: inline-flex;
    align-items: center;
    padding: 5px 10px;
    border-radius: 999px;
    background: rgba(13, 107, 103, 0.12);
    color: var(--as-teal);
    font-size: 10px;
    font-weight: 800;
  }

  .empty-state {
    padding: 28px 20px;
    color: var(--as-muted);
    font-size: 13px;
    line-height: 1.5;
    text-align: center;
  }

  .status {
    flex-wrap: wrap;
    margin-bottom: 0;
    padding: 0;
    background: transparent;
  }

  .status-text {
    background: rgba(130, 103, 73, 0.1);
    color: var(--as-muted);
  }

  .status-count {
    background: rgba(130, 103, 73, 0.08);
    color: var(--as-muted);
  }

  .notifications {
    position: fixed;
    right: 16px;
    bottom: 16px;
    width: min(320px, calc(100vw - 32px));
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .notification {
    padding: 12px 14px;
    border-radius: 14px;
    box-shadow: 0 18px 28px rgba(72, 49, 26, 0.18);
    background: #fffdf8;
    border: 1px solid rgba(145, 118, 84, 0.12);
    color: var(--as-ink);
    font-size: 13px;
  }

  .notification.error { border-color: rgba(200, 74, 53, 0.28); color: var(--as-danger); }
  .notification.warning { border-color: rgba(199, 119, 46, 0.28); color: var(--as-accent-deep); }

  .api-grid {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 14px;
  }

  .api-url-row, .api-header-row {
    display: grid;
    gap: 10px;
  }

  .api-url-row { grid-template-columns: 132px 1fr; margin-bottom: 12px; }
  .api-header-row { grid-template-columns: 1fr 1fr 78px; }
  .api-header-list { display: flex; flex-direction: column; gap: 8px; }
  .api-block + .api-block { margin-top: 14px; }
  .api-block-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 8px; }
  .api-input, .api-select, .api-textarea, .api-output, #scriptPreview, .input-field, .select-field {
    width: 100%;
    padding: 12px 13px;
    border: 1px solid rgba(145, 118, 84, 0.15);
    border-radius: 14px;
    background: rgba(255,255,255,0.82);
    color: var(--as-ink);
  }

  .api-textarea, .api-output, #scriptPreview {
    min-height: 156px;
    resize: vertical;
    font-family: "Cascadia Code", "Consolas", monospace;
    font-size: 12px;
    line-height: 1.55;
  }

  #scriptPreview { min-height: 460px; }
  .api-output { margin: 0; white-space: pre-wrap; word-break: break-word; }
  .response-panels { display: grid; gap: 14px; margin-top: 14px; }
  .saved-tests .item-header { align-items: flex-start; }
`;
document.head.appendChild(modernPopupStyle);

document.body.innerHTML = `
  <div class="container">
    <div class="header">
      <div class="brand-wrap">
        <div class="brand-mark">AS</div>
        <div class="brand-copy">
          <small>QA automation workspace</small>
          <h1>AS Web Recorder</h1>
        </div>
      </div>
      <div class="hero-buttons">
        <button id="launchInspectorQuick" class="hero-btn" type="button">Inspect</button>
        <span class="version">Modernized</span>
      </div>
    </div>

    <div class="workspace-banner">
      <div class="workspace-card">
        <label class="workspace-label" for="testCaseName">Test case name</label>
        <div class="workspace-title-row">
          <input id="testCaseName" class="workspace-title" placeholder="Checkout flow - guest user">
          <span id="stepCounterBadge" class="counter-badge">0 steps</span>
        </div>
        <div class="workspace-meta-row">
          <input id="projectName" class="workspace-meta project" placeholder="Project or suite">
          <input id="waitTimeout" class="workspace-meta wait" type="number" value="5000" min="1000" step="500">
        </div>
        <div class="workspace-meta-row" style="margin-top:10px;">
          <select id="recordTargetMode" class="workspace-meta mode">
            <option value="existing">Use existing browser tab</option>
            <option value="new">Open new browser window</option>
          </select>
          <input id="freshBrowserUrl" class="workspace-meta project url hidden" placeholder="https://example.com">
        </div>
        <div id="recordTargetHint" class="launch-hint">Choose whether to record the last active website tab or open a fresh browser window from a URL.</div>
      </div>
      <div class="workspace-card">
        <div class="workspace-controls">
          <button id="startBtn" class="btn btn-primary">Start</button>
          <button id="pauseBtn" class="btn btn-warning" disabled>Pause</button>
          <button id="stopBtn" class="btn btn-danger" disabled>Stop</button>
        </div>
        <div class="workspace-subcontrols">
          <button id="previewBtn" class="btn btn-secondary" disabled>Preview Code</button>
          <button id="downloadBtn" class="btn btn-secondary" disabled>Download</button>
          <button id="copyBtn" class="btn btn-secondary" disabled>Copy</button>
        </div>
      </div>
    </div>

    <div class="status">
      <span id="status" class="status-text">Ready</span>
      <span id="actionCount" class="status-count">Actions: 0</span>
      <span id="screenshotCount" class="status-count">Screenshots: 0</span>
      <span id="networkCount" class="status-count legacy-hidden">API Calls: 0</span>
      <span id="contextBrowser" class="status-count">Browser: -</span>
      <span id="contextOs" class="status-count">OS: -</span>
      <span id="contextViewport" class="status-count">Viewport: -</span>
      <span id="contextClock" class="status-count">Time: -</span>
    </div>

    <div class="tabs">
      <button class="tab-btn active" data-tab="recording">Recorder</button>
      <button class="tab-btn" data-tab="assertions">Inspector</button>
      <button class="tab-btn" data-tab="network">API Lab</button>
      <button class="tab-btn" data-tab="export">Export</button>
      <button class="tab-btn" data-tab="playback">Playback</button>
      <button class="tab-btn" data-tab="settings">Library</button>
    </div>

    <div class="tab-content active" id="recording">
      <div class="recorder-grid">
        <div class="panel-shell">
          <div class="panel-head">
            <div>
              <h2>Recorded Steps</h2>
              <p>Each step keeps framework-friendly locator references.</p>
            </div>
            <button id="clearBtn" class="btn btn-secondary" type="button">Clear</button>
          </div>
          <div class="recording-options">
            <label class="checkbox-label"><input type="checkbox" id="captureScreenshots" checked> Step previews</label>
            <label class="checkbox-label legacy-hidden"><input type="checkbox" id="captureNetwork"> Monitor network</label>
            <label class="checkbox-label"><input type="checkbox" id="recordWaits" checked> Record waits</label>
            <label class="checkbox-label legacy-hidden"><input type="checkbox" id="recordAssertions"> Record assertions</label>
          </div>
          <div id="recordedStepsList" class="recorded-steps-list">
            <div class="empty-state">Recorded steps will appear here as you interact with the page.</div>
          </div>
        </div>
        <div class="panel-shell">
          <div class="panel-head">
            <div>
              <h2>Inspector Summary</h2>
              <p>Live selector capture with Playwright, Cypress, and Selenium-friendly output.</p>
            </div>
            <button id="launchInspectorBtn" class="btn btn-secondary" type="button">Launch</button>
          </div>
          <div id="inspectorSummaryCard" class="assertions-list">
            <div class="empty-state">Launch the live inspector, click any element on the page, and reopen the popup to copy selectors.</div>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-content" id="assertions">
      <div class="assertions-grid">
        <div class="panel-shell">
          <div class="panel-head">
            <div>
              <h2>Live Inspector</h2>
              <p>Use the on-page panel to pin, inspect, and copy selector formats directly from the browser.</p>
            </div>
            <div class="hero-buttons">
              <button id="startInspectorBtn" class="hero-btn" type="button">Start Inspector</button>
              <button id="stopInspectorBtn" class="hero-btn" type="button">Stop</button>
            </div>
          </div>
          <div class="callout">
            <strong>Workflow</strong>
            <ol>
              <li>Open the target page.</li>
              <li>Start the live inspector.</li>
              <li>Click any element to capture CSS, XPath, Selenium, Playwright, and Cypress locators.</li>
              <li>Use the pin icon in the page panel to keep it docked while you keep exploring.</li>
            </ol>
          </div>
          <button id="addAssertionBtn" class="legacy-hidden" type="button">Hidden</button>
        </div>
        <div class="panel-shell">
          <div class="panel-head">
            <div>
              <h2>Selected Element</h2>
              <p>Detailed selector pack for the most recent inspected element.</p>
            </div>
          </div>
          <div id="assertionsList" class="assertions-list">
            <div class="empty-state">No element selected yet.</div>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-content" id="network">
      <div class="panel-shell">
        <div class="panel-head">
          <div>
            <h2>API Lab</h2>
            <p>Execute requests, inspect responses, and keep a lightweight request history inside the extension.</p>
          </div>
          <div class="hero-buttons">
            <button id="sendApiBtn" class="hero-btn" type="button">Send Request</button>
            <button id="saveApiPresetBtn" class="hero-btn" type="button">Save Snapshot</button>
          </div>
        </div>
        <div class="api-grid">
          <div>
            <div class="api-url-row">
              <select id="apiMethod" class="api-select">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
              <input id="apiUrl" class="api-input" placeholder="https://api.example.com/orders/123">
            </div>
            <div class="api-block">
              <div class="api-block-head">
                <h3>Headers</h3>
                <button id="addHeaderBtn" class="hero-btn" type="button">Add header</button>
              </div>
              <div id="apiHeadersList" class="api-header-list"></div>
            </div>
            <div class="api-block">
              <div class="api-block-head">
                <h3>Request Body</h3>
                <span class="status-count">Optional for POST, PUT, and PATCH.</span>
              </div>
              <textarea id="apiBody" class="api-textarea" placeholder='{"email":"qa@example.com"}'></textarea>
            </div>
            <div class="api-block">
              <div class="api-block-head">
                <h3>Recent Snapshots</h3>
              </div>
              <div id="apiHistory" class="saved-tests">
                <div class="empty-state">Saved API runs will appear here.</div>
              </div>
            </div>
            <div id="networkList" class="network-list legacy-hidden"></div>
          </div>
          <div>
            <div class="api-meta">
              <span id="apiStatusBadge" class="status-text">Idle</span>
              <span id="apiDuration" class="status-count">Duration: -</span>
              <span id="apiBytes" class="status-count">Size: -</span>
            </div>
            <div class="response-panels">
              <div>
                <div class="api-block-head">
                  <h3>Response Body</h3>
                  <button id="copyApiResponseBtn" class="hero-btn" type="button">Copy</button>
                </div>
                <pre id="apiResponseOutput" class="api-output">Run a request to inspect the response body.</pre>
              </div>
              <div>
                <div class="api-block-head"><h3>Response Headers</h3></div>
                <pre id="apiHeadersOutput" class="api-output">Headers will appear here.</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-content" id="export">
      <div class="panel-shell">
        <div class="panel-head">
          <div>
            <h2>Export Studio</h2>
            <p>Generate framework-ready automation code from the recorder timeline.</p>
          </div>
        </div>
        <div class="export-options">
          <label>Export Format:</label>
          <select id="formatSelect" class="select-field">
            <option value="playwright-js">Playwright (JavaScript)</option>
            <option value="playwright-python">Playwright (Python)</option>
            <option value="cypress">Cypress</option>
            <option value="selenium-python">Selenium (Python)</option>
            <option value="selenium-java">Selenium (Java)</option>
            <option value="json">JSON</option>
          </select>
        </div>
        <div class="export-options">
          <label class="checkbox-label"><input type="checkbox" id="includeScreenshots" checked> Include screenshots</label>
          <label class="checkbox-label legacy-hidden"><input type="checkbox" id="includeNetwork"> Network calls</label>
          <label class="checkbox-label legacy-hidden"><input type="checkbox" id="includeAssertions"> Assertions</label>
        </div>
        <textarea id="scriptPreview" placeholder="Script preview will appear here..."></textarea>
      </div>
    </div>

    <div class="tab-content" id="playback">
      <div class="panel-shell">
        <div class="panel-head">
          <div>
            <h2>Playback Console</h2>
            <p>Replay the recorded scenario against the active tab using the strongest locator match available.</p>
          </div>
        </div>
        <div class="playback-controls">
          <button id="playbackBtn" class="btn btn-primary" disabled>Play Test</button>
          <button id="stopPlaybackBtn" class="btn btn-danger" disabled>Stop</button>
        </div>
        <div class="playback-options">
          <label>Speed:
            <select id="playbackSpeed" class="select-field">
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="0.5">0.5x</option>
            </select>
          </label>
        </div>
        <div id="playbackResults" class="playback-results">
          <div class="empty-state">Playback results will appear here.</div>
        </div>
      </div>
    </div>

    <div class="tab-content" id="settings">
      <div class="settings-grid">
        <div class="panel-shell">
          <div class="panel-head">
            <div>
              <h2>Workspace Settings</h2>
              <p>Keep the recorder tuned for your workflow.</p>
            </div>
          </div>
          <div class="settings-group">
            <h3>Screenshot quality</h3>
            <select id="screenshotQuality" class="select-field">
              <option value="high">High</option>
              <option value="medium" selected>Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div class="settings-group">
            <h3>Saved sessions</h3>
            <button id="saveTestBtn" class="btn btn-secondary">Save Test Case</button>
            <button id="loadTestBtn" class="btn btn-secondary">Load by Name</button>
          </div>
        </div>
        <div class="panel-shell">
          <div class="panel-head">
            <div>
              <h2>Saved Test Cases</h2>
              <p>Reload previous recorder sessions instantly.</p>
            </div>
          </div>
          <div id="savedTests" class="saved-tests">
            <div class="empty-state">No saved test cases yet.</div>
          </div>
        </div>
      </div>
    </div>

    <div id="notifications" class="notifications"></div>
  </div>
`;

let isRecording = false;
let isPaused = false;
let recordedActions = [];
let recordedAssertions = [];
let networkRequests = [];
let screenshots = [];
let currentTabId = null;
let isPlaying = false;

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Tab switching
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Recording controls
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const pauseBtn = document.getElementById('pauseBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const previewBtn = document.getElementById('previewBtn');
const clearBtn = document.getElementById('clearBtn');
const formatSelect = document.getElementById('formatSelect');
const statusEl = document.getElementById('status');
const actionCountEl = document.getElementById('actionCount');
const screenshotCountEl = document.getElementById('screenshotCount');
const networkCountEl = document.getElementById('networkCount');
const scriptPreview = document.getElementById('scriptPreview');
const notifications = document.getElementById('notifications');
const recordedStepsList = document.getElementById('recordedStepsList');
const networkList = document.getElementById('networkList');

// Assertion controls
const addAssertionBtn = document.getElementById('addAssertionBtn');
const assertionsList = document.getElementById('assertionsList');

// Playback controls
const playbackBtn = document.getElementById('playbackBtn');
const stopPlaybackBtn = document.getElementById('stopPlaybackBtn');
const playbackResults = document.getElementById('playbackResults');

// Settings
const saveTestBtn = document.getElementById('saveTestBtn');
const loadTestBtn = document.getElementById('loadTestBtn');
const testCaseNameInput = document.getElementById('testCaseName');
const projectNameInput = document.getElementById('projectName');
const recordTargetModeSelect = document.getElementById('recordTargetMode');
const freshBrowserUrlInput = document.getElementById('freshBrowserUrl');
const recordTargetHint = document.getElementById('recordTargetHint');
const savedTests = document.getElementById('savedTests');
const stepCounterBadge = document.getElementById('stepCounterBadge');
const contextBrowserEl = document.getElementById('contextBrowser');
const contextOsEl = document.getElementById('contextOs');
const contextViewportEl = document.getElementById('contextViewport');
const contextClockEl = document.getElementById('contextClock');
const launchInspectorQuickBtn = document.getElementById('launchInspectorQuick');
const launchInspectorBtn = document.getElementById('launchInspectorBtn');
const startInspectorBtn = document.getElementById('startInspectorBtn');
const stopInspectorBtn = document.getElementById('stopInspectorBtn');
const inspectorSummaryCard = document.getElementById('inspectorSummaryCard');
const apiMethodSelect = document.getElementById('apiMethod');
const apiUrlInput = document.getElementById('apiUrl');
const apiHeadersList = document.getElementById('apiHeadersList');
const apiBodyInput = document.getElementById('apiBody');
const apiHistoryList = document.getElementById('apiHistory');
const apiStatusBadge = document.getElementById('apiStatusBadge');
const apiDurationEl = document.getElementById('apiDuration');
const apiBytesEl = document.getElementById('apiBytes');
const apiResponseOutput = document.getElementById('apiResponseOutput');
const apiHeadersOutput = document.getElementById('apiHeadersOutput');
const addHeaderBtn = document.getElementById('addHeaderBtn');
const sendApiBtn = document.getElementById('sendApiBtn');
const saveApiPresetBtn = document.getElementById('saveApiPresetBtn');
const copyApiResponseBtn = document.getElementById('copyApiResponseBtn');

startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);
pauseBtn.addEventListener('click', togglePause);
downloadBtn.addEventListener('click', downloadScript);
copyBtn.addEventListener('click', copyToClipboard);
previewBtn.addEventListener('click', previewScript);
clearBtn.addEventListener('click', clearRecording);
formatSelect.addEventListener('change', updatePreview);
addAssertionBtn.addEventListener('click', addAssertion);
playbackBtn.addEventListener('click', playbackTest);
stopPlaybackBtn.addEventListener('click', stopPlayback);
saveTestBtn.addEventListener('click', saveTestCase);
loadTestBtn.addEventListener('click', loadTestCase);
['includeScreenshots', 'includeNetwork', 'includeAssertions'].forEach((id) => {
  document.getElementById(id)?.addEventListener('change', () => {
    if (scriptPreview.value) {
      updatePreview();
    }
  });
});
[
  launchInspectorQuickBtn,
  launchInspectorBtn,
  startInspectorBtn
].forEach((button) => button?.addEventListener('click', () => {
  void launchInspectorMode();
}));
stopInspectorBtn?.addEventListener('click', () => {
  void stopInspectorMode();
});
addHeaderBtn?.addEventListener('click', () => addHeaderRow());
sendApiBtn?.addEventListener('click', () => {
  void executeApiRequest();
});
saveApiPresetBtn?.addEventListener('click', () => {
  void persistApiState(true);
});
copyApiResponseBtn?.addEventListener('click', () => {
  copyPlainText(apiResponseOutput?.textContent || '', 'Response copied to clipboard.');
});
recordTargetModeSelect?.addEventListener('change', updateRecordingTargetUi);
['input', 'change'].forEach((eventName) => {
  apiMethodSelect?.addEventListener(eventName, () => { void persistApiState(); });
  apiUrlInput?.addEventListener(eventName, () => { void persistApiState(); });
  apiBodyInput?.addEventListener(eventName, () => { void persistApiState(); });
});
document.addEventListener('click', (event) => {
  const copyButton = event.target.closest('[data-copy-value]');
  if (copyButton) {
    copyPlainText(copyButton.getAttribute('data-copy-value') || '', 'Locator copied to clipboard.');
  }
});

function sendRuntimeMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve(response);
    });
  });
}

function sendTabMessage(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve(response);
    });
  });
}

function isRestrictedRecordingUrl(url = '') {
  return /^(chrome|edge|about|brave|vivaldi|opera):\/\//i.test(url)
    || /^chrome-extension:\/\//i.test(url)
    || /^https:\/\/chromewebstore\.google\.com/i.test(url);
}

function insertContentScript(tabId) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId, allFrames: true },
        files: ['content.js']
      },
      () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        resolve();
      }
    );
  });
}

function insertContentStyles(tabId) {
  return new Promise((resolve, reject) => {
    chrome.scripting.insertCSS(
      {
        target: { tabId, allFrames: true },
        files: ['content.css']
      },
      () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        resolve();
      }
    );
  });
}

async function ensureRecorderReady(tab) {
  if (!tab?.id) {
    throw new Error('No active browser tab is available for recording.');
  }

  if (isRestrictedRecordingUrl(tab.url || '')) {
    throw new Error('Recording is not available on browser internal pages. Open a regular website and try again.');
  }

  try {
    await sendTabMessage(tab.id, { action: 'ping' });
    return;
  } catch (error) {
    if (!error.message.includes('Receiving end does not exist')) {
      throw error;
    }
  }

  await insertContentStyles(tab.id);
  await insertContentScript(tab.id);
  await sendTabMessage(tab.id, { action: 'ping' });
}

function updateRecordingTargetUi() {
  const isNewBrowserMode = recordTargetModeSelect?.value === 'new';
  freshBrowserUrlInput?.classList.toggle('hidden', !isNewBrowserMode);
  if (recordTargetHint) {
    recordTargetHint.textContent = isNewBrowserMode
      ? 'A fresh browser window will open with this URL, then recording will start there.'
      : 'Recording will attach to the last active normal browser tab instead of the extension window.';
  }
}

function waitForTabComplete(tabId, timeoutMs = 12000) {
  return new Promise((resolve) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        chrome.tabs.onUpdated.removeListener(handleUpdated);
        resolve();
      }
    }, timeoutMs);

    const handleUpdated = (updatedTabId, changeInfo) => {
      if (updatedTabId !== tabId) {
        return;
      }

      if (changeInfo.status === 'complete' && !settled) {
        settled = true;
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(handleUpdated);
        resolve();
      }
    };

    chrome.tabs.onUpdated.addListener(handleUpdated);
  });
}

async function getPreparedBrowserTab(mode = 'existing', url = '') {
  const response = await sendRuntimeMessage({
    action: 'prepareRecordingTarget',
    data: { mode, url }
  });

  if (!response?.success || !response.data?.tabId) {
    throw new Error(response?.error || 'Unable to prepare a browser tab.');
  }

  if (mode === 'new') {
    await waitForTabComplete(response.data.tabId);
  }

  const tab = await chrome.tabs.get(response.data.tabId);
  if (!tab?.id) {
    throw new Error('Browser tab is no longer available.');
  }

  return tab;
}

async function loadRecordingSession() {
  try {
    const response = await sendRuntimeMessage({ action: 'getRecordingSession' });
    if (response?.data) {
      applyRecordingSession(response.data);
    } else {
      updateUI();
    }
  } catch (error) {
    console.warn('Unable to load recording session:', error);
    updateUI();
  }
}

function applyRecordingSession(session = {}) {
  recordedActions = session.actions || [];
  recordedAssertions = session.assertions || [];
  networkRequests = session.networkRequests || [];
  screenshots = session.screenshots || [];
  isRecording = Boolean(session.isRecording);
  isPaused = Boolean(session.isPaused);
  currentTabId = session.currentTabId || null;
  updateUI();
}

async function persistRecordingSession(overrides = {}) {
  try {
    await sendRuntimeMessage({
      action: 'setRecordingSession',
      data: {
        actions: recordedActions,
        assertions: recordedAssertions,
        networkRequests,
        screenshots,
        isRecording,
        isPaused,
        currentTabId,
        ...overrides
      }
    });
  } catch (error) {
    console.warn('Unable to persist recording session:', error);
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatActionSummary(action) {
  const selector = action?.displayName || action?.selector?.value || 'Unknown element';

  switch (action?.type) {
    case 'click':
      return `Click ${selector}`;
    case 'type':
      return `Type "${action.value || ''}" into ${selector}`;
    case 'change':
      return `Change ${selector} to "${action.value || ''}"`;
    case 'submit':
      return `Submit form ${selector}`;
    case 'dragDrop':
      return `Drag ${selector} to ${action.targetDisplayName || action.targetSelector?.value || 'drop target'}`;
    case 'wait':
      return `Wait ${action.duration || 0}ms`;
    default:
      return `${action?.type || 'step'} on ${selector}`;
  }
}

function formatActionMeta(action) {
  const strategy = action?.selector?.strategy ? `${action.selector.strategy}: ` : '';
  const location = action?.url ? ` • ${action.url}` : '';
  return `${strategy}${action?.selector?.value || ''}${location}`.trim();
}

function formatAlternativeLocators(action) {
  const locators = Array.isArray(action?.alternativeLocators) ? action.alternativeLocators : [];
  return locators
    .slice(0, 5)
    .map((locator) => `${locator.type || locator.strategy}: ${locator.value}`)
    .join('\n');
}

function renderLocatorChips(action) {
  const locators = Array.isArray(action?.alternativeLocators) ? action.alternativeLocators : [];
  if (!locators.length) {
    return '';
  }

  return `
    <div class="locator-chip-row">
      ${locators.slice(0, 3).map((locator) => (
        `<span class="locator-chip" title="${escapeHtml(locator.value)}">${escapeHtml(locator.type || locator.strategy)} ${escapeHtml(locator.confidence || '')}</span>`
      )).join('')}
    </div>
  `;
}

function renderRecordedActions() {
  recordedStepsList.innerHTML = '';

  if (!recordedActions.length) {
    recordedStepsList.innerHTML = '<div class="empty-state">Recorded steps will appear here as you interact with the page.</div>';
    return;
  }

  recordedActions.forEach((action, index) => {
    const item = document.createElement('div');
    item.className = 'recorded-step-item';
    const previewMarkup = action.previewDataUrl
      ? `<img class="step-preview-image" src="${escapeHtml(action.previewDataUrl)}" alt="${escapeHtml(action.displayName || 'Step preview')}">`
      : '';
    item.innerHTML = `
      <div class="item-header">
        <strong>Step ${index + 1}</strong>
        <span class="item-badge">${escapeHtml((action.type || 'step').toUpperCase())}</span>
      </div>
      <div class="step-body">
        ${previewMarkup}
        <div class="step-copy">
          <div class="step-summary">${escapeHtml(formatActionSummary(action))}</div>
          <div class="step-meta">${escapeHtml(formatActionMeta(action))}</div>
          ${renderLocatorChips(action)}
        </div>
      </div>
    `;
    recordedStepsList.appendChild(item);
  });

  recordedStepsList.scrollTop = recordedStepsList.scrollHeight;
}

function renderNetworkList() {
  networkList.innerHTML = '';

  if (!networkRequests.length) {
    networkList.innerHTML = '<div class="empty-state">Captured API calls will appear here while recording.</div>';
    return;
  }

  networkRequests.forEach((call) => addNetworkItem(call));
}

async function startRecording() {
  try {
    const targetMode = recordTargetModeSelect?.value || 'existing';
    const tab = await getPreparedBrowserTab(targetMode, freshBrowserUrlInput?.value || '');
    await ensureRecorderReady(tab);

    currentTabId = tab.id;
    isRecording = true;
    isPaused = false;
    recordedActions = [];
    recordedAssertions = [];
    networkRequests = [];
    screenshots = [];
    updateUI();

    await sendRuntimeMessage({
      action: 'startRecordingSession',
      data: { currentTabId }
    });

    await sendTabMessage(currentTabId, {
      action: 'startRecording',
      options: {
        captureScreenshots: document.getElementById('captureScreenshots').checked,
        captureNetwork: document.getElementById('captureNetwork').checked,
        recordWaits: document.getElementById('recordWaits').checked,
        recordAssertions: document.getElementById('recordAssertions').checked
      }
    });

    await refreshContextStrip();
    showNotification(
      targetMode === 'new'
        ? 'New browser window opened and recording started.'
        : 'Recording started on existing browser tab.',
      'success'
    );
  } catch (error) {
    isRecording = false;
    isPaused = false;
    currentTabId = null;
    updateUI();
    showNotification(`Unable to start recording: ${error.message}`, 'error');
  }
}

async function stopRecording() {
  isRecording = false;
  isPaused = false;

  if (currentTabId) {
    try {
      await sendTabMessage(currentTabId, { action: 'stopRecording' });
    } catch (error) {
      console.warn('Unable to notify content script to stop recording:', error);
    }
  }

  await sendRuntimeMessage({ action: 'stopRecordingSession' });
  updateUI();
  updatePreview();
  showNotification('⏹ Recording stopped!', 'success');
}

async function togglePause() {
  isPaused = !isPaused;
  updateUI();

  if (currentTabId) {
    try {
      await sendTabMessage(currentTabId, { action: isPaused ? 'pauseRecording' : 'resumeRecording' });
    } catch (error) {
      console.warn('Unable to notify content script about pause state:', error);
    }
  }

  await sendRuntimeMessage({ action: isPaused ? 'pauseRecordingSession' : 'resumeRecordingSession' });
}

async function clearRecording() {
  if (confirm('Clear all recorded actions? This cannot be undone.')) {
    isRecording = false;
    isPaused = false;
    currentTabId = null;
    recordedActions = [];
    recordedAssertions = [];
    networkRequests = [];
    screenshots = [];
    scriptPreview.value = '';
    assertionsList.innerHTML = '';
    await sendRuntimeMessage({ action: 'clearRecordingSession' });
    updateUI();
    showNotification('✓ Recording cleared!', 'success');
  }
}

function addAssertion() {
  const assertionHtml = `
    <div class="assertion-item">
      <div class="item-header">
        <select class="assertion-type" style="flex:1; margin-right:8px;">
          <option value="text">Text Contains</option>
          <option value="visible">Element Visible</option>
          <option value="url">URL Equals</option>
          <option value="title">Title Equals</option>
          <option value="network">Network Status</option>
        </select>
        <button class="remove-btn" onclick="this.parentElement.parentElement.remove()">Remove</button>
      </div>
      <input type="text" class="assertion-value input-field" placeholder="Expected value" style="margin-bottom:8px;">
    </div>
  `;
  assertionsList.innerHTML += assertionHtml;
  showNotification('✓ Assertion added!', 'success');
}

function previewScript() {
  updatePreview();
  showNotification('✓ Preview updated!', 'success');
}

function getExportPayload() {
  return {
    actions: recordedActions,
    assertions: document.getElementById('includeAssertions').checked ? recordedAssertions : [],
    networkCalls: document.getElementById('includeNetwork').checked ? networkRequests : [],
    screenshots: document.getElementById('includeScreenshots').checked ? screenshots : []
  };
}

function getExportFileBaseName() {
  return testCaseNameInput.value?.replace(/\s+/g, '_') || 'test_script';
}

function formatExportTimestamp(timestamp) {
  if (!timestamp) {
    return '';
  }

  return new Date(timestamp).toLocaleString();
}

function updatePreview() {
  const format = formatSelect.value;
  const payload = getExportPayload();

  if (format === 'excel') {
    scriptPreview.value = generateExcelPreview(payload);
    return;
  }

  const script = generateScript(
    format,
    payload.actions,
    payload.assertions,
    payload.networkCalls
  );
  scriptPreview.value = script;
}

function generateExcelPreview(payload) {
  const sections = [
    `Workbook: ${testCaseNameInput.value || 'Recorded Test'}`,
    `Project: ${projectNameInput.value || 'Default'}`,
    `Actions: ${payload.actions.length}`,
    `Assertions: ${payload.assertions.length}`,
    `Network Calls: ${payload.networkCalls.length}`,
    `Screenshots: ${payload.screenshots.length}`,
    '',
    'Sheets:',
    '- Summary',
    '- Actions'
  ];

  if (payload.assertions.length) {
    sections.push('- Assertions');
  }

  if (payload.networkCalls.length) {
    sections.push('- Network');
  }

  if (payload.screenshots.length) {
    sections.push('- Screenshots');
  }

  if (payload.actions.length) {
    sections.push('');
    sections.push('First Actions Preview:');
    payload.actions.slice(0, 5).forEach((action, index) => {
      sections.push(
        `${index + 1}. ${action.type || 'step'} | ${action.selector?.value || ''} | ${formatExportTimestamp(action.timestamp)}`
      );
    });
  }

  return sections.join('\n');
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getExcelCellType(value) {
  return typeof value === 'number' && Number.isFinite(value) ? 'Number' : 'String';
}

function createWorksheetXml(name, headers, rows) {
  const headerCells = headers.map((header) => (
    `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`
  )).join('');

  const rowXml = rows.map((row) => {
    const cells = row.map((cell) => (
      `<Cell><Data ss:Type="${getExcelCellType(cell)}">${escapeXml(cell)}</Data></Cell>`
    )).join('');
    return `<Row>${cells}</Row>`;
  }).join('');

  return `
    <Worksheet ss:Name="${escapeXml(name)}">
      <Table>
        <Row>${headerCells}</Row>
        ${rowXml}
      </Table>
    </Worksheet>
  `;
}

function buildExcelWorkbookXml(payload) {
  const worksheets = [];

  worksheets.push(createWorksheetXml(
    'Summary',
    ['Field', 'Value'],
    [
      ['Test Case', testCaseNameInput.value || 'Recorded Test'],
      ['Project', projectNameInput.value || 'Default'],
      ['Exported At', new Date().toLocaleString()],
      ['Actions', payload.actions.length],
      ['Assertions', payload.assertions.length],
      ['Network Calls', payload.networkCalls.length],
      ['Screenshots', payload.screenshots.length]
    ]
  ));

  worksheets.push(createWorksheetXml(
    'Actions',
    ['Step', 'Type', 'Selector Strategy', 'Selector Value', 'Value', 'Input Type', 'Tag', 'URL', 'Timestamp'],
    payload.actions.map((action, index) => ([
      index + 1,
      action.type || '',
      action.selector?.strategy || '',
      action.selector?.value || '',
      action.value || '',
      action.inputType || '',
      action.tagName || '',
      action.url || '',
      formatExportTimestamp(action.timestamp)
    ]))
  ));

  if (payload.assertions.length) {
    worksheets.push(createWorksheetXml(
      'Assertions',
      ['#', 'Type', 'Value'],
      payload.assertions.map((assertion, index) => ([
        index + 1,
        assertion.type || '',
        assertion.value || ''
      ]))
    ));
  }

  if (payload.networkCalls.length) {
    worksheets.push(createWorksheetXml(
      'Network',
      ['#', 'Method', 'URL', 'Status', 'Duration (ms)', 'Error', 'Timestamp'],
      payload.networkCalls.map((call, index) => ([
        index + 1,
        call.method || '',
        call.url || '',
        call.status ?? '',
        call.duration ?? '',
        call.error || '',
        formatExportTimestamp(call.timestamp)
      ]))
    ));
  }

  if (payload.screenshots.length) {
    worksheets.push(createWorksheetXml(
      'Screenshots',
      ['#', 'URL', 'Timestamp'],
      payload.screenshots.map((shot, index) => ([
        index + 1,
        shot.url || '',
        formatExportTimestamp(shot.timestamp)
      ]))
    ));
  }

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook
  xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#E5E7EB" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  ${worksheets.join('\n')}
</Workbook>`;
}

function getExcelColumnName(index) {
  let column = '';
  let current = index + 1;

  while (current > 0) {
    const remainder = (current - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    current = Math.floor((current - 1) / 26);
  }

  return column;
}

function createXlsxSheetXml(headers, rows) {
  const allRows = [headers, ...rows];
  const rowXml = allRows.map((row, rowIndex) => {
    const cells = row.map((cell, columnIndex) => {
      const address = `${getExcelColumnName(columnIndex)}${rowIndex + 1}`;
      const value = escapeXml(cell);
      return `<c r="${address}" t="inlineStr"><is><t>${value}</t></is></c>`;
    }).join('');
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rowXml}</sheetData>
</worksheet>`;
}

function buildXlsxSheets(payload) {
  const sheets = [
    {
      name: 'Summary',
      headers: ['Field', 'Value'],
      rows: [
        ['Test Case', testCaseNameInput.value || 'Recorded Test'],
        ['Project', projectNameInput.value || 'Default'],
        ['Exported At', new Date().toLocaleString()],
        ['Actions', payload.actions.length],
        ['Assertions', payload.assertions.length],
        ['Network Calls', payload.networkCalls.length],
        ['Screenshots', payload.screenshots.length]
      ]
    },
    {
      name: 'Actions',
      headers: ['Step', 'Action', 'Business Label', 'Primary Strategy', 'Primary Locator', 'Alternative Locators', 'Target Label', 'Target Locator', 'Value', 'Initial Value', 'Input Type', 'Commit Trigger', 'Tag', 'URL', 'Timestamp'],
      rows: payload.actions.map((action, index) => ([
        index + 1,
        action.type || '',
        action.displayName || '',
        action.selector?.strategy || '',
        action.selector?.value || '',
        formatAlternativeLocators(action),
        action.targetDisplayName || '',
        action.targetSelector?.value || '',
        action.value || '',
        action.initialValue || '',
        action.inputType || '',
        action.inputCommit || '',
        action.tagName || '',
        action.url || '',
        formatExportTimestamp(action.timestamp)
      ]))
    }
  ];

  if (payload.assertions.length) {
    sheets.push({
      name: 'Assertions',
      headers: ['#', 'Type', 'Value'],
      rows: payload.assertions.map((assertion, index) => ([
        index + 1,
        assertion.type || '',
        assertion.value || ''
      ]))
    });
  }

  if (payload.networkCalls.length) {
    sheets.push({
      name: 'Network',
      headers: ['#', 'Method', 'URL', 'Status', 'Duration (ms)', 'Error', 'Timestamp'],
      rows: payload.networkCalls.map((call, index) => ([
        index + 1,
        call.method || '',
        call.url || '',
        call.status ?? '',
        call.duration ?? '',
        call.error || '',
        formatExportTimestamp(call.timestamp)
      ]))
    });
  }

  if (payload.screenshots.length) {
    sheets.push({
      name: 'Screenshots',
      headers: ['#', 'URL', 'Timestamp'],
      rows: payload.screenshots.map((shot, index) => ([
        index + 1,
        shot.url || '',
        formatExportTimestamp(shot.timestamp)
      ]))
    });
  }

  return sheets;
}

function createCrc32Table() {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let value = i;
    for (let j = 0; j < 8; j++) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value >>> 0;
  }
  return table;
}

const crc32Table = createCrc32Table();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = crc32Table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(buffer, offset, value) {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >>> 8) & 0xff;
}

function writeUint32(buffer, offset, value) {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >>> 8) & 0xff;
  buffer[offset + 2] = (value >>> 16) & 0xff;
  buffer[offset + 3] = (value >>> 24) & 0xff;
}

function concatUint8Arrays(parts) {
  const totalLength = parts.reduce((total, part) => total + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;

  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });

  return output;
}

function createZipArchive(entries) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  entries.forEach((entry) => {
    const nameBytes = encoder.encode(entry.name);
    const dataBytes = typeof entry.content === 'string' ? encoder.encode(entry.content) : entry.content;
    const checksum = crc32(dataBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    writeUint32(localHeader, 0, 0x04034b50);
    writeUint16(localHeader, 4, 20);
    writeUint16(localHeader, 8, 0);
    writeUint32(localHeader, 14, checksum);
    writeUint32(localHeader, 18, dataBytes.length);
    writeUint32(localHeader, 22, dataBytes.length);
    writeUint16(localHeader, 26, nameBytes.length);
    localHeader.set(nameBytes, 30);
    localParts.push(localHeader, dataBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    writeUint32(centralHeader, 0, 0x02014b50);
    writeUint16(centralHeader, 4, 20);
    writeUint16(centralHeader, 6, 20);
    writeUint32(centralHeader, 16, checksum);
    writeUint32(centralHeader, 20, dataBytes.length);
    writeUint32(centralHeader, 24, dataBytes.length);
    writeUint16(centralHeader, 28, nameBytes.length);
    writeUint32(centralHeader, 42, offset);
    centralHeader.set(nameBytes, 46);
    centralParts.push(centralHeader);

    offset += localHeader.length + dataBytes.length;
  });

  const centralDirectory = concatUint8Arrays(centralParts);
  const endRecord = new Uint8Array(22);
  writeUint32(endRecord, 0, 0x06054b50);
  writeUint16(endRecord, 8, entries.length);
  writeUint16(endRecord, 10, entries.length);
  writeUint32(endRecord, 12, centralDirectory.length);
  writeUint32(endRecord, 16, offset);

  return concatUint8Arrays([...localParts, centralDirectory, endRecord]);
}

function buildXlsxWorkbook(payload) {
  const sheets = buildXlsxSheets(payload);
  const sheetDefs = sheets.map((sheet, index) => (
    `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`
  )).join('');
  const workbookRels = sheets.map((sheet, index) => (
    `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
  )).join('');
  const worksheetOverrides = sheets.map((sheet, index) => (
    `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  )).join('');

  const entries = [
    {
      name: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  ${worksheetOverrides}
</Types>`
    },
    {
      name: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
    },
    {
      name: 'xl/workbook.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${sheetDefs}</sheets>
</workbook>`
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${workbookRels}
</Relationships>`
    },
    ...sheets.map((sheet, index) => ({
      name: `xl/worksheets/sheet${index + 1}.xml`,
      content: createXlsxSheetXml(sheet.headers, sheet.rows)
    }))
  ];

  return createZipArchive(entries);
}

function generateScript(format, actions, assertions, networkCalls) {
  switch (format) {
    case 'selenium-python':
      return generateSeleniumPython(actions, assertions, networkCalls);
    case 'selenium-java':
      return generateSeleniumJava(actions, assertions, networkCalls);
    case 'cypress':
      return generateCypress(actions, assertions, networkCalls);
    case 'playwright-python':
      return generatePlaywrightPython(actions, assertions, networkCalls);
    case 'playwright-js':
      return generatePlaywrightJS(actions, assertions, networkCalls);
    case 'testng':
      return generateTestNG(actions, assertions, networkCalls);
    case 'robot':
      return generateRobotFramework(actions, assertions, networkCalls);
    case 'protractor':
      return generateProtractor(actions, assertions, networkCalls);
    case 'json':
      return JSON.stringify({ actions, assertions, networkCalls }, null, 2);
    default:
      return '';
  }
}

function generateSeleniumPython(actions, assertions, networkCalls) {
  let script = `# Test Case: ${testCaseNameInput.value || 'Recorded Test'}
# Project: ${projectNameInput.value || 'Default'}
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
import time
import pytest

class Test${testCaseNameInput.value?.replace(/\s+/g, '') || 'RecordedTest'}:
    def setup_method(self):
        self.driver = webdriver.Chrome()
        self.wait = WebDriverWait(self.driver, 10)

    def test_recorded_scenario(self):
        """Recorded test scenario with ${actions.length} steps"""
`;

  if (actions.length > 0) {
    script += `        self.driver.get("${actions[0].url}")
`;
  }

  actions.forEach((action, idx) => {
    switch (action.type) {
      case 'click':
        script += `        # Step ${idx + 1}: Click element
        element = self.wait.until(EC.presence_of_element_located((By.${action.selector.strategy}, "${action.selector.value}")))
        element.click()
`;
        break;
      case 'type':
        script += `        # Step ${idx + 1}: Type text
        element = self.driver.find_element(By.${action.selector.strategy}, "${action.selector.value}")
        element.clear()
        element.send_keys("${action.value}")
`;
        break;
      case 'wait':
        script += `        # Step ${idx + 1}: Wait
        time.sleep(${(action.duration / 1000).toFixed(1)})
`;
        break;
    }
  });

  if (assertions.length > 0) {
    script += `        # Assertions
`;
    assertions.forEach((assertion, idx) => {
      switch (assertion.type) {
        case 'text':
          script += `        assert "${assertion.value}" in self.driver.page_source, f"Text '${assertion.value}' not found"
`;
          break;
        case 'url':
          script += `        assert self.driver.current_url == "${assertion.value}", f"URL mismatch: expected '${assertion.value}', got '{self.driver.current_url}'"
`;
          break;
      }
    });
  }

  script += `    def teardown_method(self):
        self.driver.quit()

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
`;

  return script;
}

function generateSeleniumJava(actions, assertions, networkCalls) {
  let script = `// Test Case: ${testCaseNameInput.value || 'Recorded Test'}
// Project: ${projectNameInput.value || 'Default'}
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.junit.Before;
import org.junit.After;
import org.junit.Test;
import static org.junit.Assert.*;

public class ${testCaseNameInput.value?.replace(/\s+/g, '') || 'RecordedTest'} {
    private WebDriver driver;
    private WebDriverWait wait;

    @Before
    public void setUp() {
        System.setProperty("webdriver.chrome.driver", "/path/to/chromedriver");
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, 10);
    }

    @Test
    public void testRecordedScenario() throws InterruptedException {
`;

  if (actions.length > 0) {
    script += `        driver.get("${actions[0].url}");
`;
  }

  actions.forEach((action, idx) => {
    switch (action.type) {
      case 'click':
        script += `        // Step ${idx + 1}: Click
        WebElement element${idx} = wait.until(ExpectedConditions.presenceOfElementLocated(By.${action.selector.strategy}("${action.selector.value}")));
        element${idx}.click();
`;
        break;
      case 'type':
        script += `        // Step ${idx + 1}: Type
        WebElement field${idx} = driver.findElement(By.${action.selector.strategy}("${action.selector.value}"));
        field${idx}.clear();
        field${idx}.sendKeys("${action.value}");
`;
        break;
    }
  });

  if (assertions.length > 0) {
    script += `        // Assertions
`;
    assertions.forEach(assertion => {
      if (assertion.type === 'text') {
        script += `        assertTrue(driver.getPageSource().contains("${assertion.value}"));
`;
      }
    });
  }

  script += `    }

    @After
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
`;

  return script;
}

function generateCypress(actions, assertions, networkCalls) {
  let script = `// Test Case: ${testCaseNameInput.value || 'Recorded Test'}
// Project: ${projectNameInput.value || 'Default'}

describe('${projectNameInput.value || 'Test Suite'}', () => {
  beforeEach(() => {
    cy.visit('${actions[0]?.url || 'https://example.com'}')
  })

  it('${testCaseNameInput.value || 'should complete recorded actions'}', () => {
`;

  actions.forEach((action, idx) => {
    switch (action.type) {
      case 'click':
        script += `    cy.get('${action.selector.value}').click() // Step ${idx + 1}
`;
        break;
      case 'type':
        script += `    cy.get('${action.selector.value}').type('${action.value}') // Step ${idx + 1}
`;
        break;
      case 'wait':
        script += `    cy.wait(${action.duration}) // Step ${idx + 1}
`;
        break;
    }
  });

  if (assertions.length > 0) {
    script += `    // Assertions
`;
    assertions.forEach((assertion, idx) => {
      switch (assertion.type) {
        case 'text':
          script += `    cy.contains('${assertion.value}').should('exist')
`;
          break;
        case 'url':
          script += `    cy.url().should('eq', '${assertion.value}')
`;
          break;
      }
    });
  }

  script += `  })
})
`;

  return script;
}

function generatePlaywrightPython(actions, assertions, networkCalls) {
  let script = `# Test Case: ${testCaseNameInput.value || 'Recorded Test'}
# Project: ${projectNameInput.value || 'Default'}
from playwright.sync_api import sync_playwright
import pytest

def test_${testCaseNameInput.value?.toLowerCase().replace(/\s+/g, '_') || 'recorded_test'}():
    """Recorded test scenario with ${actions.length} steps"""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to starting URL
        page.goto('${actions[0]?.url || 'https://example.com'}')

`;

  actions.forEach((action, idx) => {
    switch (action.type) {
      case 'click':
        script += `        # Step ${idx + 1}: Click
        page.click('${action.selector.value}')
`;
        break;
      case 'type':
        script += `        # Step ${idx + 1}: Type
        page.fill('${action.selector.value}', '${action.value}')
`;
        break;
      case 'wait':
        script += `        # Step ${idx + 1}: Wait
        page.wait_for_timeout(${action.duration})
`;
        break;
    }
  });

  if (assertions.length > 0) {
    script += `        # Assertions
`;
    assertions.forEach(assertion => {
      if (assertion.type === 'text') {
        script += `        assert '${assertion.value}' in page.content()
`;
      }
    });
  }

  script += `        browser.close()

if __name__ == '__main__':
    test_${testCaseNameInput.value?.toLowerCase().replace(/\s+/g, '_') || 'recorded_test'}()
`;

  return script;
}

function generatePlaywrightJS(actions, assertions, networkCalls) {
  let script = `// Test Case: ${testCaseNameInput.value || 'Recorded Test'}
// Project: ${projectNameInput.value || 'Default'}
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to starting URL
    await page.goto('${actions[0]?.url || 'https://example.com'}');

`;

  actions.forEach((action, idx) => {
    switch (action.type) {
      case 'click':
        script += `    // Step ${idx + 1}: Click
    await page.click('${action.selector.value}');
`;
        break;
      case 'type':
        script += `    // Step ${idx + 1}: Type
    await page.fill('${action.selector.value}', '${action.value}');
`;
        break;
    }
  });

  script += `  } finally {
    await browser.close();
  }
})();
`;

  return script;
}

function generateTestNG(actions, assertions, networkCalls) {
  let script = `// TestNG Test Case: ${testCaseNameInput.value || 'Recorded Test'}
// Project: ${projectNameInput.value || 'Default'}
import org.testng.annotations.*;
import org.testng.Assert;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;

@Test
public class ${testCaseNameInput.value?.replace(/\s+/g, '') || 'RecordedTest'} {

    private WebDriver driver;

    @BeforeMethod
    public void setUp() {
        System.setProperty("webdriver.chrome.driver", "/path/to/chromedriver");
        driver = new ChromeDriver();
    }

    @org.testng.annotations.Test
    public void testRecordedScenario() throws InterruptedException {
        driver.navigate().to("${actions[0]?.url || 'https://example.com'}");
`;

  actions.forEach((action, idx) => {
    switch (action.type) {
      case 'click':
        script += `        // Step ${idx + 1}: Click
        driver.findElement(By.xpath("${action.selector.value}")).click();
`;
        break;
      case 'type':
        script += `        // Step ${idx + 1}: Type
        driver.findElement(By.xpath("${action.selector.value}")).sendKeys("${action.value}");
`;
        break;
    }
  });

  script += `    }

    @AfterMethod
    public void tearDown() {
        driver.quit();
    }
}
`;

  return script;
}

function generateRobotFramework(actions, assertions, networkCalls) {
  let script = `*** Settings ***
Library    SeleniumLibrary

*** Test Cases ***
${testCaseNameInput.value || 'Recorded Test'}
    Open Browser    ${actions[0]?.url || 'https://example.com'}    chrome
`;

  actions.forEach((action, idx) => {
    switch (action.type) {
      case 'click':
        script += `    Click Element    xpath=${action.selector.value}
`;
        break;
      case 'type':
        script += `    Input Text    xpath=${action.selector.value}    ${action.value}
`;
        break;
    }
  });

  script += `    Close Browser
`;

  return script;
}

function generateProtractor(actions, assertions, networkCalls) {
  let script = `// Protractor Test Case: ${testCaseNameInput.value || 'Recorded Test'}

describe('${projectNameInput.value || 'Test Suite'}', function() {
  beforeEach(function() {
    browser.get('${actions[0]?.url || 'https://example.com'}');
  });

  it('${testCaseNameInput.value || 'should complete recorded actions'}', function() {
`;

  actions.forEach((action, idx) => {
    switch (action.type) {
      case 'click':
        script += `    // Step ${idx + 1}: Click
    element(by.xpath('${action.selector.value}')).click();
`;
        break;
      case 'type':
        script += `    // Step ${idx + 1}: Type
    element(by.xpath('${action.selector.value}')).sendKeys('${action.value}');
`;
        break;
    }
  });

  script += `  });
});
`;

  return script;
}

function downloadScript() {
  const format = formatSelect.value;
  const payload = getExportPayload();
  const baseName = getExportFileBaseName();
  const ext = format === 'excel'
    ? 'xlsx'
    : format === 'cypress' || format === 'playwright-js' || format === 'protractor'
      ? 'js'
      : format === 'robot'
        ? 'robot'
        : format === 'json'
          ? 'json'
          : 'py';
  const filename = `${baseName}.${ext}`;

  const fileContents = format === 'excel'
    ? buildXlsxWorkbook(payload)
    : scriptPreview.value;
  const mimeType = format === 'excel'
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    : 'text/plain';

  const blob = new Blob([fileContents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  showNotification(`✓ Downloaded: ${filename}`, 'success');
}

function copyToClipboard() {
  scriptPreview.select();
  document.execCommand('copy');
  showNotification('✓ Copied to clipboard!', 'success');
}

async function playbackTest() {
  if (recordedActions.length === 0) {
    showNotification('No actions to playback!', 'error');
    return;
  }

  if (isRecording) {
    showNotification('Stop recording before playback so replay does not create new steps.', 'warning');
    return;
  }

  isPlaying = true;
  playbackBtn.disabled = true;
  stopPlaybackBtn.disabled = false;
  playbackResults.innerHTML = '<div class="playback-item">▶ Starting playback...</div>';

  const speed = parseFloat(document.getElementById('playbackSpeed').value);

  try {
    const tab = await getPreparedBrowserTab('existing');
    await ensureRecorderReady(tab);

    for (let i = 0; i < recordedActions.length && isPlaying; i++) {
      const action = recordedActions[i];
      const delay = 700 / (speed || 1);
      await new Promise(resolve => setTimeout(resolve, delay));

      if (!isPlaying) break;

      const response = await sendTabMessage(tab.id, {
        action: 'executePlaybackAction',
        data: {
          action,
          timeoutMs: Number(document.getElementById('waitTimeout')?.value || 5000)
        }
      });

      if (!response?.success) {
        addPlaybackResult(action, i + 1, 'fail', response?.error || 'Step failed during playback.');
        showNotification(`Playback failed at step ${i + 1}`, 'error');
        isPlaying = false;
        break;
      }

      const locatorUsed = response.data?.locatorUsed
        ? ` using ${response.data.locatorUsed.type || response.data.locatorUsed.strategy}`
        : '';
      addPlaybackResult(action, i + 1, 'pass', `${formatActionSummary(action)}${locatorUsed}`);
    }

    if (isPlaying) {
      addPlaybackResult(null, recordedActions.length, 'pass', 'Playback completed.');
      showNotification('Playback completed successfully.', 'success');
    }
  } catch (error) {
    addPlaybackResult(null, 0, 'fail', `Playback could not start: ${error.message}`);
    showNotification(`Playback could not start: ${error.message}`, 'error');
  } finally {
    playbackBtn.disabled = !recordedActions.length;
    stopPlaybackBtn.disabled = true;
    isPlaying = false;
  }
}

function stopPlayback() {
  isPlaying = false;
  playbackBtn.disabled = false;
  stopPlaybackBtn.disabled = true;
  addPlaybackResult(null, 0, 'warning', 'Playback stopped by user');
}

function addPlaybackResult(action, stepNum, status, message = '') {
  const result = document.createElement('div');
  result.className = `playback-item ${status}`;
  result.innerHTML = `<strong>Step ${stepNum}:</strong> ${escapeHtml(message || (action?.type?.toUpperCase() + ' - ' + action?.selector?.value))}`;
  playbackResults.appendChild(result);
  playbackResults.scrollTop = playbackResults.scrollHeight;
}

function saveTestCase() {
  const name = testCaseNameInput.value || 'Test_' + Date.now();
  if (!name) {
    showNotification('Please enter a test case name!', 'error');
    return;
  }

  const testCase = {
    name,
    project: projectNameInput.value,
    actions: recordedActions,
    assertions: recordedAssertions,
    networkRequests,
    screenshots,
    savedAt: new Date().toLocaleString()
  };

  chrome.storage.local.get('savedTestCases', (result) => {
    const savedCases = result.savedTestCases || {};
    savedCases[name] = testCase;
    chrome.storage.local.set({ savedTestCases: savedCases }, () => {
      showNotification(`✓ Test case '${name}' saved!`, 'success');
      loadSavedTests();
    });
  });
}

function loadSavedTests() {
  chrome.storage.local.get('savedTestCases', (result) => {
    const cases = result.savedTestCases || {};
    savedTests.innerHTML = '';
    Object.keys(cases).forEach(name => {
      const testCase = cases[name];
      const item = document.createElement('div');
      item.className = 'saved-test-item';
      item.innerHTML = `
        <div class="item-header">
          <div>
            <strong>${name}</strong><br>
            <small>${testCase.project || 'No project'} • ${testCase.savedAt}</small>
          </div>
          <button class="remove-btn" onclick="deleteSavedTest('${name}')">Delete</button>
          <button class="remove-btn" onclick="loadTest('${name}')" style="background:#667eea;margin-right:5px;">Load</button>
        </div>
      `;
      savedTests.appendChild(item);
    });
  });
}

window.loadTest = function(name) {
  chrome.storage.local.get('savedTestCases', (result) => {
    const testCase = result.savedTestCases[name];
    if (testCase) {
      recordedActions = testCase.actions || [];
      recordedAssertions = testCase.assertions || [];
      networkRequests = testCase.networkRequests || [];
      screenshots = testCase.screenshots || [];
      isRecording = false;
      isPaused = false;
      currentTabId = null;
      testCaseNameInput.value = testCase.name;
      projectNameInput.value = testCase.project;
      updateUI();
      updatePreview();
      persistRecordingSession();
      showNotification(`✓ Test case '${name}' loaded!`, 'success');
    }
  });
};

window.deleteSavedTest = function(name) {
  if (confirm(`Delete test case '${name}'?`)) {
    chrome.storage.local.get('savedTestCases', (result) => {
      const cases = result.savedTestCases || {};
      delete cases[name];
      chrome.storage.local.set({ savedTestCases: cases }, () => {
        loadSavedTests();
        showNotification(`✓ Test case '${name}' deleted!`, 'success');
      });
    });
  }
};

function loadTestCase() {
  const name = prompt('Enter test case name to load:');
  if (name) {
    window.loadTest(name);
  }
}

function updateUI() {
  startBtn.disabled = isRecording;
  stopBtn.disabled = !isRecording;
  pauseBtn.disabled = !isRecording;
  pauseBtn.textContent = isPaused ? '▶ Resume' : '⏸ Pause';
  downloadBtn.disabled = !recordedActions.length;
  copyBtn.disabled = !recordedActions.length;
  previewBtn.disabled = !recordedActions.length;
  playbackBtn.disabled = !recordedActions.length;

  statusEl.textContent = isPaused ? 'Paused' : isRecording ? 'Recording' : 'Ready';
  actionCountEl.textContent = `Actions: ${recordedActions.length}`;
  screenshotCountEl.textContent = `Screenshots: ${screenshots.length}`;
  networkCountEl.textContent = `API Calls: ${networkRequests.length}`;
  if (stepCounterBadge) {
    stepCounterBadge.textContent = `${recordedActions.length} ${recordedActions.length === 1 ? 'step' : 'steps'}`;
  }
  renderRecordedActions();
  renderNetworkList();
}

function showNotification(message, type = 'info') {
  const notif = document.createElement('div');
  notif.className = `notification ${type}`;
  notif.textContent = message;
  notifications.appendChild(notif);

  setTimeout(() => notif.remove(), 3000);
}

// Listen for updates from background storage sync
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'recordingSessionUpdated') {
    applyRecordingSession(request.data || {});
    if (scriptPreview.value) {
      updatePreview();
    }
  }

  if (request.action === 'inspectorSelectionUpdated') {
    inspectorSelection = request.data || null;
    renderInspectorSelection(inspectorSelection);
  }

  if (sendResponse) {
    sendResponse({ success: true });
  }
});

function addNetworkItem(call) {
  const item = document.createElement('div');
  item.className = 'network-item';
  item.innerHTML = `
    <div class="item-header">
      <strong>${call.method}</strong>
      <span class="item-badge ${call.status < 400 ? 'success' : 'error'}">${call.status}</span>
    </div>
    <small>${call.url}</small><br>
    <small>Duration: ${call.duration}ms</small>
  `;
  networkList.appendChild(item);
  networkList.scrollTop = networkList.scrollHeight;
}

function copyPlainText(value, successMessage) {
  if (!value) {
    showNotification('Nothing to copy yet.', 'warning');
    return;
  }

  navigator.clipboard.writeText(value)
    .then(() => showNotification(successMessage, 'success'))
    .catch(() => showNotification('Unable to copy to clipboard.', 'error'));
}

function detectBrowserName(userAgent) {
  if (/Edg\//.test(userAgent)) return 'Microsoft Edge';
  if (/Chrome\//.test(userAgent)) return 'Google Chrome';
  if (/Firefox\//.test(userAgent)) return 'Firefox';
  return 'Chromium';
}

function detectOsName(userAgent) {
  if (/Windows/i.test(userAgent)) return 'Windows';
  if (/Macintosh/i.test(userAgent)) return 'macOS';
  if (/Linux/i.test(userAgent)) return 'Linux';
  return 'Desktop';
}

async function refreshContextStrip() {
  if (contextClockEl) {
    contextClockEl.textContent = `Time: ${new Date().toLocaleTimeString()}`;
  }

  if (contextBrowserEl) {
    contextBrowserEl.textContent = `Browser: ${detectBrowserName(navigator.userAgent)}`;
  }

  if (contextOsEl) {
    contextOsEl.textContent = `OS: ${detectOsName(navigator.userAgent)}`;
  }

  try {
    const tab = await getPreparedBrowserTab('existing');
    await ensureRecorderReady(tab);
    const response = await sendTabMessage(tab.id, { action: 'getPageContext' });
    if (response?.success && contextViewportEl) {
      contextViewportEl.textContent = `Viewport: ${response.data.viewport.width}x${response.data.viewport.height}`;
    }
  } catch (error) {
    if (contextViewportEl) {
      contextViewportEl.textContent = 'Viewport: unavailable';
    }
  }
}

function renderInspectorSelection(selection) {
  if (!inspectorSummaryCard) {
    return;
  }

  if (!selection) {
    inspectorSummaryCard.innerHTML = '<div class="empty-state">Launch the live inspector, click any element on the page, and reopen the popup to copy selectors.</div>';
    assertionsList.innerHTML = '<div class="empty-state">No element selected yet.</div>';
    return;
  }

  const selectorCard = (label, value) => `
    <div class="assertion-item">
      <div class="item-header">
        <strong>${escapeHtml(label)}</strong>
        <button class="remove-btn" data-copy-value="${escapeHtml(value)}" style="background:#0d6b67;">Copy</button>
      </div>
      <div class="step-meta">${escapeHtml(value)}</div>
    </div>
  `;

  inspectorSummaryCard.innerHTML = `
    <div class="assertion-item">
      <div class="item-header">
        <strong>${escapeHtml(selection.descriptor || selection.tagName || 'Selected element')}</strong>
        <span class="item-badge">LIVE</span>
      </div>
      <div class="step-meta">${escapeHtml(selection.summary || selection.url || '')}</div>
    </div>
    ${selectorCard('XPath', selection.xpath || 'Unavailable')}
    ${selectorCard('CSS Selector', selection.css || 'Unavailable')}
    ${selectorCard('Playwright', selection.playwright || 'Unavailable')}
  `;

  assertionsList.innerHTML = `
    <div class="assertion-item">
      <div class="item-header">
        <strong>${escapeHtml(selection.descriptor || selection.tagName || 'Selected element')}</strong>
      </div>
      <div class="step-meta">${escapeHtml(selection.summary || '')}</div>
    </div>
    ${selectorCard('XPath', selection.xpath || 'Unavailable')}
    ${selectorCard('CSS Selector', selection.css || 'Unavailable')}
    ${selectorCard('Playwright Locator', selection.playwright || 'Unavailable')}
    ${selectorCard('Cypress Locator', selection.cypress || 'Unavailable')}
    ${selectorCard('Selenium Locator', selection.selenium || 'Unavailable')}
  `;
}

async function loadInspectorSelection() {
  try {
    const response = await sendRuntimeMessage({ action: 'getInspectorSelection' });
    inspectorSelection = response?.data || null;
    renderInspectorSelection(inspectorSelection);
  } catch (error) {
    console.warn('Unable to load inspector selection:', error);
  }
}

async function launchInspectorMode() {
  try {
    const tab = await getPreparedBrowserTab('existing');
    await ensureRecorderReady(tab);
    await sendTabMessage(tab.id, { action: 'startInspector' });
    await refreshContextStrip();
    showNotification('Live inspector launched. Click an element on the page.', 'success');
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

async function stopInspectorMode() {
  try {
    const tab = await getPreparedBrowserTab('existing');
    await ensureRecorderReady(tab);
    await sendTabMessage(tab.id, { action: 'stopInspector' });
    showNotification('Live inspector stopped.', 'success');
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

function addHeaderRow(key = '', value = '') {
  if (!apiHeadersList) {
    return;
  }

  const row = document.createElement('div');
  row.className = 'api-header-row';
  row.innerHTML = `
    <input class="api-input" placeholder="Header" value="${escapeHtml(key)}">
    <input class="api-input" placeholder="Value" value="${escapeHtml(value)}">
    <button class="hero-btn" type="button">Remove</button>
  `;

  const [headerInput, valueInput, removeBtn] = row.children;
  headerInput.addEventListener('input', () => { void persistApiState(); });
  valueInput.addEventListener('input', () => { void persistApiState(); });
  removeBtn.addEventListener('click', () => {
    row.remove();
    void persistApiState();
  });

  apiHeadersList.appendChild(row);
}

function collectApiHeaders() {
  return Array.from(apiHeadersList?.querySelectorAll('.api-header-row') || []).reduce((headers, row) => {
    const inputs = row.querySelectorAll('input');
    const key = inputs[0]?.value?.trim();
    const value = inputs[1]?.value || '';
    if (key) {
      headers[key] = value;
    }
    return headers;
  }, {});
}

function tryFormatJson(text) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch (error) {
    return text || 'Empty response body.';
  }
}

async function persistApiState(showSavedToast = false) {
  const payload = {
    method: apiMethodSelect?.value || 'GET',
    url: apiUrlInput?.value || '',
    body: apiBodyInput?.value || '',
    headers: collectApiHeaders()
  };

  await chrome.storage.local.set({ apiState: payload });
  if (showSavedToast) {
    showNotification('Current API snapshot saved.', 'success');
  }
}

function renderApiHistory() {
  if (!apiHistoryList) {
    return;
  }

  if (!apiHistory.length) {
    apiHistoryList.innerHTML = '<div class="empty-state">Saved API runs will appear here.</div>';
    return;
  }

  apiHistoryList.innerHTML = apiHistory.map((entry, index) => `
    <div class="saved-test-item">
      <div class="item-header">
        <div>
          <strong>${escapeHtml(entry.method)} ${escapeHtml(entry.url)}</strong><br>
          <small>${escapeHtml(entry.responseStatus)} • ${escapeHtml(entry.savedAt)} • ${escapeHtml(String(entry.duration))} ms</small>
        </div>
        <button class="remove-btn" data-api-index="${index}" style="background:#0d6b67;">Load</button>
      </div>
    </div>
  `).join('');

  Array.from(apiHistoryList.querySelectorAll('[data-api-index]')).forEach((button) => {
    button.addEventListener('click', () => {
      loadApiSnapshot(Number(button.getAttribute('data-api-index')));
    });
  });
}

function loadApiSnapshot(index) {
  const snapshot = apiHistory[index];
  if (!snapshot) {
    return;
  }

  apiMethodSelect.value = snapshot.method || 'GET';
  apiUrlInput.value = snapshot.url || '';
  apiBodyInput.value = snapshot.body || '';
  apiHeadersList.innerHTML = '';
  Object.entries(snapshot.headers || {}).forEach(([key, value]) => addHeaderRow(key, value));
  void persistApiState();
  showNotification('API snapshot loaded.', 'success');
}

async function loadApiState() {
  const result = await chrome.storage.local.get(['apiState', 'apiHistory']);
  const apiState = result.apiState || {};
  apiHistory = Array.isArray(result.apiHistory) ? result.apiHistory : [];

  if (apiMethodSelect) apiMethodSelect.value = apiState.method || 'GET';
  if (apiUrlInput) apiUrlInput.value = apiState.url || '';
  if (apiBodyInput) apiBodyInput.value = apiState.body || '';

  if (apiHeadersList) {
    apiHeadersList.innerHTML = '';
    const headerEntries = Object.entries(apiState.headers || {});
    if (headerEntries.length) {
      headerEntries.forEach(([key, value]) => addHeaderRow(key, value));
    } else {
      addHeaderRow('Content-Type', 'application/json');
    }
  }

  renderApiHistory();
}

async function executeApiRequest() {
  const url = apiUrlInput?.value?.trim();
  if (!url) {
    showNotification('Enter an API URL first.', 'warning');
    return;
  }

  const method = apiMethodSelect?.value || 'GET';
  const headers = collectApiHeaders();
  const body = apiBodyInput?.value?.trim() || '';
  const options = { method, headers };
  if (body && !['GET', 'HEAD'].includes(method)) {
    options.body = body;
  }

  const startedAt = performance.now();

  try {
    const response = await fetch(url, options);
    const responseText = await response.text();
    const duration = Math.round(performance.now() - startedAt);
    const formattedBody = tryFormatJson(responseText);
    const responseHeaders = Object.fromEntries(response.headers.entries());

    apiStatusBadge.textContent = `${response.status} ${response.statusText}`;
    apiDurationEl.textContent = `Duration: ${duration} ms`;
    apiBytesEl.textContent = `Size: ${new Blob([responseText]).size} bytes`;
    apiResponseOutput.textContent = formattedBody;
    apiHeadersOutput.textContent = JSON.stringify(responseHeaders, null, 2);

    apiHistory.unshift({
      method,
      url,
      headers,
      body,
      responseStatus: `${response.status} ${response.statusText}`,
      duration,
      savedAt: new Date().toLocaleString()
    });
    apiHistory = apiHistory.slice(0, 8);
    await chrome.storage.local.set({ apiHistory });
    renderApiHistory();
    await persistApiState();
    showNotification('API request completed.', response.ok ? 'success' : 'warning');
  } catch (error) {
    apiStatusBadge.textContent = 'Request failed';
    apiDurationEl.textContent = `Duration: ${Math.round(performance.now() - startedAt)} ms`;
    apiBytesEl.textContent = 'Size: -';
    apiResponseOutput.textContent = error.message;
    apiHeadersOutput.textContent = 'No response headers available.';
    showNotification(error.message, 'error');
  }
}

async function initializePopup() {
  updateRecordingTargetUi();
  await loadRecordingSession();
  await loadInspectorSelection();
  await loadApiState();
  loadSavedTests();
  await refreshContextStrip();
  updateUI();
}

initializePopup();

