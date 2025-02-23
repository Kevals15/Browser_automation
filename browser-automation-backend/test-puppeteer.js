const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log("🚀 Launching Puppeteer...");
  const browser = await puppeteer.launch({ headless: false }); // ✅ Open Chrome
  const page = await browser.newPage();
  
  console.log("🌍 Navigating to Google...");
  await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' });

  console.log("📸 Taking screenshot...");
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    console.log("📁 'screenshots' folder does not exist. Creating it...");
    fs.mkdirSync(screenshotDir);
  }
  
  const screenshotPath = path.join(screenshotDir, `${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath });

  console.log("✅ Screenshot saved at:", screenshotPath);

  await browser.close();
})();
