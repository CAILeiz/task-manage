<template>
  <el-card 
    class="task-card" 
    :class="priorityClass"
    @click="$emit('edit', task)"
  >
    <div class="task-header">
      <h3 class="task-title">{{ task.name }}</h3>
      <el-tag 
        :type="statusTagType" 
        size="small"
        effect="light"
      >
        {{ statusText }}
      </el-tag>
    </div>
    
    <p class="task-description">
      {{ task.description || '暂无描述' }}
    </p>
    
    <div class="task-meta">
      <div class="meta-left">
        <span 
          v-if="task.dueDate" 
          class="due-date"
          :class="{ overdue: isOverdue }"
        >
          <el-icon><Clock /></el-icon>
          {{ formattedDueDate }}
        </span>
        <el-tag 
          v-if="task.priority === 'HIGH'"
          type="danger"
          size="small"
          effect="dark"
        >
          高优先级
        </el-tag>
        <el-tag 
          v-else-if="task.priority === 'MEDIUM'"
          type="warning"
          size="small"
          effect="dark"
        >
          中优先级
        </el-tag>
        <el-tag 
          v-else
          type="success"
          size="small"
          effect="dark"
        >
          低优先级
        </el-tag>
      </div>
      
      <div class="task-actions" @click.stop>
        <el-button 
          type="primary" 
          size="small" 
          text
          @click="$emit('edit', task)"
        >
          <el-icon><Edit /></el-icon>
        </el-button>
        <el-button 
          type="danger" 
          size="small" 
          text
          @click="handleDelete"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Clock, Edit, Delete } from '@element-plus/icons-vue'
import type { Task } from '@/types'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  (e: 'edit', task: Task): void
  (e: 'delete', task: Task): void
}>()

const priorityClass = computed(() => {
  const priority = props.task.priority?.toLowerCase() || 'low'
  return `border-priority-${priority}`
})

const statusTagType = computed(() => {
  if (props.task.completed) return 'success'
  return 'info'
})

const statusText = computed(() => {
  return props.task.completed ? '已完成' : '进行中'
})

const formattedDueDate = computed(() => {
  if (!props.task.dueDate) return ''
  const date = new Date(props.task.dueDate)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return `明天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  }
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
})

const isOverdue = computed(() => {
  if (!props.task.dueDate || props.task.completed) return false
  return new Date(props.task.dueDate) < new Date()
})

function handleDelete() {
  emit('delete', props.task)
}
</script>

<style scoped>
.task-card {
  cursor: pointer;
  transition: all var(--transition-base);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  margin-bottom: var(--spacing-md);
}

.task-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.task-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin: 0 0 var(--spacing-md) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
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

.task-actions {
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.task-card:hover .task-actions {
  opacity: 1;
}
</style>