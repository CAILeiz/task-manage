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

export const updateProfile = (data: { username?: string; email?: string; bio?: string; avatar?: string }): Promise<ApiResponse<User>> => {
  return request.put('/auth/profile', data).then(res => res.data);
};

export const changePassword = (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<null>> => {
  return request.put('/auth/password', data).then(res => res.data);
};

export const githubLogin = (code: string): Promise<ApiResponse<AuthResponse>> => {
  return request.post('/auth/github', { code }).then(res => res.data);
};

export default {
  login,
  register,
  getMe,
  updateProfile,
  changePassword,
  githubLogin,
};
