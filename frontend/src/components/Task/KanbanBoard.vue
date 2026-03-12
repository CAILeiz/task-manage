<template>
  <div class="kanban-board">
    <div 
      v-for="column in columns" 
      :key="column.status" 
      class="kanban-column"
    >
      <div class="column-header">
        <h3>{{ column.title }}</h3>
        <el-badge :value="column.tasks.length" type="primary" />
      </div>
      
      <div 
        class="column-content"
        @dragover.prevent
        @drop="handleDrop($event, column.status)"
      >
        <div
          v-for="task in column.tasks"
          :key="task.id"
          class="kanban-card"
          :class="`priority-${task.priority?.toLowerCase()}`"
          draggable="true"
          @dragstart="handleDragStart($event, task)"
          @click="$emit('edit', task)"
        >
          <div class="card-header">
            <span class="card-title">{{ task.name }}</span>
            <el-tag 
              :type="getPriorityType(task.priority)" 
              size="small"
              effect="dark"
            >
              {{ getPriorityLabel(task.priority) }}
            </el-tag>
          </div>
          
          <p class="card-description">
            {{ task.description || '暂无描述' }}
          </p>
          
          <div class="card-footer">
            <span v-if="task.dueDate" class="due-date" :class="{ overdue: isOverdue(task) }">
              <el-icon><Clock /></el-icon>
              {{ formatDate(task.dueDate) }}
            </span>
            <div class="card-actions" @click.stop>
              <el-button type="danger" size="small" text @click="$emit('delete', task)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
        
        <el-empty v-if="column.tasks.length === 0" description="暂无任务" :image-size="60" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Clock, Delete } from '@element-plus/icons-vue'
import type { Task, Priority } from '@/types'

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'edit', task: Task): void
  (e: 'delete', task: Task): void
  (e: 'status-change', task: Task, completed: boolean): void
}>()

interface KanbanColumn {
  status: string
  title: string
  tasks: Task[]
}

const columns = computed<KanbanColumn[]>(() => {
  const pending = props.tasks.filter(t => !t.completed)
  const inProgress: Task[] = []
  const completed = props.tasks.filter(t => t.completed)
  
  pending.forEach(task => {
    if (isOverdue(task)) {
      inProgress.push(task)
    }
  })
  
  const normalPending = pending.filter(t => !isOverdue(t))
  
  return [
    { status: 'pending', title: '待开始', tasks: normalPending },
    { status: 'in_progress', title: '进行中', tasks: inProgress },
    { status: 'completed', title: '已完成', tasks: completed }
  ]
})

let draggedTask: Task | null = null

function handleDragStart(event: DragEvent, task: Task) {
  draggedTask = task
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function handleDrop(event: DragEvent, newStatus: string) {
  if (!draggedTask) return
  
  const newCompleted = newStatus === 'completed'
  
  if (draggedTask.completed !== newCompleted) {
    emit('status-change', draggedTask, newCompleted)
  }
  
  draggedTask = null
}

function getPriorityType(priority?: Priority) {
  const map: Record<string, string> = {
    HIGH: 'danger',
    MEDIUM: 'warning',
    LOW: 'success',
  }
  return map[priority || 'LOW'] || 'info'
}

function getPriorityLabel(priority?: Priority) {
  const map: Record<string, string> = {
    HIGH: '高',
    MEDIUM: '中',
    LOW: '低',
  }
  return map[priority || 'LOW'] || '低'
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function isOverdue(task: Task) {
  if (!task.dueDate || task.completed) return false
  return new Date(task.dueDate) < new Date()
}
</script>

<style scoped>
.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  min-height: 500px;
}

.kanban-column {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.column-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.column-content {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.kanban-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-base);
  border: 1px solid var(--border-light);
  border-left: 4px solid transparent;
}

.kanban-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.kanban-card.priority-high {
  border-left-color: var(--priority-high);
}

.kanban-card.priority-medium {
  border-left-color: var(--priority-medium);
}

.kanban-card.priority-low {
  border-left-color: var(--priority-low);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.card-title {
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.due-date {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.due-date.overdue {
  color: var(--danger-color);
  font-weight: 500;
}

.card-actions {
  opacity: 0;
  transition: opacity var(--transition-base);
}

.kanban-card:hover .card-actions {
  opacity: 1;
}
</style>