<template>
  <el-container class="layout-container">
    <el-header class="app-header">
      <div class="header-content">
        <div class="logo">
          <el-icon class="logo-icon"><List /></el-icon>
          <h1>TaskFlow</h1>
        </div>
        <div class="header-right">
          <el-button 
            :icon="theme === 'dark' ? Sunny : Moon" 
            circle 
            @click="toggleTheme"
            class="theme-toggle"
          />
          <UserMenu v-if="authStore.isLoggedIn" />
        </div>
      </div>
    </el-header>
    <el-container class="main-container">
      <Sidebar v-if="authStore.isLoggedIn" />
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { List, Bell, Sunny, Moon } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import UserMenu from './UserMenu.vue'
import Sidebar from './Sidebar.vue'

const authStore = useAuthStore()
const { theme, toggleTheme, initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.app-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  height: 64px !important;
  padding: 0;
  box-shadow: var(--shadow-card);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.logo-icon {
  font-size: 28px;
}

.logo h1 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 700;
  letter-spacing: -0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.theme-toggle {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.25);
}

.main-container {
  height: calc(100vh - 64px);
}

.app-main {
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  overflow-y: auto;
}
</style>