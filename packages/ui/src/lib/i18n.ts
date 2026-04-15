// Translation system
export type Language = 'en' | 'fr';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'header.title': '📋 Task Manager',
    'header.newTask': '➕ Task',
    'header.archives': '📦 Archives',
    'header.columns': '⚙️ Columns',

    // Filters
    'filters.tags': 'Tags:',
    'filters.category': 'Category:',
    'filters.user': 'User:',
    'filters.priority': 'Priority:',
    'filters.select': 'Select...',
    'filters.add': '+',
    'filters.clearAll': '✕ Clear all',
    'filters.search': 'Search in tasks...',

    // Task detail modal
    'taskDetail.title': 'Task Details',
    'taskDetail.close': 'Close',
    'taskDetail.delete': '🗑️ Delete',
    'taskDetail.archive': '📦 Archive',
    'taskDetail.edit': '✏️ Edit',

    // Task form modal
    'taskForm.newTask': 'New Task',
    'taskForm.editTask': 'Edit Task',
    'taskForm.titleLabel': 'Title *',
    'taskForm.columnLabel': 'Column *',
    'taskForm.priorityLabel': 'Priority',
    'taskForm.priorityNone': 'None',
    'taskForm.priorityCritical': '🔴 Critical',
    'taskForm.priorityHigh': '🟠 High',
    'taskForm.priorityMedium': '🟡 Medium',
    'taskForm.priorityLow': '🟢 Low',
    'taskForm.categoryLabel': 'Category',
    'taskForm.categoryPlaceholder': 'Frontend, Backend...',
    'taskForm.assignedLabel': 'Assigned to',
    'taskForm.assignedPlaceholder': '@alice',
    'taskForm.createdLabel': 'Created',
    'taskForm.startedLabel': 'Started',
    'taskForm.dueLabel': 'Due',
    'taskForm.completedLabel': 'Completed',
    'taskForm.tagsLabel': 'Tags',
    'taskForm.tagsPlaceholder': '#bug #feature',
    'taskForm.tagsHelp': 'Separate with spaces',
    'taskForm.descriptionLabel': 'Description',
    'taskForm.subtasksLabel': 'Subtasks',
    'taskForm.subtaskPlaceholder': 'Add a subtask...',
    'taskForm.subtaskAdd': '+ Add',
    'taskForm.notesLabel': 'Notes',
    'taskForm.notesPlaceholder': 'Technical notes, results, decisions, etc...',
    'taskForm.notesHelp':
      'Markdown supported: **bold**, *italic*, `code`, lists, links, **Subsections**:',
    'taskForm.cancel': 'Cancel',
    'taskForm.create': 'Create',
    'taskForm.save': 'Save',

    // Columns modal
    'columns.title': 'Manage Columns',
    'columns.add': '+ Add Column',

    // Archives modal
    'archives.title': '📦 Archives',
    'archives.search': 'Search in archives...',
    'archives.empty': 'No archived tasks',

    // Task metadata
    'meta.priority': 'Priority',
    'meta.status': 'Status',
    'meta.category': 'Category',
    'meta.assigned': 'Assigned to',
    'meta.created': 'Creation date',
    'meta.started': 'Start date',
    'meta.due': 'Due date',
    'meta.completed': 'Completion date',
    'meta.tags': 'Tags',
    'meta.description': 'Description',
    'meta.subtasks': 'Subtasks ({completed}/{total})',
    'meta.notes': 'Notes',

    // Empty states
    'empty.noTasks': 'No tasks',

    // Actions
    'action.restore': '↩️ Restore',
    'action.delete': '🗑️',
    'action.edit': '✏️',
    'action.moveUp': 'Move up',
    'action.moveDown': 'Move down',

    // Tooltips
    'tooltip.filterByCategory': 'Filter by this category',
    'tooltip.filterByUser': 'Filter by this user',
    'tooltip.filterByTag': 'Filter by this tag',
    'tooltip.filterByPriority': 'Filter by this priority',
    'tooltip.doubleClickEdit': 'Double-click to edit',
    'tooltip.delete': 'Delete',

    // Notifications
    'notif.taskMoved': 'Task moved!',
    'notif.taskEdited': 'Task {id} updated!',
    'notif.taskCreated': 'Task {id} created!',
    'notif.taskArchived': 'Task archived!',
    'notif.taskDeleted': 'Task permanently deleted',
    'notif.taskRestored': 'Task restored to its original column!',
    'notif.saved': 'Saved!',
    'notif.saveError': 'Save failed',
    'notif.loadError': 'Load failed',

    // Prompts and confirmations
    'prompt.columnName': 'Column name:',
    'prompt.columnId': 'Column ID (e.g., todo, done):',
    'prompt.editSubtask': 'Edit subtask:',
    'confirm.deleteColumn': 'Delete this column?',
    'confirm.deleteSubtask': 'Delete this subtask?',
    'confirm.archiveTask': 'Archive task "{title}"?',
    'confirm.deleteTask':
      '⚠️ WARNING: Permanently delete task "{title}"?\n\nThis action cannot be undone.',

    // Subtasks
    'subtask.newPlaceholder': 'New subtask...',

    // Language
    'language.en': 'English',
    'language.fr': 'Français',
  },
  fr: {
    // Header
    'header.title': '📋 Task Manager',
    'header.newTask': '➕ Tâche',
    'header.archives': '📦 Archives',
    'header.columns': '⚙️ Colonnes',

    // Filters
    'filters.tags': 'Tags:',
    'filters.category': 'Catégorie:',
    'filters.user': 'Utilisateur:',
    'filters.priority': 'Priorité:',
    'filters.select': 'Sélectionner...',
    'filters.add': '+',
    'filters.clearAll': '✕ Tout effacer',
    'filters.search': 'Rechercher dans les tâches...',

    // Task detail modal
    'taskDetail.title': 'Détails de la tâche',
    'taskDetail.close': 'Fermer',
    'taskDetail.delete': '🗑️ Supprimer',
    'taskDetail.archive': '📦 Archiver',
    'taskDetail.edit': '✏️ Modifier',

    // Task form modal
    'taskForm.newTask': 'Nouvelle tâche',
    'taskForm.editTask': 'Modifier la tâche',
    'taskForm.titleLabel': 'Titre *',
    'taskForm.columnLabel': 'Colonne *',
    'taskForm.priorityLabel': 'Priorité',
    'taskForm.priorityNone': 'Aucune',
    'taskForm.priorityCritical': '🔴 Critique',
    'taskForm.priorityHigh': '🟠 Haute',
    'taskForm.priorityMedium': '🟡 Moyenne',
    'taskForm.priorityLow': '🟢 Basse',
    'taskForm.categoryLabel': 'Catégorie',
    'taskForm.categoryPlaceholder': 'Frontend, Backend...',
    'taskForm.assignedLabel': 'Assigné à',
    'taskForm.assignedPlaceholder': '@alice',
    'taskForm.createdLabel': 'Créé',
    'taskForm.startedLabel': 'Commencé',
    'taskForm.dueLabel': 'Échéance',
    'taskForm.completedLabel': 'Terminé',
    'taskForm.tagsLabel': 'Tags',
    'taskForm.tagsPlaceholder': '#bug #feature',
    'taskForm.tagsHelp': 'Séparez avec des espaces',
    'taskForm.descriptionLabel': 'Description',
    'taskForm.subtasksLabel': 'Sous-tâches',
    'taskForm.subtaskPlaceholder': 'Ajouter une sous-tâche...',
    'taskForm.subtaskAdd': '+ Ajouter',
    'taskForm.notesLabel': 'Notes',
    'taskForm.notesPlaceholder': 'Notes techniques, résultats, décisions, etc...',
    'taskForm.notesHelp':
      'Markdown supporté : **gras**, *italique*, `code`, listes, liens, **Sous-sections**:',
    'taskForm.cancel': 'Annuler',
    'taskForm.create': 'Créer',
    'taskForm.save': 'Enregistrer',

    // Columns modal
    'columns.title': 'Gérer les colonnes',
    'columns.add': '+ Ajouter une colonne',

    // Archives modal
    'archives.title': '📦 Archives',
    'archives.search': 'Rechercher dans les archives...',
    'archives.empty': 'Aucune tâche archivée',

    // Task metadata
    'meta.priority': 'Priorité',
    'meta.status': 'Statut',
    'meta.category': 'Catégorie',
    'meta.assigned': 'Assigné à',
    'meta.created': 'Date de création',
    'meta.started': 'Date de début',
    'meta.due': "Date d'échéance",
    'meta.completed': 'Date de fin',
    'meta.tags': 'Tags',
    'meta.description': 'Description',
    'meta.subtasks': 'Sous-tâches ({completed}/{total})',
    'meta.notes': 'Notes',

    // Empty states
    'empty.noTasks': 'Aucune tâche',

    // Actions
    'action.restore': '↩️ Restaurer',
    'action.delete': '🗑️',
    'action.edit': '✏️',
    'action.moveUp': 'Déplacer vers le haut',
    'action.moveDown': 'Déplacer vers le bas',

    // Tooltips
    'tooltip.filterByCategory': 'Filtrer par cette catégorie',
    'tooltip.filterByUser': 'Filtrer par cet utilisateur',
    'tooltip.filterByTag': 'Filtrer par ce tag',
    'tooltip.filterByPriority': 'Filtrer par cette priorité',
    'tooltip.doubleClickEdit': 'Double-cliquez pour éditer',
    'tooltip.delete': 'Supprimer',

    // Notifications
    'notif.taskMoved': 'Tâche déplacée !',
    'notif.taskEdited': 'Tâche {id} modifiée !',
    'notif.taskCreated': 'Tâche {id} créée !',
    'notif.taskArchived': 'Tâche archivée !',
    'notif.taskDeleted': 'Tâche supprimée définitivement',
    'notif.taskRestored': "Tâche restaurée dans sa colonne d'origine !",
    'notif.saved': 'Enregistré !',
    'notif.saveError': "Échec de l'enregistrement",
    'notif.loadError': 'Échec du chargement',

    // Prompts and confirmations
    'prompt.columnName': 'Nom de la colonne:',
    'prompt.columnId': 'ID de la colonne (ex: todo, done):',
    'prompt.editSubtask': 'Modifier la sous-tâche:',
    'confirm.deleteColumn': 'Supprimer cette colonne ?',
    'confirm.deleteSubtask': 'Supprimer cette sous-tâche ?',
    'confirm.archiveTask': 'Archiver la tâche "{title}" ?',
    'confirm.deleteTask':
      '⚠️ ATTENTION : Supprimer définitivement la tâche "{title}" ?\n\nCette action est irréversible.',

    // Subtasks
    'subtask.newPlaceholder': 'Nouvelle sous-tâche...',

    // Language
    'language.en': 'English',
    'language.fr': 'Français',
  },
};

let currentLanguage: Language = 'en';

// Initialize language from localStorage or browser
export function initLanguage(): Language {
  const savedLang = localStorage.getItem('preferredLanguage') as Language;
  if (savedLang && translations[savedLang]) {
    currentLanguage = savedLang;
    return currentLanguage;
  }

  const browserLang = navigator.language.toLowerCase().split('-')[0] as Language;
  if (translations[browserLang]) {
    currentLanguage = browserLang;
  } else {
    currentLanguage = 'en';
  }

  localStorage.setItem('preferredLanguage', currentLanguage);
  return currentLanguage;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function setLanguage(lang: Language): void {
  if (!translations[lang]) {
    console.warn(`Language "${lang}" not available, falling back to English`);
    lang = 'en';
  }
  currentLanguage = lang;
  localStorage.setItem('preferredLanguage', lang);
}

export function t(key: string, params: Record<string, string> = {}): string {
  let text = translations[currentLanguage]?.[key] || translations['en'][key] || key;
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param]);
  });
  return text;
}
