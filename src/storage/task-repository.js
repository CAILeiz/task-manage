/**
 * Task Repository
 * 
 * Repository pattern for Task CRUD operations.
 * Abstracts IndexedDB details.
 */

import { getDB } from './indexeddb.js';
import { validateTask } from '../models/task.js';

const STORE_NAME = 'tasks';

/**
 * Task Repository class
 */
export class TaskRepository {
  /**
   * Create a new task
   * @param {import('../models/task.js').Task} task - Task to create
   * @returns {Promise<import('../models/task.js').Task>}
   */
  async create(task) {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
      // Validate task first
      const validation = validateTask(task);
      if (!validation.valid) {
        reject(new Error(`Validation failed: ${validation.errors.join(', ')}`));
        return;
      }
      
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.add(task);
      
      request.onsuccess = () => resolve(task);
      request.onerror = () => reject(new Error(`Failed to create task: ${request.error?.message}`));
    });
  }
  
  /**
   * Find all tasks
   * @returns {Promise<import('../models/task.js').Task[]>}
   */
  async findAll() {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to find tasks: ${request.error?.message}`));
    });
  }
  
  /**
   * Find a task by ID
   * @param {string} id - Task ID
   * @returns {Promise<import('../models/task.js').Task|null>}
   */
  async findById(id) {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error(`Failed to find task: ${request.error?.message}`));
    });
  }
  
  /**
   * Update an existing task
   * @param {import('../models/task.js').Task} task - Task to update
   * @returns {Promise<import('../models/task.js').Task>}
   */
  async update(task) {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
      // Validate task first
      const validation = validateTask(task);
      if (!validation.valid) {
        reject(new Error(`Validation failed: ${validation.errors.join(', ')}`));
        return;
      }
      
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(task);
      
      request.onsuccess = () => resolve(task);
      request.onerror = () => reject(new Error(`Failed to update task: ${request.error?.message}`));
    });
  }
  
  /**
   * Delete a task by ID
   * @param {string} id - Task ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to delete task: ${request.error?.message}`));
    });
  }
  
  /**
   * Find tasks by priority
   * @param {import('../models/task.js').Priority} priority - Priority level
   * @returns {Promise<import('../models/task.js').Task[]>}
   */
  async findByPriority(priority) {
    const db = await getDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('priority');
      const request = index.getAll(priority);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to find tasks by priority: ${request.error?.message}`));
    });
  }
  
  /**
   * Find tasks by due date filter
   * @param {'today'|'upcoming'|'overdue'|'none'} filter - Date filter
   * @returns {Promise<import('../models/task.js').Task[]>}
   */
  async findByDueDate(filter) {
    const allTasks = await this.findAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (filter) {
      case 'today': {
        return allTasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate.toDateString() === today.toDateString();
        });
      }
      
      case 'upcoming': {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return allTasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= today && dueDate <= nextWeek;
        });
      }
      
      case 'overdue': {
        return allTasks.filter(task => {
          if (!task.dueDate || task.completed) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate < today;
        });
      }
      
      case 'none': {
        return allTasks.filter(task => !task.dueDate);
      }
      
      default:
        throw new Error(`Unknown date filter: ${filter}`);
    }
  }
}
