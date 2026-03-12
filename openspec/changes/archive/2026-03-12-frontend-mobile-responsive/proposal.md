## Why

当前任务管理应用前端仅针对桌面端设计，在移动设备上使用体验不佳：侧边栏占用过多空间、任务卡片布局拥挤、触摸交互不友好。随着移动办公需求增加，需要实现完整的移动端响应式适配，让用户可以在手机和平板上流畅使用。

## What Changes

- **响应式布局系统**: 添加移动端断点，实现自适应布局
- **侧边栏移动端适配**: 在移动端改为抽屉式(Drawer)导航
- **Header 移动端优化**: 简化移动端头部，添加汉堡菜单
- **任务列表移动端布局**: 单列卡片布局，优化触摸交互
- **移动端底部导航**: 添加快捷操作入口
- **触摸友好交互**: 增大点击区域，优化手势操作
- **移动端筛选器**: 改为抽屉式或底部弹出

## Capabilities

### New Capabilities

- `mobile-layout`: 移动端响应式布局系统，包含断点定义、自适应容器、移动端检测工具
- `mobile-navigation`: 移动端导航系统，包含抽屉式侧边栏、汉堡菜单、底部导航栏
- `mobile-task-view`: 移动端任务视图，包含单列卡片布局、触摸友好交互、移动端筛选器
- `touch-interactions`: 触摸交互优化，包含增大点击区域、滑动手势、触摸反馈

### Modified Capabilities

- `sidebar`: 侧边栏组件需要支持移动端抽屉模式
- `task-list`: 任务列表需要支持移动端单列布局和触摸优化

## Impact

**受影响的文件**:
- `frontend/src/components/Layout/Layout.vue` - 主布局响应式改造
- `frontend/src/components/Layout/Sidebar.vue` - 添加抽屉模式
- `frontend/src/views/Tasks/Tasks.vue` - 任务列表移动端布局
- `frontend/src/styles/variables.css` - 添加断点变量
- `frontend/src/composables/` - 新增 useBreakpoint.ts

**新增文件**:
- `frontend/src/composables/useBreakpoint.ts` - 断点检测工具
- `frontend/src/components/Layout/MobileNav.vue` - 移动端底部导航
- `frontend/src/components/Layout/HamburgerMenu.vue` - 汉堡菜单按钮

**依赖变更**: 无新增依赖，使用 Element Plus 现有 Drawer 组件