let isRecording = false;
let isPaused = false;
let recordingOptions = {};
let lastTimestamp = Date.now();
let originalFetch = null;
let isFetchIntercepted = false;
let latestSession = {
  actions: [],
  networkRequests: [],
  screenshots: []
};
let activeDragSource = null;
let inspectorEnabled = false;
let inspectorPinned = true;
let hoveredInspectorElement = null;
let selectedInspectorData = null;
let inspectorDragState = null;
const pendingInputRecords = new Map();
const isTopFrame = window.top === window;
const OVERLAY_ID = 'test-recorder-indicator';
const INSPECTOR_PANEL_ID = 'as-live-inspector-panel';
const OVERLAY_STEP_LIMIT = 6;
const inputFlushPromises = new Map();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ success: true });
  } else if (request.action === 'startRecording') {
    recordingOptions = request.options || {};
    startRecording();
    sendResponse({ success: true });
  } else if (request.action === 'stopRecording') {
    stopRecording()
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  } else if (request.action === 'pauseRecording') {
    isPaused = true;
    updateRecordingOverlay();
    sendResponse({ success: true });
  } else if (request.action === 'resumeRecording') {
    isPaused = false;
    updateRecordingOverlay();
    sendResponse({ success: true });
  } else if (request.action === 'executePlaybackAction') {
    executePlaybackAction(request.data)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  } else if (request.action === 'recordingSessionUpdated') {
    applySessionUpdate(request.data || {});
    sendResponse({ success: true });
  } else if (request.action === 'startInspector') {
    startInspectorMode();
    sendResponse({ success: true, data: selectedInspectorData });
  } else if (request.action === 'stopInspector') {
    stopInspectorMode();
    sendResponse({ success: true });
  } else if (request.action === 'getPageContext') {
    sendResponse({
      success: true,
      data: {
        title: document.title,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    });
  }
});

function startRecording() {
  if (isRecording) {
    stopRecording();
  }

  isRecording = true;
  isPaused = false;
  latestSession = {
    actions: [],
    networkRequests: [],
    screenshots: []
  };
  console.log('Test recording started', recordingOptions);
  updateRecordingOverlay();

  document.addEventListener('click', handleClick, true);
  document.addEventListener('focusin', handleFocusIn, true);
  document.addEventListener('input', handleInput, true);
  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('change', handleChange, true);
  document.addEventListener('focusout', handleFocusOut, true);
  document.addEventListener('submit', handleFormSubmit, true);
  document.addEventListener('dragstart', handleDragStart, true);
  document.addEventListener('drop', handleDrop, true);

  const activeElement = findRecordableElement(document.activeElement, 'input');
  if (activeElement && shouldRecordAsTypedInput(activeElement)) {
    primePendingInputRecord(activeElement);
  }

  if (recordingOptions.captureNetwork) {
    interceptNetworkCalls();
  }

  lastTimestamp = Date.now();
}

async function stopRecording() {
  isRecording = false;
  isPaused = false;
  console.log('Test recording stopped');

  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('focusin', handleFocusIn, true);
  document.removeEventListener('input', handleInput, true);
  document.removeEventListener('keydown', handleKeyDown, true);
  document.removeEventListener('change', handleChange, true);
  document.removeEventListener('focusout', handleFocusOut, true);
  document.removeEventListener('submit', handleFormSubmit, true);
  document.removeEventListener('dragstart', handleDragStart, true);
  document.removeEventListener('drop', handleDrop, true);

  activeDragSource = null;
  await flushAllPendingInputs();
  restoreNetworkCalls();
  removeRecordingIndicator();
}

async function handleClick(event) {
  if (!isRecording || isPaused) return;
  if (isRecorderUiElement(event.target)) return;

  await flushPendingInputBeforeAction(event.target);

  const element = findRecordableElement(event.target, 'click');
  if (!element) return;

  const previewDataUrl = await captureElementPreview(element);
  recordAction({
    type: 'click',
    selector: getElementSelector(element),
    alternativeLocators: getAlternativeLocators(element),
    displayName: getElementDescriptor(element),
    previewDataUrl,
    url: window.location.href,
    timestamp: Date.now(),
    tagName: element.tagName
  });

  highlightElement(element, 'Click');

  if (recordingOptions.captureScreenshots) {
    captureScreenshot();
  }
}

function handleFocusIn(event) {
  if (!isRecording || isPaused) return;
  if (isRecorderUiElement(event.target)) return;

  const element = findRecordableElement(event.target, 'input');
  if (!element || !shouldRecordAsTypedInput(element)) return;

  primePendingInputRecord(element);
}

function handleInput(event) {
  if (!isRecording || isPaused) return;
  if (isRecorderUiElement(event.target)) return;

  const element = findRecordableElement(event.target, 'input');
  if (!element) return;

  queuePendingInputRecord(element);
}

function handleKeyDown(event) {
  if (!isRecording || isPaused) return;
  if (isRecorderUiElement(event.target)) return;

  if (!['Enter', 'Tab'].includes(event.key)) {
    return;
  }

  const element = findRecordableElement(event.target, 'input');
  if (!element) return;

  markPendingInputCommit(element, event.key === 'Enter' ? 'enter' : 'tab');
  void flushPendingInputRecord(element);
}

function handleChange(event) {
  if (!isRecording || isPaused) return;
  if (isRecorderUiElement(event.target)) return;

  const element = findRecordableElement(event.target, 'change');
  if (!element) return;

  if (shouldRecordAsTypedInput(element)) {
    markPendingInputCommit(element, 'change');
    flushPendingInputRecord(element);
    return;
  }

  void captureAndRecordChange(element);
}

