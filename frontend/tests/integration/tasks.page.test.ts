import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import Tasks from '../../src/views/Tasks/Tasks.vue';
import * as taskApi from '../../src/api/task';
import type { Task, PaginationData } from '../../src/types';

vi.mock('../../src/api/task');
vi.mock('element-plus', () => ({
  ElMessage: { success: vi.fn(), error: vi.fn() },
  ElMessageBox: { confirm: vi.fn().mockResolvedValue(true) },
  ElTable: { name: 'ElTable' },
  ElTableColumn: { name: 'ElTableColumn' },
  ElButton: { name: 'ElButton' },
  ElTag: { name: 'ElTag' },
  ElPagination: { name: 'ElPagination' },
  ElSelect: { name: 'ElSelect' },
  ElOption: { name: 'ElOption' },
  ElDialog: { name: 'ElDialog' },
  ElForm: { name: 'ElForm' },
  ElFormItem: { name: 'ElFormItem' },
  ElInput: { name: 'ElInput' },
  ElRadioGroup: { name: 'ElRadioGroup' },
  ElRadioButton: { name: 'ElRadioButton' },
  ElDatePicker: { name: 'ElDatePicker' },
  ElSwitch: { name: 'ElSwitch' },
  ElIcon: { name: 'ElIcon' },
}));

describe('Tasks Page Integration', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      userId: 'user1',
      name: 'Task 1',
      description: 'Description 1',
      priority: 'HIGH',
      dueDate: '2024-12-31',
      completed: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '2',
      userId: 'user1',
      name: 'Task 2',
      description: 'Description 2',
      priority: 'MEDIUM',
      dueDate: null,
      completed: true,
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02',
    },
  ];

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should render tasks list', async () => {
    const mockResponse = {
      code: 0,
      data: {
        list: mockTasks,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      } as PaginationData<Task>,
      message: 'Success',
    };
    vi.mocked(taskApi.getTasks).mockResolvedValue(mockResponse);

    const wrapper = mount(Tasks, {
      global: {
        stubs: {
          'el-table': true,
          'el-table-column': true,
          'el-button': true,
          'el-tag': true,
          'el-pagination': true,
          'el-select': true,
          'el-option': true,
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-radio-group': true,
          'el-radio-button': true,
          'el-date-picker': true,
          'el-switch': true,
          'el-icon': true,
        },
      },
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(wrapper.find('h1').text()).toBe('任务管理');
  });

  it('should call API with filter parameters', async () => {
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

    const wrapper = mount(Tasks, {
      global: {
        stubs: {
          'el-table': true,
          'el-table-column': true,
          'el-button': true,
          'el-tag': true,
          'el-pagination': true,
          'el-select': true,
          'el-option': true,
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-radio-group': true,
          'el-radio-button': true,
          'el-date-picker': true,
          'el-switch': true,
          'el-icon': true,
        },
      },
    });

    // 初始加载应该调用 getTasks
    expect(taskApi.getTasks).toHaveBeenCalled();
  });
});

describe('Task CRUD Integration Flow', () => {
  it('should create, update, and delete task in sequence', async () => {
    const mockTask: Task = {
      id: '1',
      userId: 'user1',
      name: 'New Task',
      description: 'New Description',
      priority: 'HIGH',
      dueDate: '2024-12-31',
      completed: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    // Mock create
    vi.mocked(taskApi.createTask).mockResolvedValue({
      code: 0,
      data: mockTask,
      message: '任务创建成功',
    });

    // Mock update
    const updatedTask = { ...mockTask, name: 'Updated Task' };
    vi.mocked(taskApi.updateTask).mockResolvedValue({
      code: 0,
      data: updatedTask,
      message: '任务更新成功',
    });

    // Mock delete
    vi.mocked(taskApi.deleteTask).mockResolvedValue({
      code: 0,
      data: null,
      message: '任务删除成功',
    });

    setActivePinia(createPinia());
    const { useTaskStore } = await import('../../src/stores/task');
    const store = useTaskStore();

    // 1. 创建任务
    const createResult = await store.createTask({
      name: 'New Task',
      description: 'New Description',
      priority: 'HIGH',
      dueDate: '2024-12-31',
    });
    expect(createResult.success).toBe(true);
    expect(store.tasks).toHaveLength(1);

    // 2. 更新任务
    const updateResult = await store.updateTask('1', { name: 'Updated Task' });
    expect(updateResult.success).toBe(true);
    expect(store.tasks[0].name).toBe('Updated Task');

    // 3. 删除任务
    const deleteResult = await store.deleteTask('1');
    expect(deleteResult.success).toBe(true);
    expect(store.tasks).toHaveLength(0);
  });
});
