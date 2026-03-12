import { v4 as uuidv4 } from 'uuid';
import { IUser, ICreateUserRequest, ITask, ICreateTaskRequest, IUpdateTaskRequest, ITaskFilter } from '../models/types';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../utils/jwt';
import { query, get, run } from '../config/database';
import { setValue, getValue, deleteKey } from '../config/redis';

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

// 用户服务

export async function findUserById(id: string): Promise<IUser | null> {
  const row = await get<any>(
    'SELECT id, username, email, password_hash, bio, avatar, github_id, created_at, updated_at FROM users WHERE id = ?',
    [id]
  );
  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    bio: row.bio || '',
    avatar: row.avatar || '',
    githubId: row.github_id || '',
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  } as IUser;
}

export async function findUserByUsername(username: string): Promise<IUser | null> {
  const row = await get<any>(
    'SELECT id, username, email, password_hash, bio, avatar, github_id, created_at, updated_at FROM users WHERE username = ?',
    [username]
  );
  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    bio: row.bio || '',
    avatar: row.avatar || '',
    githubId: row.github_id || '',
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  } as IUser;
}

export async function findUserByEmail(email: string): Promise<IUser | null> {
  const row = await get<any>(
    'SELECT id, username, email, password_hash, bio, avatar, github_id, created_at, updated_at FROM users WHERE email = ?',
    [email]
  );
  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    bio: row.bio || '',
    avatar: row.avatar || '',
    githubId: row.github_id || '',
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  } as IUser;
}

export async function createUser(data: ICreateUserRequest): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
  // 检查用户名是否已存在
  const existingUser = await findUserByUsername(data.username);
  if (existingUser) {
    const error = new Error('用户名已存在') as any;
    error.code = 'ER_DUP_ENTRY';
    error.message = 'Duplicate entry for username';
    throw error;
  }

  // 检查邮箱是否已存在
  const existingEmail = await findUserByEmail(data.email);
  if (existingEmail) {
    const error = new Error('邮箱已存在') as any;
    error.code = 'ER_DUP_ENTRY';
    error.message = 'Duplicate entry for email';
    throw error;
  }

  const id = uuidv4();
  const passwordHash = await hashPassword(data.password);
  const now = new Date();

  await run(
    'INSERT INTO users (id, username, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, data.username, data.email, passwordHash, now, now]
  );

  const user: IUser = {
    id,
    username: data.username,
    email: data.email,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  // 生成 Token
  const tokenPayload: TokenPayload = { userId: id, username: data.username };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // 存储 Refresh Token 到 Redis
  await setValue(`refresh:${id}`, refreshToken, REFRESH_TOKEN_TTL);

  return { user, accessToken, refreshToken };
}

export async function loginUser(usernameOrEmail: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string } | null> {
  const row = await get<any>(
    'SELECT id, username, email, password_hash, bio, avatar, created_at, updated_at FROM users WHERE username = ? OR email = ?',
    [usernameOrEmail, usernameOrEmail]
  );

  if (!row) {
    return null;
  }

  const isPasswordValid = await comparePassword(password, row.password_hash);
  if (!isPasswordValid) {
    return null;
  }

  const user: IUser = {
    id: row.id,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    bio: row.bio || '',
    avatar: row.avatar || '',
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  } as IUser;

  const tokenPayload: TokenPayload = { userId: user.id, username: user.username };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  await setValue(`refresh:${user.id}`, refreshToken, REFRESH_TOKEN_TTL);

  return { user, accessToken, refreshToken };
}

