require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { Solver } = require("2captcha");
const openai = require("openai");

// ✅ Load credentials securely from .env file
const USERNAME = process.env.LEETCODE_USERNAME;
const PASSWORD = process.env.LEETCODE_PASSWORD;
const CAPTCHA_API_KEY = process.env.CAPTCHA_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ✅ Define Problem URL
const PROBLEM_URL = 'https://leetcode.com/problems/two-sum/';

(async () => {
    console.log("🚀 Launching Puppeteer...");
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    console.log("🔍 Checking if already logged in...");
    await page.goto("https://leetcode.com/", { waitUntil: "domcontentloaded" });

    try {
        // ✅ Check if user is already logged in
        await page.waitForSelector('a[href="/account/"]', { timeout: 5000 });
        console.log("✅ Already logged in! Skipping login...");
    } catch (error) {
        console.log("🔑 Not logged in. Proceeding with login...");
        await page.goto("https://leetcode.com/accounts/login/", { waitUntil: "domcontentloaded" });

        console.log("🔑 Waiting for login form...");
        await page.waitForSelector("input[name='login']", { visible: true });
        await page.type("input[name='login']", USERNAME, { delay: 100 });

        await page.waitForSelector("input[name='password']", { visible: true });
        await page.type("input[name='password']", PASSWORD, { delay: 100 });

        console.log("👀 Detecting 'I am human' reCAPTCHA...");

        // ✅ Fetch Google reCAPTCHA Key (googlekey)
        const googleKey = await page.evaluate(() => {
            const captchaElement = document.querySelector("div.g-recaptcha");
            return captchaElement ? captchaElement.getAttribute("data-sitekey") : null;
        });

        if (!googleKey) {
            console.log("❌ reCAPTCHA key not found! Please check manually.");
            process.exit(1);
        }

        console.log("🔑 Found Google reCAPTCHA Key:", googleKey);

        // ✅ Solve CAPTCHA using 2Captcha
        const solver = new Solver(CAPTCHA_API_KEY);
        console.log("⚠️ Solving CAPTCHA using 2Captcha...");

        const captchaResponse = await solver.recaptcha({
            pageurl: "https://leetcode.com/accounts/login/",
            googlekey: googleKey
        });

        console.log("✅ CAPTCHA Solved:", captchaResponse.data);

        // ✅ Inject CAPTCHA solution into LeetCode's form
        await page.evaluate((token) => {
            document.querySelector("#g-recaptcha-response").innerHTML = token;
        }, captchaResponse.data);

        console.log("✅ Clicking Submit...");
        await page.waitForSelector("button[type='submit']", { visible: true });
        await page.click("button[type='submit']");
        await page.waitForNavigation();

        console.log("🎉 Logged in successfully!");
    }

    // ✅ Step 2: Navigate to the problem page
    console.log("🌍 Navigating to problem page...");
    await page.goto(PROBLEM_URL, { waitUntil: 'domcontentloaded' });

    // ✅ Step 3: Extract the problem statement
    console.log("📥 Extracting problem statement...");
    const problemText = await page.evaluate(() => {
        return document.querySelector('.content__u3I1')?.innerText || "Problem statement not found.";
    });

    console.log("📝 Problem Statement Extracted:\n", problemText);

    // ✅ Step 4: Save problem statement to a file
    fs.writeFileSync('problem.txt', problemText);
    console.log("✅ Problem saved to problem.txt");

    // ✅ Step 5: Get solution from ChatGPT (OpenAI)
    console.log("🤖 Sending problem to ChatGPT...");

    const openaiClient = new openai.OpenAI({ apiKey: OPENAI_API_KEY });

    const response = await openaiClient.completions.create({
        model: "gpt-4",
        prompt: `Solve this LeetCode problem and provide a working solution in Python:\n\n${problemText}`,
        max_tokens: 500
    });

    const solution = response.choices[0].text;
    console.log("✅ Solution received from ChatGPT!");

    // ✅ Step 6: Save solution to a file
    fs.writeFileSync('solution.py', solution);
    console.log("✅ Solution saved to solution.py");

    // ✅ Step 7: Paste the solution into LeetCode editor
    console.log("🖥️ Pasting solution into LeetCode editor...");
    await page.evaluate((solutionCode) => {
        const editor = document.querySelector('.monaco-editor textarea');
        if (editor) {
            editor.value = solutionCode;
        }
    }, solution);

    console.log("✅ Solution pasted!");

    // ✅ Step 8: Submit the solution
    console.log("🚀 Submitting the solution...");
    await page.click('.submit__2ISl button');
    console.log("✅ Solution Submitted!");

    await browser.close();
})();
