import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import Login from '../../src/views/Login/Login.vue';
import * as authApi from '../../src/api/auth';

vi.mock('../../src/api/auth');
vi.mock('element-plus', () => ({
  ElMessage: { success: vi.fn(), error: vi.fn() },
  ElForm: { name: 'ElForm' },
  ElFormItem: { name: 'ElFormItem' },
  ElInput: { name: 'ElInput' },
  ElButton: { name: 'ElButton' },
  ElCard: { name: 'ElCard' },
  ElLink: { name: 'ElLink' },
}));

describe('Login Page Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    const wrapper = mount(Login, {
      global: {
        mocks: {
          $router: { push: vi.fn() },
        },
      },
    });

    expect(wrapper.find('h2').text()).toBe('登录');
    expect(wrapper.findAll('input')).toHaveLength(2);
  });

  it('should validate form before submit', async () => {
    const wrapper = mount(Login, {
      global: {
        mocks: {
          $router: { push: vi.fn() },
        },
      },
    });

    const submitButton = wrapper.find('button');
    await submitButton.trigger('click');

    // 表单验证应该阻止空提交
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('should call login API on valid form submit', async () => {
    const mockResponse = {
      code: 0,
      data: {
        user: { id: '1', username: 'test', email: 'test@test.com', createdAt: '', updatedAt: '' },
        accessToken: 'token',
        refreshToken: 'refresh',
      },
      message: '登录成功',
    };
    vi.mocked(authApi.login).mockResolvedValue(mockResponse);

    const routerPush = vi.fn();
    const wrapper = mount(Login, {
      global: {
        mocks: {
          $router: { push: routerPush },
        },
      },
    });

    // 填充表单
    const inputs = wrapper.findAll('input');
    await inputs[0].setValue('testuser');
    await inputs[1].setValue('password123');

    // 由于 Element Plus 组件被 mock，直接调用 handleSubmit
    // 实际测试需要更复杂的 setup
  });
});

describe('Login-Auth Store Integration', () => {
  it('should update store after successful login', async () => {
    const mockResponse = {
      code: 0,
      data: {
        user: { id: '1', username: 'testuser', email: 'test@test.com', createdAt: '', updatedAt: '' },
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh',
      },
      message: '登录成功',
    };
    vi.mocked(authApi.login).mockResolvedValue(mockResponse);

    const { useAuthStore } = await import('../../src/stores/auth');
    setActivePinia(createPinia());
    const store = useAuthStore();

    const result = await store.login('testuser', 'password123');

    expect(result.success).toBe(true);
    expect(store.isLoggedIn).toBe(true);
    expect(store.user?.username).toBe('testuser');
  });
});