export async function updateUser(id: string, data: { username?: string; email?: string; bio?: string; avatar?: string }): Promise<IUser | null> {
  const updates: string[] = [];
  const params: any[] = [];

  if (data.username !== undefined) {
    updates.push('username = ?');
    params.push(data.username);
  }
  if (data.email !== undefined) {
    updates.push('email = ?');
    params.push(data.email);
  }
  if (data.bio !== undefined) {
    updates.push('bio = ?');
    params.push(data.bio);
  }
  if (data.avatar !== undefined) {
    updates.push('avatar = ?');
    params.push(data.avatar);
  }

  if (updates.length === 0) {
    return await findUserById(id);
  }

  params.push(id);
  await run(`UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);

  return await findUserById(id);
}

export async function changeUserPassword(id: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const user = await findUserById(id);
  if (!user) {
    return { success: false, message: '用户不存在' };
  }

  const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
  if (!isPasswordValid) {
    return { success: false, message: '当前密码错误' };
  }

  if (newPassword.length < 6) {
    return { success: false, message: '新密码长度至少6位' };
  }

  const newPasswordHash = await hashPassword(newPassword);
  await run('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [newPasswordHash, id]);

  return { success: true, message: '密码修改成功' };
}

export async function findOrCreateGitHubUser(githubId: string, username: string, email: string, avatar?: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
  const existingRow = await get<any>(
    'SELECT id, username, email, bio, avatar, created_at, updated_at FROM users WHERE github_id = ?',
    [githubId]
  );

  if (existingRow) {
    const user: IUser = {
      id: existingRow.id,
      username: existingRow.username,
      email: existingRow.email,
      passwordHash: '',
      bio: existingRow.bio || '',
      avatar: existingRow.avatar || '',
      createdAt: new Date(existingRow.created_at),
      updatedAt: new Date(existingRow.updated_at),
    } as IUser;

    const tokenPayload: TokenPayload = { userId: user.id, username: user.username };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    await setValue(`refresh:${user.id}`, refreshToken, REFRESH_TOKEN_TTL);

    return { user, accessToken, refreshToken };
  }

  const id = uuidv4();
  const now = new Date();
  const safeEmail = email || `${githubId}@github.placeholder`;

  await run(
    'INSERT INTO users (id, username, email, password_hash, github_id, avatar, bio, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, username, safeEmail, '', githubId, avatar || '', '', now, now]
  );

  const user: IUser = {
    id,
    username,
    email: safeEmail,
    passwordHash: '',
    bio: '',
    avatar: avatar || '',
    createdAt: now,
    updatedAt: now,
  } as IUser;

  const tokenPayload: TokenPayload = { userId: id, username };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);
  await setValue(`refresh:${id}`, refreshToken, REFRESH_TOKEN_TTL);

  return { user, accessToken, refreshToken };
}

export async function logoutUser(userId: string): Promise<void> {
  // 从 Redis 删除 Refresh Token
  await deleteKey(`refresh:${userId}`);
}

export async function refreshAccessToken(userId: string, refreshToken: string): Promise<string | null> {
  // 从 Redis 获取存储的 Refresh Token
  const storedToken = await getValue(`refresh:${userId}`);
  if (!storedToken || storedToken !== refreshToken) {
    return null;
  }

  const user = await findUserById(userId);
  if (!user) {
    return null;
  }

  const tokenPayload: TokenPayload = { userId: user.id, username: user.username };
  return generateAccessToken(tokenPayload);
}

// 任务服务

export async function createTask(userId: string, data: ICreateTaskRequest): Promise<ITask> {
  const id = uuidv4();
  const now = new Date();
  const dueDate = data.dueDate ? new Date(data.dueDate) : null;

  await run(
    'INSERT INTO tasks (id, user_id, name, description, priority, due_date, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, userId, data.name, data.description || null, data.priority, dueDate, false, now, now]
  );

  return {
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
}

export async function findTaskById(id: string, userId: string): Promise<ITask | null> {
  const row = await get<any>(
    `SELECT id, user_id, name, description, priority, due_date, completed, created_at, updated_at 
     FROM tasks WHERE id = ? AND user_id = ?`,
    [id, userId]
  );

  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    priority: row.priority,
    dueDate: row.due_date ? new Date(row.due_date) : null,
    completed: row.completed === 1 || row.completed === true,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function findTasksByUserId(
  userId: string,
  filter: ITaskFilter = {},
  page: number = 1,
  limit: number = 20
): Promise<{ tasks: ITask[]; total: number }> {
  let whereClause = 'WHERE t.user_id = ?';
  const params: any[] = [userId];

  if (filter.priority) {
    whereClause += ' AND t.priority = ?';
    params.push(filter.priority);
  }

  if (filter.completed !== undefined) {
    whereClause += ' AND t.completed = ?';
    params.push(filter.completed ? 1 : 0);
  }

  if (filter.dueDateFilter) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter.dueDateFilter) {
      case 'today':
        whereClause += ' AND t.due_date = CURDATE()';
        break;
      case 'upcoming':
        whereClause += ' AND t.due_date > CURDATE() AND t.due_date <= DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND t.completed = 0';
        break;
      case 'overdue':
        whereClause += ' AND t.due_date < CURDATE() AND t.completed = 0';
        break;
      case 'none':
        whereClause += ' AND t.due_date IS NULL';
        break;
    }
  }

  if (filter.search) {
    whereClause += ' AND (t.name LIKE ? OR t.description LIKE ?)';
    const searchPattern = `%${filter.search}%`;
    params.push(searchPattern, searchPattern);
  }

  // 获取总数
  const countResult = await get<any>(`SELECT COUNT(*) as total FROM tasks t ${whereClause}`, params);
  const total = countResult?.total || 0;

  // 获取分页数据
  const offset = (page - 1) * limit;
  const rows = await query<any>(
    `SELECT id, user_id, name, description, priority, due_date, completed, created_at, updated_at 
     FROM tasks t ${whereClause} 
     ORDER BY t.created_at DESC 
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const tasks: ITask[] = rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    priority: row.priority,
    dueDate: row.due_date ? new Date(row.due_date) : null,
    completed: row.completed === 1 || row.completed === true,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));

  return { tasks, total };
}

