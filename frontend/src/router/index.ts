import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    redirect: '/tasks',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login/Login.vue'),
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register/Register.vue'),
    meta: { public: true },
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('../views/Tasks/Tasks.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 如果页面需要登录
  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      // 尝试获取用户信息
      await authStore.fetchUser();
      if (!authStore.isLoggedIn) {
        return next('/login');
      }
    }
  }

  // 如果已登录用户访问登录/注册页，重定向到任务列表
  if (to.meta.public && authStore.isLoggedIn) {
    return next('/tasks');
  }

  next();
});

export default router;
