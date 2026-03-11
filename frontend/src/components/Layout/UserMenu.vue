<template>
  <el-dropdown trigger="hover" placement="bottom-end" @command="handleCommand">
    <div class="user-trigger">
      <el-avatar :size="32" class="user-avatar">
        {{ avatarText }}
      </el-avatar>
      <span class="username">{{ authStore.user?.username }}</span>
      <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
    </div>
    
    <template #dropdown>
      <el-dropdown-menu class="user-dropdown">
        <el-dropdown-item :disabled="true" class="user-info-item">
          <div class="user-info-card">
            <div class="info-row">
              <span class="info-label">用户名</span>
              <span class="info-value">{{ authStore.user?.username }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">邮箱</span>
              <span class="info-value">{{ authStore.user?.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">注册时间</span>
              <span class="info-value">{{ formattedCreatedAt }}</span>
            </div>
          </div>
        </el-dropdown-item>
        
        <el-dropdown-item divided command="settings">
          <el-icon><Setting /></el-icon>
          <span>个人设置</span>
        </el-dropdown-item>
        
        <el-dropdown-item command="logout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { ArrowDown, Setting, SwitchButton } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const avatarText = computed(() => {
  return authStore.user?.username?.charAt(0).toUpperCase() || 'U'
})

const formattedCreatedAt = computed(() => {
  if (!authStore.user?.createdAt) return '-'
  return new Date(authStore.user.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-')
})

async function handleCommand(command: string) {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      authStore.logout()
      router.push('/login')
      ElMessage.success('已退出登录')
    } catch {
      // 用户取消
    }
  } else if (command === 'settings') {
    ElMessage.info('个人设置功能开发中')
  }
}
</script>

<style scoped>
.user-trigger {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-base);
}

.user-trigger:hover {
  background-color: var(--bg-tertiary);
}

.user-avatar {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  font-weight: 600;
}

.username {
  font-weight: 500;
  color: var(--text-primary);
}

.dropdown-icon {
  color: var(--text-secondary);
  transition: transform var(--transition-base);
}

.user-trigger:hover .dropdown-icon {
  transform: rotate(180deg);
}

.user-info-item {
  pointer-events: none;
}

.user-info-card {
  padding: var(--spacing-xs) 0;
  min-width: 200px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xs) 0;
}

.info-label {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.info-value {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
</style>