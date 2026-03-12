import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '../types';
import { login as loginApi, register as registerApi, getMe, updateProfile as updateProfileApi, changePassword as changePasswordApi, githubLogin } from '../api/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string>('');
  const loading = ref(false);

  const isLoggedIn = computed(() => !!accessToken.value && !!user.value);

  function setToken(token: string) {
    accessToken.value = token;
    localStorage.setItem('accessToken', token);
  }

  function clearToken() {
    accessToken.value = '';
    user.value = null;
    localStorage.removeItem('accessToken');
  }

  async function login(username: string, password: string) {
    loading.value = true;
    try {
      const response = await loginApi({ username, password });
      if (response.code === 0) {
        setToken(response.data.accessToken);
        user.value = response.data.user;
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '登录失败' };
    } finally {
      loading.value = false;
    }
  }

  async function register(username: string, email: string, password: string) {
    loading.value = true;
    try {
      const response = await registerApi({ username, email, password });
      if (response.code === 0) {
        setToken(response.data.accessToken);
        user.value = response.data.user;
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '注册失败' };
    } finally {
      loading.value = false;
    }
  }

  async function fetchUser() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    accessToken.value = token;
    try {
      const response = await getMe();
      if (response.code === 0) {
        user.value = response.data;
      }
    } catch {
      clearToken();
    }
  }

  async function updateProfile(data: { username?: string; email?: string; bio?: string; avatar?: string }) {
    loading.value = true;
    try {
      const response = await updateProfileApi(data);
      if (response.code === 0) {
        user.value = response.data;
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '更新失败' };
    } finally {
      loading.value = false;
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    loading.value = true;
    try {
      const response = await changePasswordApi({ currentPassword, newPassword });
      if (response.code === 0) {
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '密码修改失败' };
    } finally {
      loading.value = false;
    }
  }

  async function loginWithGitHub(code: string) {
    loading.value = true;
    try {
      const response = await githubLogin(code);
      if (response.code === 0) {
        setToken(response.data.accessToken);
        user.value = response.data.user;
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'GitHub 登录失败' };
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    clearToken();
  }

  // 初始化时尝试获取用户信息
  fetchUser();

  return {
    user,
    accessToken,
    loading,
    isLoggedIn,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    changePassword,
    loginWithGitHub,
  };
});
