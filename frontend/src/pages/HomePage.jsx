import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography, Box, Button, TextField, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";

const HomePage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [tasks, setTasks] = useState([{ type: "", selector: "", value: "" }]);

  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...tasks];

    if (field === "type" && value === "click") {
      updatedTasks[index] = { ...updatedTasks[index], type: value, selector: "button[data-testid='send-button']" };
    } else if (field === "type") {
      updatedTasks[index] = { ...updatedTasks[index], type: value, selector: "" };
    } else {
      updatedTasks[index][field] = value;
    }

    setTasks(updatedTasks);
  };

  const addTask = () => {
    setTasks([...tasks, { type: "", selector: "", value: "" }]);
  };

  const removeTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5001/tasks", { name, url, actions: tasks });
      alert("Data sent successfully!");
      setName("");
      setUrl("");
      setTasks([{ type: "", selector: "", value: "" }]);
      navigate("/Runtasks");
    } catch (error) {
      console.error("Error sending data", error);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      // bgcolor="#f5f5f5"
      px={2}
    >
      {/* Header */}
      <Typography variant="h4" color="primary" gutterBottom fontWeight="bold">
        Browser Automation
      </Typography>

      <Card sx={{ width: "100%", maxWidth: 600, p: 4, boxShadow: 3, borderRadius: 2, backgroundColor: "#fff" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center" color="primary">
            Task Submission Form
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              type="text"
              label="Enter Task Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              type="url"
              label="Enter URL"
              variant="outlined"
              fullWidth
              margin="normal"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />

            <Typography variant="h6" gutterBottom>
              Task Details:
            </Typography>

            {tasks.map((task, index) => (
              <Box key={index} display="flex" alignItems="center" gap={2} mb={2}>
                <TextField
                  label="Type"
                  variant="outlined"
                  value={task.type}
                  onChange={(e) => handleTaskChange(index, "type", e.target.value)}
                  required
                />
                <TextField
                  label="Selector"
                  variant="outlined"
                  value={task.selector}
                  onChange={(e) => handleTaskChange(index, "selector", e.target.value)}
                  disabled={task.type === "click"} // Disable selector when type is "click"
                />
                <TextField
                  label="Value"
                  variant="outlined"
                  value={task.value}
                  onChange={(e) => handleTaskChange(index, "value", e.target.value)}
                />
                <IconButton onClick={() => removeTask(index)} color="error">
                  <Delete />
                </IconButton>
              </Box>
            ))}

            <Button variant="outlined" color="secondary" onClick={addTask} fullWidth sx={{ mt: 2 }}>
              Add Task
            </Button>

            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, py: 1.5, fontSize: "1rem" }}>
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HomePage;