export async function updateTask(id: string, userId: string, data: IUpdateTaskRequest): Promise<ITask | null> {
  const existingTask = await findTaskById(id, userId);
  if (!existingTask) {
    return null;
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    params.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    params.push(data.description);
  }
  if (data.priority !== undefined) {
    updates.push('priority = ?');
    params.push(data.priority);
  }
  if (data.dueDate !== undefined) {
    updates.push('due_date = ?');
    params.push(data.dueDate ? new Date(data.dueDate) : null);
  }
  if (data.completed !== undefined) {
    updates.push('completed = ?');
    params.push(data.completed ? 1 : 0);
  }

  if (updates.length === 0) {
    return existingTask;
  }

  params.push(id);
  params.push(userId);

  await run(
    `UPDATE tasks SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ? AND user_id = ?`,
    params
  );

  return await findTaskById(id, userId);
}

export async function deleteTask(id: string, userId: string): Promise<boolean> {
  const result = await run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
  return result.changes > 0;
}

export async function findUpcomingTasks(from: Date, to: Date): Promise<any[]> {
  const rows = await query<any>(
    `SELECT id, user_id, name, description, priority, due_date, completed, created_at, updated_at
     FROM tasks 
     WHERE completed = 0 
     AND due_date IS NOT NULL 
     AND due_date BETWEEN ? AND ?
     ORDER BY due_date ASC`,
    [from, to]
  );
  return rows.map(row => ({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    description: row.description,
    priority: row.priority,
    due_date: row.due_date ? new Date(row.due_date) : null,
    completed: row.completed === 1 || row.completed === true,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }));
}

export interface TaskCounts {
  all: number;
  today: number;
  overdue: number;
  upcoming: number;
  none: number;
  completed: number;
}

export async function getTaskCounts(userId: string): Promise<TaskCounts> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [all, todayCount, overdue, upcoming, none, completed] = await Promise.all([
    get<any>('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?', [userId]),
    get<any>('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND due_date = CURDATE()', [userId]),
    get<any>('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND due_date < CURDATE() AND completed = 0', [userId]),
    get<any>('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND due_date > CURDATE() AND due_date <= DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND completed = 0', [userId]),
    get<any>('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND due_date IS NULL', [userId]),
    get<any>('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND completed = 1', [userId]),
  ]);

  return {
    all: all?.count || 0,
    today: todayCount?.count || 0,
    overdue: overdue?.count || 0,
    upcoming: upcoming?.count || 0,
    none: none?.count || 0,
    completed: completed?.count || 0,
  };
}

export type NotificationType = 'task_reminder' | 'task_completed' | 'task_uncompleted' | 'task_created';

export interface INotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content: string | null;
  task_id: string | null;
  read_at: Date | null;
  created_at: Date;
}

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  content?: string;
  taskId?: string;
}): Promise<INotification> {
  const id = uuidv4();
  const now = new Date();

  await run(
    'INSERT INTO notifications (id, user_id, type, title, content, task_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, data.userId, data.type, data.title, data.content || null, data.taskId || null, now]
  );

  return {
    id,
    user_id: data.userId,
    type: data.type,
    title: data.title,
    content: data.content || null,
    task_id: data.taskId || null,
    read_at: null,
    created_at: now,
  };
}

export async function findNotificationsByUserId(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ list: INotification[]; total: number }> {
  const offset = (page - 1) * limit;

  const rows = await query<any>(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, limit, offset]
  );

  const countResult = await get<any>(
    'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
    [userId]
  );

  return {
    list: rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      type: row.type,
      title: row.title,
      content: row.content,
      task_id: row.task_id,
      read_at: row.read_at ? new Date(row.read_at) : null,
      created_at: new Date(row.created_at),
    })),
    total: countResult?.total || 0,
  };
}

export async function getNotificationUnreadCount(userId: string): Promise<number> {
  const result = await get<any>(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_at IS NULL',
    [userId]
  );
  return result?.count || 0;
}

export async function markNotificationAsRead(id: string, userId: string): Promise<boolean> {
  const result = await run(
    'UPDATE notifications SET read_at = NOW() WHERE id = ? AND user_id = ? AND read_at IS NULL',
    [id, userId]
  );
  return result.changes > 0;
}

export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  const result = await run(
    'UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL',
    [userId]
  );
  return result.changes;
}

// 数据库初始化和清理函数

export async function initDatabase(): Promise<void> {
  console.log('Database service initialized');
}

export async function closePool(): Promise<void> {
  console.log('Database service closed');
}

export async function clearDatabase(): Promise<void> {
  // 清空数据库表（通过 database.ts 中的函数）
  const { clearDatabase: clearDb } = await import('../config/database');
  await clearDb();
}

export default {
  findUserById,
  findUserByUsername,
  findUserByEmail,
  createUser,
  loginUser,
  updateUser,
  changeUserPassword,
  findOrCreateGitHubUser,
  logoutUser,
  refreshAccessToken,
  createTask,
  findTaskById,
  findTasksByUserId,
  updateTask,
  deleteTask,
  initDatabase,
  closePool,
  clearDatabase,
};
