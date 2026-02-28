/**
 * Main Application Entry Point
 */

import { TaskRepository } from './storage/task-repository.js';
import { createTask, updateTask } from './models/task.js';
import './components/task-list.js';
import './components/filter-bar.js';
import './components/task-form.js';

class App {
  constructor() {
    this.repository = new TaskRepository();
    this.tasks = [];
    this.filters = {
      priority: '',
      dueDate: '',
      status: '' // 'completed', 'pending', or ''
    };
    this.taskForm = null;
  }

  async init() {
    try {
      await this.loadTasks();
      this.attachEvents();
      this.render();
      console.log('[App] Initialized successfully');
    } catch (error) {
      console.error('[App] Initialization failed:', error);
    }
  }

  async loadTasks() {
    this.tasks = await this.repository.findAll();
    console.log('[App] Loaded tasks:', this.tasks.length);
  }
  
  attachEvents() {
    // Get task-form component
    this.taskForm = document.querySelector('task-form');

    // Add task button
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => {
        console.log('[App] Add task button clicked');
        if (this.taskForm) {
          this.taskForm.show();
        }
      });
    }

    // Task creation - listen on document
    document.addEventListener('task-create', async (e) => {
      console.log('[App] Received task-create event:', e.detail);
      await this.handleCreateTask(e.detail);
    });

    // Setup task-list events
    const setupTaskListEvents = () => {
      const taskList = document.querySelector('task-list');
      if (taskList) {
        taskList.addEventListener('task-toggle', async (e) => {
          await this.handleToggleTask(e.detail.id);
        });

        taskList.addEventListener('task-edit', async (e) => {
          await this.handleEditTask(e.detail);
        });

        taskList.addEventListener('task-delete', async (e) => {
          await this.handleDeleteTask(e.detail.id);
        });
        console.log('[App] Task-list event listeners attached');
      } else {
        setTimeout(setupTaskListEvents, 100);
      }
    };
    
    setupTaskListEvents();

    // Filter changes
    document.addEventListener('filter-change', (e) => {
      this.handleFilterChange(e.detail);
    });

    // Status filter from task-list - use event delegation on document
    document.addEventListener('task-filter-change', (e) => {
      this.handleStatusFilterChange(e.detail);
    });
  }

  async handleCreateTask(taskData) {
    try {
      const task = createTask(taskData);
      await this.repository.create(task);
      this.tasks.push(task);
      this.render();
      console.log('[App] Task created:', task.id);
    } catch (error) {
      console.error('[App] Failed to create task:', error);
      alert(`创建任务失败：${error.message}`);
    }
  }

  async handleToggleTask(taskId) {
    console.log('[App] handleToggleTask called with taskId:', taskId);
    
    try {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('[App] Task not found:', taskId);
        return;
      }

      console.log('[App] Found task:', task);
      console.log('[App] Current completed status:', task.completed);

      const updatedTask = updateTask(task, { completed: !task.completed });
      
      console.log('[App] Updated task:', updatedTask);

      await this.repository.update(updatedTask);
      console.log('[App] Task saved to repository');

      const index = this.tasks.findIndex(t => t.id === taskId);
      this.tasks[index] = updatedTask;
      console.log('[App] Local state updated');

      this.render();
      console.log('[App] Render called, task toggled:', taskId);
    } catch (error) {
      console.error('[App] Failed to toggle task:', error);
    }
  }

  async handleEditTask(taskData) {
    console.log('[App] Received task-edit:', taskData);
    
    try {
      const task = this.tasks.find(t => t.id === taskData.id);
      if (!task) {
        console.error('[App] Task not found:', taskData.id);
        return;
      }

      const updatedTask = updateTask(task, {
        name: taskData.name,
        description: taskData.description,
        priority: taskData.priority
      });

      await this.repository.update(updatedTask);

      const index = this.tasks.findIndex(t => t.id === taskData.id);
      this.tasks[index] = updatedTask;

      this.render();
      console.log('[App] Task updated:', taskData.id);
    } catch (error) {
      console.error('[App] Failed to edit task:', error);
      alert(`修改任务失败：${error.message}`);
    }
  }

  async handleDeleteTask(taskId) {
    try {
      await this.repository.delete(taskId);
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.render();
      console.log('[App] Task deleted:', taskId);
    } catch (error) {
      console.error('[App] Failed to delete task:', error);
      alert(`删除任务失败：${error.message}`);
    }
  }

  handleFilterChange({ type, value }) {
    if (type === 'priority') {
      this.filters.priority = value;
    } else if (type === 'dueDate') {
      this.filters.dueDate = value;
    }
    this.render();
    console.log('[App] Filters updated:', this.filters);
  }

  handleStatusFilterChange({ status }) {
    this.filters.status = status;
    this.render();
    console.log('[App] Status filter updated:', this.filters);
  }

  getFilteredTasks() {
    let filtered = [...this.tasks];

    // Apply status filter (completed/pending)
    if (this.filters.status === 'completed') {
      filtered = filtered.filter(task => task.completed);
    } else if (this.filters.status === 'pending') {
      filtered = filtered.filter(task => !task.completed);
    }

    // Apply priority filter
    if (this.filters.priority) {
      filtered = filtered.filter(task => task.priority === this.filters.priority);
    }

    // Apply due date filter
    if (this.filters.dueDate) {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      switch (this.filters.dueDate) {
        case 'today':
          filtered = filtered.filter(task => task.dueDate === today);
          break;
        case 'upcoming':
          filtered = filtered.filter(task => task.dueDate && task.dueDate >= today && task.dueDate <= nextWeek);
          break;
        case 'overdue':
          filtered = filtered.filter(task => task.dueDate && task.dueDate < today && !task.completed);
          break;
        case 'none':
          filtered = filtered.filter(task => !task.dueDate);
          break;
      }
    }

    // Sort by creation time (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    return filtered;
  }

  render() {
    const taskList = document.querySelector('task-list');
    if (taskList) {
      const filteredTasks = this.getFilteredTasks();
      taskList.tasks = filteredTasks;
    }
  }
}

// Initialize app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
  });
} else {
  window.app = new App();
  window.app.init();
}
