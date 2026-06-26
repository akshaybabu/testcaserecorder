let isRecording = false;
let lastClickTime = 0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startRecording') {
    startRecording();
    sendResponse({ success: true });
  } else if (request.action === 'stopRecording') {
    stopRecording();
    sendResponse({ success: true });
  }
});

function startRecording() {
  isRecording = true;
  console.log('Test recording started');
  
  // Inject overlay
  injectRecordingIndicator();

  document.addEventListener('click', handleClick, true);
  document.addEventListener('input', handleInput, true);
  document.addEventListener('change', handleChange, true);
}

function stopRecording() {
  isRecording = false;
  console.log('Test recording stopped');
  
  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('input', handleInput, true);
  document.removeEventListener('change', handleChange, true);
  
  removeRecordingIndicator();
}

function handleClick(event) {
  if (!isRecording) return;

  const element = event.target;
  const selector = getElementSelector(element);

  if (selector) {
    const actionData = {
      type: 'click',
      selector: selector,
      url: window.location.href,
      timestamp: Date.now()
    };

    chrome.runtime.sendMessage({ action: 'recordAction', data: actionData });
    
    // Visual feedback
    highlightElement(element);
  }

  lastClickTime = Date.now();
}

function handleInput(event) {
  if (!isRecording) return;

  const element = event.target;
  const selector = getElementSelector(element);

  if (selector && element.value) {
    const actionData = {
      type: 'type',
      selector: selector,
      value: element.value,
      url: window.location.href,
      timestamp: Date.now()
    };

    chrome.runtime.sendMessage({ action: 'recordAction', data: actionData });
  }
}

function handleChange(event) {
  if (!isRecording) return;

  const element = event.target;
  if (element.tagName === 'SELECT') {
    const selector = getElementSelector(element);
    const actionData = {
      type: 'select',
      selector: selector,
      value: element.value,
      url: window.location.href,
      timestamp: Date.now()
    };

    chrome.runtime.sendMessage({ action: 'recordAction', data: actionData });
  }
}

function getElementSelector(element) {
  // Try multiple selector strategies
  
  // 1. ID
  if (element.id) {
    return {
      strategy: 'ID',
      value: element.id
    };
  }

  // 2. CSS Class
  if (element.className) {
    const classes = element.className.split(' ').filter(c => c.length > 0);
    if (classes.length) {
      return {
        strategy: 'CSS_SELECTOR',
        value: `.${classes.join('.')}`
      };
    }
  }

  // 3. XPath
  const xpath = getXPath(element);
  return {
    strategy: 'XPATH',
    value: xpath
  };
}

function getXPath(element) {
  if (element.id !== '')
    return "//*[@id='" + element.id + "']";

  if (element === document.body)
    return element.tagName.toLowerCase();

  var ix = 0;
  var siblings = element.parentNode.childNodes;
  for (var i = 0; i < siblings.length; i++) {
    var sibling = siblings[i];
    if (sibling === element)
      return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
    if (sibling.nodeType === 1 && sibling.tagName.toLowerCase() === element.tagName.toLowerCase())
      ix++;
  }
}

function highlightElement(element) {
  const originalStyle = element.style.cssText;
  element.style.boxShadow = '0 0 5px 2px #667eea';
  
  setTimeout(() => {
    element.style.cssText = originalStyle;
  }, 500);
}

function injectRecordingIndicator() {
  if (document.getElementById('test-recorder-indicator')) return;

  const indicator = document.createElement('div');
  indicator.id = 'test-recorder-indicator';
  indicator.innerHTML = '🔴 Recording...';
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 12px 20px;
    border-radius: 25px;
    font-weight: bold;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    animation: pulse 1s infinite;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
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
