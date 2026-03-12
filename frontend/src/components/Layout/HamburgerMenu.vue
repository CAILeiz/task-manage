<template>
  <el-button
    class="hamburger-btn"
    :class="{ 'is-active': isActive }"
    @click="$emit('click')"
    circle
  >
    <span class="hamburger-icon">
      <span class="line"></span>
      <span class="line"></span>
      <span class="line"></span>
    </span>
  </el-button>
</template>

<script setup lang="ts">
defineProps<{
  isActive?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.hamburger-btn {
  width: var(--touch-target-size);
  height: var(--touch-target-size);
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--ease-out);
}

.hamburger-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.hamburger-icon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: 18px;
  height: 14px;
}

.hamburger-icon .line {
  display: block;
  width: 100%;
  height: 2px;
  background: currentColor;
  border-radius: 1px;
  transition: all var(--duration-fast) var(--ease-out);
  transform-origin: center;
}

.hamburger-btn.is-active .hamburger-icon .line:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.hamburger-btn.is-active .hamburger-icon .line:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.is-active .hamburger-icon .line:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}
</style>