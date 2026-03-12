import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskQueryParams } from '../types';
import * as taskApi from '../api/task';

interface TaskCounts {
  all: number;
  today: number;
  overdue: number;
  upcoming: number;
  none: number;
  completed: number;
}

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([]);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(20);
  const loading = ref(false);
  const filter = ref<TaskQueryParams>({});
  const searchQuery = ref('');
  const taskCounts = ref<TaskCounts>({
    all: 0,
    today: 0,
    overdue: 0,
    upcoming: 0,
    none: 0,
    completed: 0,
  });

  const totalPages = computed(() => Math.ceil(total.value / limit.value));

  async function fetchTasks(params?: TaskQueryParams) {
    loading.value = true;
    try {
      const queryParams = { ...filter.value, ...params, page: page.value, limit: limit.value };
      const response = await taskApi.getTasks(queryParams);
      if (response.code === 0) {
        tasks.value = response.data.list;
        total.value = response.data.total;
        page.value = response.data.page;
        limit.value = response.data.limit;
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      loading.value = false;
    }
  }

  async function createTask(data: CreateTaskRequest) {
    try {
      const response = await taskApi.createTask(data);
      if (response.code === 0) {
        tasks.value.unshift(response.data);
        total.value++;
        fetchTaskCounts();
        return { success: true, task: response.data };
      }
      return { success: false, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '创建失败' };
    }
  }

  async function updateTask(id: string, data: UpdateTaskRequest) {
    try {
      const response = await taskApi.updateTask(id, data);
      if (response.code === 0) {
        const index = tasks.value.findIndex(t => t.id === id);
        if (index !== -1) {
          tasks.value[index] = response.data;
        }
        return { success: true, task: response.data };
      }
      return { success: false, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '更新失败' };
    }
  }

  async function deleteTask(id: string) {
    try {
      const response = await taskApi.deleteTask(id);
      if (response.code === 0) {
        tasks.value = tasks.value.filter(t => t.id !== id);
        total.value--;
        fetchTaskCounts();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '删除失败' };
    }
  }

  async function toggleComplete(task: Task) {
    const newCompleted = !task.completed;
    const result = await updateTask(task.id, { completed: newCompleted });
    return result;
  }

  function setPage(newPage: number) {
    page.value = newPage;
    fetchTasks();
  }

  function setFilter(newFilter: TaskQueryParams) {
    filter.value = { ...filter.value, ...newFilter };
    page.value = 1;
    fetchTasks();
  }

  function clearFilter() {
    filter.value = {};
    page.value = 1;
    fetchTasks();
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query;
    page.value = 1;
    fetchTasks({ search: query });
  }

  async function fetchTaskCounts() {
    try {
      const [allRes, todayRes, overdueRes, upcomingRes, noneRes, completedRes] = await Promise.all([
        taskApi.getTasks({ limit: 1 }),
        taskApi.getTasks({ dueDateFilter: 'today', limit: 1 }),
        taskApi.getTasks({ dueDateFilter: 'overdue', limit: 1 }),
        taskApi.getTasks({ dueDateFilter: 'upcoming', limit: 1 }),
        taskApi.getTasks({ dueDateFilter: 'none', limit: 1 }),
        taskApi.getTasks({ completed: true, limit: 1 }),
      ]);

      taskCounts.value = {
        all: allRes.data?.total || 0,
        today: todayRes.data?.total || 0,
        overdue: overdueRes.data?.total || 0,
        upcoming: upcomingRes.data?.total || 0,
        none: noneRes.data?.total || 0,
        completed: completedRes.data?.total || 0,
      };
    } catch (error) {
      console.error('Failed to fetch task counts:', error);
    }
  }

  return {
    tasks,
    total,
    page,
    limit,
    loading,
    totalPages,
    filter,
    searchQuery,
    taskCounts,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    setPage,
    setFilter,
    clearFilter,
    setSearchQuery,
    fetchTaskCounts,
  };
});
