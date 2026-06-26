let isRecording = false;
let isPaused = false;
let recordingOptions = {};
let lastTimestamp = Date.now();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startRecording') {
    recordingOptions = request.options || {};
    startRecording();
    sendResponse({ success: true });
  } else if (request.action === 'stopRecording') {
    stopRecording();
    sendResponse({ success: true });
  } else if (request.action === 'pauseRecording') {
    isPaused = true;
    sendResponse({ success: true });
  } else if (request.action === 'resumeRecording') {
    isPaused = false;
    sendResponse({ success: true });
  }
});

function startRecording() {
  isRecording = true;
  isPaused = false;
  console.log('Test recording started', recordingOptions);
  injectRecordingIndicator();

  document.addEventListener('click', handleClick, true);
  document.addEventListener('input', handleInput, true);
  document.addEventListener('change', handleChange, true);
  document.addEventListener('submit', handleFormSubmit, true);

  if (recordingOptions.captureNetwork) {
    interceptNetworkCalls();
  }

  lastTimestamp = Date.now();
}

function stopRecording() {
  isRecording = false;
  console.log('Test recording stopped');

  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('input', handleInput, true);
  document.removeEventListener('change', handleChange, true);
  document.removeEventListener('submit', handleFormSubmit, true);

  removeRecordingIndicator();
}

function handleClick(event) {
  if (!isRecording || isPaused) return;

  const element = event.target;
  const selector = getElementSelector(element);

  if (selector && isInteractableElement(element)) {
    recordAction({
      type: 'click',
      selector: selector,
      url: window.location.href,
      timestamp: Date.now(),
      tagName: element.tagName
    });

    highlightElement(element);

    if (recordingOptions.captureScreenshots) {
      captureScreenshot();
    }
  }
}

function handleInput(event) {
  if (!isRecording || isPaused) return;

  const element = event.target;
  const selector = getElementSelector(element);

  if (selector && element.value) {
    recordAction({
      type: 'type',
      selector: selector,
      value: element.value,
      url: window.location.href,
      timestamp: Date.now()
    });
  }
}

function handleChange(event) {
  if (!isRecording || isPaused) return;

  const element = event.target;
  if (['SELECT', 'INPUT', 'TEXTAREA'].includes(element.tagName)) {
    const selector = getElementSelector(element);
    recordAction({
      type: 'change',
      selector: selector,
      value: element.value,
      url: window.location.href,
      timestamp: Date.now()
    });
  }
}

function handleFormSubmit(event) {
  if (!isRecording || isPaused) return;

  recordAction({
    type: 'submit',
    selector: getElementSelector(event.target),
    url: window.location.href,
    timestamp: Date.now()
  });
}

function isInteractableElement(element) {
  const clickableElements = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL'];
  return clickableElements.includes(element.tagName) || element.onclick;
}

function recordAction(action) {
  chrome.runtime.sendMessage({ action: 'recordAction', data: action }, (response) => {
    console.log('Action recorded:', action);
  });
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

  // 3. Try CSS class
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

  // 4. Try text content
  if (element.textContent && element.textContent.trim().length < 50) {
    return {
      strategy: 'XPATH',
      value: `//*[contains(text(), "${element.textContent.trim().substring(0, 30)}")]`,
      type: 'text'
    };
  }

  // 5. Generate CSS selector
  const cssSelector = generateCSSSelector(element);
  if (cssSelector) {
    return {
      strategy: 'CSS_SELECTOR',
      value: cssSelector,
      type: 'css'
    };
  }

  // 6. Fallback to XPath
  const xpath = getXPath(element);
  return {
    strategy: 'XPATH',
    value: xpath,
    type: 'xpath'
  };
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
        // Use alternative method
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
  const originalFetch = window.fetch;
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

function recordNetworkCall(call) {
  chrome.runtime.sendMessage({ action: 'recordNetworkCall', data: call });
}

function highlightElement(element) {
  const originalStyle = element.style.cssText;
  element.style.boxShadow = '0 0 10px 3px #667eea';
  element.style.outline = '2px solid #667eea';

  setTimeout(() => {
    element.style.cssText = originalStyle;
  }, 500);
}

function injectRecordingIndicator() {
  if (document.getElementById('test-recorder-indicator')) return;

  const indicator = document.createElement('div');
  indicator.id = 'test-recorder-indicator';
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
}

function removeRecordingIndicator() {
  const indicator = document.getElementById('test-recorder-indicator');
  if (indicator) {
    indicator.remove();
  }
}
