# AS Web Recorder - Advanced Test Automation Extension

## 🚀 Features

### Core Recording Features
- ✅ **User Interaction Recording**: Capture clicks, text input, selections, and form submissions
- ✅ **Multiple Selector Strategies**: ID, Name, CSS Class, CSS Selector, XPath, Text Content
- ✅ **Smart Element Detection**: Intelligent selector generation for more reliable tests
- ✅ **Visual Feedback**: Real-time highlighting of recorded elements

### Advanced Features

#### 📸 Screenshot Capture
- Auto-capture screenshots at each step
- Visual proof of test execution
- Integration with test documentation

#### 🔗 Network Monitoring
- Monitor all API calls (XHR, Fetch)
- Record HTTP methods, status codes, URLs
- Performance metrics (duration, timing)
- Filter and view network activity

#### ✔️ Test Assertions
- Text content assertions
- Element visibility checks
- URL validation
- Custom assertion recording
- Network response assertions

#### ▶️ Playback & Validation
- Real-time test playback
- Variable speed control (0.5x, 1x, 2x)
- Step-by-step execution
- Pass/Fail indication

#### 💾 Test Case Management
- Save multiple test cases
- Organize by project/suite
- Load and re-run saved tests
- Version history
- Timestamped saves

#### 📥 Advanced Export Options

**Frameworks Supported:**
- Selenium (Python & Java)
- Cypress (JavaScript)
- Playwright (Python & JavaScript)
- TestNG (Java)
- Robot Framework
- Protractor
- Custom JSON format

**Export Options:**
- Include/exclude screenshots
- Include/exclude network calls
- Include/exclude assertions
- Formatted, production-ready code

### Smart Features
- ⏱️ **Wait Time Recording**: Automatically capture timing between actions
- 🎯 **Selector Optimization**: Multiple selector strategies for reliability
- 🔄 **Pause/Resume**: Pause recording without losing data
- 📊 **Real-time Statistics**: Track actions, screenshots, API calls
- 🎨 **Modern UI**: Tabbed interface for organized workflow

## 📋 Installation

1. Clone or download this repository
2. Open `chrome://extensions/` in Chrome
3. Enable **"Developer mode"** (top-right corner)
4. Click **"Load unpacked"**
5. Select the extension folder
6. Extension appears in your toolbar!

## 🎯 Usage Guide

### Quick Start

1. **Click the extension icon** in your toolbar
2. **Enter test details** in Settings tab (optional)
3. **Enable features** you want:
   - 📸 Capture Screenshots
   - 🔗 Monitor Network
   - ⏱️ Record Wait Times
   - ✔️ Record Assertions
4. **Click "Start Recording"**
5. **Interact with your website** normally
6. **Click "Stop Recording"** when done
7. **Export** in your preferred framework

### Recording Tab
- Start/Stop/Pause recording
- View real-time statistics
- Configure capture options

### Assertions Tab
- Add text content assertions
- Add URL assertions
- Add visibility checks
- Manage all assertions in one place

### Network Tab
- View all API calls captured
- Filter by URL
- Check status codes
- Review performance metrics

### Export Tab
- **Choose Framework**: Select from 9+ frameworks
- **Configure Options**: Include screenshots, network, assertions
- **Preview**: See generated code before export
- **Download**: Save as file
- **Copy**: Copy to clipboard

### Playback Tab
- Play back recorded test
- Control playback speed
- View step-by-step results
- Verify test behavior

### Settings Tab
- **Test Details**: Name and project organization
- **Recording Settings**: Timeouts, screenshot quality
- **Test Management**: Save/Load/Clear
- **Saved Tests**: Manage all saved test cases

## 📊 Generated Code Examples

### Selenium (Python)
```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class TestLogin:
    def setup_method(self):
        self.driver = webdriver.Chrome()
        self.wait = WebDriverWait(self.driver, 10)

    def test_login_flow(self):
        self.driver.get("https://example.com/login")
        # Step 1: Click on email field
        element = self.wait.until(EC.presence_of_element_located((By.ID, "email")))
        element.click()
        # Step 2: Type email
        element = self.driver.find_element(By.ID, "email")
        element.clear()
        element.send_keys("user@example.com")
        # Assertions
        assert "user@example.com" in self.driver.page_source
```

### Cypress
```javascript
describe('Login Suite', () => {
  beforeEach(() => {
    cy.visit('https://example.com/login')
  })

  it('should complete login flow', () => {
    cy.get('#email').click()
    cy.get('#email').type('user@example.com')
    cy.get('#password').type('password123')
    cy.get('button[type="submit"]').click()
    cy.contains('Dashboard').should('exist')
  })
})
```

### Playwright (Python)
```python
from playwright.sync_api import sync_playwright

def test_login():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto('https://example.com/login')
        page.click('#email')
        page.fill('#email', 'user@example.com')
        page.click('button[type="submit"]')
        assert 'Dashboard' in page.content()
        browser.close()
```

