# Frontend UI Redesign - 设计文档

## 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.vue                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      Layout.vue                            │  │
│  │  ┌──────────┬──────────────────────────────────────────┐  │  │
│  │  │          │  Header                                  │  │  │
│  │  │          │  ┌──────────────────────────────────────┐│  │  │
│  │  │          │  │ Logo        🔔通知   👤UserMenu ▼   ││  │  │
│  │  │ Sidebar  │  └──────────────────────────────────────┘│  │  │
│  │  │          ├──────────────────────────────────────────┤  │  │
│  │  │ ○ 所有   │                                          │  │  │
│  │  │ ○ 今日   │              Main                        │  │  │
│  │  │ ○ 过期   │  ┌────────────────────────────────────┐  │  │  │
│  │  │ ○ 即将   │  │ ViewSwitcher: 列表 | 看板          │  │  │  │
│  │  │ ○ 无期限 │  ├────────────────────────────────────┤  │  │  │
│  │  │          │  │                                    │  │  │  │
│  │  │ ─────── │  │   TaskList / KanbanBoard           │  │  │  │
│  │  │          │  │                                    │  │  │  │
│  │  │ 🏷 标签   │  │                                    │  │  │  │
│  │  │  工作    │  │                                    │  │  │  │
│  │  │  个人    │  └────────────────────────────────────┘  │  │  │
│  │  │          │                                          │  │  │
│  │  └──────────┴──────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 组件设计

### 1. Sidebar.vue（新增）

**职责**：侧边栏导航，提供快捷视图入口

**Props**：
- `activeView: string` - 当前激活的视图（all/today/overdue/upcoming/none）

**Events**：
- `@view-change(view)` - 视图切换事件

**结构**：
```vue
<template>
  <el-aside width="200px" class="sidebar">
    <!-- 搜索框 -->
    <el-input placeholder="搜索任务..." prefix-icon="Search" />
    
    <!-- 快捷视图 -->
    <el-menu :default-active="activeView" @select="handleSelect">
      <el-menu-item index="all">
        <el-icon><List /></el-icon>
        <span>所有任务</span>
        <el-badge :value="counts.all" />
      </el-menu-item>
      <el-menu-item index="today">
        <el-icon><Calendar /></el-icon>
        <span>今日</span>
        <el-badge :value="counts.today" type="warning" />
      </el-menu-item>
      <el-menu-item index="overdue">
        <el-icon><Clock /></el-icon>
        <span>过期</span>
        <el-badge :value="counts.overdue" type="danger" />
      </el-menu-item>
      <el-menu-item index="upcoming">
        <el-icon><Timer /></el-icon>
        <span>即将到期</span>
      </el-menu-item>
      <el-menu-item index="none">
        <el-icon><Remove /></el-icon>
        <span>无期限</span>
      </el-menu-item>
    </el-menu>
    
    <!-- 标签区域（P2） -->
    <el-divider>标签</el-divider>
    <el-menu>
      <el-menu-item v-for="tag in tags" :key="tag.id">
        <el-tag :color="tag.color" size="small" />
        <span>{{ tag.name }}</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>
```

### 2. UserMenu.vue（新增）

**职责**：用户头像下拉菜单，展示用户信息

**Props**：无，从 authStore 获取数据

**结构**：
```vue
<template>
  <el-dropdown trigger="hover" placement="bottom-end">
    <div class="user-trigger">
      <el-avatar :size="32" :src="userAvatar">
        {{ user?.username?.charAt(0).toUpperCase() }}
      </el-avatar>
      <span class="username">{{ user?.username }}</span>
      <el-icon><ArrowDown /></el-icon>
    </div>
    
    <template #dropdown>
      <el-dropdown-menu class="user-dropdown">
        <!-- 用户信息卡片 -->
        <el-dropdown-item :disabled="true" class="user-info-card">
          <el-descriptions :column="1" size="small">
            <el-descriptions-item label="用户名">
              {{ user?.username }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ user?.email }}
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">
              {{ formatDate(user?.createdAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-dropdown-item>
        
        <el-dropdown-item divided @click="goSettings">
          <el-icon><Setting /></el-icon>
          个人设置
        </el-dropdown-item>
        
        <el-dropdown-item @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
```

### 3. TaskCard.vue（新增）

**职责**：卡片式任务展示，包含描述信息

**Props**：
- `task: Task` - 任务数据对象

**Events**：
- `@edit(task)` - 编辑任务
- `@delete(task)` - 删除任务
- `@status-change(task, status)` - 状态变更

