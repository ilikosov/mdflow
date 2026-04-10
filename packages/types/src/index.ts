import * as v from 'valibot';

// Subtask schema
export const SubtaskSchema = v.object({
  completed: v.boolean(),
  text: v.string()
});
export type Subtask = v.InferOutput<typeof SubtaskSchema>;

// Task schema
export const TaskSchema = v.object({
  id: v.string(),
  title: v.string(),
  status: v.string(),
  priority: v.string(),
  category: v.string(),
  assignees: v.array(v.string()),
  tags: v.array(v.string()),
  created: v.string(),
  started: v.string(),
  due: v.string(),
  completed: v.string(),
  description: v.string(),
  subtasks: v.array(SubtaskSchema),
  notes: v.string()
});
export type Task = v.InferOutput<typeof TaskSchema>;

// Column schema
export const ColumnSchema = v.object({
  name: v.string(),
  id: v.string()
});
export type Column = v.InferOutput<typeof ColumnSchema>;

// Config schema
export const ConfigSchema = v.object({
  lastTaskId: v.number(),
  columns: v.array(ColumnSchema),
  categories: v.array(v.string()),
  users: v.array(v.string()),
  priorities: v.array(v.string()),
  tags: v.array(v.string())
});
export type Config = v.InferOutput<typeof ConfigSchema>;

// KanbanData schema (tasks + config)
export const KanbanDataSchema = v.object({
  tasks: v.array(TaskSchema),
  config: ConfigSchema
});
export type KanbanData = v.InferOutput<typeof KanbanDataSchema>;

// Default configuration matching the original
export const defaultConfig: Config = {
  lastTaskId: 0,
  columns: [
    { name: '📝 To Do', id: 'todo' },
    { name: '🚀 In Progress', id: 'in-progress' },
    { name: '👀 In Review', id: 'in-review' },
    { name: '✅ Done', id: 'done' }
  ],
  categories: ['Frontend', 'Backend', 'Design', 'DevOps', 'Tests', 'Documentation'],
  users: ['@user (User)'],
  priorities: ['🔴 Critical', '🟠 High', '🟡 Medium', '🟢 Low'],
  tags: ['bug', 'feature', 'ui', 'backend', 'urgent', 'refactor', 'docs', 'test']
};