async function captureAndRecordChange(element) {
  const previewDataUrl = await captureElementPreview(element);
  recordAction({
    type: 'change',
    selector: getElementSelector(element),
    alternativeLocators: getAlternativeLocators(element),
    displayName: getElementDescriptor(element),
    previewDataUrl,
    value: getElementValue(element),
    url: window.location.href,
    timestamp: Date.now(),
    inputType: element.type || element.tagName.toLowerCase()
  });

  highlightElement(element, 'Change');
}

async function handleFocusOut(event) {
  if (!isRecording || isPaused) return;
  if (isRecorderUiElement(event.target)) return;

  const element = findRecordableElement(event.target, 'input');
  if (!element) return;

  markPendingInputCommit(element, 'blur');
  await flushPendingInputRecord(element);
}

async function handleFormSubmit(event) {
  if (!isRecording || isPaused) return;
  if (isRecorderUiElement(event.target)) return;

  const form = findRecordableElement(event.target, 'submit');
  if (!form) return;

  await flushAllPendingInputs();

  const previewDataUrl = await captureElementPreview(form);
  recordAction({
    type: 'submit',
    selector: getElementSelector(form),
    alternativeLocators: getAlternativeLocators(form),
    displayName: getElementDescriptor(form),
    previewDataUrl,
    url: window.location.href,
    timestamp: Date.now()
  });

  highlightElement(form, 'Submit');
}

function handleDragStart(event) {
  if (!isRecording || isPaused) return;
  if (isRecorderUiElement(event.target)) return;

  const source = findRecordableElement(event.target, 'drag');
  if (!source) return;

  activeDragSource = source;
  highlightElement(source, 'Drag');
}

async function handleDrop(event) {
  if (!isRecording || isPaused) return;
  if (isRecorderUiElement(event.target)) return;
  if (!activeDragSource) return;

  const target = findRecordableElement(event.target, 'drop') || event.target;
  if (!(target instanceof Element)) return;

  const previewDataUrl = await captureElementPreview(target);
  recordAction({
    type: 'dragDrop',
    selector: getElementSelector(activeDragSource),
    alternativeLocators: getAlternativeLocators(activeDragSource),
    displayName: getElementDescriptor(activeDragSource),
    targetSelector: getElementSelector(target),
    targetAlternativeLocators: getAlternativeLocators(target),
    targetDisplayName: getElementDescriptor(target),
    previewDataUrl,
    url: window.location.href,
    timestamp: Date.now(),
    tagName: activeDragSource.tagName
  });

  highlightElement(target, 'Drop');
  activeDragSource = null;
}

function isInteractableElement(element) {
  if (!(element instanceof Element)) {
    return false;
  }

  return Boolean(
    element.closest(
      'a, button, input, select, textarea, label, summary, option, [role="button"], [role="link"], [role="tab"], [contenteditable=""], [contenteditable="true"], [data-testid], [onclick]'
    )
  );
}

function findRecordableElement(target, actionType) {
  if (!(target instanceof Element)) {
    return null;
  }

  if (actionType === 'submit') {
    return target.closest('form');
  }

  if (actionType === 'input' || actionType === 'change') {
    return target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]');
  }

  const interactiveAncestor = target.closest(
    'a, button, input, select, textarea, label, summary, option, [role="button"], [role="link"], [role="tab"], [data-testid], [onclick]'
  );

  return interactiveAncestor || target;
}

function getElementValue(element) {
  if (element instanceof HTMLInputElement) {
    if (element.type === 'checkbox' || element.type === 'radio') {
      return String(element.checked);
    }

    return element.value;
  }

  if (element instanceof HTMLSelectElement) {
    return element.multiple
      ? Array.from(element.selectedOptions).map((option) => option.value).join(', ')
      : element.value;
  }

  if (element instanceof HTMLTextAreaElement) {
    return element.value;
  }

  return element.textContent?.trim() || '';
}

function recordAction(action) {
  chrome.runtime.sendMessage({ action: 'recordAction', data: action }, (response) => {
    console.log('Action recorded:', action);
  });
}

async function captureElementPreview(element) {
  if (!(element instanceof Element)) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) {
    return null;
  }

  try {
    setRecorderOverlayVisibility(false);
    const response = await sendRuntimeMessage({ action: 'captureVisibleScreenshot' });
    const screenshotUrl = response?.data?.dataUrl;
    if (!screenshotUrl) {
      return null;
    }

    return await cropScreenshotToElement(screenshotUrl, rect);
  } catch (error) {
    console.warn('Unable to capture element preview:', error);
    return null;
  } finally {
    setRecorderOverlayVisibility(true);
  }
}

function setRecorderOverlayVisibility(isVisible) {
  if (!isTopFrame) {
    return;
  }

  const overlay = document.getElementById(OVERLAY_ID);
  if (!overlay) {
    return;
  }

  overlay.classList.toggle('test-recorder-hidden', !isVisible);
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load captured screenshot.'));
    image.src = dataUrl;
  });
}

