<template>
  <Transition name="fab">
    <el-button
      v-show="visible"
      class="fab-button"
      type="primary"
      circle
      :size="48"
      @click="handleClick"
    >
      <el-icon :size="24"><Plus /></el-icon>
    </el-button>
  </Transition>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'

defineProps<{
  visible?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

let lastClickTime = 0

function handleClick() {
  const now = Date.now()
  if (now - lastClickTime < 500) return
  lastClickTime = now
  emit('click')
}
</script>

<style scoped>
.fab-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border: none;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  z-index: var(--z-sticky);
  transition: all var(--duration-fast) var(--ease-out);
}

.fab-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
}

.fab-button:active {
  transform: scale(0.95);
}

.fab-enter-active,
.fab-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

@media (min-width: 768px) {
  .fab-button {
    display: none;
  }
}
</style>