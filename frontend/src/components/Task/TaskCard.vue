<template>
  <el-card 
    class="task-card" 
    :class="[priorityClass, { 'completed': task.completed, 'compact': compact }]"
    @click="handleClick"
  >
    <div class="task-header">
<div class="checkbox-wrapper" @click.stop>
        <el-checkbox
          v-model="localCompleted"
          class="task-checkbox"
        />
      </div>
      
      <div class="title-wrapper" v-if="!isEditing">
        <h3 class="task-title" @dblclick="startEditing">{{ task.name }}</h3>
      </div>
      <input
        v-else
        ref="editInputRef"
        v-model="editTitle"
        class="edit-input"
        @blur="saveEdit"
        @keydown.enter="saveEdit"
        @keydown.escape="cancelEdit"
        @click.stop
      />
      
      <el-tag 
        v-if="!compact"
        :type="statusTagType" 
        size="small"
        effect="light"
        class="status-tag"
      >
        {{ statusText }}
      </el-tag>
    </div>
    
    <p 
      class="task-description" 
      v-if="task.description"
      :class="{ 'expanded': descriptionExpanded }"
      @click="compact && toggleDescription()"
    >
      {{ task.description }}
    </p>
    
    <div class="task-tags" v-if="displayTags.length > 0 && !compact">
      <span 
        v-for="tag in displayTags" 
        :key="tag" 
        class="task-tag"
        :style="{ backgroundColor: getTagColor(tag) }"
      >
        {{ tag }}
      </span>
      <span v-if="remainingTagsCount > 0" class="tag-more">
        +{{ remainingTagsCount }}
      </span>
    </div>
    
    <div class="task-meta" :class="{ 'compact': compact }">
      <div class="meta-left">
        <span 
          v-if="task.dueDate" 
          class="due-date"
          :class="{ overdue: isOverdue }"
        >
          <el-icon><Clock /></el-icon>
          {{ formattedDueDate }}
        </span>
        <span class="priority-badge" :class="priorityClass">
          {{ priorityText }}
        </span>
      </div>
      
      <div class="task-actions" @click.stop>
        <el-tooltip content="编辑" placement="top">
          <el-button 
            type="primary" 
            size="small" 
            circle
            class="action-btn"
            @click="$emit('edit', task)"
          >
            <el-icon><Edit /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="删除" placement="top">
          <el-button 
            type="danger" 
            size="small" 
            circle
            class="action-btn"
            @click="handleDelete"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Clock, Edit, Delete } from '@element-plus/icons-vue'
import type { Task } from '@/types'

const props = defineProps<{
  task: Task
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', task: Task): void
  (e: 'delete', task: Task): void
  (e: 'update', task: Partial<Task>): void
}>()

const isEditing = ref(false)
const editTitle = ref('')
const editInputRef = ref()
const descriptionExpanded = ref(false)

const localCompleted = computed({
  get: () => props.task.completed,
  set: (value) => {
    emit('update', { completed: value })
  }
})

const priorityClass = computed(() => {
  const priority = props.task.priority?.toLowerCase() || 'low'
  return `priority-${priority}`
})

const priorityText = computed(() => {
  const map: Record<string, string> = {
    HIGH: '高',
    MEDIUM: '中',
    LOW: '低'
  }
  return map[props.task.priority || 'LOW'] || '低'
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
  
  if (props.compact) {
    if (date.toDateString() === today.toDateString()) {
      return '今天'
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return '明天'
    }
    return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  }
  
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

const taskTags = computed(() => {
  return props.task.tags || []
})

const displayTags = computed(() => {
  return taskTags.value.slice(0, 3)
})

const remainingTagsCount = computed(() => {
  return Math.max(0, taskTags.value.length - 3)
})

const tagColors: Record<string, string> = {
  工作: '#3b82f6',
  个人: '#8b5cf6',
  学习: '#10b981',
  重要: '#ef4444',
  紧急: '#f59e0b',
}

function getTagColor(tag: string): string {
  return tagColors[tag] || '#6b7280'
}

function handleClick() {
  emit('edit', props.task)
}

function startEditing() {
  isEditing.value = true
  editTitle.value = props.task.name
  nextTick(() => {
    editInputRef.value?.focus()
    editInputRef.value?.select()
  })
}

function saveEdit() {
  if (editTitle.value.trim() && editTitle.value !== props.task.name) {
    emit('update', { name: editTitle.value.trim() })
  }
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
  editTitle.value = props.task.name
}

function handleDelete() {
  emit('delete', props.task)
}

function toggleDescription() {
  descriptionExpanded.value = !descriptionExpanded.value
}
</script>

<style scoped>
.task-card {
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-light);
  margin-bottom: var(--spacing-md);
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

.task-card.compact {
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-mobile-card);
}

.task-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--gray-300);
  transition: background var(--duration-fast) var(--ease-out);
}

.task-card.priority-high::before {
  background: var(--danger-color);
}

.task-card.priority-medium::before {
  background: var(--warning-color);
}

.task-card.priority-low::before {
  background: var(--success-color);
}

.task-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.task-card.compact:hover {
  transform: translateY(-1px);
}

.task-card.compact:active {
  transform: scale(0.98);
  transition: transform 0.1s ease-out;
}

.task-card.completed {
  opacity: 0.7;
}

.task-card.completed .task-title {
  text-decoration: line-through;
  color: var(--text-tertiary);
}

.task-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.compact .task-header {
  margin-bottom: var(--spacing-xs);
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
}

.task-checkbox :deep(.el-checkbox__inner) {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-out);
}

.task-checkbox :deep(.el-checkbox__inner::after) {
  height: 10px;
  left: 6px;
  top: 2px;
  width: 5px;
}

.compact .task-checkbox :deep(.el-checkbox__inner) {
  width: 22px;
  height: 22px;
}

.compact .task-checkbox :deep(.el-checkbox__inner::after) {
  height: 11px;
  left: 7px;
  top: 2px;
  width: 5px;
}

.title-wrapper {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact .task-title {
  font-size: var(--font-size-sm);
}

.edit-input {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 2px solid var(--primary-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  outline: none;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.status-tag {
  flex-shrink: 0;
}

.task-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin: 0 0 var(--spacing-sm) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding-left: 32px;
}

.compact .task-description {
  -webkit-line-clamp: 2;
  margin-bottom: var(--spacing-xs);
  padding-left: 28px;
  cursor: pointer;
}

.compact .task-description.expanded {
  -webkit-line-clamp: unset;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
  padding-left: 32px;
}

.task-tag {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: white;
  font-weight: 500;
}

.tag-more {
  display: inline-flex;
  padding: 2px 6px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 32px;
}

.task-meta.compact {
  padding-left: 28px;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.compact .meta-left {
  gap: var(--spacing-xs);
}

.due-date {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.compact .due-date {
  font-size: 11px;
}

.due-date.overdue {
  color: var(--danger-color);
  font-weight: 500;
}

.priority-badge {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.compact .priority-badge {
  padding: 1px 6px;
  font-size: 10px;
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

.task-actions {
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.compact .task-actions {
  opacity: 1;
}

.task-card:hover .task-actions {
  opacity: 1;
}

.action-btn {
  width: 28px !important;
  height: 28px !important;
  padding: 0 !important;
}

.compact .action-btn {
  width: var(--touch-target-size) !important;
  height: var(--touch-target-size) !important;
}

@media (prefers-reduced-motion: reduce) {
  .task-card {
    transition: none;
  }
  
  .task-card:hover {
    transform: none;
  }
}
</style>