async function cropScreenshotToElement(dataUrl, rect) {
  const image = await loadImage(dataUrl);
  const dpr = window.devicePixelRatio || 1;
  const padding = 10;

  const sx = Math.max(0, Math.floor((rect.left - padding) * dpr));
  const sy = Math.max(0, Math.floor((rect.top - padding) * dpr));
  const sw = Math.max(24, Math.floor((rect.width + padding * 2) * dpr));
  const sh = Math.max(24, Math.floor((rect.height + padding * 2) * dpr));
  const safeWidth = Math.min(sw, image.width - sx);
  const safeHeight = Math.min(sh, image.height - sy);

  if (safeWidth <= 0 || safeHeight <= 0) {
    return null;
  }

  const maxWidth = 104;
  const maxHeight = 72;
  const scale = Math.min(maxWidth / safeWidth, maxHeight / safeHeight, 1);
  const outputWidth = Math.max(24, Math.round(safeWidth * scale));
  const outputHeight = Math.max(24, Math.round(safeHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  context.drawImage(image, sx, sy, safeWidth, safeHeight, 0, 0, outputWidth, outputHeight);
  return canvas.toDataURL('image/jpeg', 0.72);
}

function shouldRecordAsTypedInput(element) {
  if (element instanceof HTMLTextAreaElement) {
    return true;
  }

  if (element instanceof HTMLInputElement) {
    return !['checkbox', 'radio', 'range', 'file'].includes(element.type);
  }

  return element instanceof HTMLElement && element.isContentEditable;
}

function getInputElementType(element) {
  if (element instanceof HTMLInputElement) {
    return element.type || 'text';
  }

  return element?.tagName?.toLowerCase() || 'text';
}

function maskRecordedInputValue(element, value) {
  if (element instanceof HTMLInputElement && element.type === 'password') {
    return value ? '********' : '';
  }

  return value;
}

function primePendingInputRecord(element) {
  if (!shouldRecordAsTypedInput(element) || pendingInputRecords.has(element)) {
    return;
  }

  pendingInputRecords.set(element, {
    initialValue: getElementValue(element),
    value: getElementValue(element),
    url: window.location.href,
    timestamp: Date.now(),
    inputType: getInputElementType(element),
    committedBy: 'focus'
  });
}

function queuePendingInputRecord(element) {
  if (!shouldRecordAsTypedInput(element)) {
    return;
  }

  primePendingInputRecord(element);
  const existingRecord = pendingInputRecords.get(element);
  if (!existingRecord) return;

  pendingInputRecords.set(element, {
    ...existingRecord,
    value: getElementValue(element),
    url: window.location.href,
    timestamp: Date.now(),
    committedBy: 'input'
  });
}

function markPendingInputCommit(element, committedBy) {
  const pendingRecord = pendingInputRecords.get(element);
  if (!pendingRecord) {
    return;
  }

  pendingInputRecords.set(element, {
    ...pendingRecord,
    committedBy
  });
}

async function flushPendingInputRecord(element) {
  if (inputFlushPromises.has(element)) {
    return inputFlushPromises.get(element);
  }

  const pendingRecord = pendingInputRecords.get(element);
  if (!pendingRecord) {
    return;
  }

  const flushPromise = (async () => {
    pendingInputRecords.delete(element);
    const finalValue = getElementValue(element);

    if (finalValue === pendingRecord.initialValue) {
      return;
    }

    const previewDataUrl = await captureElementPreview(element);
    recordAction({
      type: 'type',
      selector: getElementSelector(element),
      alternativeLocators: getAlternativeLocators(element),
      displayName: getElementDescriptor(element),
      previewDataUrl,
      value: maskRecordedInputValue(element, finalValue),
      rawValueCaptured: !(element instanceof HTMLInputElement && element.type === 'password'),
      initialValue: maskRecordedInputValue(element, pendingRecord.initialValue),
      inputCommit: pendingRecord.committedBy || 'complete',
      url: pendingRecord.url,
      timestamp: pendingRecord.timestamp,
      inputType: pendingRecord.inputType || getInputElementType(element)
    });

    highlightElement(element, 'Type');
  })();

  inputFlushPromises.set(element, flushPromise);

  try {
    await flushPromise;
  } finally {
    inputFlushPromises.delete(element);
  }
}

async function flushPendingInputBeforeAction(target) {
  const inputsToFlush = Array.from(pendingInputRecords.keys()).filter((element) => (
    element !== target && !(target instanceof Element && element.contains(target))
  ));
  const activeFlushes = Array.from(inputFlushPromises.entries())
    .filter(([element]) => element !== target && !(target instanceof Element && element.contains(target)))
    .map(([, promise]) => promise);

  await Promise.all([
    ...inputsToFlush.map((element) => flushPendingInputRecord(element)),
    ...activeFlushes
  ]);
}

async function flushAllPendingInputs() {
  await Promise.all([
    ...Array.from(pendingInputRecords.keys()).map((element) => flushPendingInputRecord(element)),
    ...Array.from(inputFlushPromises.values())
  ]);
}

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

function applySessionUpdate(session) {
  const wasRecording = isRecording;
  const shouldStart = Boolean(session.isRecording) && !wasRecording;
  const shouldStop = !session.isRecording && wasRecording;

  latestSession = {
    actions: Array.isArray(session.actions) ? session.actions : latestSession.actions,
    networkRequests: Array.isArray(session.networkRequests) ? session.networkRequests : latestSession.networkRequests,
    screenshots: Array.isArray(session.screenshots) ? session.screenshots : latestSession.screenshots
  };
  isRecording = Boolean(session.isRecording);
  isPaused = Boolean(session.isPaused);

  if (shouldStart) {
    startRecording();
    latestSession = {
      actions: Array.isArray(session.actions) ? session.actions : [],
      networkRequests: Array.isArray(session.networkRequests) ? session.networkRequests : [],
      screenshots: Array.isArray(session.screenshots) ? session.screenshots : []
    };
    isPaused = Boolean(session.isPaused);
  }

  if (shouldStop) {
    stopRecording();
    return;
  }

  updateRecordingOverlay(session);
}

function isRecorderUiElement(target) {
  return target instanceof Element && Boolean(target.closest(`#${OVERLAY_ID}, #${INSPECTOR_PANEL_ID}`));
}

function formatOverlayStep(action, index) {
  const selector = action?.displayName || action?.selector?.value || action?.tagName || 'element';
  const label = action?.type || 'step';
  return `${index + 1}. ${label} - ${selector}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function getVisibleText(element) {
  if (!(element instanceof Element)) {
    return '';
  }

  const directText = normalizeText(element.textContent || '');
  return directText.length <= 80 ? directText : `${directText.slice(0, 77)}...`;
}

function getElementLabelText(element) {
  if (!(element instanceof Element)) {
    return '';
  }

  if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
    const labels = element.labels ? Array.from(element.labels) : [];
    const labelText = labels.map((label) => normalizeText(label.textContent || '')).find(Boolean);
    if (labelText) {
      return labelText;
    }
  }

  const ariaLabel = normalizeText(element.getAttribute('aria-label') || '');
  if (ariaLabel) {
    return ariaLabel;
  }

  const placeholder = normalizeText(element.getAttribute('placeholder') || '');
  if (placeholder) {
    return placeholder;
  }

  const title = normalizeText(element.getAttribute('title') || '');
  if (title) {
    return title;
  }

  const alt = normalizeText(element.getAttribute('alt') || '');
  if (alt) {
    return alt;
  }

  const text = getVisibleText(element);
  if (text) {
    return text;
  }

  return '';
}

function getElementDescriptor(element) {
  const label = getElementLabelText(element);
  if (label) {
    return label;
  }

  if (element?.id) {
    return `#${element.id}`;
  }

  if (element?.name) {
    return element.name;
  }

  return element?.tagName?.toLowerCase() || 'element';
}

function getElementSelector(element) {
  // 1. Try ID
  if (element.id) {
    return {
      strategy: 'ID',
      value: element.id,
      type: 'id'
    };
  }

  // 2. Try name attribute
  if (element.name) {
    return {
      strategy: 'NAME',
      value: element.name,
      type: 'name'
    };
  }

  // 3. Try accessible label or visible text
  const labelText = getElementLabelText(element);
  if (labelText) {
    return {
      strategy: 'XPATH',
      value: buildTextBasedXPath(element, labelText),
      type: 'label'
    };
  }

  // 4. Try CSS class
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ').filter(c => c.length > 0);
    if (classes.length) {
      return {
        strategy: 'CSS_SELECTOR',
        value: `.${classes.join('.')}`,
        type: 'class'
      };
    }
  }

  // 5. Try text content
  if (element.textContent && element.textContent.trim().length < 50) {
    return {
      strategy: 'XPATH',
      value: `//*[contains(text(), "${element.textContent.trim().substring(0, 30)}")]`,
      type: 'text'
    };
  }

  // 6. Generate CSS selector
  const cssSelector = generateCSSSelector(element);
  if (cssSelector) {
    return {
      strategy: 'CSS_SELECTOR',
      value: cssSelector,
      type: 'css'
    };
  }

  // 7. Fallback to XPath
  const xpath = getXPath(element);
  return {
    strategy: 'XPATH',
    value: xpath,
    type: 'xpath'
  };
}

