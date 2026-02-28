/**
 * Task Model
 *
 * Represents a task entity with validation.
 *
 * @typedef {Object} Task
 * @property {string} id - UUID identifier
 * @property {string} name - Task name (1-200 characters)
 * @property {string} [description] - Task description (0-100 characters)
 * @property {Priority} priority - Priority level
 * @property {string|null} dueDate - ISO 8601 date (YYYY-MM-DD) or null
 * @property {boolean} completed - Completion status
 * @property {number} createdAt - Unix timestamp (ms)
 * @property {number} updatedAt - Unix timestamp (ms)
 */

/**
 * @typedef {'HIGH'|'MEDIUM'|'LOW'} Priority
 */

import { generateUUID } from '../utils/uuid.js';

/**
 * Task priority levels
 */
export const Priority = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

/**
 * Validate a task object
 * @param {Partial<Task>} task - Task to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateTask(task) {
  const errors = [];

  // Name validation
  if (!task.name || typeof task.name !== 'string') {
    errors.push('Name is required');
  } else if (task.name.trim().length === 0 || task.name.length > 200) {
    errors.push('Name must be 1-200 characters');
  }

  // Description validation (if provided)
  if (task.description !== undefined && task.description !== null) {
    if (typeof task.description !== 'string') {
      errors.push('Description must be a string');
    } else if (task.description.length > 100) {
      errors.push('Description must be 100 characters or less');
    }
  }

  // Priority validation
  const validPriorities = [Priority.HIGH, Priority.MEDIUM, Priority.LOW];
  if (!validPriorities.includes(task.priority)) {
    errors.push('Priority must be HIGH, MEDIUM, or LOW');
  }

  // Due date validation (if provided)
  if (task.dueDate !== null && task.dueDate !== undefined) {
    if (!isValidISODate(task.dueDate)) {
      errors.push('dueDate must be ISO 8601 format (YYYY-MM-DD)');
    }
  }

  // Completed validation
  if (typeof task.completed !== 'boolean') {
    errors.push('completed must be a boolean');
  }

  // Timestamp validation
  if (typeof task.createdAt !== 'number') {
    errors.push('createdAt must be a timestamp');
  }
  if (typeof task.updatedAt !== 'number') {
    errors.push('updatedAt must be a timestamp');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate ISO 8601 date format (YYYY-MM-DD)
 * @param {string} dateStr - Date string to validate
 * @returns {boolean}
 */
function isValidISODate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Create a new task
 * @param {Object} params - Task parameters
 * @param {string} params.name - Task name
 * @param {Priority} params.priority - Priority level
 * @param {string} [params.description] - Task description (optional)
 * @param {string|null} [params.dueDate=null] - Due date (optional)
 * @param {boolean} [params.completed=false] - Completion status
 * @returns {Task}
 */
export function createTask({ name, priority, description = '', dueDate = null, completed = false }) {
  const now = Date.now();
  const task = {
    id: generateUUID(),
    name: name.trim(),
    description: description?.trim() || '',
    priority,
    dueDate,
    completed,
    createdAt: now,
    updatedAt: now
  };

  const validation = validateTask(task);
  if (!validation.valid) {
    throw new Error(`Invalid task: ${validation.errors.join(', ')}`);
  }

  return task;
}

/**
 * Update a task
 * @param {Task} task - Task to update
 * @param {Partial<Task>} updates - Fields to update
 * @returns {Task} Updated task
 */
export function updateTask(task, updates) {
  const updated = {
    ...task,
    ...updates,
    updatedAt: Date.now()
  };
  
  const validation = validateTask(updated);
  if (!validation.valid) {
    throw new Error(`Invalid task update: ${validation.errors.join(', ')}`);
  }
  
  return updated;
}
