const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  actions: { type: Array, required: true },
  status: { type: String, default: 'pending' },
  executionTime: { type: Date, default: null },
  logs: { type: Array, default: [] } // Store logs
});

module.exports = mongoose.model('Task', taskSchema);

// const mongoose = require('mongoose');

// const automationTaskSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   url: { type: String, required: true },
//   actions: [
//     {
//       type: { type: String, required: true },
//       selector: { type: String, required: false },
//       value: { type: String, required: false }
//     }
//   ],
//   status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
//   executionTime: { type: Number },
//   errorLogs: { type: [String] }
// });

// module.exports = mongoose.model('AutomationTask', automationTaskSchema);