function getAlternativeLocators(element) {
  if (!(element instanceof Element)) {
    return [];
  }

  const locators = [];
  const addLocator = (strategy, value, type, confidence) => {
    if (!value) {
      return;
    }

    const duplicate = locators.some((locator) => (
      locator.strategy === strategy && locator.value === value
    ));

    if (!duplicate) {
      locators.push({ strategy, value, type, confidence });
    }
  };

  const testIdAttribute = ['data-testid', 'data-test', 'data-qa']
    .find((attribute) => element.hasAttribute(attribute));
  const testId = testIdAttribute ? element.getAttribute(testIdAttribute) : '';
  addLocator('CSS_SELECTOR', testId ? `[${testIdAttribute}="${escapeCssAttribute(testId)}"]` : '', 'test-id', 95);

  if (element.id) {
    addLocator('ID', element.id, 'id', 90);
  }

  if (element.getAttribute('name')) {
    addLocator('NAME', element.getAttribute('name'), 'name', 82);
  }

  const ariaLabel = normalizeText(element.getAttribute('aria-label') || '');
  addLocator('CSS_SELECTOR', ariaLabel ? `${element.tagName.toLowerCase()}[aria-label="${escapeCssAttribute(ariaLabel)}"]` : '', 'aria-label', 78);

  const labelText = getElementLabelText(element);
  addLocator('XPATH', labelText ? buildTextBasedXPath(element, labelText) : '', 'label-or-text', 74);

  const cssSelector = generateCSSSelector(element);
  addLocator('CSS_SELECTOR', cssSelector, 'css-path', 58);

  const xpath = getXPath(element);
  addLocator('XPATH', xpath, 'xpath', 45);

  return locators;
}

function generateCSSSelector(element) {
  if (element.id) return `#${element.id}`;

  let path = [];
  let current = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector = `#${current.id}`;
      path.unshift(selector);
      break;
    } else if (current.className) {
      const classList = current.className.split(' ').filter(c => c.length > 0);
      if (classList.length) {
        selector += '.' + classList.join('.');
      }
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
}

function getXPath(element) {
  if (element.id !== '')
    return "//*[@id='" + element.id + "']";

  if (element === document.body)
    return element.tagName.toLowerCase();

  var ix = 0;
  var siblings = element.parentNode?.childNodes;
  if (!siblings) return '';

  for (var i = 0; i < siblings.length; i++) {
    var sibling = siblings[i];
    if (sibling === element)
      return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
    if (sibling.nodeType === 1 && sibling.tagName.toLowerCase() === element.tagName.toLowerCase())
      ix++;
  }
}

