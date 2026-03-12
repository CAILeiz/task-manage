<template>
  <div class="kanban-board">
    <div 
      v-for="column in columns" 
      :key="column.status" 
      class="kanban-column"
      :class="{ 'drag-over': dragOverColumn === column.status }"
      @dragover.prevent="dragOverColumn = column.status"
      @dragleave="dragOverColumn = null"
      @drop="handleDrop($event, column.status)"
    >
      <div class="column-header">
        <div class="header-left">
          <span class="column-dot" :class="column.status"></span>
          <h3>{{ column.title }}</h3>
        </div>
        <span class="column-count">{{ column.tasks.length }}</span>
      </div>
      
      <div class="column-content">
        <TransitionGroup name="kanban-card">
          <div
            v-for="task in column.tasks"
            :key="task.id"
            class="kanban-card"
            :class="getCardClasses(task)"
            draggable="true"
            @dragstart="handleDragStart($event, task)"
            @dragend="handleDragEnd"
            @click="$emit('edit', task)"
          >
            <div class="card-checkbox" @click.stop>
              <el-checkbox
                :model-value="task.completed"
                @change="handleCompleteToggle(task, $event)"
              />
            </div>
            
            <div class="card-content">
              <div class="card-header">
                <span class="card-title">{{ task.name }}</span>
              </div>
              
              <p class="card-description" v-if="task.description">
                {{ task.description }}
              </p>
              
              <div class="card-tags" v-if="task.tags?.length">
                <span 
                  v-for="tag in task.tags.slice(0, 2)" 
                  :key="tag" 
                  class="card-tag"
                >
                  {{ tag }}
                </span>
                <span v-if="task.tags.length > 2" class="tag-more">
                  +{{ task.tags.length - 2 }}
                </span>
              </div>
              
              <div class="card-footer">
                <span v-if="task.dueDate" class="due-date" :class="{ overdue: isOverdue(task) }">
                  <el-icon><Clock /></el-icon>
                  {{ formatDate(task.dueDate) }}
                </span>
                <span class="priority-indicator" :class="`priority-${task.priority?.toLowerCase()}`">
                  {{ getPriorityLabel(task.priority) }}
                </span>
              </div>
            </div>
            
            <div class="card-actions" @click.stop>
              <el-button 
                type="danger" 
                size="small" 
                circle
                class="action-btn"
                @click="$emit('delete', task)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </TransitionGroup>
        
        <div v-if="column.tasks.length === 0" class="empty-column">
          <el-icon><FolderOpened /></el-icon>
          <span>拖拽任务到这里</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Clock, Delete, FolderOpened } from '@element-plus/icons-vue'
import type { Task, Priority } from '@/types'

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'edit', task: Task): void
  (e: 'delete', task: Task): void
  (e: 'status-change', task: Task, completed: boolean): void
}>()

const dragOverColumn = ref<string | null>(null)
const draggedTask = ref<Task | null>(null)

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

function handleDragStart(event: DragEvent, task: Task) {
  draggedTask.value = task
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', task.id.toString())
  }
}

function handleDragEnd() {
  draggedTask.value = null
  dragOverColumn.value = null
}

function handleDrop(event: DragEvent, newStatus: string) {
  event.preventDefault()
  dragOverColumn.value = null
  
  if (!draggedTask.value) return
  
  const newCompleted = newStatus === 'completed'
  
  if (draggedTask.value.completed !== newCompleted) {
    emit('status-change', draggedTask.value, newCompleted)
  }
  
  draggedTask.value = null
}

function handleCompleteToggle(task: Task, completed: boolean) {
  emit('status-change', task, completed)
}

function getCardClasses(task: Task) {
  return {
    'completed': task.completed,
    'dragging': draggedTask.value?.id === task.id,
    [`priority-border-${task.priority?.toLowerCase()}`]: true
  }
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
  const today = new Date()
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  }
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (date.toDateString() === tomorrow.toDateString()) {
    return '明天'
  }
  
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
  grid-template-columns: repeat(3, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  min-height: 500px;
}

.kanban-column {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  min-height: 400px;
  transition: all var(--duration-normal) var(--ease-out);
}

.kanban-column.drag-over {
  background-color: var(--bg-tertiary);
  box-shadow: inset 0 0 0 2px var(--primary-color);
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.column-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.column-dot.pending {
  background: var(--gray-400);
}

.column-dot.in_progress {
  background: var(--warning-color);
}

.column-dot.completed {
  background: var(--success-color);
}

.column-header h3 {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.column-count {
  padding: 2px 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: 500;
}

.column-content {
  flex: 1;
  padding: var(--spacing-sm);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.kanban-card {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  border: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;
}

.kanban-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--gray-300);
}

.kanban-card.priority-border-high::before {
  background: var(--danger-color);
}

.kanban-card.priority-border-medium::before {
  background: var(--warning-color);
}

.kanban-card.priority-border-low::before {
  background: var(--success-color);
}

.kanban-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.kanban-card.dragging {
  opacity: 0.5;
  transform: rotate(1deg) scale(1.02);
}

.kanban-card.completed {
  opacity: 0.7;
}

.kanban-card.completed .card-title {
  text-decoration: line-through;
  color: var(--text-tertiary);
}

.card-checkbox {
  flex-shrink: 0;
  padding-top: 2px;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-header {
  margin-bottom: var(--spacing-xs);
}

.card-title {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-description {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.card-tag {
  padding: 1px 6px;
  background: var(--primary-light);
  color: var(--primary-dark);
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 500;
}

.tag-more {
  padding: 1px 4px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: 10px;
  color: var(--text-tertiary);
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
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.due-date.overdue {
  color: var(--danger-color);
  font-weight: 500;
}

.priority-indicator {
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 500;
}

.priority-indicator.priority-high {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.priority-indicator.priority-medium {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.priority-indicator.priority-low {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.card-actions {
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.kanban-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  width: 24px !important;
  height: 24px !important;
  padding: 0 !important;
}

.empty-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--text-tertiary);
  gap: var(--spacing-sm);
}

.empty-column .el-icon {
  font-size: 32px;
  opacity: 0.5;
}

.empty-column span {
  font-size: var(--font-size-sm);
}

.kanban-card-move,
.kanban-card-enter-active,
.kanban-card-leave-active {
  transition: all var(--duration-slow) var(--ease-spring);
}

.kanban-card-enter-from,
.kanban-card-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}

.kanban-card-leave-active {
  position: absolute;
}

@media (prefers-reduced-motion: reduce) {
  .kanban-card,
  .kanban-column {
    transition: none;
  }
  
  .kanban-card:hover {
    transform: none;
  }
}
</style>