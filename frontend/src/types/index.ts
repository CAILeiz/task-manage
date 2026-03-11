export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  priority: Priority;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

export interface PaginationData<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface CreateTaskRequest {
  name: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  completed?: boolean;
}

export interface TaskFilter {
  priority?: Priority;
  completed?: boolean;
  dueDateFilter?: 'today' | 'upcoming' | 'overdue' | 'none';
}

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  priority?: Priority;
  completed?: boolean;
  dueDateFilter?: 'today' | 'upcoming' | 'overdue' | 'none';
  search?: string;
}
