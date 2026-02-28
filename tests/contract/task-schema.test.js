/**
 * Task Schema Contract Tests
 *
 * Validates task data structure according to contracts/task-schema.md
 */

import { expect } from 'chai';

import { validateTask, createTask, Priority, updateTask } from '../../src/models/task.js';

describe('Task Schema Contract', () => {
  describe('validateTask', () => {
    it('should accept valid task', () => {
      const task = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Task',
        description: 'Test description',
        priority: Priority.HIGH,
        dueDate: '2026-03-01',
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const result = validateTask(task);
      expect(result.valid).to.be.true;
      expect(result.errors).to.eql([]);
    });

    it('should accept task with empty description', () => {
      const task = {
        id: 'test-id',
        name: 'Test Task',
        description: '',
        priority: Priority.HIGH,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const result = validateTask(task);
      expect(result.valid).to.be.true;
    });

    it('should accept task without description field', () => {
      const task = {
        id: 'test-id',
        name: 'Test Task',
        priority: Priority.HIGH,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const result = validateTask(task);
      expect(result.valid).to.be.true;
    });

    it('should reject task with description too long', () => {
      const task = {
        id: 'test-id',
        name: 'Test Task',
        description: 'a'.repeat(101),
        priority: Priority.HIGH,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const result = validateTask(task);
      expect(result.valid).to.be.false;
      expect(result.errors).to.contain('Description must be 100 characters or less');
    });

    it('should reject task with non-string description', () => {
      const task = {
        id: 'test-id',
        name: 'Test Task',
        description: 123,
        priority: Priority.HIGH,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const result = validateTask(task);
      expect(result.valid).to.be.false;
      expect(result.errors).to.contain('Description must be a string');
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
      expect(result.errors).to.contain('Name must be 1-200 characters');
    });

    it('should reject task with missing name', () => {
      const task = {
        id: 'test-id',
        priority: Priority.HIGH,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const result = validateTask(task);
      expect(result.valid).to.be.false;
      expect(result.errors).to.contain('Name is required');
    });

    it('should reject task with name too long', () => {
      const task = {
        id: 'test-id',
        name: 'A'.repeat(201),
        priority: Priority.HIGH,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const result = validateTask(task);
      expect(result.valid).to.be.false;
      expect(result.errors).to.contain('Name must be 1-200 characters');
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
      expect(result.errors).to.contain('Priority must be HIGH, MEDIUM, or LOW');
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
      expect(result.errors).to.contain('dueDate must be ISO 8601 format (YYYY-MM-DD)');
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

    it('should reject task with non-boolean completed', () => {
      const task = {
        id: 'test-id',
        name: 'Test',
        priority: Priority.LOW,
        completed: 'false',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const result = validateTask(task);
      expect(result.valid).to.be.false;
      expect(result.errors).to.contain('completed must be a boolean');
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
      expect(task.description).to.equal('');
      expect(task.createdAt).to.be.greaterThan(0);
      expect(task.updatedAt).to.be.greaterThan(0);
    });

    it('should create task with description', () => {
      const task = createTask({
        name: 'Task with description',
        priority: Priority.HIGH,
        description: 'This is a test description'
      });

      expect(task.description).to.equal('This is a test description');
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

  describe('updateTask', () => {
    it('should update task and update updatedAt', () => {
      const originalTask = {
        id: 'test-id',
        name: 'Original',
        priority: Priority.MEDIUM,
        dueDate: null,
        completed: false,
        createdAt: Date.now() - 1000,
        updatedAt: Date.now() - 1000
      };

      const updatedTask = updateTask(originalTask, { name: 'Updated' });

      expect(updatedTask.name).to.equal('Updated');
      expect(updatedTask.updatedAt).to.be.greaterThan(originalTask.updatedAt);
      expect(updatedTask.createdAt).to.equal(originalTask.createdAt);
    });

    it('should mark task as completed', () => {
      const task = {
        id: 'test-id',
        name: 'Test',
        priority: Priority.LOW,
        dueDate: null,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const updatedTask = updateTask(task, { completed: true });

      expect(updatedTask.completed).to.be.true;
    });

    it('should throw on invalid update', () => {
      const task = {
        id: 'test-id',
        name: 'Test',
        priority: Priority.LOW,
        dueDate: null,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      expect(() => {
        updateTask(task, { name: '' });
      }).to.throw();
    });
  });

  describe('Priority enum', () => {
    it('should have correct values', () => {
      expect(Priority.HIGH).to.equal('HIGH');
      expect(Priority.MEDIUM).to.equal('MEDIUM');
      expect(Priority.LOW).to.equal('LOW');
    });
  });
});
