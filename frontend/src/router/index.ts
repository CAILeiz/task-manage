import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Layout from '../components/Layout/Layout.vue';

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
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Tasks',
        component: () => import('../views/Tasks/Tasks.vue'),
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/Settings/Settings.vue'),
      },
    ],
  },
  {
    path: '/auth/github/callback',
    name: 'GitHubCallback',
    component: () => import('../views/Auth/GitHubCallback.vue'),
    meta: { public: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      await authStore.fetchUser();
      if (!authStore.isLoggedIn) {
        return next('/login');
      }
    }
  }

  if (to.meta.public && authStore.isLoggedIn) {
    return next('/tasks');
  }

  next();
});

export default router;