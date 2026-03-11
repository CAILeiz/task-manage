import request from './request';
import type { ApiResponse, Task, CreateTaskRequest, UpdateTaskRequest, PaginationData, TaskQueryParams } from '../types';

export const getTasks = (params?: TaskQueryParams): Promise<ApiResponse<PaginationData<Task>>> => {
  return request.get('/tasks', { params }).then(res => res.data);
};

export const getTaskById = (id: string): Promise<ApiResponse<Task>> => {
  return request.get(`/tasks/${id}`).then(res => res.data);
};

export const createTask = (data: CreateTaskRequest): Promise<ApiResponse<Task>> => {
  return request.post('/tasks', data).then(res => res.data);
};

export const updateTask = (id: string, data: UpdateTaskRequest): Promise<ApiResponse<Task>> => {
  return request.put(`/tasks/${id}`, data).then(res => res.data);
};

export const deleteTask = (id: string): Promise<ApiResponse<null>> => {
  return request.delete(`/tasks/${id}`).then(res => res.data);
};

export default {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
