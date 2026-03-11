import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../src/stores/auth';
import * as authApi from '../../src/api/auth';

vi.mock('../../src/api/auth');

describe('Auth Store Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should login successfully', async () => {
    const mockResponse = {
      code: 0,
      data: {
        user: { id: '1', username: 'testuser', email: 'test@test.com', createdAt: '', updatedAt: '' },
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
      },
      message: '登录成功',
    };
    vi.mocked(authApi.login).mockResolvedValue(mockResponse);

    const store = useAuthStore();
    const result = await store.login('testuser', 'password123');

    expect(result.success).toBe(true);
    expect(store.user?.username).toBe('testuser');
    expect(store.accessToken).toBe('mock-token');
    expect(localStorage.getItem('accessToken')).toBe('mock-token');
  });

  it('should handle login failure', async () => {
    vi.mocked(authApi.login).mockRejectedValue({
      response: { data: { message: '用户名或密码错误' } },
    });

    const store = useAuthStore();
    const result = await store.login('wronguser', 'wrongpass');

    expect(result.success).toBe(false);
    expect(store.user).toBeNull();
    expect(store.isLoggedIn).toBe(false);
  });

  it('should logout successfully', () => {
    const store = useAuthStore();
    store.accessToken = 'test-token';
    localStorage.setItem('accessToken', 'test-token');

    store.logout();

    expect(store.accessToken).toBe('');
    expect(store.user).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('should register successfully', async () => {
    const mockResponse = {
      code: 0,
      data: {
        user: { id: '1', username: 'newuser', email: 'new@test.com', createdAt: '', updatedAt: '' },
        accessToken: 'new-token',
        refreshToken: 'new-refresh-token',
      },
      message: '注册成功',
    };
    vi.mocked(authApi.register).mockResolvedValue(mockResponse);

    const store = useAuthStore();
    const result = await store.register('newuser', 'new@test.com', 'password123');

    expect(result.success).toBe(true);
    expect(store.user?.username).toBe('newuser');
    expect(store.isLoggedIn).toBe(true);
  });

  it('should restore session from localStorage', async () => {
    localStorage.setItem('accessToken', 'stored-token');
    
    const mockResponse = {
      code: 0,
      data: { id: '1', username: 'storeduser', email: 'stored@test.com', createdAt: '', updatedAt: '' },
      message: '获取成功',
    };
    vi.mocked(authApi.getMe).mockResolvedValue(mockResponse);

    const store = useAuthStore();
    await store.fetchUser();

    expect(store.user?.username).toBe('storeduser');
    expect(store.isLoggedIn).toBe(true);
  });
});
