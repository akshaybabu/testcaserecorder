// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Test Recorder extension installed');
});

// Initialize storage
chrome.storage.local.get('recordedActions', (result) => {
  if (!result.recordedActions) {
    chrome.storage.local.set({ recordedActions: [] });
  }
});
