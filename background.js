const DEFAULT_RECORDING_SESSION = {
  actions: [],
  assertions: [],
  networkRequests: [],
  screenshots: [],
  isRecording: false,
  isPaused: false,
  currentTabId: null
};

let sessionUpdateQueue = Promise.resolve();

function getRecordingSession() {
  return new Promise((resolve) => {
    chrome.storage.local.get('recordingSession', (result) => {
      resolve({
        ...DEFAULT_RECORDING_SESSION,
        ...(result.recordingSession || {})
      });
    });
  });
}

function saveRecordingSession(session) {
  const normalizedSession = {
    ...DEFAULT_RECORDING_SESSION,
    ...session,
    actions: session.actions || [],
    assertions: session.assertions || [],
    networkRequests: session.networkRequests || [],
    screenshots: session.screenshots || []
  };

  return new Promise((resolve) => {
    chrome.storage.local.set({ recordingSession: normalizedSession }, () => {
      resolve(normalizedSession);
    });
  });
}

function broadcastRecordingSession(session) {
  chrome.runtime.sendMessage({ action: 'recordingSessionUpdated', data: session }, () => {
    void chrome.runtime.lastError;
  });

  if (!session.currentTabId) {
    return;
  }

  chrome.tabs.sendMessage(session.currentTabId, { action: 'recordingSessionUpdated', data: session }, () => {
    void chrome.runtime.lastError;
  });
}

function queueRecordingSessionUpdate(updater) {
  sessionUpdateQueue = sessionUpdateQueue.then(async () => {
    const currentSession = await getRecordingSession();
    const nextSession = typeof updater === 'function'
      ? updater(currentSession)
      : { ...currentSession, ...updater };
    const savedSession = await saveRecordingSession(nextSession);
    broadcastRecordingSession(savedSession);
    return savedSession;
  });

  return sessionUpdateQueue;
}

chrome.runtime.onInstalled.addListener(async () => {
  console.log('TracePilot QA v2.0 installed');
  await saveRecordingSession(DEFAULT_RECORDING_SESSION);
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('Tab activated:', activeInfo.tabId);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getRecordingSession':
      getRecordingSession().then((session) => {
        sendResponse({ success: true, data: session });
      });
      return true;

    case 'setRecordingSession':
      queueRecordingSessionUpdate(request.data || {}).then((session) => {
        sendResponse({ success: true, data: session });
      });
      return true;

    case 'startRecordingSession':
      queueRecordingSessionUpdate({
        ...DEFAULT_RECORDING_SESSION,
        isRecording: true,
        currentTabId: request.data?.currentTabId || null
      }).then((session) => {
        sendResponse({ success: true, data: session });
      });
      return true;

    case 'stopRecordingSession':
      queueRecordingSessionUpdate((session) => ({
        ...session,
        isRecording: false,
        isPaused: false
      })).then((session) => {
        sendResponse({ success: true, data: session });
      });
      return true;

    case 'pauseRecordingSession':
      queueRecordingSessionUpdate((session) => ({
        ...session,
        isPaused: true
      })).then((session) => {
        sendResponse({ success: true, data: session });
      });
      return true;

    case 'resumeRecordingSession':
      queueRecordingSessionUpdate((session) => ({
        ...session,
        isPaused: false
      })).then((session) => {
        sendResponse({ success: true, data: session });
      });
      return true;

    case 'clearRecordingSession':
      queueRecordingSessionUpdate({
        ...DEFAULT_RECORDING_SESSION
      }).then((session) => {
        sendResponse({ success: true, data: session });
      });
      return true;

    case 'recordAction':
      queueRecordingSessionUpdate((session) => ({
        ...session,
        actions: [...session.actions, request.data]
      })).then((session) => {
        sendResponse({ success: true, data: session });
      });
      return true;

    case 'recordNetworkCall':
      queueRecordingSessionUpdate((session) => ({
        ...session,
        networkRequests: [...session.networkRequests, request.data]
      })).then((session) => {
        sendResponse({ success: true, data: session });
      });
      return true;

    case 'recordScreenshot':
      queueRecordingSessionUpdate((session) => ({
        ...session,
        screenshots: [...session.screenshots, request.data]
      })).then((session) => {
        sendResponse({ success: true, data: session });
      });
      return true;

    case 'captureScreenshot':
      if (!sender.tab?.windowId) {
        sendResponse({ error: 'No active tab available for screenshot capture.' });
        return false;
      }

      chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' }, async (screenshotUrl) => {
        if (chrome.runtime.lastError) {
          console.error('Screenshot error:', chrome.runtime.lastError);
          sendResponse({ error: chrome.runtime.lastError.message });
          return;
        }

        const screenshot = {
          timestamp: Date.now(),
          url: sender.url || sender.tab?.url,
          dataUrl: screenshotUrl
        };

        try {
          const session = await queueRecordingSessionUpdate((currentSession) => ({
            ...currentSession,
            screenshots: [...currentSession.screenshots, screenshot]
          }));
          sendResponse({ success: true, data: screenshot, session });
        } catch (error) {
          sendResponse({ error: error.message });
        }
      });
      return true;

    case 'captureVisibleScreenshot':
      if (!sender.tab?.windowId) {
        sendResponse({ error: 'No active tab available for screenshot capture.' });
        return false;
      }

      chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' }, (screenshotUrl) => {
        if (chrome.runtime.lastError) {
          console.error('Visible screenshot error:', chrome.runtime.lastError);
          sendResponse({ error: chrome.runtime.lastError.message });
          return;
        }

        sendResponse({
          success: true,
          data: {
            timestamp: Date.now(),
            url: sender.url || sender.tab?.url,
            dataUrl: screenshotUrl
          }
        });
      });
      return true;

    default:
      return false;
  }
});
