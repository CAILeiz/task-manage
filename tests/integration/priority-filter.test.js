/**
 * Priority Filter Integration Tests
 *
 * Tests the complete priority filtering flow:
 * Create tasks → Filter by priority → Verify results
 */

import { expect } from 'chai';

import { TaskRepository } from '../../src/storage/task-repository.js';
import { createTask, Priority } from '../../src/models/task.js';
import { getDB, closeDB } from '../../src/storage/indexeddb.js';

describe('Priority Filter Integration', () => {
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

  describe('Priority Filter Flow', () => {
    it('should filter high priority tasks correctly', async () => {
      // Create mixed priority tasks
      const high1 = createTask({ name: 'Urgent bug fix', priority: Priority.HIGH });
      const medium1 = createTask({ name: 'Write documentation', priority: Priority.MEDIUM });
      const high2 = createTask({ name: 'Security patch', priority: Priority.HIGH });
      const low1 = createTask({ name: 'Refactor code', priority: Priority.LOW });

      await repository.create(high1);
      await repository.create(medium1);
      await repository.create(high2);
      await repository.create(low1);

      // Filter HIGH priority
      const highPriorityTasks = await repository.findByPriority(Priority.HIGH);

      expect(highPriorityTasks.length).to.equal(2);
      expect(highPriorityTasks.every(t => t.priority === Priority.HIGH)).to.equal(true);
      expect(highPriorityTasks.map(t => t.name)).to.deep.equal(
        expect.arrayContaining(['Urgent bug fix', 'Security patch'])
      );
    });

    it('should filter medium priority tasks correctly', async () => {
      const high1 = createTask({ name: 'High task', priority: Priority.HIGH });
      const medium1 = createTask({ name: 'Medium task 1', priority: Priority.MEDIUM });
      const medium2 = createTask({ name: 'Medium task 2', priority: Priority.MEDIUM });
      const low1 = createTask({ name: 'Low task', priority: Priority.LOW });

      await repository.create(high1);
      await repository.create(medium1);
      await repository.create(medium2);
      await repository.create(low1);

      // Filter MEDIUM priority
      const mediumPriorityTasks = await repository.findByPriority(Priority.MEDIUM);

      expect(mediumPriorityTasks.length).to.equal(2);
      expect(mediumPriorityTasks.every(t => t.priority === Priority.MEDIUM)).to.equal(true);
      expect(mediumPriorityTasks.map(t => t.name)).to.deep.equal(
        expect.arrayContaining(['Medium task 1', 'Medium task 2'])
      );
    });

    it('should filter low priority tasks correctly', async () => {
      const high1 = createTask({ name: 'High task', priority: Priority.HIGH });
      const medium1 = createTask({ name: 'Medium task', priority: Priority.MEDIUM });
      const low1 = createTask({ name: 'Low task 1', priority: Priority.LOW });
      const low2 = createTask({ name: 'Low task 2', priority: Priority.LOW });

      await repository.create(high1);
      await repository.create(medium1);
      await repository.create(low1);
      await repository.create(low2);

      // Filter LOW priority
      const lowPriorityTasks = await repository.findByPriority(Priority.LOW);

      expect(lowPriorityTasks.length).to.equal(2);
      expect(lowPriorityTasks.every(t => t.priority === Priority.LOW)).to.equal(true);
      expect(lowPriorityTasks.map(t => t.name)).to.deep.equal(
        expect.arrayContaining(['Low task 1', 'Low task 2'])
      );
    });

    it('should return empty array when no tasks match priority', async () => {
      const medium1 = createTask({ name: 'Medium task', priority: Priority.MEDIUM });
      const medium2 = createTask({ name: 'Another medium task', priority: Priority.MEDIUM });

      await repository.create(medium1);
      await repository.create(medium2);

      // Filter HIGH priority (none exist)
      const highPriorityTasks = await repository.findByPriority(Priority.HIGH);

      expect(highPriorityTasks.length).to.equal(0);
    });

    it('should handle priority filter with completed tasks', async () => {
      const highIncomplete = createTask({ name: 'High incomplete', priority: Priority.HIGH, dueDate: null });
      const highComplete = createTask({ name: 'High complete', priority: Priority.HIGH, dueDate: null });
      highComplete.completed = true;

      await repository.create(highIncomplete);
      await repository.create(highComplete);

      // Filter HIGH priority (should include both completed and incomplete)
      const highPriorityTasks = await repository.findByPriority(Priority.HIGH);

      expect(highPriorityTasks.length).to.equal(2);
      expect(highPriorityTasks.some(t => t.completed)).to.equal(true);
      expect(highPriorityTasks.some(t => !t.completed)).to.equal(true);
    });
  });

  describe('Priority Filter with Due Dates', () => {
    it('should filter high priority tasks with due dates', async () => {
      const urgentToday = createTask({
        name: 'Urgent today',
        priority: Priority.HIGH,
        dueDate: new Date().toISOString().split('T')[0]
      });
      const urgentFuture = createTask({
        name: 'Urgent future',
        priority: Priority.HIGH,
        dueDate: '2026-12-31'
      });
      const mediumToday = createTask({
        name: 'Medium today',
        priority: Priority.MEDIUM,
        dueDate: new Date().toISOString().split('T')[0]
      });

      await repository.create(urgentToday);
      await repository.create(urgentFuture);
      await repository.create(mediumToday);

      // Filter HIGH priority
      const highPriorityTasks = await repository.findByPriority(Priority.HIGH);

      expect(highPriorityTasks.length).to.equal(2);
      expect(highPriorityTasks.map(t => t.name)).to.deep.equal(
        expect.arrayContaining(['Urgent today', 'Urgent future'])
      );
    });

    it('should handle mixed priorities and due dates', async () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const tasks = [
        createTask({ name: 'H1', priority: Priority.HIGH, dueDate: today }),
        createTask({ name: 'H2', priority: Priority.HIGH, dueDate: tomorrow }),
        createTask({ name: 'M1', priority: Priority.MEDIUM, dueDate: today }),
        createTask({ name: 'L1', priority: Priority.LOW, dueDate: null })
      ];

      for (const task of tasks) {
        await repository.create(task);
      }

      // Verify each priority filter works independently
      const high = await repository.findByPriority(Priority.HIGH);
      const medium = await repository.findByPriority(Priority.MEDIUM);
      const low = await repository.findByPriority(Priority.LOW);

      expect(high.length).to.equal(2);
      expect(medium.length).to.equal(1);
      expect(low.length).to.equal(1);
    });
  });

  describe('Priority Filter Real-world Scenarios', () => {
    it('should handle priority workflow for project management', async () => {
      // Simulate a project with tasks of different priorities
      const projectTasks = [
        createTask({ name: 'Fix critical bug', priority: Priority.HIGH }),
        createTask({ name: 'Implement login', priority: Priority.HIGH }),
        createTask({ name: 'Write tests', priority: Priority.MEDIUM }),
        createTask({ name: 'Update docs', priority: Priority.MEDIUM }),
        createTask({ name: 'Code review', priority: Priority.LOW }),
        createTask({ name: 'Refactor utils', priority: Priority.LOW })
      ];

      for (const task of projectTasks) {
        await repository.create(task);
      }

      // Get high priority tasks for immediate focus
      const highPriority = await repository.findByPriority(Priority.HIGH);
      expect(highPriority.length).to.equal(2);

      // Complete one high priority task
      highPriority[0].completed = true;
      await repository.update(highPriority[0]);

      // Verify high priority still shows both (completed and incomplete)
      const updatedHigh = await repository.findByPriority(Priority.HIGH);
      expect(updatedHigh.length).to.equal(2);
      expect(updatedHigh.some(t => t.completed)).to.equal(true);
    });

    it('should handle priority escalation', async () => {
      // Create a medium priority task
      const task = createTask({ name: 'Regular task', priority: Priority.MEDIUM });
      await repository.create(task);

      // Escalate to high priority
      task.priority = Priority.HIGH;
      await repository.update(task);

      // Verify it now appears in high priority filter
      const highPriority = await repository.findByPriority(Priority.HIGH);
      expect(highPriority.length).to.equal(1);
      expect(highPriority[0].name).to.equal('Regular task');

      // Verify it no longer appears in medium priority filter
      const mediumPriority = await repository.findByPriority(Priority.MEDIUM);
      expect(mediumPriority.length).to.equal(0);
    });

    it('should handle bulk priority operations', async () => {
      // Create 10 tasks with alternating priorities
      const tasks = [];
      for (let i = 1; i <= 10; i++) {
        const priority = i % 2 === 0 ? Priority.HIGH : Priority.LOW;
        const task = createTask({
          name: `Task ${i}`,
          priority
        });
        tasks.push(task);
        await repository.create(task);
      }

      // Filter and verify
      const highPriority = await repository.findByPriority(Priority.HIGH);
      const lowPriority = await repository.findByPriority(Priority.LOW);

      expect(highPriority.length).to.equal(5);
      expect(lowPriority.length).to.equal(5);

      // Mark all high priority as complete
      for (const task of highPriority) {
        task.completed = true;
        await repository.update(task);
      }

      // Verify completion
      const updatedHigh = await repository.findByPriority(Priority.HIGH);
      expect(updatedHigh.every(t => t.completed)).to.equal(true);
    });
  });

  describe('Priority Filter Edge Cases', () => {
    it('should handle empty database', async () => {
      const highPriority = await repository.findByPriority(Priority.HIGH);
      expect(highPriority).to.deep.equal([]);
    });

    it('should handle single task of each priority', async () => {
      const high = createTask({ name: 'Single High', priority: Priority.HIGH });
      const medium = createTask({ name: 'Single Medium', priority: Priority.MEDIUM });
      const low = createTask({ name: 'Single Low', priority: Priority.LOW });

      await repository.create(high);
      await repository.create(medium);
      await repository.create(low);

      expect((await repository.findByPriority(Priority.HIGH)).length).to.equal(1);
      expect((await repository.findByPriority(Priority.MEDIUM)).length).to.equal(1);
      expect((await repository.findByPriority(Priority.LOW)).length).to.equal(1);
    });

    it('should handle tasks with same name but different priorities', async () => {
      const task1 = createTask({ name: 'Same name', priority: Priority.HIGH });
      const task2 = createTask({ name: 'Same name', priority: Priority.MEDIUM });
      const task3 = createTask({ name: 'Same name', priority: Priority.LOW });

      await repository.create(task1);
      await repository.create(task2);
      await repository.create(task3);

      const high = await repository.findByPriority(Priority.HIGH);
      const medium = await repository.findByPriority(Priority.MEDIUM);
      const low = await repository.findByPriority(Priority.LOW);

      expect(high.length).to.equal(1);
      expect(medium.length).to.equal(1);
      expect(low.length).to.equal(1);
      expect(high[0].name).to.equal('Same name');
      expect(medium[0].name).to.equal('Same name');
      expect(low[0].name).to.equal('Same name');
    });
  });
});
