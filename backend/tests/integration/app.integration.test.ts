import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { closePool, clearDatabase, initDatabase } from '../src/config/database';
import { closeRedis } from '../src/config/redis';

describe('Full Application Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await initDatabase();
  });

  afterAll(async () => {
    await closePool();
    await closeRedis();
  });

  beforeEach(async () => {
    await clearDatabase();
    authToken = '';
    userId = '';
  });

  describe('User Authentication Flow', () => {
    it('should complete full registration and login flow', async () => {
      // 1. 注册新用户
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(registerRes.status).toBe(201);
      expect(registerRes.body.code).toBe(0);
      expect(registerRes.body.data.user.username).toBe('testuser');
      expect(registerRes.body.data.accessToken).toBeDefined();

      authToken = registerRes.body.data.accessToken;
      userId = registerRes.body.data.user.id;

      // 2. 使用 Token 获取用户信息
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.data.username).toBe('testuser');

      // 3. 使用相同用户名注册应该失败
      const duplicateRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test2@example.com',
          password: 'password123',
        });

      expect(duplicateRes.status).toBe(409);
    });

    it('should login with valid credentials', async () => {
      // 先注册用户
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'loginuser',
          email: 'login@example.com',
          password: 'password123',
        });

      // 登录
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'password123',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.code).toBe(0);
      expect(loginRes.body.data.accessToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpassword',
        });

      expect(loginRes.status).toBe(401);
    });
  });

  describe('Task Management Flow', () => {
    beforeEach(async () => {
      // 创建测试用户并获取 Token
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'taskuser',
          email: 'task@example.com',
          password: 'password123',
        });

      authToken = registerRes.body.data.accessToken;
      userId = registerRes.body.data.user.id;
    });

    it('should complete full task CRUD flow', async () => {
      // 1. 创建任务
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Task',
          description: 'Test Description',
          priority: 'HIGH',
          dueDate: '2024-12-31',
        });

      expect(createRes.status).toBe(201);
      const taskId = createRes.body.data.id;

      // 2. 获取任务列表
      const listRes = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.list).toHaveLength(1);
      expect(listRes.body.data.list[0].name).toBe('Test Task');

      // 3. 更新任务
      const updateRes = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Task',
          completed: true,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.name).toBe('Updated Task');
      expect(updateRes.body.data.completed).toBe(true);

      // 4. 删除任务
      const deleteRes = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteRes.status).toBe(200);

      // 5. 确认任务已删除
      const listAfterDelete = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listAfterDelete.body.data.list).toHaveLength(0);
    });

    it('should filter tasks by priority', async () => {
      // 创建不同优先级的任务
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'High Task', priority: 'HIGH' });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Low Task', priority: 'LOW' });

      // 过滤高优先级任务
      const highRes = await request(app)
        .get('/api/tasks?priority=HIGH')
        .set('Authorization', `Bearer ${authToken}`);

      expect(highRes.body.data.list).toHaveLength(1);
      expect(highRes.body.data.list[0].name).toBe('High Task');
    });

    it('should paginate tasks correctly', async () => {
      // 创建多个任务
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ name: `Task ${i}`, priority: 'MEDIUM' });
      }

      // 分页查询
      const pageRes = await request(app)
        .get('/api/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(pageRes.body.data.list).toHaveLength(2);
      expect(pageRes.body.data.total).toBe(5);
      expect(pageRes.body.data.totalPages).toBe(3);
    });
  });

  describe('Data Isolation', () => {
    let user1Token: string;
    let user2Token: string;
    let user1TaskId: string;

    beforeEach(async () => {
      // 创建用户1
      const user1Res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user1',
          email: 'user1@example.com',
          password: 'password123',
        });
      user1Token = user1Res.body.data.accessToken;

      // 创建用户2
      const user2Res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user2',
          email: 'user2@example.com',
          password: 'password123',
        });
      user2Token = user2Res.body.data.accessToken;

      // 用户1创建任务
      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'User1 Task', priority: 'HIGH' });
      user1TaskId = taskRes.body.data.id;
    });

    it('should not allow user2 to access user1 tasks', async () => {
      // 用户2尝试获取用户1的任务详情
      const getRes = await request(app)
        .get(`/api/tasks/${user1TaskId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(getRes.status).toBe(404);
    });

    it('should not allow user2 to update user1 tasks', async () => {
      const updateRes = await request(app)
        .put(`/api/tasks/${user1TaskId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ name: 'Hacked' });

      expect(updateRes.status).toBe(404);
    });

    it('should not allow user2 to delete user1 tasks', async () => {
      const deleteRes = await request(app)
        .delete(`/api/tasks/${user1TaskId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(deleteRes.status).toBe(404);
    });

    it('should only show each user their own tasks', async () => {
      // 用户2创建自己的任务
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ name: 'User2 Task', priority: 'LOW' });

      // 用户1的任务列表
      const user1List = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(user1List.body.data.list).toHaveLength(1);
      expect(user1List.body.data.list[0].name).toBe('User1 Task');

      // 用户2的任务列表
      const user2List = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(user2List.body.data.list).toHaveLength(1);
      expect(user2List.body.data.list[0].name).toBe('User2 Task');
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'erroruser',
          email: 'error@example.com',
          password: 'password123',
        });
      authToken = registerRes.body.data.accessToken;
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .get('/api/tasks/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '' }); // 空名称

      expect(res.status).toBe(400);
    });

    it('should return 401 for unauthorized access', async () => {
      const res = await request(app)
        .get('/api/tasks');

      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid registration data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab', // 太短
          email: 'invalid-email',
          password: '123', // 太短
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Security', () => {
    it('should not return password in user response', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'secureuser',
          email: 'secure@example.com',
          password: 'password123',
        });

      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should validate JWT token', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });

    it('should prevent SQL injection in username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: "'; DROP TABLE users; --",
          email: 'sql@example.com',
          password: 'password123',
        });

      // 应该被验证规则拒绝
      expect(res.status).toBe(400);

      // 数据库应该仍然正常工作
      const healthRes = await request(app).get('/health');
      expect(healthRes.status).toBe(200);
    });
  });
});
