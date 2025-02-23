const puppeteer = require('puppeteer');

(async () => {
    console.log("🚀 Launching Puppeteer...");
    const browser = await puppeteer.launch({ headless: false });  // ✅ Open visible browser
    const page = await browser.newPage();

    console.log("🌍 Navigating to Wikipedia...");
    await page.goto('https://www.wikipedia.org/', { waitUntil: 'domcontentloaded' });

    console.log("⌨️ Typing 'Puppeteer' in search box...");
    await page.type('input[name="search"]', 'Puppeteer', { delay: 100 });

    console.log("🔍 Clicking search button...");
    await page.click('button[type="submit"]');

    console.log("⏳ Waiting for search results to load...");
    await page.waitForNavigation();

    console.log("⏳ Staying on page for 10 seconds...");
    await page.waitForTimeout(10000);  // ✅ Stay for 10 sec

    console.log("✅ Task complete! Closing browser...");
    await browser.close();
})();
