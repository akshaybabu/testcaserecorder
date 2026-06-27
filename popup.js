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
const savedTests = document.getElementById('savedTests');

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
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      showNotification('No active browser tab is available for recording.', 'error');
      return;
    }

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

  showNotification('🔴 Recording started!');
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
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
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
  return;

  for (let i = 0; i < recordedActions.length && isPlaying; i++) {
    const action = recordedActions[i];
    const delay = 1000 / speed;
    await new Promise(resolve => setTimeout(resolve, delay));

    if (!isPlaying) break;

    addPlaybackResult(action, i + 1, 'pass');
  }

  addPlaybackResult(null, recordedActions.length, 'pass', 'Playback completed!');
  playbackBtn.disabled = false;
  stopPlaybackBtn.disabled = true;
  isPlaying = false;
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
  if (request.action !== 'recordingSessionUpdated') {
    return;
  }

  applyRecordingSession(request.data || {});
  if (scriptPreview.value) {
    updatePreview();
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

async function initializePopup() {
  await loadRecordingSession();
  loadSavedTests();
  updateUI();
}

initializePopup();
