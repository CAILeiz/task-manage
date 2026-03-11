import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import type { IUser, ICreateUserRequest, ITask, ICreateTaskRequest, IUpdateTaskRequest, ITaskFilter } from '../models/types';

const SALT_ROUNDS = 10;

// 内存数据库
const users: IUser[] = [];
const tasks: ITask[] = [];

// 用户服务

export async function findUserById(id: string): Promise<IUser | null> {
  const user = users.find(u => u.id === id);
  return user ? { ...user } : null;
}

export async function findUserByUsername(username: string): Promise<IUser | null> {
  const user = users.find(u => u.username === username);
  return user ? { ...user } : null;
}

export async function findUserByEmail(email: string): Promise<IUser | null> {
  const user = users.find(u => u.email === email);
  return user ? { ...user } : null;
}

export async function createUser(data: ICreateUserRequest): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
  const id = uuidv4();
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const now = new Date();

  const user: IUser = {
    id,
    username: data.username,
    email: data.email,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  users.push(user);

  // 生成 Token
  const accessToken = `token_${id}_${Date.now()}`;
  const refreshToken = `refresh_${id}_${Date.now()}`;

  return { user: { ...user }, accessToken, refreshToken };
}

export async function loginUser(usernameOrEmail: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string } | null> {
  const user = users.find(u => u.username === usernameOrEmail || u.email === usernameOrEmail);
  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return null;
  }

  const accessToken = `token_${user.id}_${Date.now()}`;
  const refreshToken = `refresh_${user.id}_${Date.now()}`;

  return { user: { ...user }, accessToken, refreshToken };
}

// 任务服务

export async function createTask(userId: string, data: ICreateTaskRequest): Promise<ITask> {
  const id = uuidv4();
  const now = new Date();
  const dueDate = data.dueDate ? new Date(data.dueDate) : null;

  const task: ITask = {
    id,
    userId,
    name: data.name,
    description: data.description || null,
    priority: data.priority,
    dueDate,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(task);
  return { ...task };
}

export async function findTaskById(id: string, userId: string): Promise<ITask | null> {
  const task = tasks.find(t => t.id === id && t.userId === userId);
  return task ? { ...task } : null;
}

export async function findTasksByUserId(
  userId: string,
  filter: ITaskFilter = {},
  page: number = 1,
  limit: number = 20
): Promise<{ tasks: ITask[]; total: number }> {
  let filteredTasks = tasks.filter(t => t.userId === userId);

  if (filter.priority) {
    filteredTasks = filteredTasks.filter(t => t.priority === filter.priority);
  }

  if (filter.completed !== undefined) {
    filteredTasks = filteredTasks.filter(t => t.completed === filter.completed);
  }

  if (filter.dueDateFilter) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter.dueDateFilter) {
      case 'today':
        filteredTasks = filteredTasks.filter(t => {
          if (!t.dueDate) return false;
          const due = new Date(t.dueDate);
          due.setHours(0, 0, 0, 0);
          return due.getTime() === today.getTime();
        });
        break;
      case 'upcoming':
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        filteredTasks = filteredTasks.filter(t => {
          if (!t.dueDate || t.completed) return false;
          const due = new Date(t.dueDate);
          return due > today && due <= nextWeek;
        });
        break;
      case 'overdue':
        filteredTasks = filteredTasks.filter(t => {
          if (!t.dueDate || t.completed) return false;
          const due = new Date(t.dueDate);
          return due < today;
        });
        break;
      case 'none':
        filteredTasks = filteredTasks.filter(t => !t.dueDate);
        break;
    }
  }

  // 按创建时间倒序
  filteredTasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = filteredTasks.length;
  const offset = (page - 1) * limit;
  const paginatedTasks = filteredTasks.slice(offset, offset + limit);

  return { tasks: paginatedTasks.map(t => ({ ...t })), total };
}

export async function updateTask(id: string, userId: string, data: IUpdateTaskRequest): Promise<ITask | null> {
  const taskIndex = tasks.findIndex(t => t.id === id && t.userId === userId);
  if (taskIndex === -1) {
    return null;
  }

  const task = tasks[taskIndex];

  if (data.name !== undefined) task.name = data.name;
  if (data.description !== undefined) task.description = data.description;
  if (data.priority !== undefined) task.priority = data.priority;
  if (data.dueDate !== undefined) task.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.completed !== undefined) task.completed = data.completed;

  task.updatedAt = new Date();

  return { ...task };
}

export async function deleteTask(id: string, userId: string): Promise<boolean> {
  const taskIndex = tasks.findIndex(t => t.id === id && t.userId === userId);
  if (taskIndex === -1) {
    return false;
  }

  tasks.splice(taskIndex, 1);
  return true;
}

// 初始化数据库
export async function initDatabase(): Promise<void> {
  console.log('Memory database initialized');
}

export async function closePool(): Promise<void> {
  users.length = 0;
  tasks.length = 0;
}

export async function clearDatabase(): Promise<void> {
  users.length = 0;
  tasks.length = 0;
}

export default {
  findUserById,
  findUserByUsername,
  findUserByEmail,
  createUser,
  loginUser,
  createTask,
  findTaskById,
  findTasksByUserId,
  updateTask,
  deleteTask,
  initDatabase,
  closePool,
  clearDatabase,
};
