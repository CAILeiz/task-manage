<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2 class="login-title">登录</h2>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="用户名/邮箱" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名或邮箱"
            size="large"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="authStore.loading"
            @click="handleSubmit"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <el-link type="primary" @click="$router.push('/register')">
          还没有账号？立即注册
        </el-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const formRef = ref();

const form = reactive({
  username: '',
  password: '',
});

const rules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
};

const handleSubmit = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  const result = await authStore.login(form.username, form.password);
  if (result.success) {
    ElMessage.success('登录成功');
    router.push('/tasks');
  } else {
    ElMessage.error(result.message || '登录失败');
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
}

.login-title {
  text-align: center;
  margin: 0;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}
</style>
