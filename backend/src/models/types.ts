/**
 * 优先级枚举
 */
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * 用户接口
 */
export interface IUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建用户请求
 */
export interface ICreateUserRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * 用户响应（不包含密码）
 */
export interface IUserResponse {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 任务接口
 */
export interface ITask {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  priority: Priority;
  dueDate: Date | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建任务请求
 */
export interface ICreateTaskRequest {
  name: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
}

/**
 * 更新任务请求
 */
export interface IUpdateTaskRequest {
  name?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  completed?: boolean;
}

/**
 * API 响应结构
 */
export interface IApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

/**
 * 分页响应
 */
export interface IPaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 任务过滤器
 */
export interface ITaskFilter {
  priority?: Priority;
  completed?: boolean;
  dueDateFilter?: 'today' | 'upcoming' | 'overdue' | 'none';
}