function captureScreenshot() {
  chrome.runtime.sendMessage(
    { action: 'captureScreenshot' },
    (response) => {
      if (chrome.runtime.lastError) {
        if (typeof html2canvas !== 'function') {
          console.warn('Screenshot capture failed and html2canvas is unavailable:', chrome.runtime.lastError.message);
          return;
        }

        html2canvas(document.body).then(canvas => {
          const data = canvas.toDataURL('image/png');
          chrome.runtime.sendMessage({
            action: 'recordScreenshot',
            data: {
              timestamp: Date.now(),
              url: window.location.href,
              dataUrl: data
            }
          });
        });
      }
    }
  );
}

function interceptNetworkCalls() {
  if (isFetchIntercepted) {
    return;
  }

  originalFetch = window.fetch;
  isFetchIntercepted = true;
  window.fetch = function(...args) {
    const startTime = performance.now();
    const url = args[0];
    const options = args[1];

    return originalFetch.apply(this, args)
      .then(response => {
        const duration = performance.now() - startTime;
        const method = (options?.method || 'GET').toUpperCase();
        const status = response.status;

        recordNetworkCall({
          method,
          url: typeof url === 'string' ? url : url.url,
          status,
          duration: Math.round(duration),
          timestamp: Date.now()
        });

        return response;
      })
      .catch(error => {
        const duration = performance.now() - startTime;
        recordNetworkCall({
          method: (options?.method || 'GET').toUpperCase(),
          url: typeof url === 'string' ? url : url.url,
          status: 0,
          error: error.message,
          duration: Math.round(duration),
          timestamp: Date.now()
        });
        throw error;
      });
  };
}

function escapeXPathText(value) {
  const normalized = normalizeText(value);
  return normalized.replace(/"/g, '\'');
}

function escapeCssAttribute(value) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function buildTextBasedXPath(element, text) {
  const safeText = escapeXPathText(text).slice(0, 60);
  const tagName = element.tagName.toLowerCase();

  if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
    return `//label[contains(normalize-space(.), "${safeText}")]/following::*[self::input or self::textarea or self::select][1]`;
  }

  return `//${tagName}[contains(normalize-space(.), "${safeText}")]`;
}

function restoreNetworkCalls() {
  if (!isFetchIntercepted || !originalFetch) {
    return;
  }

  window.fetch = originalFetch;
  originalFetch = null;
  isFetchIntercepted = false;
}

function recordNetworkCall(call) {
  chrome.runtime.sendMessage({ action: 'recordNetworkCall', data: call });
}

