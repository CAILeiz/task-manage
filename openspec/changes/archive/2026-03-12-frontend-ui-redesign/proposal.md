# Frontend UI Redesign

## Why

当前任务管理应用的前端UI过于简陋，缺乏商业产品的视觉品质和用户体验：
- 任务列表未展示描述字段，用户无法快速了解任务详情
- 用户区域仅显示用户名和退出按钮，缺乏专业的用户信息展示
- 缺少侧边栏导航、快捷视图等高效操作入口
- 整体视觉风格无法支撑付费产品的市场定位

此次重构将提升UI到商业级水准，为产品收费奠定基础。

## What Changes

### P0 - 核心修复
- **任务列表展示描述**：在任务卡片/行中显示任务描述内容
- **用户下拉菜单**：hover/click 用户头像显示详细信息（用户名、邮箱、注册时间）及操作入口

### P1 - 体验提升
- **侧边栏导航**：添加左侧导航栏，包含快捷视图入口（今日、过期、即将到期、无期限）
- **卡片式任务展示**：重新设计任务展示为卡片模式，提升视觉层次感
- **快捷视图**：利用后端已有API（dueDateFilter）实现今日/过期/即将到期视图

### P2 - 功能增强
- **看板视图**：拖拽式看板，按状态分组展示任务
- **标签系统**：任务分类标签（需后端配合）
- **主题切换**：深色/浅色模式切换

## Capabilities

### New Capabilities

- `task-display`: 任务展示优化（描述展示、卡片视图、看板视图）
- `user-profile-menu`: 用户下拉菜单（hover展示详细信息）
- `sidebar-navigation`: 侧边栏导航（快捷视图入口）
- `quick-filters`: 快捷筛选视图（今日、过期、即将到期、无期限）
- `theme-switching`: 主题切换（深色/浅色模式）

### Modified Capabilities

无现有规格修改。

## Impact

### 前端影响
- `frontend/src/views/Tasks/Tasks.vue` - 重构任务展示组件
- `frontend/src/components/Layout/Layout.vue` - 添加侧边栏和用户菜单
- `frontend/src/components/Task/` - 新增卡片组件、看板组件
- `frontend/src/stores/tasks.ts` - 增加筛选状态管理
- `frontend/src/router/index.ts` - 新增视图路由

### 后端影响
- 无破坏性变更
- 标签系统需后端新增支持（P2阶段）

### 依赖
- Element Plus 组件：el-dropdown, el-avatar, el-aside, el-card 等
- 可能需要：vue-draggable（看板拖拽）、dayjs（日期处理）