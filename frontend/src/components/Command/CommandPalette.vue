<template>
  <el-dialog
    v-model="visible"
    :show-close="false"
    width="560px"
    class="command-palette-dialog"
    @close="handleClose"
  >
    <div class="command-palette">
      <div class="search-input-wrapper">
        <el-icon class="search-icon"><Search /></el-icon>
        <input
          ref="inputRef"
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索任务、导航、操作..."
          @keydown="handleKeydown"
        />
        <kbd class="escape-hint">ESC</kbd>
      </div>
      
      <div class="command-results" v-if="filteredCommands.length > 0">
        <div class="result-group" v-for="group in groupedCommands" :key="group.label">
          <div class="group-label">{{ group.label }}</div>
          <div
            v-for="(cmd, idx) in group.items"
            :key="cmd.id"
            class="result-item"
            :class="{ active: selectedIndex === getGlobalIndex(group, idx) }"
            @click="executeCommand(cmd)"
            @mouseenter="selectedIndex = getGlobalIndex(group, idx)"
          >
            <el-icon class="result-icon"><component :is="cmd.icon" /></el-icon>
            <span class="result-label">{{ cmd.label }}</span>
            <span class="result-shortcut" v-if="cmd.shortcut">{{ cmd.shortcut }}</span>
          </div>
        </div>
      </div>
      
      <div class="empty-state" v-else-if="searchQuery">
        <el-icon><Search /></el-icon>
        <span>未找到匹配结果</span>
      </div>
      
      <div class="command-hints">
        <span><kbd>↑↓</kbd> 导航</span>
        <span><kbd>Enter</kbd> 选择</span>
        <span><kbd>ESC</kbd> 关闭</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Document, Folder, Setting, User, Plus, HomeFilled, Grid, List } from '@element-plus/icons-vue'

interface Command {
  id: string
  label: string
  icon: typeof HomeFilled
  action: () => void
  shortcut?: string
  group: string
}

const router = useRouter()
const visible = ref(false)
const searchQuery = ref('')
const inputRef = ref()
const selectedIndex = ref(0)

const commands: Command[] = [
  { id: 'nav-home', label: '首页', icon: HomeFilled, action: () => router.push('/tasks'), group: '导航' },
  { id: 'nav-tasks', label: '任务列表', icon: List, action: () => router.push('/tasks'), group: '导航' },
  { id: 'nav-kanban', label: '看板视图', icon: Grid, action: () => router.push('/tasks?view=kanban'), group: '导航' },
  { id: 'new-task', label: '新建任务', icon: Plus, action: () => window.dispatchEvent(new CustomEvent('new-task')), shortcut: '⌘N', group: '操作' },
  { id: 'settings', label: '个人设置', icon: Setting, action: () => {}, group: '设置' },
  { id: 'profile', label: '个人资料', icon: User, action: () => {}, group: '设置' },
]

const filteredCommands = computed(() => {
  if (!searchQuery.value) return commands
  const query = searchQuery.value.toLowerCase()
  return commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query) || 
    cmd.group.toLowerCase().includes(query)
  )
})

const groupedCommands = computed(() => {
  const groups: Record<string, Command[]> = {}
  filteredCommands.value.forEach(cmd => {
    if (!groups[cmd.group]) groups[cmd.group] = []
    groups[cmd.group].push(cmd)
  })
  return Object.entries(groups).map(([label, items]) => ({ label, items }))
})

const getGlobalIndex = (group: { label: string; items: Command[] }, localIndex: number) => {
  let index = 0
  for (const g of groupedCommands.value) {
    if (g.label === group.label) return index + localIndex
    index += g.items.length
  }
  return 0
}

const open = () => {
  visible.value = true
  searchQuery.value = ''
  selectedIndex.value = 0
  setTimeout(() => inputRef.value?.focus(), 50)
}

const handleClose = () => {
  visible.value = false
  searchQuery.value = ''
}

const executeCommand = (cmd: Command) => {
  cmd.action()
  handleClose()
}

const handleKeydown = (e: KeyboardEvent) => {
  const totalItems = filteredCommands.value.length
  
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % totalItems
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = (selectedIndex.value - 1 + totalItems) % totalItems
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const cmd = filteredCommands.value[selectedIndex.value]
    if (cmd) executeCommand(cmd)
  } else if (e.key === 'Escape') {
    handleClose()
  }
}

watch(searchQuery, () => {
  selectedIndex.value = 0
})

defineExpose({ open })
</script>

<style scoped>
.command-palette {
  padding: 0;
}

.command-palette :deep(.el-dialog__header) {
  display: none;
}

.command-palette :deep(.el-dialog__body) {
  padding: 0;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  gap: var(--spacing-sm);
}

.search-icon {
  font-size: 20px;
  color: var(--text-tertiary);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: var(--font-size-lg);
  background: transparent;
  color: var(--text-primary);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.escape-hint {
  padding: 2px 6px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: 11px;
  color: var(--text-tertiary);
}

.command-results {
  max-height: 320px;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

.result-group {
  margin-bottom: var(--spacing-sm);
}

.group-label {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.result-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.result-item:hover,
.result-item.active {
  background: var(--primary-color);
  color: white;
}

.result-item:hover .result-icon,
.result-item.active .result-icon {
  color: white;
}

.result-icon {
  font-size: 18px;
  color: var(--text-secondary);
}

.result-label {
  flex: 1;
  font-size: var(--font-size-sm);
}

.result-shortcut {
  padding: 2px 6px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: 11px;
  color: var(--text-tertiary);
}

.result-item.active .result-shortcut {
  background: rgba(255,255,255,0.2);
  color: white;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--text-tertiary);
  gap: var(--spacing-sm);
}

.empty-state .el-icon {
  font-size: 32px;
}

.command-hints {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--border-light);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.command-hints kbd {
  padding: 1px 4px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  margin-right: 4px;
}
</style>

<style>
.command-palette-dialog {
  border-radius: var(--radius-xl) !important;
  overflow: hidden;
}

.command-palette-dialog .el-dialog__header {
  display: none;
}

.command-palette-dialog .el-dialog__body {
  padding: 0 !important;
}
</style>