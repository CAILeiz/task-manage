<template>
  <template v-if="isMobile">
    <el-drawer
      v-model="internalDrawerVisible"
      direction="ltr"
      :with-header="false"
      size="280px"
      class="sidebar-drawer"
      @close="emit('update:drawer-visible', false)"
    >
      <div class="sidebar-content mobile-sidebar">
        <div class="sidebar-header">
          <div class="new-task-btn" @click="handleNewTask">
            <el-icon><Plus /></el-icon>
            <span>新建任务</span>
          </div>
        </div>

        <div class="sidebar-search">
          <el-input
            v-model="searchQuery"
            placeholder="搜索任务..."
            prefix-icon="Search"
            clearable
            @input="handleSearch"
            class="search-input"
          />
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title">任务视图</div>
            <div
              v-for="item in navItems"
              :key="item.id"
              class="nav-item"
              :class="{ active: activeView === item.id }"
              @click="handleMobileViewChange(item.id)"
            >
              <div class="nav-item-inner">
                <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
                <span class="nav-label">{{ item.label }}</span>
                <el-badge
                  v-if="counts[item.countKey] > 0"
                  :value="counts[item.countKey]"
                  :type="item.badgeType"
                  class="nav-badge"
                />
              </div>
            </div>
          </div>
        </nav>
      </div>
    </el-drawer>
  </template>
  
  <template v-else>
    <el-aside :width="isCollapsed ? '64px' : '240px'" class="sidebar">
      <div class="sidebar-content">
        <div class="sidebar-header">
          <div class="new-task-btn" @click="handleNewTask">
            <el-icon><Plus /></el-icon>
            <span v-if="!isCollapsed">新建任务</span>
          </div>
        </div>

        <div class="sidebar-search" v-if="!isCollapsed">
          <el-input
            v-model="searchQuery"
            placeholder="搜索任务..."
            prefix-icon="Search"
            clearable
            @input="handleSearch"
            class="search-input"
          />
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title" v-if="!isCollapsed">任务视图</div>
            <div
              v-for="item in navItems"
              :key="item.id"
              class="nav-item"
              :class="{ active: activeView === item.id }"
              @click="handleViewChange(item.id)"
            >
              <el-tooltip :content="item.label" placement="right" :disabled="!isCollapsed">
                <div class="nav-item-inner">
                  <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
                  <span class="nav-label" v-if="!isCollapsed">{{ item.label }}</span>
                  <el-badge
                    v-if="!isCollapsed && counts[item.countKey] > 0"
                    :value="counts[item.countKey]"
                    :type="item.badgeType"
                    class="nav-badge"
                  />
                </div>
              </el-tooltip>
            </div>
          </div>
        </nav>

        <div class="sidebar-footer">
          <el-tooltip :content="isCollapsed ? '展开侧边栏' : '收起侧边栏'" placement="right">
            <div class="collapse-btn" @click="toggleCollapse">
              <el-icon><component :is="isCollapsed ? Expand : Fold" /></el-icon>
              <span v-if="!isCollapsed">收起侧边栏</span>
            </div>
          </el-tooltip>
        </div>
      </div>
    </el-aside>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Search, Plus, List, Calendar, Clock, Timer, Remove, CircleCheck,
  Fold, Expand
} from '@element-plus/icons-vue'
import { useTaskStore } from '@/stores/task'

const props = defineProps<{
  isMobile?: boolean
  drawerVisible?: boolean
}>()

const emit = defineEmits<{
  'update:drawer-visible': [value: boolean]
}>()

const router = useRouter()
const route = useRoute()
const taskStore = useTaskStore()

const isCollapsed = ref(false)
const searchQuery = ref('')
const internalDrawerVisible = computed({
  get: () => props.drawerVisible,
  set: (value) => emit('update:drawer-visible', value)
})

