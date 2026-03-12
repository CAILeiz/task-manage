<template>
  <el-aside :width="isCollapsed ? '64px' : '240px'" class="sidebar">
    <div class="sidebar-content">
      <div class="sidebar-search">
        <el-input
          v-if="!isCollapsed"
          v-model="searchQuery"
          placeholder="搜索任务..."
          prefix-icon="Search"
          clearable
          @input="handleSearch"
        />
        <el-button v-else :icon="Search" circle @click="toggleCollapse" />
      </div>

      <el-menu
        :default-active="activeView"
        class="sidebar-menu"
        @select="handleViewChange"
      >
        <el-menu-item index="all">
          <el-icon><List /></el-icon>
          <template #title>
            <div class="menu-item-content">
              <span>全部任务</span>
              <el-badge 
                v-if="counts.all > 0" 
                :value="counts.all" 
                type="primary"
              />
            </div>
          </template>
        </el-menu-item>

        <el-menu-item index="today">
          <el-icon><Calendar /></el-icon>
          <template #title>
            <div class="menu-item-content">
              <span>今日</span>
              <el-badge 
                v-if="counts.today > 0" 
                :value="counts.today" 
                type="warning"
              />
            </div>
          </template>
        </el-menu-item>

        <el-menu-item index="overdue">
          <el-icon><Clock /></el-icon>
          <template #title>
            <div class="menu-item-content">
              <span>过期</span>
              <el-badge 
                v-if="counts.overdue > 0" 
                :value="counts.overdue" 
                type="danger"
              />
            </div>
          </template>
        </el-menu-item>

        <el-menu-item index="upcoming">
          <el-icon><Timer /></el-icon>
          <template #title>
            <span>即将到期</span>
          </template>
        </el-menu-item>

        <el-menu-item index="none">
          <el-icon><Remove /></el-icon>
          <template #title>
            <span>无期限</span>
          </template>
        </el-menu-item>

        <el-menu-item index="completed">
          <el-icon><CircleCheck /></el-icon>
          <template #title>
            <span>已完成</span>
          </template>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
        <el-button
          :icon="isCollapsed ? Expand : Fold"
          text
          @click="toggleCollapse"
        >
          {{ isCollapsed ? '' : '收起侧边栏' }}
        </el-button>
      </div>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Search, List, Calendar, Clock, Timer, Remove, CircleCheck, 
  Fold, Expand 
} from '@element-plus/icons-vue'
import { useTaskStore } from '@/stores/task'

const router = useRouter()
const route = useRoute()
const taskStore = useTaskStore()

const isCollapsed = ref(false)
const searchQuery = ref('')

const activeView = computed(() => {
  return (route.query.view as string) || 'all'
})

const counts = computed(() => taskStore.taskCounts)

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function handleViewChange(index: string) {
  const query: Record<string, string> = {}
  
  if (index === 'today') {
    query.dueDateFilter = 'today'
  } else if (index === 'overdue') {
    query.dueDateFilter = 'overdue'
  } else if (index === 'upcoming') {
    query.dueDateFilter = 'upcoming'
  } else if (index === 'none') {
    query.dueDateFilter = 'none'
  } else if (index === 'completed') {
    query.completed = 'true'
  }
  
  router.push({ path: '/tasks', query })
  
  if (query.dueDateFilter) {
    taskStore.setFilter({ dueDateFilter: query.dueDateFilter as any })
  } else if (query.completed) {
    taskStore.setFilter({ completed: true })
  } else {
    taskStore.clearFilter()
  }
}

function handleSearch() {
  if (searchQuery.value) {
    taskStore.setSearchQuery(searchQuery.value)
  } else {
    taskStore.setSearchQuery('')
  }
}

onMounted(() => {
  taskStore.fetchTaskCounts()
})
</script>

<style scoped>
.sidebar {
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-light);
  transition: width var(--transition-base);
  overflow: hidden;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--spacing-md);
}

.sidebar-search {
  margin-bottom: var(--spacing-md);
}

.sidebar-menu {
  border: none;
  background: transparent;
  flex: 1;
}

.sidebar-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  border-radius: var(--radius-md);
  margin: var(--spacing-xs) 0;
  transition: all var(--transition-base);
}

.sidebar-menu .el-menu-item:hover {
  background-color: var(--bg-tertiary);
}

.sidebar-menu .el-menu-item.is-active {
  background-color: var(--primary-color);
  color: white;
}

.sidebar-menu .el-menu-item.is-active .el-icon {
  color: white;
}

.menu-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-left: var(--spacing-sm);
}

.sidebar-footer {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
  margin-top: auto;
}

.sidebar-footer .el-button {
  width: 100%;
  justify-content: flex-start;
}

:deep(.el-menu-item__title) {
  display: flex;
  align-items: center;
  width: 100%;
}
</style>