/**
 * Task Flow Integration Tests
 *
 * Tests the complete flow: task creation → storage → display.
 * Simulates user interactions and verifies end-to-end behavior.
 */

import { expect } from 'chai';

import { TaskRepository } from '../../src/storage/task-repository.js';
import { createTask, updateTask, Priority } from '../../src/models/task.js';
import { getDB, closeDB } from '../../src/storage/indexeddb.js';

describe('Task Flow Integration', () => {
  let repository;

  beforeEach(async () => {
    repository = new TaskRepository();
    
    // Clear database before each test
    const db = await getDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('tasks', 'readwrite');
      const store = tx.objectStore('tasks');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });

  after(() => {
    closeDB();
  });

  describe('Create → Store → Display Flow', () => {
    it('should create task and persist to storage', async () => {
      // Step 1: Create task
      const taskData = {
        name: 'Complete project report',
        priority: Priority.HIGH,
        dueDate: '2026-03-01'
      };

      const task = createTask(taskData);

      // Step 2: Store task
      const stored = await repository.create(task);

      // Step 3: Verify storage
      expect(stored).to.deep.equal(task);
      expect(stored.id).to.exist;

      // Step 4: Retrieve and verify
      const retrieved = await repository.findById(task.id);
      expect(retrieved).to.deep.equal(task);
      expect(retrieved.name).to.equal('Complete project report');
      expect(retrieved.priority).to.equal(Priority.HIGH);
      expect(retrieved.dueDate).to.equal('2026-03-01');
      expect(retrieved.completed).to.equal(false);
    });

    it('should handle complete task flow with multiple tasks', async () => {
      // Create multiple tasks
      const tasks = [
        createTask({ name: 'Task 1', priority: Priority.HIGH }),
        createTask({ name: 'Task 2', priority: Priority.MEDIUM, dueDate: '2026-04-15' }),
        createTask({ name: 'Task 3', priority: Priority.LOW })
      ];

      // Store all tasks
      for (const task of tasks) {
        await repository.create(task);
      }

      // Retrieve all and verify count
      const allTasks = await repository.findAll();
      expect(allTasks.length).to.equal(3);

      // Verify each task exists with correct data
      const taskNames = allTasks.map(t => t.name);
      expect(taskNames).to.deep.equal(expect.arrayContaining(['Task 1', 'Task 2', 'Task 3']));
    });

    it('should create task, mark complete, and verify update', async () => {
      // Create task
      const task = createTask({
        name: 'Mark me complete',
        priority: Priority.MEDIUM
      });

      await repository.create(task);

      // Mark as complete
      task.completed = true;
      const updated = await repository.update(task);

      // Verify update
      expect(updated.completed).to.equal(true);
      expect(updated.updatedAt).to.be.above(task.updatedAt);

      // Verify persistence
      const retrieved = await repository.findById(task.id);
      expect(retrieved.completed).to.equal(true);
    });

    it('should handle task with all fields', async () => {
      const task = createTask({
        name: 'Complete task with all fields',
        priority: Priority.HIGH,
        dueDate: '2026-12-31'
      });

      await repository.create(task);

      // Verify all fields are persisted
      const retrieved = await repository.findById(task.id);
      expect(retrieved.id).to.equal(task.id);
      expect(retrieved.name).to.equal('Complete task with all fields');
      expect(retrieved.priority).to.equal(Priority.HIGH);
      expect(retrieved.dueDate).to.equal('2026-12-31');
      expect(retrieved.completed).to.equal(false);
      expect(retrieved.createdAt).to.be.above(0);
      expect(retrieved.updatedAt).to.be.above(0);
    });
  });

  describe('Filter Flow', () => {
    it('should filter tasks by priority after creation', async () => {
      // Create tasks with different priorities
      const highTask = createTask({ name: 'High Priority', priority: Priority.HIGH });
      const mediumTask = createTask({ name: 'Medium Priority', priority: Priority.MEDIUM });
      const lowTask = createTask({ name: 'Low Priority', priority: Priority.LOW });

      await repository.create(highTask);
      await repository.create(mediumTask);
      await repository.create(lowTask);

      // Filter by HIGH priority
      const highTasks = await repository.findByPriority(Priority.HIGH);
      expect(highTasks.length).to.equal(1);
      expect(highTasks[0].name).to.equal('High Priority');

      // Filter by MEDIUM priority
      const mediumTasks = await repository.findByPriority(Priority.MEDIUM);
      expect(mediumTasks.length).to.equal(1);
      expect(mediumTasks[0].name).to.equal('Medium Priority');
    });

    it('should filter tasks by due date after creation', async () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const todayTask = createTask({ name: 'Due Today', priority: Priority.HIGH, dueDate: today });
      const tomorrowTask = createTask({ name: 'Due Tomorrow', priority: Priority.MEDIUM, dueDate: tomorrow });
      const noDateTask = createTask({ name: 'No Date', priority: Priority.LOW, dueDate: null });

      await repository.create(todayTask);
      await repository.create(tomorrowTask);
      await repository.create(noDateTask);

      // Filter by today
      const todayTasks = await repository.findByDueDate('today');
      expect(todayTasks.length).to.equal(1);
      expect(todayTasks[0].name).to.equal('Due Today');

      // Filter by no date
      const noDateTasks = await repository.findByDueDate('none');
      expect(noDateTasks.length).to.equal(1);
      expect(noDateTasks[0].name).to.equal('No Date');
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle validation errors during creation', async () => {
      const invalidTask = {
        id: 'test-id',
        name: '', // Invalid
        priority: 'INVALID', // Invalid
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await expect(repository.create(invalidTask)).to.be.rejectedWith('Validation failed');

      // Verify no task was stored
      const allTasks = await repository.findAll();
      expect(allTasks.length).to.equal(0);
    });

    it('should handle update of non-existent task', async () => {
      const task = createTask({ name: 'Test', priority: Priority.HIGH });
      // Don't create the task, try to update directly

      await expect(repository.update(task)).to.be.rejected;
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle a week\'s worth of tasks', async () => {
      const tasks = [];
      const priorities = [Priority.HIGH, Priority.MEDIUM, Priority.LOW];
      
      // Create 7 tasks for a week
      for (let i = 1; i <= 7; i++) {
        const dueDate = new Date(Date.now() + i * 86400000).toISOString().split('T')[0];
        const task = createTask({
          name: `Task for day ${i}`,
          priority: priorities[i % 3],
          dueDate
        });
        tasks.push(task);
        await repository.create(task);
      }

      // Verify all tasks stored
      const allTasks = await repository.findAll();
      expect(allTasks.length).to.equal(7);

      // Mark first 3 as complete
      for (let i = 0; i < 3; i++) {
        tasks[i].completed = true;
        await repository.update(tasks[i]);
      }

      // Verify completion status
      const updated = await repository.findAll();
      const completed = updated.filter(t => t.completed);
      const pending = updated.filter(t => !t.completed);

      expect(completed.length).to.equal(3);
      expect(pending.length).to.equal(4);
    });

    it('should handle priority workflow', async () => {
      // Create high priority task
      const urgentTask = createTask({
        name: 'Urgent: Fix production bug',
        priority: Priority.HIGH,
        dueDate: new Date().toISOString().split('T')[0]
      });

      await repository.create(urgentTask);

      // Get all high priority tasks
      const highPriority = await repository.findByPriority(Priority.HIGH);
      expect(highPriority.length).to.equal(1);
      expect(highPriority[0].name).to.include('Urgent');

      // Complete the task
      urgentTask.completed = true;
      await repository.update(urgentTask);

      // Verify it's still in high priority but completed
      const stillHigh = await repository.findByPriority(Priority.HIGH);
      expect(stillHigh.length).to.equal(1);
      expect(stillHigh[0].completed).to.equal(true);
    });

    it('should handle task lifecycle completely', async () => {
      // CREATE
      const task = createTask({
        name: 'Full lifecycle task',
        priority: Priority.MEDIUM,
        dueDate: '2026-06-15'
      });
      const created = await repository.create(task);
      expect(created.id).to.exist;

      // READ
      const found = await repository.findById(created.id);
      expect(found).to.deep.equal(created);

      // UPDATE - Mark as complete
      found.completed = true;
      const updated = await repository.update(found);
      expect(updated.completed).to.equal(true);

      // UPDATE - Change priority
      found.priority = Priority.HIGH;
      const reprioritized = await repository.update(found);
      expect(reprioritized.priority).to.equal(Priority.HIGH);

      // DELETE
      await repository.delete(reprioritized.id);

      // VERIFY deletion
      const afterDelete = await repository.findById(reprioritized.id);
      expect(afterDelete).to.be.null;
    });
  });
});
