import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from '../../src/stores/auth';
import routes from '../../src/router/index';

vi.mock('../../src/api/auth');

describe('Router Guards Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('should redirect to login when accessing protected route without auth', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/login', name: 'Login', component: { template: '<div>Login</div>' } },
        { path: '/tasks', name: 'Tasks', component: { template: '<div>Tasks</div>' }, meta: { requiresAuth: true } },
      ],
    });

    router.beforeEach((to, from, next) => {
      const authStore = useAuthStore();
      if (to.meta.requiresAuth && !authStore.isLoggedIn) {
        next('/login');
      } else {
        next();
      }
    });

    await router.push('/tasks');
    await router.isReady();

    expect(router.currentRoute.value.path).toBe('/login');
  });

  it('should allow access to protected route with auth', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/login', name: 'Login', component: { template: '<div>Login</div>' } },
        { path: '/tasks', name: 'Tasks', component: { template: '<div>Tasks</div>' }, meta: { requiresAuth: true } },
      ],
    });

    const authStore = useAuthStore();
    authStore.accessToken = 'valid-token';
    authStore.user = { id: '1', username: 'test', email: 'test@test.com', createdAt: '', updatedAt: '' };

    router.beforeEach((to, from, next) => {
      if (to.meta.requiresAuth && !authStore.isLoggedIn) {
        next('/login');
      } else {
        next();
      }
    });

    await router.push('/tasks');
    await router.isReady();

    expect(router.currentRoute.value.path).toBe('/tasks');
  });

  it('should redirect authenticated users away from login page', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/login', name: 'Login', component: { template: '<div>Login</div>' }, meta: { public: true } },
        { path: '/tasks', name: 'Tasks', component: { template: '<div>Tasks</div>' } },
      ],
    });

    const authStore = useAuthStore();
    authStore.accessToken = 'valid-token';
    authStore.user = { id: '1', username: 'test', email: 'test@test.com', createdAt: '', updatedAt: '' };

    router.beforeEach((to, from, next) => {
      if (to.meta.public && authStore.isLoggedIn) {
        next('/tasks');
      } else {
        next();
      }
    });

    await router.push('/login');
    await router.isReady();

    expect(router.currentRoute.value.path).toBe('/tasks');
  });
});

describe('End-to-End User Flow', () => {
  it('should handle complete login and fetch tasks flow', async () => {
    const mockLoginResponse = {
      code: 0,
      data: {
        user: { id: '1', username: 'testuser', email: 'test@test.com', createdAt: '', updatedAt: '' },
        accessToken: 'token',
        refreshToken: 'refresh',
      },
      message: '登录成功',
    };
    
    vi.doMock('../../src/api/auth', () => ({
      login: vi.fn().mockResolvedValue(mockLoginResponse),
      getMe: vi.fn().mockResolvedValue({ code: 0, data: mockLoginResponse.data.user, message: 'ok' }),
    }));

    setActivePinia(createPinia());
    const { useAuthStore } = await import('../../src/stores/auth');
    const authStore = useAuthStore();

    // 1. 用户登录
    const loginResult = await authStore.login('testuser', 'password123');
    expect(loginResult.success).toBe(true);
    expect(authStore.isLoggedIn).toBe(true);

    // 2. Token 存储在 localStorage
    expect(localStorage.getItem('accessToken')).toBe('token');

    // 3. 获取用户信息
    await authStore.fetchUser();
    expect(authStore.user?.username).toBe('testuser');
  });
});
