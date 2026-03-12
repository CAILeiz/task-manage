# UI Polish and Fixes - 设计文档

## 问题分析与解决方案

### 问题1: 侧边栏徽章位置不美观

**现状**:
```css
.menu-badge {
  margin-left: auto;
  margin-right: var(--spacing-sm);
}
```
徽章使用 `margin-left: auto` 导致位置偏移。

**解决方案**:
```vue
<el-menu-item index="all">
  <el-icon><List /></el-icon>
  <template #title>
    <div class="menu-item-content">
      <span>全部任务</span>
      <el-badge :value="counts.all" type="primary" />
    </div>
  </template>
</el-menu-item>
```

```css
.menu-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-left: var(--spacing-sm);
}
```

---

### 问题2: 列表视图缺少任务描述

**现状**:
el-table 只显示 title、status、priority、dueDate 列，缺少 description。

**解决方案**:
在 el-table 中添加描述列：
```vue
<el-table-column prop="description" label="描述" min-width="200">
  <template #default="{ row }">
    <span class="task-description-cell">
      {{ row.description || '暂无描述' }}
    </span>
  </template>
</el-table-column>
```

---

### 问题3: 任务计数未更新

**现状**:
`createTask()` 和 `deleteTask()` 方法没有调用 `fetchTaskCounts()`。

**解决方案**:
```typescript
async function createTask(data: CreateTaskRequest) {
  // ... existing code ...
  await fetchTasks();
  fetchTaskCounts(); // 添加此行
}

async function deleteTask(id: string) {
  // ... existing code ...
  await fetchTasks();
  fetchTaskCounts(); // 添加此行
}
```

---

### 问题4: 暗色模式UI不美观

**现状问题**:
- 背景色对比度不够
- 卡片阴影太重
- 文字颜色不清晰
- Element Plus 组件暗色适配不完整

**解决方案**:

更新 `variables.css`:
```css
html.dark {
  --bg-primary: #0f0f0f;
  --bg-secondary: #1a1a1a;
  --bg-tertiary: #252525;
  
  --text-primary: #f5f5f5;
  --text-secondary: #a0a0a0;
  --text-tertiary: #707070;
  
  --border-light: #2a2a2a;
  --border-base: #3a3a3a;
  
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-hover: 0 4px 16px rgba(0, 0, 0, 0.5);
}
```

添加 Element Plus 暗色模式支持：
```typescript
// main.ts
import 'element-plus/theme-chalk/dark/css-vars.css'
```

---

### 问题5: 整体UI美化

**优化点**:

1. **卡片优化**:
```css
.task-card {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}
```

2. **按钮优化**:
```css
.el-button--primary {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border: none;
  font-weight: 500;
}
```

3. **侧边栏优化**:
```css
.sidebar {
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}
```

4. **Header优化**:
```css
.layout-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  backdrop-filter: blur(10px);
}
```

---

## 文件修改清单

| 文件 | 修改内容 |
|------|----------|
| `Sidebar.vue` | 徽章布局重构 |
| `Tasks.vue` | 表格添加描述列 |
| `task.ts` | 添加计数刷新调用 |
| `variables.css` | 暗色模式颜色优化 |
| `theme.css` | 全局样式美化 |
| `main.ts` | 导入 Element Plus 暗色样式 |

## 实施顺序

1. 修复问题1-3（功能性bug）
2. 优化问题4（暗色模式）
3. 美化问题5（整体UI）
4. 测试验证