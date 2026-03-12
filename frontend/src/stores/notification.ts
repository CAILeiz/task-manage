import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ApiResponse, PaginationData } from '../types';
import { useWebSocket } from '../composables/useWebSocket';
import { useTaskStore } from './task';
import request from '../api/request';

export type NotificationType = 'task_reminder' | 'task_completed' | 'task_uncompleted' | 'task_created';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content: string | null;
  task_id: string | null;
  read_at: string | null;
  created_at: string;
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([]);
  const unreadCount = ref(0);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(20);
  const loading = ref(false);

  async function fetchNotifications(params?: { page?: number; limit?: number }) {
    loading.value = true;
    try {
      const response = await request.get<ApiResponse<PaginationData<Notification>>>('/notifications', {
        params: { page: params?.page || page.value, limit: params?.limit || limit.value },
      });
      if (response.data.code === 200) {
        notifications.value = response.data.data.list;
        total.value = response.data.data.total;
        page.value = response.data.data.page;
        limit.value = response.data.data.limit;
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchUnreadCount() {
    try {
      const response = await request.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
      if (response.data.code === 200) {
        unreadCount.value = response.data.data.count;
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }

  async function markAsRead(id: string) {
    try {
      const response = await request.put<ApiResponse<null>>(`/notifications/${id}/read`);
      if (response.data.code === 200) {
        const notification = notifications.value.find(n => n.id === id);
        if (notification) {
          notification.read_at = new Date().toISOString();
        }
        if (unreadCount.value > 0) {
          unreadCount.value--;
        }
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }

  async function markAllAsRead() {
    try {
      const response = await request.put<ApiResponse<{ count: number }>>('/notifications/read-all');
      if (response.data.code === 200) {
        notifications.value.forEach(n => {
          n.read_at = new Date().toISOString();
        });
        unreadCount.value = 0;
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  function handleNotification(notification: Notification) {
    notifications.value.unshift(notification);
    if (!notification.read_at) {
      unreadCount.value++;
    }
  }

  function handleCountsUpdate(counts: { all: number; today: number; overdue: number; upcoming: number; none: number; completed: number }) {
    const taskStore = useTaskStore();
    taskStore.taskCounts = counts;
  }

  function setupWebSocketListeners() {
    const { on } = useWebSocket();

    on('notification', (data: { payload: Notification; timestamp: number }) => {
      handleNotification(data.payload);
    });

    on('counts_update', (data: { payload: any; timestamp: number }) => {
      handleCountsUpdate(data.payload);
    });
  }

  return {
    notifications,
    unreadCount,
    total,
    page,
    limit,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    handleNotification,
    handleCountsUpdate,
    setupWebSocketListeners,
  };
});