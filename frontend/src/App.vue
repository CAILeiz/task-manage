<template>
  <Layout v-if="authStore.isLoggedIn" />
  <router-view v-else />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import Layout from './components/Layout/Layout.vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  authStore.fetchUser();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
