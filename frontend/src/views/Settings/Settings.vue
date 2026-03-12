<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>个人设置</h1>
      <p>管理您的账户信息和偏好设置</p>
    </div>

    <div class="settings-content">
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <el-icon :size="20"><User /></el-icon>
            <span>基本信息</span>
          </div>
        </template>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="settings-form"
        >
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <el-avatar :size="80" :src="form.avatar">
                {{ form.username?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <el-upload
                class="avatar-upload"
                action="#"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
              >
                <el-button size="small" circle :icon="Camera" />
              </el-upload>
            </div>
            <div class="avatar-tip">点击更换头像</div>
          </div>

          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>

          <el-form-item label="个人简介" prop="bio">
            <el-input
              v-model="form.bio"
              type="textarea"
              :rows="3"
              placeholder="介绍一下自己..."
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              @click="handleSave"
            >
              保存修改
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <el-icon :size="20"><Lock /></el-icon>
            <span>修改密码</span>
          </div>
        </template>

        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-position="top"
          class="settings-form"
        >
          <el-form-item label="当前密码" prop="currentPassword">
            <el-input
              v-model="passwordForm.currentPassword"
              type="password"
              placeholder="请输入当前密码"
              show-password
            />
          </el-form-item>

          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password
            />
          </el-form-item>

          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="passwordLoading"
              @click="handleChangePassword"
            >
              修改密码
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <el-icon :size="20"><Setting /></el-icon>
            <span>偏好设置</span>
          </div>
        </template>

        <div class="preference-item">
          <div class="preference-info">
            <span class="preference-label">深色模式</span>
            <span class="preference-desc">启用暗色主题以保护眼睛</span>
          </div>
          <el-switch v-model="preferences.darkMode" @change="handleThemeChange" />
        </div>

        <div class="preference-item">
          <div class="preference-info">
            <span class="preference-label">邮件通知</span>
            <span class="preference-desc">接收任务提醒和更新通知</span>
          </div>
          <el-switch v-model="preferences.emailNotification" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock, Setting, Camera } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'

const authStore = useAuthStore()
const { theme, toggleTheme, initTheme } = useTheme()

const formRef = ref()
const passwordFormRef = ref()
const loading = ref(false)
const passwordLoading = ref(false)

const form = reactive({
  username: '',
  email: '',
  bio: '',
  avatar: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const preferences = reactive({
  darkMode: theme.value === 'dark',
  emailNotification: true
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度 2-20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

function beforeAvatarUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    form.avatar = e.target?.result as string
  }
  reader.readAsDataURL(file)
  return false
}

async function handleSave() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    const result = await authStore.updateProfile({
      username: form.username,
      email: form.email,
      bio: form.bio,
      avatar: form.avatar
    })

    if (result.success) {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(result.message || '保存失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    loading.value = false
  }
}

async function handleChangePassword() {
  const valid = await passwordFormRef.value?.validate()
  if (!valid) return

  passwordLoading.value = true
  try {
    const result = await authStore.changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    )

    if (result.success) {
      ElMessage.success('密码修改成功')
      passwordFormRef.value?.resetFields()
    } else {
      ElMessage.error(result.message || '密码修改失败')
    }
  } finally {
    passwordLoading.value = false
  }
}

function handleThemeChange(value: boolean) {
  if (value && theme.value !== 'dark') {
    toggleTheme()
  } else if (!value && theme.value === 'dark') {
    toggleTheme()
  }
}

onMounted(() => {
  initTheme()
  if (authStore.user) {
    form.username = authStore.user.username || ''
    form.email = authStore.user.email || ''
    form.bio = authStore.user.bio || ''
    form.avatar = authStore.user.avatar || ''
  }
  preferences.darkMode = theme.value === 'dark'
})
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-header h1 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs);
}

.page-header p {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.settings-card {
  border-radius: var(--radius-xl);
  border: none;
  box-shadow: var(--shadow-card);
}

.settings-card :deep(.el-card__header) {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.settings-card :deep(.el-card__body) {
  padding: var(--spacing-lg);
}

.settings-form {
  max-width: 500px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.avatar-wrapper {
  position: relative;
}

.avatar-upload {
  position: absolute;
  bottom: 0;
  right: 0;
}

.avatar-tip {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--border-light);
}

.preference-item:last-child {
  border-bottom: none;
}

.preference-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.preference-label {
  font-weight: 500;
  color: var(--text-primary);
}

.preference-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .settings-page {
    padding: var(--spacing-mobile-container);
  }

  .settings-form {
    max-width: 100%;
  }
}
</style>