const navItems = [
  { id: 'all', label: '全部任务', icon: markRaw(List), countKey: 'all', badgeType: 'primary' },
  { id: 'today', label: '今日', icon: markRaw(Calendar), countKey: 'today', badgeType: 'warning' },
  { id: 'overdue', label: '过期', icon: markRaw(Clock), countKey: 'overdue', badgeType: 'danger' },
  { id: 'upcoming', label: '即将到期', icon: markRaw(Timer), countKey: 'upcoming', badgeType: '' },
  { id: 'none', label: '无期限', icon: markRaw(Remove), countKey: 'none', badgeType: '' },
  { id: 'completed', label: '已完成', icon: markRaw(CircleCheck), countKey: 'completed', badgeType: 'success' },
]

const activeView = computed(() => {
  const query = route.query
  if (query.dueDateFilter) return query.dueDateFilter as string
  if (query.completed === 'true') return 'completed'
  return 'all'
})

const counts = computed(() => taskStore.taskCounts)

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function handleNewTask() {
  window.dispatchEvent(new CustomEvent('new-task'))
  if (props.isMobile) {
    emit('update:drawer-visible', false)
  }
}

function handleViewChange(viewId: string) {
  const query: Record<string, string> = {}

  if (viewId === 'today') {
    query.dueDateFilter = 'today'
  } else if (viewId === 'overdue') {
    query.dueDateFilter = 'overdue'
  } else if (viewId === 'upcoming') {
    query.dueDateFilter = 'upcoming'
  } else if (viewId === 'none') {
    query.dueDateFilter = 'none'
  } else if (viewId === 'completed') {
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

function handleMobileViewChange(viewId: string) {
  handleViewChange(viewId)
  emit('update:drawer-visible', false)
}

function handleSearch() {
  taskStore.setSearchQuery(searchQuery.value)
}

onMounted(() => {
  taskStore.fetchTaskCounts()
})
</script>

<style scoped>
.sidebar {
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-light);
  transition: width var(--duration-normal) var(--ease-out);
  overflow: hidden;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--spacing-md);
}

.mobile-sidebar {
  padding: var(--spacing-md);
}

.sidebar-header {
  margin-bottom: var(--spacing-md);
}

.new-task-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  width: 100%;
  height: var(--touch-target-size);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: 600;
  font-size: var(--font-size-sm);
  transition: all var(--duration-fast) var(--ease-out);
}

.new-task-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.new-task-btn:active {
  transform: translateY(0);
}

.sidebar-search {
  margin-bottom: var(--spacing-md);
}

.search-input :deep(.el-input__wrapper) {
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  box-shadow: none;
  border: 1px solid transparent;
  transition: all var(--duration-fast) var(--ease-out);
}

.search-input :deep(.el-input__wrapper:hover) {
  background: var(--bg-tertiary);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  background: var(--bg-primary);
  border-color: var(--primary-color);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: var(--spacing-md);
}

.nav-section-title {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-item {
  position: relative;
  margin: 2px 0;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  min-height: var(--touch-target-size);
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--primary-color);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  transition: height var(--duration-fast) var(--ease-out);
}

.nav-item:hover {
  background: var(--bg-secondary);
}

.nav-item:hover::before {
  height: 20px;
}

.nav-item.active {
  background: var(--bg-secondary);
}

.nav-item.active::before {
  height: 24px;
}

.nav-item.active .nav-icon {
  color: var(--primary-color);
}

.nav-item.active .nav-label {
  color: var(--primary-color);
  font-weight: 600;
}

.nav-item-inner {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-sm);
  min-height: var(--touch-target-size);
}

.nav-icon {
  font-size: 18px;
  color: var(--text-secondary);
  transition: color var(--duration-fast) var(--ease-out);
}

.nav-label {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  transition: color var(--duration-fast) var(--ease-out);
}

.nav-badge {
  transform: scale(0.9);
}

.sidebar-footer {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
  margin-top: auto;
}

.collapse-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  transition: all var(--duration-fast) var(--ease-out);
}

.collapse-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.sidebar-drawer :deep(.el-drawer__body) {
  padding: 0;
}

@media (prefers-reduced-motion: reduce) {
  .sidebar,
  .nav-item,
  .nav-item::before,
  .new-task-btn {
    transition: none;
  }
}
</style>