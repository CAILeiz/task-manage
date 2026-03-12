<template>
  <el-popover
    placement="bottom"
    :width="360"
    trigger="click"
    popper-class="notification-popover"
  >
    <template #reference>
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
        <el-button :icon="Bell" circle />
      </el-badge>
    </template>

    <div class="notification-center">
      <div class="notification-header">
        <span class="title">通知中心</span>
        <el-button
          v-if="unreadCount > 0"
          type="primary"
          link
          size="small"
          @click="handleMarkAllAsRead"
        >
          全部已读
        </el-button>
      </div>

      <el-scrollbar height="400px" class="notification-list">
        <div v-if="loading" class="loading-container">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>

        <div v-else-if="notifications.length === 0" class="empty-container">
          <el-empty description="暂无通知" :image-size="80" />
        </div>

        <div v-else>
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.read_at }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon">
              <el-icon :size="20" :color="getIconColor(notification.type)">
                <component :is="getIcon(notification.type)" />
              </el-icon>
            </div>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-text">{{ notification.content }}</div>
              <div class="notification-time">{{ formatTime(notification.created_at) }}</div>
            </div>
            <div v-if="!notification.read_at" class="unread-dot" />
          </div>
        </div>
      </el-scrollbar>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Bell, Loading, Clock, CircleCheck, CircleClose } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useNotificationStore, type Notification, type NotificationType } from '@/stores/notification';

const router = useRouter();
const notificationStore = useNotificationStore();

const notifications = computed(() => notificationStore.notifications);
const unreadCount = computed(() => notificationStore.unreadCount);
const loading = computed(() => notificationStore.loading);

function getIcon(type: NotificationType) {
  switch (type) {
    case 'task_reminder':
      return Clock;
    case 'task_completed':
      return CircleCheck;
    case 'task_uncompleted':
      return CircleClose;
    default:
      return Bell;
  }
}

function getIconColor(type: NotificationType) {
  switch (type) {
    case 'task_reminder':
      return '#E6A23C';
    case 'task_completed':
      return '#67C23A';
    case 'task_uncompleted':
      return '#909399';
    default:
      return '#409EFF';
  }
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  return date.toLocaleDateString();
}

async function handleNotificationClick(notification: Notification) {
  if (!notification.read_at) {
    await notificationStore.markAsRead(notification.id);
  }

  if (notification.task_id) {
    router.push(`/tasks?id=${notification.task_id}`);
  }
}

async function handleMarkAllAsRead() {
  await notificationStore.markAllAsRead();
  ElMessage.success('已全部标记为已读');
}

onMounted(() => {
  notificationStore.fetchNotifications();
  notificationStore.fetchUnreadCount();
});
</script>

<style scoped>
.notification-center {
  margin: -12px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.notification-header .title {
  font-weight: 500;
  font-size: 16px;
}

.notification-list {
  padding: 8px 0;
}

.loading-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: var(--el-fill-color-light);
}

.notification-item.unread {
  background-color: var(--el-color-primary-light-9);
}

.notification-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color);
  border-radius: 50%;
  margin-right: 12px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 500;
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.notification-text {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.unread-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  background-color: var(--el-color-primary);
  border-radius: 50%;
  margin-top: 6px;
}
</style>