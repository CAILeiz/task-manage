<template>
  <el-container class="layout-container">
    <el-header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <HamburgerMenu
            v-if="isMobile"
            :is-active="drawerVisible"
            @click="drawerVisible = !drawerVisible"
          />
          <div class="logo">
            <div class="logo-icon">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="white" fill-opacity="0.2"/>
                <path d="M10 16L13 19L22 10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h1 v-if="!isMobile">TaskFlow</h1>
          </div>
        </div>
        
        <div class="header-center" v-if="!isMobile">
          <div class="search-box" @click="openCommandPalette">
            <el-icon><Search /></el-icon>
            <span class="search-placeholder">搜索任务、项目...</span>
            <kbd class="search-shortcut">⌘K</kbd>
          </div>
        </div>
        
        <div class="header-right">
          <NotificationCenter v-if="!isMobile" />
          <el-tooltip :content="theme === 'dark' ? '切换亮色模式' : '切换暗色模式'" placement="bottom">
            <el-button 
              :icon="theme === 'dark' ? Sunny : Moon" 
              circle 
              @click="toggleTheme"
              class="header-btn"
            />
          </el-tooltip>
          <UserMenu />
        </div>
      </div>
    </el-header>
    <el-container class="main-container">
      <Sidebar 
        :is-mobile="isMobile" 
        :drawer-visible="drawerVisible"
        @update:drawer-visible="drawerVisible = $event"
      />
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
    
    <FloatingActionButton :visible="isMobile" @click="handleNewTask" />
    <CommandPalette ref="commandPaletteRef" />
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Search, Sunny, Moon } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useWebSocketConnection } from '@/composables/useWebSocket'
import { useNotificationStore } from '@/stores/notification'
import UserMenu from './UserMenu.vue'
import Sidebar from './Sidebar.vue'
import CommandPalette from '../Command/CommandPalette.vue'
import HamburgerMenu from './HamburgerMenu.vue'
import FloatingActionButton from './FloatingActionButton.vue'
import NotificationCenter from '../Notification/NotificationCenter.vue'

const authStore = useAuthStore()
const { theme, toggleTheme, initTheme } = useTheme()
const { isMobile } = useBreakpoint()
const commandPaletteRef = ref()
const drawerVisible = ref(false)
const { status: wsStatus } = useWebSocketConnection()
const notificationStore = useNotificationStore()

const openCommandPalette = () => {
  commandPaletteRef.value?.open()
}

const handleNewTask = () => {
  window.dispatchEvent(new CustomEvent('new-task'))
}

const handleKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    openCommandPalette()
  }
}

onMounted(() => {
  initTheme()
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('new-task', handleNewTask)
  notificationStore.setupWebSocketListeners()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('new-task', handleNewTask)
})
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  height: 64px !important;
  padding: 0;
  box-shadow: var(--shadow-card);
  position: sticky;
  top: 0;
  z-index: var(--z-dropdown);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  gap: var(--spacing-lg);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.logo-icon {
  width: 32px;
  height: 32px;
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

.logo h1 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 480px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-lg);
  cursor: pointer;
  min-width: 280px;
  transition: all var(--duration-fast) var(--ease-out);
}

.search-box:hover {
  background: rgba(255, 255, 255, 0.2);
}

.search-box .el-icon {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
}

.search-placeholder {
  flex: 1;
  color: rgba(255, 255, 255, 0.7);
  font-size: var(--font-size-sm);
}

.search-shortcut {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-family: inherit;
  color: rgba(255, 255, 255, 0.8);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.header-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  transition: all var(--duration-fast) var(--ease-out);
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.main-container {
  height: calc(100vh - 64px);
}

.app-main {
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .header-center {
    display: none;
  }
  
  .search-shortcut {
    display: none;
  }
  
  .app-main {
    padding: var(--spacing-mobile-container);
  }
}
</style>