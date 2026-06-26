# Test Recorder Chrome Extension

A powerful Chrome extension that records user interactions and automatically generates test scripts in multiple formats (Selenium, Cypress, Playwright).

## Features

✅ **Record User Interactions**
- Click events
- Text input
- Select/dropdown changes
- Element highlighting

✅ **Multi-Format Export**
- Selenium (Python)
- Cypress (JavaScript)
- Playwright (Python)

✅ **Script Generation**
- Automatic selector generation (ID, CSS, XPath)
- Wait time recording
- Clean, readable code

✅ **Easy Controls**
- Start/Stop recording with one click
- Pause/Resume functionality
- Download or copy scripts
- Clear recordings

## Installation

1. Clone this repository
2. Open `chrome://extensions/` in Chrome
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your Chrome toolbar

## Usage

1. Click the extension icon in your toolbar
2. Click **"Start Recording"**
3. Interact with your website normally
4. Click **"Stop Recording"** when done
5. Select your desired format (Selenium, Cypress, Playwright)
6. Download or copy the generated script

## Supported Selectors

- **ID**: Direct ID attribute matching
- **CSS Class**: Class-based selectors
- **XPath**: Fallback XPath generation

## Settings

- **Capture Screenshots**: Save visual proof of actions
- **Capture Network Requests**: Log API calls
- **Record Wait Times**: Include implicit waits

## Generated Script Examples

### Selenium (Python)
```python
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get("https://example.com")
driver.find_element(By.ID, "search-box").send_keys("test")
driver.find_element(By.CSS_SELECTOR, ".search-btn").click()
driver.quit()
```

### Cypress (JavaScript)
```javascript
cy.visit('https://example.com')
cy.get('#search-box').type('test')
cy.get('.search-btn').click()
```

### Playwright (Python)
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('https://example.com')
    page.fill('#search-box', 'test')
    page.click('.search-btn')
```

## Development

### Project Structure
```
test-recorder-extension/
├── manifest.json          # Extension configuration
├── popup.html/js/css      # UI controls
├── content.js/css         # Page interaction handler
├── background.js          # Service worker
└── README.md             # Documentation
```

### Contributing
Pull requests are welcome! Please ensure:
- Code is well-commented
- New features are tested
- Documentation is updated

## License

MIT License

## Future Enhancements

- 🎯 Screenshot capture with annotations
- 🔍 Advanced element identification
- 📊 Test execution reporting
- 🔄 Cross-browser testing
- 🎬 Video replay of actions
- 🤖 AI-powered test optimization
