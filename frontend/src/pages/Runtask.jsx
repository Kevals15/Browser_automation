import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Delete, Edit, PlayArrow } from "@mui/icons-material";

const RunTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [editTask, setEditTask] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:5001/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  };

  const handleRun = async (id) => {
    try {
      const response = await axios.post(`http://localhost:5001/tasks/${id}/run`);
      alert("Task executed successfully!");
      console.log(response.data);
      fetchTasks();
    } catch (error) {
      console.error("Error running task", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error("Error deleting task", error);
    }
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setOpen(true);
  };

  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...editTask.actions];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setEditTask({ ...editTask, actions: updatedTasks });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5001/tasks/${editTask._id}`, editTask);
      fetchTasks();
      setOpen(false);
    } catch (error) {
      console.error("Error updating task", error);
    }
  };

  return (
    <div className="w-full h-full">
      <h2>Task List</h2>
      <TableContainer component={Paper}>
        <Table >
          <TableHead>
            <TableRow>
              <TableCell>Task Name</TableCell>
              <TableCell>Run</TableCell>
              <TableCell>Edit</TableCell>
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>{task.name}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleRun(task._id)} color="primary">
                    <PlayArrow />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(task)} color="secondary">
                    <Edit />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDelete(task._id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Task Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={editTask?.name || ""}
            onChange={(e) => setEditTask({ ...editTask, name: e.target.value })}
          />
          <TextField
            label="URL"
            fullWidth
            margin="normal"
            value={editTask?.url || ""}
            onChange={(e) => setEditTask({ ...editTask, url: e.target.value })}
          />
          <h4>Actions</h4>
          {editTask?.actions.map((action, index) => (
            <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <TextField
                label="Type"
                variant="outlined"
                value={action.type}
                onChange={(e) => handleTaskChange(index, "type", e.target.value)}
              />
              <TextField
                label="Selector"
                variant="outlined"
                value={action.selector}
                onChange={(e) => handleTaskChange(index, "selector", e.target.value)}
              />
              <TextField
                label="Value"
                variant="outlined"
                value={action.value}
                onChange={(e) => handleTaskChange(index, "value", e.target.value)}
              />
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdate} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RunTasks;
