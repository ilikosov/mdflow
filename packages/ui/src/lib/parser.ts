import type { KanbanData, Task, Config } from '@mdflow/types';

// Parse Markdown content to KanbanData (port of parseMarkdown and parseTasksFromSection)
export function parseMarkdown(content: string): KanbanData {
  const tasks: Task[] = [];
  const config: Config = {
    lastTaskId: 0,
    columns: [],
    categories: [],
    users: [],
    priorities: [],
    tags: []
  };

  // Parse config comment
  const configMatch = content.match(/<!-- Config: Last Task ID: (\d+) -->/);
  if (configMatch) {
    config.lastTaskId = parseInt(configMatch[1]);
  }

  // Parse config section
  const configSection = content.match(/## ⚙️ Configuration\s+([\s\S]*?)---/);
  if (configSection) {
    const configText = configSection[1];

    // Parse columns
    const columnsMatch = configText.match(/\*\*Columns\*\*:\s*(.+)/);
    if (columnsMatch) {
      config.columns = columnsMatch[1].split('|').map(col => {
        const match = col.trim().match(/(.+?)\s*\((.+?)\)/);
        if (match) {
          return { name: match[1].trim(), id: match[2].trim() };
        }
        return null;
      }).filter(Boolean) as Array<{ name: string; id: string }>;
    }

    // Parse categories
    const categoriesMatch = configText.match(/\*\*Categories\*\*:\s*(.+)/);
    if (categoriesMatch) {
      config.categories = categoriesMatch[1].split(',').map(c => c.trim()).filter(Boolean);
    }

    // Parse users
    const usersMatch = configText.match(/\*\*Users\*\*:\s*(.+)/);
    if (usersMatch) {
      config.users = usersMatch[1].split(',').map(u => u.trim()).filter(Boolean);
    }

    // Parse priorities
    const prioritiesMatch = configText.match(/\*\*Priorities\*\*:\s*(.+)/);
    if (prioritiesMatch) {
      config.priorities = prioritiesMatch[1].split('|').map(p => p.trim()).filter(Boolean);
    }

    // Parse tags
    const tagsMatch = configText.match(/\*\*Tags\*\*:\s*(.+)/);
    if (tagsMatch) {
      config.tags = tagsMatch[1].split(/\s+/).filter(t => t.startsWith('#')).map(t => t.replace('#', ''));
    }
  }

  // Default columns if not found
  if (config.columns.length === 0) {
    config.columns = [
      { name: '📝 To Do', id: 'todo' },
      { name: '🚀 In Progress', id: 'in-progress' },
      { name: '👀 In Review', id: 'in-review' },
      { name: '✅ Done', id: 'done' }
    ];
  }

  // Default values
  if (config.categories.length === 0) {
    config.categories = ['Frontend', 'Backend', 'Design', 'DevOps', 'Tests', 'Documentation'];
  }
  if (config.users.length === 0) {
    config.users = ['@user (User)'];
  }
  if (config.priorities.length === 0) {
    config.priorities = ['🔴 Critical', '🟠 High', '🟡 Medium', '🟢 Low'];
  }
  if (config.tags.length === 0) {
    config.tags = ['bug', 'feature', 'ui', 'backend', 'urgent', 'refactor', 'docs', 'test'];
  }

  // Parse tasks by sections
  config.columns.forEach(column => {
    const columnTasks = parseTasksFromSection(content, column.name, column.id);
    tasks.push(...columnTasks);
  });

  return { tasks, config };
}

// Parse tasks from a markdown section
function parseTasksFromSection(content: string, sectionName: string, statusId: string): Task[] {
  const tasksFound: Task[] = [];

  // Split by ## to get sections
  const sections = content.split(/\n##\s+/);
  let sectionContent: string | null = null;

  for (const section of sections) {
    if (section.startsWith(sectionName)) {
      sectionContent = section.substring(sectionName.length).trim();
      break;
    }
  }

  if (!sectionContent) {
    return tasksFound;
  }

  // Split by ### TASK-
  const taskBlocks = sectionContent.split(/###\s+TASK-/).slice(1);

  taskBlocks.forEach(block => {
    const lines = block.split('\n');
    const firstLine = lines[0].trim();

    // Extract ID and title from first line
    const pipeIndex = firstLine.indexOf('|');
    if (pipeIndex > 0) {
      const idPart = firstLine.substring(0, pipeIndex).trim();
      const titlePart = firstLine.substring(pipeIndex + 1).trim();

      const idMatch = idPart.match(/^(\d+)$/);
      if (idMatch && titlePart) {
        const taskId = 'TASK-' + idMatch[1].padStart(3, '0');
        const taskContent = lines.slice(1).join('\n');
        const task = parseTask(taskId, titlePart, taskContent, statusId);
        if (task) {
          tasksFound.push(task);
        }
      }
    }
  });

  return tasksFound;
}

// Parse individual task
function parseTask(id: string, title: string, content: string, status: string): Task {
  const task: Task = {
    id,
    title: title.trim(),
    status,
    priority: '',
    category: '',
    assignees: [],
    tags: [],
    created: '',
    started: '',
    due: '',
    completed: '',
    description: '',
    subtasks: [],
    notes: ''
  };

  // Parse metadata line
  const metaMatch = content.match(/\*\*Priority\*\*:\s*(\w+)\s*\|\s*\*\*Category\*\*:\s*([^|]+?)(?:\s*\|\s*\*\*Assigned\*\*:\s*(.+?))?$/m);
  if (metaMatch) {
    task.priority = metaMatch[1].trim();
    task.category = metaMatch[2].trim();
    if (metaMatch[3]) {
      task.assignees = metaMatch[3].split(',').map(a => a.trim());
    }
  }

  // Parse dates
  const createdMatch = content.match(/\*\*Created\*\*:\s*([\d-]+)/);
  if (createdMatch) task.created = createdMatch[1];

  const startedMatch = content.match(/\*\*Started\*\*:\s*([\d-]+)/);
  if (startedMatch) task.started = startedMatch[1];

  const dueMatch = content.match(/\*\*Due\*\*:\s*([\d-]+)/);
  if (dueMatch) task.due = dueMatch[1];

  const completedMatch = content.match(/\*\*Finished\*\*:\s*([\d-]+)/);
  if (completedMatch) task.completed = completedMatch[1];

  // Parse tags
  const tagsMatch = content.match(/\*\*Tags\*\*:\s*(.+)/);
  if (tagsMatch) {
    task.tags = tagsMatch[1].match(/#[\w-]+/g) || [];
  }

  // Parse description
  const lines = content.split('\n');
  const descriptionLines: string[] = [];
  let inDescription = false;

  for (const line of lines) {
    if (line.match(/^\*\*(Priority|Category|Assigned|Created|Started|Due|Finished|Tags)\*\*/)) {
      continue;
    }
    if (line.match(/^\*\*(Subtasks|Notes|Links|Review|Dependencies)\*\*/)) {
      break;
    }
    if (line.trim() && !inDescription) {
      inDescription = true;
    }
    if (inDescription && line.trim()) {
      descriptionLines.push(line.trim());
    }
  }
  task.description = descriptionLines.join(' ').substring(0, 200);

  // Parse subtasks
  const subtaskMatches = content.matchAll(/- \[(x| )\] (.+)/g);
  for (const match of subtaskMatches) {
    task.subtasks.push({
      completed: match[1] === 'x',
      text: match[2].trim()
    });
  }

  // Parse notes
  const notesMatch = content.match(/\*\*Notes\*\*:\s*\n([\s\S]*?)$/);
  if (notesMatch) {
    task.notes = notesMatch[1].trim();
  }

  return task;
}

// Generate Markdown from KanbanData
export function generateMarkdown(data: KanbanData): string {
  const { tasks, config } = data;

  // Update config with values from tasks
  const allCategories = new Set(config.categories);
  const allUsers = new Set(config.users);
  const allTags = new Set(config.tags);

  tasks.forEach(task => {
    if (task.category) allCategories.add(task.category);
    task.assignees.forEach(u => allUsers.add(u));
    task.tags.forEach(t => allTags.add(t.replace('#', '')));
  });

  config.categories = [...allCategories];
  config.users = [...allUsers];
  config.tags = [...allTags];

  let md = `# Kanban Board\n\n<!-- Config: Last Task ID: ${config.lastTaskId} -->\n\n`;
  md += `## ⚙️ Configuration\n\n`;
  md += `**Columns**: ${config.columns.map(c => `${c.name} (${c.id})`).join(' | ')}\n\n`;
  md += `**Categories**: ${config.categories.join(', ')}\n\n`;
  md += `**Users**: ${config.users.join(', ')}\n\n`;
  md += `**Priorities**: ${config.priorities.join(' | ')}\n\n`;
  md += `**Tags**: ${config.tags.map(t => '#' + t).join(' ')}\n\n`;
  md += `---\n\n`;

  // Add tasks by column
  config.columns.forEach(column => {
    md += `## ${column.name}\n\n`;

    const columnTasks = tasks.filter(t => t.status === column.id);
    columnTasks.forEach(task => {
      md += `### ${task.id} | ${task.title}\n`;

      let meta = '';
      if (task.priority) meta += `**Priority**: ${task.priority}`;
      if (task.category) meta += ` | **Category**: ${task.category}`;
      if (task.assignees.length > 0) meta += ` | **Assigned**: ${task.assignees.join(', ')}`;
      if (meta) md += meta + '\n';

      let dates = '';
      if (task.created) dates += `**Created**: ${task.created}`;
      if (task.started) dates += (dates ? ' | ' : '') + `**Started**: ${task.started}`;
      if (task.due) dates += (dates ? ' | ' : '') + `**Due**: ${task.due}`;
      if (task.completed) dates += (dates ? ' | ' : '') + `**Finished**: ${task.completed}`;
      if (dates) md += dates + '\n';

      if (task.tags.length > 0) {
        md += `**Tags**: ${task.tags.join(' ')}\n`;
      }

      if (task.description) {
        md += `\n${task.description}\n`;
      }

      if (task.subtasks.length > 0) {
        md += `\n**Subtasks**:\n`;
        task.subtasks.forEach(st => {
          md += `- [${st.completed ? 'x' : ' '}] ${st.text}\n`;
        });
      }

      if (task.notes) {
        md += `\n**Notes**:\n${task.notes}\n`;
      }

      md += `\n`;
    });
  });

  return md;
}
