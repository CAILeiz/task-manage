import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTaskStore } from '../../src/stores/task';
import * as taskApi from '../../src/api/task';
import type { Task, PaginationData } from '../../src/types';

vi.mock('../../src/api/task');

describe('Task Store Integration', () => {
  const mockTask: Task = {
    id: '1',
    userId: 'user1',
    name: 'Test Task',
    description: 'Test Description',
    priority: 'HIGH',
    dueDate: '2024-12-31',
    completed: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should fetch tasks successfully', async () => {
    const mockResponse = {
      code: 0,
      data: {
        list: [mockTask],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      } as PaginationData<Task>,
      message: 'Success',
    };
    vi.mocked(taskApi.getTasks).mockResolvedValue(mockResponse);

    const store = useTaskStore();
    await store.fetchTasks();

    expect(store.tasks).toHaveLength(1);
    expect(store.tasks[0].name).toBe('Test Task');
    expect(store.total).toBe(1);
    expect(store.loading).toBe(false);
  });

  it('should create task successfully', async () => {
    const mockResponse = {
      code: 0,
      data: mockTask,
      message: '任务创建成功',
    };
    vi.mocked(taskApi.createTask).mockResolvedValue(mockResponse);

    const store = useTaskStore();
    store.tasks = [];
    store.total = 0;

    const result = await store.createTask({
      name: 'Test Task',
      priority: 'HIGH',
      dueDate: '2024-12-31',
    });

    expect(result.success).toBe(true);
    expect(store.tasks).toHaveLength(1);
    expect(store.total).toBe(1);
  });

  it('should update task successfully', async () => {
    const updatedTask = { ...mockTask, name: 'Updated Task' };
    const mockResponse = {
      code: 0,
      data: updatedTask,
      message: '任务更新成功',
    };
    vi.mocked(taskApi.updateTask).mockResolvedValue(mockResponse);

    const store = useTaskStore();
    store.tasks = [mockTask];

    const result = await store.updateTask('1', { name: 'Updated Task' });

    expect(result.success).toBe(true);
    expect(store.tasks[0].name).toBe('Updated Task');
  });

  it('should delete task successfully', async () => {
    const mockResponse = {
      code: 0,
      data: null,
      message: '任务删除成功',
    };
    vi.mocked(taskApi.deleteTask).mockResolvedValue(mockResponse);

    const store = useTaskStore();
    store.tasks = [mockTask];
    store.total = 1;

    const result = await store.deleteTask('1');

    expect(result.success).toBe(true);
    expect(store.tasks).toHaveLength(0);
    expect(store.total).toBe(0);
  });

  it('should toggle task completion', async () => {
    const completedTask = { ...mockTask, completed: true };
    const mockResponse = {
      code: 0,
      data: completedTask,
      message: '任务更新成功',
    };
    vi.mocked(taskApi.updateTask).mockResolvedValue(mockResponse);

    const store = useTaskStore();
    store.tasks = [mockTask];

    const result = await store.toggleComplete(mockTask);

    expect(result.success).toBe(true);
    expect(store.tasks[0].completed).toBe(true);
  });

  it('should apply filters correctly', async () => {
    const mockResponse = {
      code: 0,
      data: {
        list: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      } as PaginationData<Task>,
      message: 'Success',
    };
    vi.mocked(taskApi.getTasks).mockResolvedValue(mockResponse);

    const store = useTaskStore();
    await store.setFilter({ priority: 'HIGH', completed: false });

    expect(store.filter.priority).toBe('HIGH');
    expect(store.filter.completed).toBe(false);
    expect(store.page).toBe(1);
    expect(taskApi.getTasks).toHaveBeenCalledWith(expect.objectContaining({
      priority: 'HIGH',
      completed: false,
      page: 1,
      limit: 20,
    }));
  });

  it('should clear filters', async () => {
    const mockResponse = {
      code: 0,
      data: {
        list: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      } as PaginationData<Task>,
      message: 'Success',
    };
    vi.mocked(taskApi.getTasks).mockResolvedValue(mockResponse);

    const store = useTaskStore();
    store.filter = { priority: 'HIGH' };
    store.page = 3;

    await store.clearFilter();

    expect(store.filter).toEqual({});
    expect(store.page).toBe(1);
  });

  it('should handle pagination', async () => {
    const mockResponse = {
      code: 0,
      data: {
        list: [mockTask],
        total: 50,
        page: 2,
        limit: 20,
        totalPages: 3,
      } as PaginationData<Task>,
      message: 'Success',
    };
    vi.mocked(taskApi.getTasks).mockResolvedValue(mockResponse);

    const store = useTaskStore();
    await store.setPage(2);

    expect(store.page).toBe(2);
    expect(store.totalPages).toBe(3);
    expect(taskApi.getTasks).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
  });
});
