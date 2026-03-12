<template>
  <div class="tasks-page" :class="{ 'is-mobile': isMobile }">
    <div class="page-header animate-fade-in">
      <div class="header-left">
        <h1>{{ pageTitle }}</h1>
        <el-tag v-if="taskStore.total > 0" type="info" size="large" class="task-count">
          {{ taskStore.total }} 个任务
        </el-tag>
      </div>
      <div class="header-right">
        <el-radio-group v-model="viewMode" size="small" class="view-switch">
          <el-radio-button value="card">
            <el-icon><Grid /></el-icon>
            <span v-if="!isMobile">卡片</span>
          </el-radio-button>
          <el-radio-button v-if="!isMobile" value="kanban">
            <el-icon><DataBoard /></el-icon>
            看板
          </el-radio-button>
          <el-radio-button value="table">
            <el-icon><List /></el-icon>
            <span v-if="!isMobile">列表</span>
          </el-radio-button>
        </el-radio-group>
        <el-button
          v-if="isMobile"
          class="filter-btn"
          @click="showFilterDrawer = true"
        >
          <el-icon><Filter /></el-icon>
          <el-badge
            v-if="activeFilterCount > 0"
            :value="activeFilterCount"
            type="primary"
            class="filter-badge"
          />
        </el-button>
        <el-button
          v-if="!isMobile"
          type="primary"
          class="new-task-btn"
          @click="showCreateDialog = true"
        >
          <el-icon><Plus /></el-icon> 新建任务
        </el-button>
      </div>
    </div>

    <div v-if="!isMobile" class="filter-bar animate-slide-up animate-delay-1">
      <el-select v-model="filter.priority" placeholder="优先级" clearable @change="applyFilter" class="filter-select">
        <el-option label="高优先级" value="HIGH" />
        <el-option label="中优先级" value="MEDIUM" />
        <el-option label="低优先级" value="LOW" />
      </el-select>
      <el-select v-model="filter.completed" placeholder="状态" clearable @change="applyFilter" class="filter-select">
        <el-option label="未完成" :value="false" />
        <el-option label="已完成" :value="true" />
      </el-select>
      <el-select v-model="filter.dueDateFilter" placeholder="截止日期" clearable @change="applyFilter" class="filter-select">
        <el-option label="今天" value="today" />
        <el-option label="即将到期" value="upcoming" />
        <el-option label="已过期" value="overdue" />
        <el-option label="无截止日期" value="none" />
      </el-select>
      <el-button @click="clearFilter" class="clear-btn">
        <el-icon><RefreshLeft /></el-icon>
        清除筛选
      </el-button>
    </div>

    <div v-if="viewMode === 'card'" class="tasks-card-view" v-loading="taskStore.loading" :class="{ 'mobile-view': isMobile }">
      <TransitionGroup name="card-list">
        <TaskCard
          v-for="(task, index) in taskStore.tasks"
          :key="task.id"
          :task="task"
          :compact="isMobile"
          class="animate-slide-up"
          :style="{ animationDelay: `${index * 50}ms` }"
          @edit="editTask"
          @delete="deleteTask"
          @update="updateTask"
        />
      </TransitionGroup>
      
      <div v-if="!taskStore.loading && taskStore.tasks.length === 0" class="empty-state animate-scale-in">
        <div class="empty-icon">
          <el-icon><FolderOpened /></el-icon>
        </div>
        <h3>暂无任务</h3>
        <p>点击下方按钮创建你的第一个任务</p>
        <el-button type="primary" @click="showCreateDialog = true" class="empty-btn">
          <el-icon><Plus /></el-icon>
          创建任务
        </el-button>
      </div>
    </div>

    <KanbanBoard
      v-else-if="viewMode === 'kanban' && !isMobile"
      :tasks="taskStore.tasks"
      v-loading="taskStore.loading"
      @edit="editTask"
      @delete="deleteTask"
      @status-change="handleStatusChange"
    />

    <el-table 
      v-else
      :data="taskStore.tasks" 
      v-loading="taskStore.loading" 
      class="tasks-table"
      :class="{ 'mobile-table': isMobile }"
      row-key="id"
    >
      <el-table-column prop="name" label="任务名称" :min-width="isMobile ? 150 : 200">
        <template #default="{ row }">
          <div class="task-name-cell">
            <el-checkbox
              :model-value="row.completed"
              @change="handleStatusChange(row, $event)"
              class="task-check"
            />
            <span :class="{ 'completed-task': row.completed }">{{ row.name }}</span>
            <span v-if="row.description && !isMobile" class="task-desc-preview">{{ row.description }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" :width="isMobile ? 70 : 100">
        <template #default="{ row }">
          <span class="priority-badge" :class="`priority-${row.priority?.toLowerCase()}`">
            {{ getPriorityLabel(row.priority) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column v-if="!isMobile" prop="dueDate" label="截止日期" width="120">
        <template #default="{ row }">
          <span class="due-date-cell" :class="getDueDateClass(row)">
            <el-icon v-if="getDueDateClass(row)"><Clock /></el-icon>
            {{ formatDate(row.dueDate) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column v-if="!isMobile" prop="completed" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.completed ? 'success' : 'info'" size="small" effect="light">
            {{ row.completed ? '已完成' : '未完成' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" :width="isMobile ? 80 : 140" fixed="right">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button type="primary" size="small" text @click="editTask(row)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button type="danger" size="small" text @click="deleteTask(row)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination" v-if="taskStore.total > taskStore.limit">
      <el-pagination
        v-if="!isMobile"
        v-model:current-page="taskStore.page"
        :page-size="taskStore.limit"
        :total="taskStore.total"
        layout="total, prev, pager, next"
        @current-change="taskStore.setPage"
        background
      />
      <div v-else class="mobile-pagination">
        <el-button
          :disabled="taskStore.page <= 1"
          @click="taskStore.setPage(taskStore.page - 1)"
          circle
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="page-indicator">{{ taskStore.page }} / {{ totalPages }}</span>
        <el-button
          :disabled="taskStore.page >= totalPages"
          @click="taskStore.setPage(taskStore.page + 1)"
          circle
        >
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <TaskDialog
      v-model:visible="showCreateDialog"
      title="新建任务"
      @submit="handleCreate"
    />

    <TaskDialog
      v-model:visible="showEditDialog"
      title="编辑任务"
      :task="editingTask"
      @submit="handleUpdate"
    />

    <FilterDrawer
      v-model:visible="showFilterDrawer"
      :priority="filter.priority"
      :completed="filter.completed"
      :due-date-filter="filter.dueDateFilter"
      @update:filter="handleMobileFilter"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Grid, List, DataBoard, RefreshLeft, FolderOpened, Clock, Edit, Delete, Filter, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { useTaskStore } from '@/stores/task'
import { useBreakpoint } from '@/composables/useBreakpoint'
import type { Task, Priority, CreateTaskRequest, UpdateTaskRequest } from '@/types'
import TaskDialog from '@/components/Task/TaskDialog.vue'
import TaskCard from '@/components/Task/TaskCard.vue'
import KanbanBoard from '@/components/Task/KanbanBoard.vue'
import FilterDrawer from '@/components/Task/FilterDrawer.vue'

const route = useRoute()
const taskStore = useTaskStore()
const { isMobile } = useBreakpoint()
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showFilterDrawer = ref(false)
const editingTask = ref<Task | undefined>(undefined)
const viewMode = ref<'card' | 'kanban' | 'table'>('card')

const filter = reactive({
  priority: undefined as Priority | undefined,
  completed: undefined as boolean | undefined,
  dueDateFilter: undefined as 'today' | 'upcoming' | 'overdue' | 'none' | undefined,
})

const pageTitle = computed(() => {
  if (filter.dueDateFilter === 'today') return '今日任务'
  if (filter.dueDateFilter === 'overdue') return '过期任务'
  if (filter.dueDateFilter === 'upcoming') return '即将到期'
  if (filter.dueDateFilter === 'none') return '无期限任务'
  return '全部任务'
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filter.priority) count++
  if (filter.completed !== undefined) count++
  if (filter.dueDateFilter) count++
  return count
})

const totalPages = computed(() => Math.ceil(taskStore.total / taskStore.limit))

onMounted(() => {
  syncFilterFromRoute()
  taskStore.fetchTasks(filter)
  
  window.addEventListener('new-task', () => {
    showCreateDialog.value = true
  })
})

watch(
  () => route.query,
  () => {
    syncFilterFromRoute()
    taskStore.fetchTasks(filter)
  },
  { deep: true }
)

function syncFilterFromRoute() {
  const query = route.query
  filter.priority = query.priority as Priority | undefined
  filter.completed = query.completed === 'true' ? true : query.completed === 'false' ? false : undefined
  filter.dueDateFilter = query.dueDateFilter as 'today' | 'upcoming' | 'overdue' | 'none' | undefined
}

function getPriorityLabel(priority: Priority) {
  const map: Record<Priority, string> = {
    HIGH: '高',
    MEDIUM: '中',
    LOW: '低',
  }
  return map[priority]
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '无'
  const date = new Date(dateStr)
  const today = new Date()
  
  if (date.toDateString() === today.toDateString()) return '今天'
  
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (date.toDateString() === tomorrow.toDateString()) return '明天'
  
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function getDueDateClass(task: Task) {
  if (!task.dueDate || task.completed) return ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(task.dueDate)
  if (dueDate < today) return 'overdue'
  const nextDay = new Date(today)
  nextDay.setDate(today.getDate() + 1)
  if (dueDate <= nextDay) return 'upcoming'
  return ''
}

function applyFilter() {
  taskStore.setFilter(filter)
}

function clearFilter() {
  filter.priority = undefined
  filter.completed = undefined
  filter.dueDateFilter = undefined
  taskStore.clearFilter()
}

function handleMobileFilter(newFilter: typeof filter) {
  filter.priority = newFilter.priority
  filter.completed = newFilter.completed
  filter.dueDateFilter = newFilter.dueDateFilter
  applyFilter()
}

async function handleStatusChange(task: Task, completed: boolean) {
  if (task.completed !== completed) {
    await taskStore.toggleComplete(task)
    ElMessage.success(completed ? '已标记为完成' : '已标记为未完成')
  }
}

function editTask(task: Task) {
  editingTask.value = task
  showEditDialog.value = true
}

async function updateTask(data: Partial<Task> & { id?: string }) {
  const taskId = data.id || editingTask.value?.id
  if (!taskId) return

  const originalTask = taskStore.tasks.find(t => t.id === taskId)
  if (!originalTask) return

  if (data.completed !== undefined && originalTask.completed !== data.completed) {
    originalTask.completed = data.completed
  }

  const result = await taskStore.updateTask(taskId, data)

  if (!result.success && data.completed !== undefined) {
    originalTask.completed = !data.completed
    ElMessage.error(result.message || '操作失败')
  } else if (data.completed !== undefined) {
    ElMessage.success(data.completed ? '已标记为完成' : '已标记为未完成')
  }
}

async function handleCreate(data: CreateTaskRequest) {
  const result = await taskStore.createTask(data)
  if (result.success) {
    ElMessage.success('任务创建成功')
    showCreateDialog.value = false
  } else {
    ElMessage.error(result.message || '创建失败')
  }
}

async function handleUpdate(data: UpdateTaskRequest) {
  if (!editingTask.value) return
  const result = await taskStore.updateTask(editingTask.value.id, data)
  if (result.success) {
    ElMessage.success('任务更新成功')
    showEditDialog.value = false
    editingTask.value = undefined
  } else {
    ElMessage.error(result.message || '更新失败')
  }
}

async function deleteTask(task: Task) {
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const result = await taskStore.deleteTask(task.id)
    if (result.success) {
      ElMessage.success('任务已删除')
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.tasks-page {
  padding: var(--spacing-lg);
  background-color: var(--bg-primary);
  border-radius: var(--radius-xl);
  min-height: calc(100vh - 96px);
}

.tasks-page.is-mobile {
  padding: var(--spacing-mobile-container);
  border-radius: 0;
  min-height: calc(100vh - 64px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.is-mobile .page-header {
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.is-mobile .header-left {
  flex: 1;
  min-width: 0;
}

.header-left h1 {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
}

.is-mobile .header-left h1 {
  font-size: var(--font-size-lg);
}

.task-count {
  background: var(--bg-secondary);
  border: none;
  color: var(--text-secondary);
}

.is-mobile .task-count {
  display: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.is-mobile .header-right {
  gap: var(--spacing-xs);
}

.view-switch :deep(.el-radio-button__inner) {
  border-radius: var(--radius-md);
}

.is-mobile .view-switch :deep(.el-radio-button__inner) {
  padding: 8px 12px;
}

.filter-btn {
  position: relative;
  border-radius: var(--radius-md);
}

.filter-badge {
  position: absolute;
  top: -4px;
  right: -4px;
}

.new-task-btn {
  border-radius: var(--radius-lg);
  font-weight: 500;
  transition: all var(--duration-fast) var(--ease-out);
}

.new-task-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.filter-bar {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.filter-select {
  min-width: 120px;
}

.filter-select :deep(.el-input__wrapper) {
  border-radius: var(--radius-md);
}

.clear-btn {
  border-radius: var(--radius-md);
}

.tasks-card-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-md);
  min-height: 200px;
}

.tasks-card-view.mobile-view {
  grid-template-columns: 1fr;
  gap: var(--spacing-mobile-card);
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  margin-bottom: var(--spacing-lg);
}

.empty-icon .el-icon {
  font-size: 36px;
  color: var(--text-tertiary);
}

.empty-state h3 {
  margin: 0 0 var(--spacing-sm);
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.empty-state p {
  margin: 0 0 var(--spacing-lg);
  color: var(--text-secondary);
}

.empty-btn {
  border-radius: var(--radius-lg);
}

.tasks-table {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--bg-primary);
}

.tasks-table.mobile-table {
  border-radius: 0;
  font-size: var(--font-size-sm);
}

.tasks-table.mobile-table :deep(.el-table__body-wrapper) {
  overflow-x: auto;
}

.task-name-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.mobile-table .task-name-cell {
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-xs);
}

.mobile-table .task-name-cell span:first-of-type {
  font-weight: 500;
}

.task-check {
  flex-shrink: 0;
}

.mobile-table .task-check {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.mobile-table :deep(.el-table__row) {
  position: relative;
}

.task-desc-preview {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.completed-task {
  text-decoration: line-through;
  color: var(--text-tertiary);
}

.priority-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.mobile-table .priority-badge {
  font-size: 10px;
  padding: 1px 6px;
}

.priority-badge.priority-high {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.priority-badge.priority-medium {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.priority-badge.priority-low {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.due-date-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
}

.due-date-cell.overdue {
  color: var(--danger-color);
  font-weight: 500;
}

.due-date-cell.upcoming {
  color: var(--warning-color);
}

.table-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.pagination {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: center;
}

.is-mobile .pagination {
  margin-top: var(--spacing-md);
}

.mobile-pagination {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.page-indicator {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  min-width: 60px;
  text-align: center;
}

.card-list-enter-active,
.card-list-leave-active {
  transition: all var(--duration-slow) var(--ease-spring);
}

.card-list-enter-from {
  opacity: 0;
  transform: translateY(-16px);
}

.card-list-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.card-list-move {
  transition: transform var(--duration-slow) var(--ease-spring);
}

@media (prefers-reduced-motion: reduce) {
  .card-list-enter-active,
  .card-list-leave-active,
  .card-list-move {
    transition: none;
  }
}
</style>