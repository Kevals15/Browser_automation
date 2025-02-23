const API_BASE_URL = "http://localhost:5001";  // Change if backend is hosted
const actions = []; // Store actions dynamically

// ✅ Fetch Tasks from Backend
async function fetchTasks() {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    const tasks = await response.json();
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";
        li.innerHTML = `
            <span>${task.name} - <strong>${task.status}</strong></span>
            <button onclick="runTask('${task._id}')">Run</button>
        `;
        taskList.appendChild(li);
    });
}

// ✅ Run Task Function
async function runTask(taskId) {
    alert(`Executing task: ${taskId}`);
    await fetch(`${API_BASE_URL}/tasks/${taskId}/run`, { method: "POST" });
    fetchTasks(); // Refresh tasks
}

// ✅ Add Action Dynamically
function addAction() {
    const actionType = prompt("Enter action type (click, type, scroll, wait):");
    if (!actionType) return;

    let actionDetails = { type: actionType };

    if (actionType === "click" || actionType === "type") {
        actionDetails.selector = prompt("Enter selector (e.g., button#submit):");
    }
    if (actionType === "type") {
        actionDetails.value = prompt("Enter text to type:");
    }
    if (actionType === "scroll") {
        actionDetails.scrollBy = parseInt(prompt("Enter scroll amount (e.g., 500):"), 10);
    }
    if (actionType === "wait") {
        actionDetails.waitForTime = parseInt(prompt("Enter wait time in ms:"), 10);
    }

    actions.push(actionDetails);
    renderActions();
}

// ✅ Render Actions in UI
function renderActions() {
    const actionList = document.getElementById("actionList");
    actionList.innerHTML = "";
    actions.forEach((action, index) => {
        const li = document.createElement("li");
        li.className = "action-item";
        li.innerHTML = `
            <span>${action.type} - ${JSON.stringify(action)}</span>
            <button onclick="deleteAction(${index})">Delete</button>
        `;
        actionList.appendChild(li);
    });
}

// ✅ Delete Action
function deleteAction(index) {
    actions.splice(index, 1);
    renderActions();
}

// ✅ Submit Task to Backend
document.getElementById("taskForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const taskName = document.getElementById("taskName").value;
    const url = document.getElementById("url").value;

    if (!taskName || !url || actions.length === 0) {
        alert("Please fill all fields and add at least one action!");
        return;
    }

    const task = { name: taskName, url, actions };
    await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });

    document.getElementById("taskForm").reset();
    actions.length = 0;
    renderActions();
    fetchTasks();
});

// ✅ Load Tasks on Page Load
fetchTasks();