**结构**：
```vue
<template>
  <el-card class="task-card" :class="`priority-${task.priority}`">
    <!-- 标题行 -->
    <div class="task-header">
      <h3 class="task-title">{{ task.title }}</h3>
      <el-tag :type="statusType" size="small">
        {{ statusText }}
      </el-tag>
    </div>
    
    <!-- 描述（关键：展示描述） -->
    <p class="task-description">{{ task.description || '暂无描述' }}</p>
    
    <!-- 元信息 -->
    <div class="task-meta">
      <span class="due-date" :class="{ overdue: isOverdue }">
        <el-icon><Clock /></el-icon>
        {{ formatDueDate }}
      </span>
      <el-tag 
        v-if="task.priority === 'high'" 
        type="danger" 
        size="small"
        effect="dark"
      >
        高优先级
      </el-tag>
    </div>
    
    <!-- 操作按钮 -->
    <div class="task-actions">
      <el-button-group size="small">
        <el-button @click="$emit('edit', task)">编辑</el-button>
        <el-button type="danger" @click="$emit('delete', task)">删除</el-button>
      </el-button-group>
    </div>
  </el-card>
</template>
```

### 4. TaskList.vue（重构）

**职责**：任务列表容器，支持列表视图和看板视图

**Props**：
- `view: 'list' | 'kanban'` - 视图模式
- `tasks: Task[]` - 任务列表

**状态管理**：
```typescript
// views/taskView.ts
interface TaskViewState {
  mode: 'list' | 'kanban'
  filter: {
    view: 'all' | 'today' | 'overdue' | 'upcoming' | 'none'
    priority?: 'low' | 'medium' | 'high'
    status?: 'pending' | 'in_progress' | 'completed'
  }
  sortBy: 'dueDate' | 'priority' | 'createdAt'
}
```

## 样式设计系统

### 颜色主题
```css
:root {
  /* 品牌色 */
  --primary-color: #6366f1;        /* 现代紫色 */
  --primary-light: #818cf8;
  --primary-dark: #4f46e5;
  
  /* 优先级色 */
  --priority-high: #ef4444;
  --priority-medium: #f59e0b;
  --priority-low: #10b981;
  
  /* 状态色 */
  --status-pending: #6b7280;
  --status-progress: #3b82f6;
  --status-completed: #10b981;
  
  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* 阴影 */
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-hover: 0 4px 16px rgba(0, 0, 0, 0.12);
}
```

### 卡片样式
```css
.task-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.task-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.task-card.priority-high {
  border-left-color: var(--priority-high);
}

.task-card.priority-medium {
  border-left-color: var(--priority-medium);
}

.task-card.priority-low {
  border-left-color: var(--priority-low);
}
```

## API 集成

### 后端已有API（直接使用）

| 视图 | API调用 |
|------|---------|
| 今日任务 | `GET /api/tasks?dueDateFilter=today` |
| 过期任务 | `GET /api/tasks?dueDateFilter=overdue` |
| 即将到期 | `GET /api/tasks?dueDateFilter=upcoming` |
| 无期限 | `GET /api/tasks?dueDateFilter=none` |

### 新增API需求（P2阶段）

| 功能 | API |
|------|-----|
| 任务统计 | `GET /api/tasks/stats` |
| 标签CRUD | `GET/POST/PUT/DELETE /api/tags` |
| 任务标签关联 | `PUT /api/tasks/:id/tags` |

## 文件结构

```
frontend/src/
├── components/
│   ├── Layout/
│   │   ├── Layout.vue          # 重构：添加侧边栏
│   │   ├── Sidebar.vue         # 新增：侧边栏导航
│   │   └── UserMenu.vue        # 新增：用户下拉菜单
│   ├── Task/
│   │   ├── TaskList.vue        # 重构：列表容器
│   │   ├── TaskCard.vue        # 新增：任务卡片
│   │   ├── TaskDialog.vue      # 保留：任务编辑弹窗
│   │   └── KanbanBoard.vue     # 新增：看板视图（P2）
│   └── common/
│       └── ViewSwitcher.vue    # 新增：视图切换器
├── views/
│   └── Tasks/
│       └── Tasks.vue           # 重构：整合新组件
├── stores/
│   ├── auth.ts                 # 扩展：用户详情
│   └── task.ts                 # 扩展：筛选状态
├── styles/
│   ├── variables.css           # 新增：CSS变量
│   └── theme.css               # 新增：主题样式
└── composables/
    └── useTaskFilter.ts        # 新增：筛选逻辑复用
```

## 实施顺序

### Phase 1: P0核心修复
1. 创建 `UserMenu.vue` 组件
2. 修改 `Layout.vue` 集成用户菜单
3. 创建 `TaskCard.vue` 组件（展示描述）
4. 重构 `Tasks.vue` 使用卡片展示

### Phase 2: P1体验提升
5. 创建 `Sidebar.vue` 组件
6. 扩展 `task.ts` store 添加筛选状态
7. 实现快捷视图API调用
8. 添加视图切换功能

### Phase 3: P2功能增强
9. 创建 `KanbanBoard.vue` 看板视图
10. 添加拖拽功能
11. 实现标签系统（需后端配合）
12. 添加深色模式支持