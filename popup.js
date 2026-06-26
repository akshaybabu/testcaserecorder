let isRecording = false;
let isPaused = false;
let recordedActions = [];
let currentTabId = null;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const pauseBtn = document.getElementById('pauseBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const formatSelect = document.getElementById('formatSelect');
const statusEl = document.getElementById('status');
const actionCountEl = document.getElementById('actionCount');
const scriptPreview = document.getElementById('scriptPreview');
const notifications = document.getElementById('notifications');

startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);
pauseBtn.addEventListener('click', togglePause);
downloadBtn.addEventListener('click', downloadScript);
copyBtn.addEventListener('click', copyToClipboard);
clearBtn.addEventListener('click', clearRecording);
formatSelect.addEventListener('change', updatePreview);

async function startRecording() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabId = tab.id;

  isRecording = true;
  recordedActions = [];
  
  chrome.tabs.sendMessage(currentTabId, { action: 'startRecording' });
  
  updateUI();
  showNotification('Recording started!');
}

function stopRecording() {
  isRecording = false;
  chrome.tabs.sendMessage(currentTabId, { action: 'stopRecording' });
  updateUI();
  updatePreview();
  showNotification('Recording stopped!');
}

function togglePause() {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? '▶ Resume' : '⏸ Pause';
  statusEl.textContent = isPaused ? 'Paused' : 'Recording';
}

function clearRecording() {
  recordedActions = [];
  scriptPreview.value = '';
  updateUI();
  showNotification('Recording cleared!');
}

function updateUI() {
  startBtn.disabled = isRecording;
  stopBtn.disabled = !isRecording;
  pauseBtn.disabled = !isRecording;
  downloadBtn.disabled = !recordedActions.length;
  copyBtn.disabled = !recordedActions.length;
  clearBtn.disabled = !recordedActions.length;

  statusEl.textContent = isRecording ? 'Recording' : 'Ready';
  actionCountEl.textContent = `Actions: ${recordedActions.length}`;
}

function updatePreview() {
  const format = formatSelect.value;
  const script = generateScript(format, recordedActions);
  scriptPreview.value = script;
}

function generateScript(format, actions) {
  switch (format) {
    case 'selenium':
      return generateSeleniumScript(actions);
    case 'cypress':
      return generateCypressScript(actions);
    case 'playwright':
      return generatePlaywrightScript(actions);
    default:
      return '';
  }
}

function generateSeleniumScript(actions) {
  let script = `from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

driver = webdriver.Chrome()

try:
    driver.get("${actions[0]?.url || 'https://example.com'}")
    
`;

  actions.forEach(action => {
    switch (action.type) {
      case 'click':
        script += `    # Click on element\n`;
        script += `    element = WebDriverWait(driver, 10).until(\n`;
        script += `        EC.presence_of_element_located((By.${action.selector.strategy}, "${action.selector.value}"))\n`;
        script += `    )\n    element.click()\n\n`;
        break;
      case 'type':
        script += `    # Type text\n`;
        script += `    element = driver.find_element(By.${action.selector.strategy}, "${action.selector.value}")\n`;
        script += `    element.send_keys("${action.value}")\n\n`;
        break;
      case 'wait':
        script += `    time.sleep(${action.duration / 1000})\n\n`;
        break;
    }
  });

  script += `finally:
    driver.quit()
`;

  return script;
}

function generateCypressScript(actions) {
  let script = `describe('Recorded Test', () => {
  beforeEach(() => {
    cy.visit('${actions[0]?.url || 'https://example.com'}')
  })

  it('should complete recorded actions', () => {
`;

  actions.forEach(action => {
    switch (action.type) {
      case 'click':
        script += `    cy.get('${action.selector.value}').click()\n`;
        break;
      case 'type':
        script += `    cy.get('${action.selector.value}').type('${action.value}')\n`;
        break;
      case 'wait':
        script += `    cy.wait(${action.duration})\n`;
        break;
    }
  });

  script += `  })
})
`;

  return script;
}

function generatePlaywrightScript(actions) {
  let script = `from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    
    page.goto('${actions[0]?.url || 'https://example.com'}')
    
`;

  actions.forEach(action => {
    switch (action.type) {
      case 'click':
        script += `    page.click('${action.selector.value}')\n`;
        break;
      case 'type':
        script += `    page.fill('${action.selector.value}', '${action.value}')\n`;
        break;
      case 'wait':
        script += `    page.wait_for_timeout(${action.duration})\n`;
        break;
    }
  });

  script += `    browser.close()
`;

  return script;
}

function downloadScript() {
  const format = formatSelect.value;
  const script = scriptPreview.value;
  const filename = `test-script.${format === 'cypress' ? 'js' : 'py'}`;

  const blob = new Blob([script], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  showNotification('Script downloaded!');
}

function copyToClipboard() {
  scriptPreview.select();
  document.execCommand('copy');
  showNotification('Copied to clipboard!');
}

function showNotification(message, isError = false) {
  const notif = document.createElement('div');
  notif.className = `notification ${isError ? 'error' : ''}`;
  notif.textContent = message;
  notifications.appendChild(notif);

  setTimeout(() => notif.remove(), 3000);
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'recordAction') {
    recordedActions.push(request.data);
    actionCountEl.textContent = `Actions: ${recordedActions.length}`;
    sendResponse({ success: true });
  }
});

// Load saved recordings on popup open
chrome.storage.local.get('recordedActions', (result) => {
  if (result.recordedActions) {
    recordedActions = result.recordedActions;
    updateUI();
    updatePreview();
  }
});

updateUI();
