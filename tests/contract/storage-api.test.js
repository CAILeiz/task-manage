/**
 * Storage API Contract Tests
 *
 * Validates TaskRepository interface according to contracts/storage-api.md
 */

import { expect } from 'chai';

import { TaskRepository } from '../../src/storage/task-repository.js';
import { createTask, Priority } from '../../src/models/task.js';
import { getDB, closeDB } from '../../src/storage/indexeddb.js';

describe('Storage API Contract', () => {
  let repository;
  let testTask;

  before(async () => {
    repository = new TaskRepository();
    // Initialize DB
    await getDB();
  });

  after(() => {
    closeDB();
  });
  
  beforeEach(() => {
    testTask = createTask({
      name: 'Test Task',
      priority: Priority.HIGH,
      dueDate: '2026-12-31'
    });
  });
  
  describe('create(task)', () => {
    afterEach(async () => {
      // Cleanup
      await repository.delete(testTask.id).catch(() => {});
    });
    
    it('should create a new task', async () => {
      const created = await repository.create(testTask);

      expect(created.id).to.equal(testTask.id);
      expect(created.name).to.equal(testTask.name);
      expect(created.priority).to.equal(testTask.priority);
    });

    it('should reject invalid task', async () => {
      const invalidTask = {
        id: 'invalid-id',
        name: '',
        priority: 'INVALID'
      };

      await expect(repository.create(invalidTask)).to.be.rejected;
    });
  });
  
  describe('findAll()', () => {
    afterEach(async () => {
      // Cleanup all
      const tasks = await repository.findAll();
      for (const task of tasks) {
        await repository.delete(task.id);
      }
    });
    
    it('should return all tasks', async () => {
      const task1 = createTask({ name: 'Task 1', priority: Priority.HIGH });
      const task2 = createTask({ name: 'Task 2', priority: Priority.LOW });
      
      await repository.create(task1);
      await repository.create(task2);
      
      const allTasks = await repository.findAll();

      expect(allTasks.length).to.be.at.least(2);
    });

    it('should return empty array when no tasks', async () => {
      const tasks = await repository.findAll();
      expect(Array.isArray(tasks)).to.be.true;
    });
  });
  
  describe('findById(id)', () => {
    afterEach(async () => {
      await repository.delete(testTask.id).catch(() => {});
    });
    
    it('should find task by id', async () => {
      await repository.create(testTask);
      
      const found = await repository.findById(testTask.id);

      expect(found).to.not.be.null;
      expect(found.id).to.equal(testTask.id);
    });

    it('should return null for non-existent task', async () => {
      const found = await repository.findById('non-existent-id');

      expect(found).to.be.null;
    });
  });
  
  describe('update(task)', () => {
    afterEach(async () => {
      await repository.delete(testTask.id).catch(() => {});
    });
    
    it('should update existing task', async () => {
      await repository.create(testTask);
      
      const updatedTask = {
        ...testTask,
        name: 'Updated Name',
        completed: true
      };
      
      const result = await repository.update(updatedTask);

      expect(result.name).to.equal('Updated Name');
      expect(result.completed).to.equal(true);
    });

    it('should reject update of non-existent task', async () => {
      const nonExistentTask = {
        id: 'non-existent-id',
        name: 'Test',
        priority: Priority.LOW,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await expect(repository.update(nonExistentTask)).to.be.rejected;
    });
  });
  
  describe('delete(id)', () => {
    it('should delete existing task', async () => {
      await repository.create(testTask);
      
      await repository.delete(testTask.id);

      const found = await repository.findById(testTask.id);
      expect(found).to.be.null;
    });

    it('should not fail for non-existent task', async () => {
      await expect(repository.delete('non-existent-id')).to.not.be.rejected;
    });
  });
  
  describe('findByPriority(priority)', () => {
    afterEach(async () => {
      const tasks = await repository.findAll();
      for (const task of tasks) {
        await repository.delete(task.id);
      }
    });
    
    it('should find tasks by priority', async () => {
      const highTask = createTask({ name: 'High Priority', priority: Priority.HIGH });
      const lowTask = createTask({ name: 'Low Priority', priority: Priority.LOW });
      
      await repository.create(highTask);
      await repository.create(lowTask);
      
      const highTasks = await repository.findByPriority(Priority.HIGH);

      expect(highTasks.length).to.equal(1);
      expect(highTasks[0].priority).to.equal(Priority.HIGH);
    });
  });
  
  describe('findByDueDate(filter)', () => {
    afterEach(async () => {
      const tasks = await repository.findAll();
      for (const task of tasks) {
        await repository.delete(task.id);
      }
    });
    
    it('should find tasks due today', async () => {
      const today = new Date().toISOString().split('T')[0];
      const todayTask = createTask({
        name: 'Due Today',
        priority: Priority.HIGH,
        dueDate: today
      });
      
      await repository.create(todayTask);
      
      const tasks = await repository.findByDueDate('today');

      expect(tasks.length).to.be.at.least(1);
    });

    it('should find overdue tasks', async () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const overdueTask = createTask({
        name: 'Overdue',
        priority: Priority.HIGH,
        dueDate: yesterday,
        completed: false
      });

      await repository.create(overdueTask);

      const tasks = await repository.findByDueDate('overdue');

      expect(tasks.length).to.be.at.least(1);
      expect(tasks[0].id).to.equal(overdueTask.id);
    });

    it('should find tasks with no due date', async () => {
      const noDueTask = createTask({
        name: 'No Deadline',
        priority: Priority.MEDIUM,
        dueDate: null
      });

      await repository.create(noDueTask);

      const tasks = await repository.findByDueDate('none');

      expect(tasks.length).to.be.at.least(1);
    });
  });
});
