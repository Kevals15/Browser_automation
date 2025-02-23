const mongoose = require("mongoose");
const AutomationTask = require("./models/AutomationTask"); // ✅ Ensure this is the correct path
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log("✅ Successfully connected to MongoDB Atlas!");

        // Fetch tasks
        const tasks = await AutomationTask.find();
        console.log("📌 All Tasks:", tasks);

        process.exit();
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });
