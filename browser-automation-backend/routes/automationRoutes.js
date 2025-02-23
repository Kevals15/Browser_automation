const express = require("express");
const router = express.Router();
const Task = require("../models/AutomationTask");
const puppeteer = require("puppeteer");
const { runPuppeteerTask } = require('../scripts/puppeteerTask'); // Import script
// const { executeTask } = require("../taskExecutor"); 

// Function to execute a task
const executeTask = async (task) => {
  let browser;
  let logs = [];
  try {
    console.log(`🚀 Starting task: ${task.name} on ${task.url}`);

    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"]
    });

    const page = await browser.newPage();
    await page.bringToFront();

    const start = Date.now();  // ✅ FIXED: Declare "start" before using it
    await page.goto(task.url, { waitUntil: "domcontentloaded", timeout: 60000 });

    for (const action of task.actions) {
      try {
        console.log(`⏳ Executing action: ${JSON.stringify(action)}`);

        switch (action.type) {
          case "click":
            console.log(`⏳ Waiting for ${action.selector}...`);
            try {
              await page.waitForSelector(action.selector, { visible: true, timeout: 10000 });
              await page.click(action.selector);
              logs.push(`✅ Clicked on ${action.selector}`);
            } catch (error) {
              logs.push(`❌ Failed to click ${action.selector}: ${error.message}`);
            }
            break;

          case "type":
            await new Promise(resolve => setTimeout(resolve, 2000));  // ✅ FIXED: Corrected timeout
            await page.type(action.selector, action.value || "", { delay: 200 });
            logs.push(`✅ Typed '${action.value}' in ${action.selector}`);
            break;

          case "scroll":
            await new Promise(resolve => setTimeout(resolve, 2000));
            await page.evaluate(() => window.scrollBy(0, 500));
            logs.push("✅ Scrolled down 500px");
            break;

          case "wait":
            await new Promise(resolve => setTimeout(resolve, action.waitForTime || 2000));
            logs.push(`⏳ Waited for ${action.waitForTime || 2000}ms`);
            break;

          case "focus":
            await page.waitForSelector(action.selector, { visible: true });
            await page.focus(action.selector);
            logs.push(`✅ Focused on ${action.selector}`);
            break;

          case "keyboardType":
            await page.keyboard.type(action.value, { delay: 100 });
            logs.push(`✅ Typed: "${action.value}"`);
            break;

          case "click":
            await page.waitForSelector(action.selector, { visible: true });
            await page.click(action.selector);
            logs.push(`✅ Clicked on ${action.selector}`);
            break;


          default:
            logs.push(`❌ Unknown action type: ${action.type}`);
        }
      } catch (err) {
        logs.push(`❌ Error in action '${JSON.stringify(action)}': ${err.message}`);
        console.error("❌ Puppeteer Error:", err);
        task.status = "failed";
        break;
      }
    }

    task.executionTime = Date.now() - start;
    task.status = "completed";
    task.errorLogs = logs;

    await new Promise(resolve => setTimeout(resolve, 5000));  // ✅ Wait 5 sec before closing
  } catch (error) {
    task.status = "failed";
    task.errorLogs = [`❌ Task failed: ${error.message}`];
    console.error("❌ Task Execution Error:", error);
  } finally {
    await task.save();
    if (browser) {
      await browser.close();
    }
  }
};


// Route: Get all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Route: Create a new task
router.post("/", async (req, res) => {
  try {
    const { name, url, actions } = req.body;


    if (!name || !url || !actions || actions.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const formattedActions = actions.map(({ value, ...task }) =>
      value ? { ...task, value } : task
    );

    const newTask = new Task({ name, url, actions: formattedActions });
    await newTask.save();

    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    console.error("Error in /tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route: Execute all pending tasks
router.post("/execute-all", async (req, res) => {
  try {
    const tasks = await Task.find({ status: "pending" });
    for (const task of tasks) {
      await executeTask(task);
    }
    res.status(200).json({ message: "All tasks executed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to execute all tasks" });
  }
});

// Route: Execute a single task
router.post("/:id/run", async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    console.log(`Executing Task: ${task.name} on ${task.url}`);

    // Call executeTask function
    await executeTask(task);

    res.json({ message: "Task executed successfully!", status: "completed" });
  } catch (error) {
    console.error("Error executing task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route: Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const AutomationTask = require('../models/AutomationTask');
// const { runPuppeteerTask } = require('../scripts/puppeteerTask');

// // Run Automation Task
// router.post('/:id/run', async (req, res) => {
//   try {
//     const taskId = req.params.id;
//     const task = await AutomationTask.findById(taskId);

//     if (!task) return res.status(404).json({ error: '❌ Task not found' });

//     console.log(`🚀 Running Task: ${task.name} on ${task.url}`);
//     await runPuppeteerTask(task);

//     res.json({ message: '✅ Task executed successfully', status: 'completed' });
//   } catch (error) {
//     console.error('❌ Error executing task:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // CRUD Operations
// router.get('/', async (req, res) => {
//   try {
//     const tasks = await AutomationTask.find();
//     res.status(200).json(tasks);
//   } catch (error) {
//     res.status(500).json({ error: '❌ Failed to fetch tasks' });
//   }
// });

// router.post('/', async (req, res) => {
//   try {
//     const { name, url, actions } = req.body;
//     if (!name || !url || !actions || actions.length === 0) {
//       return res.status(400).json({ error: "❌ Missing required fields" });
//     }

//     const newTask = new AutomationTask({ name, url, actions });
//     await newTask.save();
//     res.status(201).json({ message: "✅ Task created successfully", task: newTask });
//   } catch (error) {
//     res.status(500).json({ error: "❌ Internal server error" });
//   }
// });

// router.delete('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     await AutomationTask.findByIdAndDelete(id);
//     res.status(200).json({ message: '✅ Task deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: '❌ Failed to delete task' });
//   }
// // });

// module.exports = router;