function queryByLocator(locator) {
  if (!locator?.strategy || !locator?.value) {
    return null;
  }

  try {
    switch (locator.strategy) {
      case 'ID':
        return document.getElementById(locator.value);
      case 'NAME':
        return document.querySelector(`[name="${escapeCssAttribute(locator.value)}"]`);
      case 'CSS_SELECTOR':
        return document.querySelector(locator.value);
      case 'XPATH':
        return document.evaluate(
          locator.value,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
      default:
        return document.querySelector(locator.value);
    }
  } catch (error) {
    return null;
  }
}

function isElementVisible(element) {
  if (!(element instanceof Element)) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  return rect.width > 0
    && rect.height > 0
    && styles.visibility !== 'hidden'
    && styles.display !== 'none';
}

async function findPlaybackElement(action, timeoutMs = 5000) {
  const locatorCandidates = [
    action?.selector,
    ...(Array.isArray(action?.alternativeLocators) ? action.alternativeLocators : [])
  ].filter(Boolean);
  const deadline = Date.now() + timeoutMs;

  while (Date.now() <= deadline) {
    for (const locator of locatorCandidates) {
      const element = queryByLocator(locator);
      if (element && isElementVisible(element)) {
        return { element, locator };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return { element: null, locator: locatorCandidates[0] || null };
}

function dispatchUserInputEvents(element) {
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

function setElementValue(element, value) {
  if (element instanceof HTMLInputElement) {
    if (element.type === 'checkbox' || element.type === 'radio') {
      element.checked = value === true || value === 'true' || value === element.value;
    } else {
      element.value = String(value ?? '');
    }
    dispatchUserInputEvents(element);
    return;
  }

  if (element instanceof HTMLTextAreaElement) {
    element.value = String(value ?? '');
    dispatchUserInputEvents(element);
    return;
  }

  if (element instanceof HTMLSelectElement) {
    const values = String(value ?? '').split(',').map((item) => item.trim());
    Array.from(element.options).forEach((option) => {
      option.selected = values.includes(option.value) || values.includes(option.text);
    });
    dispatchUserInputEvents(element);
    return;
  }

  if (element instanceof HTMLElement && element.isContentEditable) {
    element.textContent = String(value ?? '');
    dispatchUserInputEvents(element);
  }
}

function dispatchDragAndDrop(source, target) {
  const dataTransfer = typeof DataTransfer === 'function' ? new DataTransfer() : null;
  const eventOptions = { bubbles: true, cancelable: true, dataTransfer };

  source.dispatchEvent(new DragEvent('dragstart', eventOptions));
  target.dispatchEvent(new DragEvent('dragenter', eventOptions));
  target.dispatchEvent(new DragEvent('dragover', eventOptions));
  target.dispatchEvent(new DragEvent('drop', eventOptions));
  source.dispatchEvent(new DragEvent('dragend', eventOptions));
}

async function executePlaybackAction(data) {
  const action = data?.action || data;
  if (!action?.type) {
    throw new Error('Playback action is missing a type.');
  }

  const timeout = Number(data?.timeoutMs || 5000);
  const { element, locator } = await findPlaybackElement(action, timeout);
  if (!element) {
    throw new Error(`Element not found: ${action.displayName || action.selector?.value || action.type}`);
  }

  element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  await new Promise((resolve) => setTimeout(resolve, 120));
  highlightElement(element, 'Playback');

  switch (action.type) {
    case 'click':
      element.click();
      break;
    case 'type':
    case 'change':
      element.focus?.();
      setElementValue(element, action.value);
      break;
    case 'submit': {
      const form = element instanceof HTMLFormElement ? element : element.closest('form');
      if (!form) {
        throw new Error('Submit step could not find a form element.');
      }

      if (typeof form.requestSubmit === 'function') {
        form.requestSubmit();
      } else {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
      break;
    }
    case 'dragDrop': {
      const targetLookup = {
        selector: action.targetSelector,
        alternativeLocators: action.targetAlternativeLocators,
        displayName: action.targetDisplayName
      };
      const { element: targetElement } = await findPlaybackElement(targetLookup, timeout);
      if (!targetElement) {
        throw new Error(`Drop target not found: ${action.targetDisplayName || action.targetSelector?.value || 'target'}`);
      }

      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      await new Promise((resolve) => setTimeout(resolve, 120));
      dispatchDragAndDrop(element, targetElement);
      highlightElement(targetElement, 'Drop');
      break;
    }
    case 'wait':
      await new Promise((resolve) => setTimeout(resolve, Number(action.duration || 1000)));
      break;
    default:
      throw new Error(`Unsupported playback action: ${action.type}`);
  }

  return {
    label: action.displayName || action.selector?.value || action.type,
    locatorUsed: locator
  };
}

function highlightElement(element, actionLabel = 'Action') {
  if (!(element instanceof Element)) {
    return;
  }

  element.classList.remove('test-recorder-highlight');
  void element.offsetWidth;
  element.classList.add('test-recorder-highlight');

  const existingBadge = document.querySelector('.test-recorder-highlight-badge');
  if (existingBadge) {
    existingBadge.remove();
  }

  const badge = document.createElement('div');
  const rect = element.getBoundingClientRect();
  badge.className = 'test-recorder-highlight-badge';
  badge.textContent = actionLabel;
  badge.style.top = `${Math.max(8, rect.top - 34)}px`;
  badge.style.left = `${Math.max(8, rect.left)}px`;
  document.body.appendChild(badge);

  setTimeout(() => {
    element.classList.remove('test-recorder-highlight');
    badge.remove();
  }, 900);
}

function injectRecordingIndicator() {
  if (!isTopFrame || document.getElementById(OVERLAY_ID)) {
    return;
  }

  const indicator = document.createElement('aside');
  indicator.id = OVERLAY_ID;
  indicator.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="animation: pulse 1s infinite; font-size: 16px;">🔴</span>
      <span>Recording Test...</span>
    </div>
  `;
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(indicator);

  indicator.innerHTML = `
    <div class="test-recorder-panel">
      <div class="test-recorder-panel-header">
        <div>
          <div class="test-recorder-panel-title">Recording Live</div>
          <div id="test-recorder-status" class="test-recorder-panel-status">Recording current page</div>
        </div>
        <div class="test-recorder-panel-pulse" aria-hidden="true"></div>
      </div>
      <div class="test-recorder-panel-metrics">
        <div class="test-recorder-metric">
          <span id="test-recorder-action-count" class="test-recorder-metric-value">0</span>
          <span class="test-recorder-metric-label">Steps</span>
        </div>
        <div class="test-recorder-metric">
          <span id="test-recorder-network-count" class="test-recorder-metric-value">0</span>
          <span class="test-recorder-metric-label">API</span>
        </div>
        <div class="test-recorder-metric">
          <span id="test-recorder-shot-count" class="test-recorder-metric-value">0</span>
          <span class="test-recorder-metric-label">Shots</span>
        </div>
      </div>
      <div class="test-recorder-panel-steps">
        <div class="test-recorder-panel-steps-title">Captured Steps</div>
        <div id="test-recorder-steps" class="test-recorder-steps-list">
          <div class="test-recorder-empty">Your recorded steps will appear here.</div>
        </div>
      </div>
      <div class="test-recorder-panel-actions">
        <button type="button" id="test-recorder-pause-btn" class="test-recorder-btn test-recorder-btn-secondary">Pause</button>
        <button type="button" id="test-recorder-stop-btn" class="test-recorder-btn test-recorder-btn-danger">Stop</button>
      </div>
    </div>
  `;
  indicator.removeAttribute('style');

  indicator.querySelector('#test-recorder-pause-btn')?.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await sendRuntimeMessage({ action: isPaused ? 'resumeRecordingSession' : 'pauseRecordingSession' });
      isPaused = !isPaused;
      updateRecordingOverlay();
    } catch (error) {
      console.warn('Unable to toggle recording state from overlay:', error);
    }
  });

  indicator.querySelector('#test-recorder-stop-btn')?.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await sendRuntimeMessage({ action: 'stopRecordingSession' });
      stopRecording();
    } catch (error) {
      console.warn('Unable to stop recording from overlay:', error);
    }
  });
}

function removeRecordingIndicator() {
  if (!isTopFrame) {
    return;
  }

  const indicator = document.getElementById(OVERLAY_ID);
  if (indicator) {
    indicator.remove();
  }
}

function updateRecordingOverlay(session = latestSession) {
  if (!isTopFrame) {
    return;
  }

  if (!isRecording) {
    removeRecordingIndicator();
    return;
  }

  if (!document.getElementById(OVERLAY_ID)) {
    injectRecordingIndicator();
  }

  const overlay = document.getElementById(OVERLAY_ID);
  if (!overlay) {
    return;
  }

  const displayActions = Array.isArray(session.actions) ? session.actions : [];
  const displayScreenshots = Array.isArray(session.screenshots) ? session.screenshots : [];
  const displayNetworkRequests = Array.isArray(session.networkRequests) ? session.networkRequests : [];

  const statusEl = overlay.querySelector('#test-recorder-status');
  const actionCountEl = overlay.querySelector('#test-recorder-action-count');
  const networkCountEl = overlay.querySelector('#test-recorder-network-count');
  const screenshotCountEl = overlay.querySelector('#test-recorder-shot-count');
  const stepsEl = overlay.querySelector('#test-recorder-steps');
  const pauseBtn = overlay.querySelector('#test-recorder-pause-btn');

  if (statusEl) {
    statusEl.textContent = isPaused ? 'Paused - waiting for resume' : 'Recording current page';
  }

  if (actionCountEl) {
    actionCountEl.textContent = String(displayActions.length);
  }

  if (networkCountEl) {
    networkCountEl.textContent = String(displayNetworkRequests.length);
  }

  if (screenshotCountEl) {
    screenshotCountEl.textContent = String(displayScreenshots.length);
  }

  if (pauseBtn) {
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
  }

  if (!stepsEl) {
    return;
  }

  const recentSteps = displayActions.slice(-OVERLAY_STEP_LIMIT);
  if (!recentSteps.length) {
    stepsEl.innerHTML = '<div class="test-recorder-empty">Your recorded steps will appear here.</div>';
    return;
  }

  stepsEl.innerHTML = recentSteps.map((action, index) => {
    const actualIndex = displayActions.length - recentSteps.length + index;
    const previewMarkup = action.previewDataUrl
      ? `<img class="test-recorder-step-preview" src="${escapeHtml(action.previewDataUrl)}" alt="${escapeHtml(action.displayName || 'Step preview')}">`
      : '';
    return `
      <div class="test-recorder-step">
        ${previewMarkup}
        <div class="test-recorder-step-content">
          <div class="test-recorder-step-index">Step ${actualIndex + 1}</div>
          <div class="test-recorder-step-text">${escapeHtml(formatOverlayStep(action, actualIndex))}</div>
        </div>
      </div>
    `;
  }).join('');

  stepsEl.scrollTop = stepsEl.scrollHeight;
}

function buildInspectorSelection(element) {
  const css = generateCSSSelector(element) || '';
  const xpath = getXPath(element) || '';
  const descriptor = getElementDescriptor(element);
  const summary = `${element.tagName.toLowerCase()} • ${descriptor}`;
  const cssLocator = css || (element.id ? `#${element.id}` : '');
  const playwright = cssLocator
    ? `page.locator('${cssLocator.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}')`
    : `page.locator('xpath=${xpath.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}')`;
  const cypress = cssLocator
    ? `cy.get('${cssLocator.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}')`
    : `cy.xpath('${xpath.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}')`;
  const selenium = cssLocator
    ? `By.cssSelector("${cssLocator.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}")`
    : `By.xpath("${xpath.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}")`;

  return {
    descriptor,
    tagName: element.tagName.toLowerCase(),
    summary,
    url: window.location.href,
    css: cssLocator,
    xpath,
    playwright,
    cypress,
    selenium
  };
}

function ensureInspectorPanel() {
  if (!isTopFrame) {
    return null;
  }

  let panel = document.getElementById(INSPECTOR_PANEL_ID);
  if (panel) {
    return panel;
  }

  panel = document.createElement('aside');
  panel.id = INSPECTOR_PANEL_ID;
  panel.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: min(360px, calc(100vw - 24px));
    z-index: 1000001;
    border-radius: 22px;
    border: 1px solid rgba(138, 113, 76, 0.18);
    background: rgba(255, 252, 247, 0.96);
    color: #221f1a;
    box-shadow: 0 22px 56px rgba(72, 49, 26, 0.22);
    font-family: "Segoe UI", sans-serif;
    overflow: hidden;
  `;
  document.body.appendChild(panel);
  return panel;
}

function getInspectorBounds(panel) {
  const rect = panel.getBoundingClientRect();
  return {
    width: rect.width || 360,
    height: rect.height || 520
  };
}

function clampInspectorPosition(left, top, panel) {
  const bounds = getInspectorBounds(panel);
  const maxLeft = Math.max(12, window.innerWidth - bounds.width - 12);
  const maxTop = Math.max(12, window.innerHeight - 140);

  return {
    left: Math.min(Math.max(12, left), maxLeft),
    top: Math.min(Math.max(12, top), maxTop)
  };
}

function applyInspectorPosition(panel, left, top) {
  const clamped = clampInspectorPosition(left, top, panel);
  panel.style.left = `${clamped.left}px`;
  panel.style.top = `${clamped.top}px`;
  panel.style.right = 'auto';
}

function handleInspectorDragMove(event) {
  if (!inspectorDragState) {
    return;
  }

  const panel = document.getElementById(INSPECTOR_PANEL_ID);
  if (!panel) {
    return;
  }

  const nextLeft = event.clientX - inspectorDragState.offsetX;
  const nextTop = event.clientY - inspectorDragState.offsetY;
  applyInspectorPosition(panel, nextLeft, nextTop);
}

function stopInspectorDragging() {
  inspectorDragState = null;
  document.removeEventListener('mousemove', handleInspectorDragMove, true);
  document.removeEventListener('mouseup', stopInspectorDragging, true);
}

function startInspectorDragging(event) {
  const panel = document.getElementById(INSPECTOR_PANEL_ID);
  if (!panel) {
    return;
  }

  const rect = panel.getBoundingClientRect();
  inspectorDragState = {
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top
  };

  panel.style.right = 'auto';
  panel.style.left = `${rect.left}px`;
  panel.style.top = `${rect.top}px`;

  document.addEventListener('mousemove', handleInspectorDragMove, true);
  document.addEventListener('mouseup', stopInspectorDragging, true);
}

function renderInspectorPanel() {
  const panel = ensureInspectorPanel();
  if (!panel) {
    return;
  }

  const selection = selectedInspectorData;
  const compactClass = inspectorPinned ? '' : 'style="display:none;"';
  const selectionMarkup = selection ? `
    <div style="padding:14px 18px 0;font-size:12px;color:#72624f;">${escapeHtml(selection.summary || selection.descriptor || '')}</div>
    ${[
      ['XPath', selection.xpath],
      ['CSS', selection.css],
      ['Playwright', selection.playwright],
      ['Cypress', selection.cypress],
      ['Selenium', selection.selenium]
    ].map(([label, value]) => `
      <div style="padding:12px 18px 0;">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:6px;">
          <strong style="font-size:12px;">${escapeHtml(label)}</strong>
          <button type="button" data-inspector-copy="${escapeHtml(value || '')}" style="border:0;border-radius:999px;padding:6px 10px;background:rgba(13,107,103,0.12);color:#0d6b67;font-size:11px;font-weight:700;cursor:pointer;">Copy</button>
        </div>
        <div style="padding:10px 12px;border-radius:12px;background:rgba(245,240,231,0.72);font:12px/1.5 Consolas, monospace;word-break:break-word;">${escapeHtml(value || 'Unavailable')}</div>
      </div>
    `).join('')}
  ` : '<div style="padding:18px;color:#72624f;font-size:13px;line-height:1.5;">Click any element on the page to capture selectors.</div>';

  panel.innerHTML = `
    <div id="as-inspector-header" style="display:flex;justify-content:space-between;gap:12px;align-items:center;padding:16px 18px;border-bottom:1px solid rgba(138,113,76,0.12);cursor:move;user-select:none;">
      <div>
        <div style="font-size:15px;font-weight:700;">Live Inspector</div>
        <div style="margin-top:4px;font-size:12px;color:#72624f;">Click elements to capture selectors.</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button type="button" id="as-inspector-pin-btn" style="border:0;border-radius:999px;padding:7px 10px;background:rgba(199,119,46,0.12);color:#9b5416;font-size:11px;font-weight:700;cursor:pointer;">${inspectorPinned ? 'Pinned' : 'Compact'}</button>
        <button type="button" id="as-inspector-close-btn" style="border:0;border-radius:999px;padding:7px 10px;background:rgba(200,74,53,0.12);color:#c84a35;font-size:11px;font-weight:700;cursor:pointer;">Close</button>
      </div>
    </div>
    <div style="max-height:min(420px, calc(100vh - 140px));overflow:auto;" ${compactClass}>${selectionMarkup}</div>
  `;

  panel.querySelector('#as-inspector-header')?.addEventListener('mousedown', (event) => {
    if (event.target instanceof Element && event.target.closest('button')) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    startInspectorDragging(event);
  });

  panel.querySelector('#as-inspector-close-btn')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    stopInspectorMode();
  });

  panel.querySelector('#as-inspector-pin-btn')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    inspectorPinned = !inspectorPinned;
    renderInspectorPanel();
  });

  Array.from(panel.querySelectorAll('[data-inspector-copy]')).forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const value = button.getAttribute('data-inspector-copy') || '';
      if (!value) {
        return;
      }
      try {
        await navigator.clipboard.writeText(value);
      } catch (error) {
        console.warn('Unable to copy inspector value:', error);
      }
    });
  });
}

function applyInspectorHighlight(element) {
  if (!(element instanceof Element)) {
    return;
  }

  if (hoveredInspectorElement && hoveredInspectorElement !== element) {
    hoveredInspectorElement.classList.remove('test-recorder-highlight');
  }

  hoveredInspectorElement = element;
  element.classList.add('test-recorder-highlight');
}

function handleInspectorMove(event) {
  if (!inspectorEnabled || isRecorderUiElement(event.target)) {
    return;
  }

  const element = findRecordableElement(event.target, 'click') || event.target;
  if (element instanceof Element) {
    applyInspectorHighlight(element);
  }
}

async function handleInspectorClick(event) {
  if (!inspectorEnabled || isRecorderUiElement(event.target)) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const element = findRecordableElement(event.target, 'click') || event.target;
  if (!(element instanceof Element)) {
    return;
  }

  selectedInspectorData = buildInspectorSelection(element);
  renderInspectorPanel();

  try {
    await sendRuntimeMessage({ action: 'setInspectorSelection', data: selectedInspectorData });
  } catch (error) {
    console.warn('Unable to persist inspector selection:', error);
  }
}

function handleInspectorKeydown(event) {
  if (event.key === 'Escape') {
    stopInspectorMode();
  }
}

function startInspectorMode() {
  inspectorEnabled = true;
  renderInspectorPanel();
  document.addEventListener('mousemove', handleInspectorMove, true);
  document.addEventListener('click', handleInspectorClick, true);
  document.addEventListener('keydown', handleInspectorKeydown, true);
}

function stopInspectorMode() {
  inspectorEnabled = false;
  document.removeEventListener('mousemove', handleInspectorMove, true);
  document.removeEventListener('click', handleInspectorClick, true);
  document.removeEventListener('keydown', handleInspectorKeydown, true);
  stopInspectorDragging();
  hoveredInspectorElement?.classList.remove('test-recorder-highlight');
  hoveredInspectorElement = null;
  const panel = document.getElementById(INSPECTOR_PANEL_ID);
  if (panel) {
    panel.remove();
  }
}

sendRuntimeMessage({ action: 'getRecordingSession' })
  .then((response) => {
    if (response?.data?.isRecording) {
      applySessionUpdate(response.data);
    }
  })
  .catch((error) => {
    console.warn('Unable to hydrate recording overlay state:', error);
  });
