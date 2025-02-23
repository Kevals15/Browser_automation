const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
// const Task = require('./taskModel');
require('dotenv').config();

const taskRoutes = require('./routes/automationRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/tasks', taskRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();  // ✅ Define "app" first
// const port = 5001;

// const taskRoutes = require('./routes/automationRoutes'); // ✅ Corrected Path// ✅ Correct path
// app.use('/tasks', taskRoutes);  // ✅ Now it's safe to use "app"


// // Middleware
// app.use(express.json());  // ✅ Parse JSON body
// app.use(cors());          // ✅ Enable CORS if needed

// // MongoDB Atlas Connection
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log("Connected to MongoDB Atlas"))
//     .catch(err => console.log("MongoDB Connection Error:", err));

// // Define Schema
// const taskSchema = new mongoose.Schema({
//     name: String,
//     url: String,
//     actions: Array
// });

// const Task = mongoose.model("Task", taskSchema);

// // ✅ Correct Route for POST /tasks
// app.post("/tasks", async (req, res) => {
//     try {
//         const { name, url, actions } = req.body;
//         if (!name || !url || !actions) {
//             return res.status(400).json({ error: "Missing required fields" });
//         }

//         const newTask = new Task({ name, url, actions });
//         await newTask.save();
//         res.status(201).json({ message: "Task created", task: newTask });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Start the Server
// app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
