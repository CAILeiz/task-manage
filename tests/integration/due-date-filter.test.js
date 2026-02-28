/**
 * Due Date Filter Integration Tests
 *
 * Tests the complete due date filtering flow:
 * Create tasks → Filter by due date → Verify results
 */

import { expect } from 'chai';

import { TaskRepository } from '../../src/storage/task-repository.js';
import { createTask, Priority } from '../../src/models/task.js';
import { getDB, closeDB } from '../../src/storage/indexeddb.js';
import { formatDate } from '../../src/utils/date-utils.js';

describe('Due Date Filter Integration', () => {
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

  describe('Today Filter', () => {
    it('should find tasks due today', async () => {
      const today = formatDate(new Date());
      const tomorrow = formatDate(new Date(Date.now() + 86400000));

      const todayTask = createTask({ name: 'Due Today', priority: Priority.HIGH, dueDate: today });
      const tomorrowTask = createTask({ name: 'Due Tomorrow', priority: Priority.MEDIUM, dueDate: tomorrow });

      await repository.create(todayTask);
      await repository.create(tomorrowTask);

      const tasks = await repository.findByDueDate('today');

      expect(tasks.length).to.equal(1);
      expect(tasks[0].name).to.equal('Due Today');
      expect(tasks[0].dueDate).to.equal(today);
    });

    it('should return empty array when no tasks due today', async () => {
      const tomorrow = formatDate(new Date(Date.now() + 86400000));
      const tomorrowTask = createTask({ name: 'Due Tomorrow', priority: Priority.HIGH, dueDate: tomorrow });
      await repository.create(tomorrowTask);

      const tasks = await repository.findByDueDate('today');
      expect(tasks.length).to.equal(0);
    });
  });

  describe('Upcoming Filter', () => {
    it('should find tasks due within 7 days', async () => {
      const today = formatDate(new Date());
      const in3Days = formatDate(new Date(Date.now() + 3 * 86400000));
      const in10Days = formatDate(new Date(Date.now() + 10 * 86400000));

      const todayTask = createTask({ name: 'Today', priority: Priority.HIGH, dueDate: today });
      const soonTask = createTask({ name: 'In 3 days', priority: Priority.MEDIUM, dueDate: in3Days });
      const laterTask = createTask({ name: 'In 10 days', priority: Priority.LOW, dueDate: in10Days });

      await repository.create(todayTask);
      await repository.create(soonTask);
      await repository.create(laterTask);

      const upcoming = await repository.findByDueDate('upcoming');

      expect(upcoming.length).to.equal(2);
      expect(upcoming.map(t => t.name)).to.deep.equal(
        expect.arrayContaining(['Today', 'In 3 days'])
      );
    });

    it('should include today in upcoming filter', async () => {
      const today = formatDate(new Date());
      const todayTask = createTask({ name: 'Today Task', priority: Priority.HIGH, dueDate: today });
      await repository.create(todayTask);

      const upcoming = await repository.findByDueDate('upcoming');
      expect(upcoming.length).to.equal(1);
      expect(upcoming[0].name).to.equal('Today Task');
    });
  });

  describe('Overdue Filter', () => {
    it('should find overdue tasks', async () => {
      const yesterday = formatDate(new Date(Date.now() - 86400000));
      const lastWeek = formatDate(new Date(Date.now() - 7 * 86400000));
      const tomorrow = formatDate(new Date(Date.now() + 86400000));

      const overdueTask = createTask({ name: 'Overdue', priority: Priority.HIGH, dueDate: yesterday });
      const veryOverdueTask = createTask({ name: 'Very Overdue', priority: Priority.MEDIUM, dueDate: lastWeek });
      const futureTask = createTask({ name: 'Future', priority: Priority.LOW, dueDate: tomorrow });

      await repository.create(overdueTask);
      await repository.create(veryOverdueTask);
      await repository.create(futureTask);

      const overdue = await repository.findByDueDate('overdue');

      expect(overdue.length).to.equal(2);
      expect(overdue.map(t => t.name)).to.deep.equal(
        expect.arrayContaining(['Overdue', 'Very Overdue'])
      );
    });

    it('should not include completed tasks in overdue', async () => {
      const yesterday = formatDate(new Date(Date.now() - 86400000));
      const overdueIncomplete = createTask({ name: 'Overdue Incomplete', priority: Priority.HIGH, dueDate: yesterday });
      const overdueComplete = createTask({ name: 'Overdue Complete', priority: Priority.MEDIUM, dueDate: yesterday });
      overdueComplete.completed = true;

      await repository.create(overdueIncomplete);
      await repository.create(overdueComplete);

      const overdue = await repository.findByDueDate('overdue');

      expect(overdue.length).to.equal(1);
      expect(overdue[0].name).to.equal('Overdue Incomplete');
      expect(overdue[0].completed).to.equal(false);
    });

    it('should not include tasks without due date in overdue', async () => {
      const noDateTask = createTask({ name: 'No Date', priority: Priority.HIGH, dueDate: null });
      await repository.create(noDateTask);

      const overdue = await repository.findByDueDate('overdue');
      expect(overdue.length).to.equal(0);
    });
  });

  describe('None (No Due Date) Filter', () => {
    it('should find tasks without due date', async () => {
      const noDate1 = createTask({ name: 'No Date 1', priority: Priority.HIGH, dueDate: null });
      const noDate2 = createTask({ name: 'No Date 2', priority: Priority.MEDIUM, dueDate: null });
      const hasDate = createTask({ name: 'Has Date', priority: Priority.LOW, dueDate: '2026-12-31' });

      await repository.create(noDate1);
      await repository.create(noDate2);
      await repository.create(hasDate);

      const noDateTasks = await repository.findByDueDate('none');

      expect(noDateTasks.length).to.equal(2);
      expect(noDateTasks.map(t => t.name)).to.deep.equal(
        expect.arrayContaining(['No Date 1', 'No Date 2'])
      );
    });

    it('should return empty array when all tasks have due dates', async () => {
      const today = formatDate(new Date());
      const tomorrow = formatDate(new Date(Date.now() + 86400000));

      const todayTask = createTask({ name: 'Today', priority: Priority.HIGH, dueDate: today });
      const tomorrowTask = createTask({ name: 'Tomorrow', priority: Priority.MEDIUM, dueDate: tomorrow });

      await repository.create(todayTask);
      await repository.create(tomorrowTask);

      const noDateTasks = await repository.findByDueDate('none');
      expect(noDateTasks.length).to.equal(0);
    });
  });

  describe('Combined Filter Scenarios', () => {
    it('should handle mixed due date scenarios', async () => {
      const today = formatDate(new Date());
      const yesterday = formatDate(new Date(Date.now() - 86400000));
      const in5Days = formatDate(new Date(Date.now() + 5 * 86400000));
      const in10Days = formatDate(new Date(Date.now() + 10 * 86400000));

      const tasks = [
        createTask({ name: 'Overdue', priority: Priority.HIGH, dueDate: yesterday }),
        createTask({ name: 'Today', priority: Priority.MEDIUM, dueDate: today }),
        createTask({ name: 'Upcoming', priority: Priority.LOW, dueDate: in5Days }),
        createTask({ name: 'Later', priority: Priority.HIGH, dueDate: in10Days }),
        createTask({ name: 'No Date', priority: Priority.MEDIUM, dueDate: null })
      ];

      for (const task of tasks) {
        await repository.create(task);
      }

      // Test each filter
      expect((await repository.findByDueDate('overdue')).length).to.equal(1);
      expect((await repository.findByDueDate('today')).length).to.equal(1);
      expect((await repository.findByDueDate('upcoming')).length).to.equal(2);
      expect((await repository.findByDueDate('none')).length).to.equal(1);
    });

    it('should handle priority and due date combination', async () => {
      const today = formatDate(new Date());
      const yesterday = formatDate(new Date(Date.now() - 86400000));

      const highOverdue = createTask({ name: 'High Overdue', priority: Priority.HIGH, dueDate: yesterday });
      const highToday = createTask({ name: 'High Today', priority: Priority.HIGH, dueDate: today });
      const lowOverdue = createTask({ name: 'Low Overdue', priority: Priority.LOW, dueDate: yesterday });

      await repository.create(highOverdue);
      await repository.create(highToday);
      await repository.create(lowOverdue);

      // Filter by priority first
      const highPriority = await repository.findByPriority(Priority.HIGH);
      expect(highPriority.length).to.equal(2);

      // Then by due date
      const overdue = await repository.findByDueDate('overdue');
      expect(overdue.length).to.equal(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty database', async () => {
      expect((await repository.findByDueDate('today')).length).to.equal(0);
      expect((await repository.findByDueDate('upcoming')).length).to.equal(0);
      expect((await repository.findByDueDate('overdue')).length).to.equal(0);
      expect((await repository.findByDueDate('none')).length).to.equal(0);
    });

    it('should handle invalid due date filter', async () => {
      await expect(repository.findByDueDate('invalid')).to.be.rejected;
    });

    it('should handle multiple tasks with same due date', async () => {
      const today = formatDate(new Date());
      const task1 = createTask({ name: 'Task 1', priority: Priority.HIGH, dueDate: today });
      const task2 = createTask({ name: 'Task 2', priority: Priority.MEDIUM, dueDate: today });
      const task3 = createTask({ name: 'Task 3', priority: Priority.LOW, dueDate: today });

      await repository.create(task1);
      await repository.create(task2);
      await repository.create(task3);

      const todayTasks = await repository.findByDueDate('today');
      expect(todayTasks.length).to.equal(3);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle weekly planning workflow', async () => {
      const today = formatDate(new Date());
      const tasks = [];

      // Create tasks for each day of the week
      for (let i = 0; i < 7; i++) {
        const dueDate = formatDate(new Date(Date.now() + i * 86400000));
        const task = createTask({
          name: `Day ${i + 1} Task`,
          priority: i < 2 ? Priority.HIGH : Priority.MEDIUM,
          dueDate
        });
        tasks.push(task);
        await repository.create(task);
      }

      // Today's tasks
      const todayTasks = await repository.findByDueDate('today');
      expect(todayTasks.length).to.equal(1);
      expect(todayTasks[0].name).to.equal('Day 1 Task');

      // Upcoming (includes today + next 6 days)
      const upcoming = await repository.findByDueDate('upcoming');
      expect(upcoming.length).to.equal(7);
    });

    it('should handle deadline tracking workflow', async () => {
      // Create project with multiple deadlines
      const yesterday = formatDate(new Date(Date.now() - 86400000));
      const today = formatDate(new Date());
      const in3Days = formatDate(new Date(Date.now() + 3 * 86400000));

      const missed = createTask({ name: 'Missed deadline', priority: Priority.HIGH, dueDate: yesterday });
      const urgent = createTask({ name: 'Due today', priority: Priority.HIGH, dueDate: today });
      const upcoming = createTask({ name: 'Due in 3 days', priority: Priority.MEDIUM, dueDate: in3Days });

      await repository.create(missed);
      await repository.create(urgent);
      await repository.create(upcoming);

      // Check overdue (need attention)
      const overdue = await repository.findByDueDate('overdue');
      expect(overdue.length).to.equal(1);
      expect(overdue[0].name).to.equal('Missed deadline');

      // Check today (urgent)
      const todayTasks = await repository.findByDueDate('today');
      expect(todayTasks.length).to.equal(1);
      expect(todayTasks[0].name).to.equal('Due today');
    });
  });
});
