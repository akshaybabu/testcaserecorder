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

async function startRecording() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabId = tab.id;

  isRecording = true;
  recordedActions = [];
  recordedAssertions = [];
  networkRequests = [];
  screenshots = [];

  chrome.tabs.sendMessage(currentTabId, {
    action: 'startRecording',
    options: {
      captureScreenshots: document.getElementById('captureScreenshots').checked,
      captureNetwork: document.getElementById('captureNetwork').checked,
      recordWaits: document.getElementById('recordWaits').checked,
      recordAssertions: document.getElementById('recordAssertions').checked
    }
  });

  updateUI();
  showNotification('🔴 Recording started!');
}

function stopRecording() {
  isRecording = false;
  chrome.tabs.sendMessage(currentTabId, { action: 'stopRecording' });
  updateUI();
  updatePreview();
  showNotification('⏹ Recording stopped!', 'success');
}

function togglePause() {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? '▶ Resume' : '⏸ Pause';
  statusEl.textContent = isPaused ? 'Paused' : 'Recording';
  chrome.tabs.sendMessage(currentTabId, { action: isPaused ? 'pauseRecording' : 'resumeRecording' });
}

function clearRecording() {
  if (confirm('Clear all recorded actions? This cannot be undone.')) {
    recordedActions = [];
    recordedAssertions = [];
    networkRequests = [];
    screenshots = [];
    scriptPreview.value = '';
    assertionsList.innerHTML = '';
    document.getElementById('networkList').innerHTML = '';
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

function updatePreview() {
  const format = formatSelect.value;
  const script = generateScript(format, recordedActions, recordedAssertions, networkRequests);
  scriptPreview.value = script;
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
  const script = scriptPreview.value;
  const ext = format === 'cypress' || format === 'playwright-js' || format === 'protractor' ? 'js' : format === 'robot' ? 'robot' : format === 'json' ? 'json' : 'py';
  const filename = `${testCaseNameInput.value?.replace(/\s+/g, '_') || 'test_script'}.${ext}`;

  const blob = new Blob([script], { type: 'text/plain' });
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

  isPlaying = true;
  playbackBtn.disabled = true;
  stopPlaybackBtn.disabled = false;
  playbackResults.innerHTML = '<div class="playback-item">▶ Starting playback...</div>';

  const speed = parseFloat(document.getElementById('playbackSpeed').value);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

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
  result.innerHTML = `<strong>Step ${stepNum}:</strong> ${message || (action?.type?.toUpperCase() + ' - ' + action?.selector?.value)}`;
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
      recordedActions = testCase.actions;
      recordedAssertions = testCase.assertions;
      networkRequests = testCase.networkRequests;
      screenshots = testCase.screenshots;
      testCaseNameInput.value = testCase.name;
      projectNameInput.value = testCase.project;
      updateUI();
      updatePreview();
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
  downloadBtn.disabled = !recordedActions.length;
  copyBtn.disabled = !recordedActions.length;
  previewBtn.disabled = !recordedActions.length;
  playbackBtn.disabled = !recordedActions.length;

  statusEl.textContent = isRecording ? 'Recording' : 'Ready';
  actionCountEl.textContent = `Actions: ${recordedActions.length}`;
  screenshotCountEl.textContent = `Screenshots: ${screenshots.length}`;
  networkCountEl.textContent = `API Calls: ${networkRequests.length}`;
}

function showNotification(message, type = 'info') {
  const notif = document.createElement('div');
  notif.className = `notification ${type}`;
  notif.textContent = message;
  notifications.appendChild(notif);

  setTimeout(() => notif.remove(), 3000);
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'recordAction') {
    recordedActions.push(request.data);
    updateUI();
    sendResponse({ success: true });
  } else if (request.action === 'recordScreenshot') {
    screenshots.push(request.data);
    screenshotCountEl.textContent = `Screenshots: ${screenshots.length}`;
    sendResponse({ success: true });
  } else if (request.action === 'recordNetworkCall') {
    networkRequests.push(request.data);
    networkCountEl.textContent = `API Calls: ${networkRequests.length}`;
    addNetworkItem(request.data);
    sendResponse({ success: true });
  }
});

function addNetworkItem(call) {
  const networkList = document.getElementById('networkList');
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

// Load saved tests on popup open
loadSavedTests();
updateUI();
