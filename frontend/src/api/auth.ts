import request from './request';
import type { ApiResponse, LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

export const login = (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
  return request.post('/auth/login', data).then(res => res.data);
};

export const register = (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
  return request.post('/auth/register', data).then(res => res.data);
};

export const getMe = (): Promise<ApiResponse<User>> => {
  return request.get('/auth/me').then(res => res.data);
};

export default {
  login,
  register,
  getMe,
};
