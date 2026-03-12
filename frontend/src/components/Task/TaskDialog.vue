<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    :width="dialogWidth"
    :fullscreen="isMobile"
    :show-close="!isMobile"
    class="task-dialog"
    :class="{ 'is-mobile': isMobile }"
    @close="handleClose"
    @closed="resetForm"
  >
    <template #header="{ close }" v-if="isMobile">
      <div class="mobile-dialog-header">
        <el-button @click="close" circle class="close-btn">
          <el-icon><Close /></el-icon>
        </el-button>
        <span class="dialog-title">{{ title }}</span>
        <div class="header-spacer"></div>
      </div>
    </template>
    
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="task-form"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="任务名称" prop="name">
        <el-input 
          v-model="form.name" 
          placeholder="输入任务名称..." 
          class="form-input"
        />
      </el-form-item>
      
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="添加任务描述（选填）..."
          class="form-input"
        />
      </el-form-item>
      
      <div class="form-row" :class="{ 'mobile-row': isMobile }">
        <el-form-item label="优先级" prop="priority" class="flex-1">
          <el-segmented v-model="form.priority" :options="priorityOptions" block />
        </el-form-item>
        
        <el-form-item label="截止日期" prop="dueDate" class="flex-1">
          <el-date-picker
            v-model="form.dueDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            class="form-input full-width"
            :disabled-date="disabledDate"
          />
        </el-form-item>
      </div>
      
      <el-form-item label="标签" prop="tags">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="添加标签..."
          class="form-input full-width"
        >
          <el-option
            v-for="tag in defaultTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item v-if="isEdit" label="状态" prop="completed">
        <el-switch
          v-model="form.completed"
          active-text="已完成"
          inactive-text="未完成"
          inline-prompt
          class="status-switch"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer" :class="{ 'mobile-footer': isMobile }">
        <el-button 
          @click="handleClose" 
          class="cancel-btn"
          :size="isMobile ? 'large' : 'default'"
        >
          取消
        </el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit" 
          :loading="loading"
          class="submit-btn"
          :size="isMobile ? 'large' : 'default'"
        >
          {{ isEdit ? '保存修改' : '创建任务' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { Close } from '@element-plus/icons-vue'
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../../types'
import { useBreakpoint } from '@/composables/useBreakpoint'

interface Props {
  visible: boolean
  title: string
  task?: Task
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [data: CreateTaskRequest | UpdateTaskRequest]
}>()

const { isMobile } = useBreakpoint()
const formRef = ref()
const loading = ref(false)
const isEdit = computed(() => !!props.task)

const dialogWidth = computed(() => isMobile.value ? '100%' : '520px')

const priorityOptions = [
  { label: '高', value: 'HIGH' },
  { label: '中', value: 'MEDIUM' },
  { label: '低', value: 'LOW' },
]

const defaultTags = ['工作', '个人', '学习', '重要', '紧急']

const form = reactive({
  name: '',
  description: '',
  priority: 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW',
  dueDate: '',
  completed: false,
  tags: [] as string[],
})

const rules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { max: 200, message: '任务名称不能超过200个字符', trigger: 'blur' },
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' },
  ],
}

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      form.name = newTask.name
      form.description = newTask.description || ''
      form.priority = newTask.priority
      form.dueDate = newTask.dueDate || ''
      form.completed = newTask.completed
      form.tags = newTask.tags || []
    }
  },
  { immediate: true }
)

function handleClose() {
  emit('update:visible', false)
}

function resetForm() {
  form.name = ''
  form.description = ''
  form.priority = 'MEDIUM'
  form.dueDate = ''
  form.completed = false
  form.tags = []
  formRef.value?.resetFields()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  const data: CreateTaskRequest | UpdateTaskRequest = {
    name: form.name,
    description: form.description || undefined,
    priority: form.priority,
    dueDate: form.dueDate || undefined,
    tags: form.tags.length > 0 ? form.tags : undefined,
  }

  if (isEdit.value) {
    (data as UpdateTaskRequest).completed = form.completed
  }

  emit('submit', data)
}

const handleKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && props.visible) {
    e.preventDefault()
    handleSubmit()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.task-form {
  padding: 0;
}

.form-input :deep(.el-input__wrapper),
.form-input :deep(.el-textarea__inner) {
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-out);
  border: 1.5px solid var(--border-base);
}

.form-input :deep(.el-input__wrapper:hover),
.form-input :deep(.el-textarea__inner:hover) {
  border-color: var(--primary-light);
}

.form-input :deep(.el-input__wrapper.is-focus),
.form-input :deep(.el-textarea__inner:focus) {
  border-color: var(--primary-color);
  border-width: 2px;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.form-input :deep(.el-input__inner) {
  font-size: var(--font-size-base);
}

.form-input :deep(.el-textarea__inner) {
  font-size: var(--font-size-base);
  line-height: 1.6;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.form-row.mobile-row {
  grid-template-columns: 1fr;
  gap: var(--spacing-sm);
}

.flex-1 {
  flex: 1;
}

.full-width {
  width: 100%;
}

.form-input.full-width :deep(.el-input__wrapper) {
  width: 100%;
}

.status-switch {
  --el-switch-on-color: var(--success-color);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.dialog-footer.mobile-footer {
  flex-direction: row;
  gap: var(--spacing-md);
}

.dialog-footer.mobile-footer .cancel-btn,
.dialog-footer.mobile-footer .submit-btn {
  flex: 1;
  height: var(--touch-target-size);
  font-size: var(--font-size-base);
}

.cancel-btn {
  border-radius: var(--radius-lg);
  font-weight: 500;
}

.submit-btn {
  border-radius: var(--radius-lg);
  font-weight: 600;
  min-width: 120px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border: none;
  transition: all var(--duration-fast) var(--ease-out);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

:deep(.el-segmented) {
  --el-segmented-item-selected-color: var(--primary-color);
  --el-border-radius-base: var(--radius-lg);
}

:deep(.el-segmented__item) {
  font-weight: 500;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  letter-spacing: -0.01em;
}

.mobile-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
}

.close-btn {
  width: var(--touch-target-size);
  height: var(--touch-target-size);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  border: none;
}

.dialog-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.header-spacer {
  width: var(--touch-target-size);
}

:deep(.el-date-editor.el-input__wrapper) {
  border-radius: var(--radius-lg);
}

:deep(.el-select .el-input__wrapper) {
  border-radius: var(--radius-lg);
}
</style>

<style>
.task-dialog {
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.task-dialog.is-mobile {
  border-radius: 20px 20px 0 0 !important;
  box-shadow: 0 -10px 40px -10px rgba(0, 0, 0, 0.2);
}

.task-dialog.is-mobile .el-dialog__header {
  display: none;
}

.task-dialog.is-mobile .el-dialog__body {
  padding-top: var(--spacing-sm);
}

.task-dialog .el-dialog__header {
  padding: var(--spacing-xl) var(--spacing-xl) 0;
  border-bottom: none;
}

.task-dialog .el-dialog__title {
  font-weight: 700;
  font-size: var(--font-size-xl);
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.task-dialog .el-dialog__body {
  padding: var(--spacing-xl);
}

.task-dialog .el-dialog__footer {
  padding: 0 var(--spacing-xl) var(--spacing-xl);
  border-top: none;
}

.task-dialog.is-mobile .el-dialog__body {
  padding: var(--spacing-md);
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}

.task-dialog.is-mobile .el-dialog__footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-light);
  position: sticky;
  bottom: 0;
  background: var(--bg-primary);
}

/* Dark mode enhancements */
html.dark .task-dialog {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

html.dark .task-dialog .el-dialog__footer {
  background: var(--bg-primary);
}

html.dark .task-dialog .el-dialog__headerbtn:hover {
  background: var(--bg-tertiary);
}
</style>