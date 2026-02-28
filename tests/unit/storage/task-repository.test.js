/**
 * TaskRepository Unit Tests
 *
 * Tests for CRUD operations and filtering functionality.
 */

import { expect } from 'chai';

import { TaskRepository } from '../../../src/storage/task-repository.js';
import { createTask, Priority, validateTask } from '../../../src/models/task.js';
import { getDB, closeDB, initDB } from '../../../src/storage/indexeddb.js';

const TEST_STORE_NAME = 'tasks';

describe('TaskRepository', () => {
  let repository;
  let db;

  // Setup test database before each test
  beforeEach(async () => {
    // Clean database before each test
    await initDB();
    db = await getDB();
    
    // Clear all tasks
    await new Promise((resolve, reject) => {
      const tx = db.transaction(TEST_STORE_NAME, 'readwrite');
      const store = tx.objectStore(TEST_STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    repository = new TaskRepository();
  });

  // Cleanup after all tests
  after(() => {
    closeDB();
  });

  describe('create', () => {
    it('should create a valid task', async () => {
      const task = createTask({
        name: 'Test Task',
        priority: Priority.HIGH
      });

      const created = await repository.create(task);

      expect(created).to.deep.equal(task);
      expect(created.id).to.exist;
      expect(created.name).to.equal('Test Task');
      expect(created.priority).to.equal(Priority.HIGH);
    });

    it('should reject task with empty name', async () => {
      const task = {
        id: 'test-id',
        name: '',
        priority: Priority.HIGH,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await expect(repository.create(task)).to.be.rejectedWith('Validation failed');
    });

    it('should reject task with invalid priority', async () => {
      const task = {
        id: 'test-id',
        name: 'Test',
        priority: 'INVALID',
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await expect(repository.create(task)).to.be.rejectedWith('Validation failed');
    });

    it('should create task with dueDate', async () => {
      const task = createTask({
        name: 'Task with deadline',
        priority: Priority.MEDIUM,
        dueDate: '2026-12-31'
      });

      const created = await repository.create(task);

      expect(created.dueDate).to.equal('2026-12-31');
    });
  });

  describe('findAll', () => {
    it('should return empty array when no tasks', async () => {
      const tasks = await repository.findAll();

      expect(tasks).to.deep.equal([]);
    });

    it('should return all tasks', async () => {
      const task1 = createTask({ name: 'Task 1', priority: Priority.HIGH });
      const task2 = createTask({ name: 'Task 2', priority: Priority.LOW });

      await repository.create(task1);
      await repository.create(task2);

      const tasks = await repository.findAll();

      expect(tasks.length).to.equal(2);
      expect(tasks.map(t => t.name)).to.deep.equal(expect.arrayContaining(['Task 1', 'Task 2']));
    });
  });

  describe('findById', () => {
    it('should find task by id', async () => {
      const task = createTask({ name: 'Find Me', priority: Priority.HIGH });
      await repository.create(task);

      const found = await repository.findById(task.id);

      expect(found).to.deep.equal(task);
      expect(found.name).to.equal('Find Me');
    });

    it('should return null for non-existent task', async () => {
      const found = await repository.findById('non-existent-id');

      expect(found).to.be.null;
    });
  });

  describe('update', () => {
    it('should update an existing task', async () => {
      const task = createTask({ name: 'Original', priority: Priority.LOW });
      await repository.create(task);

      task.name = 'Updated';
      task.priority = Priority.HIGH;

      const updated = await repository.update(task);

      expect(updated.name).to.equal('Updated');
      expect(updated.priority).to.equal(Priority.HIGH);
      expect(updated.updatedAt).to.be.above(task.updatedAt);
    });

    it('should reject update for non-existent task', async () => {
      const task = createTask({ name: 'Test', priority: Priority.MEDIUM });
      // Don't create the task

      await expect(repository.update(task)).to.be.rejected;
    });

    it('should reject update with invalid data', async () => {
      const task = createTask({ name: 'Test', priority: Priority.HIGH });
      await repository.create(task);

      task.name = ''; // Invalid

      await expect(repository.update(task)).to.be.rejectedWith('Validation failed');
    });
  });

  describe('delete', () => {
    it('should delete an existing task', async () => {
      const task = createTask({ name: 'Delete Me', priority: Priority.HIGH });
      await repository.create(task);

      await repository.delete(task.id);

      const found = await repository.findById(task.id);
      expect(found).to.be.null;
    });

    it('should not fail when deleting non-existent task', async () => {
      // Should not throw
      await repository.delete('non-existent-id');
    });
  });

  describe('findByPriority', () => {
    it('should find tasks by priority', async () => {
      const high1 = createTask({ name: 'High 1', priority: Priority.HIGH });
      const high2 = createTask({ name: 'High 2', priority: Priority.HIGH });
      const medium = createTask({ name: 'Medium', priority: Priority.MEDIUM });
      const low = createTask({ name: 'Low', priority: Priority.LOW });

      await repository.create(high1);
      await repository.create(high2);
      await repository.create(medium);
      await repository.create(low);

      const highPriorityTasks = await repository.findByPriority(Priority.HIGH);

      expect(highPriorityTasks.length).to.equal(2);
      expect(highPriorityTasks.every(t => t.priority === Priority.HIGH)).to.equal(true);
    });

    it('should return empty array when no tasks match priority', async () => {
      const low = createTask({ name: 'Low', priority: Priority.LOW });
      await repository.create(low);

      const highPriorityTasks = await repository.findByPriority(Priority.HIGH);

      expect(highPriorityTasks).to.deep.equal([]);
    });
  });

  describe('findByDueDate', () => {
    it('should find tasks due today', async () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const todayTask = createTask({ name: 'Due Today', priority: Priority.HIGH, dueDate: today });
      const tomorrowTask = createTask({ name: 'Due Tomorrow', priority: Priority.MEDIUM, dueDate: tomorrow });
      const noDateTask = createTask({ name: 'No Date', priority: Priority.LOW, dueDate: null });

      await repository.create(todayTask);
      await repository.create(tomorrowTask);
      await repository.create(noDateTask);

      const tasks = await repository.findByDueDate('today');

      expect(tasks.length).to.equal(1);
      expect(tasks[0].name).to.equal('Due Today');
    });

    it('should find upcoming tasks (within 7 days)', async () => {
      const today = new Date().toISOString().split('T')[0];
      const in3Days = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
      const in10Days = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];

      const todayTask = createTask({ name: 'Today', priority: Priority.HIGH, dueDate: today });
      const soonTask = createTask({ name: 'In 3 days', priority: Priority.MEDIUM, dueDate: in3Days });
      const laterTask = createTask({ name: 'In 10 days', priority: Priority.LOW, dueDate: in10Days });

      await repository.create(todayTask);
      await repository.create(soonTask);
      await repository.create(laterTask);

      const upcoming = await repository.findByDueDate('upcoming');

      expect(upcoming.length).to.equal(2);
      expect(upcoming.map(t => t.name)).to.deep.equal(expect.arrayContaining(['Today', 'In 3 days']));
    });

    it('should find overdue tasks', async () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const overdueTask = createTask({ name: 'Overdue', priority: Priority.HIGH, dueDate: yesterday });
      const veryOverdueTask = createTask({ name: 'Very Overdue', priority: Priority.MEDIUM, dueDate: lastWeek });
      const futureTask = createTask({ name: 'Future', priority: Priority.LOW, dueDate: tomorrow });
      const completedOverdueTask = createTask({ name: 'Completed Overdue', priority: Priority.HIGH, dueDate: yesterday });
      completedOverdueTask.completed = true;

      await repository.create(overdueTask);
      await repository.create(veryOverdueTask);
      await repository.create(futureTask);
      await repository.create(completedOverdueTask);

      const overdue = await repository.findByDueDate('overdue');

      expect(overdue.length).to.equal(2);
      expect(overdue.map(t => t.name)).to.deep.equal(expect.arrayContaining(['Overdue', 'Very Overdue']));
    });

    it('should find tasks with no due date', async () => {
      const noDate1 = createTask({ name: 'No Date 1', priority: Priority.HIGH, dueDate: null });
      const noDate2 = createTask({ name: 'No Date 2', priority: Priority.MEDIUM, dueDate: null });
      const hasDate = createTask({ name: 'Has Date', priority: Priority.LOW, dueDate: '2026-12-31' });

      await repository.create(noDate1);
      await repository.create(noDate2);
      await repository.create(hasDate);

      const noDateTasks = await repository.findByDueDate('none');

      expect(noDateTasks.length).to.equal(2);
      expect(noDateTasks.map(t => t.name)).to.deep.equal(expect.arrayContaining(['No Date 1', 'No Date 2']));
    });
  });

  describe('integration', () => {
    it('should handle full CRUD lifecycle', async () => {
      // Create
      const task = createTask({
        name: 'Full Lifecycle Task',
        priority: Priority.HIGH,
        dueDate: '2026-06-15'
      });

      const created = await repository.create(task);
      expect(created.id).to.exist;

      // Read
      const found = await repository.findById(created.id);
      expect(found).to.deep.equal(created);

      // Update
      found.name = 'Updated Lifecycle Task';
      found.completed = true;
      const updated = await repository.update(found);
      expect(updated.name).to.equal('Updated Lifecycle Task');
      expect(updated.completed).to.equal(true);

      // Delete
      await repository.delete(updated.id);
      const afterDelete = await repository.findById(updated.id);
      expect(afterDelete).to.be.null;
    });

    it('should handle multiple operations in sequence', async () => {
      // Create multiple tasks
      const tasks = [];
      for (let i = 1; i <= 5; i++) {
        const task = createTask({
          name: `Task ${i}`,
          priority: i % 2 === 0 ? Priority.HIGH : Priority.LOW
        });
        tasks.push(await repository.create(task));
      }

      // Verify all exist
      const all = await repository.findAll();
      expect(all.length).to.equal(5);

      // Update all to completed
      for (const task of tasks) {
        task.completed = true;
        await repository.update(task);
      }

      // Verify all completed
      const updated = await repository.findAll();
      expect(updated.every(t => t.completed)).to.equal(true);

      // Delete all
      for (const task of tasks) {
        await repository.delete(task.id);
      }

      // Verify all deleted
      const final = await repository.findAll();
      expect(final.length).to.equal(0);
    });
  });
});
