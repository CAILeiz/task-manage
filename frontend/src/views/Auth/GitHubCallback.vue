<template>
  <div class="github-callback">
    <div class="loading-container">
      <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
      <p>正在登录...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  const code = route.query.code as string
  const error = route.query.error as string

  if (error) {
    ElMessage.error('GitHub 授权失败')
    router.push('/login')
    return
  }

  if (!code) {
    ElMessage.error('无效的回调参数')
    router.push('/login')
    return
  }

  const result = await authStore.loginWithGitHub(code)
  if (result.success) {
    ElMessage.success('登录成功')
    router.push('/tasks')
  } else {
    ElMessage.error(result.message || 'GitHub 登录失败')
    router.push('/login')
  }
})
</script>

<style scoped>
.github-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.loading-icon {
  color: var(--primary-color);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}
</style>