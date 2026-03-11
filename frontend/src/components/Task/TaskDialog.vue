<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="500px"
    @close="handleClose"
    @closed="resetForm"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="任务名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入任务名称" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          rows="3"
          placeholder="请输入任务描述（选填）"
        />
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-radio-group v-model="form.priority">
          <el-radio-button label="HIGH">高</el-radio-button>
          <el-radio-button label="MEDIUM">中</el-radio-button>
          <el-radio-button label="LOW">低</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="截止日期" prop="dueDate">
        <el-date-picker
          v-model="form.dueDate"
          type="date"
          placeholder="选择截止日期（选填）"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item v-if="isEdit" label="状态" prop="completed">
        <el-switch
          v-model="form.completed"
          active-text="已完成"
          inactive-text="未完成"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../../types';

interface Props {
  visible: boolean;
  title: string;
  task?: Task;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [value: boolean];
  submit: [data: CreateTaskRequest | UpdateTaskRequest];
}>();

const formRef = ref();
const loading = ref(false);
const isEdit = computed(() => !!props.task);

const form = reactive({
  name: '',
  description: '',
  priority: 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW',
  dueDate: '',
  completed: false,
});

const rules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { max: 200, message: '任务名称不能超过200个字符', trigger: 'blur' },
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' },
  ],
};

watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      form.name = newTask.name;
      form.description = newTask.description || '';
      form.priority = newTask.priority;
      form.dueDate = newTask.dueDate || '';
      form.completed = newTask.completed;
    }
  },
  { immediate: true }
);

function handleClose() {
  emit('update:visible', false);
}

function resetForm() {
  form.name = '';
  form.description = '';
  form.priority = 'MEDIUM';
  form.dueDate = '';
  form.completed = false;
  formRef.value?.resetFields();
}

async function handleSubmit() {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  const data: CreateTaskRequest | UpdateTaskRequest = {
    name: form.name,
    description: form.description || undefined,
    priority: form.priority,
    dueDate: form.dueDate || undefined,
  };

  if (isEdit.value) {
    (data as UpdateTaskRequest).completed = form.completed;
  }

  emit('submit', data);
}
</script>
