# Tasks - Frontend UI Redesign

## Phase 1: P0 核心修复

- [x] **TASK-001**: 创建用户下拉菜单组件 `frontend/src/components/Layout/UserMenu.vue`
- [x] **TASK-002**: 集成用户菜单到Layout `frontend/src/components/Layout/Layout.vue`
- [x] **TASK-003**: 创建任务卡片组件 `frontend/src/components/Task/TaskCard.vue`
- [x] **TASK-004**: 创建CSS变量和主题样式 `frontend/src/styles/variables.css`, `theme.css`
- [x] **TASK-005**: 重构Tasks.vue使用卡片展示 `frontend/src/views/Tasks/Tasks.vue`

## Phase 2: P1 体验提升

- [x] **TASK-006**: 扩展任务Store筛选状态 `frontend/src/stores/task.ts`
- [x] **TASK-007**: 创建侧边栏组件 `frontend/src/components/Layout/Sidebar.vue`
- [x] **TASK-008**: 重构Layout添加侧边栏 `frontend/src/components/Layout/Layout.vue`
- [x] **TASK-009**: 实现快捷视图API调用（集成在Sidebar组件中）
- [x] **TASK-010**: 创建视图切换组件（集成在Tasks.vue中）
- [x] **TASK-011**: 整合视图切换到Tasks页面 `frontend/src/views/Tasks/Tasks.vue`

## Phase 3: P2 功能增强

- [x] **TASK-012**: 创建看板视图组件 `frontend/src/components/Task/KanbanBoard.vue`
- [x] **TASK-013**: 添加拖拽功能 `frontend/src/components/Task/KanbanBoard.vue`
- [x] **TASK-014**: 实现深色模式 `frontend/src/composables/useTheme.ts`
- [ ] **TASK-015**: 标签系统设计（需后端配合，后续迭代）

## 完成摘要

**已完成**: P0 (5/5) + P1 (6/6) + P2 (3/4) = 14 个任务
**待实现**: 标签系统 (需后端配合)

### 新增文件
- `frontend/src/styles/variables.css` - CSS设计系统变量
- `frontend/src/styles/theme.css` - 主题基础样式
- `frontend/src/components/Layout/UserMenu.vue` - 用户下拉菜单
- `frontend/src/components/Layout/Sidebar.vue` - 侧边栏导航
- `frontend/src/components/Task/TaskCard.vue` - 任务卡片组件
- `frontend/src/components/Task/KanbanBoard.vue` - 看板视图组件
- `frontend/src/composables/useTheme.ts` - 深色模式切换

### 修改文件
- `frontend/src/main.ts` - 导入主题样式
- `frontend/src/components/Layout/Layout.vue` - 集成侧边栏、用户菜单、主题切换
- `frontend/src/views/Tasks/Tasks.vue` - 卡片/看板视图、筛选功能、视图切换
- `frontend/src/stores/task.ts` - 任务计数、搜索、筛选状态
- `frontend/src/types/index.ts` - 添加search参数类型