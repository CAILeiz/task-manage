<template>
  <div class="login-container">
    <div class="brand-section animate-slide-up">
      <div class="brand-content">
        <div class="brand-logo">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="48"
              height="48"
              rx="12"
              fill="white"
              fill-opacity="0.2"
            />
            <path
              d="M14 24L20 30L34 16"
              stroke="white"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h1 class="brand-title">TaskFlow</h1>
        <p class="brand-subtitle">让任务管理变得简单高效</p>
        <ul class="brand-features">
          <li>
            <span class="feature-icon">✓</span>
            <span>智能任务分类与优先级管理</span>
          </li>
          <li>
            <span class="feature-icon">✓</span>
            <span>看板视图与列表视图自由切换</span>
          </li>
          <li>
            <span class="feature-icon">✓</span>
            <span>团队协作与实时同步</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="form-section">
      <el-card class="login-card animate-slide-down">
        <template #header>
          <h2 class="login-title">欢迎回来</h2>
          <p class="login-subtitle">登录您的账号继续</p>
        </template>

        <div class="sso-buttons">
          <el-button
            class="sso-btn google-btn"
            size="large"
            @click="handleSSO('google')"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>使用 Google 登录</span>
          </el-button>
          <el-button
            class="sso-btn github-btn"
            size="large"
            @click="handleSSO('github')"
            style="margin-left: 0px"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
            <span>使用 GitHub 登录</span>
          </el-button>
        </div>

        <div class="divider">
          <span>或使用邮箱登录</span>
        </div>

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
              class="custom-input"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              class="custom-input"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="authStore.loading"
              class="submit-btn"
              @click="handleSubmit"
            >
              {{ authStore.loading ? "登录中..." : "登录" }}
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
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const formRef = ref();

const form = reactive({
  username: "",
  password: "",
});

const rules = {
  username: [
    { required: true, message: "请输入用户名或邮箱", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度至少6位", trigger: "blur" },
  ],
};

const handleSubmit = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  const result = await authStore.login(form.username, form.password);
  if (result.success) {
    ElMessage.success("登录成功");
    router.push("/tasks");
  } else {
    ElMessage.error(result.message || "登录失败");
  }
};

const handleSSO = (provider: string) => {
  if (provider === "github") {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (!clientId) {
      ElMessage.error("GitHub 登录未配置");
      return;
    }
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=user:email`;
    window.location.href = githubAuthUrl;
  } else {
    ElMessage.info(`${provider} 登录功能即将上线`);
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  background: var(--bg-secondary);
}

.brand-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: var(--spacing-2xl);
  position: relative;
  overflow: hidden;
}

.brand-section::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
}

.brand-content {
  position: relative;
  z-index: 1;
  color: white;
  max-width: 400px;
}

.brand-logo {
  width: 64px;
  height: 64px;
  margin-bottom: var(--spacing-lg);
}

.brand-logo svg {
  width: 100%;
  height: 100%;
}

.brand-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  margin: 0 0 var(--spacing-sm);
  letter-spacing: -0.02em;
}

.brand-subtitle {
  font-size: var(--font-size-lg);
  opacity: 0.9;
  margin: 0 0 var(--spacing-xl);
}

.brand-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.brand-features li {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  font-size: var(--font-size-base);
  opacity: 0.95;
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  font-size: 12px;
}

.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  background: var(--bg-primary);
}

.login-card {
  width: 100%;
  max-width: 420px;
  border: none;
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-xl);
}

.login-card :deep(.el-card__header) {
  padding: var(--spacing-lg) var(--spacing-lg) 0;
  border-bottom: none;
}

.login-card :deep(.el-card__body) {
  padding: var(--spacing-lg);
}

.login-title {
  text-align: center;
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
}

.login-subtitle {
  text-align: center;
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.sso-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.sso-btn {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  border: 1.5px solid var(--border-base);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-weight: 500;
  font-size: var(--font-size-base);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-out);
  padding: 0 var(--spacing-md);
}

.sso-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
}

.sso-btn:active {
  transform: translateY(0);
}

.sso-btn svg {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.sso-btn span {
  line-height: 1;
}

.divider {
  display: flex;
  align-items: center;
  margin: var(--spacing-lg) 0;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border-light);
}

.divider span {
  padding: 0 var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.custom-input :deep(.el-input__wrapper) {
  border-radius: var(--radius-lg);
  box-shadow: none;
  border: 1.5px solid var(--border-base);
  transition: all var(--duration-fast) var(--ease-out);
}

.custom-input :deep(.el-input__wrapper:hover) {
  border-color: var(--primary-light);
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary-color);
  border-width: 2px;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.custom-input :deep(.el-input__inner) {
  height: 48px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-weight: 600;
  font-size: var(--font-size-base);
  border-radius: var(--radius-lg);
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--primary-light)
  );
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

.login-footer {
  text-align: center;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

@media (max-width: 768px) {
  .brand-section {
    display: none;
  }

  .login-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .form-section {
    padding: var(--spacing-md);
  }

  .login-card {
    max-width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand-section,
  .login-card {
    animation: none;
  }
}
</style>