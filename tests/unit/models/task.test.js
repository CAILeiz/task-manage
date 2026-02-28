/**
 * Task Schema Contract Tests
 *
 * Validates task data structure according to contracts/task-schema.md
 */

import { expect } from 'chai';

import { validateTask, createTask, Priority } from '../../src/models/task.js';

describe('Task Schema Contract', () => {
  describe('validateTask', () => {
    it('should accept valid task', () => {
      const task = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Task',
        priority: Priority.HIGH,
        dueDate: '2026-03-01',
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const result = validateTask(task);
      expect(result.valid).to.be.true;
      expect(result.errors).to.deep.equal([]);
    });

    it('should reject task with empty name', () => {
      const task = {
        id: 'test-id',
        name: '',
        priority: Priority.HIGH,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const result = validateTask(task);
      expect(result.valid).to.be.false;
      expect(result.errors).to.include('Name must be 1-200 characters');
    });

    it('should reject task with invalid priority', () => {
      const task = {
        id: 'test-id',
        name: 'Test',
        priority: 'INVALID',
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const result = validateTask(task);
      expect(result.valid).to.be.false;
      expect(result.errors).to.include('Priority must be HIGH, MEDIUM, or LOW');
    });

    it('should reject task with invalid dueDate format', () => {
      const task = {
        id: 'test-id',
        name: 'Test',
        priority: Priority.MEDIUM,
        dueDate: '03-01-2026',
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const result = validateTask(task);
      expect(result.valid).to.be.false;
      expect(result.errors).to.include('dueDate must be ISO 8601 format (YYYY-MM-DD)');
    });

    it('should accept task with null dueDate', () => {
      const task = {
        id: 'test-id',
        name: 'Test',
        priority: Priority.LOW,
        dueDate: null,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const result = validateTask(task);
      expect(result.valid).to.be.true;
    });
  });
  
  describe('createTask', () => {
    it('should create valid task with UUID', () => {
      const task = createTask({
        name: 'New Task',
        priority: Priority.HIGH
      });

      expect(task.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(task.name).to.equal('New Task');
      expect(task.priority).to.equal(Priority.HIGH);
      expect(task.dueDate).to.be.null;
      expect(task.completed).to.be.false;
      expect(task.createdAt).to.be.above(0);
      expect(task.updatedAt).to.be.above(0);
    });

    it('should trim task name', () => {
      const task = createTask({
        name: '  Trimmed Task  ',
        priority: Priority.MEDIUM
      });

      expect(task.name).to.equal('Trimmed Task');
    });

    it('should create task with dueDate', () => {
      const task = createTask({
        name: 'Task with deadline',
        priority: Priority.HIGH,
        dueDate: '2026-12-31'
      });

      expect(task.dueDate).to.equal('2026-12-31');
    });

    it('should throw on invalid task', () => {
      expect(() => {
        createTask({
          name: '',
          priority: 'INVALID'
        });
      }).to.throw();
    });
  });
});
