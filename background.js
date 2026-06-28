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
const WORKSPACE_WINDOW_WIDTH = 1180;
const WORKSPACE_WINDOW_HEIGHT = 900;
const WORKSPACE_URL = 'popup.html';
let workspaceWindowId = null;
let lastBrowserWindowId = null;
let lastBrowserTabId = null;

function getInspectorSelection() {
  return new Promise((resolve) => {
    chrome.storage.local.get('inspectorSelection', (result) => {
      resolve(result.inspectorSelection || null);
    });
  });
}

function saveInspectorSelection(selection) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ inspectorSelection: selection || null }, () => {
      resolve(selection || null);
    });
  });
}

function broadcastInspectorSelection(selection) {
  chrome.runtime.sendMessage({ action: 'inspectorSelectionUpdated', data: selection }, () => {
    void chrome.runtime.lastError;
  });
}

function getWorkspaceUrl() {
  return chrome.runtime.getURL(WORKSPACE_URL);
}

function openWorkspaceWindow() {
  return new Promise((resolve, reject) => {
    const targetUrl = getWorkspaceUrl();

    if (workspaceWindowId) {
      chrome.windows.get(workspaceWindowId, { populate: true }, (windowInfo) => {
        if (chrome.runtime.lastError || !windowInfo) {
          workspaceWindowId = null;
          openWorkspaceWindow().then(resolve).catch(reject);
          return;
        }

        const workspaceTab = windowInfo.tabs?.find((tab) => tab.url === targetUrl);
        if (workspaceTab?.id) {
          chrome.tabs.update(workspaceTab.id, { active: true }, () => {
            chrome.windows.update(workspaceWindowId, { focused: true }, () => {
              resolve({ windowId: workspaceWindowId, tabId: workspaceTab.id });
            });
          });
          return;
        }

        chrome.tabs.create({ windowId: workspaceWindowId, url: targetUrl, active: true }, (tab) => {
          chrome.windows.update(workspaceWindowId, { focused: true }, () => {
            resolve({ windowId: workspaceWindowId, tabId: tab?.id || null });
          });
        });
      });
      return;
    }

    chrome.windows.create({
      url: targetUrl,
      type: 'popup',
      width: WORKSPACE_WINDOW_WIDTH,
      height: WORKSPACE_WINDOW_HEIGHT,
      focused: true
    }, (createdWindow) => {
      if (chrome.runtime.lastError || !createdWindow) {
        reject(new Error(chrome.runtime.lastError?.message || 'Unable to open workspace window.'));
        return;
      }

      workspaceWindowId = createdWindow.id || null;
      resolve({
        windowId: workspaceWindowId,
        tabId: createdWindow.tabs?.[0]?.id || null
      });
    });
  });
}

function isRestrictedBrowserUrl(url = '') {
  return /^(chrome|edge|about|brave|vivaldi|opera):\/\//i.test(url)
    || /^chrome-extension:\/\//i.test(url)
    || /^https:\/\/chromewebstore\.google\.com/i.test(url);
}

function normalizeTargetUrl(rawUrl = '') {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) {
    return 'https://example.com';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function getTab(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        resolve(null);
        return;
      }

      resolve(tab || null);
    });
  });
}

function getWindow(windowId) {
  return new Promise((resolve) => {
    chrome.windows.get(windowId, { populate: true }, (windowInfo) => {
      if (chrome.runtime.lastError) {
        resolve(null);
        return;
      }

      resolve(windowInfo || null);
    });
  });
}

async function rememberBrowserContext(tabId) {
  const tab = await getTab(tabId);
  if (!tab?.id || !tab.windowId || isRestrictedBrowserUrl(tab.url || '')) {
    return;
  }

  const windowInfo = await getWindow(tab.windowId);
  if (windowInfo?.type !== 'normal') {
    return;
  }

  lastBrowserWindowId = tab.windowId;
  lastBrowserTabId = tab.id;
}

function queryActiveTabs() {
  return new Promise((resolve) => {
    chrome.tabs.query({}, (tabs) => resolve(tabs || []));
  });
}

async function getExistingRecordingTarget() {
  if (lastBrowserTabId) {
    const tab = await getTab(lastBrowserTabId);
    if (tab?.id && !isRestrictedBrowserUrl(tab.url || '')) {
      return tab;
    }
  }

  const tabs = await queryActiveTabs();
  const preferredTab = tabs.find((tab) => (
    tab.active
    && tab.windowId !== workspaceWindowId
    && !isRestrictedBrowserUrl(tab.url || '')
  )) || tabs.find((tab) => (
    tab.windowId !== workspaceWindowId
    && !isRestrictedBrowserUrl(tab.url || '')
  ));

  if (preferredTab?.id) {
    await rememberBrowserContext(preferredTab.id);
    return preferredTab;
  }

  return null;
}

function createBrowserWindow(url) {
  return new Promise((resolve, reject) => {
    chrome.windows.create({
      url,
      type: 'normal',
      focused: true
    }, async (createdWindow) => {
      if (chrome.runtime.lastError || !createdWindow) {
        reject(new Error(chrome.runtime.lastError?.message || 'Unable to open a fresh browser window.'));
        return;
      }

      const tab = createdWindow.tabs?.[0] || null;
      if (tab?.id) {
        await rememberBrowserContext(tab.id);
      }
      resolve(tab);
    });
  });
}

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
  await saveInspectorSelection(null);
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('Tab activated:', activeInfo.tabId);
  void rememberBrowserContext(activeInfo.tabId);
});

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === workspaceWindowId) {
    workspaceWindowId = null;
  }

  if (windowId === lastBrowserWindowId) {
    lastBrowserWindowId = null;
    lastBrowserTabId = null;
  }
});

chrome.action.onClicked.addListener(() => {
  void openWorkspaceWindow();
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

    case 'openWorkspaceWindow':
      openWorkspaceWindow()
        .then((result) => sendResponse({ success: true, data: result }))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;

    case 'prepareRecordingTarget': {
      const mode = request.data?.mode || 'existing';

      (async () => {
        if (mode === 'new') {
          const targetUrl = normalizeTargetUrl(request.data?.url || '');
          const tab = await createBrowserWindow(targetUrl);
          if (!tab?.id) {
            throw new Error('Unable to open a fresh browser window.');
          }
          sendResponse({ success: true, data: { tabId: tab.id, url: tab.url || targetUrl, mode } });
          return;
        }

        const tab = await getExistingRecordingTarget();
        if (!tab?.id) {
          throw new Error('No usable browser tab was found. Choose "New browser" or open a website tab first.');
        }

        sendResponse({ success: true, data: { tabId: tab.id, url: tab.url || '', mode } });
      })().catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

      return true;
    }

    case 'getInspectorSelection':
      getInspectorSelection().then((selection) => {
        sendResponse({ success: true, data: selection });
      });
      return true;

    case 'setInspectorSelection':
      saveInspectorSelection(request.data || null).then((selection) => {
        broadcastInspectorSelection(selection);
        sendResponse({ success: true, data: selection });
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
