import express from 'express';
import cors from 'cors';
import { defaultConfig, type KanbanData, type Task } from '@mdflow/types';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory storage
let kanbanData: KanbanData = { tasks: [], config: defaultConfig };
let archivedTasks: Task[] = [];

// GET /api/v1/kanban
app.get('/api/v1/kanban', (req, res) => {
  res.json(kanbanData);
});

// PUT /api/v1/kanban
app.put('/api/v1/kanban', (req, res) => {
  const data = req.body as KanbanData;
  if (data && Array.isArray(data.tasks) && data.config) {
    kanbanData = data;
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid data format' });
  }
});

// GET /api/v1/archive
app.get('/api/v1/archive', (req, res) => {
  res.json(archivedTasks);
});

// PUT /api/v1/archive
app.put('/api/v1/archive', (req, res) => {
  const tasks = req.body as Task[];
  if (tasks && Array.isArray(tasks)) {
    archivedTasks = tasks;
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid data format' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
