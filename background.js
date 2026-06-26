// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Test Recorder Pro v2.0 installed');
  // Initialize storage
  chrome.storage.local.get('recordedActions', (result) => {
    if (!result.recordedActions) {
      chrome.storage.local.set({ recordedActions: [] });
    }
  });
});

// Listen for tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('Tab activated:', activeInfo.tabId);
});

// Capture visible tab screenshot
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureScreenshot') {
    chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' }, (screenshotUrl) => {
      if (chrome.runtime.lastError) {
        console.error('Screenshot error:', chrome.runtime.lastError);
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'recordScreenshot',
          data: {
            timestamp: Date.now(),
            url: sender.url,
            dataUrl: screenshotUrl
          }
        });
        sendResponse({ success: true });
      }
    });
  }
});
