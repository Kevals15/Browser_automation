// const puppeteer = require('puppeteer');
// const fs = require('fs');

// (async () => {
//   const browser = await puppeteer.launch({ headless: false }); // Open Chrome
//   const page = await browser.newPage();
  
//   // Navigate to a website
//   await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' });

//   /*** 1️⃣ Type in the Search Bar ***/
//   await page.type('input[name="q"]', 'Puppeteer tutorial', { delay: 100 });
//   console.log("Typed in search bar");

//   /*** 2️⃣ Click the Search Button ***/
//   await page.keyboard.press('Enter'); 
//   await page.waitForNavigation(); // Wait for results to load
//   console.log("Clicked search and navigated");

//   /*** 3️⃣ Scroll Down the Page ***/
//   await page.evaluate(() => window.scrollBy(0, 500));
//   console.log("Scrolled down 500px");

//   /*** 4️⃣ Select an Option from a Dropdown (Example: Wikipedia Language) ***/
//   await page.goto('https://www.wikipedia.org/', { waitUntil: 'domcontentloaded' });
//   await page.select('#searchLanguage', 'es'); // Select 'Español'
//   console.log("Selected 'Español' from dropdown");

//   /*** 5️⃣ Fetch Some Data from a Website ***/
//   const results = await page.evaluate(() => {
//     let titles = [];
//     document.querySelectorAll('.central-featured-lang a').forEach(el => {
//       titles.push(el.innerText);
//     });
//     return titles;
//   });

//   console.log("Fetched Data: ", results);

//   /*** 6️⃣ Store Data Locally (JSON File) ***/
//   fs.writeFileSync('data.json', JSON.stringify(results, null, 2));
//   console.log("Stored data in data.json");

//   /*** 7️⃣ Perform CRUD Operations (Local JSON File) ***/

//   // ➤ Create: Add a new entry
//   let jsonData = JSON.parse(fs.readFileSync('data.json'));
//   jsonData.push('New Language');
//   fs.writeFileSync('data.json', JSON.stringify(jsonData, null, 2));
//   console.log("Added new entry to data.json");

//   // ➤ Read: Fetch stored data
//   console.log("Reading stored data:", jsonData);

//   // ➤ Update: Modify an entry
//   jsonData[0] = "Updated Language";
//   fs.writeFileSync('data.json', JSON.stringify(jsonData, null, 2));
//   console.log("Updated first entry in data.json");

//   // ➤ Delete: Remove last entry
//   jsonData.pop();
//   fs.writeFileSync('data.json', JSON.stringify(jsonData, null, 2));
//   console.log("Deleted last entry in data.json");

//   /*** ✅ Close Browser After 5 Seconds ***/
//   await page.waitForTimeout(5000);
//   await browser.close();
// })();



// const puppeteer = require('puppeteer');
// const fs = require('fs');
// const path = require('path');
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// async function runPuppeteerTask(task) {
//   const browser = await puppeteer.launch({ headless: "new" });
//   const page = await browser.newPage();
  
//   await page.goto(task.url, { waitUntil: 'domcontentloaded' });

//   for (const action of task.actions) {
//     try {
//       switch (action.type) {
//         case 'type':
//           await page.type(action.selector, action.value || '');
//           break;
//         case 'click':
//           await page.click(action.selector);
//           break;
//         case 'scroll':
//           await page.evaluate(() => window.scrollBy(0, 500));
//           break;
//         case 'select':
//           await page.select(action.selector, action.value);
//           break;
//         case 'fetch_text':
//           const text = await page.$eval(action.selector, el => el.innerText);
//           console.log("📥 Fetched Text:", text);
//           fs.writeFileSync('data.json', JSON.stringify({ text }, null, 2));
//           break;
//         case 'fetch_links':
//           const links = await page.evaluate(() =>
//             Array.from(document.querySelectorAll('a')).map(a => a.href)
//           );
//           fs.writeFileSync('data.json', JSON.stringify(links, null, 2));
//           break;

//           case 'screenshot':
//   try {
//     console.log("🖼️ Attempting to take a screenshot via API...");

//     const screenshotDir = path.join(__dirname, 'screenshots');
//     if (!fs.existsSync(screenshotDir)) {
//       console.log("📁 'screenshots' folder not found. Creating it...");
//       fs.mkdirSync(screenshotDir);
//     }

//     const screenshotPath = path.join(screenshotDir, `${Date.now()}.png`);
//     console.log("📍 Screenshot Path:", screenshotPath);
    
//     await page.screenshot({ path: screenshotPath });
//     console.log("✅ Screenshot saved at:", screenshotPath);
//   } catch (error) {
//     console.error("❌ Screenshot error:", error);
//   }
//   break;

          
//         case 'export_csv':
//           const tableData = await page.evaluate(() => {
//             return Array.from(document.querySelectorAll('tr')).map(row =>
//               Array.from(row.querySelectorAll('td')).map(cell => cell.innerText)
//             );
//           });

//           const csvWriter = createCsvWriter({
//             path: 'output.csv',
//             header: tableData[0].map((_, index) => ({ id: index, title: `Column${index}` }))
//           });

//           await csvWriter.writeRecords(tableData.slice(1));
//           console.log("📄 Data exported to output.csv");
//           break;
//       }
//     } catch (error) {
//       console.error("❌ Action failed:", action.type, error);
//     }
//   }

//   await page.waitForTimeout(5000);
//   await browser.close();
// }

// module.exports = { runPuppeteerTask };


const puppeteer = require("puppeteer");
const Task = require("../models/AutomationTask");

const executeTask = async (taskId) => {
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      console.error("❌ Task Not Found!");
      return;
    }

    console.log(`🚀 Fetching Task URL for: ${task.name}`);
    console.log(`🔗 Task URL: ${task.url}`);

    let browser = await puppeteer.launch({ headless: false });
    let page = await browser.newPage();
    await page.goto(task.url, { waitUntil: "domcontentloaded" });
    
    console.log("✅ Successfully opened the task URL in browser");
    await browser.close();
  } catch (error) {
    console.error("❌ Error executing task:", error);
  }
};

module.exports = { executeTask };
