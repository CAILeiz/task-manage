<template>
  <el-container class="layout-container">
    <el-header>
      <div class="header-content">
        <div class="logo">
          <h2>任务管理</h2>
        </div>
        <div class="user-info" v-if="authStore.isLoggedIn">
          <span>{{ authStore.user?.username }}</span>
          <el-button type="danger" size="small" @click="logout">退出</el-button>
        </div>
      </div>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

function logout() {
  authStore.logout();
  ElMessage.success('已退出登录');
  router.push('/login');
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.el-header {
  background-color: #409eff;
  color: white;
  line-height: 60px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo h2 {
  margin: 0;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.el-main {
  background-color: #f5f5f5;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
</style>
