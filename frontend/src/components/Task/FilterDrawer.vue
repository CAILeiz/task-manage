<template>
  <el-drawer
    v-model="drawerVisible"
    direction="btt"
    :with-header="true"
    title="筛选"
    size="auto"
    class="filter-drawer"
  >
    <div class="filter-drawer-content">
      <div class="filter-group">
        <label class="filter-label">优先级</label>
        <div class="filter-options">
          <el-button
            v-for="opt in priorityOptions"
            :key="opt.value"
            :type="localFilter.priority === opt.value ? 'primary' : 'default'"
            size="small"
            @click="localFilter.priority = opt.value"
            round
          >
            {{ opt.label }}
          </el-button>
        </div>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">状态</label>
        <div class="filter-options">
          <el-button
            :type="localFilter.completed === false ? 'primary' : 'default'"
            size="small"
            @click="localFilter.completed = false"
            round
          >
            未完成
          </el-button>
          <el-button
            :type="localFilter.completed === true ? 'primary' : 'default'"
            size="small"
            @click="localFilter.completed = true"
            round
          >
            已完成
          </el-button>
        </div>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">截止日期</label>
        <div class="filter-options">
          <el-button
            v-for="opt in dueDateOptions"
            :key="opt.value"
            :type="localFilter.dueDateFilter === opt.value ? 'primary' : 'default'"
            size="small"
            @click="localFilter.dueDateFilter = opt.value"
            round
          >
            {{ opt.label }}
          </el-button>
        </div>
      </div>
      
      <div class="filter-actions">
        <el-button @click="handleReset" class="reset-btn">重置</el-button>
        <el-button type="primary" @click="handleApply" class="apply-btn">应用</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Priority } from '@/types'

const props = defineProps<{
  visible: boolean
  priority?: Priority
  completed?: boolean
  dueDateFilter?: 'today' | 'upcoming' | 'overdue' | 'none'
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:filter': [filter: { priority?: Priority; completed?: boolean; dueDateFilter?: 'today' | 'upcoming' | 'overdue' | 'none' }]
}>()

const drawerVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const priorityOptions = [
  { label: '高', value: 'HIGH' as Priority },
  { label: '中', value: 'MEDIUM' as Priority },
  { label: '低', value: 'LOW' as Priority },
]

const dueDateOptions = [
  { label: '今天', value: 'today' as const },
  { label: '即将到期', value: 'upcoming' as const },
  { label: '已过期', value: 'overdue' as const },
  { label: '无期限', value: 'none' as const },
]

const localFilter = ref({
  priority: undefined as Priority | undefined,
  completed: undefined as boolean | undefined,
  dueDateFilter: undefined as 'today' | 'upcoming' | 'overdue' | 'none' | undefined,
})

watch(
  () => [props.priority, props.completed, props.dueDateFilter],
  () => {
    localFilter.value = {
      priority: props.priority,
      completed: props.completed,
      dueDateFilter: props.dueDateFilter,
    }
  },
  { immediate: true }
)

function handleReset() {
  localFilter.value = {
    priority: undefined,
    completed: undefined,
    dueDateFilter: undefined,
  }
}

function handleApply() {
  emit('update:filter', { ...localFilter.value })
  emit('update:visible', false)
}
</script>

<style scoped>
.filter-drawer :deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.filter-drawer :deep(.el-drawer__body) {
  padding: var(--spacing-md);
}

.filter-drawer-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.filter-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.reset-btn {
  flex: 1;
}

.apply-btn {
  flex: 2;
}
</style>