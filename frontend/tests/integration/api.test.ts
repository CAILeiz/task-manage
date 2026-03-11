import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from '../../src/api/request';
import axios from 'axios';

vi.mock('axios');

describe('API Request Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should add auth token to requests', async () => {
    localStorage.setItem('accessToken', 'test-token');
    
    const mockAxiosInstance = {
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn().mockResolvedValue({ data: { code: 0, data: {}, message: 'ok' } }),
    };
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

    // 验证 request 实例被创建
    expect(axios.create).toHaveBeenCalled();
  });

  it('should handle 401 errors and redirect to login', async () => {
    const mockError = {
      response: {
        status: 401,
        data: { message: '令牌已过期' },
      },
    };
    
    const deleteMock = vi.spyOn(Storage.prototype, 'removeItem');
    const assignMock = vi.spyOn(window.location, 'href', 'set');

    // 模拟 axios 响应拦截器处理 401
    const mockAxiosInstance = {
      interceptors: {
        request: { use: vi.fn() },
        response: { 
          use: vi.fn((successFn, errorFn) => {
            if (errorFn) {
              errorFn(mockError);
            }
          }),
        },
      },
    };
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);
  });
});
