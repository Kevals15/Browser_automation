const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const Task = require("./models/AutomationTask");
// const Task = require('./taskModel');

const executeTask = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) return console.error("❌ Task Not Found!");

  let browser;
  let logs = [];

  try {
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    console.log(`🚀 Starting Task: ${task.name}`);

    await page.goto(task.url, { waitUntil: "domcontentloaded" });

    for (const action of task.actions) {
      try {
        switch (action.type) {
          case "type":
            await page.type(action.selector, action.value || "", { delay: 100 });
            logs.push(`Typed '${action.value}' in ${action.selector}`);
            break;
          case "click":
            await page.click(action.selector);
            logs.push(`Clicked on ${action.selector}`);
            break;
          case "goto":
            await page.goto(action.url, { waitUntil: "domcontentloaded" });
            logs.push(`Navigated to ${action.url}`);
            break;
          case "wait":
            await page.waitForTimeout(action.waitForTime || 2000);
            logs.push(`Waited for ${action.waitForTime}ms`);
            break;
          case "extract":
            const extractedValue = await page.evaluate(
              (sel, attr) => document.querySelector(sel)?.getAttribute(attr),
              action.selector,
              action.attribute
            );
            const problemLink = `Today's LeetCode Question: https://leetcode.com${extractedValue}`;
            logs.push(`Extracted value: ${problemLink}`);
            console.log(`🎯 ${problemLink}`);

            // Save extracted problem to a text file
            const filePath = path.join(__dirname, "leetcode_problem.txt");
            fs.writeFileSync(filePath, problemLink);
            console.log(`✅ Problem saved at: ${filePath}`);

            // Open the file automatically in Notepad (Windows Only)
            exec(`notepad "${filePath}"`, (err) => {
              if (err) console.error("❌ Failed to open Notepad:", err);
            });

            break;
          default:
            logs.push(`Unknown action type: ${action.type}`);
        }
      } catch (err) {
        logs.push(`Error in action '${JSON.stringify(action)}': ${err.message}`);
        task.status = "failed";
        break;
      }
    }

    task.status = "completed";
    task.logs = logs;
    await task.save();
    console.log("✅ Task Completed!");

  } catch (error) {
    task.status = "failed";
    task.logs.push(`Task failed: ${error.message}`);
    console.error("❌ Task Execution Failed:", error);
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = { executeTask };