## ⚙️ Configuration

### Recording Options
- **Capture Screenshots**: Toggle screenshot capture on/off
- **Monitor Network**: Toggle API monitoring
- **Record Wait Times**: Include timing between actions
- **Record Assertions**: Enable assertion recording

### Export Settings
- **Framework Selection**: Choose your test framework
- **Code Format**: Automatically formatted and production-ready
- **Include Options**: Select what to include in export

### Performance Settings
- **Wait Timeout**: Set default wait timeout (ms)
- **Screenshot Quality**: High/Medium/Low
- **Playback Speed**: 0.5x, 1x, 2x

## 🎬 Playback Features

- ▶️ **Play Test**: Execute recorded test steps
- ⏸️ **Speed Control**: Adjust playback speed
- 📊 **Results**: See pass/fail status for each step
- 🛑 **Stop**: Stop playback at any time

## 💾 Test Management

- **Save Test Case**: Save with custom name
- **Load Test Case**: Retrieve previously saved tests
- **View History**: See saved at timestamp
- **Delete Test**: Remove unwanted tests
- **Organize**: Group by project/suite

## 🌐 Supported Frameworks

| Framework | Language | Status |
|-----------|----------|--------|
| Selenium | Python | ✅ Full Support |
| Selenium | Java | ✅ Full Support |
| Cypress | JavaScript | ✅ Full Support |
| Playwright | Python | ✅ Full Support |
| Playwright | JavaScript | ✅ Full Support |
| TestNG | Java | ✅ Full Support |
| Robot Framework | Robot | ✅ Full Support |
| Protractor | JavaScript | ✅ Full Support |
| Custom | JSON | ✅ Full Support |

## 🔍 Selector Strategies

1. **ID** - Most reliable (if available)
2. **Name** - Attribute-based targeting
3. **CSS Class** - Style-based selection
4. **CSS Selector** - Generated complex selector
5. **Text Content** - Content-based matching
6. **XPath** - Full DOM path

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Brave 1.0+
- ✅ Opera 76+

## 🔒 Sharing Without Exposing Source

Browser extensions always ship code to the user's machine, so the source cannot be fully hidden from someone determined to inspect it.

This repository now includes an obfuscated distribution flow to make the shipped code much harder to read:

```powershell
npm install
npm run build
npm run package
```

That creates:

- `build/dist/` - obfuscated extension folder for loading in `chrome://extensions`
- `build/AS-Web-Recorder.zip` - zip file you can send to friends

Your friends can use the zip by extracting it and loading the extracted `dist` folder with **Load unpacked** in Chromium-based browsers.

## 🤖 GitHub Actions Build

This repository now includes a GitHub Actions workflow at `.github/workflows/build-pr-zip.yml`.

When you push to a branch whose name starts with `pr`, GitHub Actions will:

- install dependencies
- build the obfuscated extension
- create `AS-Web-Recorder.zip`
- upload the zip as a workflow artifact

Supported branch patterns:

- `pr-my-feature`
- `pr_my_feature`
- `pr/my-feature`

## 🐛 Troubleshooting

### Recording Not Capturing
- Ensure extension permissions are enabled
- Refresh the page and try again
- Check browser console for errors

### Screenshot Issues
- Verify "Capture Screenshots" is enabled
- Check available disk space
- Try reducing screenshot quality

### Export Errors
- Ensure test case has valid name
- Check for special characters in framework code
- Verify test has at least one action

### Network Monitoring Not Working
- Enable "Monitor Network" option
- Ensure page loads external APIs
- Check network requests in browser DevTools

## 🚀 Advanced Usage

### Batch Testing
1. Record multiple test scenarios
2. Save each with unique name
3. Export all to same framework
4. Run suite in your test runner

### CI/CD Integration
1. Export tests in desired framework
2. Commit to repository
3. Integrate with CI/CD pipeline
4. Run on every commit

### Test Maintenance
1. Load saved test
2. Re-record sections if needed
3. Update assertions
4. Save updated version

## 📝 License

MIT License - Feel free to use, modify, and distribute

## 🤝 Contributing

Contributions welcome! Please:
- Fork the repository
- Create feature branch
- Commit changes
- Push to branch
- Create Pull Request

## 📧 Support

For issues, questions, or suggestions:
- Check existing GitHub issues
- Create new issue with details
- Include error messages and screenshots

## 🎉 Future Enhancements

- 🤖 AI-powered selector optimization
- 📸 Visual regression testing
- 🔄 Cross-browser testing
- 📊 Test analytics dashboard
- 🎬 Video recording of tests
- 🌍 Multi-language support
- 🔐 Test encryption
- ☁️ Cloud backup and sync
- 👥 Team collaboration
- 📱 Mobile testing support

## 🎓 Resources

- [Selenium Documentation](https://www.selenium.dev/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Robot Framework](https://robotframework.org/)

---

**Version**: 2.0.0  
**Last Updated**: 2024  
**Maintained by**: Test Recorder Pro Team
