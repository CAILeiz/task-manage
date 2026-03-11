<template>
  <div class="tasks-page">
    <div class="page-header">
      <div class="header-left">
        <h1>{{ pageTitle }}</h1>
        <el-tag v-if="taskStore.total > 0" type="info" size="large">
          {{ taskStore.total }} 个任务
        </el-tag>
      </div>
      <div class="header-right">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="card">
            <el-icon><Grid /></el-icon>
            卡片
          </el-radio-button>
          <el-radio-button value="table">
            <el-icon><List /></el-icon>
            列表
          </el-radio-button>
        </el-radio-group>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon> 新建任务
        </el-button>
      </div>
    </div>

    <div class="filter-bar">
      <el-select v-model="filter.priority" placeholder="优先级" clearable @change="applyFilter">
        <el-option label="高优先级" value="HIGH" />
        <el-option label="中优先级" value="MEDIUM" />
        <el-option label="低优先级" value="LOW" />
      </el-select>
      <el-select v-model="filter.completed" placeholder="状态" clearable @change="applyFilter">
        <el-option label="未完成" :value="false" />
        <el-option label="已完成" :value="true" />
      </el-select>
      <el-select v-model="filter.dueDateFilter" placeholder="截止日期" clearable @change="applyFilter">
        <el-option label="今天" value="today" />
        <el-option label="即将到期" value="upcoming" />
        <el-option label="已过期" value="overdue" />
        <el-option label="无截止日期" value="none" />
      </el-select>
      <el-button @click="clearFilter">清除筛选</el-button>
    </div>

    <div v-if="viewMode === 'card'" class="tasks-card-view" v-loading="taskStore.loading">
      <TaskCard
        v-for="task in taskStore.tasks"
        :key="task.id"
        :task="task"
        @edit="editTask"
        @delete="deleteTask"
      />
      <el-empty v-if="!taskStore.loading && taskStore.tasks.length === 0" description="暂无任务" />
    </div>

    <el-table 
      v-else
      :data="taskStore.tasks" 
      v-loading="taskStore.loading" 
      stripe
      class="tasks-table"
    >
      <el-table-column prop="name" label="任务名称" min-width="200">
        <template #default="{ row }">
          <div class="task-name-cell">
            <span :class="{ 'completed-task': row.completed }">{{ row.name }}</span>
            <span v-if="row.description" class="task-desc-preview">{{ row.description }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" width="100">
        <template #default="{ row }">
          <el-tag :type="getPriorityType(row.priority)">
            {{ getPriorityLabel(row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="dueDate" label="截止日期" width="120">
        <template #default="{ row }">
          <span :class="getDueDateClass(row)">
            {{ formatDate(row.dueDate) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="completed" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.completed ? 'success' : 'info'">
            {{ row.completed ? '已完成' : '未完成' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
            :type="row.completed ? 'warning' : 'success'"
            size="small"
            @click="toggleComplete(row)"
          >
            {{ row.completed ? '取消完成' : '完成' }}
          </el-button>
          <el-button type="primary" size="small" @click="editTask(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="deleteTask(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="taskStore.page"
        :page-size="taskStore.limit"
        :total="taskStore.total"
        layout="total, prev, pager, next"
        @current-change="taskStore.setPage"
      />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Grid, List } from '@element-plus/icons-vue'
import { useTaskStore } from '@/stores/task'
import type { Task, Priority, CreateTaskRequest, UpdateTaskRequest } from '@/types'
import TaskDialog from '@/components/Task/TaskDialog.vue'
import TaskCard from '@/components/Task/TaskCard.vue'

const taskStore = useTaskStore()
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingTask = ref<Task | undefined>(undefined)
const viewMode = ref<'card' | 'table'>('card')

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

onMounted(() => {
  taskStore.fetchTasks()
})

function getPriorityType(priority: Priority) {
  const map: Record<Priority, string> = {
    HIGH: 'danger',
    MEDIUM: 'warning',
    LOW: 'success',
  }
  return map[priority]
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
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function getDueDateClass(task: Task) {
  if (!task.dueDate || task.completed) return ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(task.dueDate)
  if (dueDate < today) return 'overdue'
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)
  if (dueDate <= nextWeek) return 'upcoming'
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

async function toggleComplete(task: Task) {
  const result = await taskStore.toggleComplete(task)
  if (result.success) {
    ElMessage.success(task.completed ? '已标记为未完成' : '已标记为完成')
  } else {
    ElMessage.error(result.message || '操作失败')
  }
}

function editTask(task: Task) {
  editingTask.value = task
  showEditDialog.value = true
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
  border-radius: var(--radius-lg);
  min-height: calc(100vh - 96px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.header-left h1 {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.filter-bar {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.tasks-card-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-md);
  min-height: 200px;
}

.tasks-table {
  border-radius: var(--radius-md);
  overflow: hidden;
}

.task-name-cell {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
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

.overdue {
  color: var(--danger-color);
  font-weight: 600;
}

.upcoming {
  color: var(--warning-color);
}

.pagination {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: center;
}
</style>